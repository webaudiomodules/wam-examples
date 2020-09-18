
import { WebAudioModule, ParamMgrFactory } from "sdk";
import { ParametersMappingConfiguratorOptions } from "sdk/src/ParamMgr/types";
import Node from "./SpectrogramNode";
import { SpectralAnalyserNode, register } from "../worklets/SpectralAnalyser";
import { createElement } from "../gui";
import UI from "./SpectrogramUI";

export type Parameters = "frameRate" | "windowSize" | "fftSize" | "fftOverlap" | "windowFunction";
export class SpectrogramModule extends WebAudioModule<Node> {
    static descriptor = {
        name: "Spectrogram",
        vendor: "WebAudioModule"
    };

    async createAudioNode(initialState?: any) {
        const node = new Node(this.audioContext);
        const outGainNode = this.audioContext.createGain();
        await register(this.audioContext.audioWorklet);
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
}
export default SpectrogramModule;
