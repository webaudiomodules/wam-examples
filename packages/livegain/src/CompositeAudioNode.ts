import type { WebAudioPlugin } from "../../sdk/esm/index";

export default class CompositeAudioNode extends GainNode {
    _input: GainNode;
    _output: GainNode;
    constructor(audioContext: BaseAudioContext, options?: { plugin?: WebAudioPlugin }) {
        super(audioContext);
    }
    set channelCount(count: number) {
    }
    get channelCount() {
        return undefined;
    }
    set channelCountMode(mode: ChannelCountMode) {
    }
    get channelCountMode() {
        return undefined;
    }
    set channelInterpretation(interpretation: ChannelInterpretation) {
    }
    get channelInterpretation() {
        return undefined;
    }
    get numberOfInputs() {
        return super.numberOfInputs;
    }
    get numberOfOutputs() {
        return this._output.numberOfOutputs;
    }
    get gain(): any {
        return undefined;
    }
    connect(destinationNode: AudioNode, output?: number, input?: number): AudioNode;
    connect(destinationParam: AudioParam, output?: number): void;
    connect(destination: AudioNode | AudioParam, output?: number, input?: number): AudioNode | void {
        return this._output.connect(destination as any, output, input);
    }
    disconnect(): void;
    disconnect(output: number): void;
    disconnect(destinationNode: AudioNode, output?: number, input?: number): void;
    disconnect(destinationParam: AudioParam, output?: number): void;
    disconnect(destination?: AudioNode | AudioParam | number, output?: number, input?: number): void {
        return this._output.disconnect(destination as any, output, input);
    }
    async createNodes() {
        this._input = this.context.createGain();
        this._output = this.context.createGain();
    }
    connectNodes() {
        super.connect(this._input);
    }
    async setup() {
        await this.createNodes();
        this.connectNodes();
    }
}
