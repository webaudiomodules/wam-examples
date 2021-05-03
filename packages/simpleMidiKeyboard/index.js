/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */
import WebAudioModule from '../sdk/src/WebAudioModule.js';
import ParamMgrFactory from '../sdk/src/ParamMgr/ParamMgrFactory.js';
import CompositeAudioNode from '../sdk/src/ParamMgr/CompositeAudioNode.js';
import KeyboardUI from './KeyboardUI.js';

/**
 * @param {URL} relativeURL
 * @returns {string}
 */
const getBasetUrl = (relativeURL) => {
	const baseURL = relativeURL.href.substring(0, relativeURL.href.lastIndexOf('/'));
	return baseURL;
};

class Node extends CompositeAudioNode {
	/**
	 * @param {import('../sdk/src/ParamMgr/types').ParamMgrNode} paramMgr
	 */
	setup(paramMgr) {
		this._wamNode = paramMgr;
		this._output = paramMgr;
	}
}

export default class KeyboardPlugin extends WebAudioModule {
	_baseURL = getBasetUrl(new URL('.', import.meta.url));

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
		const paramMgrNode = await ParamMgrFactory.create(this, {});
		const node = new Node(this.audioContext);
		node.setup(paramMgrNode);

		// If there is an initial state at construction for this plugin,
		if (initialState) node.setState(initialState);

		node.connect(this.audioContext.destination);

		return node;
	}

	async createGui() {
		const keyboard = new KeyboardUI();
		keyboard.onMidi = (bytes) => this.audioNode?._wamNode.emitEvents({ type: 'midi', time: this.audioContext.currentTime, data: { bytes } });
		return keyboard;
	}
}
