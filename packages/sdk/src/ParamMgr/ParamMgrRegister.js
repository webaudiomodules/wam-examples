import AudioWorkletRegister from './AudioWorkletRegister';
import processor from './ParamMgrProcessor';
import ParamMgrNode from './ParamMgrNode';
import processorId from './processorId';

export default class ParamMgrRegister extends AudioWorkletRegister {
	static async getNode(plugin, initialParamsValue) {
		const {
			audioContext, vendor, name, paramsConfig, paramsMapping, internalParamsConfig,
		} = plugin;
		const pluginId = vendor + name;
		await this.register(pluginId + processorId, processor, audioContext.audioWorklet, paramsConfig);
		const options = {
			paramsConfig, mapping: paramsMapping, internalParams: Object.keys(internalParamsConfig),
		};
		const node = new ParamMgrNode(
			audioContext, pluginId + processorId, initialParamsValue, options,
			plugin, internalParamsConfig,
		);
		return node.initialize();
	}
}
