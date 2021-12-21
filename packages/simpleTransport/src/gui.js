class SimpleTransportElement extends HTMLElement {
    /**
     * @param {import('./index').default} module
     */
    constructor(module) {
        super();
        this.module = module;
		this.root = this.attachShadow({ mode: 'open' });
		const $style = document.createElement('style');
		$style.innerHTML = `

`;
		this.root.appendChild($style);
		const $container = document.createElement('div');
        $container.classList.add('container');
        $container.innerHTML = module.templateHtmlStr;
		this.root.appendChild($container);
        /** @type {HTMLSelectElement} */
        this.$timeSigNumerator = $container.querySelector('#timeSigNumerator');
        this.$timeSigNumerator.onchange = () => module.audioNode.setParameterValues({ tempo: { id: 'timeSigNumerator', value: +this.$timeSigNumerator.value, normalized: false } });
        /** @type {HTMLSelectElement} */
        this.$timeSigDenominator = $container.querySelector('#timeSigDenominator');
        this.$timeSigDenominator.onchange = () => module.audioNode.setParameterValues({ tempo: { id: 'timeSigDenominator', value: +this.$timeSigDenominator.value, normalized: false } });
        /** @type {HTMLInputElement} */
        this.$tempo = $container.querySelector('#tempo');
        this.$tempo.onchange = () => module.audioNode.setParameterValues({ tempo: { id: 'tempo', value: +this.$tempo.value, normalized: false } });
        /** @type {HTMLSpanElement} */
        this.$bar = $container.querySelector('#bar');
        /** @type {HTMLSpanElement} */
        this.$beat = $container.querySelector('#beat');
        /** @type {HTMLSpanElement} */
        this.$tick = $container.querySelector('#tick');
        /** @type {HTMLButtonElement} */
        this.$playing = $container.querySelector('#playing');
        this.$playing.onclick = async () => {
            const { playing } = await module.audioNode.getParameterValues(false, 'playing');
            module.audioNode.setParameterValues({ playing: { id: 'playing', value: +!playing.value, normalized: false } });
        }
        /** @type {HTMLButtonElement} */
        this.$rewind = $container.querySelector('#rewind');
        this.$rewind.onclick = () => {
            module.audioNode.setTransport(1, 1, 0);
        }
        this.destroyed = false;
        this.handleAnimationFrame = async () => {
            const { timeSigNumerator, timeSigDenominator, tempo, playing } = await module.audioNode.getParameterValues(false, 'timeSigNumerator', 'timeSigDenominator', 'tempo', 'playing');
            let temp = timeSigNumerator.value.toString();
            if (this.$timeSigNumerator.value !== temp) this.$timeSigNumerator.value = temp;
            temp = timeSigDenominator.value.toString();
            if (this.$timeSigDenominator.value !== temp) this.$timeSigDenominator.value = temp;
            temp = tempo.value.toString();
            if (this.$tempo.value !== temp && this.$tempo !== this.root.activeElement) this.$tempo.value = temp;
            temp = playing.value ? 'Stop' : 'Start';
            if (this.$playing.textContent !== temp) this.$playing.textContent = temp;
            const [measure, beat, tick] = module.audioNode.getTransport();
            temp = measure.toString();
            if (this.$bar.textContent !== temp) this.$bar.textContent = temp;
            temp = beat.toString();
            if (this.$beat.textContent !== temp) this.$beat.textContent = temp;
            temp = tick.toString();
            if (this.$tick.textContent !== temp) this.$tick.textContent = temp;
            this.$raf = window.requestAnimationFrame(this.handleAnimationFrame);
        };
        this.$raf = window.requestAnimationFrame(this.handleAnimationFrame);
    }
    destroy() {
        window.cancelAnimationFrame(this.$raf);
    }
}

/**
 * @param {import('./index').default} module
 */
const createElement = (module) => {
    const elementId = 'wam-simple-transport';
    if (!customElements.get(elementId)) {
        customElements.define(elementId, SimpleTransportElement);
    }
    return new SimpleTransportElement(module);
};

export default createElement;
