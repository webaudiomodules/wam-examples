const player = document.querySelector('#player');
const mount = document.querySelector('#mount');

// Safari...
const AudioContext = window.AudioContext // Default
	|| window.webkitAudioContext // Safari and old versions of Chrome
	|| false;

const audioContext = new AudioContext();
const mediaElementSource = audioContext.createMediaElementSource(player);

let currentPluginAudioNode;

// Init WamEnv
const { default: apiVersion } = await import("../../../api/src/version.js");
const { default: addFunctionModule } = await import("../../../sdk/src/addFunctionModule.js");
const { default: initializeWamEnv } = await import("../../../sdk/src/WamEnv.js");
await addFunctionModule(audioContext.audioWorklet, initializeWamEnv, apiVersion);
const { default: initializeWamGroup } = await import("../../../sdk/src/WamGroup.js");
const hostGroupId = 'test-host';
const hostGroupKey = performance.now().toString();
await addFunctionModule(audioContext.audioWorklet, initializeWamGroup, hostGroupId, hostGroupKey);

// Very simple function to connect the plugin audionode to the host
const connectPlugin = (audioNode) => {
	if (currentPluginAudioNode) {
		mediaElementSource.disconnect(currentPluginAudioNode);
		currentPluginAudioNode.disconnect(audioContext.destination);
		currentPluginAudioNode = null;
	}
	mediaElementSource.connect(audioNode);
	
	audioNode.connect(audioContext.destination);
	currentPluginAudioNode = audioNode;
};

// Very simple function to append the plugin root dom node to the host
const mountPlugin = (domNode) => {
	mount.innerHTML = '';
	mount.appendChild(domNode);
};

const form = document.querySelector('#form');
const examples = document.querySelectorAll('#examples > li');

Array.from(examples).forEach((example) => {
	example.addEventListener('click', () => {
		const pluginUrl = `/packages/${example.dataset.pluginUrl}/index.js`;
		form.pluginUrl.value = pluginUrl;
	});
});

const setPlugin = async (pluginUrl) => {
	// Load plugin from the url of its json descriptor
	// Pass the option { noGui: true } to not load the GUI by default
	// IMPORTANT NOTICE :
	// In order to be able to load the plugin in this example host,
	// you must add the plugin to the field webaudiomodules
	// in the package.json. Example :
	// "webaudiomodules": {
	//     "pingpongdelay": "dist", // you should replace dist with the build directory of your plugin
	//     "yourplugin": "dist"
	// }
	const { default: WAM } = await import('../../dist/index.js');

	// Create a new instance of the plugin
	// You can can optionnally give more options such as the initial state of the plugin
	const instance = await WAM.createInstance(hostGroupId, audioContext,
		{
			params: { feedback: 0.7 },
		});
	window.instance = instance;
	// instance.enable();

	// Connect the audionode to the host
	connectPlugin(instance.audioNode);

	audioContext.resume();
	player.play();

	// Load the GUI if need (ie. if the option noGui was set to true)
	// And calls the method createElement of the Gui module
	const pluginDomNode = await instance.createGui();

	mountPlugin(pluginDomNode);
};

window.onload = () => {
	setPlugin('../../src/index.js');
};
