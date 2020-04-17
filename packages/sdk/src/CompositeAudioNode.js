/* eslint-disable no-underscore-dangle */
export default class CompositeAudioNode extends GainNode {
	constructor(plugin, options) {
		super(plugin.audioContext);
		this.plugin = plugin;
		this.options = options;
	}

	connect(...args) {
		this._output.connect(...args);
	}

	disconnect(...args) {
		this._output.disconnect(...args);
	}

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

	createNodes() {
		this._input = this.context.createGain();
		this._output = this.context.createGain();
	}

	connectNodes() {
		super.connect(this._input); // ?
	}

	setup() {
		this.createNodes();
		this.connectNodes();
		this.updateState();
		this.plugin.addEventListener('change', this.updateState);
	}
}
