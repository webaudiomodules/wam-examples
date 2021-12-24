class MidiOutputElement extends HTMLElement {
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
        $container.innerHTML = `<select name="output" id="output"></select>`;
		this.root.appendChild($container);
        /** @type {HTMLSelectElement} */
        this.$output = $container.querySelector('#output');
        this.$output.onchange = () => {
            this.module.disconnectMIDI();
            this.module.connectMIDI(this.$output.value);
        };
        this.defaultSelect = `<option value="-1">None</option>`;
        this.$output.innerHTML = this.defaultSelect;
        module.list.forEach(([id, name]) => {
            const option = document.createElement('option');
            option.value = id;
            option.text = name;
            this.$output.options.add(option);
        });
    }
}

/**
 * @param {import('./index').default} module
 */
const createElement = (module) => {
    const elementId = 'wam-simple-transport';
    if (!customElements.get(elementId)) {
        customElements.define(elementId, MidiOutputElement);
    }
    return new MidiOutputElement(module);
};

export default createElement;
