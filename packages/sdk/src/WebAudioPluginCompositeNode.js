import CompositeAudioNode from './CompositeAudioNode';

/* eslint-disable no-underscore-dangle */
export default class WebAudioPluginCompositeNode extends CompositeAudioNode {
	constructor(context, options) {
		super(context, options);
		this.context = context || new AudioContext();
		this._descriptor = {};
		this.params = {};
		// Do stuffs below.
	}

	static get parameterDescriptors() {
		return this._descriptor;
	}

	/**
	 * Build a key / value param descriptor with name as key
	 * Build the params object
	 * Build a getter
	 * @param param
	 */
	addParam(param) {
		// descriptor
		try {
			this._descriptor = {
				[param.name]: {
					minValue: param.minValue,
					maxValue: param.maxValue,
					defaultValue: param.defaultValue,
				},
				...this._descriptor,
			};
		} catch (error) {
			console.err(
				"The structure given does not match with the AudioParam :{ name:'name',defaultValue: 0.25, minValue: 0, maxValue: 1} Doc : https://webaudio.github.io/web-audio-api/#parameterdescriptors ",
			);
		}
		// params
		try {
			this.params = {
				[param.name]: param.defaultValue,
				...this.params,
			};
		} catch (error) {
			console.err('Parameter not assigned to the params object');
		}
	}

	getDescriptor() {
		return this._descriptor;
	}

	/**
	 * Fetch and return the metadata
	 */
	async getMetadata() {
		return new Promise((resolve) => {
			fetch(`${this.URL}/main.json`)
				.then((responseJSON) => responseJSON.json())
				.then((json) => {
					resolve(json);
				});
		});
	}

	/**
	 * @param {*} key
	 * @param {*} value
	 */
	setParam(key, value) {
		throw new Error('You have to implement the method setParam!');
	}

	/**
	 * Default getParam management : return the current value of this.params[key];
	 */
	getParam(key) {
		try {
			return this.params[key];
		} catch (error) {
			console.warn('this plugin does not implement this param');
		}
	}

	/**
	 * This getter can be override with the length of inputs tab.
	 */
	get numberOfInputs() {
		return this._numberOfInputs;
	}

	set numberOfInputs(number) {
		this._numberOfInputs = number;
	}

	get numberOfOutputs() {
		return this._numberOfOutputs;
	}

	set numberOfOutputs(number) {
		this._numberOfOutputs = number;
	}

	/**
	 * To fit and extend the AudioNode fields
	 */
	inputChannelCount() {
		//TODO
		return 2;
	}

	outputChannelCount() {
		return this._channelCount;
	}

	/**
	 * Preset or "patch" gesture
	 * @param {*} index
	 */
	getPatch(index) {}

	setPatch(data, index) {}

	/**
	 * Return the params list with it's current values
	 */
	async getState() {
		return new Promise((resolve) => {
			resolve({ ...this.params });
		});
	}

	/**
	 * Set the params values to recover a stored state
	 * @param {JSON} data
	 */
	async setState(data) {
		return new Promise((resolve) => {
			Object.keys(data).map((elem) => {
				this.setParam(elem, data[elem]);
			});
			try {
				this.gui.setAttribute('state', JSON.stringify(data));
			} catch (error) {
				console.warn('Plugin without gui or GUI not defined', error);
			}
			resolve(data);
		});
	}

	setup() {
		this.createNodes();
		this.connectNodes();
		this.linktoParams();
	}

	createNodes() {
		console.warn(
			'you might override the createNodes() method to build your audio nodes',
		);
		// Build here all your audio nodes
	}

	connectNodes() {
		console.warn(
			'you might override the connectNodes() method to wire your audio graph',
		);
	}

	// initialise the setters (so the nodes values) with the params values
	linktoParams() {
		for (const param in this.params) {
			if (this.params.hasOwnProperty(param)) {
				this[param] = this.params[param];
			}
		}
	}

	onMidi(msg) {}
}
