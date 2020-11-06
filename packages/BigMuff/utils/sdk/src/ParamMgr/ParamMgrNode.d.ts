/* eslint-disable max-len */
/* eslint-disable object-curly-newline */
import { TypedAudioWorkletNode, MessagePortResponse, ParamMgrCallToProcessor, MessagePortRequest, ParamMgrCallFromProcessor, ParamMgrOptions, InternalParametersDescriptor } from './types';
import { WebAudioModule, WamNode, WamEventMap } from '../api/types';

interface MsgIn extends MessagePortResponse<ParamMgrCallToProcessor>, MessagePortRequest<ParamMgrCallFromProcessor> {}
interface MsgOut extends MessagePortRequest<ParamMgrCallToProcessor>, MessagePortResponse<ParamMgrCallFromProcessor> {}

/**
 * Parameter Manager Class
 */
declare interface ParamMgrNode<Params extends string = string, InternalParams extends string = Params> extends TypedAudioWorkletNode<MsgIn, MsgOut, Params, WamEventMap>, Omit<WamNode, keyof AudioWorkletNode>, ParamMgrCallFromProcessor {
    /**
     * The `WebAudioModule` this lives in.
     */
    readonly module: WebAudioModule;
    /**
     * The state of the initialization.
     */
    readonly initialized: boolean;
    /**
     * An array that contains ordered internal params names.
     * The order is important for the output connections and for the parameters' values buffer
     */
    // internalParams: InternalParams[];
    /**
     * The plugin's internal parameters description.
     * Used for denormalize normalized exposed parameters values
     */
    readonly internalParamsConfig: InternalParametersDescriptor<InternalParams>;
    /**
     * The lock will be true if the `$paramsBuffer` is changing by the processor.
     * This is a view of a `SharedArrayBuffer`
     */
    // $lock: Int32Array;
    /**
     * The values of internal parameters,
     * contains one value for each param,
     * will be updated each `AudioWorklet` buffer.
     * This is a view of a `SharedArrayBuffer`
     */
    // $paramsBuffer: Float32Array;
    /**
     * Previous params value since last event dispatch of any
     * non-AudioParam internal parameters
     */
    // $prevParamsBuffer: Float32Array;
    /**
     * A set for internal parameters names.
     * These params is ready for next change event dispatch.
     * (to throttle event dispatch rate for the non-AudioParam internal parameters)
     */
    // paramsChangeCanDispatch: Set<InternalParams>;
    /**
     * Event dispatch callbacks reference of the `setTimeout` calls.
     * Used to clear the callbacks while destroying the plugin.
     */
    // paramsUpdateCheckFnRef: number[];
    /**
     * waiting for the processor that gives the `paramsBuffer` `SharedArrayBuffer`
     */
    initialize(): Promise<ParamMgrNode>;
    /**
     * convert an WebAudio time stamp to frame index
     */
    convertTimeToFrame(time: number): number;
    /**
     * convert a frame index to WebAudio time stamp
     */
    convertFrameToTime(frame: number): number;
    /**
     * Force to check if an internal param is updated to dispatch immediately value change event if necessary.
     * Note that the event will also be throttled to the automation rate.
     */
    requestDispatchIParamChange(name: InternalParams): void;
    /**
     * get the output index of an internal parameter from its name,
     * null if not exist
     */
    getIParamIndex(name: InternalParams): number | null;
    /**
     * connect an internal parameter audio output to an AudioParam or an AudioNode.
     * Note that if the destination is declared in the `internalParamsConfig`,
     * there is no need to reconnect it.
     */
    connectIParam(name: InternalParams, dest: AudioParam | AudioNode, index?: number): void;
    /**
     * disonnect an internal parameter audio output to an AudioParam or an AudioNode.
     */
    disconnectIParam(name: InternalParams, dest?: AudioParam | AudioNode, index?: number): void;
    /**
     * get the current value of an internal parameter
     */
    getIParamValue(name: InternalParams): number;
    /**
     * get the current value of every internal parameters
     */
    getIParamsValues(): Record<InternalParams, number>;
    /**
     * get the `AudioParam` instance of an exposed parameter
     */
    getParam(name: Params): AudioParam;
    /**
     * get the `AudioParam` instance of every exposed parameters
     */
    getParams(): Record<Params, AudioParam>;
    /**
     * get the current value of an exposed parameter,
     * shorthand for `AudioParam.prototype.value`
     */
    getParamValue(name: Params): number;
    /**
     * get the current value of an exposed parameter,
     * shorthand for `AudioParam.prototype.value = value`
     */
    setParamValue(name: Params, value: number): void;
    /**
     * get the current value of every exposed parameters
     */
    getParamsValues(): Record<Params, number>;
    /**
     * set the current value of every exposed parameters
     */
    setParamsValues(values: Partial<Record<Params, number>>): void;
    /**
     * normalized value version of `getParamValue()`
     */
    getNormalizedParamValue(name: Params): number;
    /**
     * normalized value version of `setParamValue()`
     */
    setNormalizedParamValue(name: Params, value: number): void;
    /**
     * normalized value version of `getParamsValues()`
     */
    getNormalizedParamsValues(): Partial<Record<Params, number>>;
    /**
     * normalized value version of `setParamsValues()`
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
}
declare const ParamMgrNode: {
    prototype: ParamMgrNode;
	/**
     * Creates an instance of ParamMgrNode.
     *
     * @param {WebAudioModule} module WebAudioModule
     * @param {ParamMgrOptions} options AudioWorkletNode options
     */
    new <Params extends string = string, InternalParams extends string = string>(
        module: WebAudioModule,
        options: ParamMgrOptions
    ): ParamMgrNode<Params, InternalParams>;
};
export default ParamMgrNode;
