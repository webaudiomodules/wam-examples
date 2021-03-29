/** @typedef {import('./api/types').WamParameter} WamParameter */
/** @typedef {import('./api/types').WamParameterInfo} WamParameterInfo */

/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-classes-per-file */

/** @implements {WamParameter} */
class WamParameterNoSab {
	/** @param {WamParameterInfo} info */
	constructor(info) {
		/** @readonly @property {WamParameter} info */
		this.info = info;
		/** @private @property {number} _value */
		this._value = info.defaultValue;
	}

	/**
	 * Set current (denormalized) value
	 * @param {number} value
	*/
	set value(value) {
		this._value = value;
	}

	/**
	 * Get current (denormalized) value
	 * @returns {number}
	 */
	get value() {
		return this._value;
	}

	/**
	 * Set current value in normalized range
	 * @param {number} valueNorm
	 */
	set normalizedValue(valueNorm) {
		this.value = this.info.denormalize(valueNorm);
	}

	/**
	 * Get current value in normalized range
	 * @returns {number}
	 */
	get normalizedValue() {
		return this.info.normalize(this.value);
	}
}

/** @extends {WamParameterNoSab} */
class WamParameterSab extends WamParameterNoSab {
	/**
	 * @param {WamParameterInfo} info
	 * @param {Float32Array} array
	 * @param {number} index
	 */
	constructor(info, array, index) {
		super(info);
		/** @readonly @property {Float32Array} data */
		this._array = array;
		/** @readonly @property {number} index */
		this._index = index;
	}

	/**
	 * Set current (denormalized) value
	 * NOTE: expectation is for only one thread to write to this value
	 * TODO check thread safety
	 * @param {number} value
	*/
	set value(value) {
		this._array[this._index] = value;
	}

	/**
	 * Get current (denormalized) value
	 * @returns {number}
	 */
	get value() {
		return this._array[this._index];
	}
}

export { WamParameterNoSab, WamParameterSab };

if (globalThis.AudioWorkletGlobalScope) {
	globalThis.WamParameterNoSab = WamParameterNoSab;
	globalThis.WamParameterSab = WamParameterSab;
}
