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
import WebAudioModule from '../../sdk/src/WebAudioModule.js';
import CompositeAudioNode from '../../sdk/src/ParamMgr/CompositeAudioNode.js';
import ParamMgrRegister from '../../sdk/src/ParamMgr/ParamMgrRegister.js';
import PluginFactory from './Node.js';


class FaustPingPongDelayNode extends CompositeAudioNode {
	setup(output) {
		this.connect(output, 0, 0);
		this._output = output;
	}

	destroy() {
		super.destroy();
		this._output.destroy();
	}
}

const getBasetUrl = (relativeURL) => {
	const baseURL = relativeURL.href.substring(0, relativeURL.href.lastIndexOf('/'));
	return baseURL;
};
// Definition of a new plugin
export default class FaustPingPongDelayPlugin extends WebAudioModule {
	// The plugin redefines the async method createAudionode()
	// that must return an <Audionode>
	// It also listen to plugin state change event to update the audionode internal state
	async createAudioNode(initialState) {
		const baseURL = getBasetUrl(this.descriptor.url);
		const factory = new PluginFactory(this.audioContext, baseURL);
		const faustNode = await factory.load();
		const options = await ParamMgrRegister.register(this, faustNode.numberOfInputs, { internalParamsConfig: Object.fromEntries(faustNode.parameters) });
		const paramMgrNode = new FaustPingPongDelayNode(this, options, faustNode);
		await paramMgrNode.initialize();
		paramMgrNode.setup(faustNode);
		if (initialState) paramMgrNode.setState(initialState);
		return paramMgrNode;
	}
}
