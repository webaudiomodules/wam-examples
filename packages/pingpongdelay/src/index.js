/* eslint-disable no-underscore-dangle */
// Double role for WebAudioModule :
// 1 - Factory for providing the DSP/WebAudio node and GUI
// 2 - This makes the instance of the current class an Observable
//     (state in WebAudioModule, initialized with the default values of
//      the params variable below...)
import { WebAudioModule } from '@webaudiomodules/sdk';
import { ParamMgrFactory } from '@webaudiomodules/sdk-parammgr';
import PingPongDelayNode from './Node.js';
import { createElement } from './Gui/index.js';

/**
 * @param {URL} relativeURL
 * @returns {string}
 */
const getBasetUrl = (relativeURL) => {
	const baseURL = relativeURL.href.substring(0, relativeURL.href.lastIndexOf('/'));
	return baseURL;
};

/**
 * Definition of a new plugin
 *
 * @class PingPongDelayPlugin
 * @extends {WebAudioModule<PingPongDelayNode>}
 */
export default class PingPongDelayPlugin extends WebAudioModule {
	_baseURL = getBasetUrl(new URL('.', import.meta.url));

	_descriptorUrl = `${this._baseURL}/descriptor.json`;

	async _loadDescriptor() {
		const url = this._descriptorUrl;
		if (!url) throw new TypeError('Descriptor not found');
		const response = await fetch(url);
		const descriptor = await response.json();
		Object.assign(this.descriptor, descriptor);
	}

	async initialize(state) {
		await this._loadDescriptor();
		return super.initialize(state);
	}

	async createAudioNode(initialState) {
		const pingPongDelayNode = new PingPongDelayNode(this.audioContext);

		const paramsConfig = {
			feedback: {
				minValue: 0,
				maxValue: 1,
				defaultValue: 0.5,
			},
			time: {
				defaultValue: 0.5,
			},
			mix: {
				defaultValue: 0.5,
			},
			enabled: {
				defaultValue: 1,
			},
		};
		const internalParamsConfig = {
			delayLeftTime: pingPongDelayNode.delayNodeLeft.delayTime,
			delayRightTime: pingPongDelayNode.delayNodeRight.delayTime,
			dryGain: pingPongDelayNode.dryGainNode.gain,
			wetGain: pingPongDelayNode.wetGainNode.gain,
			feedback: pingPongDelayNode.feedbackGainNode.gain,
			enabled: { onChange: (value) => { pingPongDelayNode.status = !!value; } },
		};
		const paramsMapping = {
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

		const optionsIn = { internalParamsConfig, paramsConfig, paramsMapping };
		const paramMgrNode = await ParamMgrFactory.create(this, optionsIn);
		pingPongDelayNode.setup(paramMgrNode);
		if (initialState) pingPongDelayNode.setState(initialState);
		return pingPongDelayNode;
	}

	createGui() {
		return createElement(this);
	}
}
