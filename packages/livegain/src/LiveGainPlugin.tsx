
import type { DefaultState } from "sdkv3";
import { WebAudioPlugin } from "sdkv3";
import LiveGainNode from "./LiveGainNode";

export type Parameters = "gain";
export interface State extends DefaultState {
    metering: "preFader" | "postFader";
    frameRate: number;
    speedLim: number;
    levels: number[];
    value: number;
    min: number;
    max: number;
    step: number;
    orientation: "vertical" | "horizontal";
}
export type Events = { change: Partial<State>; destroy: never };
export class LiveGainPlugin extends WebAudioPlugin<LiveGainNode, Parameters, never, never, State, Events> {
    static pluginName = "LiveGain";
    readonly state = {
        ...this.state,
        metering: "postFader",
        frameRate: 60,
        speedLim: 16,
        levels: [],
        min: -70,
        max: 6,
        step: 0.01,
        value: 0,
        orientation: "horizontal"
    } as State;
    async createAudioNode() {
        const node = new LiveGainNode(this.audioContext, { plugin: this });
        await node.setup();
        return node;
    }
    destroy() {
        this.emit("destroy");
    }
}
export default LiveGainPlugin;
