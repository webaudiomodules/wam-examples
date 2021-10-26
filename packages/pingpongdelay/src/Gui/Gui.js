// This works when youuse a bundler such as rollup
// If you do no wan to use a bundler, then  look at other examples
// that build in pure JS the syles and html template directly
// in the code...
import style from './Gui.css';
import template from './Gui.template.html';
import './utils/webaudio-controls.js';

import knobImg from './assets/nux_black_white_stripe.png';
import switchImg from './assets/switch_1.png';

const getAssetUrl = (asset) => {
	const base = new URL('.', import.meta.url);
	return `${base}${asset}`;
};

// The GUI is a WebComponent. Not mandatory but useful.
// MANDORY : the GUI should be a DOM node. WebComponents are
// practical as they encapsulate everyhing in a shadow dom
export default class PingPongDelayHTMLElement extends HTMLElement {
	/**
	 * plugin = the same that is passed in the DSP part. It's the instance
	 * of the class that extends WebAudioModule. It's an Observable plugin
	 * @param {import('@webaudiomodules/sdk').WebAudioModule<import('../Node').default>} plugin
	 * @memberof PingPongDelayHTMLElement
	 */
	constructor(plugin) {
		super();

		this.root = this.attachShadow({ mode: 'open' });
		this.root.innerHTML = `<style>${style}</style>${template}`;

		// MANDATORY for the GUI to observe the plugin state
		this.plugin = plugin;

		this.setResources();
		this.setKnobs();
		this.setSwitchListener();
	}

	handleAnimationFrame = () => {
		const {
			feedback,
			mix,
			time,
			enabled,
		} = this.plugin.audioNode.paramMgr.getParamsValues();
		this.shadowRoot.querySelector('#knob1').value = feedback * 100;
		this.shadowRoot.querySelector('#knob2').value = time * 100;
		this.shadowRoot.querySelector('#knob3').value = mix * 100;
		this.shadowRoot.querySelector('#switch1').value = enabled;
		window.requestAnimationFrame(this.handleAnimationFrame);
	}

	// Provided by the WebComponent API, called when the plugin is
	// connected to the DOM
	connectedCallback() {
		window.requestAnimationFrame(this.handleAnimationFrame);
	}

	/**
	 * Change relative URLS to absolute URLs for CSS assets, webaudio controls spritesheets etc.
	 */
	setResources() {
		// Set up the background img & style
		// Setting up the knobs imgs, those are loaded from the assets
		this.root.querySelectorAll('.knob').forEach((knob) => {
			knob.setAttribute('src', getAssetUrl(knobImg));
		});
		this.root.querySelectorAll('.switch').forEach((sw) => {
			sw.setAttribute('src', getAssetUrl(switchImg));
		});
	}

	setKnobs() {
		this.shadowRoot
			.querySelector('#knob1')
			.addEventListener('input', (e) => {
				if (this.plugin.audioContext.state === 'suspended') this.plugin.audioNode.paramMgr.setParamValue('feedback', e.target.value / 100);
				else this.plugin.audioNode.paramMgr.setParamTargetAtTime('feedback', e.target.value / 100, this.plugin.audioContext.currentTime, 0.01);
			});
		this.shadowRoot
			.querySelector('#knob2')
			.addEventListener('input', (e) => {
				if (this.plugin.audioContext.state === 'suspended') this.plugin.audioNode.paramMgr.setParamValue('time', e.target.value / 100);
				else this.plugin.audioNode.paramMgr.setParamTargetAtTime('time', e.target.value / 100, this.plugin.audioContext.currentTime, 0.01);
			});
		this.shadowRoot
			.querySelector('#knob3')
			.addEventListener('input', (e) => {
				if (this.plugin.audioContext.state === 'suspended') this.plugin.audioNode.paramMgr.setParamValue('mix', e.target.value / 100);
				else this.plugin.audioNode.paramMgr.setParamTargetAtTime('mix', e.target.value / 100, this.plugin.audioContext.currentTime, 0.01);
			});
	}

	setSwitchListener() {
		const { plugin } = this;
		this.shadowRoot
			.querySelector('#switch1')
			.addEventListener('change', function onChange() {
				plugin.audioNode.paramMgr.setParamValue('enabled', +!!this.checked);
			});
	}

	// name of the custom HTML element associated
	// with the plugin. Will appear in the DOM if
	// the plugin is visible
	static is() {
		return 'wasabi-pingpongdelay';
	}
}

if (!customElements.get(PingPongDelayHTMLElement.is())) {
	customElements.define(PingPongDelayHTMLElement.is(), PingPongDelayHTMLElement);
}
