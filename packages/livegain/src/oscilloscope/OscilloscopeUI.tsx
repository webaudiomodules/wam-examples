/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/sort-comp */
/* eslint-disable react/destructuring-assignment */
import * as React from "react";
import Color from "color-js";
import type Module from ".";

export default class OscilloscopeUI extends React.PureComponent<{ module: Module }> {
    static defaultSize: [number, number] = [640, 360];
    refCanvas = React.createRef<HTMLCanvasElement>();
    paintScheduled = false;
    $paintRaf = -1;
    $changeTimer = -1;
    get canvas() {
        return this.refCanvas.current;
    }
    get ctx() {
        return this.refCanvas.current ? this.refCanvas.current.getContext("2d") : null;
    }
    fullSize(): [number, number] {
        const [width, height] = OscilloscopeUI.defaultSize;
        const { canvas, ctx } = this;
        if (!ctx) return [0, 0];
        if (typeof width === "number" && typeof height === "number") {
            if (ctx.canvas.width !== width) ctx.canvas.width = width;
            if (ctx.canvas.height !== height) ctx.canvas.height = height;
            return [width, height];
        }
        const rect = canvas.getBoundingClientRect();
        const w = typeof width === "number" ? width : ~~rect.width;
        const h = typeof height === "number" ? height : ~~rect.height;
        if (ctx.canvas.width !== w) ctx.canvas.width = w;
        if (ctx.canvas.height !== h) ctx.canvas.height = h;
        return [w, h];
    }
    paintCallback = () => {
        this.$paintRaf = (-1 * Math.round(Math.abs(60 / this.props.module.audioNode.getParamValue("frameRate")))) || -1;
        this.paintScheduled = false;
        this.paint();
        this.schedulePaint();
    };
    noPaintCallback = () => {
        this.$paintRaf++;
        this.paintScheduled = false;
        this.schedulePaint();
    };
    schedulePaint = () => {
        if (this.paintScheduled) return;
        if (this.$paintRaf === -1) this.$paintRaf = requestAnimationFrame(this.paintCallback);
        else if (this.$paintRaf < -1) requestAnimationFrame(this.noPaintCallback);
        this.paintScheduled = true;
    };
    componentDidMount() {
        this.schedulePaint();
    }
    componentDidUpdate() {
        this.schedulePaint();
    }
    componentWillUnmount() {
        if (this.paintScheduled) cancelAnimationFrame(this.$paintRaf);
    }
    async paint() {
        const bgColor = "rgb(40, 40, 40)";
        const phosphorColor = "hsl(0, 100%, 85%)";
        const hueOffset = 60;
        const textColor = "#DDDD99";
        const gridColor = "#404040";
        const seperatorColor = "white";
        const range = 1;
        const autoRange = true;
        const stablize = true;
        const {
            interleaved,
            showStats
        } = this.props.module.audioNode._wamNode.getParamsValues();
        const ctx = this.ctx;
        if (!ctx) return;


        const left = 0;
        const bottom = 0;

        const { analyserNode } = this.props.module.audioNode;
        const [buffer, estimatedFreq] = await Promise.all([analyserNode.getBuffer(), analyserNode.getEstimatedFreq()]);
        const { sampleRate } = this.props.module.audioContext;

        // Background
        const [width, height] = this.fullSize();
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        if (!buffer) return;

        const { $: ui8$, data: t } = buffer;
        if (!t || !t.length || !t[0].length) return;

        const $ = ui8$[0];
        const channels = t.length;
        const l = t[0].length;
        // Vertical Range
        let min = -range;
        let max = range;
        let yFactor = range;
        if (autoRange) {
            // Fastest way to get min and max to have: 1. max abs value for y scaling, 2. mean value for zero-crossing
            let i = channels;
            let s = 0;
            while (i--) {
                let j = l;
                while (j--) {
                    s = t[i][j];
                    if (s < min) min = s;
                    else if (s > max) max = s;
                }
            }
            yFactor = Math.max(1, Math.abs(min), Math.abs(max))/* * vzoom*/;
        }
        // Grids
        ctx.strokeStyle = gridColor;
        let vStep = 0.25;
        while (yFactor / 2 / vStep > 2) vStep *= 2; // Minimum horizontal grids in channel one side = 2
        ctx.beginPath();
        ctx.setLineDash([]);
        const gridChannels = interleaved ? channels : 1;
        const channelHeight = (height - bottom) / gridChannels;
        for (let i = 0; i < gridChannels; i++) {
            let y = (i + 0.5) * channelHeight;
            ctx.moveTo(left, y);
            ctx.lineTo(width, y); // 0-line
            for (let j = vStep; j < yFactor; j += vStep) {
                y = (i + 0.5 + j / yFactor / 2) * channelHeight;
                ctx.moveTo(left, y);
                ctx.lineTo(width, y); // below 0
                y = (i + 0.5 - j / yFactor / 2) * channelHeight;
                ctx.moveTo(left, y);
                ctx.lineTo(width, y); // above 0
            }
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.setLineDash([4, 2]);
        ctx.strokeStyle = seperatorColor;
        for (let i = 1; i < gridChannels; i++) {
            ctx.moveTo(left, i * channelHeight);
            ctx.lineTo(width, i * channelHeight);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineWidth = 2;
        const channelColor: string[] = [];
        for (let i = 0; i < channels; i++) {
            // Horizontal Range
            let $0 = 0; // Draw start
            let $1 = l; // Draw End
            let $zerox = 0; // First Zero-crossing
            let drawL = l; // Length to draw
            if (stablize && l < sampleRate && estimatedFreq[i] && estimatedFreq[i] < sampleRate / 2.5) { // Stablization
                const thresh = (min + max) * 0.5 + 0.001; // the zero-crossing with "offset"
                const period = sampleRate / estimatedFreq[i];
                const times = Math.floor(l / period) - 1;
                while ($zerox < l && t[i][($ + $zerox++) % l] > thresh); // Find first raise
                if ($zerox >= l - 1) { // Found nothing, no stablization
                    $zerox = 0;
                } else {
                    while ($zerox < l && t[i][($ + $zerox++) % l] < thresh); // Find first drop
                    $zerox--;
                    if ($zerox >= l - 1 || $zerox < 0) {
                        $zerox = 0;
                    }
                }
                drawL = times > 0 && isFinite(period) ? ~~Math.min(period * times, l - $zerox) : l - $zerox; // length to draw
            }
            $0 = Math.round($zerox/* + drawL * zoomOffset*/);
            $1 = Math.round($zerox + drawL/* / zoom + drawL * zoomOffset*/);
            const gridX = (width - left) / ($1 - $0);
            const step = Math.max(1, Math.round(1 / gridX));

            ctx.beginPath();
            channelColor[i] = Color(phosphorColor).shiftHue(i * hueOffset).toHSL();
            ctx.strokeStyle = channelColor[i];
            let maxInStep;
            let minInStep;
            for (let j = $0; j < $1; j++) {
                const $j = (j + $) % l;
                const samp = t[i][$j];
                const $step = (j - $0) % step;
                if ($step === 0) {
                    maxInStep = samp;
                    minInStep = samp;
                }
                if ($step !== step - 1) {
                    if ($step !== 0) {
                        if (samp > maxInStep) maxInStep = samp;
                        if (samp < minInStep) minInStep = samp;
                    }
                    continue;
                }
                const x = (j - $0) * gridX + left;
                let y = channelHeight * (+interleaved * i + 0.5 - maxInStep / yFactor * 0.5);
                if (j === $0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                if (minInStep !== maxInStep) {
                    y = channelHeight * (+interleaved * i + 0.5 - minInStep / yFactor * 0.5);
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }
        // Stats
        if (showStats) {
            ctx.font = "bold 12px Consolas, monospace";
            ctx.fillStyle = textColor;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText(yFactor.toFixed(2), 2, 2);
            ctx.textBaseline = "bottom";
            ctx.fillText((-yFactor).toFixed(2), 2, height - 2);
            ctx.textAlign = "right";
            const freqStatY = height - 2 - (estimatedFreq.length - 1) * 14;
            for (let i = 0; i < estimatedFreq.length; i++) {
                const freq = estimatedFreq[i] < sampleRate / 2.5 ? estimatedFreq[i] || NaN : NaN;
                ctx.fillStyle = channelColor[i];
                const y = interleaved ? channelHeight * (i + 1) - 2 : freqStatY + 14 * i;
                ctx.fillText(freq.toFixed(2) + "Hz", width - 2, y);
            }
        }
    }
    render() {
        const defaultCanvasStyle: React.CSSProperties = { position: "relative", display: "inline-block", backgroundColor: "white" };
        return (
            <canvas
                ref={this.refCanvas}
                style={defaultCanvasStyle}
            />
        );
    }
}
