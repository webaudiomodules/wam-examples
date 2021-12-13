/* eslint-disable max-classes-per-file */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */

/** @typedef {import("../../../api").WamMidiEvent} WamMidiEvent */
/** @typedef {import('../types').WebAudioControlsWidget} WebAudioControlsWidget */
/** @typedef {import("../index").default} WamExamplePlugin */


// https://github.com/g200kg/webaudio-controls/blob/master/webaudio-controls.js
import '../../lib/webaudio-controls.js';

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

const orange = '#fcb365';
const yellow = '#ffdb59';
const green = '#bcd977';
const blue = '#b5cfe6';
const pink = '#edd8e8';
const grayDark = '#262626';
const grayLight = '#545454';
const black = '#000000';
const transparent = '#00000000';

const modeStrings = [
	'1',
	'2',
	'3',
	'4',
	'?',
];

function computeStyleForSize(scale) {
	scale = Math.max(scale, 0.0);

	const style = `.pedal {
		display: inline-block;
		background-color: ${blue};
		width: ${16 * scale}vw;
		height: ${24 * scale}vw;
		border-radius: 1vw;
		position: relative;
		text-align: center;
		margin: 0 auto;
		overflow: hidden;
		user-select: none;
	}

	#background-image {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.overlay {
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		z-index: 1;
	}

	.absolute {
		position: absolute;
	}

	.knob,
	.switch,
	.icon,
	.mode,
	.label {
		cursor: pointer;
		margin: 0;
		padding: 0;
		z-index: 1;
	}

	#bypass-control {
		left: 41%;
		top: 81%;
		height: 12%;
		width: 18%;
		opacity: 0;
	}

	#drive-control {
		left: 39%;
		top: 45%;
		height: 14%;
		width: 22%;
		opacity: 0;
	}

	#leftVoiceMode-control {
		left: 10%;
		top: 40%;
		opacity: 0;
	}
	#rightVoiceMode-control {
		left: 80%;
		top: 40%;
		opacity: 0;
	}

	#title-text {
		bottom: 101%;
		margin: 0 auto;
		position: relative;
		color: #333333;
		font-family: "Apple Chancery";
		font-size: ${3 * scale}vw;
		font-weight: bold;
	}

	.mode {
		top: 15.5%;
		padding: 10%;
		margin: 0 auto;
		position: absolute;
		opacity: 0;
		cursor: pointer;
		color: ${pink};
		font-family: "Helvetica";
		font-size: ${1.5 * scale}vw;
		font-style: bold;
		text-align: left;
	}

	.mode:hover {
		opacity: 1;
	}

	#leftVoiceMode-text {
		left: 2.5%;
		transform: rotate(-24deg);
	}

	#rightVoiceMode-text {
		left: 72%;
		transform: rotate(24deg);
	}

	@keyframes drive-color-keyframes {
		0% { color: ${green} }
		60% { color: ${orange} }
		100% { color: ${yellow} }
	}

	#drive-color-mixer {
		height: 1px;
		width: 1px;
		animation: drive-color-keyframes 1s linear forwards paused;
		background: currentColor;
		visibility: hidden;
	}

	polygon,
	polyline,
	ellipse,
	circle {
		stroke-width: ${0.1 * scale}vw;
		vector-effect: non-scaling-stroke;
	}
	`;
	return style;
}

const template = `<div id="wamsdk-wamexample" class="wrapper">
<div class="pedal" id="workspace">
	<svg class="overlay" id="visualization"></svg>

	<img id="background-image">

	<webaudio-knob class="knob absolute" id="leftVoiceMode-control" height="20" width="20" min="0" max="4" step="1" value="4" defvalue="4" midilearn="1"></webaudio-knob>
	<webaudio-knob class="knob absolute" id="rightVoiceMode-control" height="20" width="20" min="0" max="4" step="1" value="4" defvalue="4" midilearn="1"></webaudio-knob>
	<webaudio-knob class="knob absolute" id="drive-control" height="20" width="20" min="0" max="1" step="0.01" value="0.5" defvalue="0.5" midilearn="1"></webaudio-knob>
	<webaudio-switch class="switch absolute" id="bypass-control" midilearn="1" invert="1" value="0" defvalue="0"></webaudio-switch>

	<div class="mode" id="leftVoiceMode-text">L</div>
	<div class="mode" id="rightVoiceMode-text">R</div>
	<div class="label" id="title-text">PurrBot</div>

	<div id="drive-color-mixer"></div>
</div>
</div>
`;

const backgroundImg = './assets/background.svg';

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

	/**
	 * Creates an instance of WamExampleHTMLElement.
	 * @param {WamExamplePlugin} plugin
	 * @param {number} [scale=1.0]
	 */
	constructor(plugin, scale = 1.0) {
		super();

		/** @type {ShadowRoot} */
		this.root = this.attachShadow({ mode: 'open' });

		/** @type {string} */
		const style = computeStyleForSize(scale);
		this.root.innerHTML = `<style>${style}</style>${template}`;

		// MANDATORY for the GUI to observe the plugin state
		/** @type {WamExamplePlugin} */
		this.plugin = plugin;

		/** @type {Record<string, WebAudioControlsWidget>} */
		this._controls = {};

		const parameterIds = ['bypass', 'leftVoiceMode', 'rightVoiceMode', 'drive'];
		parameterIds.forEach((parameterId) => {
			/** @type {WebAudioControlsWidget} */
			const control = this.shadowRoot.querySelector(`#${parameterId}-control`);
			this._controls[parameterId] = control;
		});

		this.setResources();
		this.setKnobListener();
		this.setSwitchListener();
		this.setTextListener();

		this._updatePeriodMs = -1;
		this._timestamp = null;
		this._sleep = (delayMs) => { return new Promise(resolve => { setTimeout(resolve, delayMs) }); };

		this._guiReady = false;

		this.plugin.audioNode.gui = this;
		this._raf = window.requestAnimationFrame(this.handleAnimationFrame);
	}

	triggerNotes(delayTimeSec) {
		const noteMin = 80;
		const noteRange = 10;
		const velocityMin = 70;
		const velocityRange = 30;
		const now = this.plugin.audioContext.currentTime;
		const time1a = now + delayTimeSec;
		const time1b = time1a + 2.0;
		const chord1a = noteMin + Math.floor(Math.random() * noteRange);
		const chord1b = chord1a - 5;
		const velocity1 = velocityMin + Math.floor(Math.random() * velocityRange);

		const time2a = time1a + 1.0;
		const time2b = time1b;
		const chord2a = chord1a - 7;
		const chord2b = chord2a + 17;
		const velocity2 = velocityMin + Math.floor(Math.random() * velocityRange);

		const time3a = time2b;
		const time3b = time3a + 2.0;
		const chord3a = chord1a - 4;
		const chord3b = chord3a + 7;
		const chord3c = chord3a - 8;
		const chord3d = chord3b + 4;
		const velocity3 = velocityMin + Math.floor(Math.random() * velocityRange);

		/** @type {WamMidiEvent[]} */
		const noteEvents = [
			// start chord1
			{ type: 'wam-midi', data: { bytes: [0x90, chord1a, velocity1] }, time: time1a },
			{ type: 'wam-midi', data: { bytes: [0x90, chord1b, velocity1] }, time: time1a },

			// stop chord1
			{ type: 'wam-midi', data: { bytes: [0x80, chord1a, 0] }, time: time1b },
			{ type: 'wam-midi', data: { bytes: [0x80, chord1b, 0] }, time: time1b },

			// start chord2
			{ type: 'wam-midi', data: { bytes: [0x90, chord2a, velocity2] }, time: time2a },
			{ type: 'wam-midi', data: { bytes: [0x90, chord2b, velocity2] }, time: time2a },

			// stop chord2
			{ type: 'wam-midi', data: { bytes: [0x80, chord2a, 0] }, time: time2b },
			{ type: 'wam-midi', data: { bytes: [0x80, chord2b, 0] }, time: time2b },

			// start chord3
			{ type: 'wam-midi', data: { bytes: [0x90, chord3a, velocity3] }, time: time3a },
			{ type: 'wam-midi', data: { bytes: [0x90, chord3b, velocity3] }, time: time3a },
			{ type: 'wam-midi', data: { bytes: [0x90, chord3c, velocity3] }, time: time3a },
			{ type: 'wam-midi', data: { bytes: [0x90, chord3d, velocity3] }, time: time3a },

			// stop chord3
			{ type: 'wam-midi', data: { bytes: [0x80, chord3a, 0] }, time: time3b },
			{ type: 'wam-midi', data: { bytes: [0x80, chord3b, 0] }, time: time3b },
			{ type: 'wam-midi', data: { bytes: [0x80, chord3c, 0] }, time: time3b },
			{ type: 'wam-midi', data: { bytes: [0x80, chord3d, 0] }, time: time3b },
		];
		noteEvents.sort((a, b) => a.time - b.time);
		this.plugin.audioNode.scheduleEvents(...noteEvents);
	}

	updateMode = (parameterId, increment = false) => {
		this._controls[parameterId].value = Math.floor(this._controls[parameterId].value);
		if (increment) this._controls[parameterId].value = (this._controls[parameterId].value + 1) % 5;
		const text = modeStrings[this._controls[parameterId].value];
		this.shadowRoot.querySelector(`#${parameterId}-text`).innerHTML = text;
	}

	handleAnimationFrame = async (timestamp) => {
		if (!this._raf) return;
		if (!this._guiReady) {
			const workspace = this.shadowRoot.querySelector('#workspace');
			const computedStyle = getComputedStyle(workspace);
			const workspaceWidth = parseFloat(computedStyle.getPropertyValue('width').replace('px', ''));
			const workspaceHeight = parseFloat(computedStyle.getPropertyValue('height').replace('px', ''));

			// ears
			this._earUpperY = 0.196 * workspaceHeight;
			this._earOuterY = 0.313 * workspaceHeight;
			this._earInnerY = 0.263 * workspaceHeight;
			this._earUpperX = [0.112 * workspaceWidth, 0.888 * workspaceWidth];
			this._earOuterX = [0.087 * workspaceWidth, 0.913 * workspaceWidth];
			this._earInnerX = [0.262 * workspaceWidth, 0.738 * workspaceWidth];

			// eyes
			this._eyeOriginY = 0.375 * workspaceHeight;
			this._eyeOriginX = [0.315 * workspaceWidth, 0.685 * workspaceWidth];
			this._eyeRadius = 0.085 * workspaceWidth;
			this._pupilHeight = 0.067 * workspaceWidth;
			this._laserY = this._eyeOriginY + 0.596 * workspaceHeight;

			// whiskers
			this._whiskerUpperOuterY = 0.451 * workspaceHeight;
			this._whiskerUpperInnerY = 0.474 * workspaceHeight;
			this._whiskerUpperOuterX = [0.185 * workspaceWidth, 0.815 * workspaceWidth];
			this._whiskerUpperInnerX = [0.405 * workspaceWidth, 0.595 * workspaceWidth];

			this._whiskerMiddleOuterY = 0.556 * workspaceHeight;
			this._whiskerMiddleInnerY = 0.508 * workspaceHeight;
			this._whiskerMiddleOuterX = [0.212 * workspaceWidth, 0.788 * workspaceWidth];
			this._whiskerMiddleInnerX = [0.393 * workspaceWidth, 0.607 * workspaceWidth];

			this._whiskerLowerOuterY = 0.943 * workspaceWidth;
			this._whiskerLowerInnerY = 0.548 * workspaceHeight;
			this._whiskerLowerOuterX = [0.287 * workspaceWidth, 0.713 * workspaceWidth];
			this._whiskerLowerInnerX = [0.419 * workspaceWidth, 0.581 * workspaceWidth];

			this._whiskers = [[], []];
			const numSegments = 4;
			for (let c = 0; c < 2; ++c) {
				let startX = this._whiskerUpperOuterX[c];
				let startY = this._whiskerUpperOuterY;
				let endX = this._whiskerUpperInnerX[c];
				let endY = this._whiskerUpperInnerY;
				this._whiskers[c].push(new ZigZag(startX, startY, endX, endY, numSegments));

				startX = this._whiskerMiddleOuterX[c];
				startY = this._whiskerMiddleOuterY;
				endX = this._whiskerMiddleInnerX[c];
				endY = this._whiskerMiddleInnerY;
				this._whiskers[c].push(new ZigZag(startX, startY, endX, endY, numSegments));

				startX = this._whiskerLowerOuterX[c];
				startY = this._whiskerLowerOuterY;
				endX = this._whiskerLowerInnerX[c];
				endY = this._whiskerLowerInnerY;
				this._whiskers[c].push(new ZigZag(startX, startY, endX, endY, numSegments));
			}

			this._ledOriginX = 0.5 * workspaceWidth;
			this._ledOriginY = 0.87 * workspaceHeight;
			this._ledRadius = 0.07 * workspaceWidth;

			const parameterValues = await this.plugin.audioNode.getParameterValues();
			Object.keys(parameterValues).forEach((parameterId) => {
				const value = parameterValues[parameterId].value;
				this._controls[parameterId].value = value;
			});
			this._updateState = (e) => {
				const event = e.detail;
				const { type, data } = event;
				if (type === 'wam-automation') {
					const { id, value } = data;
					this._controls[id].value = value;
					if (id.endsWith('Mode')) this.updateMode(id, false);
				}
			}
			this.updateMode('leftVoiceMode');
			this.updateMode('rightVoiceMode');
			this.plugin.audioNode.addEventListener('wam-automation', this._updateState);

			this._updatePeriodMs = this.plugin.audioNode.levelsUpdatePeriodMs;

			this._guiReady = true;
		}

		if (this._timestamp === null) this._timestamp = timestamp;
		const elapsedMs = timestamp - this._timestamp;
		if (elapsedMs < this._updatePeriodMs) await this._sleep(this._updatePeriodMs);
		this._timestamp = timestamp;

		const { bypass, drive } = this._controls;

		/** @type {HTMLDivElement} */
		const driveColorMixer = this.shadowRoot.querySelector('#drive-color-mixer');
		if (bypass.value) driveColorMixer.style.backgroundColor = grayLight;
		else {
			driveColorMixer.style.animationDelay = `-${drive.value}s`;
			driveColorMixer.style.background = 'currentColor';
		}
		const driveColor = getComputedStyle(driveColorMixer).backgroundColor;

		const { synthLevels, effectLevels } = this.plugin.audioNode.levels;

		const minOpacity = 0.333;
		const maxOpacity = 0.95;

		let svg = '';

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

			const earOpacity = Math.min(0.5 * effectLevel + 0.1 * synthLevelA + minOpacity, maxOpacity);
			const earPoints = `${this._earUpperX[c]},${this._earUpperY} ${this._earOuterX[c]},${this._earOuterY} ${this._earInnerX[c]},${this._earInnerY}`;
			svg += `\
				<polygon
					points="${earPoints}"
					style="fill:${pink};stroke:${grayDark};opacity:${earOpacity};z-index:1"
				/>
			`;

			const laserOpacity = Math.min(4.0 * synthLevelA * (2.0 + drive.value), maxOpacity);
			const eyeOpacity = Math.min(2.0 * effectLevel + (bypass.value ? minOpacity : 0.667), maxOpacity);

			const laserWidthFactor = Math.max(0.3 + synthLevelB, 0.3);
			const minPupilWidth = Math.min(0.9, Math.max(0.2, 1.0 - drive.value)) * this._pupilHeight;
			const pupilWidth = minPupilWidth + (0.333 + drive.value) * this._pupilHeight * synthLevelA;
			const laserLeftX = this._eyeOriginX[c] + this._eyeRadius * (c % 2 ? -0.5 : -3) * laserWidthFactor;
			const laserRightX = this._eyeOriginX[c] + this._eyeRadius * (c % 2 ? 3 : 0.5) * laserWidthFactor;

			const laserPoints = `${this._eyeOriginX[c]},${this._eyeOriginY} ${laserLeftX},${this._laserY} ${laserRightX},${this._laserY}`;
			svg += `
				<circle
					cx="${this._eyeOriginX[c]}" cy="${this._eyeOriginY}" r="${this._eyeRadius}"
					style="fill:${driveColor};stroke:${pink};opacity:${eyeOpacity};z-index:1"
				/>
				<ellipse
					cx="${this._eyeOriginX[c]}" cy="${this._eyeOriginY}" rx="${pupilWidth}" ry="${this._pupilHeight}"
					style="fill:${grayDark};stroke:${grayLight};z-index:2;"
				/>
				<polygon
					points="${laserPoints}"
					style="fill:${driveColor};stroke:${pink};opacity:${laserOpacity};z-index:3"
				/>
			`;

			const jitter = (3.0 + 3.0 * drive.value) * Math.max(synthLevelA, effectLevel);
			const smoothing = Math.min(Math.max(0.1, 1.0 - drive.value), 0.5);
			for (let i = 0; i < 3; ++i) {
				const whiskerPoints = this._whiskers[c][i].updatePoints(jitter, smoothing);
				svg += `
					<polyline
						points="${whiskerPoints}"
						style="fill:${transparent};stroke:${driveColor};
						opacity:${whiskerOpacity[Math.round(Math.random())]};z-index:2"
					/>
				`;
			}
		}

		svg += `\
			<circle
				cx="${this._ledOriginX}" cy="${this._ledOriginY}" r="${this._ledRadius * 1.1}"
				style="fill:${grayDark};stroke:${grayLight};z-index:1"
			/>
			<circle
				cx="${this._ledOriginX}" cy="${this._ledOriginY}" r="${this._ledRadius}"
				style="fill:${driveColor};stroke:${bypass.value ? black : grayDark};z-index:2"
			/>
		`;

		this.shadowRoot.querySelector('#visualization').innerHTML = svg;
		this._raf = window.requestAnimationFrame(this.handleAnimationFrame);
	}

	/**
	 * Change relative URLS to absolute URLs for CSS assets, webaudio controls spritesheets etc.
	 */
	setResources() {
		// Set up the background img & style
		const background = this.root.querySelector('img');
		background.src = getAssetUrl(backgroundImg);
	}

	setKnobListener() {
		this.shadowRoot
			.querySelector('#drive-control')
			.addEventListener('input', (e) => {
				this.plugin.audioNode.setParameterValues({
					drive: {
						id: 'drive',
						value: parseFloat(/** @type {HTMLInputElement} **/(e.target).value),
						normalized: false,
					},
				});
			});

		// DEBUG
		this.shadowRoot
			.querySelector('#leftVoiceMode-control')
			.addEventListener('input', (e) => {
				this.updateMode('leftVoiceMode');
			});
		this.shadowRoot
			.querySelector('#rightVoiceMode-control')
			.addEventListener('input', (e) => {
				this.updateMode('rightVoiceMode');
			});
	}

	setTextListener() {
		this.shadowRoot
			.querySelector('#title-text')
			.addEventListener('click', () => { this.triggerNotes(0.1); });

		this._updateMode = (parameterId) => {
			this.updateMode(parameterId, true);
			const value = this._controls[parameterId].value;
			this.plugin.audioNode.setParameterValues({
				bypass: {
					id: parameterId,
					value,
					normalized: false
				},
			});
			/** @type {WebAudioControlsWidget} **/
			const control = this.shadowRoot.querySelector(`#${parameterId}-control`);
			control.value = value;
		}

		this.shadowRoot
			.querySelector('#leftVoiceMode-text')
			.addEventListener('click', (e) => {
				this._updateMode('leftVoiceMode');
			});

		this.shadowRoot
			.querySelector('#rightVoiceMode-text')
			.addEventListener('click', (e) => {
				this._updateMode('rightVoiceMode');
			});
	}

	setSwitchListener() {
		this.shadowRoot
			.querySelector('#bypass-control')
			.addEventListener('change', () => {
				this.plugin.audioNode.setParameterValues({
					bypass: {
						id: 'bypass',
						value: this._controls['bypass'].value,
						normalized: false,
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

    destroy() {
        window.cancelAnimationFrame(this._raf);
    }
}

if (!customElements.get(WamExampleHTMLElement.is())) {
	customElements.define(WamExampleHTMLElement.is(), WamExampleHTMLElement);
}
