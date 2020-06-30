/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

// const SharedArrayBuffer = globalThis.SharedArrayBuffer || globalThis.ArrayBuffer;

/**
 * @param {number} x
 * @param {number} e
 */
const normExp = (x, e) => (e === 0 ? x : x ** (1.5 ** -e));

/**
 * @param {number} x
 * @param {number} e
 */
const denormExp = (x, e) => (e === 0 ? x : x ** (1.5 ** e));

/**
 * @param {number} x
 * @param {number} min
 * @param {number} max
 */
const normalize = (x, min, max, e = 0) => (
	min === 0 && max === 1
		? normExp(x, e)
		: normExp((x - min) / (max - min) || 0, e));

/**
 * @param {any} x
 * @param {number} min
 * @param {number} max
 */
const denormalize = (x, min, max, e = 0) => (
	min === 0 && max === 1
		? denormExp(x, e)
		: denormExp(x, e) * (max - min) + min
);

/**
 * @param {number} x
 * @param {number} min
 * @param {number} max
 */
const inRange = (x, min, max) => (x >= min && x <= max);

export default class WamParameter {
	/** @type {string} */
	_id = '';

	/** @typedef {'float' | 'int' | 'boolean' | 'choice'} WamParameterType */

	/** @type WamParameterType */
	_type = 'float'

	/** @type number */
	_defaultValue = 0;

	/** @type number */
	_minValue = 0;

	/** @type number */
	_maxValue = 1;

	/** @type number */
	_discreteStep = 0;

	/** @type number */
	_exponent = 0;

	/** @type string[] */
	_choices = [];

	/** @type string */
	_units = '';

	/**
	 * @typedef {Object} WamParameterConfiguration
	 * @property {WamParameterType} [type]
	 * @property {number} [defaultValue]
	 * @property {number} [minValue]
	 * @property {number} [maxValue]
	 * @property {number} [discreteStep]
	 * @property {number} [exponent]
	 * @property {string[]} [choices]
	 * @property {string} [units]
	 */

	/**
	 * @param {string} id
	 * @param {WamParameterConfiguration} [config]
	 */
	constructor(id, config = {}) {
		// does this class need to represent the current state or is it here to describe the param?
		// I think one could argue that this class is really just meant for describing the meta
		// data of a parameter, and wouldn't necessarily be the class used in any DSP code etc.
		// The host can set param values via 'onAutomation', but may need to be able to get the
		// current value (in case it wants to provide an alternate GUI, for example like in Ableton's
		// device chain). I think this is a question to explore as a group.
		// If it is managing state, here are a couple ideas
		// 1) sync state via SAB:
		// 	this._state = new SharedArrayBuffer(Float64Array.BYTES_PER_ELEMENT + 1); // value and lock
		// 	this._value = new Float64Array(this._data, 0, 1);
		// 	this._lock = new Uint8Array(this._data, Float64Array.BYTES_PER_ELEMENT, 1);
		//  ...
		// 2) provide handler functions
		// 	this._audioThreadGetter = () => audioThreadGetter(this._id);
		// 	this._audioThreadSetter = (value) => audioThreadSetter(this._id, value);
		// 	this._mainThreadGetter = () => mainThreadGetter(this._id);
		// 	this._mainThreadSetter = (value) => mainThreadSetter(this._id, value);
		//  ...
		// 	initialize() {
		// 		if (AudioWorkletGlobalScope) {
		// 			this._setter = this._audioThreadSetter;
		// 			this._getter = this._audioThreadGetter;
		// 		}
		// 		else {
		// 			this._setter = this._mainThreadSetter;
		// 			this._getter = this._mainThreadGetter;
		// 		}
		// 	}
		//  ...
		// 3) some combination of both?
		// 	...
		// callbacks seem less prescriptive

		// subclassing based on type would allow for more straightforward validation of
		// parameter specifications, but may complicate the process of generating parameters
		// leaving it in a single class for now, the checks below are not comprehensive and
		// should maybe just be removed, placing burden on devs to make sure the specs are valid

		this._id = id;
		const {
			type, defaultValue, minValue, maxValue, discreteStep, exponent, choices, units,
		} = config;
		if (type) this._type = type;
		if (defaultValue) this._defaultValue = defaultValue;
		if (this._type === 'boolean' || this._type === 'choice') {
			this._discreteStep = 1;
			this._minValue = 0;
			if (choices.length) this._maxValue = choices.length - 1;
			else this._maxValue = 1;
		} else {
			if (minValue) this._minValue = minValue;
			if (maxValue) this._maxValue = maxValue;
			if (discreteStep) this._discreteStep = discreteStep;
			if (exponent) this._exponent = exponent;
			if (units) this._units = units;
		}

		const errBase = `Param config error | ${this._id}: `;
		if (this._minValue >= this._maxValue) throw Error(errBase.concat('minValue must be less than maxValue'));
		if (!inRange(this._defaultValue, this._minValue, this._maxValue)) throw Error(errBase.concat('defaultValue out of range'));
		if (this._discreteStep % 1 || this._discreteStep < 0) {
			throw Error(errBase.concat('discreteStep must be a non-negative integer'));
		} else if (this._discreteStep > 0
			&& (this._minValue % 1 || this._maxValue % 1 || this._defaultValue % 1)) {
			throw Error(errBase.concat('non-zero discreteStep requires integer minValue, maxValue, and defaultValue'));
		}
		if (this._type === 'choice' && !choices.length) {
			throw Error(errBase.concat('choice type parameter requires list of strings in choices'));
		}
		this.value = defaultValue;
	}

	get id() { return this._id; }

	get type() { return this._type; }

	get defaultValue() { return this._defaultValue; }

	get minValue() { return this._minValue; }

	get maxValue() { return this._maxValue; }

	get discreteStep() { return this._discreteStep; }

	get exponent() { return this._exponent; }

	get choices() { return this._choices; }

	get units() { return this._units; }

	/** @param {number} value set current (denormalized) value */
	set value(value) {
		// SAB approach:
		// if (!Atomics.load(this._lock, 0)) {
		// 	this._value[0] = value;
		// }
		// ...
		// callback approach:
		// this._setter(value);
		this._value = value;
	}

	/** @returns {number} get current (denormalized) value */
	get value() {
		// SAB approach:
		// return this._value[0];
		// ...
		// callback approach:
		// this._getter();
		return this._value;
	}

	/** @param {number} valueNorm set current value in normalized range */
	set normalizedValue(valueNorm) {
		this.value = this.denormalize(valueNorm);
	}

	/** @returns {number} get current value in normalized range */
	get normalizedValue() {
		return this.normalize(this._value);
	}

	/** @param {number} value convert a denormalized value to normalized range */
	normalize(value) {
		return normalize(value, this._minValue, this._maxValue, this._exponent);
	}

	/** @param {number} valueNorm convert a normalized value to denormalized range */
	denormalize(valueNorm) {
		return denormalize(valueNorm, this._minValue, this._maxValue, this._exponent);
	}

	/** @param {number} value get (denormalized) value as human-readable string */
	valueString(value) {
		if (this._choices) return this._choices[value];
		if (this._units !== '') return `${value} ${this._units}`;
		return `${value}`;
	}
}
