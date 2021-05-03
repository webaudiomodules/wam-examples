// https://github.com/g200kg/webaudio-controls/blob/master/webaudio-controls.js
import '../utils/webaudio-controls.js';

// This works when youuse a bundler such as rollup
// If you do no wan to use a bundler, then  look at other examples
// that build in pure JS the syles and html template directly
// in the code...
let style = `:host {
	display: inline-block;
	background-color: #acf;
	box-shadow: 4px 5px 6px rgba(0, 0, 0, 0.7), inset -2px -2px 5px 0px rgba(0, 0, 0, 0.2), inset 3px 1px 1px 4px rgba(255, 255, 255, 0.2), 1px 0px 1px 0px rgba(0, 0, 0, 0.9), 0 2px 1px 0 rgba(0, 0, 0, 0.9), 1px 1px 1px 0px rgba(0, 0, 0, 0.9);
	border-bottom-left-radius: 8px;
	border-bottom-right-radius: 8px;
	position: relative;
	padding: 5px;
  }
  #top {
	padding-bottom: .3em;
	text-align: right;
  }
  `;
let template = `<div id="top">
</div>
`;

const getAssetUrl = (asset) => {
	const base = new URL('.', import.meta.url);
	return `${base}${asset}`;
};

// The GUI is a WebComponent. Not mandatory but useful.
// MANDORY : the GUI should be a DOM node. WebComponents are
// practical as they encapsulate everyhing in a shadow dom
export default class TinySynthHTMLElement extends HTMLElement {
	// plugin = the same that is passed in the DSP part. It's the instance
	// of the class that extends WebAudioModule. It's an Observable plugin
	constructor(plugin) {
		super();

		this.root = this.attachShadow({
			mode: 'open',
		});
		this.root.innerHTML = `<style>${style}</style>${template}`;

		// MANDATORY for the GUI to observe the plugin state
		this.plugin = plugin;


	}

	connectedCallback() {
		this.setResources();
		this.setKnobs();
		this.setSwitchListener();

		window.requestAnimationFrame(this.handleAnimationFrame);
	}
	updateStatus = (status) => {
		//this.shadowRoot.querySelector('#switch1').value = status;
	};

	handleAnimationFrame = () => {
		const { enabled } = this.plugin.audioNode.getParamsValues();

		window.requestAnimationFrame(this.handleAnimationFrame);
	};

	/**
	 * Change relative URLS to absolute URLs for CSS assets, webaudio controls spritesheets etc.
	 */
	setResources() {

	}

	async setKnobs() {

	}


	setSwitchListener() {

	}

	// name of the custom HTML element associated
	// with the plugin. Will appear in the DOM if
	// the plugin is visible
	static is() {
		return 'wasabi-tinysynth';
	}
}

if (!customElements.get(TinySynthHTMLElement.is())) {
	customElements.define(
		TinySynthHTMLElement.is(),
		TinySynthHTMLElement
	);
}
