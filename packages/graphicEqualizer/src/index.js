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

		// Defined exposed parameters
		/*
		this.addFilter("highpass", 0.00001, 40, 12, "red");
        this.addFilter("lowshelf", 0, 80, 0, "yellow");
        this.addFilter("peaking", 1, 230, 0, "green");
        this.addFilter("peaking", 1, 2500, 0, "turquoise");
        this.addFilter("peaking", 1, 5000, 0, "blue");
        this.addFilter("highshelf", 1, 10000, 0, "violet");
		this.addFilter("lowpass", 0.00001, 18000, 12, "red");
		*/
		const paramsConfig = {
			enabled: {
				defaultValue: 1,
				minValue: 0,
				maxValue: 1,
			},
		};

		// if some of the exposed parameters correspond to native WebAudio nodes, we will be
		// able to benefit from the WebAudio API implementation of automation
		const internalParamsConfig = {
			/*
			// quadrafuzzNode.overdrives[0] is a waveshaper. When we call setLowGain(value) it will change
			// the curve of the waveshaper... so... we don't really want to automatize at a fast rate...
			// I guess this is the case of a developer who is gonna do custom automation
			lowGain: { onChange: (value) => { quadrafuzzNode.lowGain = value; } },
			// and we do have other "params"
			midLowGain: { onChange: (value) => { quadrafuzzNode.midLowGain = value; } },
			midHighGain: { onChange: (value) => { quadrafuzzNode.midHighGain = value; } },
			highGain: { onChange: (value) => { quadrafuzzNode.highGain = value; } },
			*/
			enabled: { onChange: (value) => { graphicEQNode.status = !!value; } },
		};
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