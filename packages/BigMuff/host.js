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
	// Init WamEnv
	const { default: apiVersion } = await import("../api/src/version.js");
	const { default: addFunctionModule } = await import("../sdk/src/addFunctionModule.js");
	const { default: initializeWamEnv } = await import("../sdk/src/WamEnv.js");
	await addFunctionModule(audioContext.audioWorklet, initializeWamEnv, apiVersion);
	const { default: initializeWamGroup } = await import("../sdk/src/WamGroup.js");
	const hostGroupId = 'test-host';
	const hostGroupKey = performance.now().toString();
	await addFunctionModule(audioContext.audioWorklet, initializeWamGroup, hostGroupId, hostGroupKey);

	const { default: WAM } = await import('./index.js');
	// Create a new instance of the plugin
	// You can can optionnally give more options such as the initial state of the plugin
	const instance = await WAM.createInstance(hostGroupId, audioContext);

	window.instance = instance;

	// Connect the audionode to the host
	connectPlugin(instance.audioNode);

	// Load the GUI if need (ie. if the option noGui was set to true)
	// And calls the method createElement of the Gui module
	const pluginDomNode = await instance.createGui();

	mountPlugin(pluginDomNode);

	player.onplay = () => {
		audioContext.resume(); // audio context must be resumed because browser restrictions
	};
})();
