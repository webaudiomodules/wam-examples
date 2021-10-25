/* eslint-disable no-console */
/* eslint-disable no-shadow */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
import '../utils/webaudio-controls.js';

/**
 * @typedef {import('../../sdk-parammgr').ParamMgrNode} ParamMgrNode
 * @template Node @typedef {import('../../api').WebAudioModule<Node>} WebAudioModule
 */

const getBaseURL = () => {
	const base = new URL('.', import.meta.url);
	return `${base}`;
};
export default class BigMuffGui extends HTMLElement {
	/**
	 * @param {WebAudioModule<ParamMgrNode>} plug
	 */
	constructor(plug) {
		super();
		this._plug = plug;
		this._plug.gui = this;
		console.log(this._plug);

		this._root = this.attachShadow({ mode: 'open' });
		this._root.innerHTML = `<style>	
      :host {
        display: block;
        box-shadow: 4px 5px 6px rgba(0, 0, 0, 0.7), inset -2px -2px 5px 0px rgba(0, 0, 0, 0.2), inset 3px 1px 1px 4px rgba(255, 255, 255, 0.2), 1px 0px 1px 0px rgba(0, 0, 0, 0.9), 0 2px 1px 0 rgba(0, 0, 0, 0.9), 1px 1px 1px 0px rgba(0, 0, 0, 0.9);
        /*background: linear-gradient(rgb(255, 255, 255), rgb(205, 205, 205));*/
        position: relative;
        width: 200px;
        height: 262px;
        user-select: none;
        cursor: move;
        z-index: 9;
        /* bring your own prefixes */
    }

    #pedal {
        /* this relative uri is fixed by a call to setBackgroundImage in 
        constructor. It should be turned into an absolute one */
        background-image: url("assets/img/background/BigMuffBackground.png");

        /* this is equal to the size of the plugin, and should be equal to the
           size of the background image if you want to see it entirely */
        background-size: 200px 262px;
        width: 100%;
        height: 100%;
    }

    .knob,
    .switch,
    .icon,
    .label,
    .slider {
        cursor: pointer;
        text-align: center;
    }

    .knob {
        margin: 10px;
        align-content: center;
        position: absolute;
    }

    .led {
		position: absolute;
		left:52px;
		top:44px;
        margin: 0 auto;
        width: 13px;
        height: 13px;
        background-color: red;
        border-radius: 50%;
        box-shadow: rgba(0, 0, 0, 0.2) 0 -1px 7px 1px, inset #441313 0 -1px 9px, rgba(255, 0, 0, 0.5) 0 2px 12px;
        transition: all 0.5s;
    }

    #bypass {
        /*background: rgb(31, 30, 30);*/
        position: absolute;
        top: 193px;
        left: 71px;
        /*border-radius: 10px;*/
    }
                        }</style>
                        <div id="pedal">
                        <div class="knob" id="Input" style="top:5px; left:0px;">
                            <webaudio-knob src="./img/knobs/greenish_sloped.png" midilearn="true" height="50" width="50" sprites="100"
                                min="-24" max="12" step="0.1" value="0" id="/BigMuff/Input" style="height: 50px; ">
                            </webaudio-knob>
                            <div id="powerLed" class="led"></div>
                        </div>
                
                        <div class="knob" id="Tone" style="top:5px; left:63px;">
                            <webaudio-knob src="./img/knobs/greenish_sloped.png" midilearn="true" height="50" width="50" sprites="100"
                                min="0" max="1" step="0.01" value="0.5" id="/BigMuff/Tone" style="height: 50px;">
                            </webaudio-knob>
                        </div>
                
                        <div class="knob" id="Drive" style="top:5px; left:128px;">
                            <webaudio-knob src="./img/knobs/greenish_sloped.png" midilearn="true" height="50" width="50" sprites="100"
                                min="-3" max="100" step="1" value="1" id="/BigMuff/Drive" style="height: 50px;">
                            </webaudio-knob>
                        </div>
                
                        <div class="switch" id="bypass">
                            <webaudio-switch src="./img/switches/switch_1.png" midilearn="true" height="32" width="55" id="/BigMuff/bypass">
                            </webaudio-switch>
                        </div>
                    </div>
                    `;

		// this.isOn;
		this.state = {};
		this.setKnobs();
		this.setSliders();
		this.setSwitches();
		//this.setSwitchListener();
		this.setInactive();
		this._root.querySelector('#pedal').style.transform = 'none';
		// this._root.querySelector("#test").style.fontFamily = window.getComputedStyle(this._root.querySelector("#test")).getPropertyValue('font-family');

		// Compute base URI of this main.html file. This is needed in order
		// to fix all relative paths in CSS, as they are relative to
		// the main document, not the plugin's main.html
		this.basePath = getBaseURL();
		console.log(`basePath = ${this.basePath}`);

		// Fix relative path in WebAudio Controls elements
		this.fixRelativeImagePathsInCSS();

		// optionnal : set image background using a relative URI (relative
		// to this file)
		this.setImageBackground('./img/background/BigMuffBackground.png');

		// Monitor param changes in order to update the gui
		window.requestAnimationFrame(this.handleAnimationFrame);
	}

	fixRelativeImagePathsInCSS() {
		// change webaudiocontrols relative paths for spritesheets to absolute
		const webaudioControls = this._root.querySelectorAll(
			'webaudio-knob, webaudio-slider, webaudio-switch, img',
		);
		webaudioControls.forEach((e) => {
			const currentImagePath = e.getAttribute('src');
			if (currentImagePath !== undefined) {
				//console.log("Got wc src as " + e.getAttribute("src"));
				const imagePath = e.getAttribute('src');
				e.setAttribute('src', `${this.basePath}/${imagePath}`);
				//console.log("After fix : wc src as " + e.getAttribute("src"));
			}
		});

		const sliders = this._root.querySelectorAll('webaudio-slider');
		sliders.forEach((e) => {
			const currentImagePath = e.getAttribute('knobsrc');
			if (currentImagePath !== undefined) {
				console.log(`Got img src as ${e.getAttribute('src')}`);
				const imagePath = e.getAttribute('knobsrc');
				e.setAttribute('knobsrc', `${this.basePath}/${imagePath}`);
				console.log(
					`After fix : slider knobsrc as ${e.getAttribute('knobsrc')}`,
				);
			}
		});
	}

	setImageBackground(imageRelativeURI) {
		// check if the shadowroot host has a background image
		const mainDiv = this._root.querySelector('#pedal');
		mainDiv.style.backgroundImage =	`url(${this.basePath}${imageRelativeURI})`;

		//console.log("background =" + mainDiv.style.backgroundImage);
		//this._root.style.backgroundImage = "toto.png";
	}

	attributeChangedCallback() {
		console.log('Custom element attributes changed.');
		this.state = JSON.parse(this.getAttribute('state'));
		const tmp = '/PingPongDelayFaust/bypass';

		if (this.state[tmp] === 1) {
			this._root.querySelector('#switch1').value = 0;
			this.isOn = false;
		} else if (this.state[tmp] === 0) {
			this._root.querySelector('#switch1').value = 1;
			this.isOn = true;
		}

		this.knobs = this._root.querySelectorAll('.knob');
		console.log(this.state);

		for (let i = 0; i < this.knobs.length; i++) {
			this.knobs[i].setValue(this.state[this.knobs[i].id], false);
			console.log(this.knobs[i].value);
		}
	}

	handleAnimationFrame = () => {
		this._root.getElementById(
			'/BigMuff/Drive',
		).value = this._plug.audioNode.getParamValue('/BigMuff/Drive');

		this._root.getElementById(
			'/BigMuff/Input',
		).value = this._plug.audioNode.getParamValue('/BigMuff/Input');

		/*
		this._root.getElementById(
			'/BigMuff/Output'
		).value = this._plug.audioNode.getParamValue('/BigMuff/Output');
        */
		this._root.getElementById(
			'/BigMuff/Tone',
		).value = this._plug.audioNode.getParamValue('/BigMuff/Tone');

		this._root.getElementById('/BigMuff/bypass').value =			1 - this._plug.audioNode.getParamValue('/BigMuff/bypass');

		window.requestAnimationFrame(this.handleAnimationFrame);
	};

	get properties() {
		this.boundingRect = {
			dataWidth: {
				type: Number,
				value: 252.28689575195312,
			},
			dataHeight: {
				type: Number,
				value: 313.81036376953125,
			},
		};
		return this.boundingRect;
	}

	static get observedAttributes() {
		return ['state'];
	}

	setKnobs() {
		this._root
			.getElementById('/BigMuff/Drive')
			.addEventListener('input', (e) => this._plug.audioNode.setParamValue(
				'/BigMuff/Drive',
				e.target.value,
			));
		this._root
			.getElementById('/BigMuff/Input')
			.addEventListener('input', (e) => this._plug.audioNode.setParamValue(
				'/BigMuff/Input',
				e.target.value,
			));
		/*
		this._root
			.getElementById('/BigMuff/Output')
			.addEventListener('input', (e) =>
				this._plug.audioNode.setParamValue(
					'/BigMuff/Output',
					e.target.value
				)
            );
            */
		this._root
			.getElementById('/BigMuff/Tone')
			.addEventListener('input', (e) => this._plug.audioNode.setParamValue(
				'/BigMuff/Tone',
				e.target.value,
			));
	}

	setSliders() {}

	setSwitches() {
		const led = this._root.querySelector('#powerLed');
		led.style.backgroundColor = 'red';

		this._root
			.getElementById('/BigMuff/bypass')
			.addEventListener('change', (e) => {
				this._plug.audioNode.setParamValue(
					'/BigMuff/bypass',
					1 - e.target.value,
				);

				// change color of power led
				const led = this._root.querySelector('#powerLed');

				if (led.style.backgroundColor === 'red') led.style.backgroundColor = 'grey';
				else led.style.backgroundColor = 'red';
			});
	}

	setInactive() {
		const switches = this._root.querySelectorAll('.switch webaudio-switch');

		switches.forEach((s) => {
			console.log(`### SWITCH ID = ${s.id}`);
			this._plug.audioNode.setParamValue(s.id, 0);
		});
	}
}
try {
	customElements.define('wap-bigmuff', BigMuffGui);
	console.log('Element defined');
} catch (error) {
	console.log(error);
	console.log('Element already defined');
}
