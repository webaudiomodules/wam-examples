import style from './Gui.css';
import template from './Gui.template.html';

/* eslint-disable no-underscore-dangle */
export default class PingPongDelayGui extends HTMLElement {
	constructor(plug) {
		super();

		// this.root = this.attachShadow({ mode: 'open' });

		// this.params = { dataPlug: this.getAttribute('dataPlug') };
		this._plug = plug;
		//this._plug.gui = this;
		this.root = this.attachShadow({ mode: 'open' });
		this.isOn = false;
		this.state = {};
	}

	set plug(_plug) {
		this._plug = _plug;
	}

	//set dataId(_data) { this.params.dataId = _data };

	connectedCallback() {
		console.log(style);
		this.root.innerHTML = `<style>${style}</style>
${template}`;

		// listeners
		this.setKnobs();
		this.setSwitchListener();
	}

	get properties() {
		this.boundingRect = {
			dataWidth: {
				type: Number,
				value: 120,
			},
			dataHeight: {
				type: Number,
				value: 180,
			},
		};
		return this.boundingRect;
	}

	static get observedAttributes() {
		return ['state', 'plug'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		console.log('params', this.params);

		console.log(`Custom element ${this.is} attributes changed.`);
		this.state = JSON.parse(this.getAttribute('state'));
		console.log(this.state);
		if (this.state.status == 'enable') {
			this.shadowRoot.querySelector('#switch1').value = 1;
			this.isOn = true;
		} else {
			this.shadowRoot.querySelector('#switch1').value = 0;
			this.isOn = false;
		}
		this.knobs = this.shadowRoot.querySelectorAll('.knob');
		this.labels = this.shadowRoot.querySelectorAll('.knob-label');

		for (var i = 0; i < this.knobs.length; i++) {
			this.knobs[i].value =
				this.state[
					this.labels[i].innerHTML.toLowerCase().replace(/ /g, '')
				] * 100;
		}
		//console.log(this.knobs);
	}

	setKnobs() {
		// console.log('setknobs');
		this.shadowRoot
			.querySelector('#knob1')
			.addEventListener('input', e =>
				this._plug.setParam('feedback', e.target.value / 100)
			);
		this.shadowRoot
			.querySelector('#knob2')
			.addEventListener('input', e =>
				this._plug.setParam('time', e.target.value / 100)
			);
		this.shadowRoot
			.querySelector('#knob3')
			.addEventListener('input', e =>
				this._plug.setParam('mix', e.target.value / 100)
			);
	}

	setSwitchListener() {
		// console.log("setswitch");
		this.shadowRoot
			.querySelector('#switch1')
			.addEventListener('change', e => {
				if (this.isOn) this.bypass();
				else this.reactivate();
				this.isOn = !this.isOn;
			});
	}

	bypass() {
		this._plug.setParam('status', 'disable');
	}

	reactivate() {
		this._plug.setParam('status', 'enable');
	}

	static is() {
		return 'wasabi-pingpongdelay';
	}
}

if (!customElements.get(PingPongDelayGui.is())) {
	customElements.define(PingPongDelayGui.is(), PingPongDelayGui);
}
