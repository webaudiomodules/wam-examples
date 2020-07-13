// This works when youuse a bundler such as rollup
// If you do no wan to use a bundler, then  look at other examples
// that build in pure JS the syles and html template directly
// in the code...
import style from './Gui.css';
import template from './Gui.template.html';

// https://github.com/g200kg/webaudio-controls/blob/master/webaudio-controls.js
import '../utils/webaudio-controls.js';

import backgroundImg from './assets/background.png';
import knobImg from './assets/MiniMoog_Main.png';
import switchImg from './assets/switch_1.png';

const getAssetUrl = (asset) => {
	const base = new URL('.', import.meta.url);
	return `${base}${asset}`;
};

// The GUI is a WebComponent. Not mandatory but useful.
// MANDORY : the GUI should be a DOM node. WebComponents are
// practical as they encapsulate everyhing in a shadow dom
export default class QuadrafuzzHTMLElement extends HTMLElement {
	// plugin = the same that is passed in the DSP part. It's the instance
	// of the class that extends WebAudioPlugin. It's an Observable plugin
	constructor(plugin) {
		super();

		this.root = this.attachShadow({ mode: 'open' });
		this.root.innerHTML = `<style>${style}</style>${template}`;

		// MANDATORY for the GUI to observe the plugin state
		this.plugin = plugin;

		this.setResources();
		this.setKnobs();
		this.setSwitchListener();

		window.requestAnimationFrame(this.handleAnimationFrame);
	}

	updateStatus = (status) => {
		this.shadowRoot.querySelector('#switch1').value = status;
	}

	handleAnimationFrame = () => {
		const {
			lowGain,
			midLowGain,
			midHighGain,
			highGain
		} = this.plugin.params;
		this.shadowRoot.querySelector('#knob1').value = lowGain ;
		this.shadowRoot.querySelector('#knob2').value = midLowGain;
		this.shadowRoot.querySelector('#knob3').value = midHighGain ;
		this.shadowRoot.querySelector('#knob4').value = highGain ;
		window.requestAnimationFrame(this.handleAnimationFrame);
	}

	/**
	 * Change relative URLS to absolute URLs for CSS assets, webaudio controls spritesheets etc.
	 */
	setResources() {
		// Set up the background img & style
		const background = this.root.querySelector("img");
		background.src = getAssetUrl(backgroundImg);
		//background.src = bgImage;
		background.style = 'border-radius : 5px;'
		// Setting up the knobs imgs, those are loaded from the assets
		this.root.querySelectorAll(".knob").forEach((knob) => {
			knob.querySelector("webaudio-knob").setAttribute('src', getAssetUrl(knobImg));
		});
		// Setting up the switches imgs, those are loaded from the assets
		this.root.querySelector("webaudio-switch").setAttribute('src', getAssetUrl(switchImg));
	}

	setKnobs() {
		this.shadowRoot
			.querySelector('#knob1')
			.addEventListener('input', (e) => {
				this.plugin.setParams({ lowGain: e.target.value});
			});
		this.shadowRoot
			.querySelector('#knob2')
			.addEventListener('input', (e) => {
				this.plugin.setParams({ midLowGain: e.target.value});
			});
			this.shadowRoot
			.querySelector('#knob3')
			.addEventListener('input', (e) => {
				this.plugin.setParams({ midHighGain: e.target.value });
			});
			this.shadowRoot
			.querySelector('#knob4')
			.addEventListener('input', (e) => {
				this.plugin.setParams({ highGain: e.target.value });
			});
	}

	setSwitchListener() {
		console.log("Quadrafuzz : set switch listener");
		const { plugin } = this;
		// by default, plugin is disabled
		plugin.setParams({ enabled: 0 });

		this.shadowRoot
			.querySelector('#switch1')
			.addEventListener('change', function onChange() {
				plugin.setParams({ enabled: +!!this.checked });
			});
	}

	// name of the custom HTML element associated
	// with the plugin. Will appear in the DOM if
	// the plugin is visible
	static is() {
		return 'wasabi-quadrafuzz';
	}
}

if (!customElements.get(QuadrafuzzHTMLElement.is())) {
	customElements.define(QuadrafuzzHTMLElement.is(), QuadrafuzzHTMLElement);
}
