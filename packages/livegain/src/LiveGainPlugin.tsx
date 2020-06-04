
import { WebAudioPlugin } from "sdk";
import LiveGainNode from "./LiveGainNode";

export type Parameters = "gain" | "frameRate" | "speedLim" | "min" | "max" | "step" | "orientation" | "metering";
export class LiveGainPlugin extends WebAudioPlugin<LiveGainNode, Parameters, Parameters> {
    static pluginName = "LiveGain";
    async createAudioNode() {
        const node = new LiveGainNode(this.audioContext, { plugin: this });
        await node.setup();
        this.paramsConfig = {
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
        this.internalParamsConfig = {
            gain: { onChange: node.handleGainChanged },
            frameRate: {},
            speedLim: {},
            min: {},
            max: {},
            step: {},
            orientation: {},
            metering: { onChange: node.handleMeteringChanged }
        };
        return node;
    }
}
export default LiveGainPlugin;
