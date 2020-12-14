/** @typedef {import('./api/types').WamDescriptor} WamDescriptor */
/** @typedef {import('./api/types').WamNode} WamNode */

import AbstractWebAudioModule from './api/AbstractWebAudioModule.js';

/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable lines-between-class-members */
/* eslint-disable class-methods-use-this */
/* eslint-disable indent */
/* eslint-disable no-console */

class WebAudioModule extends AbstractWebAudioModule {
	static get isWebAudioModuleConstructor() {
		return true;
	}

	/**
	 * @param {BaseAudioContext} audioContext
	 * @param {any} [initialState]
	 * @returns {Promise<WebAudioModule>}
	 */
	static createInstance(audioContext, initialState) {
		return new this(audioContext).initialize(initialState);
	}

	/** @param {BaseAudioContext} audioContext */
	constructor(audioContext) {
		super(audioContext);
		this._audioContext = audioContext;
	}

	get isWebAudioModule() {
		return true;
	}

	_initialized = false;

	/** @type {WamNode} */
	_audioNode = undefined;

	_timestamp = performance.now();

	/**
	 * Url to load the plugin's GUI HTML
	 * @type {string}
	 */
	_guiModuleUrl = undefined;

	/**
	 * Url to load the plugin's `descriptor.json`
	 * @type {string}
	 */
	_descriptorUrl = './descriptor.json';

	/** @type {WamDescriptor} */
	_descriptor = {
		name: `WebAudioModule_${this.constructor.name}`,
		vendor: 'WebAudioModuleVendor',
		description: '',
		version: '0.0.0',
		sdkVersion: '1.0.0',
		thumbnail: '',
		keywords: [],
		isInstrument: false,
		website: '',
	};

	get moduleId() { return this.vendor + this.name; }

	get instanceId() { return this.moduleId + this._timestamp; }

	get descriptor() { return this._descriptor; }

	get name() { return this.descriptor.name; }

	get vendor() { return this.descriptor.vendor; }

	get audioContext() {
		return this._audioContext;
	}

	get audioNode() {
		if (!this.initialized) console.warn('WAM should be initialized before getting the audioNode');
		return this._audioNode;
	}

	set audioNode(node) {
		this._audioNode = node;
	}

	get initialized() {
		return this._initialized;
	}

	set initialized(value) {
		this._initialized = value;
	}

	/**
	 * @param {any} [initialState]
	 * @returns {Promise<WamNode>}
	 */
	async createAudioNode(initialState) {
		// should return a subclass of WamNode
		throw new TypeError('createAudioNode() not provided');
	}

	/**
	 * @param {any} [state]
	 * @returns {Promise<WebAudioModule>}
	 */
	async initialize(state) {
		// await this._loadDescriptor();
		if (!this._audioNode) this.audioNode = await this.createAudioNode();
		this.initialized = true;
		return this;
	}

	async _loadGui() {
		const url = this._guiModuleUrl;
		if (!url) throw new TypeError('Gui module not found');
		// @ts-ignore
		return import(/* webpackIgnore: true */url);
	}

	async _loadDescriptor() {
		const url = this._descriptorUrl;
		if (!url) throw new TypeError('Descriptor not found');
		const response = await fetch(url);
		const descriptor = await response.json();
		Object.assign(this._descriptor, descriptor);
		return this._descriptor;
	}

	/**
	 * @returns {Promise<HTMLElement>}
	 */
	async createGui() {
		if (!this.initialized) console.warn('Plugin should be initialized before getting the gui');
		// Do not fail if no gui is present, just return undefined
		if (!this._guiModuleUrl) return undefined;
		const { createElement } = await this._loadGui();
		return createElement(this);
	}
}

export default WebAudioModule;
