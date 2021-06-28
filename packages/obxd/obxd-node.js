import WamNode from "../sdk/src/WamNode.js";
import WamParameter from "../sdk/src/WamParameter.js";
import WamParameterInfo from "../sdk/src/WamParameterInfo.js";

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
    const resp = await fetch(new URL("./obxd-gui.html", baseUrl).href);
    const html = await resp.text();
    const template = document.createElement("template");
    template.innerHTML = html;
    return template;
  }

	static generateWamParameters() {
    let params = {}
    for (let i = 0; i < 71; i++)
      params[i] = new WamParameter(i);
		return params;
	}

	/**
   * @param {import('../sdk').WebAudioModule} plug
   * @param {HTMLTemplateElement} template
   * @param {AudioWorkletNodeOptions} [options={}]
   */
  constructor(plug, template, options = {}) {
    options.numberOfInputs  = 0;
    options.numberOfOutputs = 1;
    options.outputChannelCount = [2];

		super(plug, options);

    /**
     * obxd params are values in a float array,
     * just map control ids to indices here
     * @type {string[]}
     */
    this.paramsMap = ["?","MIDILEARN","VOLUME","VOICE_COUNT","TUNE","OCTAVE",
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
    ];
    this.wamParameterInfo = this.paramsMap.map((label, id) => new WamParameterInfo(id.toString(), {
      label,
      minValue: 0,
      maxValue: 1,
      defaultValue: label.indexOf("?") >= 0 ? 0 : +template.querySelector(`#${label}`)?.getAttribute('value') || 0
    }));
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
