/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */
import WebAudioModule from '../sdk/src/WebAudioModule.js';
import ParamMgrFactory from '../sdk/src/ParamMgr/ParamMgrFactory.js';
import CompositeAudioNode from '../sdk/src/ParamMgr/CompositeAudioNode.js';

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
	 * @param {AudioWorkletNode} output
	 * @param {import('../sdk/src/ParamMgr/types').ParamMgrNode} paramMgr
	 */
	setup(output, paramMgr) {
		this.connect(output, 0, 0);
		this._wamNode = paramMgr;
		this._output = output;
	}

	destroy() {
		super.destroy();
		if (this._output) this._output.parameters.get('destroyed').value = 1;
	}
}

export default class RandomNotePlugin extends WebAudioModule {
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
		await this.audioContext.audioWorklet.addModule(`${this._baseURL}/processor.worklet.js`);
		const randomizerNode = new AudioWorkletNode(this.audioContext, '__WebAudioModule_RandomNoteProcessor', { processorOptions: { proxyId: this.instanceId } });

		const node = new Node(this.audioContext);
		const internalParamsConfig = Object.fromEntries(randomizerNode.parameters);
		delete internalParamsConfig.destroyed;
		const optionsIn = { internalParamsConfig };
		const paramMgrNode = await ParamMgrFactory.create(this, optionsIn);
		node.setup(randomizerNode, paramMgrNode);

		// If there is an initial state at construction for this plugin,
		if (initialState) node.setState(initialState);

		node.connect(this.audioContext.destination);

		return node;
	}

	createGui() {
		return document.createElement('div');
	}
}
