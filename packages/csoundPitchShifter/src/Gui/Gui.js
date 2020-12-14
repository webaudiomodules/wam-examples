/* eslint-disable class-methods-use-this */
/* eslint-disable camelcase */
// This works when youuse a bundler such as rollup
// If you do no wan to use a bundler, then  look at other examples
// that build in pure JS the syles and html template directly
// in the code...
import style from './Gui.css';
import template from './Gui.template.html';

// https://github.com/g200kg/webaudio-controls/blob/master/webaudio-controls.js
import '../utils/webaudio-controls.js';

import knobImg from './assets/MiniMoog_Main.png';

const getAssetUrl = (asset) => {
	const base = new URL('.', import.meta.url);
	return `${base}${asset}`;
};

// The GUI is a WebComponent. Not mandatory but useful.
// MANDORY : the GUI should be a DOM node. WebComponents are
// practical as they encapsulate everyhing in a shadow dom
export default class CsoundPitchShifterHTMLElement extends HTMLElement {
	// plugin = the same that is passed in the DSP part. It's the instance
	// of the class that extends WebAudioModule. It's an Observable plugin
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
	/*
	updateStatus = (status) => {
		// this.shadowRoot.querySelector('#switch1').value = status;
	} */

	handleAnimationFrame = () => {
		const pitch_shift = this.plugin.audioNode.getParamValue('pitch_shift');
		const formant_shift = this.plugin.audioNode.getParamValue('formant_shift');
		this.shadowRoot.querySelector('#formantknob').value = formant_shift;
		this.shadowRoot.querySelector('#pitchknob').value = pitch_shift;
		window.requestAnimationFrame(this.handleAnimationFrame);
	}

	/**
	 * Change relative URLS to absolute URLs for CSS assets, webaudio controls spritesheets etc.
	 */
	setResources() {
		// Set up the background img & style
		// Setting up the knobs imgs, those are loaded from the assets
		this.root.querySelectorAll('.knob').forEach((knob) => {
			knob.querySelector('webaudio-knob').setAttribute('src', getAssetUrl(knobImg));
		});
	}

	setKnobs() {
		this.shadowRoot
			.querySelector('#formantknob')
			.addEventListener('input', (e) => {
				this.plugin.audioNode.setParamValue('formant_shift', e.target.value);
			});
		this.shadowRoot
			.querySelector('#pitchknob')
			.addEventListener('input', (e) => {
				this.plugin.audioNode.setParamValue('pitch_shift', e.target.value);
			});
	}

	setSwitchListener() {
		// console.log("CsoundPitchShifter : set switch listener");
		// const { plugin } = this;
		// // by default, plugin is disabled
		// plugin.audioNode.setParamsValues({ enabled: 1 });

		// this.shadowRoot
		// 	.querySelector('#switch1')
		// 	.addEventListener('change', function onChange() {
		// 		plugin.audioNode.setParamsValues({ enabled: +!!this.checked });
		// 	});
	}

	// name of the custom HTML element associated
	// with the plugin. Will appear in the DOM if
	// the plugin is visible
	static is() {
		return 'wc-csound-pitch-shifter';
	}
}

if (!customElements.get(CsoundPitchShifterHTMLElement.is())) {
	customElements.define(CsoundPitchShifterHTMLElement.is(), CsoundPitchShifterHTMLElement);
}
