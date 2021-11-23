/* eslint-disable no-underscore-dangle */

// SDK
import WebAudioModule from '../../sdk/src/WebAudioModule.js';
// DSP
import WamExampleNode from './WamExampleNode.js';
// GUI
import { createElement } from './Gui/index.js';

/**
 * @param {URL} relativeUrl
 * @returns {string}
 */
const getBaseUrl = (relativeUrl) => {
	const baseUrl = relativeUrl.href.substring(0, relativeUrl.href.lastIndexOf('/'));
	return baseUrl;
};

/**
 * @extends {WebAudioModule<WamExampleNode>}
 */
export default class WamExamplePlugin extends WebAudioModule {
	_baseUrl = getBaseUrl(new URL('.', import.meta.url));

	_descriptorUrl = `${this._baseUrl}/descriptor.json`;

	async initialize(state) {
		await this._loadDescriptor();
		return super.initialize(state);
	}

	async createAudioNode(initialState) {
		// DSP is implemented in WamExampleProcessor.
		await WamExampleNode.addModules(this.audioContext, this.moduleId);
		const wamExampleNode = new WamExampleNode(this, {});
		await wamExampleNode._initialize();

		// Set initial state if applicable
		if (initialState) wamExampleNode.setState(initialState);

		return wamExampleNode;
	}

	createGui() {
		return createElement(this);
	}
}
