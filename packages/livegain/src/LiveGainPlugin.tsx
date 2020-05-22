
import { WebAudioPlugin } from "sdk";
import LiveGainNode from "./LiveGainNode";

export type Parameters = "gain" | "frameRate" | "speedLim" | "min" | "max" | "step" | "orientation" | "metering";
export class LiveGainPlugin extends WebAudioPlugin<LiveGainNode, Parameters, Parameters> {
    static pluginName = "LiveGain";
    async createAudioNode() {
        const node = new LiveGainNode(this.audioContext, { plugin: this });
        await node.setup();
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
