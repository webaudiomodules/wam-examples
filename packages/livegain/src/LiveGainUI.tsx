import * as React from "react";
import type { LiveGainPlugin } from "./LiveGainPlugin";

interface PointerDownEvent {
    x: number;
    y: number;
    originalEvent: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent;
}

interface PointerDragEvent {
    prevValue: number;
    x: number;
    y: number;
    fromX: number;
    fromY: number;
    movementX: number;
    movementY: number;
    originalEvent: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent;
}

interface PointerUpEvent {
    x: number;
    y: number;
    originalEvent: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent;
}

export default class LiveGainUI extends React.PureComponent<{ plugin: LiveGainPlugin }, { inputBuffer: string }> {
    static defaultSize: [number, number] = [210, 90];
    refCanvas = React.createRef<HTMLCanvasElement>();
    paintScheduled = false;
    $paintRaf = -1;
    state: { inputBuffer: string } = { inputBuffer: "" };
    interactionRect: number[] = [0, 0, 0, 0];
    inTouch = false;
    normLevels: number[] = [];
    maxValues: number[] = [];
    maxTimer: number;
    $changeTimer = -1;
    get canvas() {
        return this.refCanvas.current;
    }
    get ctx() {
        return this.refCanvas.current ? this.refCanvas.current.getContext("2d") : null;
    }
    fullSize(): [number, number] {
        const [width, height] = LiveGainUI.defaultSize;
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
        this.$paintRaf = (-1 * Math.round(Math.abs(60 / this.props.plugin.getParam("frameRate")))) || -1;
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
    get distance() {
        const { max, min, gain } = this.props.plugin.getParams();
        const normalized = (gain - min) / (max - min);
        return normalized || 0;
    }
    get displayValue() {
        return this.props.plugin.getParam("gain").toFixed(2) + " dB";
    }
    get stepsCount() {
        const { max, min, step } = this.props.plugin.getParams();
        return Math.min(Number.MAX_SAFE_INTEGER, Math.floor((max - min) / step));
    }
    paint() {
        const {
            min,
            max,
            orientation: orientationIn
        } = this.props.plugin.getParams();
        const orientation = (["horizontal", "vertical"] as const)[~~orientationIn];
        const { inputBuffer } = this.state;
        const levels = this.props.plugin.audioNode.levels;
        const ctx = this.ctx;
        if (!ctx) return;
        const bgColor = "rgb(40, 40, 40)";
        const coldColor = "rgb(12, 248, 100)";
        const warmColor = "rgb(195, 248, 100)";
        const hotColor = "rgb(255, 193, 10)";
        const overloadColor = "rgb(255, 10, 10)";
        const triBorderColor = "rgba(80, 80, 80, 1)";
        const triColor = "rgba(165, 165, 165, 1)";
        const triOnColor = "rgba(195, 195, 195, 1)";
        const fontFamily = "Arial";
        const fontSize = 10;
        const fontFace = "regular";
        const textColor = "rgba(0, 0, 0, 1)";
        const lineWidth = 0.5;
        const padding = 8;
        const distance = this.distance;
        const displayValue = inputBuffer ? inputBuffer + "_" : this.displayValue;

        const [width, height] = this.fullSize();
        ctx.clearRect(0, 0, width, height);

        this.normLevels = levels.map((v) => {
            if (v <= 0) return Math.max(0, (v - min) / -min);
            return 1 + Math.min(1, v / max);
        });
        if (this.normLevels.length === 0) this.normLevels = [0];
        if (this.normLevels.find((v, i) => typeof this.maxValues[i] === "undefined" || v > this.maxValues[i])) {
            this.maxValues = [...this.normLevels];
            if (this.maxTimer) window.clearTimeout(this.maxTimer);
            this.maxTimer = window.setTimeout(() => {
                this.maxValues = [...this.normLevels];
                this.maxTimer = undefined;
                this.schedulePaint();
            }, 1000);
        } else if (this.normLevels.find((v, i) => v < this.maxValues[i]) && typeof this.maxTimer === "undefined") {
            this.maxTimer = window.setTimeout(() => {
                this.maxValues = [...this.normLevels];
                this.maxTimer = undefined;
                this.schedulePaint();
            }, 1000);
        }

        const channels = this.normLevels.length;
        const meterThick = 8;
        const metersThick = meterThick * (1.5 * channels - 0.5);
        if (orientation === "vertical") {
            const $top = fontSize + padding;
            const $height = height - 2 * (fontSize + padding);
            const clip = max > 0 ? max / (max - min) * $height : 10;

            const warmStop = clip + 1;
            const hotStop = clip;
            const gradient = ctx.createLinearGradient(0, $top + $height, 0, $top);
            gradient.addColorStop(0, coldColor);
            gradient.addColorStop(($height - warmStop) / $height, warmColor);
            gradient.addColorStop(($height - hotStop) / $height, hotColor);
            gradient.addColorStop(1, overloadColor);

            this.interactionRect = [
                0,
                $top,
                width,
                $height
            ];

            const left = (width - metersThick) * 0.5;
            let $left = left;
            const $width = meterThick;
            ctx.fillStyle = bgColor;
            this.normLevels.forEach((v) => {
                if (v < 1) ctx.fillRect($left, $top + warmStop, $width, $height - warmStop);
                if (v < 2) ctx.fillRect($left, $top, $width, hotStop);
                $left += $width * 1.5;
            });
            $left = left;
            ctx.fillStyle = gradient;
            this.normLevels.forEach((v, i) => {
                if (v > 0) {
                    const drawHeight = Math.min(1, v) * ($height - warmStop);
                    ctx.fillRect($left, $top + $height - drawHeight, $width, drawHeight);
                }
                if (v > 1) {
                    const drawHeight = Math.min(1, (v - 1)) * clip;
                    ctx.fillRect($left, $top + hotStop - drawHeight, $width, drawHeight);
                }
                const histMax = this.maxValues[i];
                if (typeof histMax === "number" && histMax > v) {
                    if (histMax <= 1) ctx.fillRect($left, $top + height - histMax * (height - warmStop), $width, 1);
                    else ctx.fillRect($left, $top + Math.max(0, hotStop - (histMax - 1) * clip), $width, 1);
                }
                $left += $width * 1.5;
            });

            ctx.lineWidth = 1;
            ctx.strokeStyle = triBorderColor;
            const triOrigin: [number, number] = [
                (width + metersThick) * 0.5 + lineWidth * 0.5 + 0.5,
                this.interactionRect[1] - this.interactionRect[3] * (1 - distance)
            ];
            ctx.beginPath();
            ctx.moveTo(triOrigin[0], triOrigin[1]);
            ctx.lineTo(triOrigin[0] + 8, triOrigin[1] - 4);
            ctx.lineTo(triOrigin[0] + 8, triOrigin[1] + 4);
            ctx.lineTo(triOrigin[0], triOrigin[1]);
            ctx.stroke();

            ctx.fillStyle = this.inTouch ? triOnColor : triColor;
            ctx.fill();

            ctx.font = `${fontFace === "regular" ? "" : fontFace} ${fontSize}px ${fontFamily}, sans-serif`;
            ctx.textAlign = "center";
            ctx.fillStyle = textColor;
            ctx.fillText(displayValue, width * 0.5, height - 2, width);
        } else {
            const $left = padding;
            const $width = width - 2 * padding;
            const clip = max > 0 ? max / (max - min) * $width : 10;

            const warmStop = $width - clip - 1;
            const hotStop = $width - clip;
            const gradient = ctx.createLinearGradient($left, 0, $left + $width, 0);
            gradient.addColorStop(0, coldColor);
            gradient.addColorStop(warmStop / $width, warmColor);
            gradient.addColorStop(hotStop / $width, hotColor);
            gradient.addColorStop(1, overloadColor);

            this.interactionRect = [
                $left,
                fontSize + padding,
                $width,
                height - 2 * (fontSize + padding)
            ];

            const top = (height - metersThick) * 0.5;
            let $top = top;
            const $height = meterThick;
            ctx.fillStyle = bgColor;
            this.normLevels.forEach((v) => {
                if (v < 1) ctx.fillRect($left, $top, warmStop, $height);
                if (v < 2) ctx.fillRect($left + hotStop, $top, clip, $height);
                $top += $height * 1.5;
            });
            $top = top;
            ctx.fillStyle = gradient;
            this.normLevels.forEach((v, i) => {
                if (v > 0) ctx.fillRect($left, $top, Math.min(1, v) * warmStop, $height);
                if (v > 1) ctx.fillRect($left + hotStop, $top, Math.min(1, (v - 1)) * clip, $height);
                const histMax = this.maxValues[i];
                if (typeof histMax === "number" && histMax > v) {
                    if (histMax <= 1) ctx.fillRect($left + Math.min(warmStop - 1, histMax * warmStop), $top, 1, $height);
                    else ctx.fillRect($left + Math.min(width - 1, hotStop + (histMax - 1) * clip), $top, 1, $height);
                }
                $top += $height * 1.5;
            });

            ctx.lineWidth = 1;
            ctx.strokeStyle = triBorderColor;
            const triOrigin: [number, number] = [
                this.interactionRect[0] + this.interactionRect[2] * distance,
                (height + metersThick) * 0.5 + lineWidth * 0.5 + 2
            ];
            ctx.beginPath();
            ctx.moveTo(triOrigin[0] - 4, triOrigin[1] + 8);
            ctx.lineTo(triOrigin[0], triOrigin[1]);
            ctx.lineTo(triOrigin[0] + 4, triOrigin[1] + 8);
            ctx.lineTo(triOrigin[0] - 4, triOrigin[1] + 8);
            ctx.stroke();

            ctx.fillStyle = this.inTouch ? triOnColor : triColor;
            ctx.fill();

            ctx.font = `${fontFace === "regular" ? "" : fontFace} ${fontSize}px ${fontFamily}, sans-serif`;
            ctx.fillStyle = textColor;
            ctx.textAlign = "left";
            ctx.fillText(displayValue, 4, height - 2, width);
        }
    }
    getValueFromPos(e: PointerDownEvent) {
        const { orientation: orientationIn, min, step: stepIn } = this.props.plugin.getParams();
        const orientation = (["horizontal", "vertical"] as const)[~orientationIn];
        const step = stepIn || 1;
        const totalPixels = orientation === "vertical" ? this.interactionRect[3] : this.interactionRect[2];
        const stepsCount = this.stepsCount;
        const stepPixels = totalPixels / stepsCount;
        const pixels = orientation === "vertical" ? this.interactionRect[3] - (e.y - this.interactionRect[1]) : e.x - this.interactionRect[0];
        let steps = Math.round((pixels / totalPixels || 0) * totalPixels / stepPixels);
        steps = Math.min(stepsCount, Math.max(0, steps));
        return steps * step + min;
    }
    handlePointerDown = (e: PointerDownEvent) => {
        if (
            e.x < this.interactionRect[0]
            || e.x > this.interactionRect[0] + this.interactionRect[2]
            || e.y < this.interactionRect[1]
            || e.y > this.interactionRect[1] + this.interactionRect[3]
        ) return;
        const newValue = this.getValueFromPos(e);
        if (newValue !== this.props.plugin.getParam("gain")) this.setValueToOutput(newValue);
        this.inTouch = true;
    };
    handlePointerDrag = (e: PointerDragEvent) => {
        if (!this.inTouch) return;
        const newValue = this.getValueFromPos(e);
        if (newValue !== this.props.plugin.getParam("gain")) this.setValueToOutput(newValue);
    };
    handlePointerUp = (e: PointerUpEvent) => {
        this.inTouch = false;
    };
    handleKeyDown = (e: React.KeyboardEvent) => {
        if (!this.state.inputBuffer) {
            let addStep = 0;
            if (e.key === "ArrowUp" || e.key === "ArrowRight") addStep = 1;
            if (e.key === "ArrowDown" || e.key === "ArrowLeft") addStep = -1;
            if (addStep !== 0) {
                const newValue = this.toValidValue(this.props.plugin.getParam("gain") + this.props.plugin.getParam("step") * addStep);
                if (newValue !== this.props.plugin.getParam("gain")) this.setValueToOutput(newValue);
            }
        }
        if (e.key.match(/[0-9.-]/)) {
            this.setState({ inputBuffer: this.state.inputBuffer + e.key });
            return;
        }
        if (e.key === "Backspace") {
            this.setState({ inputBuffer: this.state.inputBuffer.slice(0, -1) });
            return;
        }
        if (e.key === "Enter") {
            const newValue = this.toValidValue(+this.state.inputBuffer);
            this.setState({ inputBuffer: "" });
            if (newValue !== this.props.plugin.getParam("gain")) this.setValueToOutput(newValue);
        }
    };
    handleFocusOut = () => {
        if (this.state.inputBuffer) {
            const newValue = this.toValidValue(+this.state.inputBuffer);
            this.setState({ inputBuffer: "" });
            if (newValue !== this.props.plugin.getParam("gain")) this.setValueToOutput(newValue);
        }
    };
    handleKeyUp = (e: React.KeyboardEvent) => {};
    private handleTouchStart = (e: React.TouchEvent) => {
        this.canvas.focus();
        const rect = this.canvas.getBoundingClientRect();
        let prevX = e.touches[0].pageX;
        let prevY = e.touches[0].pageY;
        const fromX = prevX - rect.left;
        const fromY = prevY - rect.top;
        const prevValue = this.props.plugin.getParam("gain");
        this.handlePointerDown({ x: fromX, y: fromY, originalEvent: e });
        const handleTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            const pageX = e.changedTouches[0].pageX;
            const pageY = e.changedTouches[0].pageY;
            const movementX = pageX - prevX;
            const movementY = pageY - prevY;
            prevX = pageX;
            prevY = pageY;
            const x = pageX - rect.left;
            const y = pageY - rect.top;
            this.handlePointerDrag({ prevValue, x, y, fromX, fromY, movementX, movementY, originalEvent: e });
        };
        const handleTouchEnd = (e: TouchEvent) => {
            e.preventDefault();
            const x = e.changedTouches[0].pageX - rect.left;
            const y = e.changedTouches[0].pageY - rect.top;
            this.handlePointerUp({ x, y, originalEvent: e });
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        };
        document.addEventListener("touchmove", handleTouchMove, { passive: false });
        document.addEventListener("touchend", handleTouchEnd, { passive: false });
    };
    handleWheel = (e: React.WheelEvent) => {};
    handleClick = (e: React.MouseEvent) => {};
    private handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        this.canvas.focus();
        const rect = this.canvas.getBoundingClientRect();
        const fromX = e.pageX - rect.left;
        const fromY = e.pageY - rect.top;
        const prevValue = this.props.plugin.getParam("gain");
        this.handlePointerDown({ x: fromX, y: fromY, originalEvent: e });
        const handleMouseMove = (e: MouseEvent) => {
            e.preventDefault();
            const x = e.pageX - rect.left;
            const y = e.pageY - rect.top;
            this.handlePointerDrag({ prevValue, x, y, fromX, fromY, movementX: e.movementX, movementY: e.movementY, originalEvent: e });
        };
        const handleMouseUp = (e: MouseEvent) => {
            e.preventDefault();
            const x = e.pageX - rect.left;
            const y = e.pageY - rect.top;
            this.handlePointerUp({ x, y, originalEvent: e });
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };
    handleMouseOver = (e: React.MouseEvent) => {};
    handleMouseOut = (e: React.MouseEvent) => {};
    handleContextMenu = (e: React.MouseEvent) => {};
    handleFocusIn = (e: React.FocusEvent) => {};
    toValidValue(value: number): number {
        const { min, max, step } = this.props.plugin.getParams();
        const v = Math.min(max, Math.max(min, value));
        return min + Math.floor((v - min) / step) * step;
    }
    setValueToOutput(value: number) {
        this.props.plugin.setParam("gain", value);
        this.scheduleChangeHandler(value);
    }
    changeCallback = (value: number) => {
        this.props.plugin.setParam("gain", value);
        this.$changeTimer = -1;
    };
    scheduleChangeHandler(value: number) {
        if (this.$changeTimer === -1) this.$changeTimer = window.setTimeout(this.changeCallback, this.props.plugin.getParam("speedLim"), value);
    }
    render() {
        const defaultCanvasStyle: React.CSSProperties = { position: "absolute", display: "inline-block" };
        return (
            <canvas
                ref={this.refCanvas}
                style={defaultCanvasStyle}
                tabIndex={1}
                onKeyDown={this.handleKeyDown}
                onKeyUp={this.handleKeyUp}
                onTouchStart={this.handleTouchStart}
                onWheel={this.handleWheel}
                onClick={this.handleClick}
                onMouseDown={this.handleMouseDown}
                onMouseOver={this.handleMouseOver}
                onMouseOut={this.handleMouseOut}
                onContextMenu={this.handleContextMenu}
                onFocus={this.handleFocusIn}
                onBlur={this.handleFocusOut}
            />
        );
    }
}
