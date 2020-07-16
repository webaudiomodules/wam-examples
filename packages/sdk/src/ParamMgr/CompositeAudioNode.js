/* eslint-disable lines-between-class-members */
/* eslint-disable no-empty-function */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

import ParamMgrNode from './ParamMgrNode.js';

export default class CompositeAudioNode extends ParamMgrNode {
	// @ts-ignore
	_connect(...args) { super._connect(...args); }

	// @ts-ignore
	_disconnect(...args) { super._disconnect(...args); }

	get output() { return this._output; }

	connect = (...args) => { return this.output.connect(...args); }

	disconnect = (...args) => { return this.output.disconnect(...args); }

	createNodes() {
		this._output = this;
	}

	connectNodes() {}

	setup() {
		this.createNodes();
		this.connectNodes();
	}
}
