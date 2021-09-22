// OBXD WAM Processor
// Jari Kleimola 2017-2020 (jari@webaudiomodules.org)

/** @typedef {import('./types').AudioWorkletGlobalScope} AudioWorkletGlobalScope */

/** @type {AudioWorkletGlobalScope} */
const audioWorkletGlobalScope = globalThis;
const { WasmProcessor } = audioWorkletGlobalScope;

class OBXDProcessor extends WasmProcessor {
	constructor (options) {
		options.module = audioWorkletGlobalScope.WAM.OBXD;
		super(options);
		this.numOutChannels = [2];
		this.parameterValues = options.processorOptions.parameterValues;
	}
	_setParameterValue(parameterUpdate, interpolate) {
		const { id, value } = parameterUpdate;
		super._setParameterValue({ id: +id + 1, value }, interpolate);
		this.parameterValues[id] = value;
	}
	/**
	 * @param {boolean} normalized
	 * @param {string[]} parameterIds
	 */
	_getParameterValues(normalized, parameterIds) {
		if (!parameterIds || !parameterIds.length) parameterIds = Object.keys(this.parameterValues);
		return parameterIds.reduce((acc, cur) => {
			acc[cur] = { id: cur, value: this.parameterValues[cur], normalized };
			return acc;
		}, {})
	}
}

registerProcessor("Jari Kleimola 2017-2020 (jari@webaudiomodules.org)OBXD", OBXDProcessor);
