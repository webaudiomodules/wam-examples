import DisposableAudioWorkletNode from "./DisposableAudioWorkletNode";
import WebAudioPlugin from "../WebAudioPlugin";

/**
 * Parameter Manager Class
 *
 * @interface ParamMgrNode
 * @extends {DisposableAudioWorkletNode}
 * @template Params exposed parameters names
 * @template InternalParams internal parameters names
 */
declare interface ParamMgrNode<
        Params extends string = string,
        InternalParams extends string = Params
> extends DisposableAudioWorkletNode<
        { buffer: { lock: Int32Array, paramsBuffer: Float32Array } },
        { destroy: true, paramsMapping: ParametersMapping<Params, InternalParams>, buffer: true },
        Params,
        { paramsConfig: ParametersDescriptor<Params>; paramsMapping: ParametersMapping<Params, InternalParams>; internalParams: InternalParams[]; instanceId: string; }
> {
    /**
     * The `WebAudioPlugin` where this lives in, used to dispatch events.
     *
     * @type {WebAudioPlugin<any, Params, InternalParams>}
     * @memberof ParamMgrNode
     */
    plugin: WebAudioPlugin<any, Params, InternalParams>;
    /**
     * An array that contains ordered internal params names.
     * The order is important for the output connections and for the parameters' values buffer
     *
     * @type {InternalParams[]}
     * @memberof ParamMgrNode
     */
    internalParams: InternalParams[];
    /**
     * The plugin's internal parameters description.
     * Used for denormalize normalized exposed parameters values
     *
     * @type {InternalParametersDescriptor<InternalParams>}
     * @memberof ParamMgrNode
     */
    internalParamsConfig: InternalParametersDescriptor<InternalParams>;
    /**
     * The lock will be true if the `$paramsBuffer` is changing by the processor.
     * This is a view of a `SharedArrayBuffer`
     *
     * @type {Int32Array}
     * @memberof ParamMgrNode
     */
    $lock: Int32Array;
    /**
     * The values of internal parameters,
     * contains one value for each param,
     * will be updated each `AudioWorklet` buffer.
     * This is a view of a `SharedArrayBuffer`
     *
     * @type {Float32Array}
     * @memberof ParamMgrNode
     */
    $paramsBuffer: Float32Array;
    /**
     * Previous params value since last event dispatch of any
     * non-AudioParam internal parameters
     *
     * @type {Float32Array}
     * @memberof ParamMgrNode
     */
    $prevParamsBuffer: Float32Array;
    /**
     * A set for internal parameters names.
     * These params is ready for next change event dispatch.
     * (to throttle event dispatch rate for the non-AudioParam internal parameters)
     *
     * @type {Set<InternalParams>}
     * @memberof ParamMgrNode
     */
    paramsChangeCanDispatch: Set<InternalParams>;
    /**
     * Event dispatch callbacks reference of the `setTimeout` calls.
     * Used to clear the callbacks while destroying the plugin.
     *
     * @type {number[]}
     * @memberof ParamMgrNode
     */
    paramsUpdateCheckFnRef: number[];
    /**
     * waiting for the processor that gives the `paramsBuffer` `SharedArrayBuffer`
     *
     * @returns {Promise<ParamMgrNode>}
     * @memberof ParamMgrNode
     */
    initialize(): Promise<ParamMgrNode>;
    /**
     * convert an WebAudio time stamp to frame index
     *
     * @param {number} time
     * @returns {number}
     * @memberof ParamMgrNode
     */
    convertTimeToFrame(time: number): number;
    /**
     * convert a frame index to WebAudio time stamp
     *
     * @param {number} frame
     * @returns {number}
     * @memberof ParamMgrNode
     */
    convertFrameToTime(frame: number): number;
    /**
     * Force to check if an internal param is updated to dispatch immediately value change event if necessary.
     * Note that the event will also be throttled to the automation rate.
     *
     * @param {InternalParams} name
     * @memberof ParamMgrNode
     */
    requestDispatchIParamChange(name: InternalParams): void;
    /**
     * get the output index of an internal parameter from its name,
     * null if not exist
     *
     * @param {InternalParams} name
     * @returns {number | null}
     * @memberof ParamMgrNode
     */
    getIParamIndex(name: InternalParams): number | null;
    /**
     * connect an internal parameter audio output to an AudioParam or an AudioNode.
     * Note that if the destination is declared in the `internalParamsConfig`,
     * there is no need to reconnect it.
     *
     * @param {InternalParams} name
     * @param {(AudioParam | AudioNode)} dest
     * @param {number} [index]
     * @memberof ParamMgrNode
     */
    connectIParam(name: InternalParams, dest: AudioParam | AudioNode, index?: number): void;
    /**
     * disonnect an internal parameter audio output to an AudioParam or an AudioNode.
     *
     * @param {InternalParams} name
     * @param {(AudioParam | AudioNode)} [dest]
     * @param {number} [index]
     * @memberof ParamMgrNode
     */
    disconnectIParam(name: InternalParams, dest?: AudioParam | AudioNode, index?: number): void;
    /**
     * get the current value of an internal parameter
     *
     * @param {InternalParams} name
     * @returns {number}
     * @memberof ParamMgrNode
     */
    getIParamValue(name: InternalParams): number;
    /**
     * get the current value of every internal parameters
     *
     * @returns {Record<InternalParams, number>}
     * @memberof ParamMgrNode
     */
    getIParamsValues(): Record<InternalParams, number>;
    /**
     * get the `AudioParam` instance of an exposed parameter
     *
     * @param {Params} name
     * @returns {AudioParam}
     * @memberof ParamMgrNode
     */
    getParam(name: Params): AudioParam;
    /**
     * get the `AudioParam` instance of every exposed parameters
     *
     * @returns {Record<Params, AudioParam>}
     * @memberof ParamMgrNode
     */
    getParams(): Record<Params, AudioParam>;
    /**
     * get the current value of an exposed parameter,
     * shorthand for `AudioParam.prototype.value`
     *
     * @param {Params} name
     * @returns {number}
     * @memberof ParamMgrNode
     */
    getParamValue(name: Params): number;
    /**
     * get the current value of an exposed parameter,
     * shorthand for `AudioParam.prototype.value = value`
     *
     * @param {Params} name
     * @param {number} value
     * @memberof ParamMgrNode
     */
    setParamValue(name: Params, value: number): void;
    /**
     * get the current value of every exposed parameters
     *
     * @param {Params} name
     * @param {number} value
     * @memberof ParamMgrNode
     */
    getParamsValues(): Record<Params, number>;
    /**
     * set the current value of every exposed parameters
     *
     * @param {Record<Params, number>} values
     * @memberof ParamMgrNode
     */
    setParamsValues(values: Record<Params, number>): void;
    /**
     * normalized value version of `getParamValue()`
     *
     * @param {Params} name
     * @returns {number}
     * @memberof ParamMgrNode
     */
    getNormalizedParamValue(name: Params): number;
    /**
     * normalized value version of `setParamValue()`
     *
     * @param {Params} name
     * @param {number} value
     * @memberof ParamMgrNode
     */
    setNormalizedParamValue(name: Params, value: number): void;
    /**
     * normalized value version of `getParamsValues()`
     *
     * @returns {Record<Params, number>}
     * @memberof ParamMgrNode
     */
    getNormalizedParamsValues(): Record<Params, number>;
    /**
     * normalized value version of `setParamsValues()`
     *
     * @param {Record<Params, number>} values
     * @memberof ParamMgrNode
     */
    setNormalizedParamsValues(values: Record<Params, number>): void;
    // `AudioParam.prototype` methods with there normlized value version
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
    /**
     * will be called while the plugin is destroying
     *
     * @memberof ParamMgrNode
     */
    destroy(): void;
}
declare const ParamMgrNode: {
    prototype: AudioWorkletNode;
	/**
     * Creates an instance of ParamMgrNode.
     *
     * @param {BaseAudioContext} context AudioContext
     * @param {string} processorId Processor identifier
	 * @param {Record<Params, number>} parameterData parameters initial values map
     * @param {{ paramsConfig: ParametersDescriptor<Params>; paramsMapping: ParametersMapping<Params, InternalParams>; internalParams: InternalParams[]; instanceId: string; }} processorOptions
     * @param {WebAudioPlugin<any, Params, InternalParams>} plugin the plugin instance
	 * @param {InternalParametersDescriptor<InternalParams>} internalParamsConfig
     * @memberof ParamMgrNode
     */
    new <Params extends string = string, InternalParams extends string = string>(
        context: BaseAudioContext,
        processorId: string,
        parameterData: Record<Params, number>,
        processorOptions: { paramsConfig: ParametersDescriptor<Params>; paramsMapping: ParametersMapping<Params, InternalParams>; internalParams: InternalParams[]; instanceId: string; },
        plugin: WebAudioPlugin<any, Params, InternalParams>,
        internalParamsConfig: InternalParametersDescriptor<InternalParams>
    ): ParamMgrNode<Params, InternalParams>;
}
export default ParamMgrNode;
