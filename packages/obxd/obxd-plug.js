import WamLoader from "../sdk/src/WamLoader.js";
import { OBXDNode } from "./obxd-node.js";

// OBXD WAM Plugin
// Jari Kleimola 2017-2020 (jari@webaudiomodules.org)

export class OBXDPlugin extends WamLoader
{
  static descriptor = {
		name: "OBXD",
		vendor: "WAM",
	}

  constructor (actx) {
    super(actx);
  }

	async createAudioNode (options = {}) {
    await OBXDNode.importScripts(this.audioContext, "wasm/");
    return new OBXDNode(this.audioContext, this.instanceId, this, options);
	}

	async createGui (options = {}) {
    const { createElement } = await import("./obxd-gui.js");
		return await createElement(this, options); // added await
  }

  async get (key) { return this.audioNode.get(key); }
  set (key,value) { this.audioNode.set(key,value);  }


  // --------------------------------------------------------------------------
  // bank parser
  // bank fxb is a binary blob but it also embeds (invalid) xml of form
  // <Datsounds currentProgram = "..."
  //   <programs>
  //     <program programName="..." 0="value" 1="value" ... />
  //   </programs>
  // </Datsounds>
  //
  async loadBank (url) {
    let resp = await fetch(url);
    let data = new Uint8Array(await resp.arrayBuffer());

    // we need to handle midi program changes somewhere
    this.bank = { name: url.substr(url.lastIndexOf("/") + 1), patches:[] }

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
          this.bank.patches.push(patch);
        i1 = xml.indexOf("programName", i2);
      }
    }

    this.set( "patch", this.bank.patches[0] );
    return this.bank;
  }
}
