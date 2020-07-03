// WAM Knob control
// Jari Kleimola 2018 (jari@webaudiomodules.org)

var WAM = WAM || {}
if (!WAM.Knob) {

WAM.Knob = class WamKnob extends HTMLElement
{
  constructor() {
    super();
    this._ = { value:0, states:1, height:0 };
  }

  connectedCallback() {
    var temp = document.querySelector("#wam-knob-template");
    if (!temp) {
      temp = document.createElement("template");
      temp.id = "wam-knob-template";
      temp.innerHTML = `
        <div style="overflow:hidden; height:0; user-select:none;">
          <img draggable="false" style="pointer-events:none;">
        </div>`
    }
    var node = temp.content.cloneNode(true);
    var div  = node.querySelector("div");
    var img  = node.querySelector("img");
    img.onload = function (e) {
      this._.height = img.clientHeight / this.getAttribute("states");
      div.style.height = this._.height + "px";
      if (this.hasAttribute("pos")) {
        var pos = this.getAttribute("pos").split(",");
        if (pos.length == 2) {
          this.style.position = "absolute";
          this.style.left = pos[0] + "px";
          this.style.top  = pos[1] + "px";
        }
      }
      if (this.hasAttribute("value"))
        this._.value = parseFloat(this.getAttribute("value"));
      this.updateKnob();
    }.bind(this);
    if (this.hasAttribute("strip"))
      img.src = this.getAttribute("strip");
    this._.mouseHandler = this.onmouse.bind(this);
    div.onmousedown = this._.mouseHandler;
    this.appendChild(node);
  }

  static get observedAttributes() {
    return ["strip","states","value"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "strip":
        var img = this.querySelector("img");
        if (img) img.src = newValue;
        break;
      case "states":
        this._.states = newValue|0;
        break;
      case "value":
        this._.value = parseFloat(newValue);
        this.updateKnob();
        break;
    }
  }

  get value ()   { return this._.value; }
  set value (v)  { this._.value = v; this.setAttribute("value", v); }
  set strip (v)  { this.setAttribute("strip", v); }
  set states (v) { this.setAttribute("states", v); }

  onmouse (e) {
    if (e.type == "mousedown") {
      this._.prevy = e.clientY;
      window.addEventListener("mousemove", this._.mouseHandler, false);
      window.addEventListener("mouseup",   this._.mouseHandler, false);
      e.preventDefault();
    }
    else if (e.type == "mousemove") {
      var dy = this._.prevy - e.clientY;
      if (dy != 0) {
        var v = parseFloat((this._.value + dy/100).toFixed(2));
        if (v < 0) v = 0; else if (v > 1) v = 1;
        if (v != this._.value) {
          this.value = v;
          this.fire();
        }
        this._.prevy = e.clientY;
      }
    }
    else {
      window.removeEventListener("mousemove", this._.mouseHandler, false);
      window.removeEventListener("mouseup",   this._.mouseHandler, false);
      this.fire(true);
    }
  }

  fire (finish) {
    var detail = { id:this.id, value:this.value, final:(finish===true) }
    var event  = new CustomEvent("change", { detail:detail });
    this.dispatchEvent(event);
  }

  updateKnob () {
    if (this._.states > 1) {	// image strip
      var img = this.querySelector("img");
      if (img) {
        var index = Math.round(this._.value * (this._.states-1));
        img.style.transform = "translateY(-" + (index * this._.height) + "px)";
      }
    }
  }
}

window.customElements.define("wam-knob", WAM.Knob);
}