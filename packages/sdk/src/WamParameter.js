/** @typedef { import('./api/WamTypes').WamParameterInfo } WamParameterInfo */

/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

export default class WamParameter {
	/** @param {WamParameterInfo} info */
	constructor(info) {
		/** @readonly @property {string} id */
		this.id = info.id;
		/** @readonly @property {WamParameter} info */
		this.info = info;
		const byteLength = Float32Array.BYTES_PER_ELEMENT;
		// TODO TS seems to be assuming 'ArrayBuffer' here...
		/** @private @property {SharedArrayBuffer | ArrayBuffer} _data */
		this._data = globalThis.SharedArrayBuffer
			? new SharedArrayBuffer(byteLength) : new ArrayBuffer(byteLength);
		/** @private @property {Float32Array} _value */
		this._value = new Float32Array(this._data, 0, 1);
		this.value = info.defaultValue;
	}

	/** @param {number} value set current (denormalized) value
	 * NOTE: expectation is for only one thread to write to this value
	 * TODO check thread safety
	*/
	set value(value) {
		this._value[0] = value;
	}

	/** @returns {number} get current (denormalized) value */
	get value() {
		return this._value[0];
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
