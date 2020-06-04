/* eslint-disable no-underscore-dangle */
// Double role for WebAudioPlugin :
// 1 - Factory for providing the DSP/WebAudio node
// 2 - This makes the instance of the current class an Observable
//     (state in WebAudioPlugin, initialized with the default values of
//      the params variable below...)
// 3 - this is where we can declare params (internal params and exposed params)
//     Params can be automatable, so in this example all plugin params are also
//     AudioWorklet params, no need to make a difference between the internal 
//     and exposed params.
import { WebAudioPlugin } from '../../sdk/esm/index.js';

import PluginFactory from './Node.js';

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
		const factory = new PluginFactory(this.audioContext, baseURL);
		let node = await factory.load();

		// Note that the "exposed param names" will be the property names, not the 
		// names passed in the get(...). These exposed params will be used in the GUI code
		// and in the descriptor.json code.
		this.internalParamsConfig = {
            mix: node.parameters.get('/PingPongDelayFaust/mix'),
            feedback: node.parameters.get('/PingPongDelayFaust/feedback'),
			time: node.parameters.get('/PingPongDelayFaust/time'),
			enabled: node.parameters.get('/PingPongDelayFaust/bypass')
        };
		
		return node;
	}
}
