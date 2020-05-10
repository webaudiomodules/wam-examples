import DisposableAudioWorkletNode from "./DisposableAudioWorkletNode";

declare interface ParamMgrNode<
        Params extends string = string,
        InternalParams extends string = string
> extends DisposableAudioWorkletNode<
        { buffer: { lock: Int32Array, paramsBuffer: Float32Array } },
        { destroy: true, mapping: ParametersMapping, buffer: true },
        Params,
        { paramsConfig: ParametersDescriptor; mapping: ParametersMapping; internalParamsConfig: InternalParametersDescriptor }
> {
    internalParamsConfig: InternalParametersDescriptor<InternalParams>;
    $lock: Int32Array;
    $paramsBuffer: Float32Array;
    init(): Promise<void>;
    getParamIndex(key: InternalParams): number;
    connectParam(key: InternalParams, dest: AudioParam | AudioNode, index?: number): void;
    disconnectParam(key: InternalParams, dest?: AudioParam | AudioNode, index?: number): void;
    getParamValue(key: InternalParams): number;
    destroy(): void;
}
declare const ParamMgrNode: {
    prototype: AudioWorkletNode;
    new <InternalParams extends string = string>(
        context: BaseAudioContext,
        processorId: string,
        parameterData: Record<Params, number>,
        processorOptions: { paramsConfig: ParametersDescriptor; mapping: ParametersMapping; internalParamsConfig: InternalParametersDescriptor }
    ): ParamMgrNode<InternalParams>;
}
export default ParamMgrNode;
