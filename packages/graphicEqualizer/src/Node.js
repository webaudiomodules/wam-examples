/** @typedef { import('../../sdk-parammgr').ParamMgrNode } ParamMgrNode */
/* eslint-disable no-console */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
import CompositeAudioNode from '../../sdk-parammgr/src/CompositeAudioNode.js';

// name is not so important here, the file Node.js is imported by the main plugin file (index.js)
export default class GraphicEQNode extends CompositeAudioNode {
	/**
	 * @type {ParamMgrNode}
	 */
	_wamNode = undefined;
	/**
	 * @type {(BiquadFilterNode & { type: string })[]}
	 */
	filters = [];

	/**
	 * @param {ParamMgrNode} wamNode
	 */
	// Mandatory.
	setup(wamNode) {
		this._wamNode = wamNode;
		this.connectNodes();

	}
	createNodes() {
		console.log("create nodes")

		// for dry/wet route
		this.outputNode = this.context.createGain();
		this.dryGainNode = this.context.createGain();
		this.wetGainNode = this.context.createGain();

		// filter bank
        this.addFilter("highpass", 0.00001, 40, 12, "red");
        this.addFilter("lowshelf", 0, 80, 0, "yellow");
        this.addFilter("peaking", 1, 230, 0, "green");
        this.addFilter("peaking", 1, 2500, 0, "turquoise");
        this.addFilter("peaking", 1, 5000, 0, "blue");
        this.addFilter("highshelf", 1, 10000, 0, "violet");
        this.addFilter("lowpass", 0.00001, 18000, 12, "red");

        // connect also to an analyser node
        // Create an analyser node
        this.analyser = this.context.createAnalyser(); 

        // Try changing for lower values: 512, 256, 128, 64...
        this.analyser.fftSize = 512;
        this.analyser.smoothingTimeConstant = 0.9;
        //this.analyser.minDecibels = -this.dbScale;
        //this.analyser.maxDecibels = this.dbScale;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Float32Array(this.bufferLength);

        var analyserRange = this.analyser.maxDecibels - this.analyser.minDecibels;
        // ration between analyser range and our range
        //var range = this.dbScale * 2;
        //this.dbRatio = range / analyserRange;
        //console.log("arange = " + analyserRange);
        //console.log("range = " + range);
        //console.log("ratio = " + this.dbRatio);
    }

    connectNodes() {
		// dry / wet route
		this.connect(this.wetGainNode);
		this.connect(this.dryGainNode);
		this._output = this.outputNode;
		this.dryGainNode.connect(this._output);

		for (let i = 0; i < this.filters.length; i++) {
			let f = this.filters[i];

			if (i === 0) {
				// connect inputGain to first filter
				this.wetGainNode.connect(f);
			} else {
				this.filters[i - 1].connect(f);
			}
		}
		// connect last filter to outputGain
		this.filters[this.filters.length - 1].connect(this._output);
		this._output.connect(this.analyser);
    }

//------------
addFilter(type, Q, f, g, color) {
	let filter = this.context.createBiquadFilter();
	filter.type = type;
	filter.Q.value = Q;
	filter.frequency.value = f;
	filter.gain.value = g;
	filter.color = color;
	this.filters.push(filter);
}

// ---- params
setParam(key, value) {
	console.log(key, value);
	try {
		this[key] = (value);
	} catch (error) {
		console.log(key, error)
		console.warn("this plugin does not implement this param")
	}
}



	isEnabled = true;

	set status(_sig) {
		if (this.isEnabled === _sig) return;

		this.isEnabled = _sig;
		if (_sig) {
			console.log('BYPASS MODE OFF FX RUNNING');
			this.wetGainNode.gain.linearRampToValueAtTime(1, this.context.currentTime + 0.5);
			this.dryGainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.5);
		} else {
			console.log('BYPASS MODE ON');
			this.wetGainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.5);
			this.dryGainNode.gain.linearRampToValueAtTime(1, this.context.currentTime + 0.5);
		}
	}

	// MANDATORY : redefine these methods
	// eslint-disable-next-line class-methods-use-this
	getParamValue(name) {
		return this._wamNode.getParamValue(name);
	}
 
	setParamValue(name, value) {
		return this._wamNode.setParamValue(name, value);
	}

	getParamsValues() {
		return this._wamNode.getParamsValues();
	}

	setParamsValues(values) {
		return this._wamNode.setParamsValues(values);
	}

}
