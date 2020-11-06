import '../utils/webaudio-controls.js';

const getBaseURL = () => {
	const base = new URL('.', import.meta.url);
	return `${base}`;
};
export default class StonePhaserStereoGui extends HTMLElement {
	constructor(plug) {
		super();
		this._plug = plug;
		this._plug.gui = this;
		console.log(this._plug);

		this._root = this.attachShadow({ mode: 'open' });
		this._root.innerHTML = `<style>	
                        .pedal{
                            display: block;
                            background:null;
                            background-color: #7caeff;
                            width: 286.953125px;
                            height: 353.3046875px;
                            border-radius: 10px;
                            position: relative;
                            box-shadow: 4px 5px 6px rgba(0, 0, 0, 0.7), inset -2px -2px 5px 0px rgba(0, 0, 0, 0.2), inset 3px 1px 1px 4px rgba(255, 255, 255, 0.2), 1px 0px 1px 0px rgba(0, 0, 0, 0.9), 0 2px 1px 0 rgba(0, 0, 0, 0.9), 1px 1px 1px 0px rgba(0, 0, 0, 0.9);
                            /* bring your own prefixes */
                            /* transform: translate(-50%, -50%); */
                        }
            
                        
                        #background-image {
                            //border: solid 2px black;
                            width: 286.953125px;
                            height: 353.3046875px;
                            opacity: 1;
                            border-radius: 10px;
                            /* display: none; */
                            //visibility: hidden;
                        }

                        /* .img-bck img[src=""] {
                            display: none;
                        } */

                        /* #resize {
                            position: absolute;
                            cursor: nwse-resize;
                            width: 10px;
                            height: 10px;
                            left: 278.953125px;
                            top: 345.3046875px;
                            border: 1px solid black;
                        } */

                        .knob, .switch, .icon, .label, .slider {
                            position: absolute;
                            cursor: pointer;
                            text-align: center;
                        }

                        .container {
                            position: relative;
                            width: 286.953125px;
                            height: 353.3046875px;
                            /* font-family: Arial; */
                          }
                          
                        .text-block {
                            position: absolute;
                            bottom: 20px;
                            right: 20px;
                            background-color: #7caeff;
                            color: white;
                            padding-left: 20px;
                            padding-right: 20px;
                        }

                        /* .text-block :not(.tititi) {
                            opacity : 0;
                        } */

                        .draggable {
                            touch-action: none;
                            user-select: none;
                        }

                          #canvas {
                            width:100px;
                            height:300px;
                            border: 10px solid;
                        }
                        .rectangle {
                            border: 1px solid #FF0000;
                            position: absolute;
                        }

                        .selected {
                            border: 1px dashed black;
                            cursor: move;
                        }

                        .selected:hover {
                            border: 1px dashed black;
                            cursor: move;
                        }

                        .selected  webaudio-knob{
                            cursor: move;
                        }

                        .selected  webaudio-switch{
                            cursor: move;
                        }

                        .selected  span{
                            cursor: move;
                        }

                        .selected:hover  span{
                            cursor: move;
                        }

                        .selected  webaudio-slider{
                            cursor: move;
                        }

                        .selected:hover webaudio-knob{
                            cursor: move;
                        }

                        .selected:hover webaudio-switch{
                            cursor: move;
                        }
                        
                        .selected:hover webaudio-slider{
                            cursor: move;
                        }


                        #switch1 {
                            bottom: 10px;
                            right: 0px;
                        }
                        
                    #LFO {
                        left: 42px;
                        top: 32px;
                    }

                    #LFO div {
                        color: #fae900;
                        font-family: "Comic Sans MS";
                        font-size: 14px;
                        
                    }
                
                    #Feedback {
                        left: 107px;
                        top: 33px;
                    }

                    #Feedback div {
                        color: #ffee00;
                        font-family: "Verdana";
                        font-size: 14px;
                        
                    }
                
                    #Lo-cut {
                        left: 194px;
                        top: 33px;
                    }

                    #Lo-cut div {
                        color: #eeff00;
                        font-family: "Verdana";
                        font-size: 14px;
                        
                    }
                
                    #Mix {
                        left: 117px;
                        top: 126px;
                    }

                    #Mix div {
                        color: #eeff00;
                        font-family: "Verdana";
                        font-size: 14px;
                        
                    }
                
                    #Stereo_phase {
                        left: 42px;
                        top: 126px;
                    }

                    #Stereo_phase div {
                        color: #ddfa00;
                        font-family: "Verdana";
                        font-size: 14px;
                        
                    }
                
                    #Bypass {
                        left: 94px;
                        top: 223px;
                    }

                    #Bypass div {
                        color: #000000;
                        font-family: "Verdana";
                        font-size: 14px;
                        
                    }
                
                    #Color {
                        left: 178px;
                        top: 126px;
                    }

                    #Color div {
                        color: #fbff00;
                        font-family: "Verdana";
                        font-size: 14px;
                        
                    }
                
                #label_79 {
                            left: 62px;
                            top: 285px;
                            color: #ff2486;
                            font-family: "Comic Sans MS";
                            font-size: 28px;
                        }

                
                        
                        .pedalLabelName {
                          color: #FFFFFF;
                          background: transparent;
                          text-shadow: 2px 2px 0 #4074b5, 2px -2px 0 #4074b5, -2px 2px 0 #4074b5, -2px -2px 0 #4074b5, 2px 0px 0 #4074b5, 0px 2px 0 #4074b5, -2px 0px 0 #4074b5, 0px -2px 0 #4074b5;                        }                        

                        .pedalLabel{
                            position: absolute;
                            /* top: 225px; */
                            font-size: 16pxpx;
                            font-family: -apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";/*Sansita;*//*{font}*/
                            text-align: center;
                            line-height: 30px;/*{pedalfontsize}*/
                            width: 150px;
                            color: #6B0000;/*{fontcolor}*/
                        }
                        .knob-label{
                            position: absolute;
                            font-size: 12px;/*{knobfontsize}*/
                            line-height: 12px;
                            width:64px;
                            max-width:64px;
                            overflow: hidden;
                            text-align: center;
                            font-family: Sansita;/*{font}*/
                            color: #6B0000;/*{fontcolor}*/
                        }
                        #knob1-label{
                            top: 84px;
                            left: 43px;
                        }</style>
<div class="pedal draggable" style="box-sizing: border-box; transform: translate(13.3164px, -282.883px);" id="pedal" data-x="13.31640625" data-y="-282.8828125">
    <div id="resize"></div>
    <div class="container" id="txtcontainer">
      <img id="background-image" src="./img/background/psyche10.jpg">

      <h4></h4>
      <p class="pedalLabel" id="test"></p>

    </div>
    <!-- <p id="labeldiv" style="border-style: dashed; top: 68px;">tototo</p> -->
    <!-- <figure>
        <img id="background-image" alt="tototo">
        <figcaption>tototo</figcaption>
    </figure> -->
    <!-- <div class="text-block" id="froala-editor"></div> -->
  <div class="knob       " id="LFO"><webaudio-knob src="./img/knobs/Jambalaya.png" height="50" width="50" sprites="100" min="0.01" max="5" step="0.01" midilearn="true" value="0.2" id="/StonePhaserStereo/LFO"></webaudio-knob><div style="text-align:center">LFO</div></div><div class="knob         " id="Feedback"><webaudio-knob src="./img/knobs/Jambalaya.png" height="50" width="50" sprites="100" min="0" max="99" step="1" midilearn="true" value="75" id="/StonePhaserStereo/Feedback"></webaudio-knob><div style="text-align:center">Feedback</div></div><div class="knob     " id="Lo-cut"><webaudio-knob src="./img/knobs/Jambalaya.png" height="50" width="50" sprites="100" min="10" max="5000" step="1" midilearn="true" value="500" id="/StonePhaserStereo/Lo-cut"></webaudio-knob><div style="text-align:center">Lo-cut</div></div><div class="knob                " id="Mix"><webaudio-knob src="./img/knobs/Jambalaya.png" height="50" width="50" sprites="100" min="0" max="100" step="1" midilearn="true" value="50" id="/StonePhaserStereo/Mix"></webaudio-knob><div style="text-align:center">Mix</div></div><div class="knob        " id="Stereo_phase"><webaudio-knob src="./img/knobs/Jambalaya.png" height="50" width="50" sprites="100" min="-180" max="180" step="1" midilearn="true" value="0" id="/StonePhaserStereo/Stereo_phase"></webaudio-knob><div style="text-align:center">Stereo</div></div><div class="switch    " id="Bypass"><webaudio-switch src="./img/switches/switch_1.png" height="50" width="96" midilearn="true" id="/StonePhaserStereo/Bypass"></webaudio-switch><div></div></div><div class="switch" id="Color"><webaudio-switch src="./img/switches/switch_2.png" height="50" width="80" midilearn="true" id="/StonePhaserStereo/Color"></webaudio-switch><div>Color</div></div><div class="label pedalLabelName      " id="label_79">Stone Phaser</div></div>`;

		this.isOn;
		this.state = new Object();
		this.setKnobs();
		this.setSliders();
		this.setSwitches();
		//this.setSwitchListener();
		this.setInactive();
		this._root.querySelector('#pedal').style.transform = 'none';
		//this._root.querySelector("#test").style.fontFamily = window.getComputedStyle(this._root.querySelector("#test")).getPropertyValue('font-family');

		// Compute base URI of this main.html file. This is needed in order
		// to fix all relative paths in CSS, as they are relative to
		// the main document, not the plugin's main.html
		this.basePath = getBaseURL();
		console.log('basePath = ' + this.basePath);

		// Fix relative path in WebAudio Controls elements
		this.fixRelativeImagePathsInCSS();

		// optionnal : set image background using a relative URI (relative
		// to this file)
		//this.setImageBackground("/img/BigMuffBackground.png");

		// Monitor param changes in order to update the gui
		window.requestAnimationFrame(this.handleAnimationFrame);
	}

	fixRelativeImagePathsInCSS() {
		// change webaudiocontrols relative paths for spritesheets to absolute
		let webaudioControls = this._root.querySelectorAll(
			'webaudio-knob, webaudio-slider, webaudio-switch, img'
		);
		webaudioControls.forEach((e) => {
			let currentImagePath = e.getAttribute('src');
			if (currentImagePath !== undefined) {
				//console.log("Got wc src as " + e.getAttribute("src"));
				let imagePath = e.getAttribute('src');
				e.setAttribute('src', this.basePath + '/' + imagePath);
				//console.log("After fix : wc src as " + e.getAttribute("src"));
			}
		});

		let sliders = this._root.querySelectorAll('webaudio-slider');
		sliders.forEach((e) => {
			let currentImagePath = e.getAttribute('knobsrc');
			if (currentImagePath !== undefined) {
				console.log('Got img src as ' + e.getAttribute('src'));
				let imagePath = e.getAttribute('knobsrc');
				e.setAttribute('knobsrc', this.basePath + '/' + imagePath);
				console.log(
					'After fix : slider knobsrc as ' + e.getAttribute('knobsrc')
				);
			}
		});
	}

	setImageBackground() {
		// check if the shadowroot host has a background image
		let mainDiv = this._root.querySelector('#main');
		mainDiv.style.backgroundImage =
			'url(' + this.basePath + '/' + imageRelativeURI + ')';

		//console.log("background =" + mainDiv.style.backgroundImage);
		//this._root.style.backgroundImage = "toto.png";
	}

	attributeChangedCallback() {
		console.log('Custom element attributes changed.');
		this.state = JSON.parse(this.getAttribute('state'));
		let tmp = '/PingPongDelayFaust/bypass';

		if (this.state[tmp] == 1) {
			this._root.querySelector('#switch1').value = 0;
			this.isOn = false;
		} else if (this.state[tmp] == 0) {
			this._root.querySelector('#switch1').value = 1;
			this.isOn = true;
		}

		this.knobs = this._root.querySelectorAll('.knob');
		console.log(this.state);

		for (var i = 0; i < this.knobs.length; i++) {
			this.knobs[i].setValue(this.state[this.knobs[i].id], false);
			console.log(this.knobs[i].value);
		}
	}
	handleAnimationFrame = () => {
		this._root.getElementById(
			'/StonePhaserStereo/LFO'
		).value = this._plug.audioNode.getParamValue('/StonePhaserStereo/LFO');

		this._root.getElementById(
			'/StonePhaserStereo/Feedback'
		).value = this._plug.audioNode.getParamValue(
			'/StonePhaserStereo/Feedback'
		);

		this._root.getElementById(
			'/StonePhaserStereo/Lo-cut'
		).value = this._plug.audioNode.getParamValue(
			'/StonePhaserStereo/Lo-cut'
		);

		this._root.getElementById(
			'/StonePhaserStereo/Mix'
		).value = this._plug.audioNode.getParamValue('/StonePhaserStereo/Mix');

		this._root.getElementById(
			'/StonePhaserStereo/Stereo_phase'
		).value = this._plug.audioNode.getParamValue(
			'/StonePhaserStereo/Stereo_phase'
		);

		this._root.getElementById('/StonePhaserStereo/Bypass').value =
			1 - this._plug.audioNode.getParamValue('/StonePhaserStereo/Bypass');

		this._root.getElementById('/StonePhaserStereo/Color').value =
			1 - this._plug.audioNode.getParamValue('/StonePhaserStereo/Color');

		window.requestAnimationFrame(this.handleAnimationFrame);
	};

	get properties() {
		this.boundingRect = {
			dataWidth: {
				type: Number,
				value: 286.953125,
			},
			dataHeight: {
				type: Number,
				value: 353.3046875,
			},
		};
		return this.boundingRect;
	}

	static get observedAttributes() {
		return ['state'];
	}

	setKnobs() {
		this._root
			.getElementById('/StonePhaserStereo/LFO')
			.addEventListener('input', (e) =>
				this._plug.audioNode.setParamValue(
					'/StonePhaserStereo/LFO',
					e.target.value
				)
			);
		this._root
			.getElementById('/StonePhaserStereo/Feedback')
			.addEventListener('input', (e) =>
				this._plug.audioNode.setParamValue(
					'/StonePhaserStereo/Feedback',
					e.target.value
				)
			);
		this._root
			.getElementById('/StonePhaserStereo/Lo-cut')
			.addEventListener('input', (e) =>
				this._plug.audioNode.setParamValue(
					'/StonePhaserStereo/Lo-cut',
					e.target.value
				)
			);
		this._root
			.getElementById('/StonePhaserStereo/Mix')
			.addEventListener('input', (e) =>
				this._plug.audioNode.setParamValue(
					'/StonePhaserStereo/Mix',
					e.target.value
				)
			);
		this._root
			.getElementById('/StonePhaserStereo/Stereo_phase')
			.addEventListener('input', (e) =>
				this._plug.audioNode.setParamValue(
					'/StonePhaserStereo/Stereo_phase',
					e.target.value
				)
			);
	}

	setSliders() {}

	setSwitches() {
		this._root
			.getElementById('/StonePhaserStereo/Bypass')
			.addEventListener('change', (e) =>
				this._plug.audioNode.setParamValue(
					'/StonePhaserStereo/Bypass',
					1 - e.target.value
				)
			);
		this._root
			.getElementById('/StonePhaserStereo/Color')
			.addEventListener('change', (e) =>
				this._plug.audioNode.setParamValue(
					'/StonePhaserStereo/Color',
					1 - e.target.value
				)
			);
	}

	setInactive() {
		let switches = this._root.querySelectorAll('.switch webaudio-switch');

		switches.forEach((s) => {
			console.log('### SWITCH ID = ' + s.id);
			this._plug.audioNode.setParamValue(s.id, 0);
		});
	}
}
try {
	customElements.define('wap-stonephaserstereo', StonePhaserStereoGui);
	console.log('Element defined');
} catch (error) {
	console.log(error);
	console.log('Element already defined');
}
