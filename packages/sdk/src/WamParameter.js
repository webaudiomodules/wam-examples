/** @typedef { import('./api/types').WamParameter } WamParameter */
/** @typedef { import('./api/types').WamParameterInfo } WamParameterInfo */

/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-classes-per-file */

/** @implements {WamParameter} */
class WamParameterNoSab {
	/** @param {WamParameterInfo} info */
	constructor(info) {
		/** @readonly @property {WamParameter} info */
		this.info = info;
		this.value = info.defaultValue;
	}

	/** @param {number} valueNorm set current value in normalized range */
	set normalizedValue(valueNorm) {
		this.value = this.info.denormalize(valueNorm);
	}

	/** @returns {number} get current value in normalized range */
	get normalizedValue() {
		return this.info.normalize(this.value);
	}
}

/** @extends {WamParameterNoSab} */
class WamParameterSab extends WamParameterNoSab {
	/**
	 * @param {Float32Array} array
	 * @param {number} index
	 * @param {WamParameterInfo} info
	 */
	constructor(array, index, info) {
		super(info);
		/** @readonly @property {Float32Array} data */
		this._array = array;
		/** @readonly @property {number} index */
		this._index = index;
	}

	/** @param {number} value set current (denormalized) value
	 * NOTE: expectation is for only one thread to write to this value
	 * TODO check thread safety
	*/
	set value(value) {
		this._array[this._index] = value;
	}

	/** @returns {number} get current (denormalized) value */
	get value() {
		return this._array[this._index];
	}
}

export { WamParameterNoSab, WamParameterSab };
