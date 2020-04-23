import EventEmitter from 'events';

/* eslint-disable lines-between-class-members */


/**
 * Plugin should extend this interface
 * They must redefine the async method createAudionode()
 */
export default class WebAudioPlugin extends EventEmitter {
	initialized = false;

	// The audionde of the plugin
	// The host must connect to this input
	audionode = undefined;

	// Initial state of the plugin
	state = {
		bank: undefined,
		enabled: false,
		params: {},
		patch: undefined,
	};

	// The constructor is waiting for an audioContext
	constructor(audioContext, options) {
		super();
		this.audioContext = audioContext;
		this.options = options;
	}

	// Accessors for values inherited from descriptor.json
	get descriptor() { return this.constructor.descriptor; }
	get name() { return this.descriptor.name; }
	get banks() { return this.descriptor.banks || {}; }
	get params() { return this.descriptor.params || {}; }
	get patches() { return this.descriptor.patches || {}; }

	/**
	 * Calling initialize([state]) will initialize the plugin with an initial state.
	 * While initializing, the audionode is created by calling the redefined method createAudionode()
	 * Plugins that redefine initialize() must call super.initialize();
	 */
	initialize = async (state = {}) => {
		// initialize state with params defaultValues
		const defaultStateParams = Object.entries(this.constructor.descriptor.params)
			.reduce((acc, [name, { defaultValue }]) => ({
				...acc,
				[name]: defaultValue,
			}), this.state.params);

		// merge default state with initial state passed to constructor
		this.state = {
			...this.state,
			...state,
			params: {
				...defaultStateParams,
				...(state.params || {}),
			},
		};

		this.audionode = this.audionode || await this.createAudionode();

		this.initialized = true;

		console.log('initialize plugin with state', this.state);

		return this;
	}

	/* Getters / Setters for states of the plugin */
	getState() {
		return this.state;
	}

	/**
	 * When the state is updated a change event is emitted when the new state as param
	 * Also event for each substate is emitted if changed.
	 *
	 * Plugin audionode and gui should listen to this change event in order
	 * to mutate their internal state
	 */
	setState(state) {
		this.state = { ...this.state, ...state };
		if (state.enabled !== undefined) this.emit('change:status', this.state.enabled);
		if (state.patch !== undefined) this.emit('change:patch', this.state.patch);
		if (state.params !== undefined) this.emit('change:params', this.state.params);
		if (state.bank !== undefined) this.emit('change:bank', this.state.bank);
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
			.reduce((acc, [name, value]) => {
				const param = this.params[name];
				// ensure that param has been listed in descriptor.json
				if (!param) throw new Error(`unknow param (${name})`);
				// params value are bounded
				value = Math.max(param.minValue, value);
				value = Math.min(param.maxValue, value);
				return {
					...acc,
					[name]: value,
				};
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
	 * This async method must be redefined to get audionode that
	 * will connected to the host.
	 * It can be any object that extends AudioNode
	 */
	createAudionode = async () => Promise.reject(new TypeError('createAudionode() not provided'));

	getAudionode() {
		if (!this.initialized) console.warn('plugin should be initialized before getting the audionode');
		return this.audionode;
	}

	/**
	 * Loads the gui thanks to the es dynamic imports
	 */
	loadGui = async () => {
		if (!this.constructor.guiModuleUrl) return Promise.reject(new TypeError('Gui module not found'));
		return import(this.constructor.guiModuleUrl);
	}

	createGui = async (...args) => {
		if (!this.initialized) console.warn('plugin should be initialized before getting the gui');
		// Do not fail if no gui is present, just return undefined
		if (!this.constructor.guiModuleUrl) return Promise.resolve();
		const { createElement } = await this.loadGui();
		return createElement(this, ...args);
	}
}
