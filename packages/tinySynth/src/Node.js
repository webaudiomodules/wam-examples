/** @typedef { import('../../sdk/src/ParamMgr/ParamMgrNode').default } ParamMgrNode */
/* eslint-disable no-console */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
import CompositeAudioNode from '../../sdk/src/ParamMgr/CompositeAudioNode.js';
import '../utils/webaudio-tinysynth.js';

// name is not so important here, the file Node.js is imported by the main plugin file (index.js)
export default class TinySynthNode extends CompositeAudioNode {
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

		this.synth = new WebAudioTinySynth();
	}

	/*  #########  Personnal code for the web audio graph  #########   */
	createNodes() {
		// mandatory, will create defaul input and output

		this.outputNode = this.context.createGain();
		this.dryGainNode = this.context.createGain();
		this.wetGainNode = this.context.createGain();
	}

	connectNodes() {
		this.connect(this.wetGainNode);
		this.connect(this.dryGainNode);
		this._output = this.outputNode;
		this.dryGainNode.connect(this._output);
	}


	isEnabled = true;

	set status(_sig) {
		if (this.isEnabled === _sig) return;

		this.isEnabled = _sig;
		if (_sig) {
			//console.log('BYPASS MODE OFF FX RUNNING');
			this.wetGainNode.gain.linearRampToValueAtTime(1, this.context.currentTime + 0.5);
			this.dryGainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.5);
		} else {
			//console.log('BYPASS MODE ON');
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
    // -----------------------------------
}
