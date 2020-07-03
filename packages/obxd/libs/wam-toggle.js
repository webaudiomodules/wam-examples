// WAM Toggle control
// Jari Kleimola 2018 (jari@webaudiomodules.org)

var WAM = WAM || {}
if (!WAM.Toggle) {

WAM.Toggle = class WamToggle extends HTMLElement
{
  constructor() {
    super();
    this._ = { value:0, states:2 };
  }

  connectedCallback() {
    var temp = document.querySelector("#wam-toggle-template");
    if (!temp) {
      temp = document.createElement("template");
      temp.id = "wam-toggle-template";
      temp.innerHTML = `
        <div style="overflow:hidden; height:0; user-select:none;">
          <img draggable="false" style="pointer-events:none;">
        </div>`
    }
    var node = temp.content.cloneNode(true);
    var div  = node.querySelector("div");
    var img  = node.querySelector("img");
    img.onload = function (e) {
      this._.height = img.clientHeight / this._.states;
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
      this.updateToggle();
    }.bind(this);
    if (this.hasAttribute("strip"))
      img.src = this.getAttribute("strip");
    div.onclick = this.onclick.bind(this);
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
        if (this._.value > 1.1) this._.value = 0;
        else if (this._.value > 1) this._.value = 1;
        this.updateToggle();
        break;
    }
  }

  get value ()   { return this._.value; }
  get states ()  { return this._.states; }
  set value (v)  { this.setAttribute("value", v); }
  set strip (v)  { this.setAttribute("strip", v); }
  set states (v) { this.setAttribute("states", v); }

  onclick (e) {
    var v = this._.value + 1 / (this._.states-1);
    this.value = v;
    this.fire(true);
    if (this.classList.contains("oneshot")) setTimeout( function () {
      this.value = 0;
    }.bind(this), 200);
  }

  fire (finish) {
    var detail = { id:this.id, value:this.value, final:(finish===true) }
    var event  = new CustomEvent("change", { detail:detail });
    this.dispatchEvent(event);
  }

  updateToggle () {
    var img = this.querySelector("img");
    if (img) {
      var index = Math.round(this._.value * (this._.states-1));
      img.style.transform = "translateY(-" + (index * this._.height) + "px)";
    }
  }
}

window.customElements.define("wam-toggle", WAM.Toggle);
}
