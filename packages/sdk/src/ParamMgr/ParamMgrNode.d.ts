import DisposableAudioWorkletNode from "./DisposableAudioWorkletNode";
import WebAudioPlugin from "../WebAudioPlugin";

declare interface ParamMgrNode<
        Params extends string = string,
        InternalParams extends string = Params
> extends DisposableAudioWorkletNode<
        { buffer: { lock: Int32Array, paramsBuffer: Float32Array } },
        { destroy: true, paramsMapping: ParametersMapping<Params, InternalParams>, buffer: true },
        Params,
        { paramsConfig: ParametersDescriptor<Params>; paramsMapping: ParametersMapping<Params, InternalParams>; internalParams: InternalParams[]; instanceId: string; }
> {
    plugin: WebAudioPlugin<any, Params, InternalParams>;
    internalParams: InternalParams[];
    internalParamsConfig: InternalParametersDescriptor<InternalParams>;
    $lock: Int32Array;
    $paramsBuffer: Float32Array;
    $prevParamsBuffer: Float32Array;
    paramsChangeCanDispatch: Set<InternalParams>;
    paramsUpdateCheckFnRef: number[];
    initialize(): Promise<ParamMgrNode>;
    requestDispatchIParamChange(name: InternalParams): void;
    getIParamIndex(name: InternalParams): number;
    connectIParam(name: InternalParams, dest: AudioParam | AudioNode, index?: number): void;
    disconnectIParam(name: InternalParams, dest?: AudioParam | AudioNode, index?: number): void;
    getIParamValue(name: InternalParams): number;
    getIParamsValues(): Record<InternalParams, number>;
    getParam(name: Params): AudioParam;
    getParams(): Record<Params, AudioParam>;
    getParamValue(name: Params): number;
    setParamValue(name: Params, value: number): void;
    getParamsValues(): Record<Params, number>;
    setParamsValues(values: Record<Params, number>): void;
    getNormalizedParamValue(name: Params): number;
    setNormalizedParamValue(name: Params, value: number): void;
    setParamValueAtTime(name: Params, value: number, startTime: number): AudioParam;
    setNormalizedParamValueAtTime(name: Params, value: number, startTime: number): AudioParam;
    linearRampToParamValueAtTime(name: Params, value: number, endTime: number): AudioParam;
    linearRampToNormalizedParamValueAtTime(name: Params, value: number, endTime: number): AudioParam;
    exponentialRampToParamValueAtTime(name: Params, value: number, endTime: number): AudioParam;
    exponentialRampToNormalizedParamValueAtTime(name: Params, value: number, endTime: number): AudioParam;
    setParamTargetAtTime(name: Params, target: number, startTime: number, timeConstant: number): AudioParam;
    setNormalizedParamTargetAtTime(name: Params, target: number, startTime: number, timeConstant: number): AudioParam;
    setParamValueCurveAtTime(name: Params, values: Iterable<number> | number[] | Float32Array, startTime: number, duration: number): AudioParam;
    setNormalizedParamValueCurveAtTime(name: Params, values: Iterable<number> | number[] | Float32Array, startTime: number, duration: number): AudioParam;
    cancelScheduledParamValues(name: Params, cancelTime: number): AudioParam;
    cancelAndHoldParamAtTime(name: Params, cancelTime: number): AudioParam;
    destroy(): void;
}
declare const ParamMgrNode: {
    prototype: AudioWorkletNode;
    new <Params extends string = string, InternalParams extends string = string>(
        context: BaseAudioContext,
        processorId: string,
        parameterData: Record<Params, number>,
        processorOptions: { paramsConfig: ParametersDescriptor; paramsMapping: ParametersMapping; internalParamsConfig: InternalParametersDescriptor }
    ): ParamMgrNode<Params, InternalParams>;
}
export default ParamMgrNode;
