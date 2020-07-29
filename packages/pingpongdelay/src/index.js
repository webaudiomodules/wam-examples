// Double role for WebAudioModule :
// 1 - Factory for providing the DSP/WebAudio node and GUI
// 2 - This makes the instance of the current class an Observable
//     (state in WebAudioModule, initialized with the default values of
//      the params variable below...)
import { WebAudioModule } from 'sdk';

import PingPongDelayNode from './Node.js';
import { createElement } from './Gui/index.js';
/**
 * @typedef {"feedback" | "time" | "mix"} Params
 * @typedef {"feedback" | "delayLeftTime" | "delayRightTime"
 * | "dryGain" | "wetGain" | "enabled"} InternalParams
 */
/**
 * Definition of a new plugin
 *
 * @class PingPongDelayPlugin
 * @extends {WebAudioModule<PingPongDelayNode, Params, InternalParams>}
 */
export default class PingPongDelayPlugin extends WebAudioModule {
	static descriptor = {
		name: 'PingPongDelay',
		vendor: 'WebAudioModule',
	};

	// The plugin redefines the async method createAudionode()
	// that must return an <Audionode>
	// It also listen to plugin state change event to update the audionode internal state

	async createAudioNode(options) {
		const pingPongDelayNode = new PingPongDelayNode(this.audioContext, options);

		this.paramsConfig = {
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
		this.internalParamsConfig = {
			delayLeftTime: pingPongDelayNode.delayNodeLeft.delayTime,
			delayRightTime: pingPongDelayNode.delayNodeRight.delayTime,
			dryGain: pingPongDelayNode.dryGainNode.gain,
			wetGain: pingPongDelayNode.wetGainNode.gain,
			feedback: pingPongDelayNode.feedbackGainNode.gain,
			enabled: { onChange: (value) => { pingPongDelayNode.status = !!value; } },
		};
		this.paramsMapping = {
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

		return pingPongDelayNode;
	}

	createGui() {
		return createElement(this);
	}
}
