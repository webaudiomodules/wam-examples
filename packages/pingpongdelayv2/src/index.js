/* eslint-disable no-underscore-dangle */
// Double role for WebAudioPlugin :
// 1 - Factory for providing the DSP/WebAudio node and GUI
// 2 - This makes the instance of the current class an Observable
//     (state in WebAudioPlugin, initialized with the default values of
//      the params variable below...)
import { WebAudioPlugin } from 'sdk';

export default class PingPongDelayPlugin extends WebAudioPlugin {
	// not used so far... metadata so far
	static pluginName = 'PingPongDelay';

	// Not mandatory, but if your plugin has params, they should be
	// declared here. This will be used as state default values
	// There is always a default param named "enabled"
	params = {
		feedback: {
			defaultValue: 0.5,
			minValue: 0,
			maxValue: 1,
		},
		time: {
			defaultValue: 0.5,
			minValue: 0,
			maxValue: 1,
		},
		mix: {
			defaultValue: 0.5,
			minValue: 0,
			maxValue: 1,
		},
	};

	loadAudioNodeModule = async () => {
		console.log('loadAudioNode()');
		return import('./Node');
	};

	loadGuiModule = async () => {
		console.log('loadGui()');
		return import('./Gui');
	};
}
