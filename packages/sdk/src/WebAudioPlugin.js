export default class WebAudioPlugin extends EventTarget {
	static pluginName = 'WebAudioPlugin';

	initialized = false;

	state = {
		enabled: false,
	};

	constructor(audioContext) {
		super();
		this.audioContext = audioContext;
	}

	initialize(state = {}) {
		// initialize state with params defaultValues
		const defaultState = Object.entries(this.params ?? {})
			.reduce((acc, [name, { defaultValue }]) => ({
				...acc,
				[name]: defaultValue,
			}), this.state);

		// merge default state with initial state passed to constructor
		this.state = { ...defaultState, ...state };
		this.initialized = true;

		console.log('initialize plugin with state', this.state);

		return this;
	}

	setState(state) {
		this.state = { ...this.state, ...state };
		this.dispatchEvent(new Event('change', this.state));
	}

	createAudioNode = async (options = {}) => {
		console.log('createAudioNode()');
		const { createNode } = await this.loadAudioNodeModule();
		if (!this.initialized) this.initialize(options.state);
		return createNode(this, options);
	};

	createElement = async (options = {}) => {
		console.log('createElement()');
		const { createElement } = await this.loadGuiModule();
		if (!this.initialized) this.initialize(options.state);
		return createElement(this, options);
	};
}
