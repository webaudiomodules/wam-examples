/* eslint-disable import/no-duplicates */
import { CompositeAudioNode } from "sdk";
import { TemporalAnalyserRegister, TemporalAnalyserNode } from "./TemporalAnalyser";
import type { LiveGainPlugin, State, Events } from "./LiveGainPlugin";
import { atodb, dbtoa } from "./math";

export default class LiveGainNode extends CompositeAudioNode {
    temporalAnalyserNode: TemporalAnalyserNode;
    private _plugin: LiveGainPlugin;
    private _metering: "preFader" | "postFader" = "postFader";
    private _requestTimer = -1;
    constructor(audioContext: BaseAudioContext, options: { plugin: LiveGainPlugin; state?: State }) {
        super(audioContext);
        const { plugin, state } = options;
        this._plugin = plugin;
        this._plugin.addEventListener("stateChanged", this.handleStateChanged);
        this._plugin.addEventListener("destroy", this.handleStateChanged);
        if (state && state.metering) this._metering = state.metering;
    }
    handleStateChanged = (e: CustomEvent<Events["stateChanged"]>) => {
        if (e.detail.metering && e.detail.metering !== this._metering) {
            if (this._metering === "preFader") {
                this._output.disconnect(this.temporalAnalyserNode);
                this._input.connect(this.temporalAnalyserNode);
            } else {
                this._input.disconnect(this.temporalAnalyserNode);
                this._output.connect(this.temporalAnalyserNode);
            }
        }
        if (typeof e.detail.value === "number") {
            this.gain.cancelScheduledValues(this.context.currentTime);
            this.gain.setValueAtTime(this.gain.value, this.context.currentTime);
            this.gain.linearRampToValueAtTime(dbtoa(e.detail.value), this.context.currentTime + 0.01);
        }
    };
    handleDestroy = () => {
        window.clearTimeout(this._requestTimer);
        this._plugin.removeEventListener("stateChanged", this.handleStateChanged);
        this._plugin.removeEventListener("destroy", this.handleStateChanged);
        if (this.temporalAnalyserNode) this.temporalAnalyserNode.destroy();
    };
    startRequest = () => {
        let lastResult: number[] = [];
        const request = async () => {
            if (this.temporalAnalyserNode && !this.temporalAnalyserNode.destroyed) {
                const { rms } = await this.temporalAnalyserNode.gets({ rms: true });
                const thresh = 1;
                const levels = rms.map(v => atodb(v));
                if (!lastResult.every((v, i) => v === levels[i] || Math.abs(v - levels[i]) < thresh) || lastResult.length !== levels.length) {
                    this._plugin.setState({ levels });
                    lastResult = levels;
                }
            }
            scheduleRequest();
        };
        const scheduleRequest = () => {
            this._requestTimer = window.setTimeout(request, this.state.speedLim);
        };
        request();
    };
    async createNodes() {
        await super.createNodes();
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
        super.setup();
        this.startRequest();
    }
    get gain() {
        return this._output.gain;
    }
    get state() {
        return this._plugin.state;
    }
}
