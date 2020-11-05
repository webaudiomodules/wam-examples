// https://github.com/g200kg/webaudio-controls/blob/master/webaudio-controls.js
import '../utils/webaudio-controls.js';

// This works when youuse a bundler such as rollup
// If you do no wan to use a bundler, then  look at other examples
// that build in pure JS the syles and html template directly
// in the code...
let style = `.pedal {
	display: block;
	background-color: #AB2E24;
	width: 120px;
	height: 180px;
	border-radius: 10px;
	position: relative;
	/* bring your own prefixes */
	box-shadow: 4px 5px 6px rgba(0, 0, 0, 0.7),
	inset -2px -2px 5px 0px rgba(0, 0, 0, 0.2),
	inset 3px 1px 1px 4px rgba(255, 255, 255, 0.2),
	1px 0px 1px 0px rgba(0, 0, 0, 0.9),
	0 2px 1px 0 rgba(0, 0, 0, 0.9),
	1px 1px 1px 0px rgba(0, 0, 0, 0.9);
}


#background-image {
	width: 120px;
	height: 180px;
	opacity: 1;
	z-index: -1;
}

.knob,
.switch,
.icon,
.label {
	position: absolute;
	cursor: pointer;
}

.webaudioctrl-tooltip {
	color: #000 !important;
	font-size: 11px !important;
}


#switch1 {
	bottom: 0px;
	right: 28px;
}

#highgain {
	left: 66px;
	top: 70px;
}

#highgain div {
	color: #ffffff;
	font-family: "Verdana";
	font-size: 8px;

}

#midhighgain {
	left: 12px;
	top: 71px;
}

#midhighgain div {
	color: #ffffff;
	font-family: "Verdana";
	font-size: 8px;

}

#midlowgain {
	left: 65px;
	top: 12px;
}

#midlowgain div {
	color: #ffffff;
	font-family: "Verdana";
	font-size: 8px;

}

#lowgain {
	left: 12px;
	top: 12px;
}

#lowgain div {
	color: #ffffff;
	font-family: "Verdana";
	font-size: 8px;

}

#label_413 {
	left: 16px;
	top: 130px;
	color: #ffffff;
	font-family: "Arial Black";
	font-size: 14px;
}



.pedalLabel {
	position: absolute;
	top: 225px;
	font-size: 25px;
	font-family: Sansita;
	/*{font}*/
	text-align: center;
	line-height: 30px;
	/*{pedalfontsize}*/
	width: 150px;
	color: #6B0000;
	/*{fontcolor}*/
}

.knob-label {
	position: absolute;
	font-size: 12px;
	/*{knobfontsize}*/
	line-height: 12px;
	width: 64px;
	max-width: 64px;
	overflow: hidden;
	text-align: center;
	font-family: Sansita;
	/*{font}*/
	color: #6B0000;
	/*{fontcolor}*/
}

#knob1-label {
	top: 84px;
	left: 43px;
}`;
let template = `<div id="wc-quadrafuzz" class="wrapper">
<div class="pedal">
	<img id="background-image">
	<div class="switchCont">
		<webaudio-switch class="switch" id="switch1" height="30" width="60"></webaudio-switch>
	</div>
	<div class="knob" id="highgain">
		<webaudio-knob id="knob4" height="40" width="40" sprites="100" min="0" max="1" step="0.01" value="0.5" midilearn="1" tooltip="High Frequency Gain %.2f"></webaudio-knob>
		<div style="text-align:center">Highgain</div>
	</div>
	<div class="knob" id="midhighgain">
		<webaudio-knob  id="knob3" height="40" width="40" sprites="100" min="0" max="1" step="0.01" value="0.5" midilearn="1" tooltip="Medium - High Frequency Gain %.2f"></webaudio-knob>
		<div style="text-align:center">Midhighgain</div>
	</div>
	<div class="knob" id="midlowgain">
		<webaudio-knob  id="knob2" height="40" width="40" sprites="100" min="0" max="1" step="0.01" value="0.8" midilearn="1" tooltip="Medium - Low Frequency Gain %.2f"></webaudio-knob>
		<div style="text-align:center">Midlowgain</div>
	</div>
	<div class="knob" id="lowgain">
		<webaudio-knob  id="knob1" height="40" width="40" sprites="100" min="0" max="1" step="0.01" value="0.6" midilearn="1" tooltip="Low Frequency Gain %.2f"></webaudio-knob>
		<div style="text-align:center">Lowgain</div>
	</div>
	<div class="label" id="label_413">QuadraFuzz</div>
</div>
</div>
`;


let backgroundImg = './assets/background.png';
let knobImg = './assets/MiniMoog_Main.png';
let switchImg = './assets/switch_1.png';

const getAssetUrl = (asset) => {
	const base = new URL('.', import.meta.url);
	return `${base}${asset}`;
};

// The GUI is a WebComponent. Not mandatory but useful.
// MANDORY : the GUI should be a DOM node. WebComponents are
// practical as they encapsulate everyhing in a shadow dom
export default class QuadrafuzzHTMLElement extends HTMLElement {
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

	updateStatus = (status) => {
		this.shadowRoot.querySelector('#switch1').value = status;
	}

	handleAnimationFrame = () => {
		const {
			lowGain,
			midLowGain,
			midHighGain,
			highGain,
			enabled,
		} = this.plugin.audioNode.getParamsValues();
		this.shadowRoot.querySelector('#knob1').value = lowGain;
		this.shadowRoot.querySelector('#knob2').value = midLowGain;
		this.shadowRoot.querySelector('#knob3').value = midHighGain;
		this.shadowRoot.querySelector('#knob4').value = highGain;
		this.shadowRoot.querySelector('#switch1').value = enabled;
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
				this.plugin.audioNode.setParamsValues({ lowGain: e.target.value});
			});
		this.shadowRoot
			.querySelector('#knob2')
			.addEventListener('input', (e) => {
				this.plugin.audioNode.setParamsValues({ midLowGain: e.target.value});
			});
			this.shadowRoot
			.querySelector('#knob3')
			.addEventListener('input', (e) => {
				this.plugin.audioNode.setParamsValues({ midHighGain: e.target.value });
			});
			this.shadowRoot
			.querySelector('#knob4')
			.addEventListener('input', (e) => {
				this.plugin.audioNode.setParamsValues({ highGain: e.target.value });
			});
	}

	setSwitchListener() {
		console.log("Quadrafuzz : set switch listener");
		const { plugin } = this;
		// by default, plugin is disabled
		plugin.audioNode.setParamsValues({ enabled: 1 });

		this.shadowRoot
			.querySelector('#switch1')
			.addEventListener('change', function onChange() {
				plugin.audioNode.setParamsValues({ enabled: +!!this.checked });
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
