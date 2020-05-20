/* eslint-disable import/no-duplicates */
import { CompositeAudioNode } from "sdk";
import { TemporalAnalyserRegister, TemporalAnalyserNode } from "./TemporalAnalyser";
import type { LiveGainPlugin } from "./LiveGainPlugin";
import { atodb, dbtoa } from "./math";

export default class LiveGainNode extends CompositeAudioNode {
    temporalAnalyserNode: TemporalAnalyserNode;
    private _plugin: LiveGainPlugin;
    private _metering: "preFader" | "postFader" = "postFader";
    private _requestTimer = -1;
    levels: number[] = [];
    constructor(audioContext: BaseAudioContext, options: { plugin: LiveGainPlugin }) {
        super(audioContext);
        const { plugin } = options;
        this._plugin = plugin;
    }
    handleMeteringChanged = (v: number) => {
        if (["postFader", "preFader"][~~v] !== this._metering) {
            if (this._metering === "preFader") {
                this._output.disconnect(this.temporalAnalyserNode);
                this._input.connect(this.temporalAnalyserNode);
            } else {
                this._input.disconnect(this.temporalAnalyserNode);
                this._output.connect(this.temporalAnalyserNode);
            }
        }
    };
    handleGainChanged = (v: number) => {
        this.gain.cancelScheduledValues(this.context.currentTime);
        this.gain.setValueAtTime(this.gain.value, this.context.currentTime);
        this.gain.linearRampToValueAtTime(dbtoa(v), this.context.currentTime + 0.01);
    };
    handleDestroy = () => {
        window.clearTimeout(this._requestTimer);
        if (this.temporalAnalyserNode) this.temporalAnalyserNode.destroy();
    };
    startRequest = () => {
        let lastResult: number[] = [];
        const request = async () => {
            if (this._plugin.initialized && this.temporalAnalyserNode && !this.temporalAnalyserNode.destroyed) {
                const { rms } = await this.temporalAnalyserNode.gets({ rms: true });
                const thresh = 1;
                const levels = rms.map(v => atodb(v));
                if (!lastResult.every((v, i) => v === levels[i] || Math.abs(v - levels[i]) < thresh) || lastResult.length !== levels.length) {
                    this.levels = levels;
                    lastResult = levels;
                }
            }
            scheduleRequest();
        };
        const scheduleRequest = () => {
            this._requestTimer = window.setTimeout(request, this._plugin.initialized ? this._plugin.getParam("speedLim") : 16);
        };
        request();
    };
    async createNodes() {
        super.createNodes();
        await TemporalAnalyserRegister.register(this.context.audioWorklet);
        this.temporalAnalyserNode = new TemporalAnalyserNode(this.context);
    }
    connectNodes() {
        super.connectNodes();
        this._input.connect(this._output);
        if (this._metering === "preFader") this._input.connect(this.temporalAnalyserNode);
        else this._output.connect(this.temporalAnalyserNode);
    }
    async setup() {
        await this.createNodes();
        this.connectNodes();
        this.startRequest();
    }
    get gain() {
        return this._output.gain;
    }
    get state() {
        return this._plugin.state;
    }
}
