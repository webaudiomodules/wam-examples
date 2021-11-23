// OBXD WAM Processor
// Jari Kleimola 2017-2020 (jari@webaudiomodules.org)

/**
 * @param {string} [moduleId]
 */
 const initObxdProcessor = (moduleId) => {
	const ModuleScope = globalThis.webAudioModules.getModuleScope(moduleId);
	const { WasmProcessor, OBXD } = ModuleScope;

  class OBXDProcessor extends WasmProcessor
  {
    constructor (options) {
      options.module = OBXD;
      super(options);
      this.numOutChannels = [2];
    }
  }

  registerProcessor(moduleId, OBXDProcessor);
};

export default initObxdProcessor;
