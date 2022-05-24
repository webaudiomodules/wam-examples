//@ts-check
/** @type {import('../../api').AudioWorkletGlobalScope} */
// @ts-ignore
const audioWorkletGlobalScope = globalThis;
const { AudioWorkletProcessor, registerProcessor } = audioWorkletGlobalScope;

/** We recommend to process and to emit WAM events from the processor */
class TemplateMidiWamProcessor extends AudioWorkletProcessor {
	/** Configure AudioParams */
	static get parameterDescriptors() {
		return [{
			name: 'setting1',
			defaultValue: 0,
			minValue: -128,
			maxValue: 128
		}, {
			name: 'destroyed',
			defaultValue: 0,
			minValue: 0,
			maxValue: 1,
		}];
	}

	constructor(options) {
		super();
		const { moduleId, instanceId } = options.processorOptions;
		this.moduleId = moduleId;
		this.instanceId = instanceId;

		this.setting1 = TemplateMidiWamProcessor.parameterDescriptors[0].defaultValue;

	}

	/** @type {import('../../sdk-parammgr').ParamMgrProcessor} */
	get proxy() {
		const { webAudioModules } = audioWorkletGlobalScope;
		return webAudioModules.getModuleScope(this.moduleId)?.paramMgrProcessors?.[this.instanceId];
	}

	/**
	 * Main process, here we update the parameters.
	 *
	 * @param {Float32Array[][]} inputs
	 * @param {Float32Array[][]} outputs
	 * @param {Record<'setting1' | 'destroyed', Float32Array>} parameters
	 */
	process(inputs, outputs, parameters) {
		const destroyed = parameters.destroyed[0];
		if (destroyed) return false;
		if (!this.proxy) return true;
		this.setting1 = parameters.setting1[0];
		/** Define an event handler to the ParamMgrProcessor */
		if (!this.proxy.handleEvent) {
			this.proxy.handleEvent = (event) => {
				// Just a simple transposer
				if (event.type === 'wam-midi' && event.data.bytes[0] >= 0b10000000 && event.data.bytes[0] <= 0b10011111 ) {
					event.data.bytes[1] += Math.round(this.setting1);
					this.proxy.emitEvents(event);
				}
			}
		}
		return true;
	}
}

registerProcessor('__WebAudioModule_TemplateMidiWamProcessor', TemplateMidiWamProcessor);
