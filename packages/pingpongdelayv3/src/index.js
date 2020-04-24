/* eslint-disable no-underscore-dangle */
// Double role for WebAudioPlugin :
// 1 - Factory for providing the DSP/WebAudio node and GUI
// 2 - This makes the instance of the current class an Observable
//     (state in WebAudioPlugin, initialized with the default values of
//      the params variable below...)
import { WebAudioPlugin } from 'sdkv3';

import PingPongDelayNode from './Node';

// Definition of a new plugin
export default class PingPongDelayPlugin extends WebAudioPlugin {
	// The plugin redefines the async method createAudionode()
	// that must return an <Audionode>
	// It also listen to plugin state change event to update the audionode internal state
	async createAudionode(options) {
		const pingPongDelayNode = new PingPongDelayNode(this.audioContext, options);

		pingPongDelayNode.status = this.state.status;
		pingPongDelayNode.feedback = this.state.params.feedback;
		pingPongDelayNode.mix = this.state.params.mix;
		pingPongDelayNode.time = this.state.params.time;

		this.on('change:status', (status) => {
			pingPongDelayNode.status = status;
		});

		this.on('change:params', (params) => {
			const {
				feedback,
				mix,
				time,
			} = params;
			pingPongDelayNode.feedback = feedback;
			pingPongDelayNode.mix = mix;
			pingPongDelayNode.time = time;
		});

		return pingPongDelayNode;
	}
}
