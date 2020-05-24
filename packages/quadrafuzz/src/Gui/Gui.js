// This works when youuse a bundler such as rollup
// If you do no wan to use a bundler, then  look at other examples
// that build in pure JS the syles and html template directly
// in the code...
import style from './Gui.css';
import template from './Gui.template.html';

// The GUI is a WebComponent. Not mandatory but useful.
// MANDORY : the GUI should be a DOM node. WebComponents are
// practical as they encapsulate everyhing in a shadow dom
export default class QuadrafuzzHTMLElement extends HTMLElement {
	// plugin = the same that is passed in the DSP part. It's the instance
	// of the class that extends WebAudioPlugin. It's an Observable plugin
	constructor(plugin) {
		super();

		this.root = this.attachShadow({ mode: 'open' });

		// MANDATORY for the GUI to observe the plugin state
		this.plugin = plugin;
	}

	updateStatus = (status) => {
		this.shadowRoot.querySelector('#switch1').value = status;
	}

	handleAnimationFrame = () => {
		const {
			lowGain,
			midLowGain,
			midHighGain,
			highGain
		} = params;
		this.shadowRoot.querySelector('#knob1').value = lowGain ;
		this.shadowRoot.querySelector('#knob2').value = midLowGain;
		this.shadowRoot.querySelector('#knob3').value = midHighGain ;
		this.shadowRoot.querySelector('#knob4').value = highGain ;
		window.requestAnimationFrame(this.handleAnimationFrame);
	}

	// Provided by the WebComponent API, called when the plugin is
	// connected to the DOM
	connectedCallback() {
		this.root.innerHTML = `<style>${style}</style>${template}`;
		this.setResources();
		this.setKnobs();
		this.setSwitchListener();
		//this.updateStatus(this.plugin.state.enabled);
		//this.updateParams(this.plugin.state.params);
	}

	setResources() {
		// Set up the background img & style
		var background = this.root.querySelector("img");
		// MICHEL NOT POSSIBLE YET !
		var url = this.plugin.descriptor.url.href;
		var pluginURL = url.substring(0,url.lastIndexOf("/"));

		console.log("### PLUGIN URL = ##### " + pluginURL);
		background.src = pluginURL + '/assets/background.png';
		//background.src = bgImage;
		background.style = 'border-radius : 5px;'
		// Setting up the knobs imgs, those are loaded from the assets
		this.root.querySelectorAll(".knob").forEach((knob) => {
			knob.querySelector("webaudio-knob").setAttribute('src', pluginURL + '/assets/MiniMoog_Main.png');
		});
		// Setting up the switches imgs, those are loaded from the assets
		this.root.querySelector("webaudio-switch").setAttribute('src', pluginURL + '/assets/switch_1.png');
	}

	setKnobs() {
		this.shadowRoot
			.querySelector('#knob1')
			.addEventListener('input', (e) => {
				this.plugin.setParams({ lowGain: e.target.value});
			});
		this.shadowRoot
			.querySelector('#knob2')
			.addEventListener('input', (e) => {
				this.plugin.setParams({ midLowGain: e.target.value});
			});
			this.shadowRoot
			.querySelector('#knob3')
			.addEventListener('input', (e) => {
				this.plugin.setParams({ midHighGain: e.target.value });
			});
			this.shadowRoot
			.querySelector('#knob4')
			.addEventListener('input', (e) => {
				this.plugin.setParams({ highGain: e.target.value });
			});
	}

	setSwitchListener() {
		console.log("Quadrafuzz : set switch listener");
		this.shadowRoot
			.querySelector('#switch1')
			.addEventListener('change', () => {
				console.log("Quadrafuzz : in switch listener");
				this.plugin.setState({ enabled: !this.plugin.state.enabled });
			});
	}

	// name of the custom HTML element associated
	// with the plugin. Will appear in the DOM if
	// the plugin is visible
	static is() {
		return 'wasabi-quadrafuzz';
	}
}

if (!customElements.get(QuadrafuzzHTMLElement.is())) {
	customElements.define(QuadrafuzzHTMLElement.is(), QuadrafuzzHTMLElement);
}
