import CompositeAudioNode from '../../sdk-parammgr/src/CompositeAudioNode.js';
import ParamMgrFactory from '../../sdk-parammgr/src/ParamMgrFactory.js';

/**
 * The CompositeAudioNode will proxy all the WamNode API via the `_wamNode` property.
 * We just need to make our audio graph inside.
 */
export default class TemplateWamNode extends CompositeAudioNode {
	/**
	 * Create all the nodes and setup the ParamMgr
	 *
	 * @param {import('./index.js').default} module
	 */
	async createNodes(module) {
		this.gainNode = this.context.createGain();
		this.delayNode = this.context.createDelay();
		this.feedbackNode = this.context.createGain();

		// Get all the parameters we need to control from the WAM API.
		const gain = this.feedbackNode.gain;
		const delay = this.delayNode.delayTime;

		// Create a Parameter Manager that takes care of these parameters.
		/** @type {import('../../sdk-parammgr/src').ParametersMappingConfiguratorOptions<'gain' | 'delay', 'gain' | 'delay'>} */
		const optionsIn = {
			// We need to customize a little bit.
			paramsConfig: {
				gain: { label: 'Feedback Gain', minValue: 0, maxValue: 1, defaultValue: 0.1 },
				delay: { label: 'Delay Time', minValue: 0, maxValue: 1, defaultValue: 0.5 }
			},
			internalParamsConfig: { gain, delay }
		};

		this._wamNode = await ParamMgrFactory.create(module, optionsIn);
	}

	/**
	 * Connect all the nodes define the output
	 *
	 * @param {import('./index.js').default} module
	 */
	async setup(module) {
		await this.createNodes(module);
		this.connect(this.gainNode);
		this.gainNode.connect(this.delayNode);
		this.delayNode.connect(this.feedbackNode);
		this.feedbackNode.connect(this.gainNode);
		// Assign the output at the end of the setup as this will change the behavior of `this.connect`.
		this._output = this.gainNode;
	}
}
