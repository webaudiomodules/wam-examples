import WamNode from "../sdk/src/WamNode.js";
import WamParameter from "../sdk/src/WamParameter.js";
import WamParameterInfo from "../sdk/src/WamParameterInfo.js";

// OBXD WAM AudioNode
// Jari Kleimola 2017-2020 (jari@webaudiomodules.org)
const paramsMap = ["?","MIDILEARN","VOLUME","VOICE_COUNT","TUNE","OCTAVE",
  "BENDRANGE","BENDOSC2","LEGATOMODE","BENDLFORATE","VFLTENV","VAMPENV",
  "ASPLAYEDALLOCATION","PORTAMENTO","UNISON","UDET","OSC2_DET",
  "LFOFREQ","LFOSINWAVE","LFOSQUAREWAVE","LFOSHWAVE","LFO1AMT","LFO2AMT",
  "LFOOSC1","LFOOSC2","LFOFILTER","LFOPW1","LFOPW2",
  "OSC2HS","XMOD","OSC1P","OSC2P","OSCQuantize","OSC1Saw","OSC1Pul",
  "OSC2Saw","OSC2Pul","PW","BRIGHTNESS","ENVPITCH",
  "OSC1MIX","OSC2MIX","NOISEMIX",
  "FLT_KF","CUTOFF","RESONANCE","MULTIMODE","FILTER_WARM","BANDPASS","FOURPOLE","ENVELOPE_AMT",
  "LATK","LDEC","LSUS","LREL","FATK","FDEC","FSUS","FREL",
  "ENVDER","FILTERDER","PORTADER",
  "PAN1","PAN2","PAN3","PAN4","PAN5","PAN6","PAN7","PAN8",
  "UNLEARN",
  "ECONOMY_MODE_?","LFO_SYNC_?","PW_ENV_?","PW_ENV_BOTH_?","ENV_PITCH_BOTH_?",
  "FENV_INVERT_?","PW_OSC2_OFS_?","LEVEL_DIF_?","SELF_OSC_PUSH_?"
].slice(1, 71);

const parameterValues = [0, 0.2759999930858612, 0.1428571492433548, 0.5, 0.41600000858306885, 0, 0, 0, 0.6000000238418579, 0.8080000281333923, 0, 1, 0, 1, 0.20400001108646393, 0.25600001215934753, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.8920000195503235, 0, 0.18799999356269836, 0, 1, 1, 1, 1, 0, 0, 0, 0.9760000109672546, 0.7639999985694885, 0, 1, 0.08400000631809235, 0.03200000897049904, 0.8199999928474426, 0, 0, 1, 0.6559999585151672, 0, 0, 1, 0, 0.004000000189989805, 0.29600000381469727, 0.13199999928474426, 0, 0, 0, 0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0];

export class OBXDNode extends WamNode {
  // -- scripts need to be loaded first, and in order
  //
  static async importScripts(actx, prefix) {
    const baseUrl = import.meta.url;
    await actx.audioWorklet.addModule(new URL("../sdk/src/WamEnv.js", baseUrl));
    await actx.audioWorklet.addModule(new URL("../sdk/src/WamProcessor.js", baseUrl));
    await actx.audioWorklet.addModule(new URL("WasmProcessor.js", baseUrl));
    await actx.audioWorklet.addModule(new URL(prefix + "obxd.wasm.js", baseUrl));
    await actx.audioWorklet.addModule(new URL(prefix + "obxd.emsc.js", baseUrl));
    await actx.audioWorklet.addModule(new URL("obxd-proc.js", baseUrl));
  }

	/**
   * @param {import('../sdk').WebAudioModule} plug
   * @param {HTMLTemplateElement} template
   * @param {AudioWorkletNodeOptions} [options={}]
   */
  constructor(plug, options = {}) {
    options.numberOfInputs  = 0;
    options.numberOfOutputs = 1;
    options.outputChannelCount = [2];
    options.processorOptions = {
      parameterValues
    };

		super(plug, options);

    /**
     * obxd params are values in a float array,
     * just map control ids to indices here
     * @type {string[]}
     */
    this.paramsMap = paramsMap;
    this.wamParameterInfo = this.paramsMap.map((label, id) => new WamParameterInfo(id.toString(), {
      label,
      minValue: 0,
      maxValue: 1,
      defaultValue: parameterValues[id]
    }));
    /** @type {{ name: string, patches: { name: string; params: Float32Array }[] }} */
    this.bank = { name: "", patches: [] };
	}

  async getParameterInfo(...parameterIdQuery) {
    if (!parameterIdQuery.length) parameterIdQuery = Object.keys(this.paramsMap);
    return parameterIdQuery.reduce((acc, cur) => {
      acc[cur] = this.wamParameterInfo[cur];
      return acc;
    }, {});
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
  async loadBank(url) {
    let resp = await fetch(url);
    let data = new Uint8Array(await resp.arrayBuffer());

    // we need to handle midi program changes somewhere
    this.bank = { name: url.substr(url.lastIndexOf("/") + 1), patches: [] };

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
        let patch = { name: "", params: new Float32Array(70) };

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
            for (let i=1; i<tokens.length; i++) {
              let pair = tokens[i].split('"');
              patch.params[i - 1] = parseFloat(pair[1]);
            }
          }
        }

        if (patch.name != "Default") // skip empty patches
          this.bank.patches.push(patch);
        i1 = xml.indexOf("programName", i2);
      }
    }

    this.setPatch(0);
    return this.bank;
  }

  setPatch(index) {
    const patch = this.bank.patches?.[index];
    if (!patch) return;
    const state = Array.from(patch.params).reduce((acc, cur, idx) => {
      acc.parameterValues[idx] = { id: idx, value: cur, normalized: false };
      return acc;
    }, { parameterValues: {} })
    return this.setState(state);
  }
}
