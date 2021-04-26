import './main.css';

const player = document.querySelector('#player');
const mount = document.querySelector('#mount');

// Safari...
const AudioContext =
	window.AudioContext || // Default
	window.webkitAudioContext || // Safari and old versions of Chrome
	false;

const audioContext = new AudioContext();
// If looking for low latency (i.e. guitar plugged into live input)
// const audioContext = new AudioContext({ latencyHint: 0.00001});
const mediaElementSource = audioContext.createMediaElementSource(player);

let currentPluginAudioNode, liveInputGainNode;

// Very simple function to connect the plugin audionode to the host
const connectPlugin = (audioNode) => {
	if (currentPluginAudioNode) {
		keyboardPlugin.audioNode.disconnectEvents(currentPluginAudioNode);
		keyboardPlugin.audioNode.disconnect(currentPluginAudioNode);
		mediaElementSource.disconnect(currentPluginAudioNode);
		currentPluginAudioNode.disconnect(audioContext.destination);
		currentPluginAudioNode = null;
	}

	liveInputGainNode.connect(audioNode);
	console.log('connected live input node to plugin node');

	keyboardPlugin.audioNode.connect(audioNode);
	keyboardPlugin.audioNode.connectEvents(audioNode);
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

let state;

const setPlugin = async (pluginUrl) => {
	console.log("setPlugin start")
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
	const { default: WAM } = await import(pluginUrl);

	// Create a new instance of the plugin
	// You can can optionnally give more options such as the initial state of the plugin
	const instance = await WAM.createInstance(audioContext, {
		params: {
			feedback: 0.7,
		},
	});
	window.instance = instance;
	// instance.enable();

	// Connect the audionode to the host
	connectPlugin(instance.audioNode);

	audioContext.resume();
	//player.play();

	console.log("setPlugin 4")

	// Load the GUI if need (ie. if the option noGui was set to true)
	// And calls the method createElement of the Gui module
	const pluginDomNode = await instance.createGui();

	// Show plugin info
	showPluginInfo(instance, pluginDomNode);

	populateParamSelector(instance);

	mountPlugin(pluginDomNode);

	const saveStateButton = document.querySelector('#saveStateButton');
	const restoreStateButton = document.querySelector('#restoreStateButton');

	saveStateButton.disabled = false; // enable save state button
	restoreStateButton.disabled = true; // disable restore state button

	saveStateButton.onclick = async () => {
		console.log('Saving state...');
		state = await instance.audioNode.getState();
		restoreStateButton.disabled = false;
	};

	restoreStateButton.onclick = () => {
		console.log('Restoring state...');
		instance.audioNode.setState(state);
	};
};

form.addEventListener('submit', (event) => {
	event.preventDefault();
	const pluginUrl = form.pluginUrl.value;
	setPlugin(pluginUrl);
});

// ----- DISPLAY PLUGIN INFO -----
async function showPluginInfo(instance, gui) {
	let pluginInfoDiv = document.querySelector('#pluginInfoDiv');
	let paramInfos = await instance.audioNode.getParameterInfo();
	let guiWidth = undefined,
		guiHeight = undefined;
	try {
		guiWidth = gui.properties.dataWidth.value;
		guiHeight = gui.properties.dataHeight.value;
	} catch (err) {
		guiWidth = 'undefined, (you should define get properties in Gui.js)';
		guiHeight = 'undefined, (you should define get properties in Gui.js)';
	}

	let parameterList = '';

	for (const [key, value] of Object.entries(paramInfos)) {
		parameterList += `<li><b>${key}</b> : ${JSON.stringify(value)}</li>`;
	}

	pluginInfoDiv.innerHTML = `
	<li><b>instance.descriptor :</b> ${JSON.stringify(instance.descriptor)}</li>
	<li><b>gui.properties.dataWidth.value</b> : ${guiWidth}</li>
	<li><b>gui.properties.dataHeight.value</b> : ${guiHeight}</li>
	<li><b>instance.audioNode.getParameterInfo() :</b>
		<ul>
		   ${parameterList}
		</ul>
	</li>
	`;
}
// ------- LIVE INPUT ------
// live input
var liveInputActivated = false;
let inputStreamNode;

function convertToMono(input) {
	var splitter = audioContext.createChannelSplitter(2);
	var merger = audioContext.createChannelMerger(2);

	input.connect(splitter);
	splitter.connect(merger, 0, 0);
	splitter.connect(merger, 0, 1);
	splitter.connect(merger, 1, 0);
	splitter.connect(merger, 1, 1);
	return merger;
}

var defaultConstraints = {
	audio: {
		echoCancellation: false,
		mozNoiseSuppression: false,
		mozAutoGainControl: false,
	},
};
// User input part
function setLiveInputToNewStream(stream) {
	window.stream = stream;
	inputStreamNode = audioContext.createMediaStreamSource(stream);
	let inputinputStreamNodeMono = convertToMono(inputStreamNode);

	liveInputGainNode = audioContext.createGain();

	liveInputGainNode.gain.value = liveInputActivated ? 1 : 0;
	console.log(
		'liveInputGainNode.gain.value = ' + liveInputGainNode.gain.value
	);
	inputinputStreamNodeMono.connect(liveInputGainNode);

	console.log('Live Input node created...');
}

// initial live input setup.
navigator.mediaDevices.getUserMedia(defaultConstraints).then((stream) => {
	setLiveInputToNewStream(stream);
});

navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

function handleDeviceChange(event) {
	console.log('### INPUT DEVICE LIST CHANGED');
	// let's rebuild the menu
	rebuildAudioDeviceMenu();
}

let liveInputButton = document.querySelector('#toggleLiveInput');
liveInputButton.onclick = toggleLiveInput;

function toggleLiveInput(event) {
	audioContext.resume();

	var button = document.querySelector('#toggleLiveInput');

	if (!liveInputActivated) {
		button.innerHTML =
			"Live input: <span style='color:green;'>ACTIVATED</span>, click to toggle on/off!";
		liveInputGainNode.gain.setValueAtTime(1, audioContext.currentTime);
	} else {
		button.innerHTML =
			"Live input: <span style='color:red;'>NOT ACTIVATED</span>, click to toggle on/off!";
		liveInputGainNode.gain.setValueAtTime(0, audioContext.currentTime);
	}
	liveInputActivated = !liveInputActivated;
}

// -------- select audio input device ---------
let audioInput = document.querySelector('#selectAudioInput');

function gotDevices(deviceInfos) {
	// lets rebuild the menu
	audioInput.innerHTML = '';

	for (let i = 0; i !== deviceInfos.length; ++i) {
		const deviceInfo = deviceInfos[i];
		if (deviceInfo.kind === 'audioinput') {
			const option = document.createElement('option');
			option.value = deviceInfo.deviceId;
			option.text =
				deviceInfo.label || `microphone ${audioInput.length + 1}`;
			audioInput.appendChild(option);
			console.log('adding ' + option.text);
		} else {
			console.log('Some other kind of source/device: ', deviceInfo);
		}
	}
}

buildAudioDeviceMenu();

function rebuildAudioDeviceMenu() {
	console.log('REBUILDING INPUT DEVICE MENU');
	buildAudioDeviceMenu();
	console.log('RE OPENING INPUT LIVE STREAM WITH DEFAULT DEVICE');
	// initial live input setup.
	let defaultConstraints = {
		audio: {
			echoCancellation: false,
			mozNoiseSuppression: false,
			mozAutoGainControl: false,
		},
	};
	navigator.mediaDevices.getUserMedia(defaultConstraints).then((stream) => {
		setLiveInputToNewStream(stream);
	});
	// rebuild graph with plugin
	console.log('REBUILDING GRAPH');
	const pluginUrl = form.pluginUrl.value;
	setPlugin(pluginUrl);
}

function buildAudioDeviceMenu() {
	console.log('BUILDING DEVICE MENU');
	navigator.mediaDevices
		.enumerateDevices()
		.then(gotDevices)
		.catch((error) => {
			console.log(
				'navigator.MediaDevices.getUserMedia error: ',
				error.message,
				error.name
			);
		});

	audioInput.onchange = (e) => {
		let index = e.target.selectedIndex;
		let id = e.target[index].value;
		let label = e.target[index].text;

		console.dir('Audio input selected : ' + label + ' id = ' + id);
		changeStream(id);
	};

	function changeStream(id) {
		var constraints = {
			audio: {
				echoCancellation: false,
				mozNoiseSuppression: false,
				mozAutoGainControl: false,
				deviceId: id
					? {
							exact: id,
					  }
					: undefined,
			},
		};
		navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
			setLiveInputToNewStream(stream);
			const pluginUrl = form.pluginUrl.value;
			setPlugin(pluginUrl);
		});
	}
}

// -------- select MIDI input device ---------
/** @type {HTMLSelectElement} */const midiInputSelector = document.querySelector('#selectMidiInput');

if (navigator.requestMIDIAccess) {
	navigator.requestMIDIAccess().then((midiAccess) => {
		let currentInput;
		const handleMidiMessage = (e) => {
			if (!instance) return;
			instance.audioNode.scheduleEvents({ type: 'midi', time: instance.audioContext.currentTime, data: { bytes: e.data } });
		}
		const handleStateChange = () => {
			const { inputs } = midiAccess;
			if (midiInputSelector.options.length === inputs.size + 1) return;
			if (currentInput) currentInput.removeEventListener('midimessage', handleMidiMessage);
			midiInputSelector.innerHTML = '<option value="-1" disabled selected>Select...</option>';
			inputs.forEach((midiInput) => {
				const { name, id } = midiInput;
				const option = new Option(name, id);
				midiInputSelector.add(option);
			});
		};
		handleStateChange();
		midiAccess.addEventListener('statechange', handleStateChange);
		midiInputSelector.addEventListener('input', (e) => {
			if (currentInput) currentInput.removeEventListener('midimessage', handleMidiMessage);
			const id = e.target.value;
			currentInput = midiAccess.inputs.get(id);
			currentInput.addEventListener('midimessage', handleMidiMessage);
		})
	});
}

// -------- generate MIDI note button ---------
/** @type {HTMLButtonElement} */ const sendMIDINoteButton = document.querySelector('#sendMIDINoteButton');
sendMIDINoteButton.onclick = async (e) => {
	instance.audioNode.scheduleEvents({ type: 'midi', time: instance.audioContext.currentTime, data: { bytes: new Uint8Array([0x90, 74, 100]) } });
	instance.audioNode.scheduleEvents({ type: 'midi', time: instance.audioContext.currentTime + 0.25, data: { bytes: new Uint8Array([0x80, 74, 100]) } });
}

/** @type {HTMLSelectElement} */ const pluginParamSelector = document.querySelector('#pluginParamSelector');
/** @type {HTMLInputElement} */ const pluginAutomationLengthInput = document.querySelector('#pluginAutomationLength');
/** @type {HTMLInputElement} */ const pluginAutomationApplyButton = document.querySelector('#pluginAutomationApply');
/** @type {HTMLDivElement} */ const bpfContainer = document.querySelector('#pluginAutomationEditor');

pluginParamSelector.addEventListener('input', async (e) => {
	if (!instance) return;
	const paramId = e.target.value;
	if (paramId === '-1') return;
	if (Array.from(bpfContainer.querySelectorAll('.pluginAutomationParamId')).find(span => span.textContent === paramId)) return;
	const div = document.createElement('div');
	div.classList.add('pluginAutomation');
	const span = document.createElement('span');
	span.textContent = paramId;
	span.classList.add('pluginAutomationParamId');
	div.appendChild(span);
	const bpf = document.createElement('webaudiomodules-host-bpf');
	const info = await instance.audioNode.getParameterInfo(paramId);
	const { minValue, maxValue, defaultValue } = info[paramId];
	bpf.setAttribute('min', minValue);
	bpf.setAttribute('max', maxValue);
	bpf.setAttribute('default', defaultValue);
	div.appendChild(bpf);
	bpfContainer.appendChild(div);
	pluginParamSelector.selectedIndex = 0;
});
pluginAutomationLengthInput.addEventListener('input', (e) => {
	const domain = +e.target.value;
	if (!domain) return;
	bpfContainer.querySelectorAll('webaudiomodules-host-bpf').forEach(/** @param {import("./bpf").default} bpf */(bpf) => {
		bpf.setAttribute("domain", domain);
	});
});
pluginAutomationApplyButton.addEventListener('click', () => {
	if (!instance) return;
	bpfContainer.querySelectorAll('.pluginAutomation').forEach(/** @param {HTMLDivElement} div */(div) => {
		const paramId = div.querySelector('.pluginAutomationParamId').textContent;
		/** @type {import("./bpf").default} */ const bpf = div.querySelector('webaudiomodules-host-bpf');
		bpf.apply(instance.audioNode, paramId);
	});
});

/**
 * @param {import('sdk/src/api/types').WebAudioModule} instance
 */
async function populateParamSelector(instance) {
	bpfContainer.innerHTML = '';
	pluginParamSelector.innerHTML = '<option value="-1" disabled selected>Add Automation...</option>';
	const wamNode = instance.audioNode;
	const info = await wamNode.getParameterInfo();
	for (const paramId in info) {
		const { minValue, maxValue } = info[paramId];
		const option = new Option(`${paramId}: ${minValue} - ${maxValue}`, paramId);
		pluginParamSelector.add(option);
	}
	pluginParamSelector.selectedIndex = 0;
}

let keyboardPlugin;
// MIDI Keyboard
(async () => {
	const url = '/packages/midiKeyboard/index.js';
	const { default: Wam } = await import(url);
	keyboardPlugin = await Wam.createInstance(audioContext);
	const gui = await keyboardPlugin.createGui();
	const keyboardContainer = document.getElementById('midiKeyboard');
	keyboardContainer.appendChild(gui);
})();
