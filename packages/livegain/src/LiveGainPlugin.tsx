
import { WebAudioModule, ParamMgrRegister } from "sdk";
import LiveGainNode from "./LiveGainNode";
import { TemporalAnalyserNode, register } from "./worklets/TemporalAnalyser";

export type Parameters = "gain" | "frameRate" | "speedLim" | "min" | "max" | "step" | "orientation" | "metering";
export class LiveGainModule extends WebAudioModule<LiveGainNode> {
    async createAudioNode(initialState?: any) {
        let node: LiveGainNode;
        const paramsConfig = {
            gain: {
                defaultValue: 0,
                minValue: -70,
                maxValue: 6
            },
            frameRate: {
                defaultValue: 60,
                minValue: 0,
                maxValue: 60
            },
            speedLim: {
                defaultValue: 16,
                minValue: 0,
                maxValue: 60
            },
            min: {
                defaultValue: -70,
                minValue: -70,
                maxValue: -6
            },
            max: {
                defaultValue: 6,
                minValue: 0,
                maxValue: 15
            },
            step: {
                defaultValue: 0.01,
                minValue: 0.01,
                maxValue: 6
            },
            orientation: {
                defaultValue: 0,
                minValue: 0,
                maxValue: 1
            },
            metering: {
                defaultValue: 0,
                minValue: 0,
                maxValue: 1
            }
        };
        const internalParamsConfig = {
            gain: { onChange: (v: number) => node.handleGainChanged(v) },
            frameRate: {},
            speedLim: {},
            min: {},
            max: {},
            step: {},
            orientation: {},
            metering: { onChange: (v: number) => node.handleMeteringChanged(v) }
        };
        const inputGainNode = this.audioContext.createGain();
        const outGainNode = this.audioContext.createGain();
        await register(this.audioContext.audioWorklet);
        const analyserNode = new TemporalAnalyserNode(this.audioContext);
        const options = await ParamMgrRegister.register(this, inputGainNode.numberOfInputs, { internalParamsConfig, paramsConfig });
        node = new LiveGainNode(this, options);
        await node.initialize();
        node.setup(inputGainNode, outGainNode, analyserNode);
        if (initialState) node.setState(initialState);
        return node;
    }
}
export default LiveGainModule;
