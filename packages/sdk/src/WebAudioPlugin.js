import EventEmitter from 'events';

/* eslint-disable no-underscore-dangle */
/* eslint-disable lines-between-class-members */

/**
 * Plugin should extend this interface
 * They must redefine the async method createAudionode()
 */
export default class WebAudioPlugin extends EventEmitter {
	static isWebAudioPlugin = true;
	static createInstance(audioContext, pluginOptions = {}) {
		return new this(audioContext).initialize(pluginOptions);
	}
	static descriptor = {
		name: 'WebAudioPlugin',
		entry: undefined,
		gui: 'none',
		url: undefined,
		params: {},
		banks: {},
		patches: {},
	}
	static guiModuleUrl = undefined;

	// Accessors for values inherited from descriptor.json
	get descriptor() { return this.constructor.descriptor; }
	get name() { return this.descriptor.name; }
	get banks() { return this.descriptor.banks || {}; }
	get paramsConfig() { return this.descriptor.params || {}; }
	get patches() { return this.descriptor.patches || {}; }

	initialized = false;

	// EventEmitter is synchronous:
	// https://nodejs.org/api/events.html#events_asynchronous_vs_synchronous
	onBankChange(cb) { return this.on('change:bank', cb); }
	onEnabledChange(cb) { return this.on('change:enabled', cb); }
	onParamChange(paramName, cb) { return this.on(`change:param:${paramName}`, cb); }
	onParamsChange(cb) { return this.on('change:params', cb); }
	onPatchChange(cb) { return this.on('change:patch', cb); }

	// The audioNode of the plugin
	// The host must connect to this input
	_audioNode = undefined;
	get audioNode() {
		if (!this.initialized) console.warn('plugin should be initialized before getting the audionode');
		return this._audioNode;
	}
	set audioNode(node) {
		this._audioNode = node;
	}

	// Initial state of the plugin
	enabled = false;
	params = {};
	patch = undefined;
	bank = undefined;

	// The constructor is waiting for an audioContext
	constructor(audioContext) {
		super();
		this.audioContext = audioContext;
	}

	/**
	 * Calling initialize([state]) will initialize the plugin with an initial state.
	 * While initializing, the audionode is created by calling the redefined method createAudionode()
	 * Plugins that redefine initialize() must call super.initialize();
	 */
	async initialize(options = {}) {
		const {
			bank,
			enabled,
			params = {},
			patch,
		} = options;
		// initialize params default values
		const defaultParams = Object.entries(this.paramsConfig)
			.reduce((currentParams, [name, { defaultValue }]) => {
				currentParams[name] = defaultValue;
				return currentParams;
			}, this.params);

		this.params = { ...defaultParams, ...(params || {}) };
		this.bank = bank ?? this.bank;
		this.enabled = enabled ?? this.enabled;
		this.patch = patch ?? this.patch;

		if (!this._audioNode) this.audioNode = await this.createAudioNode();
		this.initialized = true;
		console.log('initialize plugin with options', options);
		return this;
	}

	/**
	 * This async method must be redefined to get audionode that
	 * will connected to the host.
	 * It can be any object that extends AudioNode
	 */
	// eslint-disable-next-line class-methods-use-this
	async createAudioNode() {
		throw new TypeError('createAudioNode() not provided');
	}

	disable() {
		const previousEnabled = this.enabled;
		this.enabled = false;
		this.emit('change:enabled', this.enabled, previousEnabled);
	}

	enable() {
		const previousEnabled = this.enabled;
		this.enabled = true;
		this.emit('change:enabled', this.enabled, previousEnabled);
	}

	getBank() { return this.bank; }

	setBank(bankName) {
		const bank = this.banks[bankName];
		if (!bank) throw new Error('Bank not found');
		const previousBank = this.bank;
		this.bank = bankName;
		// Apply first patch of the bank
		this.setPatch(bank.patches[0]);
		this.emit('change:bank', this.bank, previousBank);
		return this;
	}

	getParams() { return this.params; }

	setParams(params) {
		const newParams = Object.entries(params)
			.reduce((currentParams, [paramName, paramValue]) => {
				const paramConfig = this.paramsConfig[paramName];
				// ensure that param has been listed in descriptor.json
				if (!paramConfig) throw new Error(`Trying to set an unknow param (${paramName})`);
				const { minValue, maxValue } = paramConfig;
				// params value are bounded
				currentParams[paramName] = Math.max(minValue, Math.min(maxValue, paramValue));
				return currentParams;
			}, this.params);
		const previousParams = { ...this.params };
		this.params = { ...this.params, ...newParams };
		Object.entries(newParams).forEach(([paramName, paramValue]) => {
			this.emit(`change:param:${paramName}`, paramValue, previousParams[paramName]);
		});
		this.emit('change:params', this.params, previousParams, newParams);
		return this;
	}

	getParam(paramName) { return this.params[paramName]; }

	setParam(paramName, paramValue) {
		return this.setParams({ [paramName]: paramValue });
	}

	getPatch() { return this.patch; }

	setPatch(patchName) {
		const patch = this.patches[patchName];
		if (!patch) throw new Error('Patch not found');
		const previousPatch = this.patch;
		this.patch = patchName;
		// Apply first patch of the bank
		this.setParams(patch.patches[0]);
		this.emit('change:bank', this.patch, previousPatch);
	}

	/**
	 * Loads the gui thanks to the es dynamic imports
	 */
	async loadGui() {
		if (!this.constructor.guiModuleUrl) throw new TypeError('Gui module not found');
		return import(this.constructor.guiModuleUrl);
	}

	async createGui(options) {
		if (!this.initialized) console.warn('Plugin should be initialized before getting the gui');
		// Do not fail if no gui is present, just return undefined
		if (!this.constructor.guiModuleUrl) return undefined;
		const { createElement } = await this.loadGui();
		return createElement(this, options);
	}

	destroy() {
		this.emit('destroy');
	}
}
