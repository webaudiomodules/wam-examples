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
	 * @param {import('./index').default} module
	 */
	async createNodes(module) {
		const workletUrl = new URL('./midiProcessor.worklet.js', module._baseURL).href;
		await module.audioContext.audioWorklet.addModule(workletUrl);
		const midiProcessorOptions = {
			processorOptions: {
				moduleId: module.moduleId,
				instanceId: module.instanceId
			}
		};
		this.midiProcessorNode = new AudioWorkletNode(module.audioContext, '__WebAudioModule_TemplateMidiWamProcessor', midiProcessorOptions);

		// Get all the parameters we need to control from the WAM API.
		const setting1 = this.midiProcessorNode.parameters.get('setting1');

		// Create a Parameter Manager that takes care of these parameters.
		/** @type {import('../../sdk-parammgr/src').ParametersMappingConfiguratorOptions<'gain' | 'delay', 'gain' | 'delay'>} */
		const optionsIn = {
			internalParamsConfig: { setting1 }
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
		// Assign the output at the end of the setup as this will change the behavior of `this.connect`.
		this._output = this;
	}

	destroy() {
		if (this.midiProcessorNode) this.midiProcessorNode.parameters.get('destroyed').value = 1;
		super.destroy();
	}
}
