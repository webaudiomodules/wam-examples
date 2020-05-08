/* eslint-disable no-underscore-dangle */
// Double role for WebAudioPlugin :
// 1 - Factory for providing the DSP/WebAudio node and GUI
// 2 - This makes the instance of the current class an Observable
//     (state in WebAudioPlugin, initialized with the default values of
//      the params variable below...)
import { WebAudioPlugin } from 'sdk';

import PingPongDelayNode from './Node';

// Definition of a new plugin
export default class PingPongDelayPlugin extends WebAudioPlugin {
	// The plugin redefines the async method createAudionode()
	// that must return an <Audionode>
	// It also listen to plugin state change event to update the audionode internal state
	async createAudioNode(options) {
		const pingPongDelayNode = new PingPongDelayNode(this.audioContext, options);

		pingPongDelayNode.status = this.status;
		pingPongDelayNode.feedback = this.params.feedback;
		pingPongDelayNode.mix = this.params.mix;
		pingPongDelayNode.time = this.params.time;

		// Listen to status change
		// eslint-disable-next-line no-unused-vars
		this.onEnabledChange((newEnabled, previousEnabled) => {
			pingPongDelayNode.status = newEnabled;
		});

		// Listen to a single param change
		// eslint-disable-next-line no-unused-vars
		this.onParamChange('feedback', (newFeedback, previousFeedback) => {
			pingPongDelayNode.feedback = newFeedback;
		});

		// Listen to any param change
		// eslint-disable-next-line no-unused-vars
		this.onParamsChange((newParams, previousParams, changedParams) => {
			const { mix, time } = newParams;
			pingPongDelayNode.mix = mix;
			pingPongDelayNode.time = time;
		});

		return pingPongDelayNode;
	}
}
