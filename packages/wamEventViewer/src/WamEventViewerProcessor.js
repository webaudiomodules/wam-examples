/** @typedef {import('../../api/src').AudioWorkletGlobalScope} AudioWorkletGlobalScope */
/** @typedef {import('../../api/src').AudioWorkletProcessor} AudioWorkletProcessor */
/** @typedef {import('../../api/src').WamProcessor} WamProcessor */
/** @typedef {import('../../api/src').WamParameterInfo} WamParameterInfo */
/** @typedef {import('../../api/src').WamParameterInfoMap} WamParameterInfoMap */
/** @typedef {import('../../api/src').WamParameterDataMap} WamParameterDataMap */
/** @typedef {import('../../sdk/src').WamSDKBaseModuleScope} WamSDKBaseModuleScope */

/**
 * @param {string} [moduleId]
 */
const getWamEventViewerProcessor = (moduleId) => {
	/** @type {AudioWorkletGlobalScope} */
	// @ts-ignore
	const audioWorkletGlobalScope = globalThis;
	const { registerProcessor } = audioWorkletGlobalScope;

	/** @type {WamSDKBaseModuleScope} */
	const ModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);
	const {
		WamProcessor
	} = ModuleScope;

    class WamEventViewerProcessor extends WamProcessor {
		_onTransport() {}

		_onMidi() {}

		_onSysex() {}

		_onMpe() {}

		_onOsc() {}

        _process() {}
    }
	try {
		registerProcessor(moduleId, WamEventViewerProcessor);
	} catch (error) {
		console.warn(error);
	}

    return WamEventViewerProcessor;
};

export default getWamEventViewerProcessor;
