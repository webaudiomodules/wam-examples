/* eslint-disable import/no-duplicates */
import { CompositeAudioNode, ParamMgrNode } from "sdk";
import SpectralAnalyserNode from "../worklets/SpectralAnalyser";
import { Parameters } from ".";

export default class SpectrogramNode extends CompositeAudioNode {
    analyserNode: SpectralAnalyserNode;
    outputGainNode: GainNode;
    _wamNode: ParamMgrNode<Parameters>;
    destroy() {
        if (this.analyserNode) this.analyserNode.destroy();
        super.destroy();
    }
    setup(outputGainNode: GainNode, wamNode: ParamMgrNode<Parameters>, analyserNode: SpectralAnalyserNode) {
        this.outputGainNode = outputGainNode;
        this.analyserNode = analyserNode;
        this.connect(this.outputGainNode);
        this.connect(this.analyserNode);
        this._output = this.outputGainNode;
        this._wamNode = wamNode;
    }
    get gain() {
        return this.outputGainNode.gain;
    }
    getParamValue(name: Parameters) {
        return this._wamNode.getParamValue(name);
    }
    setParamValue(name: Parameters, value: number) {
        return this._wamNode.setParamValue(name, value);
    }
    getParamsValues() {
        return this._wamNode.getParamsValues();
    }
    setParamsValues(values: Partial<Record<Parameters, number>>) {
        return this._wamNode.setParamsValues(values);
    }
}
