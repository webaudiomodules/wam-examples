import EventEmitter from 'events';

/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable no-underscore-dangle */
/* eslint-disable lines-between-class-members */


/**
 * Plugin should extend this interface
 * They must redefine the async method createAudionode()
 */
export default class WebAudioPlugin extends EventEmitter {
	static isWebAudioPlugin = true;
	static createInstance(audioContext, pluginOptions = {}) {
		return new this(audioContext, pluginOptions).initialize();
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
	get params() { return this.descriptor.params || {}; }
	get patches() { return this.descriptor.patches || {}; }

	initialized = false;

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
	state = {
		enabled: false,
		params: {},
		patch: undefined,
		bank: undefined,
	};

	// The constructor is waiting for an audioContext
	constructor(audioContext, options = {}) {
		super();
		this.audioContext = audioContext;
		this.options = options;
	}

	/**
	 * Calling initialize([state]) will initialize the plugin with an initial state.
	 * While initializing, the audionode is created by calling the redefined method createAudionode()
	 * Plugins that redefine initialize() must call super.initialize();
	 */
	async initialize() {
		const { initialState } = this.options;
		// initialize state with params defaultValues
		const params = Object.entries(this.params)
			.reduce((currentParams, [name, { defaultValue }]) => {
				currentParams[name] = defaultValue;
				return currentParams;
			}, this.state.params);
		if (initialState) {
			if (initialState.params) Object.assign(params, initialState.params);
			// merge default state with initial state passed to constructor
			Object.assign(this.state, initialState);
		}
		this.state.params = params;

		if (!this._audioNode) this.audioNode = await this.createAudioNode();
		this.initialized = true;
		console.log('initialize plugin with state', this.state);
		return this;
	}
	get ready() {
		return this.initialize();
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

	/* Getters / Setters for states of the plugin */
	getState() {
		return this.state;
	}

	/**
	 * When the state is updated a change event is emitted with the new state as param
	 * Also event for each substate is emitted if changed.
	 *
	 * Plugin audionode and gui should listen to this change event in order
	 * to mutate their internal state
	 */
	setState(state) {
		this.state = { ...this.state, ...state };
		Object.keys(state).forEach((k) => this.emit(`change:${k}`, this.state[k]));
		this.emit('change', this.state);
		return this;
	}

	getBank() {
		return this.state.bank;
	}

	setBank(bankName) {
		const bank = this.banks[bankName];
		if (!bank) throw new Error('bank not found');
		this.setState({ bank: bankName });
		// Apply first patch of the bank
		this.setPatch(bank.patches[0]);
		return this;
	}

	getParams() {
		return this.state.params;
	}

	setParams(params) {
		const newParams = Object.entries(params)
			.reduce((currentParams, [name, value]) => {
				const param = this.params[name];
				// ensure that param has been listed in descriptor.json
				if (!param) throw new Error(`unknow param (${name})`);
				const { minValue, maxValue } = this.params[name];
				// params value are bounded
				currentParams[name] = Math.max(minValue, Math.min(maxValue, value));
				return currentParams;
			}, this.state.params);
		this.setState({ params: newParams });
		return this;
	}

	getPatch() {
		return this.state.patch;
	}

	setPatch(patchName) {
		const patch = this.banks[patchName];
		if (!patch) throw new Error('patch not found');
		this.setState({ patch: patchName });
		// Apply params of the patch
		this.setParams(patch.params);
		return this;
	}


	/**
	 * Loads the gui thanks to the es dynamic imports
	 */
	async loadGui() {
		if (!this.constructor.guiModuleUrl) throw new TypeError('Gui module not found');
		return import(this.constructor.guiModuleUrl);
	}

	async createGui(options) {
		if (!this.initialized) console.warn('plugin should be initialized before getting the gui');
		// Do not fail if no gui is present, just return undefined
		if (!this.constructor.guiModuleUrl) return undefined;
		const { createElement } = await this.loadGui();
		return createElement(this, options);
	}

	destroy() {
		this.emit('destroy');
	}
}
