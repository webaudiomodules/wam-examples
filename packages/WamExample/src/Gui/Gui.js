// https://github.com/g200kg/webaudio-controls/blob/master/webaudio-controls.js
import '../utils/webaudio-controls.js';

/* eslint-disable no-plusplus */

const yellow = '#F5CB31';
const green = '#A8D149';
const grayDark = '#262626';
const grayLight = '#545454';

const style = `.pedal {
	display: block;
	background-color: ${yellow};
	width: 120px;
	height: 180px;
	border-radius: 12px;
	position: relative;
}

#background-image {
	width: 120px;
	height: 180px;
	opacity: 1;
	z-index: -999;
}

.overlay {
	position: absolute;
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
	bottom: 10px;
	right: 36px;
}

#drive {
	left: 47px;
	top: 78px;
}

#drive div {
	color: #ffffff;
	font-family: "Verdana";
	font-size: 8px;
}

#title {
	left: 8px;
	top: 6px;
	color: #333333;
	font-family: "Arial Black";
	font-size: 14px;
}

.pedalLabel {
	position: absolute;
	top: 24px;
	font-size: 24px;
	font-family: Sansita;
	/*{font}*/
	text-align: center;
	line-height: 30px;
	/*{pedalfontsize}*/
	width: 160px;
	color: ${grayDark};
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

const template = `<div id="wamsdk-wamexample" class="wrapper">
<div class="pedal">
	<svg class="overlay" id="eyes"></svg>
	<img id="background-image">
	<div class="switchCont">
		<webaudio-switch class="switch" id="switch1" height="24" width="48"></webaudio-switch>
	</div>
	<div class="knob" id="drive">
		<webaudio-knob id="knob1" height="24" width="24" sprites="100" min="0" max="1" step="0.01" value="0.5" midilearn="1" tooltip="Drive %.2f"></webaudio-knob>
		<!-- <div style="text-align:center">Drive</div> -->
	</div>
	<div class="label" id="title">WamExample</div>
</div>
</div>
`;

const backgroundImg = './assets/background.png';
const knobImg = './assets/MiniMoog_Main.png';
const switchImg = './assets/switch_1.png';

const getAssetUrl = (asset) => {
	const base = new URL('.', import.meta.url);
	return `${base}${asset}`;
};

// The GUI is a WebComponent. Not mandatory but useful.
// MANDORY : the GUI should be a DOM node. WebComponents are
// practical as they encapsulate everyhing in a shadow dom
export default class WamExampleHTMLElement extends HTMLElement {
	// plugin = the same that is passed in the DSP part. It's the instance
	// of the class that extends WebAudioModule. It's an Observable plugin
	constructor(plugin) {
		super();

		this.root = this.attachShadow({ mode: 'open' });
		this.root.innerHTML = `<style>${style}</style>${template}`;

		// MANDATORY for the GUI to observe the plugin state
		/** @property {WebAudioModule} plugin */
		this.plugin = plugin;

		this.setResources();
		this.setKnobs();
		this.setSwitchListener();
		this.setTextListener();

		window.requestAnimationFrame(this.handleAnimationFrame);
	}

	triggerNotes(delayTimeSec) {
		const now = this.plugin.audioContext.getOutputTimestamp().contextTime;
		const time1a = now + delayTimeSec;
		const time1b = time1a + 2.0;
		const chord1a = Math.floor(80 + Math.random() * 10);
		const chord1b = chord1a - 5;
		const velocity1 = Math.floor(1 + Math.random() * 126);

		const time2a = time1a + 1.0;
		const time2b = time1b;
		const chord2a = chord1a - 7;
		const chord2b = chord2a + 17;
		const velocity2 = Math.floor(1 + Math.random() * 126);

		const time3a = time2b;
		const time3b = time3a + 2.0;
		const chord3a = chord1a - 4;
		const chord3b = chord3a + 7;
		const chord3c = chord3a - 8;
		const chord3d = chord3b + 4;
		const velocity3 = Math.floor(1 + Math.random() * 126);

		/**
		 * @type {WamMidiEvent[]}
		 */
		const noteEvents = [
			// start chord1
			{ type: 'midi', data: { bytes: [0x90, chord1a, velocity1] }, time: time1a },
			{ type: 'midi', data: { bytes: [0x90, chord1b, velocity1] }, time: time1a },

			// stop chord1
			{ type: 'midi', data: { bytes: [0x80, chord1a, 0] }, time: time1b },
			{ type: 'midi', data: { bytes: [0x80, chord1b, 0] }, time: time1b },

			// start chord2
			{ type: 'midi', data: { bytes: [0x90, chord2a, velocity2] }, time: time2a },
			{ type: 'midi', data: { bytes: [0x90, chord2b, velocity2] }, time: time2a },

			// stop chord2
			{ type: 'midi', data: { bytes: [0x80, chord2a, 0] }, time: time2b },
			{ type: 'midi', data: { bytes: [0x80, chord2b, 0] }, time: time2b },

			// start chord3
			{ type: 'midi', data: { bytes: [0x90, chord3a, velocity3] }, time: time3a },
			{ type: 'midi', data: { bytes: [0x90, chord3b, velocity3] }, time: time3a },
			{ type: 'midi', data: { bytes: [0x90, chord3c, velocity3] }, time: time3a },
			{ type: 'midi', data: { bytes: [0x90, chord3d, velocity3] }, time: time3a },

			// stop chord3
			{ type: 'midi', data: { bytes: [0x80, chord3a, 0] }, time: time3b },
			{ type: 'midi', data: { bytes: [0x80, chord3b, 0] }, time: time3b },
			{ type: 'midi', data: { bytes: [0x80, chord3c, 0] }, time: time3b },
			{ type: 'midi', data: { bytes: [0x80, chord3d, 0] }, time: time3b },
		];
		noteEvents.sort((a, b) => a.time - b.time);
		this.plugin.audioNode.scheduleEvents(...noteEvents);
	}

	updateStatus = (status) => {
		this.shadowRoot.querySelector('#switch1').value = status;
	}

	handleAnimationFrame = async () => {
		const {
			drive,
			bypass,
		} = await this.plugin.audioNode.getParameterValues();
		this.shadowRoot.querySelector('#knob1').value = drive.value;
		this.shadowRoot.querySelector('#switch1').value = !bypass.value;

		const {
			synthLevels,
			effectLevels,
		} = this.plugin.audioNode;

		const eyeOriginY = 67.5;
		const eyeOriginX0 = 38;
		const eyeOriginX1 = eyeOriginX0 + 44;
		const eyeOriginX = [eyeOriginX0, eyeOriginX1];
		const eyeRadius = 10;
		const pupilHeight = 8;
		const laserY = eyeOriginY + 100;
		const maxOpacity = 0.85;
		let svg = '';
		for (let c = 0; c < 2; ++c) {
			const synthLevelA = synthLevels[c];
			const synthLevelB = 1.0 - synthLevelA;
			const effectLevel = effectLevels[c];

			const laserWidthFactor = Math.max(0.5 + synthLevelB, 0.5);
			const pupilWidth = pupilHeight * Math.min(Math.max(synthLevelB, 0.25), 0.75);
			const laserLeftX = eyeOriginX[c] + eyeRadius * (c % 2 ? -0.5 : -3) * laserWidthFactor;
			const laserRightX = eyeOriginX[c] + eyeRadius * (c % 2 ? 3 : 0.5) * laserWidthFactor;

			const laserPoints = `${eyeOriginX[c]},${eyeOriginY} ${laserLeftX},${laserY} ${laserRightX},${laserY}`;
			const laserOpacity = Math.min(1.25 * synthLevelA, maxOpacity);
			const eyeOpacity = Math.min(2.0 * effectLevel + 0.5, maxOpacity);
			svg += `
				<circle
					cx="${eyeOriginX[c]}" cy="${eyeOriginY}" r="${eyeRadius}"
					style="fill:${green};stroke:${yellow};stroke-width:.5;opacity:${eyeOpacity};z-index:-2"
				/>
				<ellipse
					cx="${eyeOriginX[c]}" cy="${eyeOriginY}" rx="${pupilWidth}" ry="${pupilHeight}"
					style="fill:${grayDark};stroke:${grayLight};stroke-width:.5;z-index:-1;"
				/>
				<polygon
					points="${laserPoints}"
					style="fill:${green};stroke:${yellow};stroke-width:.5;opacity:${laserOpacity};z-index:0"
				/>
			`;
		}
		this.shadowRoot.querySelector('#eyes').innerHTML = svg;
		window.requestAnimationFrame(this.handleAnimationFrame);
	}

	/**
	 * Change relative URLS to absolute URLs for CSS assets, webaudio controls spritesheets etc.
	 */
	setResources() {
		// Set up the background img & style
		const background = this.root.querySelector('img');
		background.src = getAssetUrl(backgroundImg);
		//background.src = bgImage;
		background.style = 'border-radius : 5px;';
		// Setting up the knobs imgs, those are loaded from the assets
		this.root.querySelectorAll('.knob').forEach((knob) => {
			knob.querySelector('webaudio-knob').setAttribute('src', getAssetUrl(knobImg));
		});
		// Setting up the switches imgs, those are loaded from the assets
		this.root.querySelector('webaudio-switch').setAttribute('src', getAssetUrl(switchImg));
	}

	setKnobs() {
		this.shadowRoot
			.querySelector('#knob1')
			.addEventListener('input', (e) => {
				this.plugin.audioNode.setParameterValues({
					drive: {
						id: 'drive',
						value: e.target.value,
						interpolate: true,
					},
				});
			});
	}

	setTextListener() {
		this.shadowRoot
			.querySelector('#title')
			.addEventListener('click', () => { this.triggerNotes(0.1); });
	}

	setSwitchListener() {
		const { plugin } = this;

		plugin.audioNode.setParameterValues({
			bypass: {
				id: 'bypass',
				value: 0,
				interpolate: false,
			},
		});

		this.shadowRoot
			.querySelector('#switch1')
			.addEventListener('change', function onChange() {
				plugin.audioNode.setParameterValues({
					bypass: {
						id: 'bypass',
						value: +!this.checked,
						interpolate: false,
					},
				});
			});
	}

	// name of the custom HTML element associated
	// with the plugin. Will appear in the DOM if
	// the plugin is visible
	static is() {
		return 'wam-example';
	}
}

if (!customElements.get(WamExampleHTMLElement.is())) {
	customElements.define(WamExampleHTMLElement.is(), WamExampleHTMLElement);
}
