/* eslint-disable max-classes-per-file */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */

// https://github.com/g200kg/webaudio-controls/blob/master/webaudio-controls.js
import '../utils/webaudio-controls.js';

class ZigZag {
	constructor(startX, startY, endX, endY, numSegments) {
		this._numSegments = numSegments;
		this._startX = startX;
		this._startY = startY;
		this._endX = endX;
		this._endY = endY;
		this._dX = this._endX - this._startX;
		this._dY = this._endY - this._startY;
		this._slope = this._dY / this._dX;

		const magnitude = Math.sqrt(this._dX ** 2 + this._dY ** 2);
		this._segmentLength = magnitude / this._numSegments;
		this._stepX = this._dX / this._numSegments;
		this._stepY = this._dY / this._numSegments;

		this._X = [];
		this._Y = [];
		for (let i = 1; i < this._numSegments; ++i) {
			this._X.push(this._startX + i * this._stepX);
			this._Y.push(this._startY + i * this._stepY);
		}
	}

	updatePoints(jitter, smoothing) {
		let points = `${this._startX},${this._startY} `;
		const alpha = smoothing;
		const beta = 1.0 - smoothing;
		let sign = this._slope > 0 ? 1 : -1;
		for (let i = 1; i < this._numSegments; ++i) {
			const jitterX = 0.5 * (Math.random() - 0.5) * jitter * this._segmentLength;
			const jitterY = sign * 2.0 * Math.random() * jitter * this._segmentLength;
			const currentX = this._X[i - 1];
			const currentY = this._Y[i - 1];
			const targetX = this._startX + i * this._stepX + jitterX;
			const targetY = this._startY + i * this._stepY + jitterY;

			this._X[i - 1] = alpha * currentX + beta * targetX;
			this._Y[i - 1] = alpha * currentY + beta * targetY;
			sign *= -1;
			points += `${this._X[i - 1]},${this._Y[i - 1]} `;
		}
		points += `${this._endX},${this._endY}`;
		return points;
	}
}

const red = '#F86234';
const yellow = '#F5CB31';
const green = '#A8D149';
const grayDark = '#262626';
const grayLight = '#545454';
const transparent = '#00000000';

// const modeStrings = [
// 	'&#9636',
// 	'&#9637',
// 	'&#9639',
// 	'&#9640',
// 	'&#9641',
// ];

const modeStrings = [
	'1',
	'2',
	'3',
	'4',
	'?',
];

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
	width: 120px;
	height: 180px;
}


.switch,
.icon,
.label {
	position: absolute;
	cursor: pointer;
}

.knob {
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
	left: 46px;
	top: 80px;
}

#drive div {
	color: #ffffff;
	font-family: "Verdana";
	font-size: 8px;;
}

#title {
	left: 30px;
	top: 8px;
	position: absolute;
	margin: auto;
	color: #333333;
	font-family: "Helvetica";
	font-size: 18px;
	font-style: bold;
	text-align: center;
}

.mode {
	opacity: 0;
	cursor: pointer;
	color: ${yellow};
	font-family: "Helvetica";
	font-size: 12px;
	font-style: bold;
	text-align: center;
	user-select: none;
	position: absolute;
	padding: 25px;
	top: 14px;
	z-index: 0;
}

.mode:hover {
	opacity: 1;
}

#leftVoiceMode {
	left: -11px;
	transform: rotate(-22deg);
}

#rightVoiceMode {
	left: 74px;
	transform: rotate(22deg);
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
}

@keyframes green-red-keyframes {
	0% { color: ${green} }
	100% { color: ${red} }
}

#green-red-mixer {
	height: 1px;
	width: 1px;
	animation: green-red-keyframes 1s linear forwards paused;
	background: currentColor;
}
`;

const template = `<div id="wamsdk-wamexample" class="wrapper">
<div class="pedal">
	<svg class="overlay" id="visualization"></svg>
	<img id="background-image">
	<div class="switchCont">
		<webaudio-switch class="switch" id="switch1" height="24" width="48"></webaudio-switch>
	</div>
	<div class="knob" id="drive">
		<webaudio-knob id="knob1" height="26" width="26" sprites="100" min="0" max="1" step="0.01" value="0.5" midilearn="1" tooltip="Drive %.2f"></webaudio-knob>
		<!-- <div style="text-align:center">Drive</div> -->
	</div>
	<div class="mode" id="leftVoiceMode">L</div>
	<div class="mode" id="rightVoiceMode">R</div>
	<div class="label" id="title">PurrBot</div>
  	<div id="green-red-mixer"></div>
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
		this.updateMode('leftVoiceMode');
		this.updateMode('rightVoiceMode');

		this.whiskers = [[], []];

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

	updateMode = async (parameterId, increment = false) => {
		const state = await this.plugin.audioNode.getParameterValues(false, parameterId);
		if (increment) {
			state[parameterId].value = (state[parameterId].value + 1) % 5;
			this.plugin.audioNode.setParameterValues(state);
		}
		const text = modeStrings[state[parameterId].value];
		this.shadowRoot.querySelector(`#${parameterId}`).innerHTML = text;
	}

	handleAnimationFrame = async () => {
		const {
			drive,
			bypass,
		} = await this.plugin.audioNode.getParameterValues();

		this.shadowRoot.querySelector('#knob1').value = drive.value;
		this.shadowRoot.querySelector('#switch1').value = !bypass.value;

		const greenRedMixer = this.shadowRoot.querySelector('#green-red-mixer');
		if (bypass.value) {
			greenRedMixer.style.backgroundColor = grayLight;
		} else {
			greenRedMixer.style = `animation-delay: -${drive.value}s`;
		}
		const driveColor = getComputedStyle(greenRedMixer).backgroundColor;

		const {
			synthLevels,
			effectLevels,
		} = this.plugin.audioNode;

		const minOpacity = 0.333;
		const maxOpacity = 0.85;

		let svg = '';

		// ears
		const earUpperY = 35;
		const earOuterY = 57;
		const earInnerY = 47.5;
		const earUpperX = [12, 107];
		const earOuterX = [8.5, 110];
		const earInnerX = [31, 88];

		// eyes
		const eyeOriginY = 67.5;
		const eyeOriginX = [38, 82];
		const eyeRadius = 10;
		const pupilHeight = 8;
		const laserY = eyeOriginY + 100;

		// whiskers
		const whiskerUpperOuterY = 81;
		const whiskerUpperInnerY = 85;
		const whiskerUpperOuterX = [21, 98];
		const whiskerUpperInnerX = [47, 72];

		const whiskerMiddleOuterY = 100;
		const whiskerMiddleInnerY = 91;
		const whiskerMiddleOuterX = [25, 95];
		const whiskerMiddleInnerX = [46, 72];

		const whiskerLowerOuterY = 113;
		const whiskerLowerInnerY = 98;
		const whiskerLowerOuterX = [34, 86];
		const whiskerLowerInnerX = [50.5, 69];

		const whiskerOpacity0 = Math.min(
			Math.max(effectLevels[0], synthLevels[0]) * (1.0 - 0.4 * drive.value) + minOpacity,
			maxOpacity,
		);
		const whiskerOpacity1 = Math.min(
			Math.max(effectLevels[1], synthLevels[1]) * (1.0 - 0.4 * drive.value) + minOpacity,
			maxOpacity,
		);
		const whiskerOpacity = [whiskerOpacity0, whiskerOpacity1];

		for (let c = 0; c < 2; ++c) {
			const synthLevelA = synthLevels[c];
			const synthLevelB = 1.0 - synthLevelA;
			const effectLevel = effectLevels[c];

			const earOpacity = Math.min(effectLevel + synthLevelA + minOpacity, maxOpacity);
			const earPoints = `${earUpperX[c]},${earUpperY} ${earOuterX[c]},${earOuterY} ${earInnerX[c]},${earInnerY}`;
			svg += `\
				<polygon
					points="${earPoints}"
					style="fill:${transparent};stroke:${yellow};stroke-width:.5;opacity:${earOpacity};z-index:0"
				/>
			`;

			const laserOpacity = Math.min(1.25 * synthLevelA, maxOpacity);
			const eyeOpacity = Math.min(2.0 * effectLevel + 0.5, maxOpacity);

			const laserWidthFactor = Math.max(0.5 + synthLevelB, 0.5);
			const pupilWidth = pupilHeight * Math.min(Math.max(synthLevelB, 0.25), 0.75);
			const laserLeftX = eyeOriginX[c] + eyeRadius * (c % 2 ? -0.5 : -3) * laserWidthFactor;
			const laserRightX = eyeOriginX[c] + eyeRadius * (c % 2 ? 3 : 0.5) * laserWidthFactor;

			const laserPoints = `${eyeOriginX[c]},${eyeOriginY} ${laserLeftX},${laserY} ${laserRightX},${laserY}`;
			svg += `
				<circle
					cx="${eyeOriginX[c]}" cy="${eyeOriginY}" r="${eyeRadius}"
					style="fill:${driveColor};stroke:${yellow};stroke-width:.5;opacity:${eyeOpacity};z-index:-2"
				/>
				<ellipse
					cx="${eyeOriginX[c]}" cy="${eyeOriginY}" rx="${pupilWidth}" ry="${pupilHeight}"
					style="fill:${grayDark};stroke:${grayLight};stroke-width:.5;z-index:-1;"
				/>
				<polygon
					points="${laserPoints}"
					style="fill:${driveColor};stroke:${yellow};stroke-width:.5;opacity:${laserOpacity};z-index:0"
				/>
			`;

			const numSegments = 4;
			if (this.whiskers[c].length === 0) {
				let startX = whiskerUpperOuterX[c];
				let startY = whiskerUpperOuterY;
				let endX = whiskerUpperInnerX[c];
				let endY = whiskerUpperInnerY;
				this.whiskers[c].push(new ZigZag(startX, startY, endX, endY, numSegments));

				startX = whiskerMiddleOuterX[c];
				startY = whiskerMiddleOuterY;
				endX = whiskerMiddleInnerX[c];
				endY = whiskerMiddleInnerY;
				this.whiskers[c].push(new ZigZag(startX, startY, endX, endY, numSegments));

				startX = whiskerLowerOuterX[c];
				startY = whiskerLowerOuterY;
				endX = whiskerLowerInnerX[c];
				endY = whiskerLowerInnerY;
				this.whiskers[c].push(new ZigZag(startX, startY, endX, endY, numSegments));
			}

			const jitter = (0.1 + 0.5 * drive.value) * Math.max(synthLevelA, effectLevel);
			const smoothing = Math.min(0.25, 1.0 - jitter);
			for (let i = 0; i < 3; ++i) {
				const whiskerPoints = this.whiskers[c][i].updatePoints(jitter, smoothing);
				svg += `
					<polyline
						points="${whiskerPoints}"
						style="fill:${transparent};stroke:${yellow};stroke-width:.5;
						opacity:${whiskerOpacity[Math.round(Math.random())]};z-index:-1"
					/>
				`;
			}
		}

		const ledOriginX = 59;
		const ledOriginY = 155;
		const ledRadius = 9;

		svg += `\
			<circle
				cx="${ledOriginX}" cy="${ledOriginY}" r="${ledRadius}"
				style="fill:${driveColor};stroke:${yellow};stroke-width:.5;z-index:-1"
			/>
		`;

		this.shadowRoot.querySelector('#visualization').innerHTML = svg;
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
		const leftVoiceMode = this.shadowRoot.querySelector('#leftVoiceMode');
		leftVoiceMode.addEventListener('click', () => {
			this.updateMode('leftVoiceMode', true);
		});
		const rightVoiceMode = this.shadowRoot.querySelector('#rightVoiceMode');
		rightVoiceMode.addEventListener('click', () => {
			this.updateMode('rightVoiceMode', true);
		});
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
