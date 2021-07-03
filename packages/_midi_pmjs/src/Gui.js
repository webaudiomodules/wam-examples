export class TemplateWamElement extends HTMLElement {
	static is() {
        return 'webaudiomodules-template-midi-pmjs';
    }
    constructor() {
        super();

        /** @type {import('./Node.js').default} */
        this.audioNode = null;

        // Append HTML elements
		this.root = this.attachShadow({ mode: 'open' });
        const html = `
<div id="container" style="position: relative; display: flex; flex-direction: column; height: 20px; width: 80px">
    <input id="setting1" type="number" style="flex: 0 0 auto; margin: 2px" min="-128" max="128" step="1" value="0" />
</div>
`;
        this.root.innerHTML = html;
        const div = this.root.getElementById("container");
        this.setting1Input = this.root.getElementById("setting1");
        this.setting1Input.oninput = e => this.audioNode.setParameterValues({ setting1: { id: 'setting1', value: +e.currentTarget.value, normalized: false } });
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
                const slider = id === 'setting1' ? this.setting1Input : null;
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
