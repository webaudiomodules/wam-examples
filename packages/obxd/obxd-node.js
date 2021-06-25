import WamNode from "../sdk/src/WamNode.js";
import WamParameter from "../sdk/src/WamParameter.js";

// OBXD WAM AudioNode
// Jari Kleimola 2017-2020 (jari@webaudiomodules.org)

export class OBXDNode extends WamNode
{
  // -- scripts need to be loaded first, and in order
  //
  static async importScripts (actx, prefix) {
    const baseUrl = import.meta.url;
    await actx.audioWorklet.addModule(new URL("../sdk/src/WamEnv.js", baseUrl));
    await actx.audioWorklet.addModule(new URL("../sdk/src/WamProcessor.js", baseUrl));
    await actx.audioWorklet.addModule(new URL("WasmProcessor.js", baseUrl));
    await actx.audioWorklet.addModule(new URL(prefix + "obxd.wasm.js", baseUrl));
    await actx.audioWorklet.addModule(new URL(prefix + "obxd.emsc.js", baseUrl));
    await actx.audioWorklet.addModule(new URL("obxd-proc.js", baseUrl));
  }

	static generateWamParameters() {
    let params = {}
    for (let i = 0; i < 71; i++)
      params[i] = new WamParameter(i);
		return params;
	}

	constructor(plug, options = {}) {
    options.numberOfInputs  = 0;
    options.numberOfOutputs = 1;
    options.outputChannelCount = [2];

		super(plug, options);
	}
  

  // --------------------------------------------------------------------------
  // bank parser
  // bank fxb is a binary blob but it also embeds (invalid) xml of form
  // <Datsounds currentProgram = "..."
  //   <programs>
  //     <program programName="..." 0="value" 1="value" ... />
  //   </programs>
  // </Datsounds>
  //
  /**
   *
   *
   * @param {ArrayBuffer} data
   * @returns
   * @memberof OBXDNode
   */
  async setState (data) {
    // -- extract xml from binary and parse it
    // -- cannot use DOMParser since fxb attribute names are numbers
    //
    let xml = new TextDecoder("utf-8").decode(data.subarray(168, data.length-1));
    let i1 = xml.indexOf("<programs>");
    let i2 = xml.indexOf("</programs>");
    if (i1 > 0 && i2 > 0) {
      xml = xml.slice(i1+10, i2);
      i1 = xml.indexOf("programName");
      i2 = 0;
      let patchCount = 0;
      while (i1 > 0 && patchCount++ < 128) {
        let patch = { name:"", params:new Float32Array(71) }

        // patch name
        let n1 = xml.indexOf('\"', i1);
        let n2 = xml.indexOf('\"', n1+1);
        if (n1 < 0 || n2 < 0) break;
        patch.name = xml.slice(n1+1, n2);

        // params are attributes of form <number> = <floatValue>
        i2 = xml.indexOf("/>", n2);
        if (i2 > 0) {
          let s2 = xml.slice(n2+2, i2);
          let tokens = s2.split(' ');
          if (tokens.length == 71) {
            let params = [];
            for (let i=0; i<tokens.length; i++) {
              let pair = tokens[i].split('"');
              patch.params[i] = parseFloat(pair[1]);
            }
          }
        }

        if (patch.name != "Default") // skip empty patches
        i1 = xml.indexOf("programName", i2);
      }
    }

    super.setState(patch);
  }
}
