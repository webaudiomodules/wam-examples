/* eslint-disable no-console */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
import { CompositeAudioNode } from '@webaudiomodules/sdk-parammgr';

// name is not so important here, the file Node.js is imported
// Normally the class does no need to be exported as
// an async mehod createNode is expored at the end of this
// file.
export default class QuadrafuzzNode extends CompositeAudioNode {
	/**
	 * @type {ParamMgrNode}
	 */
	_wamNode = undefined;

	/**
	 * @param {ParamMgrNode} wamNode
	 */
	// Mandatory.
	setup(wamNode) {
		this._wamNode = wamNode;
		this.connectNodes();
	}

	constructor(context, options) {
		super(context, options);
		this.createNodes();
	}

	/*  #########  Personnal code for the web audio graph  #########   */
	createNodes() {
		// mandatory, will create defaul input and output

		this.outputNode = this.context.createGain();
		this.dryGainNode = this.context.createGain();
		this.wetGainNode = this.context.createGain();

		this.lowpassLeft = this.context.createBiquadFilter();
		this.lowpassLeft.type = 'lowpass';
		this.lowpassLeft.frequency.value = 147;
		this.lowpassLeft.Q.value = 0.7071;

		this.bandpass1Left = this.context.createBiquadFilter();
		this.bandpass1Left.type = 'bandpass';
		this.bandpass1Left.frequency.value = 587;
		this.bandpass1Left.Q.value = 0.7071;

		this.bandpass2Left = this.context.createBiquadFilter();
		this.bandpass2Left.type = 'bandpass';
		this.bandpass2Left.frequency.value = 2490;
		this.bandpass2Left.Q.value = 0.7071;

		this.highpassLeft = this.context.createBiquadFilter();
		this.highpassLeft.type = 'highpass';
		this.highpassLeft.frequency.value = 4980;
		this.highpassLeft.Q.value = 0.7071;

		this.overdrives = [];
		for (let i = 0; i < 4; i++) {
			this.overdrives[i] = this.context.createWaveShaper();
			this.overdrives[i].curve = this.getDistortionCurve(this.normalize(0.5, 0, 150));
		}
	}

	connectNodes() {
		this.connect(this.wetGainNode);
		this.connect(this.dryGainNode);
		this._output = this.outputNode;
		this.dryGainNode.connect(this._output);

		const filters = [
			this.lowpassLeft,
			this.bandpass1Left,
			this.bandpass2Left,
			this.highpassLeft,
		];
		for (let i = 0; i < filters.length; i++) {
			//this.wetGainNode.connect(this._output)
			this.wetGainNode.connect(filters[i]);
			//this.wetGainNode.connect(this.overdrives[i]);
			//filters[i].connect(this._output);
			filters[i].connect(this.overdrives[i]);
			this.overdrives[i].connect(this._output);
			//filters[i].connect(this._output);
		}
	}

	/**
     * Tools to build sounds
     */
	getDistortionCurve(k) {
		console.log(`GET DISTORSION CURVE k = ${k}`);
		const { sampleRate } = this.context;
		const curve = new Float32Array(sampleRate);
		const deg = Math.PI / 180;

		for (let i = 0; i < sampleRate; i++) {
			const x = i * 2 / sampleRate - 1;
			curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
		}
		return curve;
	}

	isInRange(arg, min, max) {
		if (!this.isNumber(arg) || !this.isNumber(min) || !this.isNumber(max)) return false;

		return arg >= min && arg <= max;
	}


	// Takes a number from 0 to 1 and normalizes it to fit within range floor to ceiling
	normalize(num, floor, ceil) {
		if (!this.isNumber(num) || !this.isNumber(floor) || !this.isNumber(ceil)) return num;

		return ((ceil - floor) * num) / 1 + floor;
	}


	// Setter part, it is here that you define the link between the params and the nodes values.
	set lowGain(_lowGain) {
		console.log(`set lowGain : ${_lowGain}`);
		if (!this.isInRange(_lowGain, 0, 1)) return;
		//this.params.lowgain = _lowGain;
		this.overdrives[0].curve = this.getDistortionCurve(this.normalize(_lowGain, 0, 150));
	}

	set midLowGain(_midLowGain) {
		console.log('midLowGain');

		if (!this.isInRange(_midLowGain, 0, 1)) return;
		// this.params.midlowgain = _midLowGain;
		this.overdrives[1].curve = this.getDistortionCurve(this.normalize(_midLowGain, 0, 150));
	}

	set midHighGain(_midHighGain) {
		console.log('midHighGain');

		if (!this.isInRange(_midHighGain, 0, 1)) return;
		// this.params.midhighgain = _midHighGain;
		this.overdrives[2].curve = this.getDistortionCurve(this.normalize(_midHighGain, 0, 150));
	}

	set highGain(_highGain) {
		console.log('highGain');

		if (!this.isInRange(_highGain, 0, 1)) return;
		//this.params.highgain = _highGain;
		this.overdrives[3].curve = this.getDistortionCurve(this.normalize(_highGain, 0, 150));
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

	// delay tools
	// Tools to build sounds
	// eslint-disable-next-line class-methods-use-this
	isNumber(arg) {
		return toString.call(arg) === '[object Number]' && arg === +arg;
	}

	getDryLevel(mix) {
		if (!this.isNumber(mix) || mix > 1 || mix < 0) return 0;
		if (mix <= 0.5) return 1;
		return 1 - (mix - 0.5) * 2;
	}

	getWetLevel(mix) {
		if (!this.isNumber(mix) || mix > 1 || mix < 0) return 0;
		if (mix >= 0.5) return 1;
		return 1 - (0.5 - mix) * 2;
	}

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
