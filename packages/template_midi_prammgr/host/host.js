/** @type {HTMLDivElement} */
const mount = document.querySelector('#mount');
// Safari...
/** @type {typeof AudioContext} */
const AudioContext = window.AudioContext // Default
	|| window.webkitAudioContext; // Safari and old versions of Chrome;

const audioContext = new AudioContext();
window.audioContext = audioContext;

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
	const { default: KeyboardPluginFactory } = await import('../../simpleMidiKeyboard/index.js');
	const keyboardPluginInstance = await KeyboardPluginFactory.createInstance(hostGroupId, audioContext);

	const { default: PluginFactory } = await import('../src/index.js');
	const pluginInstance = await PluginFactory.createInstance(hostGroupId, audioContext);

	const { default: SynthPluginFactory } = await import('../../tinySynth/src/index.js');
	const synthPluginInstance = await SynthPluginFactory.createInstance(hostGroupId, audioContext);

	window.keyboard = keyboardPluginInstance;
	window.instance = pluginInstance;
	window.synth = synthPluginInstance;

	keyboardPluginInstance.audioNode.connectEvents(pluginInstance.audioNode.instanceId);
	// keyboardPluginInstance.audioNode.connect(pluginInstance.audioNode);
	pluginInstance.audioNode.connectEvents(synthPluginInstance.audioNode.instanceId);
	// pluginInstance.audioNode.connect(synthPluginInstance.audioNode);
	synthPluginInstance.audioNode.connect(audioContext.destination);

	const keyboardDomNode = await keyboardPluginInstance.createGui();
	const pluginDomNode = await pluginInstance.createGui();
	const synthPluginDomNode = await synthPluginInstance.createGui();

	mount.appendChild(keyboardDomNode);
	mount.appendChild(pluginDomNode);
	mount.appendChild(synthPluginDomNode);

	mount.onclick = () => audioContext.resume(); // audio context must be resumed because browser restrictions
})();
