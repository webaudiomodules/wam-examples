/* eslint-disable no-underscore-dangle */
export default class CompositeAudioNode {
	get _isCompositeAudioNode() {
		return true;
	}

	constructor(context, URL, options) {
		this.context = context;
		this.URL = URL;
		this.options = options;
		/**
		 *
		 * @param {AudioContext} context
		 * @param {JSON} options optional, if you want to set alternate values from the defaultOptions below
		 */
		const defaultValues = options
			? options
			: {
					numberOfInputs: 1,
					numberOfOutputs: 1,
					channelCount: 2,
					channelCountMode: 'Max',
					channelInterpretation: 'speakers',
			  };
		this._numberOfInputs = defaultValues.numberOfInputs;
		this._numberOfOutputs = defaultValues.numberOfOutputs;
		this._channelCount = defaultValues.channelCount;
		this._channelCountMode = defaultValues.channelCountMode;
		this._channelInterpretation = defaultValues.channelInterpretation;

		/**
		 * Initial I/O structur and and I/O  of the composite node
		 *
		 */
		this.inputs = [];
		this.outputs = [];
		this.inputsMidi = [];
		this.outputsMidi = [];
		this._input = this.context.createGain();
		this._output = this.context.createGain();
		this.inputs.push(this._input);
		this.outputs.push(this._output);
	}

	connect() {
		for (let i = 0; i < this.outputs.length; i++) {
			this.outputs[i].connect.apply(this._output, arguments);
		}
	}

	disconnect() {
		this._output.disconnect.apply(this._output, arguments);
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
}
