import { WebAudioModule } from "@webaudiomodules/sdk";
import { ParamMgrFactory, ParametersMappingConfiguratorOptions } from "@webaudiomodules/sdk-parammgr";
import Node from "./OscilloscopeNode";
import SpectralAnalyserNode from "../worklets/SpectralAnalyser";
import { createElement, destroyElement } from "../gui";
import UI from "./OscilloscopeUI";

export type Parameters = "frameRate" | "windowSize" | "interleaved" | "showStats";
export class OscilloscopeModule extends WebAudioModule<Node> {
    static descriptor = {
        name: "Oscilloscope",
        vendor: "WebAudioModule"
    };

    async createAudioNode(initialState?: any) {
        const node = new Node(this.audioContext);
        const outGainNode = this.audioContext.createGain();
        await SpectralAnalyserNode.register(this.audioContext.audioWorklet);
        const analyserNode = new SpectralAnalyserNode(this.audioContext);
        const paramsConfig: ParametersMappingConfiguratorOptions["paramsConfig"] = {
            frameRate: {
                defaultValue: 60,
                minValue: 0,
                maxValue: 60
            },
            windowSize: {
                ...analyserNode.parameters.get("windowSize"),
                defaultValue: 1024
            },
            interleaved: {
                defaultValue: 1,
                minValue: 0,
                maxValue: 1,
                type: "boolean",
                discreteStep: 1
            },
            showStats: {
                defaultValue: 1,
                minValue: 0,
                maxValue: 1,
                type: "boolean",
                discreteStep: 1
            }
        };
        const internalParamsConfig: ParametersMappingConfiguratorOptions["internalParamsConfig"] = {
            frameRate: {},
            windowSize: analyserNode.parameters.get("windowSize"),
            interleaved: {},
            showStats: {}
        };
        const paramMgrNode = await ParamMgrFactory.create<Parameters, Parameters>(this, { internalParamsConfig, paramsConfig });
        node.setup(outGainNode, paramMgrNode, analyserNode);
        if (initialState) node.setState(initialState);
        return node;
    }

    createGui(): Promise<HTMLDivElement> {
        return createElement(this, UI);
    }

    destroyGui(gui: Element) {
        return destroyElement(gui);
    }
}
export default OscilloscopeModule;
