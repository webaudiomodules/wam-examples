
    import WebAudioModule from './utils/sdk/src/WebAudioModule.js';
    import CompositeAudioNode from './utils/sdk/src/ParamMgr/CompositeAudioNode.js';
    import ParamMgrFactory from './utils/sdk/src/ParamMgr/ParamMgrFactory.js';
    import fetchModule from './fetchModule.js';
    import { createElement } from './Gui/index.js';


    class GuitarAmpSim60sNode extends CompositeAudioNode {
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
  export default class GuitarAmpSim60sPlugin extends WebAudioModule {
	    static descriptor = {
		    name: 'GuitarAmpSim60s',
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
		    const node = new GuitarAmpSim60sNode(this.audioContext);
        node.setup(faustNode, paramMgrNode);
        
        if (initialState) 
          node.setState(initialState);

		    return node;
	    }

	    createGui() {
		    return createElement(this);
	    }
  }
  