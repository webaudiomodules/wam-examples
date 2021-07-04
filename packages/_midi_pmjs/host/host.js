/** @type {HTMLDivElement} */
const mount = document.querySelector('#mount');
// Safari...
/** @type {typeof AudioContext} */
const AudioContext = window.AudioContext // Default
	|| window.webkitAudioContext; // Safari and old versions of Chrome;

const audioContext = new AudioContext();
window.audioContext = audioContext;

(async () => {
	const { default: KeyboardPluginFactory } = await import('../../simpleMidiKeyboard/index.js');
	const keyboardPluginInstance = await KeyboardPluginFactory.createInstance(audioContext);

	const { default: PluginFactory } = await import('../src/index.js');
	const pluginInstance = await PluginFactory.createInstance(audioContext);

	const { default: SynthPluginFactory } = await import('../../tinySynth/src/index.js');
	const synthPluginInstance = await SynthPluginFactory.createInstance(audioContext);

	window.keyboard = keyboardPluginInstance;
	window.instance = pluginInstance;
	window.synth = synthPluginInstance;

	keyboardPluginInstance.audioNode.connectEvents(pluginInstance.audioNode);
	// keyboardPluginInstance.audioNode.connect(pluginInstance.audioNode);
	pluginInstance.audioNode.connectEvents(synthPluginInstance.audioNode);
	// pluginInstance.audioNode.connect(synthPluginInstance.audioNode);
	synthPluginInstance.audioNode.connect(audioContext.destination);

	const keyboardDomNode = await keyboardPluginInstance.createGui();
	const pluginDomNode = await pluginInstance.createGui();
	const synthPluginDomNode = await synthPluginInstance.createGui();

	mount.appendChild(keyboardDomNode);
	mount.appendChild(pluginDomNode);
	mount.appendChild(synthPluginDomNode);

	mount.onclick = audioContext.resume(); // audio context must be resumed because browser restrictions
})();
