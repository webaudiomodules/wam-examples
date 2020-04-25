
import * as React from "react";
import * as ReactDOM from "react-dom";
import type { ParametersDescriptor, DefaultState } from "sdkv3";
import { WebAudioPlugin } from "sdkv3";
import LiveGainUI from "./LiveGainUI";
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
};
export type Events = { stateChanged: Partial<State>; destroy: never };
export class LiveGainPlugin extends WebAudioPlugin<Parameters, never, never, State, Events> {
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
    params: ParametersDescriptor<Parameters> = {
        enabled: {
            defaultValue: 1,
            minValue: 0,
            maxValue: 1
        },
        gain: {
            defaultValue: 1,
            minValue: 0,
            maxValue: 1
        }
    };
    initialize(state?: Partial<State>) {
        if (state) Object.assign(this.state, state);
    }
    setState(state: Partial<State>) {
        Object.assign(this.state, state);
        this.emit("stateChanged", state);
        return this;
    }
    createAudioNode = async () => {
        const node = new LiveGainNode(this.audioContext, { plugin: this });
        await node.setup();
        return node;
    };
    createElement = async () => {
        const div = document.createElement("div");
        ReactDOM.render(<LiveGainUI plugin={this} {...this.state} />, div);
        return div;
    };
    destroy() {
        this.emit("destroy");
    }
}
export default LiveGainPlugin;
