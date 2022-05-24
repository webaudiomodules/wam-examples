export class TemplateWamElement extends HTMLElement {
	static is() {
        return 'webaudiomodules-template-pmjs';
    }
    constructor() {
        super();

        /** @type {import('./Node.js').default} */
        this.audioNode = null;

        // Append HTML elements
		this.root = this.attachShadow({ mode: 'open' });
        const html = `
<div id="container" style="position: relative; display: flex; flex-direction: column; height: 80px; width: 200px">
    <input id="gain" type="range" style="flex: 1 1 auto; margin: 2px" min="0" max="1" step="0.01" value="0.1" />
    <input id="delay" type="range" style="flex: 1 1 auto; margin: 2px" min="0" max="1" step="0.01" value="0.5" />
</div>
`;
        this.root.innerHTML = html;
        const div = this.root.getElementById("container");
        this.gainInput = this.root.getElementById("gain");
        this.delayInput = this.root.getElementById("delay");
        this.gainInput.oninput = e => this.audioNode.setParameterValues({ gain: { id: 'gain', value: +e.currentTarget.value, normalized: false } });
        this.delayInput.oninput = e => this.audioNode.setParameterValues({ delay: { id: 'delay', value: +e.currentTarget.value, normalized: false } });
        this.root.appendChild(div);

        // Update the sliders each animation frame
        this.handleAnimationFrame = async () => {
            if (!this.isConnected || !this.audioNode) {
                this.raf = window.requestAnimationFrame(this.handleAnimationFrame);
                return;
            }
            const parameterValues = await this.audioNode.getParameterValues();
            Object.values(parameterValues).forEach((data) => {
                const { id, value } = data;
                const slider = id === 'gain' ? this.gainInput : id === 'delay' ? this.delayInput : null;
                if (!slider) return;
                if (+slider.value !== value) slider.value = value;
            });
            this.raf = window.requestAnimationFrame(this.handleAnimationFrame);
        };
    }
    connectedCallback() {
        this.raf = window.requestAnimationFrame(this.handleAnimationFrame);
    }
    disconnectedCallback() {
        window.cancelAnimationFrame(this.raf);
    }
}

if (!customElements.get(TemplateWamElement.is())) {
	customElements.define(TemplateWamElement.is(), TemplateWamElement);
}

/** @param {import('./index.js').default} wam */
export default (wam) => {
    const container = new TemplateWamElement();
    container.audioNode = wam.audioNode;
    return container;
};
