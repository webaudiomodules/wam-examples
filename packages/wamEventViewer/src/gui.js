class WamEventViewerElement extends HTMLElement {
    /**
     * @param {import('./index').default} module
     */
    constructor(module) {
        super();
        this.module = module;
		this.root = this.attachShadow({ mode: 'open' });
		const $style = document.createElement('style');
		$style.innerHTML = `
#log {
    width: 600px;
    height: 400px;
    overflow: auto;
    font-family: monospace;
}
`;
		this.root.appendChild($style);
		const $container = document.createElement('div');
        $container.classList.add('container');
        $container.innerHTML = `
<div id="log"></div>
<button id="clear">Clear</button>
`;
		this.root.appendChild($container);
        /** @type {HTMLDivElement} */
        this.$log = $container.querySelector('#log');
        /** @type {HTMLButtonElement} */
        this.$clear = $container.querySelector('#clear');
        this.$clear.onclick = () => this.$log.innerHTML = "";
        /** @type {(e: CustomEvent<import('../../api/src').WamEvent>) => any} */
        this.handleEvent = (e) => {
            const { type, data } = e.detail;
            const div = document.createElement('div');
            div.textContent = `${type} ${JSON.stringify(data)}`;
            this.$log.appendChild(div);
            this.$log.scrollTo(0, this.$log.scrollHeight);
        };
        module.audioNode.addEventListener('wam-automation', this.handleEvent);
        module.audioNode.addEventListener('wam-info', this.handleEvent);
        module.audioNode.addEventListener('wam-midi', this.handleEvent);
        module.audioNode.addEventListener('wam-mpe', this.handleEvent);
        module.audioNode.addEventListener('wam-osc', this.handleEvent);
        module.audioNode.addEventListener('wam-sysex', this.handleEvent);
        module.audioNode.addEventListener('wam-transport', this.handleEvent);
    }
    destroy() {
        this.module.audioNode.removeEventListener('wam-automation', this.handleEvent);
        this.module.audioNode.removeEventListener('wam-info', this.handleEvent);
        this.module.audioNode.removeEventListener('wam-midi', this.handleEvent);
        this.module.audioNode.removeEventListener('wam-mpe', this.handleEvent);
        this.module.audioNode.removeEventListener('wam-osc', this.handleEvent);
        this.module.audioNode.removeEventListener('wam-sysex', this.handleEvent);
        this.module.audioNode.removeEventListener('wam-transport', this.handleEvent);
    }
}

/**
 * @param {import('./index').default} module
 */
const createElement = (module) => {
    const elementId = 'wam-event-viewer';
    if (!customElements.get(elementId)) {
        customElements.define(elementId, WamEventViewerElement);
    }
    return new WamEventViewerElement(module);
};

export default createElement;
