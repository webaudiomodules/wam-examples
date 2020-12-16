/* eslint-disable no-underscore-dangle */
/** @typedef {import('../api/types').WamParameter} WamParameter */
/** @typedef {import('../api/types').WamParameterInfo} WamParameterInfo */

/**
 * @extends {AudioParam}
 * @implements {WamParameter}
 */
export default class MgrAudioParam extends AudioParam {
	get exponent() {
		return this.info.exponent;
	}

	/**
	 * @type {WamParameterInfo}
	 */
	_info = undefined;

	get info() {
		return this._info;
	}

	set info(info) {
		this._info = info;
	}

	set normalizedValue(valueIn) {
		this.value = this.info.denormalize(valueIn);
	}

	get normalizedValue() {
		return this.info.normalize(this.value);
	}

	setValueAtTime(value, startTime) {
		return super.setValueAtTime(value, startTime);
	}

	setNormalizedValueAtTime(valueIn, startTime) {
		const value = this.info.denormalize(valueIn);
		return this.setValueAtTime(value, startTime);
	}

	linearRampToValueAtTime(value, endTime) {
		return super.linearRampToValueAtTime(value, endTime);
	}

	linearRampToNormalizedValueAtTime(valueIn, endTime) {
		const value = this.info.denormalize(valueIn);
		return this.linearRampToValueAtTime(value, endTime);
	}

	exponentialRampToValueAtTime(value, endTime) {
		return super.exponentialRampToValueAtTime(value, endTime);
	}

	exponentialRampToNormalizedValueAtTime(valueIn, endTime) {
		const value = this.info.denormalize(valueIn);
		return this.exponentialRampToValueAtTime(value, endTime);
	}

	setTargetAtTime(target, startTime, timeConstant) {
		return super.setTargetAtTime(target, startTime, timeConstant);
	}

	setNormalizedTargetAtTime(targetIn, startTime, timeConstant) {
		const target = this.info.denormalize(targetIn);
		return this.setTargetAtTime(target, startTime, timeConstant);
	}

	setValueCurveAtTime(values, startTime, duration) {
		return super.setValueCurveAtTime(values, startTime, duration);
	}

	setNormalizedValueCurveAtTime(valuesIn, startTime, duration) {
		const values = Array.from(valuesIn).map((v) => this.info.denormalize(v));
		return this.setValueCurveAtTime(values, startTime, duration);
	}

	cancelScheduledParamValues(cancelTime) {
		return super.cancelScheduledValues(cancelTime);
	}

	cancelAndHoldParamAtTime(cancelTime) {
		return super.cancelAndHoldAtTime(cancelTime);
	}
}
