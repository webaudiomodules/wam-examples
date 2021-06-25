// OBXD WAM Processor
// Jari Kleimola 2017-2020 (jari@webaudiomodules.org)

var AWGS = globalThis;
class OBXDProcessor extends AWGS.WasmProcessor
{
  constructor (options) {
    options.module = AWGS.WAM.OBXD;
    super(options);
    this.numOutChannels = [2];
  }
}

registerProcessor("Jari Kleimola 2017-2020 (jari@webaudiomodules.org)OBXD", OBXDProcessor);
