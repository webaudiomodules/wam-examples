/* eslint-disable object-curly-newline */
/* eslint-disable prefer-destructuring */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
/* eslint-disable max-classes-per-file */

/** @typedef { import('../../sdk/src/api/types').AudioWorkletGlobalScope } AudioWorkletGlobalScope */
/** @typedef { import('../../sdk/src/api/types').AudioWorkletProcessor } AudioWorkletProcessor */
/** @typedef { import('../../sdk/src/api/types').WamNodeOptions } WamNodeOptions */
/** @typedef { import('../../sdk/src/api/types').WamParameter } WamParameter */
/** @typedef { import('../../sdk/src/api/types').WamParameterInfo } WamParameterInfo */
/** @typedef { import('../../sdk/src/api/types').WamParameterInfoMap } WamParameterInfoMap */
/** @typedef { import('../../sdk/src/api/types').WamParameterData } WamParameterData */
/** @typedef { import('../../sdk/src/api/types').WamParameterDataMap } WamParameterDataMap */
/** @typedef { import('../../sdk/src/api/types').WamParameterMap } WamParameterMap */
/** @typedef { import('../../sdk/src/api/types').WamEvent } WamEvent */
/** @typedef { import('../../sdk/src/api/types').WamMidiData } WamMidiData */
/** @typedef { import('./WamExampleSynth').WamExampleSynth } WamExampleSynth */

/**
 * A WamEvent and corresponding message id used to trigger callbacks
 * on the main thread once the event has been processed.
 * @typedef {Object} PendingWamEvent
 * @property {number} id
 * @property {WamEvent} event
*/

/**
 * A range of sample indices and corresponding list of simultaneous
 * WamEvents to be processed at the beginning of the slice.
 * @typedef {Object} ProcessingSlice
 * @property {[number, number]} range
 * @property {WamEvent[]} events
 */

/**
 * @typedef {Object} WamParameterInterpolatorMap
 * @property {string} id
 * @property {WamParameterInterpolator} interpolator
 */

/** @type {AudioWorkletGlobalScope & globalThis} */
// @ts-ignore
const {
	// @ts-ignore
	WamProcessor,
	// @ts-ignore
	WamParameterInfo,
	// @ts-ignore
	WamExampleSynth,
	registerProcessor,
} = globalThis;
const supportSharedArrayBuffer = !!globalThis.SharedArrayBuffer;

/**
 * `WamExample`'s `AudioWorkletProcessor`
 *
 * @extends {WamProcessor}
 */
class WamExampleProcessor extends WamProcessor {
	/**
	 * Fetch plugin's params.
	 * @returns {WamParameterInfoMap}
	 */
	static generateWamParameterInfo() {
		return {
			bypass: new WamParameterInfo('bypass', {
				type: 'boolean',
				label: 'Bypass',
				defaultValue: 1,
			}),
			gain: new WamParameterInfo('gain', {
				type: 'float',
				label: 'Gain',
				defaultValue: 1.0,
				minValue: 0.0,
				maxValue: 2.0,
				exponent: 0.5,
			}),
		};
	}

	/**
	 * @param {AudioWorkletNodeOptions} options
	 */
	constructor(options) {
		super(options);
		this.destroyed = false;
		this.supportSharedArrayBuffer = supportSharedArrayBuffer;
		const {
			moduleId,
			instanceId,
		} = options.processorOptions;
		this.moduleId = moduleId;
		this.instanceId = instanceId;

		if (!this._parameterInterpolators) {
			/** @property {WamParameterInterpolatorMap} _parameterInterpolators */
			this._parameterInterpolators = {};
		}

		this._generator = new WamExampleSynth(16, this._samplesPerQuantum, globalThis.sampleRate);

		if (globalThis.WamProcessors) globalThis.WamProcessors[instanceId] = this;
		else globalThis.WamProcessors = { [instanceId]: this };

		this._synthLevels = new Float32Array(2);
		this._effectLevels = new Float32Array(2);
		this._levelSmoothA = 0.95;
		this._levelSmoothB = 1.0 - this._levelSmoothA;
		const levelUpdateRateSec = 0.1;
		this._levelUpdateRateFrames = Math.round(levelUpdateRateSec * (globalThis.sampleRate / this._samplesPerQuantum));

		super.port.start();
	}

	/**
	 *
	 * @param {WamMidiData} midiData
	 */
	_onMidi(midiData) {
		/* eslint-disable no-lone-blocks */
		const bytes = midiData.bytes;
		const type = bytes[0] & 0xf0;
		const channel = bytes[0] & 0x0f;
		const data1 = bytes[1];
		const data2 = bytes[2];
		switch (type) {
		case 0x80: { /* note off */
			this._generator.noteOff(channel, data1, data2);
		} break;
		case 0x90: { /* note on */
			this._generator.noteOn(channel, data1, data2);
		} break;
		case 0xa0: { /* aftertouch */ } break;
		case 0xb0: { /* continuous controller */ } break;
		case 0xc0: { /* patch change */ } break;
		case 0xd0: { /* channel pressure */ } break;
		case 0xe0: { /* pitch bend */ } break;
		case 0xf0: { /* system */ } break;
		default: { /* invalid */ } break;
		}
	}

	/**
	 * Implement custom DSP here.
	 * @param {number} startSample beginning of processing slice
	 * @param {number} endSample end of processing slice
	 * @param {Float32Array[][]} inputs
	 * @param {Float32Array[][]} outputs
	 */
	_process(startSample, endSample, inputs, outputs) {
		const input = inputs[0];
		const output = outputs[0];
		if (input.length !== output.length) return;

		const bypass = !!this._parameterInterpolators.bypass.values[startSample];
		const wasBypassed = this._parameterInterpolators.bypass.values[0]; // good enough most of the time
		const updateLevels = bypass !== wasBypassed || this._levelUpdateRateFrames % globalThis.currentFrame;

		if (!bypass) this._generator.process(startSample, endSample, input, output);
		const gain = this._parameterInterpolators.gain.values;
		for (let c = 0; c < output.length; ++c) {
			const x = input[c];
			const y = output[c];
			if (bypass) {
				for (let n = startSample; n < endSample; ++n) {
					y[n] = x[n];
				}
				this._synthLevels[c] = 0.0;
				this._effectLevels[c] = 0.0;
			} else {
				let synthLevel = 0.0;
				let effectLevel = 0.0;
				if (updateLevels) {
					for (let n = startSample; n < endSample; ++n) {
						synthLevel += Math.abs(y[n] * gain[n]);
					}
				}

				for (let n = startSample; n < endSample; ++n) {
					y[n] = (x[n] + y[n]) * gain[n];
				}

				if (updateLevels) {
					for (let n = startSample; n < endSample; ++n) {
						effectLevel += Math.abs(y[n]);
					}
					this._synthLevels[c] *= this._levelSmoothA;
					this._synthLevels[c] += this._levelSmoothB * (synthLevel / this._samplesPerQuantum);
					if (Number.isNaN(this._synthLevels[c])) this._synthLevels[c] = 0.0;
					else this._synthLevels[c] = Math.min(Math.max(this._synthLevels[c], 0.0), 1.0);

					this._effectLevels[c] *= this._levelSmoothA;
					this._effectLevels[c] += this._levelSmoothB * (effectLevel / this._samplesPerQuantum);
					if (Number.isNaN(this._effectLevels[c])) this._effectLevels[c] = 0.0;
					else this._effectLevels[c] = Math.min(Math.max(this._effectLevels[c], 0.0), 1.0);
				}
			}
		}
		if (updateLevels) {
			super.port.postMessage({ id: -1, levels: { synth: this._synthLevels, effect: this._effectLevels } });
		}
	}

	destroy() {
		this.destroyed = true;
		super.port.close();
	}
}
try {
	registerProcessor('WebAudioModuleWamExample', WamExampleProcessor);
} catch (error) {
	console.warn(error);
}
