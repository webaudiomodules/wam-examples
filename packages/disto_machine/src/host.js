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
	// IMPORTANT NOTICE :
	// In order to be able to load the plugin in this example host,
	// you must add the plugin to the field webaudiomodules
	// in the package.json. Example :
	// "webaudiomodules": {
	//     "pingpongdelay": "dist", // you should replace dist with the build directory of your plugin
	//     "yourplugin": "dist"
	// }
	const { default: pluginFactory } = await import('./index.js');

	// Init WamEnv
	const { default: apiVersion } = await import("../../api/src/version.js");
	const { default: addFunctionModule } = await import("../../sdk/src/addFunctionModule.js");
	const { default: initializeWamEnv } = await import("../../sdk/src/WamEnv.js");
	await addFunctionModule(audioContext.audioWorklet, initializeWamEnv, apiVersion);
	const { default: initializeWamGroup } = await import("../../sdk/src/WamGroup.js");
	const hostGroupId = 'test-host';
	const hostGroupKey = performance.now().toString();
	await addFunctionModule(audioContext.audioWorklet, initializeWamGroup, hostGroupId, hostGroupKey);

	// Create a new instance of the plugin
	// You can can optionnally give more options such as the initial state of the plugin
	const pluginInstance = await pluginFactory.createInstance(hostGroupId, audioContext, {});

	window.instance = pluginInstance;
	// instance.enable();

	// Connect the audionode to the host
	connectPlugin(pluginInstance.audioNode);

	// Load the GUI if need (ie. if the option noGui was set to true)
	// And calls the method createElement of the Gui module
	const pluginDomNode = await pluginInstance.createGui();

	mountPlugin(pluginDomNode);
 
	player.onplay = () => {
		let state;
		audioContext.resume(); // audio context must be resumed because browser restrictions

		setTimeout(() => {
			console.log("After 2.5s, set lowGain to 0.1...")
			// set param feedback after 5 seconds
			instance.audioNode.setParamValue('lowGain', 0);
			instance.audioNode.setParamValue('midLowGain', 0);
			instance.audioNode.setParamValue('midHighGain', 0);
			instance.audioNode.setParamValue('highGain', 0);
			// store current state
			state = instance.audioNode.getState();
			console.log('instance state', state);
		}, 2500);
		/*
		setTimeout(() => {
			// Just for the example : updates the state of the plugin
			// Audionode and Gui should be updated accordingly
			console.log('timeout setParams out of bounds');
			instance.setParams({ lowGain: 1 });
			try {
				console.log('try to set a param that does not exists in descriptor.json fails with error :');
				instance.setParams({ gain: 9000 });
			} catch (e) {
				console.warn(e.message);
			}
		}, 5000);
		setTimeout(() => {
			// restore state to stored one
			instance.setState(state); // lowGain should go back to its initial value
			console.log('instance state', instance.getState());
		}, 10000);
		*/
	};
})();
