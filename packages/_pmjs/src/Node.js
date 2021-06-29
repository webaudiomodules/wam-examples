/** @typedef {import('../../sdk/src/ParamMgr/ParamMgrNode').default} ParamMgrNode */
import CompositeAudioNode from '../../sdk/src/ParamMgr/CompositeAudioNode.js';

/**
 * The CompositeAudioNode will proxy all the WamNode API via the `_wamNode` property.
 * We just need to make our audio graph inside.
 */
export default class TemplateWamNode extends CompositeAudioNode {
	createNodes() {
		this.gainNode = this.context.createGain();
		this.delayNode = this.context.createDelay();
		this.feedbackNode = this.context.createGain();
	}
	/**
	 * @param {ParamMgrNode} wamNode
	 */
	setup(wamNode) {
		this._wamNode = wamNode;
		this.connect(this.gainNode);
		this.gainNode.connect(this.delayNode);
		this.delayNode.connect(this.feedbackNode);
		this.feedbackNode.connect(this.gainNode);
		// Assign the output at the end of the setup as this will change the behavior of `this.connect`.
		this._output = this.gainNode;
	}
}
