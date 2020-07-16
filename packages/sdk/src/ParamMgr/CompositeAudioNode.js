/* eslint-disable lines-between-class-members */
/* eslint-disable no-empty-function */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

import ParamMgrNode from './ParamMgrNode';

export default class CompositeAudioNode extends ParamMgrNode {
	get input() { return this._input; }

	get output() { return this._output; }

	set channelCount(count) {}
	get channelCount() { return super.channelCount; }

	set channelCountMode(mode) {}
	get channelCountMode() { return super.channelCountMode; }

	set channelInterpretation(interpretation) {}
	get channelInterpretation() { return super.channelInterpretation; }

	get numberOfInputs() { return super.numberOfInputs; }
	get numberOfOutputs() { return this.output.numberOfOutputs; }

	connect(...args) { return this.output.connect(...args); }

	disconnect(...args) { return this.output.disconnect(...args); }

	createNodes() {
		this._input = this;
		this._output = this;
	}

	connectNodes() {}

	setup() {
		this.createNodes();
		this.connectNodes();
	}
}
