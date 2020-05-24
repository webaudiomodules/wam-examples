/* eslint-disable no-underscore-dangle */
// Double role for WebAudioPlugin :
// 1 - Factory for providing the DSP/WebAudio node and GUI
// 2 - This makes the instance of the current class an Observable
//     (state in WebAudioPlugin, initialized with the default values of
//      the params variable below...)
import { WebAudioPlugin } from 'sdk';

import QuadrafuzzNode from './Node';

// Definition of a new plugin
export default class QuadrafuzzPlugin extends WebAudioPlugin {
	// The plugin redefines the async method createAudionode()
	// that must return an <Audionode>
	// It also listen to plugin state change event to update the audionode internal state
	async createAudioNode(options) {
		const quadrafuzzNode = new QuadrafuzzNode(this.audioContext, options);


		this.internalParamsConfig = {
			// quadrafuzzNode.overdrives[0] is a waveshaper. When we call setLowGain(value) it will change
			// the curve of the waveshaper... so... we don't really want to automatize at a fast rate...
			// I guess this is the case of a developer who is gonna do custom automation
			lowGain: quadrafuzzNode.overdrives[0].curve,
			// and we do have other "params"
			midLowGain: quadrafuzzNode.overdrives[1].curve,
			midHighGain: quadrafuzzNode.overdrives[2].curve,
			highGain: quadrafuzzNode.overdrives[3].curve,

			enabled: { onChange: (value) => { quadrafuzzNode.status = !!value; } },
		};
		// hmmm no mapping...
		this.paramsMapping = {
		};

		//----
		return quadrafuzzNode;
	}
}
