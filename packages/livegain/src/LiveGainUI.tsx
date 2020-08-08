/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/sort-comp */
/* eslint-disable react/destructuring-assignment */
import * as React from "react";
import type Module from "./LiveGainModule";

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

export default class LiveGainUI extends React.PureComponent<{ module: Module }, { inputBuffer: string }> {
    static defaultSize: [number, number] = [210, 90];
    refCanvas = React.createRef<HTMLCanvasElement>();
    paintScheduled = false;
    $paintRaf = -1;
    state: { inputBuffer: string } = { inputBuffer: "" };
    interactionRect: number[] = [0, 0, 0, 0];
    inTouch = false;
    levels: number[] = [];
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
    get distance() {
        const { max, min, gain } = this.props.module.audioNode.getParamsValues();
        const normalized = (gain - min) / (max - min);
        return normalized || 0;
    }
    get displayValue() {
        return this.props.module.audioNode.getParamValue("gain").toFixed(2) + " dB";
    }
    get stepsCount() {
        const { max, min, step } = this.props.module.audioNode.getParamsValues();
        return Math.min(Number.MAX_SAFE_INTEGER, Math.floor((max - min) / step));
    }
    paint() {
        const {
            min,
            max,
            orientation: orientationIn
        } = this.props.module.audioNode.getParamsValues();
        const orientation = (["horizontal", "vertical"] as const)[~~orientationIn];
        const { inputBuffer } = this.state;
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
        const getDistance = (state: { value: number; min: number; max: number }) => {
            const { max, min, value } = state;
            const normalized = (Math.max(min, Math.min(max, value)) - min) / (max - min);
            return normalized;
        };
        const displayValue = inputBuffer ? inputBuffer + "_" : this.displayValue;
        const clipValue = 0;

        const [width, height] = this.fullSize();
        ctx.clearRect(0, 0, width, height);

        this.levels = this.props.module.audioNode.levels;

        if (this.levels.length === 0) this.levels = [-Infinity];
        const channels = this.levels.length;
        if (this.levels.find((v, i) => typeof this.maxValues[i] === "undefined" || v > this.maxValues[i])) {
            this.maxValues = [...this.levels];
            if (this.maxTimer) window.clearTimeout(this.maxTimer);
            this.maxTimer = window.setTimeout(() => {
                this.maxValues = [...this.levels];
                this.maxTimer = undefined;
                this.schedulePaint();
            }, 1000);
        } else if (this.levels.find((v, i) => v < this.maxValues[i]) && typeof this.maxTimer === "undefined") {
            this.maxTimer = window.setTimeout(() => {
                this.maxValues = [...this.levels];
                this.maxTimer = undefined;
                this.schedulePaint();
            }, 1000);
        }

        const meterThick = 8;
        const metersThick = (meterThick + 1) * channels - 1;

        ctx.font = `${fontFace === "regular" ? "" : fontFace} ${fontSize}px ${fontFamily}, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = textColor;
        if (orientation === "horizontal") {
            ctx.textAlign = "left";
            ctx.fillText(displayValue, 4, height - 2, width);
        } else {
            ctx.fillText(displayValue, width * 0.5, height - 2, width);
        }
        this.interactionRect = [
            padding,
            fontSize + padding,
            width - 2 * padding,
            height - 2 * (fontSize + padding)
        ];

        ctx.save();
        let $width: number;
        const $height = meterThick;
        if (orientation === "horizontal") {
            $width = this.interactionRect[2];
            ctx.translate(padding, (height - metersThick) * 0.5);
        } else {
            $width = this.interactionRect[3];
            ctx.translate((width - metersThick) * 0.5, height - fontSize - padding);
            ctx.rotate(-Math.PI * 0.5);
        }
        ctx.fillStyle = bgColor;
        if (min >= clipValue || clipValue >= max) {
            const fgColor = overloadColor;
            let $top = 0;
            this.levels.forEach((v) => {
                ctx.fillRect(0, $top, $width, $height);
                $top += $height + 1;
            });
            $top = 0;
            ctx.fillStyle = fgColor;
            this.levels.forEach((v, i) => {
                const distance = getDistance({ value: v, min, max });
                if (distance > 0) ctx.fillRect(0, $top, distance * $width, $height);
                const histMax = this.maxValues[i];
                if (typeof histMax === "number" && histMax > v) {
                    const histDistance = getDistance({ value: histMax, min, max });
                    ctx.fillRect(Math.min($width - 1, histDistance * $width), $top, 1, $height);
                }
                $top += $height + 1;
            });
        } else {
            const clipDistance = getDistance({ value: clipValue, min, max });
            const clip = $width - clipDistance * $width;
            const hotStop = $width - clip;
            const warmStop = hotStop - 1;
            const gradient = ctx.createLinearGradient(0, 0, $width, 0);
            gradient.addColorStop(0, coldColor);
            gradient.addColorStop(warmStop / $width, warmColor);
            gradient.addColorStop(hotStop / $width, hotColor);
            gradient.addColorStop(1, overloadColor);
            let $top = 0;
            this.levels.forEach((v) => {
                ctx.fillRect(0, $top, warmStop, $height);
                ctx.fillRect(hotStop, $top, clip, $height);
                $top += $height + 1;
            });
            $top = 0;
            ctx.fillStyle = gradient;
            this.levels.forEach((v, i) => {
                const distance = getDistance({ value: v, min, max });
                if (distance > 0) ctx.fillRect(0, $top, Math.min(warmStop, distance * $width), $height);
                if (distance > clipDistance) ctx.fillRect(hotStop, $top, Math.min(clip, (distance - clipDistance) * $width), $height);
                const histMax = this.maxValues[i];
                if (typeof histMax === "number" && histMax > v) {
                    const histDistance = getDistance({ value: histMax, min, max });
                    if (histDistance <= clipDistance) ctx.fillRect(histDistance * $width, $top, 1, $height);
                    else ctx.fillRect(Math.min($width - 1, histDistance * $width), $top, 1, $height);
                }
                $top += $height + 1;
            });
        }

        ctx.lineWidth = 1;
        ctx.strokeStyle = triBorderColor;
        const triOrigin: [number, number] = [
            $width * this.distance,
            metersThick + lineWidth
        ];
        ctx.beginPath();
        ctx.moveTo(triOrigin[0], triOrigin[1]);
        ctx.lineTo(triOrigin[0] - 4, triOrigin[1] + 8);
        ctx.lineTo(triOrigin[0] + 4, triOrigin[1] + 8);
        ctx.lineTo(triOrigin[0], triOrigin[1]);
        ctx.stroke();

        ctx.fillStyle = this.inTouch ? triOnColor : triColor;
        ctx.fill();
        ctx.restore();
    }
    getValueFromPos(e: PointerDownEvent) {
        const { orientation: orientationIn, min, step: stepIn } = this.props.module.audioNode.getParamsValues();
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
        if (newValue !== this.props.module.audioNode.getParamValue("gain")) this.setValueToOutput(newValue);
        this.inTouch = true;
    };
    handlePointerDrag = (e: PointerDragEvent) => {
        if (!this.inTouch) return;
        const newValue = this.getValueFromPos(e);
        if (newValue !== this.props.module.audioNode.getParamValue("gain")) this.setValueToOutput(newValue);
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
                const newValue = this.toValidValue(this.props.module.audioNode.getParamValue("gain") + this.props.module.audioNode.getParamValue("step") * addStep);
                if (newValue !== this.props.module.audioNode.getParamValue("gain")) this.setValueToOutput(newValue);
            }
        }
        if (e.key.match(/[0-9.-]/)) {
            this.setState(({ inputBuffer }) => ({ inputBuffer: inputBuffer + e.key }));
            return;
        }
        if (e.key === "Backspace") {
            this.setState(({ inputBuffer }) => ({ inputBuffer: inputBuffer.slice(0, -1) }));
            return;
        }
        if (e.key === "Enter") {
            const newValue = this.toValidValue(+this.state.inputBuffer);
            this.setState({ inputBuffer: "" });
            if (newValue !== this.props.module.audioNode.getParamValue("gain")) this.setValueToOutput(newValue);
        }
    };
    handleFocusOut = () => {
        if (this.state.inputBuffer) {
            const newValue = this.toValidValue(+this.state.inputBuffer);
            this.setState({ inputBuffer: "" });
            if (newValue !== this.props.module.audioNode.getParamValue("gain")) this.setValueToOutput(newValue);
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
        const prevValue = this.props.module.audioNode.getParamValue("gain");
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
        const prevValue = this.props.module.audioNode.getParamValue("gain");
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
        const { min, max, step } = this.props.module.audioNode.getParamsValues();
        const v = Math.min(max, Math.max(min, value));
        return min + Math.floor((v - min) / step) * step;
    }
    setValueToOutput(value: number) {
        this.props.module.audioNode.setParamValue("gain", value);
        this.scheduleChangeHandler(value);
    }
    changeCallback = (value: number) => {
        this.props.module.audioNode.setParamValue("gain", value);
        this.$changeTimer = -1;
    };
    scheduleChangeHandler(value: number) {
        if (this.$changeTimer === -1) this.$changeTimer = window.setTimeout(this.changeCallback, this.props.module.audioNode.getParamValue("speedLim"), value);
    }
    render() {
        const defaultCanvasStyle: React.CSSProperties = { position: "relative", display: "inline-block", backgroundColor: "white" };
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
