let style = `
.pedal{
    display: block;
    background:null;
    background-color: #d9fa45;
    width: 201.5625px;
    height: 307.8732604980469px;
    border-radius: 10px;
    position: relative;
    box-shadow: 4px 5px 6px rgba(0, 0, 0, 0.7), inset -2px -2px 5px 0px rgba(0, 0, 0, 0.2), inset 3px 1px 1px 4px rgba(255, 255, 255, 0.2), 1px 0px 1px 0px rgba(0, 0, 0, 0.9), 0 2px 1px 0 rgba(0, 0, 0, 0.9), 1px 1px 1px 0px rgba(0, 0, 0, 0.9);
    /* bring your own prefixes */
    /* transform: translate(-50%, -50%); */
}


#background-image {
    //border: solid 2px black;
    width: 201.5625px;
    height: 307.8732604980469px;
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
    left: 193.5625px;
    top: 299.8732604980469px;
    border: 1px solid black;
} */

.knob, .switch, .icon, .label, .slider {
    position: absolute;
    cursor: pointer;
    text-align: center;
}

.container {
    position: relative;
    width: 201.5625px;
    height: 307.8732604980469px;
    /* font-family: Arial; */
  }
  
.text-block {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background-color: #d9fa45;
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

#feedback {
left: 107px;
top: 19px;
}

#feedback div {
color: #000000;
font-family: "Verdana";
font-size: 14px;

}

#mix {
left: 69px;
top: 100px;
}

#mix div {
color: #000000;
font-family: "Verdana";
font-size: 14px;

}

#time {
left: 33px;
top: 20px;
}

#time div {
color: #000000;
font-family: "Verdana";
font-size: 14px;

}

#bypass {
left: 64px;
top: 188px;
}

#bypass div {
color: #000000;
font-family: "Verdana";
font-size: 14px;

}

#label_856 {
    left: 19px;
    top: 236px;
    color: #ffe000;
    font-family: "Verdana";
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
}`;

let template = `
    <div class="pedal draggable" style="box-sizing: border-box; transform: translate(-2.37411px, -162.869px);" id="pedal" data-x="-2.374114990234375" data-y="-162.86892700195312">
        <div id="resize"></div>
        <div class="container" id="txtcontainer">
      

      
      <p class="pedalLabel" id="test"></p>

    </div>
    <!-- <p id="labeldiv" style="border-style: dashed; top: 68px;">tototo</p> -->
    <!-- <figure>
        <img id="background-image" alt="tototo">
        <figcaption>tototo</figcaption>
    </figure> -->
    <!-- <div class="text-block" id="froala-editor"></div> -->
  <div class="knob     " id="feedback">
      <webaudio-knob src="./img/knobs/Aqua.png" 
          height="50" width="50" sprites="100" min="0" max="1" step="0.01" 
      midilearn="true" value="0.5" id="/PingPongDelayFaust/feedback">
  </webaudio-knob>
  <div style="text-align:center">feedback</div></div><div class="knob      " id="mix">
  <webaudio-knob src="./img/knobs/Aqua.png" height="50" width="50" sprites="100" min="0" max="1" step="0.01" midilearn="true" value="0.5" id="/PingPongDelayFaust/mix"></webaudio-knob>
  
  <div style="text-align:center">mix</div></div>
  <div class="knob   " id="time"><webaudio-knob src="./img/knobs/Aqua.png" height="50" width="50" sprites="100" min="0.1" max="1" step="0.01" midilearn="true" value="0.5" id="/PingPongDelayFaust/time"></webaudio-knob>
  <div style="text-align:center">time</div></div><div class="switch" id="bypass">
  <webaudio-switch src="./img/switches/switch_1.png" height="33" width="62.69999999999999" midilearn="true" id="/PingPongDelayFaust/bypass"></webaudio-switch><div></div></div>
  <div class="label pedalLabelName    " id="label_856">Faust Delay</div></div>
`;
import '../utils/webaudio-controls.js';

const getAssetUrl = (asset) => {
	const base = new URL('.', import.meta.url);
	return `${base}${asset}`;
};

const getBaseURL = () => {
	const base = new URL('.', import.meta.url);
	return `${base}`;
};

export default class PingPongDelayFaustGui extends HTMLElement {
	constructor(plug) {
		super();
		this._plug = plug;
		this._plug.gui = this;
        console.log(this._plug);
        
        this._root = this.attachShadow({ mode: 'open' });
        this._root.innerHTML = `<style>${style}</style>${template}`;

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
		console.log("basePath = " + this.basePath)

		// Fix relative path in WebAudio Controls elements
		this.fixRelativeImagePathsInCSS();

		// optionnal : set image background using a relative URI (relative
		// to this file)
        //this.setImageBackground("/img/BigMuffBackground.png");
        
        // Monitor param changes in order to update the gui
        window.requestAnimationFrame(this.handleAnimationFrame);
	}

	fixRelativeImagePathsInCSS(imageRelativeURI) {
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
        this._root.getElementById('/PingPongDelayFaust/feedback').value = this._plug.audioNode.getParamValue('/PingPongDelayFaust/feedback');
		this._root.getElementById('/PingPongDelayFaust/time').value = this._plug.audioNode.getParamValue('/PingPongDelayFaust/time');
		this._root.getElementById('/PingPongDelayFaust/mix').value = this._plug.audioNode.getParamValue('/PingPongDelayFaust/mix');
		this._root.getElementById('/PingPongDelayFaust/bypass').value = 1 - this._plug.audioNode.getParamValue('/PingPongDelayFaust/bypass');
		window.requestAnimationFrame(this.handleAnimationFrame);
    }
    
	get properties() {
		this.boundingRect = {
			dataWidth: {
				type: Number,
				value: 201.5625,
			},
			dataHeight: {
				type: Number,
				value: 307.8732604980469,
			},
		};
		return this.boundingRect;
	}

	static get observedAttributes() {
		return ['state'];
	}

	setKnobs() {
		this._root
			.getElementById('/PingPongDelayFaust/feedback')
			.addEventListener('input', (e) =>
				this._plug.audioNode.setParamValue(
					'/PingPongDelayFaust/feedback',
					e.target.value
				)
			);
		this._root
			.getElementById('/PingPongDelayFaust/mix')
			.addEventListener('input', (e) =>
				this._plug.audioNode.setParamValue('/PingPongDelayFaust/mix', e.target.value)
			);
		this._root
			.getElementById('/PingPongDelayFaust/time')
			.addEventListener('input', (e) =>
				this._plug.audioNode.setParamValue('/PingPongDelayFaust/time', e.target.value)
			);
	}

	setSliders() {}

	setSwitches() {
		this._root
			.getElementById('/PingPongDelayFaust/bypass')
			.addEventListener('change', (e) =>
				this._plug.audioNode.setParamValue(
					'/PingPongDelayFaust/bypass',
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
	customElements.define('wap-pingpongdelayfaust', PingPongDelayFaustGui);
	console.log('Element defined');
} catch (error) {
	console.log(error);
	console.log('Element already defined');
}

