/* eslint-disable no-underscore-dangle */
// Double role for WebAudioPlugin :
// 1 - Factory for providing the DSP/WebAudio node and GUI
// 2 - This makes the instance of the current class an Observable
//     (state in WebAudioPlugin, initialized with the default values of
//      the params variable below...)
import { WebAudioPlugin } from '../sdk/esm/index.js';

import './Node.js';

const getBasetUrl = (relativeURL) => {
	const baseURL = relativeURL.href.substring(0, relativeURL.href.lastIndexOf("/"));
	return baseURL;
};
// Definition of a new plugin
export default class FaustPingPongDelayPlugin extends WebAudioPlugin {
	// The plugin redefines the async method createAudionode()
	// that must return an <Audionode>
	// It also listen to plugin state change event to update the audionode internal state
	async createAudioNode(options) {
		const baseURL = getBasetUrl(this.descriptor.url);
		const pingPongDelayFactory = new PingPongDelayFaust(this.audioContext, baseURL);
		let pingPongDelayNode = await pingPongDelayFactory.load();

		this.internalParamsConfig = {
            mix: pingPongDelayNode.parameters.get('/faustPingPongDelay/mix'),
            feedback: pingPongDelayNode.parameters.get('/faustPingPongDelay/feedback'),
			time: pingPongDelayNode.parameters.get('/faustPingPongDelay/time'),
			enabled: pingPongDelayNode.parameters.get('/faustPingPongDelay/bypass'),
			
        };
		
		return pingPongDelayNode;
	}
}
