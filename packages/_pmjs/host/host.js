/** @type {HTMLAudioElement} */
const player = document.querySelector('#player');
/** @type {HTMLDivElement} */
const mount = document.querySelector('#mount');
// Safari...
/** @type {typeof AudioContext} */
const AudioContext = window.AudioContext // Default
	|| window.webkitAudioContext; // Safari and old versions of Chrome;

const audioContext = new AudioContext();
const mediaElementSource = audioContext.createMediaElementSource(player);

/**
 * Very simple function to connect the plugin audionode to the host
 * @param {AudioNode} audioNode
 */
const connectPlugin = (audioNode) => {
	mediaElementSource.connect(audioNode);
	audioNode.connect(audioContext.destination);
};

/**
 * Very simple function to append the plugin root dom node to the host
 * @param {Element} domNode
 */
const mountPlugin = (domNode) => {
	mount.innerHTML = '';
	mount.appendChild(domNode);
};

(async () => {
	// Init WamEnv
	const { default: apiVersion } = await import("../../api/src/version.js");
	const { default: addFunctionModule } = await import("../../sdk/src/addFunctionModule.js");
	const { default: initializeWamEnv } = await import("../../sdk/src/WamEnv.js");
	await addFunctionModule(audioContext.audioWorklet, initializeWamEnv, apiVersion);
	const { default: initializeWamGroup } = await import("../../sdk/src/WamGroup.js");
	const hostGroupId = 'test-host';
	const hostGroupKey = performance.now().toString();
	await addFunctionModule(audioContext.audioWorklet, initializeWamGroup, hostGroupId, hostGroupKey);

	// Import WAM
	const { default: PluginFactory } = await import('../src/index.js');

	// Create a new instance of the plugin
	// You can can optionnally give more options such as the initial state of the plugin
	const pluginInstance = await PluginFactory.createInstance(hostGroupId, audioContext, {});

	window.instance = pluginInstance;

	// Connect the audionode to the host
	connectPlugin(pluginInstance.audioNode);

	// Load the GUI if need (ie. if the option noGui was set to true)
	// And calls the method createElement of the Gui module
	const pluginDomNode = await pluginInstance.createGui();

	mountPlugin(pluginDomNode);
 
	player.onplay = () => {
		audioContext.resume(); // audio context must be resumed because browser restrictions
	};
})();
