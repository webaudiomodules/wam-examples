/* eslint-disable lines-between-class-members */
/* eslint-disable no-empty-function */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

import ParamMgrNode from './ParamMgrNode.js';

export default class CompositeAudioNode extends ParamMgrNode {
	_output = undefined;
	connect(...args) {
		if (this._output) return this._output.connect(...args);
		// @ts-ignore
		return super.connect(...args);
	}
	disconnect(...args) {
		if (this._output) return this._output.disconnect(...args);
		// @ts-ignore
		return super.disconnect(...args);
	}
}
