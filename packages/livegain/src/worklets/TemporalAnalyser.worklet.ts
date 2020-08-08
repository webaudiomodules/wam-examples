import { rms, zcr, setTypedArray, absMax } from "../utils/buffer";
import yinEstimate from "../utils/yin";
import { AudioWorkletGlobalScope, TypedAudioParamDescriptor } from "./AudioWorklet";
import { ITemporalAnalyserProcessor, ITemporalAnalyserNode, TemporalAnalyserParameters } from "./TemporalAnalyserWorklet.types";
import AudioWorkletProxyProcessor from "./AudioWorkletProxyProcessor";

const processorID = "__WebAudioModule_LiveGain_TemporalAnalyser";
declare const globalThis: AudioWorkletGlobalScope;
const { registerProcessor, sampleRate } = globalThis;

class TemporalAnalyserProcessor extends AudioWorkletProxyProcessor<ITemporalAnalyserProcessor, ITemporalAnalyserNode, TemporalAnalyserParameters> {
    static get parameterDescriptors(): TypedAudioParamDescriptor<TemporalAnalyserParameters>[] {
        return [{
            defaultValue: 1024,
            maxValue: 2 ** 32,
            minValue: 128,
            name: "windowSize"
        }];
    }
    private destroyed = false;
    /**
     * Concatenated audio data, array of channels
     *
     * @type {Float32Array[]}
     * @memberof TemporalAnalyserProcessor
     */
    private readonly window: Float32Array[] = [];
    /**
     * Next audio sample index to write into window
     *
     * @memberof TemporalAnalyserProcessor
     */
    $ = 0;
    /**
     * Total samples written counter
     *
     * @memberof TemporalAnalyserProcessor
     */
    $total = 0;
    private _windowSize = 1024;
    getRMS() {
        return this.window.map(rms);
    }
    getAbsMax() {
        return this.window.map(absMax);
    }
    getZCR() {
        return this.window.map(zcr);
    }
    getEstimatedFreq(threshold?: number, probabilityThreshold?: number) {
        return this.window.map(ch => yinEstimate(ch, { sampleRate, threshold, probabilityThreshold }));
    }
    getBuffer() {
        const data = this.window;
        const { $, $total } = this;
        return { data, $, $total };
    }
    destroy() {
        this.destroyed = true;
        this.port.close();
    }
    get windowSize() {
        return this._windowSize;
    }
    set windowSize(sizeIn: number) {
        this._windowSize = ~~Math.min(2 ** 32, Math.max(128, sizeIn || 1024));
    }
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<TemporalAnalyserParameters, Float32Array>) {
        if (this.destroyed) return false;
        const input = inputs[0];
        this.windowSize = ~~parameters.windowSize[0];
        const { windowSize } = this;

        if (this.window.length > input.length) { // Too much channels ?
            this.window.splice(input.length);
        }
        if (input.length === 0) return true;

        this.$ %= windowSize;
        const bufferSize = Math.max(...input.map(c => c.length)) || 128;
        this.$total += bufferSize;
        let { $ } = this;
        // Init windows
        for (let i = 0; i < input.length; i++) {
            $ = this.$;
            if (!this.window[i]) { // Initialise channel if not exist
                this.window[i] = new Float32Array(windowSize);
            } else {
                if (this.window[i].length !== windowSize) { // adjust window size if not corresponded
                    const oldWindow = this.window[i];
                    const oldWindowSize = oldWindow.length;
                    const window = new Float32Array(windowSize);
                    $ = setTypedArray(window, oldWindow, 0, $ - Math.min(windowSize, oldWindowSize));
                    this.window[i] = window;
                }
            }
        }
        this.$ = $;
        // Write
        for (let i = 0; i < input.length; i++) {
            const window = this.window[i];
            const channel = input[i].length ? input[i] : new Float32Array(bufferSize);
            $ = this.$;
            if (bufferSize > windowSize) {
                window.set(channel.subarray(bufferSize - windowSize));
                $ = 0;
            } else {
                $ = setTypedArray(window, channel, $);
            }
        }
        this.$ = $;
        return true;
    }
}
registerProcessor(processorID, TemporalAnalyserProcessor);
