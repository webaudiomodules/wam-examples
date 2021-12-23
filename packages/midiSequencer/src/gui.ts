import MidiSequencer from "./index";

class MidiSequencerElement extends HTMLElement {
    module: MidiSequencer;
    root: ShadowRoot;
    $slider: HTMLInputElement;
    $playing: HTMLButtonElement;
    $rewind: HTMLButtonElement;
    $now: HTMLSpanElement;
    $total: HTMLSpanElement;
    $file: HTMLInputElement;
    $loop: HTMLInputElement;
    destroyed: boolean;
    handleAnimationFrame: () => Promise<void>;
    $raf: number;
    constructor(module: MidiSequencer) {
        super();
        this.module = module;
		this.root = this.attachShadow({ mode: "open" });
		const $style = document.createElement("style");
		$style.innerHTML = `
#time {
    font-family: monospace;
}
`;
		this.root.appendChild($style);
		const $container = document.createElement("div");
        $container.classList.add("container");
        $container.innerHTML = `
<div>
    <input type="range" name="slider" id="slider" min="0" max="1" step="0.01">
    <button id="playing">Start</button>
    <button id="rewind">Rewind</button>
    <input type="checkbox" id="loop"><label for="loop">Loop</label>
</div>
<div id="time">
    <span id="now">00:00:00.000</span>
    <span> / </span>
    <span id="total">00:00:00.000</span>
</div>
<input type="file" name="file" id="file" accept=".mid">
`;
		this.root.appendChild($container);
        this.$slider = $container.querySelector<HTMLInputElement>("#slider");
        this.$slider.onchange = () => module.audioNode.goto(+this.$slider.value * module.audioNode.totalDuration);
        this.$playing = $container.querySelector<HTMLButtonElement>("#playing");
        this.$playing.onclick = async () => {
            const { playing } = await module.audioNode.getParameterValues(false, "playing");
            module.audioNode.setParameterValues({ playing: { id: "playing", value: +!playing.value, normalized: false } });
        };
        this.$rewind = $container.querySelector<HTMLButtonElement>("#rewind");
        this.$rewind.onclick = () => {
            module.audioNode.goto(0);
        };
        this.$loop = $container.querySelector<HTMLInputElement>("#loop");
        this.$loop.onchange = () => {
            module.audioNode.setParameterValues({ loop: { id: "loop", value: +this.$loop.checked, normalized: false } });
        };
        this.$now = $container.querySelector<HTMLSpanElement>("#now");
        this.$total = $container.querySelector<HTMLSpanElement>("#total");
        this.$file = $container.querySelector<HTMLInputElement>("#file");
        this.$file.onchange = async () => {
            const file = this.$file.files[0];
            if (!file) return;
            const ab = await file.arrayBuffer();
            module.audioNode.loadFile(new Uint8Array(ab));
        };
        this.destroyed = false;
        this.handleAnimationFrame = async () => {
            const { loop, playing } = await module.audioNode.getParameterValues(false, "loop", "playing");
            let temp = playing.value.toString();
            temp = playing.value ? "Stop" : "Start";
            if (this.$playing.textContent !== temp) this.$playing.textContent = temp;
            if (this.$loop.checked !== !!loop.value) this.$loop.checked = !!loop.value;
            const { timeOffset, totalDuration } = module.audioNode;
            const date = new Date(timeOffset * 1000);
            temp = date.toISOString().substring(11, 23);
            if (this.$now.textContent !== temp) this.$now.textContent = temp;
            temp = ((timeOffset / totalDuration) || 0).toString();
            if (this.$slider.value !== temp && this.root.activeElement !== this.$slider) this.$slider.value = temp;
            date.setTime(totalDuration * 1000);
            temp = date.toISOString().substring(11, 23);
            if (this.$total.textContent !== temp) this.$total.textContent = temp;
            this.$raf = window.requestAnimationFrame(this.handleAnimationFrame);
        };
        this.$raf = window.requestAnimationFrame(this.handleAnimationFrame);
    }
    destroy() {
        window.cancelAnimationFrame(this.$raf);
    }
}

const createElement = (module: MidiSequencer) => {
    const elementId = "midi-sequencer";
    if (!customElements.get(elementId)) {
        customElements.define(elementId, MidiSequencerElement);
    }
    return new MidiSequencerElement(module);
};

export default createElement;
