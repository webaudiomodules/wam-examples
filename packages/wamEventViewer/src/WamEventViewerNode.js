/** @template Node @typedef {import('../../sdk/src').WebAudioModule<Node>} WebAudioModule */
/** @typedef {import('../../api/src').WamEventType} WamEventType */

import addFunctionModule from '../../sdk/src/addFunctionModule.js';
import WamNode from '../../sdk/src/WamNode.js';
import getWamEventViewerProcessor from './WamEventViewerProcessor.js';

class WamEventViewerNode extends WamNode {
	/**
	 * Register scripts required for the processor. Must be called before constructor.
	 * @param {BaseAudioContext} audioContext
	 * @param {string} moduleId
	 */
    static async addModules(audioContext, moduleId) {
		const { audioWorklet } = audioContext;
		await super.addModules(audioContext, moduleId);
		await addFunctionModule(audioWorklet, getWamEventViewerProcessor, moduleId);
	}
}

export default WamEventViewerNode;
