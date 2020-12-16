import '../utils/webaudio-controls.js';

const getBaseURL = () => {
	const base = new URL('.', import.meta.url);
	return `${base}`;
};
export default class GuitarAmpSim60sGui extends HTMLElement {
	constructor(plug) {
		super();
		this._plug = plug;
		this._plug.gui = this;
		console.log(this._plug);

		this._root = this.attachShadow({ mode: 'open' });
		this._root.innerHTML = `<style>	
                        .pedal{
                            display: block;
                            background:linear-gradient(rgba(151, 90, 33, 1), rgba(24, 20, 2, 1));
                            background-color: #7caeff;
                            width: 510.390625px;
                            height: 222.87890625px;
                            border-radius: 10px;
                            position: relative;
                            box-shadow: 4px 5px 6px rgba(0, 0, 0, 0.7), inset -2px -2px 5px 0px rgba(0, 0, 0, 0.2), inset 3px 1px 1px 4px rgba(255, 255, 255, 0.2), 1px 0px 1px 0px rgba(0, 0, 0, 0.9), 0 2px 1px 0 rgba(0, 0, 0, 0.9), 1px 1px 1px 0px rgba(0, 0, 0, 0.9);
                            /* bring your own prefixes */
                            /* transform: translate(-50%, -50%); */
                        }
            
                        
                        #background-image {
                            //border: solid 2px black;
                            width: 510.390625px;
                            height: 222.87890625px;
                            opacity: 0.5;
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
                            left: 502.390625px;
                            top: 214.87890625px;
                            border: 1px solid black;
                        } */

                        .knob, .switch, .icon, .label, .slider {
                            position: absolute;
                            cursor: pointer;
                            text-align: center;
                        }

                        .container {
                            position: relative;
                            width: 510.390625px;
                            height: 222.87890625px;
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
                        
                    #Bass {
                        left: 117px;
                        top: 26px;
                    }

                    #Bass div {
                        color: #000000;
                        font-family: "Verdana";
                        font-size: 14px;
                        
                    }
                
                    #Master {
                        left: 331px;
                        top: 25px;
                    }

                    #Master div {
                        color: #000000;
                        font-family: "Verdana";
                        font-size: 14px;
                        
                    }
                
                    #Middle {
                        left: 190px;
                        top: 26px;
                    }

                    #Middle div {
                        color: #000000;
                        font-family: "Verdana";
                        font-size: 14px;
                        
                    }
                
                    #Treble {
                        left: 260px;
                        top: 26px;
                    }

                    #Treble div {
                        color: #000000;
                        font-family: "Verdana";
                        font-size: 14px;
                        
                    }
                
                    #Volume {
                        left: 48px;
                        top: 26px;
                    }

                    #Volume div {
                        color: #000000;
                        font-family: "Verdana";
                        font-size: 14px;
                        
                    }
                
                    #Bright {
                        left: 18px;
                        top: 124px;
                    }

                    #Bright div {
                        color: #e6d7b7;
                        font-family: "Verdana";
                        font-size: 14px;
                        
                    }
                
                    #bypass {
                        left: 408px;
                        top: 26px;
                    }

                    #bypass div {
                        color: #000000;
                        font-family: "Verdana";
                        font-size: 14px;
                        
                    }
                
                #label_138 {
                            left: 151px;
                            top: 111px;
                            color: #d2c16a;
                            font-family: "Palatino Linotype";
                            font-size: 54px;
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
<div class="pedal draggable" style="box-sizing: border-box; transform: translate(10.1172px, -272.039px);" id="pedal" data-x="10.1171875" data-y="-272.0390625">
    <div id="resize"></div>
    <div class="container" id="txtcontainer">
      <img id="background-image" src="./img/background/metal3.webp">

      <h4></h4>
      <p class="pedalLabel" id="test"></p>

    </div>
    <!-- <p id="labeldiv" style="border-style: dashed; top: 68px;">tototo</p> -->
    <!-- <figure>
        <img id="background-image" alt="tototo">
        <figcaption>tototo</figcaption>
    </figure> -->
    <!-- <div class="text-block" id="froala-editor"></div> -->
    <div class="knob      " id="Bass">
        <webaudio-knob src="./img/knobs/Jambalaya.png" height="50" width="50" sprites="100" min="0" max="1" step="0.01" midilearn="true" value="0.5" id="/GuitarAmpSim60s/Bass">
        </webaudio-knob>
        <div style="text-align:center">Bass</div>
    </div>
      
    <div class="knob   " id="Master">
        <webaudio-knob src="./img/knobs/Jambalaya.png" height="50" width="50" sprites="100" min="0" max="1" step="0.01" midilearn="true" value="0.5" id="/GuitarAmpSim60s/Master">
        </webaudio-knob>
        <div style="text-align:center">Master</div>
    </div>
        
    <div class="knob   " id="Middle">
        <webaudio-knob src="./img/knobs/Jambalaya.png" height="50" width="50" sprites="100" min="0" max="1" step="0.01" midilearn="true" value="0.5" id="/GuitarAmpSim60s/Middle">
        </webaudio-knob>
        <div style="text-align:center">Middle</div>
    </div>
        
    <div class="knob    " id="Treble">
        <webaudio-knob src="./img/knobs/Jambalaya.png" height="50" width="50" sprites="100" min="0" max="1" step="0.01" midilearn="true" value="0.5" id="/GuitarAmpSim60s/Treble">
        </webaudio-knob>
        <div style="text-align:center">Treble</div>
    </div>
    
    <div class="knob   " id="Volume">
        <webaudio-knob src="./img/knobs/Jambalaya.png" height="50" width="50" sprites="100" min="0" max="1" step="0.01" midilearn="true" value="0.5" id="/GuitarAmpSim60s/Volume">
        </webaudio-knob>
        <div style="text-align:center">Volume</div>
    </div>
    
    <div class="switch" id="Bright">
        <webaudio-switch src="./img/switches/switch_2.png" height="50" width="80" midilearn="true" id="/GuitarAmpSim60s/Bright">
        </webaudio-switch>
        <div>Clean / Crunch</div>
    </div>
    
    <div class="switch     " id="bypass">
        <webaudio-switch 
                src="./img/switches/Power_switch_01.png" 
                height="62.46753246753244" 
                width="74.96103896103895" 
                midilearn="true" 
                id="/GuitarAmpSim60s/bypass"
                value="1"
        >
        </webaudio-switch>
        <div></div>
    </div>
    
    <div class="label pedalLabelName      " id="label_138">VoxAmp 30</div>
    
    </div>`;

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
			'/GuitarAmpSim60s/Bass'
		).value = this._plug.audioNode.getParamValue('/GuitarAmpSim60s/Bass');

		this._root.getElementById(
			'/GuitarAmpSim60s/Master'
		).value = this._plug.audioNode.getParamValue('/GuitarAmpSim60s/Master');

		this._root.getElementById(
			'/GuitarAmpSim60s/Middle'
		).value = this._plug.audioNode.getParamValue('/GuitarAmpSim60s/Middle');

		this._root.getElementById(
			'/GuitarAmpSim60s/Treble'
		).value = this._plug.audioNode.getParamValue('/GuitarAmpSim60s/Treble');

		this._root.getElementById(
			'/GuitarAmpSim60s/Volume'
		).value = this._plug.audioNode.getParamValue('/GuitarAmpSim60s/Volume');

		this._root.getElementById('/GuitarAmpSim60s/Bright').value =
			this._plug.audioNode.getParamValue('/GuitarAmpSim60s/Bright');

		this._root.getElementById('/GuitarAmpSim60s/bypass').value =
			this._plug.audioNode.getParamValue('/GuitarAmpSim60s/bypass');

		window.requestAnimationFrame(this.handleAnimationFrame);
	};

	get properties() {
		this.boundingRect = {
			dataWidth: {
				type: Number,
				value: 510.390625,
			},
			dataHeight: {
				type: Number,
				value: 222.87890625,
			},
		};
		return this.boundingRect;
	}

	static get observedAttributes() {
		return ['state'];
	}

	setKnobs() {
		this._root
			.getElementById('/GuitarAmpSim60s/Bass')
			.addEventListener('input', (e) =>
				this._plug.audioNode.setParamValue(
					'/GuitarAmpSim60s/Bass',
					e.target.value
				)
			);
		this._root
			.getElementById('/GuitarAmpSim60s/Master')
			.addEventListener('input', (e) =>
				this._plug.audioNode.setParamValue(
					'/GuitarAmpSim60s/Master',
					e.target.value
				)
			);
		this._root
			.getElementById('/GuitarAmpSim60s/Middle')
			.addEventListener('input', (e) =>
				this._plug.audioNode.setParamValue(
					'/GuitarAmpSim60s/Middle',
					e.target.value
				)
			);
		this._root
			.getElementById('/GuitarAmpSim60s/Treble')
			.addEventListener('input', (e) =>
				this._plug.audioNode.setParamValue(
					'/GuitarAmpSim60s/Treble',
					e.target.value
				)
			);
		this._root
			.getElementById('/GuitarAmpSim60s/Volume')
			.addEventListener('input', (e) =>
				this._plug.audioNode.setParamValue(
					'/GuitarAmpSim60s/Volume',
					e.target.value
				)
			);
	}

	setSliders() {}

	setSwitches() {
		this._root
			.getElementById('/GuitarAmpSim60s/Bright')
			.addEventListener('change', (e) =>
				this._plug.audioNode.setParamValue(
					'/GuitarAmpSim60s/Bright',
					e.target.value
				)
			);
		this._root
			.getElementById('/GuitarAmpSim60s/bypass')
			.addEventListener('change', (e) =>
				this._plug.audioNode.setParamValue(
					'/GuitarAmpSim60s/bypass',
					e.target.value
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
	customElements.define('wap-guitarampsim60s', GuitarAmpSim60sGui);
	console.log('Element defined');
} catch (error) {
	console.log(error);
	console.log('Element already defined');
}
