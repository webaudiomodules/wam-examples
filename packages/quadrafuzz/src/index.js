/* eslint-disable no-underscore-dangle */
// Double role for WebAudioPlugin :
// 1 - Factory for providing the DSP/WebAudio node and GUI
// 2 - This makes the instance of the current class an Observable
//     (state in WebAudioPlugin, initialized with the default values of
//      the params variable below...)
import { WebAudioPlugin } from 'sdkv3';

import QuadrafuzzNode from './Node';

// Definition of a new plugin
export default class QuadrafuzzPlugin extends WebAudioPlugin {
	// The plugin redefines the async method createAudionode()
	// that must return an <Audionode>
	// It also listen to plugin state change event to update the audionode internal state
	async createAudioNode(options) {
		const quadrafuzzNode = new QuadrafuzzNode(this.audioContext, options);

		// ADJUST PARAMETERS
		quadrafuzzNode.status = this.state.status;
		quadrafuzzNode.lowGain = this.state.params.lowGain;
		quadrafuzzNode.midLowGain = this.state.params.midLowGain;
		quadrafuzzNode.midHighGain = this.state.params.midHighGain;
		quadrafuzzNode.highGain = this.state.params.highGain;

		this.on('change:enabled', (status) => {
			quadrafuzzNode.status = status;
		});

		this.on('change:params', (params) => {
			const {
				lowGain,
				midLowGain,
				midHighGain,
				highGain
			} = params;
			quadrafuzzNode.lowGain = lowGain;
			quadrafuzzNode.midLowGain = midLowGain;
			quadrafuzzNode.midHighGain = midHighGain;
			quadrafuzzNode.highGain = highGain;
		});

		return quadrafuzzNode;
	}
}
