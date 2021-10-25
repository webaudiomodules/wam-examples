/* eslint-disable max-len */
/* eslint-disable no-undef */
/** @typedef {import('../api').AudioWorkletProcessor} AudioWorkletProcessor */
/** @typedef {import('../api').AudioWorkletGlobalScope} AudioWorkletGlobalScope */
/** @template T @typedef {import('../sdk-parammgr/src/TypedAudioWorklet').TypedAudioParamDescriptor} TypedAudioParamDescriptor */

/** @typedef {'pause' | 'length' | 'pitchMin' | 'pitchMax' | 'velocityMin' | 'velocityMax' | 'destroyed'} P */

//@ts-check

/** @type {AudioWorkletGlobalScope} */
// @ts-ignore
const audioWorkletGlobalScope = globalThis;
const { AudioWorkletProcessor, registerProcessor } = audioWorkletGlobalScope;

class RandomNoteProcessor extends AudioWorkletProcessor {
	/**
	 * @returns {TypedAudioParamDescriptor<P>[]}
	 */
	static get parameterDescriptors() {
		return [{
			name: 'pause',
			defaultValue: 1,
			minValue: 0.01,
			maxValue: 60,
		}, {
			name: 'length',
			defaultValue: 1,
			minValue: 0.01,
			maxValue: 60,
		}, {
			name: 'pitchMin',
			defaultValue: 36,
			minValue: 0,
			maxValue: 127,
		}, {
			name: 'pitchMax',
			defaultValue: 96,
			minValue: 0,
			maxValue: 127,
		}, {
			name: 'velocityMin',
			defaultValue: 36,
			minValue: 0,
			maxValue: 127,
		}, {
			name: 'velocityMax',
			defaultValue: 96,
			minValue: 0,
			maxValue: 127,
		}, {
			name: 'destroyed',
			defaultValue: 0,
			minValue: 0,
			maxValue: 1,
		}];
	}

	constructor(options) {
		super(options);
		this.proxyId = options.processorOptions.proxyId;
		this.lastTime = null;
		this.lastPitch = null;
	}

	get proxy() {
		const { webAudioModules } = audioWorkletGlobalScope;
		return webAudioModules?.processors[this.proxyId];
	}

	/**
	 * Main process
	 *
	 * @param {Float32Array[][]} inputs
	 * @param {Float32Array[][]} outputs
	 * @param {Record<P, Float32Array>} parameters
	 */
	process(inputs, outputs, parameters) {
		const destroyed = parameters.destroyed[0];
		if (destroyed) return false;
		if (!this.proxy) return true;
		const { currentTime } = audioWorkletGlobalScope;
		const pitchMin = parameters.pitchMin[0];
		const pitchMax = Math.max(pitchMin, parameters.pitchMax[0]);
		const velocityMin = parameters.velocityMin[0];
		const velocityMax = Math.max(velocityMin, parameters.velocityMax[0]);
		const pause = parameters.pause[0];
		const length = parameters.length[0];
		if (this.lastPitch === null && (!this.lastTime || currentTime - this.lastTime >= pause)) {
			const pitch = Math.round(Math.random() * (pitchMax - pitchMin) + pitchMin);
			const velocity = Math.round(Math.random() * (velocityMax - velocityMin) + velocityMin);
			this.lastPitch = pitch;
			if (this.lastTime) this.lastTime += pause;
			else this.lastTime = currentTime;
			this.proxy.emitEvents({ type: 'wam-midi', time: currentTime, data: { bytes: [0b10010000, pitch, velocity] } });
		} else if (this.lastPitch && currentTime - this.lastTime >= length) {
			this.proxy.emitEvents({ type: 'wam-midi', time: currentTime, data: { bytes: [0b10010000, this.lastPitch, 0] } });
			this.lastPitch = null;
			this.lastTime += length;
		}
		return true;
	}
}

try {
	registerProcessor('__WebAudioModule_RandomNoteProcessor', RandomNoteProcessor);
} catch (error) {
	// eslint-disable-next-line no-console
	console.warn(error);
}
