// Double role for WebAudioPlugin :
// 1 - Factory for providing the DSP/WebAudio node and GUI
// 2 - This makes the instance of the current class an Observable
//     (state in WebAudioPlugin, initialized with the default values of
//      the params variable below...)
import { WebAudioPlugin } from 'sdk';

import PingPongDelayNode from './Node';
/**
 * @typedef {"feedback" | "time" | "mix"} Params
 * @typedef {"feedback" | "delayLeftTime" | "delayRightTime"
 * | "dryGain" | "wetGain" | "enabled"} InternalParams
 */
/**
 * Definition of a new plugin
 *
 * @class PingPongDelayPlugin
 * @extends {WebAudioPlugin<PingPongDelayNode, Params, InternalParams>}
 */
export default class PingPongDelayPlugin extends WebAudioPlugin {
	// The plugin redefines the async method createAudionode()
	// that must return an <Audionode>
	// It also listen to plugin state change event to update the audionode internal state

	async createAudioNode(options) {
		const pingPongDelayNode = new PingPongDelayNode(this.audioContext, options);

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
}
