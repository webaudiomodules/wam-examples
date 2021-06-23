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
<p>MidiOut : <select id="midiout"><option></option></select></p>

<p>Program Change: <webaudio-slider id="prog" min="0" max="127" width="256" direction="horz" valuetip="0"></webaudio-slider></p>
<p><span id="timbrename"></span></p>

<p>Volume : <webaudio-knob id="volume" min="0" max="127" value="100" diameter="64"></webaudio-knob></p>

<webaudio-keyboard id="keyboard" min="36" keys="37" width="800" height="150"></webaudio-keyboard>
</div>
`;

const getAssetUrl = (asset) => {
	const base = new URL('.', import.meta.url);
	return `${base}${asset}`;
};

// The GUI is a WebComponent. Not mandatory but useful.
// MANDORY : the GUI should be a DOM node. WebComponents are
// practical as they encapsulate everyhing in a shadow dom
export default class MidiVirtualKeyboardNoSoundHTMLElement extends HTMLElement {
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

		this.midioutputs = [null];
		this.midiout = null;
		this.kbd = null;
		this.synth = null;
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
		/*
		this.synth = document.createElement("webaudio-tinysynth");
		this.synth.id = "synth";
		this.shadowRoot.append(this.synth);
		*/
	}

	async setKnobs() {
		if (navigator.requestMIDIAccess)
			navigator
				.requestMIDIAccess({
					sysex: false,
				})
				.then(this.scb, this.ecb);

		this.kbd = this.shadowRoot.querySelector('#keyboard');

		this.shadowRoot
			.querySelector('#midiout')
			.addEventListener('change', (e) => {
				this.midiout = this.midioutputs[
					this.shadowRoot.querySelector('#midiout').selectedIndex
				];
			});
		this.kbd.addEventListener('change', (e) => {
			this.sendMidiMessage([0x90, e.note[1], e.note[0] ? 100 : 0]);
		});

		this.shadowRoot
			.querySelector('#prog')
			.addEventListener('input', (e) => {
				//this.displayTimbreName(e.target.value);
				this.sendMidiMessage([0xc0, e.target.value]);
			});

		this.shadowRoot
			.querySelector('#volume')
			.addEventListener('change', (e) => {
				this.sendMidiMessage([0xb0, 7, e.target.value]);
			});
	}

	ecb(e) {
		console.log(e);
	}

	scb(midiaccess) {
		var i = 0;
		var outputs = midiaccess.outputs.values();
		// populate midi out device menu
		for (var outit = outputs.next(); !outit.done; outit = outputs.next()) {
			this.shadowRoot.querySelector('#midiout').options[i++] = new Option(
				outit.value.name
			);
			this.midioutputs.push(outit.value);
		}
		if(this.midiout.length !== 0)
			this.midiout = this.midioutputs[0];
	}


	sendMidiMessage(mess) {
		// send message to wam env
		this.plugin.audioNode._wamNode.emitEvents({ type: 'wam-midi', time: this.plugin.audioContext.currentTime, data: { bytes: mess } });
		// send message to external midi devices
		if (this.midiout) this.midiout.send(mess);
	}

	setSwitchListener() {
	}

	// name of the custom HTML element associated
	// with the plugin. Will appear in the DOM if
	// the plugin is visible
	static is() {
		return 'wasabi-midivirtualkeyboard-no-sound';
	}
}

if (!customElements.get(MidiVirtualKeyboardNoSoundHTMLElement.is())) {
	customElements.define(
		MidiVirtualKeyboardNoSoundHTMLElement.is(),
		MidiVirtualKeyboardNoSoundHTMLElement
	);
}
