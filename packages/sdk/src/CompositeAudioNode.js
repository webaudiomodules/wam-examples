/* eslint-disable no-unused-vars */
/* eslint-disable no-empty-function */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
export default class CompositeAudioNode extends GainNode {
	constructor(audioContext, options) {
		super(audioContext);
		// this.plugin = options.plugin;
		// this.options = options;
	}

	set channelCount(count) {
	}

	get channelCount() {
		return undefined;
	}

	set channelCountMode(mode) {
	}

	get channelCountMode() {
		return undefined;
	}

	set channelInterpretation(interpretation) {
	}

	get channelInterpretation() {
		return undefined;
	}

	get numberOfInputs() {
		return super.numberOfInputs;
	}

	get numberOfOutputs() {
		return this._output.numberOfOutputs;
	}

	get gain() {
		return undefined;
	}

	connect(...args) {
		this._output.connect(...args);
	}

	disconnect(...args) {
		this._output.disconnect(...args);
	}

	// Why we need MIDI in CompositeNode?
	/*
	connectMidi(dest, outindex, inindex) {
		if (typeof outindex === 'undefined') outindex = 0;
		if (typeof inindex === 'undefined') inindex = 0;
		if (dest && this.outputsMidi[outindex] && dest.inputsMidi[inindex]) {
			this.outputsMidi[outindex].connect(dest.inputsMidi[inindex]);
		}
	}

	disconnectMidi(dest, outindex, inindex) {
		if (typeof outindex === 'undefined') outindex = 0;
		if (typeof inindex === 'undefined') inindex = 0;
		if (dest && this.outputsMidi[outindex] && dest.inputsMidi[inindex]) {
			this.outputsMidi[outindex].disconnect(dest.inputsMidi[inindex]);
		}
	}
	*/
	async createNodes() {
		this._input = this.context.createGain();
		this._output = this.context.createGain();
	}

	connectNodes() {
		super.connect(this._input); // We have 3 GainNodes in the class, super, _input and _output
	}

	async setup() {
		await this.createNodes();
		this.connectNodes();
		// this.updateState();
		// this.plugin.addEventListener('change', this.updateState);
	}
}
