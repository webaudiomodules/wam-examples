/* eslint-disable no-underscore-dangle */
import { WebAudioPlugin } from 'sdk';

export default class PingPongDelayPlugin extends WebAudioPlugin {
	static pluginName = 'PingPongDelay';

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
