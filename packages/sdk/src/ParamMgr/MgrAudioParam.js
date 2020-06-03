const normExp = (x, e) => (e === 0 ? x : x ** (1.5 ** -e));
const denormExp = (x, e) => (e === 0 ? x : x ** (1.5 ** e));
const normalize = (x, min, max, e = 0) => (
	min === 0 && max === 1
		? normExp(x, e)
		: normExp((x - min) / (max - min) || 0, e));
const denormalize = (x, min, max, e = 0) => (
	min === 0 && max === 1
		? denormExp(x, e)
		: denormExp(x, e) * (max - min) + min
);

export default class MgrAudioParam extends AudioParam {
	emitter = undefined;

	name = undefined;

	exponent = 0;

	normalize(value) {
		const { minValue, maxValue, exponent } = this;
		return normalize(value, minValue, maxValue, exponent);
	}

	denormalize(value) {
		const { minValue, maxValue, exponent } = this;
		return denormalize(value, minValue, maxValue, exponent);
	}

	set value(value) {
		super.value = value;
		if (this.emitter) this.emitter.emit('automation', 'value', this.name, value);
	}

	get value() {
		return super.value;
	}

	set normalizedValue(valueIn) {
		this.value = this.normalize(valueIn);
	}

	get normalizedValue() {
		return this.normalize(this.value);
	}

	setValueAtTime(value, startTime) {
		if (this.emitter) this.emitter.emit('automation', 'setValueAtTime', this.name, value, startTime);
		return super.setValueAtTime(value, startTime);
	}

	setNormalizedValueAtTime(valueIn, startTime) {
		const value = this.denormalize(valueIn);
		return this.setValueAtTime(value, startTime);
	}

	linearRampToValueAtTime(value, endTime) {
		if (this.emitter) this.emitter.emit('automation', 'linearRampToValueAtTime', this.name, value, endTime);
		return super.linearRampToValueAtTime(value, endTime);
	}

	linearRampToNormalizedValueAtTime(valueIn, endTime) {
		const value = this.denormalize(valueIn);
		return this.linearRampToValueAtTime(value, endTime);
	}

	exponentialRampToValueAtTime(value, endTime) {
		if (this.emitter) this.emitter.emit('automation', 'exponentialRampToValueAtTime', this.name, value, endTime);
		return super.exponentialRampToValueAtTime(value, endTime);
	}

	exponentialRampToNormalizedValueAtTime(valueIn, endTime) {
		const value = this.denormalize(valueIn);
		return this.exponentialRampToValueAtTime(value, endTime);
	}

	setTargetAtTime(target, startTime, timeConstant) {
		if (this.emitter) this.emitter.emit('automation', 'setTargetAtTime', this.name, target, startTime, timeConstant);
		return super.setTargetAtTime(target, startTime, timeConstant);
	}

	setNormalizedTargetAtTime(targetIn, startTime, timeConstant) {
		const target = this.denormalize(targetIn);
		return this.setTargetAtTime(target, startTime, timeConstant);
	}

	setValueCurveAtTime(values, startTime, duration) {
		if (this.emitter) this.emitter.emit('automation', 'setValueCurveAtTime', this.name, values, startTime, duration);
		return super.setValueCurveAtTime(values, startTime, duration);
	}

	setNormalizedValueCurveAtTime(valuesIn, startTime, duration) {
		const values = Array.from(valuesIn).map((v) => this.denormalize(v));
		return this.setValueCurveAtTime(values, startTime, duration);
	}

	cancelScheduledParamValues(cancelTime) {
		if (this.emitter) this.emitter.emit('automation', 'cancelScheduledValues', this.name, cancelTime);
		return super.cancelScheduledValues(cancelTime);
	}

	cancelAndHoldParamAtTime(cancelTime) {
		if (this.emitter) this.emitter.emit('automation', 'cancelAndHoldAtTime', this.name, cancelTime);
		return super.cancelAndHoldAtTime(cancelTime);
	}
}
