/** @typedef { import('./api/types').WamDescriptor } WamDescriptor */
/** @typedef { import('./api/types').WamNode } WamNode */

/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable lines-between-class-members */
/* eslint-disable class-methods-use-this */
/* eslint-disable indent */
/* eslint-disable no-console */

class WebAudioModule {
	static isWebAudioPlugin = true;

	/**
	 * @param {BaseAudioContext} audioContext
	 * @param {any} [initialState]
	 * @returns {Promise<WebAudioModule>}
	*/
	static createInstance(audioContext, initialState) {
		return new this(audioContext).initialize(initialState);
	}

	/** @returns {WamDescriptor} */
	static descriptor = {
		name: 'WebAudioPlugin',
		vendor: 'PluginVendor',
	}

	/**
	 * Url to load the plugin's GUI HTML
	 * @returns {string}
	 */
	static _guiModuleUrl = undefined;

	/** @param {BaseAudioContext} audioContext */
	constructor(audioContext) {
		/**
		 * The `AudioContext` where the plugin's `AudioNode` lives
		 * @property {BaseAudioContext} audioContext
		 */
		this.audioContext = audioContext;

		/**
		 * The unique identifier of the current WAM instance.
		 * @property {string} instanceId
		 */
		this.instanceId = this.moduleId + performance.now();

		/**
		 * The plugin's `AudioNode` that the host can connect to/from
		 * @property {WamNode | undefined} _audioNode
		 */
		this._audioNode = undefined;

		/**
		 * This will return true after calling `initialize()`.
		 * @property {boolean} initialized
		 */
		this.initialized = false;
	}

	// Accessors for values inherited from descriptor.json

	/**
	 * The identifier of the current WAM, composed of vender + name
	 * @returns {string}
	 */
	get moduleId() { return this.vendor + this.name; }

	/**
	 * The values from `descriptor.json`
	 * @returns {WamDescriptor}
	 * */
	/** @returns {WamDescriptor} */
	get descriptor() {
		// @ts-ignore
		return this.constructor.descriptor;
	}

	/**
	 * The WAM's name
	 * @returns {string}
	 */
	get name() { return this.descriptor.name; }

	/**
	 * The WAM Vendor's name
	 * @returns {string}
	 */
	get vendor() { return this.descriptor.vendor; }

	/**
	 * The plugin's `AudioNode` that the host can connect to/from
	 * @returns {WamNode | undefined}
	 * */
	get audioNode() {
		if (!this.initialized) console.warn('plugin should be initialized before getting the audionode');
		return this._audioNode;
	}
	/** @param {WamNode} node */
	set audioNode(node) {
		this._audioNode = node;
	}

	/**
	 * This async method must be redefined to get audionode that
	 * will connected to the host.
	 * It can be any object that extends AudioNode
	 * @param {any} [initialState]
	 * @returns {Promise<WamNode>}
	 */
	async createAudioNode(initialState) {
		// should return a subclass of WamNode
		throw new TypeError('createAudioNode() not provided');
	}

	/**
     * The host will call this method to initialize the WAM with an initial state.
     *
     * In this method, WAM devs should call `createAudioNode()`
     * and store its return `AudioNode` to `this.audioNode`,
     * then set `initialized` to `true` to ensure that
     * the `audioNode` property is available after initialized.
     *
     * These two behaviors are implemented by default in the SDK.
     *
     * The WAM devs can also fetch and preload the GUI Element in while initializing.
	 * @param {any=} state
	 * @returns {Promise<WebAudioModule>}
	 */
	async initialize(state) { // maybe don't need this, only createAudioNode?
		if (!this._audioNode) this.audioNode = await this.createAudioNode();
		this.initialized = true;
		return this;
	}

	async _loadGui() {
		// @ts-ignore
		if (!this.constructor._guiModuleUrl) throw new TypeError('Gui module not found');
		// @ts-ignore
		return import(/* webpackIgnore: true */this.constructor._guiModuleUrl);
	}

	/**
	 * Redefine this method to get the WAM's GUI as an HTML `Element`.
	 * @returns {Promise<HTMLElement>}
	 */
	async createGui() {
		if (!this.initialized) console.warn('Plugin should be initialized before getting the gui');
		// Do not fail if no gui is present, just return undefined
		// @ts-ignore
		if (!this.constructor._guiModuleUrl) return undefined;
		const { createElement } = await this._loadGui();
		return createElement(this);
	}
}

export default WebAudioModule;
