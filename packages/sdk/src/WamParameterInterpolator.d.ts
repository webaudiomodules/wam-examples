import { WamParameterInfo } from './api/types';

declare class WamParameterInterpolator {
	/**
	 * Lookup tables to avoid recomputing interpolation curves. Keyed
	 * by `'<samplesPerInterpolation>_<skew>'`. Not used for
	 * discrete parameters.
	 */
	private static _tables: Record<string, Float32Array>;

	/**
	 * List of parameter ids currently using the lookup table associated
	 * with the key. Keyed by `'<samplesPerInterpolation>_<skew>'`.
	 * For purging unused lookup tables. Not used for discrete parameters.
	 */
	private static _tableReferences: Record<string, string[]>;

	/**
	 * Provides per-sample value updates for WamParameters
	 * with interpolation when applicable. Only one instance
	 * should be created per WamParameter.
	 */
	constructor(info: WamParameterInfo, samplesPerInterpolation: number, skew?: number);

	readonly info: WamParameterInfo;

	/** Buffer storing per-sample values. */
	readonly values: Float32Array;

	/** Composed by concatenating `'<samplesPerInterpolation>_<skew>'`. */
	private _tableKey: string;

	/** The (static) lookup table used to avoid recomputing ramps. */
	private _table: Float32Array;

	/**
	 * Determines if interpolation will be linear / nonlinear.
	 * Note that this is distinct from the corresponding
	 * parameter's `exponent` value.
	 */
	private _skew: number;

	/**
	 * Whether or not to perform interpolation
	 * (false for integer parameters, true otherwise).
	 */
	private readonly _discrete: boolean;

	/** The interpolation period in samples. */
	private readonly _N: number;

	/** The current interpolation index. */
	private _n: number;

	/** The parameter value when interpolation starts. */
	private _startValue: number;

	/** The parameter value when interpolation ends. */
	private _endValue: number;

	/** The most recently computed parameter value. */
	private _currentValue: number;

	/** The difference between `startValue` and `endValue`. */
	private _deltaValue: number;

	/**
	 * Allows consistent output with respect to skew setting
	 * whether increasing or decreasing during interpolation.
	 */
	private _inverted: boolean;

	/** Whether the most recently requested interpolation has completed. */
	private _changed: boolean;

	/**
	 * How many samples have been uniformly filled following
	 * completion of most recently requested interpolation.
	 */
	private _filled: number;

	/** Utility for managing lifecycles of lookup tables. */
	/* eslint-disable-next-line no-underscore-dangle */
	private _removeTableReference(oldKey: string): void;

	/**
	 * Update interpolation curve based on skew factor in range `[-1, 1]`.
	 * Setting to `0` results in linear interpolation. Positive values
	 * result in convex exponential curves while negative vales result
	 * in concave exponential curves.
	 */
	setSkew(skew: number): void;

	/**
	 * Reset the interpolator to specified value, setting all per-sample
	 * values immediately if `fill` is `true`. Assumes `value` is within
	 * parameter's valid range `[minValue, maxValue]`;
	 */
	setStartValue(value: number, fill?: boolean): void;

	/**
	 * Prepare to compute per-sample values interpolating to `value` on
	 * next `process` call. Assumes `value` is within parameter's valid
	 * range `[minValue, maxValue]`;
	 */
	setEndValue(value: number): void;

	/**
	 * Compute per-sample value updates in the specified range `[startIndex, endIndex)`,
	 * interpolating if applicable. Results are stored in `values`. Assumes this will be
	 * called once per parameter per processing slice in `WamProcessor.process`.
	 */
	process(startIndex: number, endIndex: number): void;

	/**
	 * Whether or not further processing is required before
	 * accessing per-sample values.
	 */
	readonly done: boolean;

	/**
	 * Call this when no longer using the instance in order
	 * to allow deletion of unused static lookup tables.
	 */
	destroy(): void;
}

export default WamParameterInterpolator;
