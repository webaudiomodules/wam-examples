/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
/* eslint-disable import/extensions */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */
// Double role for WebAudioModule :
// 1 - Factory for providing the DSP/WebAudio node
// 2 - This makes the instance of the current class an Observable
//     (state in WebAudioModule, initialized with the default values of
//      the params variable below...)
// 3 - this is where we can declare params (internal params and exposed params)
//     Params can be automatable, so in this example all plugin params are also
//     AudioWorklet params, no need to make a difference between the internal
//     and exposed params.
import WebAudioModule from '../sdk/src/WebAudioModule.js';
import CompositeAudioNode from '../sdk/src/ParamMgr/CompositeAudioNode.js';
import ParamMgrFactory from '../sdk/src/ParamMgr/ParamMgrFactory.js';
import createElement from './gui.js';
import fetchModule from './fetchModule.js';


class FaustPingPongDelayNode extends CompositeAudioNode {
	setup(output, paramMgr) {
		this.connect(output, 0, 0);
		this._wamNode = paramMgr;
		this._output = output;
	}

	destroy() {
		super.destroy();
		if (this._output) this._output.destroy();
	}

	getParamValue(name) {
		return this._wamNode.getParamValue(name);
	}

	setParamValue(name, value) {
		return this._wamNode.setParamValue(name, value);
	}
}

const getBasetUrl = (relativeURL) => {
	const baseURL = relativeURL.href.substring(0, relativeURL.href.lastIndexOf('/'));
	return baseURL;
};
// Definition of a new plugin
export default class FaustPingPongDelayPlugin extends WebAudioModule {
	static descriptor = {
		name: 'FaustPingPongDelay',
		vendor: 'WebAudioModule',
	};

	/**
	 * Faust generated WebAudio AudioWorkletNode Constructor
	 */
	_PluginFactory;

	async initialize(state) {
		const imported = await fetchModule('./Node.js');
		this._PluginFactory = imported[Object.keys(imported)[0]];
		return super.initialize(state);
	}

	// The plugin redefines the async method createAudionode()
	// that must return an <Audionode>
	// It also listen to plugin state change event to update the audionode internal state
	async createAudioNode(initialState) {
		const baseURL = getBasetUrl(new URL('.', import.meta.url));
		const factory = new this._PluginFactory(this.audioContext, baseURL);
		const faustNode = await factory.load();
		const paramMgrNode = await ParamMgrFactory.create(this, { internalParamsConfig: Object.fromEntries(faustNode.parameters) });
		const node = new FaustPingPongDelayNode(this.audioContext);
		node.setup(faustNode, paramMgrNode);
		if (initialState) node.setState(initialState);
		return node;
	}

	createGui() {
		return createElement(this);
	}
}
