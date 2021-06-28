// https://github.com/g200kg/webaudio-controls/blob/master/webaudio-controls.js
import '../utils/webaudio-controls.js';

// This works when youuse a bundler such as rollup
// If you do no wan to use a bundler, then  look at other examples
// that build in pure JS the syles and html template directly
// in the code...
let style = `
@font-face {
	font-family: 'smallFont';
	src: url('./assets/fonts/secrcode-Regular.ttf') format('truetype');
	font-weight: normal;
	font-style: normal;

}

:host {
	background: linear-gradient(rgb(114, 70, 155), rgb(44, 34, 109));
	box-shadow: 4px 5px 6px rgba(0, 0, 0, 0.7), inset -2px -2px 5px 0px rgba(0, 0, 0, 0.2), inset 3px 1px 1px 4px rgba(255, 255, 255, 0.2), 1px 0px 1px 0px rgba(0, 0, 0, 0.9), 0 2px 1px 0 rgba(0, 0, 0, 0.9), 1px 1px 1px 0px rgba(0, 0, 0, 0.9);


	width: 480px;
	height: 350px;
	display: block;
	user-select: none;
	cursor: move;
	z-index: 9;

	border-bottom-left-radius: 8px;
	border-bottom-right-radius: 8px;
}

.pedalLabel,
.div_buttons {
	border-radius: 8px;
}

.div_menuPanel {
	/* border-top-left-radius: 8px;
border-top-right-radius: 8px; */
}

webaudio-switch {
	left: -6px;

}

span {
	font-family: helvetica;
	text-shadow: 0px 1px 1px #000;
}

.pedalLabel {
	/* background: rgba(0, 0, 0, 0.4); */
	box-shadow: inset 0px 1px 5px #111;
	border: 1px solid #ccc;
	color: rgb(204, 204, 204);
	padding: 4px 10px;
	font-size: 10px;
	text-align: center;
	user-select: none;
	font-family: helvetica;
	text-transform: uppercase;
	margin-top: 10px;
}

.knob-label {
	color: rgb(255, 255, 255);
	text-shadow: 0px 1px 1px #000;

	font-size: 9px;
	margin-top: -2px;

	text-align: center;
	text-transform: uppercase;
	overflow: hidden;
	user-select: none;
	font-family: helvetica;
	margin-top: 5px;

}

.elements {
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;

	padding: 10px;

}

.column {
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: center;
	flex: 1;
	margin: 5px;
	margin-top: 10px;
	border-radius: 10px;
	z-index: 0;
}

.frequencyMeasure {
	background-color: #000
}

.row {
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: stretch;

}`;
let template = `
<div id="wc-equalizer" class="wrapper">
	<div class="row">
		<div class="column">
			<div id="DivFilterBank"></div>
			<span class="knob-label" id="knob1-label">EFFECT</span>
			<webaudio-switch id="switch1" class="switch" midilearn="true" src="./assets/switches/switch_1.png"
							width="32" height="20"></webaudio-switch>
			<span class="pedalLabel">Equalizer</span>
		</div>
	</div>
</div>
`;

let switchImg = './assets/switches/switch_1.png';

const getAssetUrl = (asset) => {
	const base = new URL('.', import.meta.url);
	return `${base}${asset}`;
};

// The GUI is a WebComponent. Not mandatory but useful.
// MANDORY : the GUI should be a DOM node. WebComponents are
// practical as they encapsulate everyhing in a shadow dom
export default class GraphicEQHTMLElement extends HTMLElement {
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

		this.gridColor = "rgb(235,235,235)";
		this.textColor = "rgb(235, 235, 235)";
		this.nyquist = 0.5 * this.plugin.audioContext.sampleRate;
		this.noctaves = 11;
		this.setSwitchListener();
		this.setCanvas();
		this.draw();

		window.requestAnimationFrame(this.handleAnimationFrame);
	}

	get properties() {
		this.boundingRect = {
			dataWidth: {
				type: Number,
				value: 480
			},
			dataHeight: {
				type: Number,
				value: 350
			}
		};
		return this.boundingRect;
	}

	updateStatus = (status) => {
		this.shadowRoot.querySelector('#switch1').value = status;
	}

	handleAnimationFrame = () => {
		/*
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
		*/
		this.draw();
		window.requestAnimationFrame(this.handleAnimationFrame);
	}

	/**
	 * Change relative URLS to absolute URLs for CSS assets, webaudio controls spritesheets etc.
	 */
	setResources() {
		// Setting up the switches imgs, those are loaded from the assets
		this.root.querySelector("webaudio-switch").setAttribute('src', getAssetUrl(switchImg));
	}

	setKnobs() {

	}

	setSwitchListener() {
		console.log("GraphicEQ : set switch listener");
		const { plugin } = this;
		// by default, plugin is disabled
		plugin.audioNode.setParamsValues({ enabled: 1 });

		this.shadowRoot
			.querySelector('#switch1')
			.addEventListener('change', function onChange() {
				plugin.audioNode.setParamsValues({ enabled: +!!this.checked });
			});
	}
	setCanvas() {
		// canvas
		this.canvas = document.createElement("canvas");
		// get dimensions, by default the ones from the parent element
		this.canvas.classList.add("graphicEQ");
		this.canvas.width = this.width = 430;
		this.canvas.height = this.height = 250;
		this.canvas.style.position = "absolute";
		this.ctx = this.canvas.getContext("2d");
		this.canvasParent = this.root.querySelector("#DivFilterBank");
		this.canvasParent.appendChild(this.canvas);


		this.canvas2 = document.createElement("canvas");
		this.canvas2.classList.add("frequencyMeasure");
		this.canvas2.style.position = "relative";
		this.canvas2.style.top = 0;
		this.canvas2.style.left = 0;
		this.canvas2.width = this.canvas.width;
		this.canvas2.height = this.canvas.height;
		this.canvas2.style.zIndex = -1;
		this.canvasParent.appendChild(this.canvas2);
		this.ctx2 = this.canvas2.getContext("2d");
		this.dbScale = 60;
		//TODO:
		this.pixelsPerDb = (0.5 * this.height) / this.dbScale;

		// listeners
		this.canvas.addEventListener("mousemove", this.processMouseMove.bind(this));
		this.canvas.addEventListener("mousedown", this.processMouseDown.bind(this));
		this.canvas.addEventListener("mouseup", this.processMouseUp.bind(this));

		requestAnimationFrame(this.drawFrequencies.bind(this));

		this.canvas.addEventListener('mouseenter', this.setFocus, false);
		this.canvas.addEventListener('mouseleave', this.unsetFocus, false);
	   /*window.addEventListener('resize',
		(evt) => {
			console.log("resize canvasParent:" + this.canvasParent.clientWidth + " " +  this.canvasParent.clientHeight);
			this.resize(this.canvasParent.clientWidth,
			this.canvasParent.clientHeight);
		});*/

	}

	setFocus(){
		this.focus();
		this.tabIndex=1;
	}

	unsetFocus(){
		this.blur();
		this.tabIndex=-1;
	}

	draw() {
		let ctx = this.ctx;
		ctx.save();

		ctx.clearRect(0, 0, this.width, this.height);

		this.sumCurveParallel = []; // curves of (x, y) pixels thats sums all filter curves
		this.sumCurveSerie = [];

		for (let x = 0; x < this.width; x++) {
			this.sumCurveParallel[x] = 0;
			this.sumCurveSerie[x] = 0;
		}


		this.plugin.audioNode.filters.forEach((filt) => {
			this.drawFilterCurves(filt);
			// draw control point
			this.drawControlPoint(filt);
		});

		this.drawGrid();

		if (this.plugin.audioNode.filters.length > 0) {
			//this.drawSumOfAllFilterCurveParallel();
			this.drawSumOfAllFilterCurveSerie();
		}

		if (this.mode === "dragControlPoint")
			this.drawTooltip();


		ctx.restore();
	}

	//TODO: how to manipulate this function about the zoom of pedalboard
	resize(w, h) {
	//console.log("resize");
	let r = this.canvasParent.getBoundingClientRect();
	let rc = this.canvas.getBoundingClientRect();
	//this.canvas.width = this.width = this.canvasParent.clientWidth - (r.left + rc.left) / 2;
	//this.canvas.height = this.height = this.canvasParent.clientHeight - (r.top + rc.top) / 2;
	this.canvas.width = this.width =window.innerWidth;
	this.canvas.heigth = this.height = window.innerHeight;
	this.canvas2.width = this.canvas.width;
	this.canvas2.height = this.canvas.height;
	this.pixelsPerDb = (0.5 * this.height) / this.dbScale;

	//this.clearCanvas();
	this.draw();
}

	drawFilterCurves(filt) {
		let frequencyHz = new Float32Array(this.canvas.width);
		let magResponse = new Float32Array(this.canvas.width);
		let phaseResponse = new Float32Array(this.canvas.width);
		let ctx = this.ctx;

		ctx.save();
		ctx.globalAlpha = 0.3
		ctx.strokeStyle = "white";
		ctx.fillStyle = filt.color;
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(0, 0);

		// First get response.
		for (let i = 0; i < this.width; i++) {
			let f = i / this.width;

			// Convert to log frequency scale (octaves).
			f = this.nyquist * Math.pow(2.0, this.noctaves * (f - 1.0));

			frequencyHz[i] = f;
		}
		filt.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
		/*
	  var magResponseOfFilter = new Float32Array(width);
	  filt.getFrequencyResponse(frequencyHz, magResponseOfFilter, phaseResponse);
	  // sum it to magResponse
	  for(var l = 0; l < width; l++) {
		magResponse[l] = magResponseOfFilter[l];
	  }
	  */


		// Draw filters curves
		for (let i = 0; i < this.width; i++) {
			let f = magResponse[i];
			let response = magResponse[i];
			let dbResponse = 2 * (10.0 * Math.log(response) / Math.LN10);

			let x = i;
			let y = this.dbToY(dbResponse);

			// curve that sums all filter responses
			this.sumCurveParallel[x] += response;
			this.sumCurveSerie[x] += dbResponse;

			if (i === 0)
				ctx.moveTo(x, y);
			else
				ctx.lineTo(x, y);
		}
		//ctx.lineTo(this.width, this.height);
		ctx.lineTo(this.width, this.height / 2);
		ctx.lineTo(0, this.height / 2);

		ctx.fill();
		//ctx.stroke();

		ctx.restore();
	}

	drawControlPoint(filter) {
		let q = filter.Q.value; // unit = db
		let f = filter.frequency.value;
		let gain = filter.gain.value;

		let x, y;

		//TODO: See this function to know X
		x = this.fToX(f);
		switch (filter.type) {
			case "lowpass":
			case "highpass":
				y = this.dbToY(q);
				break;
			case "lowshelf":
			case "highshelf":
				y = this.dbToY(gain / 2);
				break;
			case "peaking":
				y = this.dbToY(gain);
				break;
			case "notch":
			case "bandpass":
				if (q > 0.16) {
					y = this.dbToY(q);
				}
				break;
		}

		filter.controlPoint = {
			x: x,
			y: y,
		}

		this.drawControlPointAsColoredCircle(x, y, filter.color)
	}

	drawControlPointAsColoredCircle(x, y, color) {
		let ctx = this.ctx;

		ctx.save();

		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(x + 1, y, 5, 0, Math.PI * 2);
		ctx.fill();

		ctx.restore();
	}

	getFontSizeDependingOnWidth() {
		return this.width / 45;
	}
	getFontSizeDependingOnHeight() {
		return this.height / 35;
	}

	drawGrid() {
		let ctx = this.ctx;

		ctx.save();
		let fontSize = this.getFontSizeDependingOnWidth();

		ctx.beginPath();

		ctx.lineWidth = 1;

		ctx.font = "300 " + fontSize + 'px  OpenSans, sans-serif';

		// Draw frequency scale.
		for (let octave = 0; (octave+1) <= this.noctaves; octave++) {
			let x = octave * this.width / this.noctaves;

			ctx.strokeStyle = this.gridColor;
			ctx.moveTo(x, 30);
			ctx.lineTo(x, this.height);
			ctx.stroke();

			let f = this.nyquist * Math.pow(2.0, octave - this.noctaves);
			let value = f.toFixed(0);
			let unit = 'Hz';

			if (f > 1000) {
				unit = 'KHz';
				value = (f / 1000).toFixed(1);
			}

			ctx.textAlign = "center";
			ctx.fillStyle = this.textColor;

			if(octave !== 0)
				ctx.fillText(value + unit, x, 20);
			else
			ctx.fillText(value + unit, 10, 20);
		}


		// Draw 0dB line.
		fontSize = this.getFontSizeDependingOnHeight();
		ctx.font = "300 " + fontSize + 'px  OpenSans, sans-serif';

		ctx.beginPath();
		ctx.moveTo(0, 0.5 * this.height);
		ctx.lineTo(this.width, 0.5 * this.height);
		ctx.stroke();

		// Draw decibel scale.
		let dbIncrement = this.dbScale * 10 / 60;
		for (let db = -this.dbScale; (db+dbIncrement) < this.dbScale; db += dbIncrement) {
			let y = this.dbToY(db);
			ctx.fillStyle = this.textColor;
			ctx.fillText(db.toFixed(0) + "dB", this.width - this.width / 25, y-2);
			ctx.strokeStyle = this.gridColor;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(this.width, y);
			ctx.stroke();
		}

		ctx.restore();
	}

	drawSumOfAllFilterCurveSerie() {
		//console.log("draw sum")
		let ctx = this.ctx;

		ctx.save();
		ctx.strokeStyle = "white";
		ctx.beginPath();
		for (let x = 0; x < this.width; x++) {
			//let y = this.dbToY(0) -
			let dbResponse = this.sumCurveSerie[x];
			let y = this.dbToY(dbResponse);

			//drawControlPointAsColoredCircle(x, y, "red");
			if (y !== NaN) {
				if (x === 0)
					ctx.moveTo(x, y);
				else
					ctx.lineTo(x, y);
			}
			//console.log("x = " + x + " y = " + y)
		}
		ctx.stroke();
		ctx.restore();
	}

	map(value, istart, istop, ostart, ostop) {
		return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
	}

	fToX(f) {
		// logarithmic scale
		var logf = Math.log2(f);
		var logmaxf = Math.log2(this.nyquist); // 24Khz for 11 octaves at 48Khz
		var logminf = Math.log2(10);      // min freq value in our graphic
		var x = this.map(logf, logminf, logmaxf, -this.width / 50, this.width);

		return x;
	}

	dbToY(db) {
		var y = (0.5 * this.height) - this.pixelsPerDb * db;
		return y;
	};

	processMouseMove(e) {
		this.mousePos = this.getMousePos(e);
		e.stopPropagation();
		//console.log(this.mousePos);
		//console.log(this.canvasParent.clientWidth);
		switch (this.mode) {
			case "none":
				// color each control point in red
				this.plugin.audioNode.filters.forEach((f) => {
					this.drawControlPointAsColoredCircle(f.controlPoint.x, f.controlPoint.y, f.color);
				});

				// if mouse close to a control point color it in green
				if (this.selectedFilter = this.findClosestFilterControlPoint(this.mousePos.x, this.mousePos.y)) {
					this.drawControlPointAsColoredCircle(this.selectedFilter.controlPoint.x, this.selectedFilter.controlPoint.y, "red");
				}
				break;
			case "dragControlPoint":
				this.dy = (this.clickedY - this.mousePos.y);

				this.changeFilterParameters(this.selectedFilter, this.mousePos.x, this.mousePos.y, this.shiftPressed, this.dy);

				break;
		}
			return false;
	}

	processMouseDown(e) {
		e.stopPropagation();
		if (this.selectedFilter) {
			this.selectedFilter.originalQValue = this.selectedFilter.Q.value;
			this.mode = "dragControlPoint";
			this.shiftPressed = (e.shiftKey);
			this.clickedY = this.getMousePos(e).y;
			this.drawTooltip();

		}
		// console.log("mode=START DRAGGING");

	}

	processMouseUp(e) {
		this.mode = "none";
		this.selectedFilter = null;
		this.shiftPressed = false;
		this.dy = 0;
		this.draw();
	}

	drawFrequencies() {
		//clear the canvas
		this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height);

		// Get analyser data
		this.plugin.audioNode.analyser.getFloatFrequencyData(this.plugin.audioNode.dataArray);

		var barWidth = [];
		var barHeight;
		var x = 0;

		var analyserRange = this.plugin.audioNode.analyser.maxDecibels - this.plugin.audioNode.analyser.minDecibels;
		// ration between analyser range and our range
		var range = this.dbScale * 2;
		var dbRatio = range / analyserRange;

		for (var i = 0; i < this.plugin.audioNode.bufferLength; i++) {
			// values are all negative
			barHeight = this.dbToY(-this.plugin.audioNode.dataArray[i]);

			barHeight *= dbRatio;

			//this.ctx2.fillStyle = 'rgb(' + (barHeight+100) + ',0,0)';
			this.ctx2.fillStyle = 'red';
			barWidth[i] = (Math.log(i + 2) - Math.log(i + 1)) * this.canvas2.width / Math.log(this.plugin.audioNode.bufferLength - 80);

			this.ctx2.fillRect(x, this.canvas2.height - barHeight, barWidth[i], barHeight);
			// 2 is the number of pixels between bars
			x += barWidth[i] + 1;
		}
		// call again the visualize function at 60 frames/s
		requestAnimationFrame(this.drawFrequencies.bind(this));

	}

	getMousePos(e) {
		let rect = this.canvas.getBoundingClientRect();
		//console.log("cx= " + e.clientX  + " lx= " + e.layerX);
		let mouseX = e.clientX - rect.left;
		let mouseY = e.clientY - rect.top;
		return {
			x: mouseX,
			y: mouseY
		}
	}

	findClosestFilterControlPoint(x, y) {
		for (let i = 0; i < this.plugin.audioNode.filters.length; i++) {
			let f = this.plugin.audioNode.filters[i];
			let cp = f.controlPoint;
			if (this.distance(x, y, cp.x, cp.y) < 5) {
				// mouse cursor is over a control point
				return f;
			}
			//console.log(x, y);
			 //console.log(cp.x, cp.y);
		};
		return null;
	}
	dyToQ(dy) {
		let q;
		if (dy < 0) {
			q = this.map(dy, 0, -100, this.selectedFilter.originalQValue, 0.1);
		} else {
			q = this.map(dy, 0, 100, this.selectedFilter.originalQValue, 15);
		}
		return q;
	}


	distance(x1, y1, x2, y2) {
		let dx = x1 - x2;
		let dy = y1 - y2;

		return Math.sqrt(dx * dx + dy * dy);
	}

	drawTooltip() {
		if (this.mousePos === undefined) return;

		let tooltipWidth = 50, tooltipHeight;
		let displayQ = false, displayGain = false;

		switch (this.selectedFilter.type) {
			case "lowpass":
			case "highpass":
			case "bandpass":
			case "notch":
				displayQ = true;
				displayGain = false;
				tooltipHeight = 44;
				break;
			case "peaking":
				displayQ = true;
				displayGain = true;
				tooltipHeight = 55;
				break;
			case "highshelf":
			case "lowshelf":
				displayQ = false;
				displayGain = true;
				tooltipHeight = 44;
				break;
		}

		let ctx = this.ctx;
		ctx.save();
		if (this.mousePos.x < (this.canvas.width - tooltipWidth))
			ctx.translate(this.mousePos.x, this.mousePos.y);
		else
			ctx.translate(this.mousePos.x - tooltipWidth, this.mousePos.y);

		ctx.fillStyle = "rgba(200, 200, 200, 0.3)";
		ctx.strokeStyle = "rgba(153, 153, 153)";
		ctx.beginPath();
		ctx.rect(10, 0, tooltipWidth, tooltipHeight);
		ctx.fill();
		ctx.stroke()

		ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
		ctx.font = "11px OpenSans, sanserif";

		let xText = 12;
		ctx.fillText(this.selectedFilter.type, 15, xText);
		xText += 13;

		ctx.fillText(this.selectedFilter.frequency.value.toFixed(0) + "Hz", 15, xText);
		xText += 13;

		if (displayGain) {
			ctx.fillText(this.selectedFilter.gain.value.toFixed(0) + "dB/Oct", 15, 38);
			xText += 13;
		}

		if (displayQ)
			ctx.fillText(this.selectedFilter.Q.value.toFixed(3), 15, xText);

		ctx.restore();

	}

	changeFilterParameters(filter, x, y, shiftPressed, dy) {
		// x = frequency, y = Db
		let db = this.yToDb(y);
		let f = this.xToF(x);
		//console.log("f = " + f + " db = " + db);

		const index = this.plugin.audioNode.filters.indexOf(filter);
		this.plugin.audioNode.setParamValue(`${filter.type}_${index}_frequency`, f);
		// filter.frequency.value = f;

		switch (filter.type) {
			case "lowpass":
			case "highpass":
				// Here important! Do not code with this.plugin.audioNode.Q = but instead use the exposed param names
				// and setParamValue from CompositeAudioNode if you want getState/setState + automation to work
				this.plugin.audioNode.setParamValue(`${filter.type}_${index}_Q`, db);
				// filter.Q.value = db;
				this.draw();
				break;
			case "lowshelf":
			case "highshelf":
				this.plugin.audioNode.setParamValue(`${filter.type}_${index}_gain`, 2 * db);
				// filter.gain.value = 2 * db;
				this.draw();
				break;
			case "peaking":
				if (!shiftPressed)
					this.plugin.audioNode.setParamValue(`${filter.type}_${index}_gain`, db);
					// filter.gain.value = db;
				else {
					this.plugin.audioNode.setParamValue(`${filter.type}_${index}_Q`, this.dyToQ(dy));
					// filter.Q.value = this.dyToQ(dy);
				}
				this.draw();
				break;
			case "notch":
				if (!shiftPressed)
					this.plugin.audioNode.setParamValue(`${filter.type}_${index}_gain`, db);
					// filter.gain.value = db;
				else {
					this.plugin.audioNode.setParamValue(`${filter.type}_${index}_Q`, this.dyToQ(dy));
					// filter.Q.value = this.dyToQ(dy);
				}
				this.draw();
				break;
			case "bandpass":
				if (db >= 0.16)
					this.plugin.audioNode.setParamValue(`${filter.type}_${index}_Q`, db);
					// filter.Q.value = db;
				this.draw();
				break;
		}
	}

	yToDb(y) {
		var db = ((0.5 * this.height) - y) / this.pixelsPerDb;
		return db;
	};

	xToF(x) {
		// x corresponds to a freq in log scale
		// logarithmic scale
		var logmaxf = Math.log2(this.nyquist); // 24Khz for 11 octaves at 48Khz
		var logminf = Math.log2(10);      // min freq value in our graphic
		var flog = this.map(x, -this.width / 50, this.width, logminf, logmaxf);
		return Math.pow(2, flog); // reverse of a log function is 2^logf
	}

	/*
	bypass() {
		this.plugin.params.state = "disable";
		this.plugin.audioNode.connectNodes();
	}
	reactivate() {
		this.plugin.params.state = "enable";
		this.plugin.audioNode.connectNodes();
	}
*/
	letDrag() {
		this.root.querySelector("#DivFilterBank").draggable = true;

	}

	// name of the custom HTML element associated
	// with the plugin. Will appear in the DOM if
	// the plugin is visible
	static is() {
        return 'wasabi-graphic-eq';
    }
}

if (!customElements.get(GraphicEQHTMLElement.is())) {
	customElements.define(GraphicEQHTMLElement.is(), GraphicEQHTMLElement);
}
