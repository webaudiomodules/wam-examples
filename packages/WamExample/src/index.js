/* eslint-disable no-underscore-dangle */
// SDK
import WebAudioModule from '../../sdk/src/WebAudioModule.js';
// DSP
import WamExampleNode from './WamExampleNode.js';
// GUI
import { createElement } from './Gui/index.js';

/**
 * @param {URL} relativeURL
 * @returns {string}
 */
const getBaseUrl = (relativeURL) => {
	const baseURL = relativeURL.href.substring(0, relativeURL.href.lastIndexOf('/'));
	return baseURL;
};

/**
 * @extends {WebAudioModule<WamExampleNode>}
 */
export default class WamExamplePlugin extends WebAudioModule {
	_baseURL = getBaseUrl(new URL('.', import.meta.url));

	_descriptorUrl = `${this._baseURL}/descriptor.json`;

	async initialize(state) {
		await this._loadDescriptor();
		return super.initialize(state);
	}

	async createAudioNode(initialState) {
		// DSP is implemented in WamExampleProcessor.
		await WamExampleNode.addModules(this.audioContext, this._baseURL);
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
