import style from './Gui.css';
import template from './Gui.template.html';

export default class PingPongDelayHTMLElement extends HTMLElement {
	constructor(plugin) {
		super();

		this.root = this.attachShadow({ mode: 'open' });

		this.plugin = plugin;
		this.plugin.addEventListener('change', this.updateState);
	}

	updateState = () => {
		const {
			enabled,
			feedback,
			mix,
			time,
		} = this.plugin.state;

		this.shadowRoot.querySelector('#switch1').value = enabled;
		this.shadowRoot.querySelector('#knob1').value = feedback * 100;
		this.shadowRoot.querySelector('#knob2').value = time * 100;
		this.shadowRoot.querySelector('#knob3').value = mix * 100;
	}

	connectedCallback() {
		this.root.innerHTML = `<style>${style}</style>${template}`;

		this.setKnobs();
		this.setSwitchListener();
		this.updateState();
	}

	setKnobs() {
		this.shadowRoot
			.querySelector('#knob1')
			.addEventListener('input', (e) => {
				this.plugin.setState({ feedback: e.target.value / 100 });
			});
		this.shadowRoot
			.querySelector('#knob2')
			.addEventListener('input', (e) => {
				this.plugin.setState({ time: e.target.value / 100 });
			});
		this.shadowRoot
			.querySelector('#knob3')
			.addEventListener('input', (e) => {
				this.plugin.setState({ mix: e.target.value / 100 });
			});
	}

	setSwitchListener() {
		this.shadowRoot
			.querySelector('#switch1')
			.addEventListener('change', () => {
				this.plugin.setState({ enabled: !this.plugin.state.enabled });
			});
	}

	static is() {
		return 'wasabi-pingpongdelay';
	}
}

if (!customElements.get(PingPongDelayHTMLElement.is())) {
	customElements.define(PingPongDelayHTMLElement.is(), PingPongDelayHTMLElement);
}
