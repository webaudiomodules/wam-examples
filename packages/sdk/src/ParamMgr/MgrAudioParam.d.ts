import { TypedEventEmitter } from '../WebAudioPlugin';

/**
 * Extended `AudioParam` for normalized value support and event emissions.
 *
 * @interface MgrAudioParam
 * @extends {AudioParam}
 */
declare interface MgrAudioParam extends AudioParam {
    /**
     * The event emitter for automation events
     *
     * @type {TypedEventEmitter}
     * @memberof MgrAudioParam
     */
    emitter: TypedEventEmitter;
    /**
     * the parameter name
     *
     * @type {string}
     * @memberof MgrAudioParam
     */
    name: string;
    /**
     * exponent factor declared in `descriptor.json`
     *
     * @type {number}
     * @memberof MgrAudioParam
     */
    exponent: number;
    /**
     * normalize value following current max/max/exponent
     *
     * @returns {number}
     * @memberof MgrAudioParam
     */
    normalize(): number;
    /**
     * denormalize value following current max/max/exponent
     *
     * @returns {number}
     * @memberof MgrAudioParam
     */
    denormalize(): number;
    /**
     * normalized current param value
     *
     * @type {number}
     * @memberof MgrAudioParam
     */
    normalizedValue: number;
    // normalized version of methods
    cancelAndHoldAtTime(cancelTime: number): MgrAudioParam;
    cancelScheduledValues(cancelTime: number): MgrAudioParam;
    exponentialRampToValueAtTime(value: number, endTime: number): MgrAudioParam;
    exponentialRampToNormalizedValueAtTime(value: number, endTime: number): MgrAudioParam;
    linearRampToValueAtTime(value: number, endTime: number): MgrAudioParam;
    linearRampToNormalizedValueAtTime(value: number, endTime: number): MgrAudioParam;
    setTargetAtTime(target: number, startTime: number, timeConstant: number): MgrAudioParam;
    setNormalizedTargetAtTime(target: number, startTime: number, timeConstant: number): MgrAudioParam;
    setValueAtTime(value: number, startTime: number): MgrAudioParam;
    setNormalizedValueAtTime(valueIn: string, startTime: number): MgrAudioParam;
    setValueCurveAtTime(values: number[] | Float32Array | Iterable<number>, startTime: number, duration: number): MgrAudioParam;
    setNormalizedValueCurveAtTime(values: number[] | Float32Array | Iterable<number>, startTime: number, duration: number): MgrAudioParam;
}

declare const MgrAudioParam: {
    prototype: MgrAudioParam;
}

export default MgrAudioParam;
