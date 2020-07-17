/** @typedef { import('./api/types').WamParameterType } WamParameterType */
/** @typedef { import('./api/types').WamParameterConfiguration } WamParameterConfiguration */

/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

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

export default class WamParameterInfo {
	/**
	 * @param {string} id
	 * @param {WamParameterConfiguration} [config]
	 */
	constructor(id, config = {}) {
		let {
			type, label, defaultValue, minValue, maxValue, discreteStep, exponent, choices, units,
		} = config;
		if (type === undefined) type = 'float';
		if (label === undefined) label = '';
		if (defaultValue === undefined) defaultValue = 0;
		if (choices === undefined) choices = [];
		if (type === 'boolean' || type === 'choice') {
			discreteStep = 1;
			minValue = 0;
			if (choices.length) maxValue = choices.length - 1;
			else maxValue = 1;
		} else {
			if (minValue === undefined) minValue = 0;
			if (maxValue === undefined) maxValue = 1;
			if (discreteStep === undefined) discreteStep = 0;
			if (exponent === undefined) exponent = 0;
			if (units === undefined) units = '';
		}

		const errBase = `Param config error | ${id}: `;
		if (minValue >= maxValue) throw Error(errBase.concat('minValue must be less than maxValue'));
		if (!inRange(defaultValue, minValue, maxValue)) throw Error(errBase.concat('defaultValue out of range'));
		if (discreteStep % 1 || discreteStep < 0) {
			throw Error(errBase.concat('discreteStep must be a non-negative integer'));
		} else if (discreteStep > 0 && (minValue % 1 || maxValue % 1 || defaultValue % 1)) {
			throw Error(errBase.concat('non-zero discreteStep requires integer minValue, maxValue, and defaultValue'));
		}
		if (type === 'choice' && !choices.length) {
			throw Error(errBase.concat('choice type parameter requires list of strings in choices'));
		}

		// We could make these truly readonly, but it doesn't play nicely with TS...
		/*
		Object.defineProperties(this, {
			id: { value: id, enumerable: true },
			label: { value: label, enumerable: true },
			type: { value: type, enumerable: true },
			defaultValue: { value: defaultValue, enumerable: true },
			minValue: { value: minValue, enumerable: true },
			maxValue: { value: maxValue, enumerable: true },
			discreteStep: { value: discreteStep, enumerable: true },
			exponent: { value: exponent, enumerable: true },
			choices: { value: choices, enumerable: true },
			units: { value: units, enumerable: true },
		});
		*/

		// ...these lines will satisfy TS, but will throw errors
		// in strict mode if we use defineProperties as shown above...
		/** @readonly @property {string} id */
		this.id = id;
		/** @readonly @property {string} label */
		this.label = label;
		/** @readonly @property {WamParameterType} type */
		this.type = type;
		/** @readonly @property {number} defaultValue */
		this.defaultValue = defaultValue;
		/** @readonly @property {number} minValue */
		this.minValue = minValue;
		/** @readonly @property {number} maxValue */
		this.maxValue = maxValue;
		/** @readonly @property {number} discreteStep */
		this.discreteStep = discreteStep;
		/** @readonly @property {number} exponent */
		this.exponent = exponent;
		/** @readonly @property {string[]} choices */
		this.choices = choices;
		/** @readonly @property {string} units */
		this.units = units;
	}

	/** @param {number} value convert a denormalized value to normalized range */
	normalize(value) {
		return normalize(value, this.minValue, this.maxValue, this.exponent);
	}

	/** @param {number} valueNorm convert a normalized value to denormalized range */
	denormalize(valueNorm) {
		return denormalize(valueNorm, this.minValue, this.maxValue, this.exponent);
	}

	/** @param {number} value get (denormalized) value as human-readable string */
	valueString(value) {
		if (this.choices) return this.choices[value];
		if (this.units !== '') return `${value} ${this.units}`;
		return `${value}`;
	}
}
