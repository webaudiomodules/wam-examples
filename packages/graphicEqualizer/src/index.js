/* eslint-disable no-underscore-dangle */
// Double role for WebAudioModule :
// 1 - Factory for providing the DSP/WebAudio node and GUI
// 2 - This makes the instance of the current class an Observable
//     (state in WebAudioModule, initialized with the default values of
//      the params variable below...)

// IMPORT NECESSARY DSK FILES
import WebAudioModule from '../../sdk/src/WebAudioModule.js';
import ParamMgrFactory from '../../sdk/src/ParamMgr/ParamMgrFactory.js';

// DSP part
import GraphicEQNode from './Node.js';
// GUI part
import { createElement } from './Gui/index.js';


// Definition of a new plugin
// All plugins must inherit from WebAudioModule
export default class GraphicEQPlugin extends WebAudioModule {
	static descriptor = {
		name: 'GraphiqEQ',
		vendor: 'WasabiSC',
	};

	// The plugin must redefine the async method createAudionode()
	// that returns an <Audionode>
	async createAudioNode(initialState) {
		// this node implements the DSP code. It is seen as a single WebAudio node
		// and shares the connect/disconnect methods, but it can be a graph
		// of nodes.
		const graphicEQNode = new GraphicEQNode(this.audioContext);
		graphicEQNode.createNodes();

		console.log("paramConfig setup")
		// Defined exposed parameters
		const paramsConfig = {
			enabled: {
				defaultValue: 1,
				minValue: 0,
				maxValue: 1,
			},
		};
		// let's generate one param per filter property
		
		// if some of the exposed parameters correspond to native WebAudio nodes, we will be
		// able to benefit from the WebAudio API implementation of automation
		const internalParamsConfig = {
			enabled: { onChange: (value) => { graphicEQNode.status = !!value; } },
		};
		/**
		 * @param {AudioParam} param
		 */ 
		const getParamConfigFromAudioParam = (param) => {
			const { minValue, maxValue, value: defaultValue } = param;
			return { minValue, maxValue, defaultValue };
		};
		graphicEQNode.filters.forEach((filter, index) => {
			const { type, Q, detune, frequency, gain } = filter;
			paramsConfig[`${type}_${index}_Q`] = getParamConfigFromAudioParam(Q);
			paramsConfig[`${type}_${index}_detune`] = getParamConfigFromAudioParam(detune);
			paramsConfig[`${type}_${index}_frequency`] = getParamConfigFromAudioParam(frequency);
			paramsConfig[`${type}_${index}_gain`] = getParamConfigFromAudioParam(gain);
			internalParamsConfig[`${type}_${index}_Q`] = { onChange: (value) => { Q.value = value; } };
			internalParamsConfig[`${type}_${index}_detune`] = { onChange: (value) => { detune.value = value; } };
			internalParamsConfig[`${type}_${index}_frequency`] = { onChange: (value) => { frequency.value = value; } };
			internalParamsConfig[`${type}_${index}_gain`] = { onChange: (value) => { gain.value = value; } };
		})

		// hmmm no mapping...
		// const paramsMapping = {};

		// Create a param manager instance (ParamMgr comes from the SDK)
		// with the param configs
		const optionsIn = { internalParamsConfig, paramsConfig };
		const paramMgrNode = await ParamMgrFactory.create(this, optionsIn);
		// Link the param manager to the DSP code of the plugin. 
		// Remember that the param manager will provide automation, etc.
		graphicEQNode.setup(paramMgrNode); 

		// If there is  an initial state at construction for this plugin, 
		if (initialState) graphicEQNode.setState(initialState);
		//----
		return graphicEQNode;
	}

	createGui() {
		return createElement(this);
	}
}
