import AudioWorkletRegister from './AudioWorkletRegister';
import processor from './ParamMgrProcessor';
import ParamMgrNode from './ParamMgrNode';
import processorId from './processorId';

export default class ParamMgrRegister extends AudioWorkletRegister {
	/**
	 * Get a ParamManager as an AudioWorkletNode instance
	 *
	 * @static
     * @param {string} processorId Processor identifier
	 * @param {BaseAudioContext} context AudioContext
	 * @param {Record<string, number>} initialParamsValue parameters initial values map
	 * @param {ParametersDescriptor} paramsConfig
	 * @param {ParametersMapping} mapping
	 * @param {InternalParametersDescriptor} internalParamsConfig
	 * @returns {Promise<ParamMgrNode>} ParamMgrNode instance
	 * @memberof ParamMgrRegister
	 */
	static async getNode(
		pluginId, context, initialParamsValue, paramsConfig, mapping, internalParamsConfig,
	) {
		await this.register(pluginId + processorId, processor, context.audioWorklet, paramsConfig);
		const options = { paramsConfig, mapping, internalParamsConfig };
		const node = new ParamMgrNode(context, pluginId + processorId, initialParamsValue, options);
		await node.init();
		return node;
	}
}
