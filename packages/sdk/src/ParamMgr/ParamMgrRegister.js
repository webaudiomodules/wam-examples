import AudioWorkletRegister from './AudioWorkletRegister';
import processor from './ParamMgrProcessor';
import ParamMgrNode from './ParamMgrNode';
import processorId from './processorId';

export default class ParamMgrRegister extends AudioWorkletRegister {
	static async getNode(plugin, initialParamsValue) {
		const {
			audioContext,
			pluginId,
			paramsConfig,
			paramsMapping,
			internalParamsConfig,
			instanceId,
		} = plugin;
		await this.register(pluginId + processorId, processor, audioContext.audioWorklet, paramsConfig);
		const options = {
			paramsConfig, paramsMapping, internalParams: Object.keys(internalParamsConfig), instanceId,
		};
		const node = new ParamMgrNode(
			audioContext, pluginId + processorId, initialParamsValue, options,
			plugin, internalParamsConfig,
		);
		return node.initialize();
	}
}
