/* eslint-disable no-underscore-dangle */
// Double role for WebAudioPlugin :
// 1 - Factory for providing the DSP/WebAudio node and GUI
// 2 - This makes the instance of the current class an Observable
//     (state in WebAudioPlugin, initialized with the default values of
//      the params variable below...)
import { WebAudioPlugin } from 'sdk';

import QuadrafuzzNode from './Node.js';

// Definition of a new plugin
export default class QuadrafuzzPlugin extends WebAudioPlugin {
	// The plugin redefines the async method createAudionode()
	// that must return an <Audionode>
	// It also listen to plugin state change event to update the audionode internal state
	async createAudioNode(options) {
		const quadrafuzzNode = new QuadrafuzzNode(this.audioContext, options);

		this.paramsConfig = {
			lowGain: {
				defaultValue: 0.6,
				minValue: 0,
				maxValue: 1,
			},
			midLowGain: {
				defaultValue: 0.8,
				minValue: 0,
				maxValue: 1,
			},
			midHighGain: {
				defaultValue: 0.5,
				minValue: 0,
				maxValue: 1,
			},
			highGain: {
				defaultValue: 0.5,
				minValue: 0,
				maxValue: 1,
			},
			enabled: {
				defaultValue: 1,
				minValue: 0,
				maxValue: 1,
			},
		};

		this.internalParamsConfig = {
			// quadrafuzzNode.overdrives[0] is a waveshaper. When we call setLowGain(value) it will change
			// the curve of the waveshaper... so... we don't really want to automatize at a fast rate...
			// I guess this is the case of a developer who is gonna do custom automation
			lowGain: { onChange: (value) => { quadrafuzzNode.lowGain = value; } },
			// and we do have other "params"
			midLowGain: { onChange: (value) => { quadrafuzzNode.midLowGain = value; } },
			midHighGain: { onChange: (value) => { quadrafuzzNode.midHighGain = value; } },
			highGain: { onChange: (value) => { quadrafuzzNode.highGain = value; } },
			enabled: { onChange: (value) => { quadrafuzzNode.status = !!value; } },
		};
		// hmmm no mapping...
		this.paramsMapping = {
		};

		//----
		return quadrafuzzNode;
	}
}
