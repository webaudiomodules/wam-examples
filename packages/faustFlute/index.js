/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
/* eslint-disable import/extensions */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */
import WebAudioModule from '../sdk/src/WebAudioModule.js';
import CompositeAudioNode from '../sdk-parammgr/src/CompositeAudioNode.js';
import ParamMgrFactory from '../sdk-parammgr/src/ParamMgrFactory.js';
import createElement from './gui.js';
import fetchModule from './fetchModule.js';

/**
 * @typedef {import('../sdk-parammgr').ParamMgrNode} ParamMgrNode
 */

class FaustCompositeAudioNode extends CompositeAudioNode {
	/**
	 * @type {ParamMgrNode}
	 */
	_wamNode;

	/**
	 * @param {AudioWorkletNode} output
	 * @param {ParamMgrNode} paramMgr
	 */
	setup(output, paramMgr) {
		output.connect(this, 0, 0);
		paramMgr.addEventListener('wam-midi', (e) => output.midiMessage(e.detail.data.bytes));
		this._wamNode = paramMgr;
		this._output = output;
	}

	destroy() {
		super.destroy();
		if (this._output) this._output.destroy();
	}

	/**
	 * @param {string} name
	 */
	getParamValue(name) {
		return this._wamNode.getParamValue(name);
	}

	/**
	 * @param {string} name
	 * @param {number} value
	 */
	setParamValue(name, value) {
		return this._wamNode.setParamValue(name, value);
	}
}

/**
 * @param {URL} relativeURL
 * @returns {string}
 */
const getBasetUrl = (relativeURL) => {
	const baseURL = relativeURL.href.substring(0, relativeURL.href.lastIndexOf('/'));
	return baseURL;
};

export default class FaustFlute extends WebAudioModule {
	/**
	 * Faust generated WebAudio AudioWorkletNode Constructor
	 */
	_PluginFactory;

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
		const imported = await fetchModule('./Node.js');
		this._PluginFactory = imported[Object.keys(imported)[0]];
		return super.initialize(state);
	}

	async createAudioNode(initialState) {
		const factory = new this._PluginFactory(this.audioContext, 16, this._baseURL);
		const faustNode = await factory.load();
		const paramMgrNode = await ParamMgrFactory.create(this, { internalParamsConfig: Object.fromEntries(faustNode.parameters) });
		const node = new FaustCompositeAudioNode(this.audioContext);
		node.setup(faustNode, paramMgrNode);
		if (initialState) node.setState(initialState);
		return node;
	}

	createGui() {
		return createElement(this);
	}
}
