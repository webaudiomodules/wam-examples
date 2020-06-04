// Load the sdk with an es import (script type="module" necessary)
import { Loader } from '../../sdk/esm/index.js';

const player = document.querySelector('#player');
const mount = document.querySelector('#mount');

// Safari...
const AudioContext = window.AudioContext // Default
	|| window.webkitAudioContext // Safari and old versions of Chrome
	|| false;

const audioContext = new AudioContext();
const mediaElementSource = audioContext.createMediaElementSource(player);

// Very simple function to connect the plugin audionode to the host
const connectPlugin = (audioNode) => {
	mediaElementSource.connect(audioNode);
	audioNode.connect(audioContext.destination);
};

// Very simple function to append the plugin root dom node to the host
const mountPlugin = (domNode) => {
	mount.innerHtml = '';
	mount.appendChild(domNode);
};

(async () => {
	// Load plugin from the url of its json descriptor
	// Pass the option { noGui: true } to not load the GUI by default
	const faustPluginFactory = await Loader.loadPluginFromUrl('../plugin/descriptor.json'/*, { noGui: true }*/);

	// Create a new instance of the plugin
	// You can can optionnally give more options such as the initial state of the plugin
    const instance = await faustPluginFactory.createInstance(audioContext,{});
    
	window.instance = instance;

	// Connect the audionode to the host
	connectPlugin(instance.audioNode);

	// Load the GUI if need (ie. if the option noGui was set to true)
	// And calls the method createElement of the Gui module
	const pluginDomNode = await instance.createGui();

	mountPlugin(pluginDomNode);

	player.onplay = () => {
		let state;
		audioContext.resume(); // audio context must be resumed because browser restrictions
	};
})();
