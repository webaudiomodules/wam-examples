/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/sort-comp */
/* eslint-disable react/destructuring-assignment */
import * as React from "react";
import { atodb } from "./utils/math";
import type Module from "./SpectrogramModule";

export default class SpectrogramUI extends React.PureComponent<{ module: Module }> {
    static defaultSize: [number, number] = [640, 360];
    refCanvas = React.createRef<HTMLCanvasElement>();
    paintScheduled = false;
    $paintRaf = -1;
    $changeTimer = -1;
    $lastFrame = -1;
    frames = 1;
    offscreenCtx = document.createElement("canvas").getContext("2d");
    offscreenVRes = 1024;
    get canvas() {
        return this.refCanvas.current;
    }
    get ctx() {
        return this.refCanvas.current ? this.refCanvas.current.getContext("2d") : null;
    }
    fullSize(): [number, number] {
        const [width, height] = SpectrogramUI.defaultSize;
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
        const { offscreenCtx, frames } = this;
        offscreenCtx.canvas.width = frames;
        offscreenCtx.canvas.height = this.offscreenVRes;
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
        const gridColor = "#404040";
        const seperatorColor = "white";
        const { ctx, offscreenCtx, offscreenVRes } = this;
        if (!ctx || !offscreenCtx) return;


        const left = 0;
        const bottom = 0;

        const allAmplitudes = await this.props.module.audioNode.analyserNode.getAllAmplitudes();

        // Background

        const [width, height] = this.fullSize();
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        if (!allAmplitudes) return;
        const { data: f, $totalFrames, fftBins: bins, frames: framesIn, $frame: $frameUi32 } = allAmplitudes;
        if (!f || !f.length || !f[0].length) return;
        const l = f[0].length;
        const channels = f.length;

        // Draw to offscreen canvas
        let frames = this.frames;
        const $lastFrame = $totalFrames[0] - 1;
        const $frame = $frameUi32[0];
        let $frame0 = $frame;
        const $frame1 = $frame0 + framesIn;
        if (frames !== framesIn) {
            offscreenCtx.canvas.width = framesIn;
            this.frames = framesIn;
            frames = framesIn;
        } else if ($lastFrame >= this.$lastFrame) {
            $frame0 = Math.max($frame0, $frame1 - ($lastFrame - this.$lastFrame));
        }
        this.$lastFrame = $lastFrame;
        const osChannelHeight = offscreenVRes / channels;
        const step = Math.max(1, Math.round(bins / osChannelHeight));
        const vGrid = osChannelHeight / bins;
        for (let i = 0; i < f.length; i++) {
            for (let j = $frame0; j < $frame1; j++) {
                let maxInStep;
                offscreenCtx.fillStyle = "black";
                offscreenCtx.fillRect(j % frames, i * osChannelHeight, 1, osChannelHeight);
                for (let k = 0; k < bins; k++) {
                    const samp = atodb(f[i][(k + j * bins) % l]);
                    const $step = k % step;
                    if ($step === 0) maxInStep = samp;
                    if ($step !== step - 1) {
                        if ($step !== 0 && samp > maxInStep) maxInStep = samp;
                        continue;
                    }
                    const normalized = Math.min(1, Math.max(0, (maxInStep + 10) / 100 + 1));
                    if (normalized === 0) continue;
                    const hue = (normalized * 180 + 240) % 360;
                    const lum = normalized * 50;
                    offscreenCtx.fillStyle = `hsl(${hue}, 100%, ${lum}%)`;
                    offscreenCtx.fillRect(j % frames, (bins - k - 1) * vGrid + i * osChannelHeight, 1, Math.max(1, vGrid));
                }
            }
        }
        // Grids
        ctx.strokeStyle = gridColor;
        const vStep = 0.25;
        const hStep = 0.25;
        ctx.beginPath();
        ctx.setLineDash([]);
        const gridChannels = channels;
        const channelHeight = (height - bottom) / gridChannels;
        for (let i = 0; i < gridChannels; i++) {
            for (let j = vStep; j < 1; j += vStep) { // Horizontal lines
                const y = (i + j) * channelHeight;
                ctx.moveTo(left, y);
                ctx.lineTo(width, y);
            }
        }
        for (let i = hStep; i < 1; i += hStep) {
            const x = left + (width - left) * i;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, bottom);
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
        // Horizontal Range
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.imageSmoothingEnabled = false;
        $frame0 = $frame;
        if ($frame1 === frames) {
            ctx.drawImage(offscreenCtx.canvas, 0, 0, frames, offscreenVRes, left, 0, width - left, height - bottom);
        } else {
            const sSplit = frames - $frame0;
            const dSplit = sSplit / frames * (width - left);
            ctx.drawImage(offscreenCtx.canvas, $frame0, 0, sSplit, offscreenVRes, left, 0, dSplit, height - bottom);
            ctx.drawImage(offscreenCtx.canvas, 0, 0, $frame1 - frames - 0.01, offscreenVRes, dSplit + left, 0, width - left - dSplit, height - bottom);
        }
        ctx.restore();
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
