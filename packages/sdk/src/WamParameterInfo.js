/** @typedef {import('./api/types').WamParameterInfo} IWamParameterInfo */
/** @typedef {import('./api/types').WamParameterType} WamParameterType */
/** @typedef {import('./api/types').WamParameterConfiguration} WamParameterConfiguration */

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

/**
 * @implements {IWamParameterInfo}
 */
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

		/**
		 * The parameter's unique identifier.
		 * @readonly @property {string} id
		 */
		this.id = id;

		/**
		 * The parameter's human-readable name.
		 * @readonly @property {string} label
		 */
		this.label = label;

		/**
		 * The parameter's data type.
		 * @readonly @property {WamParameterType} type
		 */
		this.type = type;

		/**
		 * The parameter's default value. Must be
		 * within range `[minValue, maxValue]`.
		 * @readonly @property {number} defaultValue
		 */
		this.defaultValue = defaultValue;

		/**
		 * The minimum valid value of the parameter's range.
		 * @readonly @property {number} minValue
		 */
		this.minValue = minValue;

		/**
		 * The maximum valid value of the parameter's range.
		 * @readonly @property {number} maxValue
		 */
		this.maxValue = maxValue;

		/**
		 * The distance between adjacent valid integer
		 * values, if applicable.
		 * @readonly @property {number} discreteStep
		 */
		this.discreteStep = discreteStep;

		/**
		 * The nonlinear (exponential) skew of the parameter's
		 * range, if applicable.
		 *  @readonly @property {number} exponent
		 */
		this.exponent = exponent;

		/**
		 * A list of human-readable choices corresponding to each
		 * valid integer value in the parameter's range, if applicable.
		 * @readonly @property {string[]} choices
		 */
		this.choices = choices;

		/**
		 * A human-readable string representing the units of the
		 * parameter's range, if applicable.
		 * @readonly @property {string} units
		 */
		this.units = units;
	}

	/**
	 * Convert a value from the parameter's denormalized range
	 * `[minValue, maxValue]` to normalized range `[0, 1]`.
	 * @param {number} value
	 */
	normalize(value) {
		return normalize(value, this.minValue, this.maxValue, this.exponent);
	}

	/**
	 * Convert a value from normalized range `[0, 1]` to the
	 * parameter's denormalized range `[minValue, maxValue]`.
	 * @param {number} valueNorm
	 */
	denormalize(valueNorm) {
		return denormalize(valueNorm, this.minValue, this.maxValue, this.exponent);
	}

	/**
	 * Get a human-readable string representing the given value,
	 * including units if applicable.
	 * @param {number} value
	 */
	valueString(value) {
		if (this.choices) return this.choices[value];
		if (this.units !== '') return `${value} ${this.units}`;
		return `${value}`;
	}
}

if (globalThis.AudioWorkletGlobalScope) {
	globalThis.WamParameterInfo = WamParameterInfo;
}
