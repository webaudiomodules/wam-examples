/** @typedef {import('./api/types').WamParameterInfo} WamParameterInfo */

/* eslint-disable no-undef */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */

const samplesPerQuantum = 128;
const nullTableKey = '0_0';

/**
 * Provides per-sample value updates for WamParameters
 * with interpolation when applicable. Only one instance
 * should be created per WamParameter.
 * TODO write equivalent C++ code for WASM implementations?
 */
export default class WamParameterInterpolator {
	/**
	 * Lookup tables to avoid recomputing interpolation curves. Keyed
	 * by `'<samplesPerInterpolation>_<skew>'`. Not used for
	 * discrete parameters.
	 * @private @static @type {Record<string, Float32Array>}
	 */
	static _tables;

	/**
	 * List of parameter ids currently using the lookup table associated
	 * with the key. Keyed by `'<samplesPerInterpolation>_<skew>'`.
	 * For purging unused lookup tables. Not used for discrete parameters.
	 * @private @static @type {Record<string, string[]>}
	 */
	static _tableReferences;

	/**
	 * @param {WamParameterInfo} info
	 * @param {number} samplesPerInterpolation
	 * @param {number=} skew
	 */
	constructor(info, samplesPerInterpolation, skew = 0) {
		if (!WamParameterInterpolator._tables) {
			WamParameterInterpolator._tables = { nullTableKey: new Float32Array(0) };
			WamParameterInterpolator._tableReferences = { nullTableKey: [] };
		}

		/**
		 * Info object for corresponding WamParameter.
		 * @readonly @type {WamParameterInfo}
		 */
		this.info = info;

		/**
		 * Buffer storing per-sample values.
		 * @readonly @type {Float32Array}
		 */
		this.values = new Float32Array(samplesPerQuantum);

		/**
		 * Composed by concatenating `'<samplesPerInterpolation>_<skew>'`.
		 * @private @type {string}
		 */
		this._tableKey = nullTableKey;

		/**
		 * The (static) lookup table used to avoid recomputing ramps.
		 * @private @type {Float32Array}
		 */
		this._table = WamParameterInterpolator._tables[this._tableKey];

		/**
		 * Determines if interpolation will be linear / nonlinear.
		 * Note that this is distinct from the corresponding
		 * parameter's `exponent` value.
		 * @private @type {number}
		 */
		this._skew = 2; // intentionally initialized out of range, see setSkew

		const { discreteStep } = info;

		/**
		 * Whether or not to perform interpolation
		 * (false for integer parameters, true otherwise).
		 * @readonly @private @type {boolean}
		 */
		this._discrete = !!discreteStep;

		/**
		 * The interpolation period in samples.
		 * @readonly @private @type {number}
		 */
		this._N = this._discrete ? 0 : samplesPerInterpolation;

		/**
		 * The current interpolation index.
		 * @private @type {number}
		 */
		this._n = 0;

		/**
		 * The parameter value when interpolation starts.
		 * @private @type {number}
		*/
		this._startValue = info.defaultValue;

		/**
		 * The parameter value when interpolation ends.
		 * @private @type {number}
		 */
		this._endValue = info.defaultValue;

		/**
		 * The most recently computed parameter value.
		 * @private @type {number}
		 */
		this._currentValue = info.defaultValue;

		/**
		 * The difference between `startValue` and `endValue`.
		 * @private @type {number}
		 */
		this._deltaValue = 0;

		/**
		 * Allows consistent output with respect to skew setting
		 * whether increasing or decreasing during interpolation.
		 * @private @type {boolean}
		 */
		this._inverted = false;

		/**
		 * Whether the most recently requested interpolation has completed.
		 * @private @type {boolean}
		 */
		this._changed = true;

		/**
		 * How many samples have been uniformly filled following
		 * completion of most recently requested interpolation.
		 * @private @type {number}
		 */
		this._filled = 0;

		if (!this._discrete) this.setSkew(skew);
		else this._skew = 0;
		this.setStartValue(this._startValue);
	}

	/**
	 * Utility for managing lifecycles of lookup tables.
	 * @private
	 * @param {string} oldKey
	 */
	_removeTableReference(oldKey) {
		if (oldKey === nullTableKey) return;
		const { id } = this.info;
		/** @type {string[] | undefined} */
		const references = WamParameterInterpolator._tableReferences[oldKey];
		if (references) {
			const index = references.indexOf(id);
			if (index !== -1) references.splice(index, 1);
			// clean up?
			if (references.length === 0) {
				delete WamParameterInterpolator._tables[oldKey];
				delete WamParameterInterpolator._tableReferences[oldKey];
			}
		}
	}

	/**
	 * Update interpolation curve based on skew factor in range `[-1, 1]`.
	 * Setting to `0` results in linear interpolation. Positive values
	 * result in convex exponential curves while negative vales result
	 * in concave exponential curves.
	 * @param {number} skew
	 */
	setSkew(skew) {
		if (this._skew === skew || this._discrete) return;
		if (skew < -1 || skew > 1) throw Error('skew must be in range [-1.0, 1.0]');

		const newKey = [this._N, skew].join('_');
		const oldKey = this._tableKey;
		const { id } = this.info;
		// just in case...
		if (newKey === oldKey) return;

		if (WamParameterInterpolator._tables[newKey]) { // lookup table already exists
			// add new reference
			/** @type {string[] | undefined} */
			const references = WamParameterInterpolator._tableReferences[newKey];
			if (references) references.push(id);
			else WamParameterInterpolator._tableReferences[newKey] = [id];
		} else { // compute new lookup table
			let e = Math.abs(skew);
			/* eslint-disable-next-line */
			e = Math.pow(3.0 - e, e * (e + 2.0));
			const linear = e === 1.0;
			const N = this._N;
			const table = new Float32Array(N + 1);
			if (linear) for (let n = 0; n <= N; ++n) table[n] = (n / N);
			else for (let n = 0; n <= N; ++n) table[n] = (n / N) ** e;

			WamParameterInterpolator._tables[newKey] = table;
			WamParameterInterpolator._tableReferences[newKey] = [id];
		}
		// remove old reference
		this._removeTableReference(oldKey);
		this._skew = skew;
		this._tableKey = newKey;
		this._table = WamParameterInterpolator._tables[this._tableKey];
	}

	/**
	 * Reset the interpolator to specified value, setting all per-sample
	 * values immediately if `fill` is `true`. Assumes `value` is within
	 * parameter's valid range `[minValue, maxValue]`;
	 * @param {number} value
	 * @param {boolean} fill
	 */
	setStartValue(value, fill = true) {
		this._n = this._N;
		this._startValue = value;
		this._endValue = value;
		this._currentValue = value;
		this._deltaValue = 0;
		this._inverted = false;
		if (fill) {
			this.values.fill(value);
			this._changed = true;
			this._filled = this.values.length;
		} else {
			this._changed = false;
			this._filled = 0;
		}
	}

	/**
	 * Prepare to compute per-sample values interpolating to `value` on
	 * next `process` call. Assumes `value` is within parameter's valid
	 * range `[minValue, maxValue]`;
	 * @param {number} value
	 */
	setEndValue(value) {
		if (value === this._endValue) return;
		this._n = 0;
		this._startValue = this._currentValue;
		this._endValue = value;
		this._deltaValue = this._endValue - this._startValue;
		this._inverted = (this._deltaValue > 0 && this._skew >= 0)
		|| (this._deltaValue <= 0 && this._skew < 0);
		this._changed = false;
		this._filled = 0;
	}

	/**
	 * Compute per-sample value updates in the specified range `[startSample, endSample)`,
	 * interpolating if applicable. Results are stored in `values`. Assumes this will be
	 * called once per parameter per processing slice in `WamProcessor.process`.
	 * @param {number} startSample
	 * @param {number} endSample
	 */
	process(startSample, endSample) {
		if (this.done) return;
		const length = endSample - startSample;
		let fill = 0;
		const change = this._N - this._n;
		if (this._discrete || !change) fill = length;
		else {
			if (change < length) {
				fill = Math.min(length - change, samplesPerQuantum);
				endSample -= fill;
			}
			if (endSample > startSample) { // interpolate
				if (this._inverted) {
					for (let i = startSample; i < endSample; ++i) {
						const tableValue = 1.0 - this._table[this._N - ++this._n];
						this.values[i] = this._startValue + tableValue * this._deltaValue;
					}
				} else {
					for (let i = startSample; i < endSample; ++i) {
						const tableValue = this._table[++this._n];
						this.values[i] = this._startValue + tableValue * this._deltaValue;
					}
				}
			}
			if (fill > 0) {
				startSample = endSample;
				endSample += fill;
			}
		}
		if (fill > 0) {
			// fill any remaining slots
			this.values.fill(this._endValue, startSample, endSample);
			this._filled += fill;
		}
		this._currentValue = this.values[endSample - 1];
		if (this._n === this._N) {
			if (!this._changed) this._changed = true;
			else if (this._filled >= this.values.length) {
				this.setStartValue(this._endValue, false);
				this._changed = true;
				this._filled = this.values.length;
			}
		}
	}

	/**
	 * Whether or not further processing is required before
	 * accessing per-sample values.
	 * @returns {boolean}
	 */
	get done() {
		return this._changed && this._filled === this.values.length;
	}

	/**
	 * Whether or not interpolation is complete and internal state
	 * is equal to `value`.
	 * @param {number} value
	 * @returns {boolean}
	 */
	is(value) {
		return this._endValue === value && this.done;
	}

	/**
	 * Call this when no longer using the instance in order
	 * to allow deletion of unused static lookup tables.
	 */
	destroy() {
		// clean out reference associated with this instance
		this._removeTableReference(this._tableKey);
	}
}

if (globalThis.AudioWorkletGlobalScope) {
	globalThis.WamParameterInterpolator = WamParameterInterpolator;
}
