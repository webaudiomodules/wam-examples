import "./libs/wam-knob.js"
import "./libs/wam-toggle.js"

const baseUrl = import.meta.url;

export async function createElement (plugin, options)
{
  return new Promise(resolve => {

    // 1. ensure that <wam-obxd> element has been registered
    window.customElements.whenDefined("wam-obxd").then(async () => {

      // 2. load html template for <wam-obxd> (if not already loaded)
      if (!document.querySelector("#wam-obxd-template")) {
        let resp = await fetch(new URL("./obxd-gui.html", baseUrl).href);
        let html = await resp.text();
        let div = document.createElement("div");
        div.style.display = "none";
        div.innerHTML = html;
        document.body.appendChild(div);
      }

      // 3. create and return <wam-obxd> element
      let frontPanel = document.createElement("wam-obxd");
      frontPanel.set("skin", options.skin || "skin/");
      frontPanel.set("node", plugin.audioNode);
      resolve(frontPanel);
    })
  });
}

// OBXD WAM gui
// Jari Kleimola 2017-2020 (jari@webaudiomodules.org)

window.customElements.define("wam-obxd",
class OBXD_GUI extends HTMLElement
{
  constructor () {
    super();

    let template = document.querySelector("#wam-obxd-template");
    this._root = this.attachShadow({ mode: 'open' });
    this._root.appendChild(template.content.cloneNode(true));
    this._setupParams();
  }

  get (key) {
    switch (key) {
      case "width":  return 815;
      case "height": return 331;
    }
  }

  set (key,value) {
    switch (key) {
      case "node":
        /** @type {import('./obxd-node').OBXDNode} */
        this._node = value;
        // this._node.addEventCallback("subscriberID", (e) => {
        //   if (e.type == "patch") this.set("patch", new Float32Array(e.data));
        // })
        break;
      case "patch":
        for (let i=1; i<value.length; i++) {
          let widget = this._root.querySelector("#" + this.map[i]);
          widget.value = value[i];
        }
        break;
      case "skin":
        setTimeout(() => { this._setupControls("skin/"); }, 10);
        break;
    }
  }

  // -- obxd params are values in a float array
  // -- just map control ids to indices here
  _setupParams () {
    this.map = ["?","MIDILEARN","VOLUME","VOICE_COUNT","TUNE","OCTAVE",
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
  }

  _setupControls (skin) {
    if (!skin.endsWith("/")) skin += "/";
    this._root.querySelector("#background").src = new URL(skin + "background.png", baseUrl);

    // -- knobs
    Array.from(this._root.querySelectorAll("wam-knob")).forEach(knob => {
      knob.states = 127;
      knob.addEventListener("change", this._oncontrol.bind(this), false);
      if (knob.classList.contains("tiny"))
        knob.strip = skin + "knobssd.png";
      else knob.strip = skin + "knoblsd.png";
    })

    // -- toggles
    Array.from(this._root.querySelectorAll("wam-toggle")).forEach(toggle => {
      let strip = "button.png";
      toggle.addEventListener("change", this._oncontrol.bind(this), false);
      if (toggle.id == "VOICE_COUNT")     strip = "voices.png";
      else if (toggle.id == "LEGATOMODE") strip = "legato.png";
      toggle.strip = skin + strip;
    })
  }

  _oncontrol (e) {
    let key = this.map.indexOf(e.detail.id);
    this._node.setParameterValues({ [key]: { id: key, value: e.detail.value } });
  }
})
