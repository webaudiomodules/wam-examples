/* eslint-disable max-len */
import { WamParameter } from '../api/types';

interface MgrAudioParam extends AudioParam, WamParameter {
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
};

export default MgrAudioParam;
