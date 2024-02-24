import { WebAudioModule } from "@webaudiomodules/sdk";
import { ParamMgrFactory } from "@webaudiomodules/sdk-parammgr";
import TemporalAnalyserNode from "../worklets/TemporalAnalyser";
import { createElement, destroyElement } from "../gui";
import Node from "./LiveGainNode";
import UI from "./LiveGainUI";

const getBaseUrl = (relativeUrl: URL) => {
	const baseUrl = relativeUrl.href.substring(0, relativeUrl.href.lastIndexOf("/"));
	return baseUrl;
};

export type Parameters = "gain" | "frameRate" | "speedLim" | "min" | "max" | "step" | "orientation" | "metering";
export class LiveGainModule extends WebAudioModule<Node> {
	_baseUrl = getBaseUrl(new URL(".", import.meta.url));
	_descriptorUrl = `${this._baseUrl}/descriptor.json`;
	async initialize(state?: any) {
		await this._loadDescriptor();
		return super.initialize(state);
	}
    async createAudioNode(initialState?: any) {
        const node = new Node(this.audioContext);
        const inputGainNode = this.audioContext.createGain();
        const outGainNode = this.audioContext.createGain();
        await TemporalAnalyserNode.register(this.audioContext.audioWorklet);
        const analyserNode = new TemporalAnalyserNode(this.audioContext);
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
            },
            windowSize: {
                ...analyserNode.parameters.get("windowSize")
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
            metering: { onChange: (v: number) => node.handleMeteringChanged(v) },
            windowSize: analyserNode.parameters.get("windowSize")
        };
        const paramMgrNode = await ParamMgrFactory.create<Parameters, Parameters>(this, { internalParamsConfig, paramsConfig });
        node.setup(inputGainNode, outGainNode, paramMgrNode, analyserNode);
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
export default LiveGainModule;
