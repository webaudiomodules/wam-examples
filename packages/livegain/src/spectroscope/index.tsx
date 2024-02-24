import { WebAudioModule } from "@webaudiomodules/sdk";
import { ParamMgrFactory, ParametersMappingConfiguratorOptions } from "@webaudiomodules/sdk-parammgr";
import Node from "./SpectroscopeNode";
import SpectralAnalyserNode from "../worklets/SpectralAnalyser";
import { createElement, destroyElement } from "../gui";
import UI from "./SpectroscopeUI";

const getBaseUrl = (relativeUrl: URL) => {
	const baseUrl = relativeUrl.href.substring(0, relativeUrl.href.lastIndexOf("/"));
	return baseUrl;
};

export type Parameters = "frameRate" | "windowSize" | "fftSize" | "fftOverlap" | "windowFunction";
export class SpectroscopeModule extends WebAudioModule<Node> {
	_baseUrl = getBaseUrl(new URL(".", import.meta.url));
	_descriptorUrl = `${this._baseUrl}/descriptor.json`;
	async initialize(state?: any) {
		await this._loadDescriptor();
		return super.initialize(state);
	}
    async createAudioNode(initialState?: any) {
        const node = new Node(this.audioContext);
        const outGainNode = this.audioContext.createGain();
        await SpectralAnalyserNode.register(this.audioContext.audioWorklet);
        const analyserNode = new SpectralAnalyserNode(this.audioContext);
        const paramsConfig: ParametersMappingConfiguratorOptions<Parameters, Parameters>["paramsConfig"] = {
            frameRate: {
                defaultValue: 60,
                minValue: 0,
                maxValue: 60
            },
            windowSize: {
                ...analyserNode.parameters.get("windowSize")
            },
            fftSize: {
                ...analyserNode.parameters.get("fftSize")
            },
            fftOverlap: {
                ...analyserNode.parameters.get("fftOverlap")
            },
            windowFunction: {
                ...analyserNode.parameters.get("windowFunction"),
                type: "choice",
                discreteStep: 1,
                choices: ["blackman", "hamming", "hann", "triangular"]
            }
        };
        const internalParamsConfig: ParametersMappingConfiguratorOptions<Parameters, Parameters>["internalParamsConfig"] = {
            frameRate: {},
            windowSize: analyserNode.parameters.get("windowSize"),
            fftSize: analyserNode.parameters.get("fftSize"),
            fftOverlap: analyserNode.parameters.get("fftOverlap"),
            windowFunction: analyserNode.parameters.get("windowFunction")
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
export default SpectroscopeModule;
