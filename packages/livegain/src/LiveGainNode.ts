/* eslint-disable import/no-duplicates */
import { CompositeAudioNode, ParamMgrNode } from "sdk";
import { TemporalAnalyserNode } from "./worklets/TemporalAnalyser";
import { atodb, dbtoa } from "./utils/math";
import { Parameters } from "./LiveGainPlugin";

export default class LiveGainNode extends CompositeAudioNode {
    analyserNode: TemporalAnalyserNode;
    inputGainNode: GainNode;
    outputGainNode: GainNode;
    _wamNode: ParamMgrNode<Parameters>;
    private _metering: "preFader" | "postFader" = "postFader";
    private _requestTimer = -1;
    levels: number[] = [];
    handleMeteringChanged = (v: number) => {
        if (["postFader", "preFader"][~~v] !== this._metering) {
            if (this._metering === "preFader") {
                this.outputGainNode.disconnect(this.analyserNode);
                this.inputGainNode.connect(this.analyserNode);
            } else {
                this.inputGainNode.disconnect(this.analyserNode);
                this.outputGainNode.connect(this.analyserNode);
            }
        }
    };
    handleGainChanged = (v: number) => {
        this.gain.cancelScheduledValues(this.context.currentTime);
        this.gain.setValueAtTime(this.gain.value, this.context.currentTime);
        this.gain.linearRampToValueAtTime(dbtoa(v), this.context.currentTime + 0.01);
    };
    destroy() {
        window.clearTimeout(this._requestTimer);
        if (this.analyserNode) this.analyserNode.destroy();
        super.destroy();
    }
    startRequest = () => {
        let lastResult: number[] = [];
        const request = async () => {
            if (this._wamNode.initialized && this.analyserNode && !this.analyserNode.destroyed) {
                const absMax = await this.analyserNode.getAbsMax();
                const thresh = 1;
                const levels = absMax.map(v => atodb(v));
                if (!lastResult.every((v, i) => v === levels[i] || Math.abs(v - levels[i]) < thresh) || lastResult.length !== levels.length) {
                    this.levels = levels;
                    lastResult = levels;
                }
            }
            scheduleRequest();
        };
        const scheduleRequest = () => {
            this._requestTimer = window.setTimeout(request, this._wamNode.initialized ? this._wamNode.getParamValue("speedLim") : 16);
        };
        request();
    };
    connectNodes() {
        this.connect(this.inputGainNode);
        this.inputGainNode.connect(this.outputGainNode);
        if (this._metering === "preFader") this.inputGainNode.connect(this.analyserNode);
        else this.outputGainNode.connect(this.analyserNode);
    }
    setup(inputGainNode: GainNode, outputGainNode: GainNode, wamNode: ParamMgrNode<Parameters>, analyserNode: TemporalAnalyserNode) {
        this.inputGainNode = inputGainNode;
        this.outputGainNode = outputGainNode;
        this.analyserNode = analyserNode;
        this.connectNodes();
        this._output = this.outputGainNode;
        this._wamNode = wamNode;
        this.startRequest();
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
