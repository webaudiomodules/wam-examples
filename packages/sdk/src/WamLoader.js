/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable lines-between-class-members */
/* eslint-disable indent */
/* eslint-disable no-console */

export default class WamLoader {
	static isWebAudioPlugin = true;

	/** 
	 * @param {AudioContext} audioContext 
	 * @param {any} [pluginOptions]
	 * @returns {Promise<WamLoader>}
	*/
	static createInstance(audioContext, pluginOptions = {}) {
		return new this(audioContext).initialize(pluginOptions);
	}

	/**
	 * @typedef {Object} WamDescriptor
	 * @property {string} name
	 * @property {string} vendor
	 * @property {string | undefined} entry
	 * @property {string} gui
	 * @property {string | undefined} url
	 */
	static descriptor = {
		name: 'WebAudioPlugin',
		vendor: 'PluginVendor',
		entry: undefined,
		gui: 'none',
		url: undefined,
	}

	/** @type {string} */
	static guiModuleUrl = undefined;

	/** @param {AudioContext} audioContext */
	constructor(audioContext) {
		this.audioContext = audioContext;
		this.instanceId = this.pluginId + performance.now();
		this._audioNode = undefined;
		this.initialized = false;
	}

	// Accessors for values inherited from descriptor.json

	/** @returns {WamDescriptor} */
	get descriptor() { 
		// @ts-ignore
		return this.constructor.descriptor; 
	}

	get name() { return this.descriptor.name; }
	get vendor() { return this.descriptor.vendor; }
	get pluginId() { return this.vendor + this.name; }

	// The audioNode of the plugin
	// The host must connect to this input

	/** @returns {AudioNode | undefined} */
	get audioNode() {
		if (!this.initialized) console.warn('plugin should be initialized before getting the audionode');
		return this._audioNode;
	}
	set audioNode(node) {
		this._audioNode = node;
	}

	/**
	 * This async method must be redefined to get audionode that
	 * will connected to the host.
	 * It can be any object that extends AudioNode
	 * @returns {Promise<AudioNode>}
	 */
	async createAudioNode(options = {}) {
		// should return a subclass of WamController
		throw new TypeError('createAudioNode() not provided');
	}

	/**
	 * Calling initialize([state]) will initialize the plugin with an initial state.
	 * While initializing, the audionode is created by calling createAudionode()
	 * Plugins that redefine initialize() must call super.initialize();
	 * TODO this param typing is confusing, too generic to be informative
	 * param {Partial<DefaultState<string, string, string>>} options
	 * @returns {Promise<WamLoader>}
	 */
	async initialize(options = {}) { // maybe don't need this, only createAudioNode?
		if (!this._audioNode) this.audioNode = await this.createAudioNode(options);
		this.initialized = true;
		return this;
	}

	//** TODO */
	async loadGui() {
		// @ts-ignore
		if (!this.constructor.guiModuleUrl) throw new TypeError('Gui module not found');
		// @ts-ignore
		return import(/* webpackIgnore: true */this.constructor.guiModuleUrl);
	}

	//** TODO */
	async createGui(options = {}) {
		if (!this.initialized) console.warn('Plugin should be initialized before getting the gui');
		// Do not fail if no gui is present, just return undefined
		// @ts-ignore
		if (!this.constructor.guiModuleUrl) return undefined;
		const { createElement } = await this.loadGui();
		return createElement(this, options);
	}
}
