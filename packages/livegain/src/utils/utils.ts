/* eslint-disable arrow-body-style */

export const isStringArray = (x: any): x is string[] => Array.isArray(x) && x.every(e => typeof e === "string");
export const isNumberArray = (x: any): x is number[] => Array.isArray(x) && x.every(e => typeof e === "number");

export const stringifyError = (data: any) => {
    if (typeof data === "string") return data;
    if (data instanceof Error) return data.message;
    if (typeof data === "object") return JSON.stringify(data);
    return `${data}`;
};
export const parseToPrimitive = (value: any) => {
    try {
        return JSON.parse(value);
    } catch (e) {
        return value.toString();
    }
};
export const rgbaMax2Css = (maxColor: number[]) => {
    const cssColor = [255, 255, 255, 1] as [number, number, number, number];
    if (Array.isArray(maxColor)) {
        for (let i = 0; i < 3; i++) {
            if (typeof maxColor[i] === "number") cssColor[i] = Math.floor(maxColor[i] * 255);
        }
        if (typeof maxColor[3] === "number") cssColor[3] = maxColor[3];
    }
    return `rgba(${cssColor.join(",")})`;
};
/**
 * Gives OS name as follows:
 * "Windows"    for all versions of Windows,
 * "MacOS"      for all versions of Macintosh OS,
 * "Linux"      for all versions of Linux,
 * "UNIX"       for all other UNIX flavors,
 * "Unknown" indicates failure to detect the OS
 *
 * @returns {"Windows" | "MacOS" | "UNIX" | "Linux" | "Unknown"} OS name
 */
export const detectOS = (): "Windows" | "MacOS" | "UNIX" | "Linux" | "Unknown" => {
    const { appVersion } = navigator;
    if (appVersion.indexOf("Win") !== -1) return "Windows";
    if (appVersion.indexOf("Mac") !== -1) return "MacOS";
    if (appVersion.indexOf("X11") !== -1) return "UNIX";
    if (appVersion.indexOf("Linux") !== -1) return "Linux";
    return "Unknown";
};
export const detectEndianness = () => {
    const uInt32 = new Uint32Array([0x11223344]);
    const uInt8 = new Uint8Array(uInt32.buffer);
    if (uInt8[0] === 0x44) return "le";
    if (uInt8[0] === 0x11) return "be";
    return "Unknown";
};
export const detectBrowserCore = () => {
    if ((window as any).chrome) return "Chromium";
    if ((window as any).InstallTrigger) return "Gecko";
    return "Unknown";
};
export const roundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number | number[]) => {
    const radii = [0, 0, 0, 0];
    if (typeof radius === "number") radii.fill(radius);
    else radius.forEach((v, i) => radii[i] = v);
    ctx.beginPath();
    ctx.moveTo(x + radii[0], y);
    ctx.lineTo(x + width - radii[1], y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radii[1]);
    ctx.lineTo(x + width, y + height - radii[2]);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radii[2], y + height);
    ctx.lineTo(x + radii[3], y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radii[3]);
    ctx.lineTo(x, y + radii[0]);
    ctx.quadraticCurveTo(x, y, x + radii[0], y);
    ctx.closePath();
    ctx.stroke();
};
export const fillRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number | number[]) => {
    const radii = [0, 0, 0, 0];
    if (typeof radius === "number") radii.fill(radius);
    else radius.forEach((v, i) => radii[i] = v);
    ctx.beginPath();
    ctx.moveTo(x + radii[0], y);
    ctx.lineTo(x + width - radii[1], y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radii[1]);
    ctx.lineTo(x + width, y + height - radii[2]);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radii[2], y + height);
    ctx.lineTo(x + radii[3], y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radii[3]);
    ctx.lineTo(x, y + radii[0]);
    ctx.quadraticCurveTo(x, y, x + radii[0], y);
    ctx.closePath();
    ctx.fill();
};
export const selectElementRange = (e: HTMLElement) => {
    const elementIsEditable = (e: HTMLElement): e is HTMLInputElement | HTMLTextAreaElement => !!e.nodeName.match(/^(INPUT|TEXTAREA)$/i);
    const selection = window.getSelection();
    if (elementIsEditable(e)) {
        e.focus();
        e.select();
        return;
    }
    if (selection.setBaseAndExtent) {
        // Safari
        selection.setBaseAndExtent(e, 0, e, e.hasChildNodes() ? 1 : 0);
        return;
    }
    if (selection.addRange && selection.removeAllRanges && document.createRange) {
        // Mozilla or Opera 10.5+
        const range = document.createRange();
        range.selectNodeContents(e);
        selection.removeAllRanges();
        selection.addRange(range);
    }
};
export const selectElementPos = (e: HTMLElement, pos: number) => {
    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(e.childNodes[0], pos);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
};
// eslint-disable-next-line arrow-body-style
export const getPropertyDescriptor = (obj: { [key: string]: any }, key: string): PropertyDescriptor => {
    return Object.getOwnPropertyDescriptor(obj, key) || getPropertyDescriptor(Object.getPrototypeOf(obj), key);
};
export const getPropertyDescriptors = (obj: Function | { [key: string]: any }): PropertyDescriptorMap => {
    if (typeof obj === "function") return Object.getOwnPropertyDescriptors(obj);
    const proto = Object.getPrototypeOf(obj);
    if (obj !== Object.prototype && proto === Object.prototype) return Object.getOwnPropertyDescriptors(obj);
    return Object.assign(proto ? getPropertyDescriptors(proto) : {}, Object.getOwnPropertyDescriptors(obj));
};
