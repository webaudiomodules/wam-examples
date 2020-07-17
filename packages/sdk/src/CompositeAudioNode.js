/* eslint-disable max-len */
/* eslint-disable lines-between-class-members */
/* eslint-disable no-empty-function */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/** @typedef {import('./api/WamTypes').WamNode} WamNode */

/**
 * @implements {WamNode}
 */
export default class CompositeAudioNode extends GainNode {
	/**
	 * @type {AudioNode}
	 */
	_input = undefined;
	/**
	 * @type {AudioNode}
	 */
	_output = undefined;
	/**
	 * @type {WamNode}
	 */
	_main = undefined;

	constructor(audioContext, options) {
		super(audioContext);
		this.options = options;
	}
	get processorId() { return this._main.processorId; }
	get instanceId() { return this._main.instanceId; }
	get module() { return this._main.module; }
	getCompensationDelay() { return this._main.getCompensationDelay(); }
	getParameterInfo(parameterIdQuery) { return this._main.getParameterInfo(parameterIdQuery); }
	getParameterValues(normalized, parameterIdQuery) { return this._main.getParameterValues(normalized, parameterIdQuery); }
	setParameterValues(parameterValues) { return this._main.setParameterValues(parameterValues); }
	setState(state) { return this._main.setState(state); }
	getState() { return this._main.getState(); }
	destroy() { return this._main.destroy(); }
	get onprocessorerror() { return this._main.onprocessorerror; }
	set onprocessorerror(callback) { this._main.onprocessorerror = callback; }
	get parameters() { return this._main.parameters; }
	get port() { return this._main.port; }

	set channelCount(count) {
		this._output.channelCount = count;
	}

	get channelCount() {
		return this._output.channelCount;
	}

	set channelCountMode(mode) {
		this._output.channelCountMode = mode;
	}

	get channelCountMode() {
		return this._output.channelCountMode;
	}

	set channelInterpretation(interpretation) {
		this._output.channelInterpretation = interpretation;
	}

	get channelInterpretation() {
		return this._output.channelInterpretation;
	}

	get numberOfInputs() {
		return this._input.numberOfInputs;
	}

	get numberOfOutputs() {
		return this._output.numberOfOutputs;
	}

	get gain() {
		return undefined;
	}

	connect(...args) {
		return this._output.connect(...args);
	}

	disconnect(...args) {
		return this._output.disconnect(...args);
	}

	createNodes() {
		this._input = this.context.createGain();
		this._output = this.context.createGain();
	}

	connectNodes() {
		super.connect(this._input);
	}

	setup() {
		this.createNodes();
		this.connectNodes();
	}
}
