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

// Definition of a new plugin
// All plugins must inherit from WebAudioModule
export default class WamExamplePlugin extends WebAudioModule {
	_baseURL = getBaseUrl(new URL('.', import.meta.url));

	_descriptorUrl = `${this._baseURL}/descriptor.json`;

	async _loadDescriptor() {
		const url = this._descriptorUrl;
		if (!url) throw new TypeError('Descriptor not found');
		const response = await fetch(url);
		const descriptor = await response.json();
		Object.assign(this.descriptor, descriptor);
	}

	async initialize(state) {
		await this._loadDescriptor();
		return super.initialize(state);
	}

	async createAudioNode(initialState) {
		// DSP is implemented in WamExampleProcessor.
		await this._audioContext.audioWorklet.addModule(`${this._baseURL}/../../sdk/src/WamParameter.js`);
		await this._audioContext.audioWorklet.addModule(`${this._baseURL}/../../sdk/src/WamParameterInfo.js`);
		await this._audioContext.audioWorklet.addModule(`${this._baseURL}/../../sdk/src/WamParameterInterpolator.js`);
		await this._audioContext.audioWorklet.addModule(`${this._baseURL}/../../sdk/src/WamProcessor.js`);
		await this._audioContext.audioWorklet.addModule(`${this._baseURL}/WamExampleProcessor.js`);

		const wamExampleNode = new WamExampleNode(this, {});

		// Initialize if applicable
		if (initialState) wamExampleNode.setState(initialState);

		return wamExampleNode;
	}

	createGui() {
		return createElement(this);
	}
}
