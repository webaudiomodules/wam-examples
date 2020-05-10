/* eslint-disable no-underscore-dangle */
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
	constructor(context) {
		super(context);
		this.internalParamsConfig = {
			delayLeftTime: {},
			delayRightTime: {},
			dryGain: {},
			wetGain: {},
			feedback: {},
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
	}

	async createAudioNode(options) {
		const pingPongDelayNode = new PingPongDelayNode(this.audioContext, options);

		pingPongDelayNode.feedbackGainNode.gain.value = 0;
		pingPongDelayNode.delayNodeLeft.delayTime.value = 0;
		pingPongDelayNode.delayNodeRight.delayTime.value = 0;
		pingPongDelayNode.dryGainNode.gain.value = 0;
		pingPongDelayNode.wetGainNode.gain.value = 0;
		this.paramMgr.connectParam('feedback', pingPongDelayNode.feedbackGainNode.gain);
		this.paramMgr.connectParam('delayLeftTime', pingPongDelayNode.delayNodeLeft.delayTime);
		this.paramMgr.connectParam('delayRightTime', pingPongDelayNode.delayNodeRight.delayTime);
		this.paramMgr.connectParam('dryGain', pingPongDelayNode.dryGainNode.gain);
		this.paramMgr.connectParam('wetGain', pingPongDelayNode.wetGainNode.gain);

		pingPongDelayNode.status = this.enabled;
		// Listen to status change
		// eslint-disable-next-line no-unused-vars
		this.onEnabledChange((newEnabled, previousEnabled) => {
			pingPongDelayNode.status = newEnabled;
		});

		return pingPongDelayNode;
	}
}
