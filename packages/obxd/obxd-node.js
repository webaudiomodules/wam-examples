import WamNode from "../sdk/src/WamNode.js";
import WamParameter from "../sdk/src/WamParameter.js";

// OBXD WAM AudioNode
// Jari Kleimola 2017-2020 (jari@webaudiomodules.org)

export class OBXDNode extends WamNode
{
  // -- scripts need to be loaded first, and in order
  //
  static async importScripts (actx, prefix) {
    await actx.audioWorklet.addModule("../sdk/src/WamProcessor.js");
    await actx.audioWorklet.addModule("WasmProcessor.js");
    await actx.audioWorklet.addModule(prefix + "obxd.wasm.js");
    await actx.audioWorklet.addModule(prefix + "obxd.emsc.js");
    await actx.audioWorklet.addModule("obxd-proc.js");
  }

	static generateWamParameters() {
    let params = {}
    for (let i = 0; i < 71; i++)
      params[i] = new WamParameter(i);
		return params;
	}

	constructor(actx, instanceId, plug, options = {}) {
    options.numberOfInputs  = 0;
    options.numberOfOutputs = 1;
    options.outputChannelCount = [2];

		super(actx, "OBXD", instanceId, plug, options);
	}

  onEvent (event) {
    if (["midi","param","patch"].indexOf(event.type) >= 0)
      this.port.postMessage({ event });
    super.onEvent(event);
  }

  set (key,value) {
    switch (key) {
      case "bank":  this.bank = value; break; // or where to handle midi program changes ?
      case "patch": this.setState(value.params); break;
      case "param":
        this.onEvent({ type:"param", data:value });
        this.state[value.key] = value.value;
        break;
    }
  }

  async get (key) {}

  setState (state) {
    this.state = state;
    this.onEvent({ type:"patch", data:state.buffer });
  }

	async getState() { return this.state; }
}
