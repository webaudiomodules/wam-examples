// OBXD WAM Processor
// Jari Kleimola 2017-2020 (jari@webaudiomodules.org)

/**
 * @param {string} [moduleId]
 */
const initObxdProcessor = (moduleId) => {
	const dependencies = globalThis.webAudioModules.dependencies[moduleId];
	const { WasmProcessor, OBXD } = dependencies;

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
