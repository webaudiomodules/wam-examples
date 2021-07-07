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
/** @typedef { import('./WamExampleTemplateEffect').WamExampleTemplateEffect } WamExampleTemplateEffect */
/** @typedef { import('./WamExampleTemplateSynth').WamExampleTemplateSynth } WamExampleTemplateSynth */

/** @type {AudioWorkletGlobalScope & globalThis} */
// @ts-ignore
const {
	// @ts-ignore
	WamProcessor,
	// @ts-ignore
	WamParameterInfo,
	// @ts-ignore
	WamExampleTemplateSynth,
	// @ts-ignore
	WamExampleTemplateEffect,
	registerProcessor,
} = globalThis;

/**
 * `WamExampleTemplate`'s `AudioWorkletProcessor`
 *
 * @extends {WamProcessor}
 */
class WamExampleTemplateProcessor extends WamProcessor {
	/**
	 * Fetch plugin's params.
	 * @returns {WamParameterInfoMap}
	 */
	static generateWamParameterInfo() {
		return {
			// your plugin parameters here
			bypass: new WamParameterInfo('bypass', {
				type: 'boolean',
				label: 'Bypass',
				defaultValue: 0,
			}),
			...WamExampleTemplateSynth.generateWamParameterInfo(),
			...WamExampleTemplateEffect.generateWamParameterInfo(),
		};
	}

	/**
	 * @param {AudioWorkletNodeOptions} options
	 */
	constructor(options) {
		super(options);
		// your plugin initialization code here
		const synthConfig = {
			passInput: true,
		};
		/** @private @type {WamExampleTemplateSynth} */
		this._synth = new WamExampleTemplateSynth(this._parameterInterpolators, this._samplesPerQuantum, globalThis.sampleRate,
			synthConfig);

		const effectConfig = {
			numChannels: 2,
			inPlace: true,
		};
		/** @private @type {WamExampleTemplateEffect} */
		this._effect = new WamExampleTemplateEffect(this._parameterInterpolators, this._samplesPerQuantum, globalThis.sampleRate,
			effectConfig);
		super.port.start();
	}

	/**
	 *
	 * @param {WamMidiData} midiData
	 */
	_onMidi(midiData) {
		/* eslint-disable no-lone-blocks */
		const bytes = midiData.bytes;
		let type = bytes[0] & 0xf0;
		const channel = bytes[0] & 0x0f;
		const data1 = bytes[1];
		const data2 = bytes[2];
		if (type === 0x90 && data2 === 0) type = 0x80;

		// handle midi as needed here
		switch (type) {
		case 0x80: { /* note off */
			this._synth.noteOff(channel, data1, data2);
		} break;
		case 0x90: { /* note on */
			this._synth.noteOn(channel, data1, data2);
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

		if (bypass) {
			for (let c = 0; c < output.length; ++c) {
				const x = input[c];
				const y = output[c];
				// pass input directly to output
				let n = startSample;
				while (n < endSample) {
					y[n] = x[n];
					n++;
				}
			}
		} else {
			this._synth.process(startSample, endSample, input, output);
			this._effect.process(startSample, endSample, input, output);
		}
	}
}
try {
	registerProcessor('WebAudioModuleWamExampleTemplate', WamExampleTemplateProcessor);
} catch (error) {
	console.warn(error);
}
