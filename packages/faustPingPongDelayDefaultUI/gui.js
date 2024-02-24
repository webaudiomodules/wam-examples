/* eslint-disable no-underscore-dangle */
import { FaustUI } from './faust-ui/index.js';

/**
 * @typedef {import('../api').WebAudioModule} WebAudioModule
 */

class FaustDefaultGui extends HTMLElement {
	/**
	 * @param {WebAudioModule['audioNode']} wamNode
	 * @param {AudioWorkletNode} faustNode
	 * @param {any} ui
	 * @param {string} style
	 */
	constructor(wamNode, faustNode, ui, style) {
		super();
		this.wamNode = wamNode;
		this.faustNode = faustNode;
		this.root = this.attachShadow({ mode: 'open' });
		const $style = document.createElement('style');
		$style.innerHTML = style;
		this.root.appendChild($style);
		const $container = document.createElement('div');
		$container.style.margin = '0';
		$container.style.position = 'relative';
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
			wamNode.setParameterValues({ [path]: { value } });
		};
		faustNode.output_handler = (path, value) => this.faustUI.paramChangeByDSP(path, value);
		$container.style.width = `${this.faustUI.minWidth}px`;
		$container.style.height = `${this.faustUI.minHeight}px`;
		this.root.appendChild($container);

		window.requestAnimationFrame(this.handleAnimationFrame);
	}

	handleAnimationFrame = async () => {
		const values = await this.wamNode.getParameterValues();
		// eslint-disable-next-line no-restricted-syntax, guard-for-in
		for (const key in values) {
			const { value } = values[key];
			this.faustUI.paramChangeByDSP(key, value);
		}
		window.requestAnimationFrame(this.handleAnimationFrame);
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
 * @param {import('../../../api').WebAudioModule} plugin - the plugin instance
 * @returns {Node} - the plugin root node that is inserted in the DOM of the host
 */
const createElement = async (plugin) => {
	const wamNode = plugin.audioNode;
	const faustNode = wamNode._output;
	const { ui } = faustNode.json_object;
	const style = await (await fetch(new URL('./faust-ui/index.css', import.meta.url))).text();
	/** @type {typeof FaustDefaultGui} */
	const GuiElement = customElements.get('webaudiomodule-faustdefaultgui');
	return new GuiElement(wamNode, faustNode, ui, style);
};
export default createElement;
