/* eslint-disable no-underscore-dangle */
// Double role for WebAudioModule :
// 1 - Factory for providing the DSP/WebAudio node and GUI
// 2 - This makes the instance of the current class an Observable
//     (state in WebAudioModule, initialized with the default values of
//      the params variable below...)
import { WebAudioModule } from '@webaudiomodules/sdk';
import { ParamMgrFactory } from '@webaudiomodules/sdk-parammgr';
import QuadrafuzzNode from './Node.js';
import { createElement } from './Gui/index.js';

/**
 * @param {URL} relativeURL
 * @returns {string}
 */
const getBasetUrl = (relativeURL) => {
	const baseURL = relativeURL.href.substring(0, relativeURL.href.lastIndexOf('/'));
	return baseURL;
};

export default class QuadrafuzzPlugin extends WebAudioModule {
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
		const quadrafuzzNode = new QuadrafuzzNode(this.audioContext);
		const internalParamsConfig = {
			// quadrafuzzNode.overdrives[0] is a waveshaper. When we call setLowGain(value) it will change
			// the curve of the waveshaper... so... we don't really want to automatize at a fast rate...
			// I guess this is the case of a developer who is gonna do custom automation
			lowGain: {
				defaultValue: 0.6,
				minValue: 0,
				maxValue: 1,
				onChange: (value) => { quadrafuzzNode.lowGain = value; },
			},
			// and we do have other "params"
			midLowGain: {
				defaultValue: 0.8,
				minValue: 0,
				maxValue: 1,
				onChange: (value) => { quadrafuzzNode.midLowGain = value; },
			},
			midHighGain: {
				defaultValue: 0.5,
				minValue: 0,
				maxValue: 1,
				onChange: (value) => { quadrafuzzNode.midHighGain = value; },
			},
			highGain: {
				defaultValue: 0.5,
				minValue: 0,
				maxValue: 1,
				onChange: (value) => { quadrafuzzNode.highGain = value; },
			},
			enabled: {
				defaultValue: 1,
				minValue: 0,
				maxValue: 1,
				onChange: (value) => { quadrafuzzNode.status = !!value; },
			},
		};
		// hmmm no mapping...
		// const paramsMapping = {};

		const optionsIn = { internalParamsConfig };
		const paramMgrNode = await ParamMgrFactory.create(this, optionsIn);
		quadrafuzzNode.setup(paramMgrNode);
		if (initialState) quadrafuzzNode.setState(initialState);
		//----
		return quadrafuzzNode;
	}

	createGui() {
		return createElement(this);
	}
}
