/* eslint-disable no-underscore-dangle */

// SDK
import WebAudioModule from '../../sdk/src/WebAudioModule.js';
// DSP
import WamExampleTemplateNode from './WamExampleTemplateNode.js';
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
export default class WamExampleTemplatePlugin extends WebAudioModule {
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
		// DSP is implemented in WamExampleTemplateProcessor.
		await this._audioContext.audioWorklet.addModule(`${this._baseURL}/../../sdk/src/RingBuffer.js`);
		await this._audioContext.audioWorklet.addModule(`${this._baseURL}/../../sdk/src/WamEventRingBuffer.js`);
		await this._audioContext.audioWorklet.addModule(`${this._baseURL}/../../sdk/src/WamEnv.js`);
		await this._audioContext.audioWorklet.addModule(`${this._baseURL}/../../sdk/src/WamParameter.js`);
		await this._audioContext.audioWorklet.addModule(`${this._baseURL}/../../sdk/src/WamParameterInfo.js`);
		await this._audioContext.audioWorklet.addModule(`${this._baseURL}/../../sdk/src/WamParameterInterpolator.js`);
		await this._audioContext.audioWorklet.addModule(`${this._baseURL}/../../sdk/src/WamProcessor.js`);
		await this._audioContext.audioWorklet.addModule(`${this._baseURL}/WamExampleTemplateSynth.js`);
		await this._audioContext.audioWorklet.addModule(`${this._baseURL}/WamExampleTemplateEffect.js`);
		await this._audioContext.audioWorklet.addModule(`${this._baseURL}/WamExampleTemplateProcessor.js`);

		const wamExampleTemplateNode = new WamExampleTemplateNode(this, {});
		await wamExampleTemplateNode._initialize();

		// Set initial state if applicable
		if (initialState) wamExampleTemplateNode.setState(initialState);

		return wamExampleTemplateNode;
	}

	createGui() {
		return createElement(this);
	}
}
