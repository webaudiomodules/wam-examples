/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/sort-comp */
/* eslint-disable react/destructuring-assignment */
import * as React from "react";
import Color from "color-js";
import { atodb } from "./utils/math";
import type Module from "./SpectroscopeModule";

export default class SpectroscopeUI extends React.PureComponent<{ module: Module }> {
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
        const [width, height] = SpectroscopeUI.defaultSize;
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
        const fgColor = "hsl(0, 100%, 85%)";
        const hueOffset = 60;
        const gridColor = "#404040";
        const seperatorColor = "white";
        const ctx = this.ctx;
        if (!ctx) return;


        const left = 0;
        const bottom = 0;

        const lastAmplitudes = await this.props.module.audioNode.analyserNode.getLastAmplitudes();

        // Background
        const [width, height] = this.fullSize();
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        if (!lastAmplitudes) return;
        const { data: f } = lastAmplitudes;
        if (!f || !f.length || !f[0].length) return;
        const l = f[0].length;
        const channels = f.length;

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
        ctx.lineWidth = 2;
        const channelColor: string[] = [];
        // Horizontal Range
        const $0 = 0; // Draw start
        const $1 = l; // Draw End
        const gridX = (width - left) / ($1 - $0);
        const step = Math.max(1, Math.round(1 / gridX));
        for (let i = 0; i < f.length; i++) {
            ctx.beginPath();
            channelColor[i] = Color(fgColor).shiftHue(i * hueOffset).toHSL();
            ctx.fillStyle = channelColor[i];
            let maxInStep;
            for (let j = $0; j < $1; j++) {
                const samp = atodb(f[i][j]);
                const $step = (j - $0) % step;
                if ($step === 0) maxInStep = samp;
                if ($step !== step - 1) {
                    if ($step !== 0 && samp > maxInStep) maxInStep = samp;
                    continue;
                }
                const x = (j - $0) * gridX + left;
                const y = channelHeight * (i + 1 - Math.min(1, Math.max(0, maxInStep / 100 + 1)));
                if (j === $0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.lineTo(width, channelHeight * (i + 1));
            ctx.lineTo(left, channelHeight * (i + 1));
            ctx.closePath();
            ctx.fill();
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
