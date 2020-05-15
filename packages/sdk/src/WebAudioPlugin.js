import EventEmitter from 'events';
import ParamMgrReg from './ParamMgr/ParamMgrRegister';
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
		vendor: 'PluginVendor',
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
	get vendor() { return this.descriptor.vendor; }
	get banks() { return this.descriptor.banks || {}; }
	get patches() { return this.descriptor.patches || {}; }
	get pluginId() { return this.vendor + this.name; }
	instanceId = this.pluginId + performance.now();
	/**
	 * @type {ParametersDescriptor}
	 */
	get paramsConfig() {
		return Object.entries(this.descriptor.params || {}).reduce((configs, [name, {
			type,
			defaultValue,
			minValue,
			maxValue,
			exponent,
		}]) => {
			configs[name] = {
				type: type ?? 'float',
				defaultValue: defaultValue ?? 0,
				minValue: minValue ?? 0,
				maxValue: maxValue ?? 1,
				exponent: exponent ?? 0,
			};
			return configs;
		}, {
			enabled: {
				type: 'boolean', defaultValue: 1, minValue: 0, maxValue: 1, exponent: 0,
			},
		});
	}
	_internalParamsConfig = undefined;
	/**
	 * @type {InternalParametersDescriptor}
	 */
	get internalParamsConfig() {
		const { paramsConfig } = this;
		if (!this._internalParamsConfig) {
			return Object.entries(paramsConfig)
				.reduce((configs, [name, { minValue, maxValue, defaultValue }]) => {
					configs[name] = {
						minValue, maxValue, defaultValue, automationRate: 30,
					};
					return configs;
				}, {});
		}
		return Object.entries(this._internalParamsConfig || {})
			.reduce((configs, [name, config]) => {
				if (config instanceof AudioParam) configs[name] = config;
				else {
					const minValue = paramsConfig[name] ? paramsConfig[name].minValue : 0;
					const maxValue = paramsConfig[name] ? paramsConfig[name].maxValue : 1;
					const defaultValue = paramsConfig[name] ? paramsConfig[name].defaultValue : 0;
					const defaultConfig = {
						minValue,
						maxValue,
						defaultValue,
						automationRate: 30,
					};
					configs[name] = { ...defaultConfig, ...config };
				}
				return configs;
			}, {});
	}
	set internalParamsConfig(config) {
		if (this._internalParamsConfig) throw new Error('internalParamsConfig can be set only once.');
		this._internalParamsConfig = config;
	}

	_paramsMapping = {}
	/**
	 * @type {ParametersMapping}
	 */
	get paramsMapping() {
		const declared = this._paramsMapping || {};
		const externalParams = this.paramsConfig;
		const internalParams = this.internalParamsConfig;
		return Object.entries(externalParams)
			.reduce((mapping, [name, { minValue, maxValue }]) => {
				const sourceRange = [minValue, maxValue];
				const defaultMapping = { sourceRange, targetRange: [...sourceRange] };
				if (declared[name]) {
					const declaredTargets = Object.entries(declared[name])
						.reduce((targets, [targetName, targetMapping]) => {
							if (internalParams[targetName]) {
								targets[targetName] = { ...defaultMapping, ...targetMapping };
							}
							return targets;
						}, {});
					mapping[name] = declaredTargets;
				} else if (internalParams[name]) {
					mapping[name] = { [name]: { ...defaultMapping } };
				}
				return mapping;
			}, {});
	}
	set paramsMapping(mapping) {
		const previousMapping = this.paramsMapping;
		this._paramsMapping = mapping;
		this.emit('change:paramsMapping', this.paramsMapping, previousMapping);
	}

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
	get enabled() {
		return this.paramMgr ? !!this.paramMgr.getParamValue('enabled') : true;
	}
	set enabled(enabled) {
		this.setParam('enabled', +enabled);
	}
	get params() {
		return this.paramMgr.getParamsValues();
	}
	patch = undefined;
	bank = undefined;

	/**
	 * The constructor is waiting for an audioContext
	 * @param {AudioContext} audioContext
	 */
	constructor(audioContext) {
		super();
		this.audioContext = audioContext;
	}

	/**
	 * Calling initialize([state]) will initialize the plugin with an initial state.
	 * While initializing, the audionode is created by calling the redefined method createAudionode()
	 * Plugins that redefine initialize() must call super.initialize();
	 * @param {Partial<DefaultState<string, string, string>>} options
	 */
	async initialize(options = {}) {
		const {
			bank,
			params = {},
			patch,
		} = options;
		// initialize params default values
		const defaultParams = Object.entries(this.paramsConfig)
			.reduce((currentParams, [name, { defaultValue }]) => {
				currentParams[name] = defaultValue;
				return currentParams;
			}, {});

		this.bank = bank ?? Object.keys(this.banks)[0];
		const initialParams = { ...defaultParams, ...(params || {}) };
		this.patch = patch ?? this.banks[this.bank].patches[0];
		if (!this._audioNode) this.audioNode = await this.createAudioNode();

		this.paramMgr = await ParamMgrReg.getNode(this, initialParams);

		this.initialized = true;
		console.log('initialize plugin with options', options);
		return this;
	}

	/**
	 * This async method must be redefined to get audionode that
	 * will connected to the host.
	 * It can be any object that extends AudioNode
	 * @returns {Promise<AudioNode>}
	 */
	// eslint-disable-next-line class-methods-use-this
	async createAudioNode() {
		throw new TypeError('createAudioNode() not provided');
	}

	_setEnabled(enabled) {
		this.setParam('enabled', +enabled);
		return enabled;
	}

	disable() {
		const previousEnabled = this.enabled;
		const enabled = this._setEnabled(false);
		this.emit('change:enabled', enabled, previousEnabled);
	}

	enable() {
		const previousEnabled = this.enabled;
		const enabled = this._setEnabled(true);
		this.emit('change:enabled', enabled, previousEnabled);
	}

	getBank() { return this.bank; }

	_setBank(bankName) {
		const bank = this.banks[bankName];
		if (!bank) throw new Error('Bank not found');
		this.bank = bankName;
		return bank;
	}

	setBank(bankName, patchName) {
		const previousBank = this.bank;
		const bank = this._setBank(bankName);
		// Apply first patch of the bank
		this.setPatch(patchName || bank.patches[0]);
		this.emit('change:bank', this.bank, previousBank);
		return this;
	}

	getParams() { return this.params; }

	_setParams(params) {
		this.paramMgr.setParamsValues(params);
		return this.params;
	}

	setParams(params) {
		const previousParams = { ...this.params };
		const newParams = this._setParams(params);
		Object.entries(newParams).forEach(([paramName, paramValue]) => {
			this.emit(`change:param:${paramName}`, paramValue, previousParams[paramName]);
		});
		this.emit('change:params', this.params, previousParams, newParams);
		return this;
	}

	getParam(paramName) { return this.paramMgr.getParamValue(paramName); }

	setParam(paramName, paramValue) {
		return this.setParams({ [paramName]: paramValue });
	}

	getPatch() { return this.patch; }

	_setPatch(patchName) {
		const bank = this.banks[this.bank];
		const bankHasPatch = bank.patches.includes(patchName);
		if (!bankHasPatch) throw new Error('Patch not found in current bank');
		const patch = this.patches[patchName];
		if (!patch) throw new Error('Patch not found');
		this.patch = patchName;
		return patch;
	}

	setPatch(patchName) {
		const previousPatch = this.patch;
		const patch = this._setPatch(patchName);
		// Apply first patch of the bank
		this.setParams(patch.patches[0]);
		this.emit('change:patch', this.patch, previousPatch);
	}

	getState() {
		const {
			bank,
			enabled,
			params: { ...params },
			patch,
		} = this;
		return {
			bank,
			enabled,
			params,
			patch,
		};
	}

	setState(state) {
		const {
			bank: bankName,
			enabled,
			params,
			patch: patchName,
		} = state;
		this._setEnabled(enabled);
		const previousBank = this.bank;
		const bank = this._setBank(bankName ?? Object.keys(this.banks)[0]);
		const previousPatch = this.patch;
		const patch = this._setPatch(patchName ?? bank.patches[0]);
		// trigger events in order param -> params -> patch -> bank
		this.setParams(params); // using setParam (without _) here to trigger events
		this.emit('change:patch', patch, previousPatch);
		this.emit('change:bank', bank, previousBank);
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
		if (!this.initialized) console.warn('Plugin should be initialized before getting the gui');
		// Do not fail if no gui is present, just return undefined
		if (!this.constructor.guiModuleUrl) return undefined;
		const { createElement } = await this.loadGui();
		return createElement(this, options);
	}

	destroy() {
		this.emit('destroy');
		this.paramMgr.destroy();
	}
}
