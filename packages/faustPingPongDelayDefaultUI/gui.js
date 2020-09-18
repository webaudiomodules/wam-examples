/* eslint-disable no-underscore-dangle */
import { FaustUI } from './faust-ui/index.js';

/**
 * @typedef {import('../sdk/src/api/types').WebAudioModule} WebAudioModule
 */

class FaustDefaultGui extends HTMLElement {
	constructor(faustNode, ui, style) {
		super();
		this.root = this.attachShadow({ mode: 'open' });
		const $style = document.createElement('style');
		$style.innerHTML = style;
		this.root.appendChild($style);
		const $container = document.createElement('div');
		$container.style.margin = '0';
		$container.style.position = 'absolute';
		$container.style.overflow = 'auto';
		$container.style.display = 'flex';
		$container.style.flexDirection = 'column';
		this.faustUI = new FaustUI({
			ui,
			root: $container,
			listenWindowMessage: false,
			listenWindowResize: false,
		});
		this.faustUI.paramChangeByUI = (path, value) => {
			faustNode.setParamValue(path, value);
		};
		faustNode.output_handler = (path, value) => this.faustUI.paramChangeByDSP(path, value);
		$container.style.width = `${this.faustUI.minWidth}px`;
		$container.style.height = `${this.faustUI.minHeight}px`;
		this.root.appendChild($container);
	}

	connectedCallback() {
		this.faustUI.resize();
	}
}

try {
	customElements.define('webaudiomodule-faustdefaultgui', FaustDefaultGui);
// eslint-disable-next-line no-empty
} catch {}

/**
 * A mandatory method if you want a gui for your plugin
 * @param {WebAudioModule} plugin - the plugin instance
 * @returns {Node} - the plugin root node that is inserted in the DOM of the host
 */
const createElement = async (plugin) => {
	const faustNode = plugin.audioNode._output;
	const { ui } = faustNode.json_object;
	const style = await (await fetch(new URL('./faust-ui/index.css', import.meta.url))).text();
	return new FaustDefaultGui(faustNode, ui, style);
};
export default createElement;
