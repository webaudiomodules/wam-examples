// import factories from SDK
import WebAudioModule from '../../sdk/src/WebAudioModule.js';
import ParamMgrFactory from '../../sdk/src/ParamMgr/ParamMgrFactory.js';

// DSP part
import TemplateWamNode from './Node.js';
// GUI part
import createElement from './Gui.js';

/**
 * Definition of a new WAM plugin
 * 
 * @extends {WebAudioModule<TemplateWamNode>}
 */
export default class TemplateWam extends WebAudioModule {
	/** The Base URL of this file */
	_baseURL = new URL('.', import.meta.url).href;

	/** The URL of the descriptor JSON */
	_descriptorUrl = `${this._baseURL}descriptor.json`;

	/** Merge the descriptor JSON to this */
	async _loadDescriptor() {
		const url = this._descriptorUrl;
		if (!url) throw new TypeError('Descriptor not found');
		const response = await fetch(url);
		const descriptor = await response.json();
		Object.assign(this.descriptor, descriptor);
	}

	/** This will be called by the host */
	async initialize(state) {
		await this._loadDescriptor();
		return super.initialize(state);
	}

	/** This will be called by `super.initialize()` */
	async createAudioNode(initialState) {
		// Prepare all the AudioNodes:
		const node = new TemplateWamNode(this.audioContext);
		node.createNodes();

		// ============ Customize this part ============

		// Get all the parameters we need to control from the WAM API.
		const gain = node.feedbackNode.gain;
		const delay = node.delayNode.delayTime;

		// Create a Parameter Manager that takes care of these parameters.
		/** @type {import('../../sdk/src/ParamMgr/types').ParametersMappingConfiguratorOptions<'gain' | 'delay', 'gain' | 'delay'>} */
		const optionsIn = {
			// We need to customize a little bit.
			paramsConfig: {
				gain: { label: 'Feedback Gain', minValue: 0, maxValue: 1, defaultValue: 0.1 },
				delay: { label: 'Delay Time', minValue: 0, maxValue: 1, defaultValue: 0.5 }
			},
			internalParamsConfig: { gain, delay }
		};

		// =============================================

		const wamNode = await ParamMgrFactory.create(this, optionsIn);

		// Setup our node to get its WAM APIs ready
		node.setup(wamNode);

		// If there is an initial state at construction for this plugin,
		if (initialState) node.setState(initialState);

		// Now the WAM is ready
		return node;
	}

	createGui() {
		return createElement(this);
	}

	/**
	 * @param {import('./Gui').TemplateWamElement} el
	 */
	destroyGui(el) {
		el.disconnectedCallback();
	}
}
