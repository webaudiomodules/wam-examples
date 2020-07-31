// Double role for WebAudioModule :
// 1 - Factory for providing the DSP/WebAudio node and GUI
// 2 - This makes the instance of the current class an Observable
//     (state in WebAudioModule, initialized with the default values of
//      the params variable below...)
import { WebAudioModule, ParamMgrFactory } from 'sdk';
import PingPongDelayNode from './Node.js';
import { createElement } from './Gui/index.js';
/**
 * Definition of a new plugin
 *
 * @class PingPongDelayPlugin
 * @extends {WebAudioModule<PingPongDelayNode>}
 */
export default class PingPongDelayPlugin extends WebAudioModule {
	static descriptor = {
		name: 'PingPongDelay',
		vendor: 'WebAudioModule',
	};

	// The plugin redefines the async method createAudionode()
	// that must return an <Audionode>
	// It also listen to plugin state change event to update the audionode internal state

	async createAudioNode(initialState) {
		const pingPongDelayNode = new PingPongDelayNode(this.audioContext);

		const paramsConfig = {
			feedback: {
				defaultValue: 0.5,
			},
			time: {
				defaultValue: 0.5,
			},
			mix: {
				defaultValue: 0.5,
			},
			enabled: {
				defaultValue: 1,
			},
		};
		const internalParamsConfig = {
			delayLeftTime: pingPongDelayNode.delayNodeLeft.delayTime,
			delayRightTime: pingPongDelayNode.delayNodeRight.delayTime,
			dryGain: pingPongDelayNode.dryGainNode.gain,
			wetGain: pingPongDelayNode.wetGainNode.gain,
			feedback: pingPongDelayNode.feedbackGainNode.gain,
			enabled: { onChange: (value) => { pingPongDelayNode.status = !!value; } },
		};
		const paramsMapping = {
			time: {
				delayLeftTime: {},
				delayRightTime: {},
			},
			mix: {
				dryGain: {
					sourceRange: [0.5, 1],
					targetRange: [1, 0],
				},
				wetGain: {
					sourceRange: [0, 0.5],
					targetRange: [0, 1],
				},
			},
		};

		const optionsIn = { internalParamsConfig, paramsConfig, paramsMapping };
		const paramMgrNode = await ParamMgrFactory.create(this, optionsIn);
		pingPongDelayNode.setup(paramMgrNode);
		if (initialState) pingPongDelayNode.setState(initialState);
		//----
		return pingPongDelayNode;
	}

	createGui() {
		return createElement(this);
	}
}
