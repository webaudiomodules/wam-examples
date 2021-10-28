/* eslint-disable no-console */
import './main.css';
/**
 * @typedef {import('../../api').WebAudioModule} WebAudioModule
 * @typedef {import('../../api').WamNode} WamNode
 */

/** @type {HTMLAudioElement} */
const player = document.querySelector('#player');
/** @type {HTMLDivElement} */
const mount = document.querySelector('#mount');

// webkitAudioContext for Safari and old versions of Chrome
/** @type {typeof AudioContext} */
const AudioCtx = window.AudioContext || window.webkitAudioContext;

const audioContext = new AudioCtx();
// If looking for low latency (i.e. guitar plugged into live input)
// const audioContext = new AudioContext({ latencyHint: 0.00001});

const mediaElementSource = audioContext.createMediaElementSource(player);

/** @type {WebAudioModule} */
// let keyboardPlugin;

/** @type {WamNode} */
let keyboardPluginAudioNode;

/** @type {Element} */
let currentKeyboardPluginDomNode;

/** @type {WamNode} */
let currentPluginAudioNode;

/** @type {Element} */
let currentPluginDomNode;

/** @type {GainNode} */
let liveInputGainNode;

/**
 * Very simple function to connect the plugin audionode to the host
 * @param {WamNode} audioNode
 */
const connectPlugin = (audioNode) => {
	const handleInfoEvent = (i) => {
		const { data } = i.detail;
		if (data.instanceId === currentPluginAudioNode.instanceId) {
			populateParamSelector(currentPluginAudioNode);
			showPluginInfo(currentPluginAudioNode.module, currentPluginDomNode);
		}
	};
	if (currentPluginAudioNode) {
		liveInputGainNode.disconnect();
		if (keyboardPluginAudioNode) {
			keyboardPluginAudioNode.disconnectEvents(currentPluginAudioNode);
			if (currentPluginAudioNode.numberOfInputs) keyboardPluginAudioNode.disconnect(currentPluginAudioNode);
		}
		if (currentPluginAudioNode.numberOfInputs) mediaElementSource.disconnect(currentPluginAudioNode);
		currentPluginAudioNode.disconnect(audioContext.destination);
		currentPluginAudioNode.removeEventListener('wam-info', handleInfoEvent);
		currentPluginAudioNode.destroy();
		if (currentPluginDomNode) {
			currentPluginAudioNode.module.destroyGui(currentPluginDomNode);
			mount.innerHTML = '';
			currentPluginDomNode = null;
		}
		currentPluginAudioNode = null;
	}

	if (audioNode.numberOfInputs) liveInputGainNode.connect(audioNode);
	console.log('connected live input node to plugin node');

	if (keyboardPluginAudioNode) {
		if (audioNode.numberOfInputs) keyboardPluginAudioNode.connect(audioNode);
		keyboardPluginAudioNode.connectEvents(audioNode);
	}
	if (audioNode.numberOfInputs) mediaElementSource.connect(audioNode);
	audioNode.connect(audioContext.destination);
	currentPluginAudioNode = audioNode;
	currentPluginAudioNode.addEventListener('wam-info', handleInfoEvent);
};

/**
 * Very simple function to append the plugin root dom node to the host
 * @param {HTMLElement} domNode
 */
const mountPlugin = (domNode) => {
	mount.innerHTML = '';
	mount.appendChild(domNode);
};

/** @type {HTMLFormElement} */
const form = document.querySelector('#form');

/** @type {NodeListOf<HTMLLIElement>} */
const examples = document.querySelectorAll('#examples > li');

Array.from(examples).forEach((example) => {
	example.addEventListener('click', () => {
		const pluginUrl = `/packages/${example.dataset.pluginUrl}/index.js`;
		form.pluginUrl.value = pluginUrl;
	});
});

const keyboardContainer = document.getElementById('midiKeyboard');
// MIDI Keyboard
const setMidiPlugin = async (pluginUrl) => {
	const { default: Wam } = await import(pluginUrl);
	/** @type {WebAudioModule} */
	const keyboardPlugin = await Wam.createInstance(audioContext);
	if (keyboardPluginAudioNode) {
		if (currentPluginAudioNode) {
			keyboardPluginAudioNode.disconnectEvents(currentPluginAudioNode);
			if (currentPluginAudioNode.numberOfInputs) keyboardPluginAudioNode.disconnect(currentPluginAudioNode);
		}
		keyboardPluginAudioNode.destroy();
		if (currentKeyboardPluginDomNode) {
			keyboardPluginAudioNode.module.destroyGui(currentKeyboardPluginDomNode);
		}
		keyboardPluginAudioNode = null;
	}
	keyboardPluginAudioNode = keyboardPlugin.audioNode;
	currentKeyboardPluginDomNode = await keyboardPlugin.createGui();
	keyboardContainer.innerHTML = '';
	keyboardContainer.appendChild(currentKeyboardPluginDomNode);
	if (keyboardPluginAudioNode && currentPluginAudioNode) {
		if (currentPluginAudioNode.numberOfInputs) keyboardPluginAudioNode.connect(currentPluginAudioNode);
		keyboardPluginAudioNode.connectEvents(currentPluginAudioNode);
	}
};

/** @type {NodeListOf<HTMLLIElement>} */
const midiEmitters = document.querySelectorAll('#midi-emitters > li');

Array.from(midiEmitters).forEach((midiEmitter) => {
	midiEmitter.addEventListener('click', () => {
		const pluginUrl = `/packages/${midiEmitter.dataset.pluginUrl}/index.js`;
		setMidiPlugin(pluginUrl);
	});
});

/**
 * Display plugin info
 * @param {WebAudioModule} instance
 * @param {HTMLElement} gui
 */
const showPluginInfo = async (instance, gui) => {
	/** @type {HTMLDivElement} */
	const pluginInfoDiv = document.querySelector('#pluginInfoDiv');
	const paramInfos = await instance.audioNode.getParameterInfo();
	let guiWidth;
	let guiHeight;
	try {
		guiWidth = gui.properties.dataWidth.value;
		guiHeight = gui.properties.dataHeight.value;
	} catch (err) {
		guiWidth = 'undefined, (you should define get properties in Gui.js)';
		guiHeight = 'undefined, (you should define get properties in Gui.js)';
	}

	let parameterList = '';

	Object.entries(paramInfos).forEach(([key, value]) => {
		parameterList += `<li><b>${key}</b> : ${JSON.stringify(value)}</li>`;
	});

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
};

/** @type {HTMLSelectElement} */ const pluginParamSelector = document.querySelector('#pluginParamSelector');
/** @type {HTMLInputElement} */ const pluginAutomationLengthInput = document.querySelector('#pluginAutomationLength');
/** @type {HTMLInputElement} */ const pluginAutomationApplyButton = document.querySelector('#pluginAutomationApply');
/** @type {HTMLDivElement} */ const bpfContainer = document.querySelector('#pluginAutomationEditor');

pluginParamSelector.addEventListener('input', async (e) => {
	if (!currentPluginAudioNode) return;
	const paramId = e.target.value;
	if (paramId === '-1') return;
	if (Array.from(bpfContainer.querySelectorAll('.pluginAutomationParamId')).find(/** @param {HTMLSpanElement} span */(span) => span.textContent === paramId)) return;
	const div = document.createElement('div');
	div.classList.add('pluginAutomation');
	const span = document.createElement('span');
	span.classList.add('pluginAutomationParamId');
	span.textContent = paramId;
	div.appendChild(span);
	const bpf = document.createElement('webaudiomodules-host-bpf');
	const info = await currentPluginAudioNode.getParameterInfo(paramId);
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
		bpf.setAttribute('domain', domain);
	});
});
pluginAutomationApplyButton.addEventListener('click', () => {
	if (!currentPluginAudioNode) return;
	bpfContainer.querySelectorAll('.pluginAutomation').forEach(/** @param {HTMLDivElement} div */(div) => {
		const paramId = div.querySelector('.pluginAutomationParamId').textContent;
		/** @type {import("./bpf").default} */ const bpf = div.querySelector('webaudiomodules-host-bpf');
		bpf.apply(currentPluginAudioNode, paramId);
	});
});

/**
 * @param {import('../../api').WamNode} wamNode
 */
const populateParamSelector = async (wamNode) => {
	bpfContainer.innerHTML = '';
	pluginParamSelector.innerHTML = '<option value="-1" disabled selected>Add Automation...</option>';
	const info = await wamNode.getParameterInfo();
	// eslint-disable-next-line
	for (const paramId in info) {
		const { minValue, maxValue, label } = info[paramId];
		const option = new Option(`${paramId} (${label}): ${minValue} - ${maxValue}`, paramId);
		pluginParamSelector.add(option);
	}
	pluginParamSelector.selectedIndex = 0;
};

let state;

/**
 * @param {string} pluginUrl
 */
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
	const { default: WAM } = await import(pluginUrl);

	// Create a new instance of the plugin
	// You can can optionnally give more options such as the initial state of the plugin
	/** @type {WebAudioModule} */
	const instance = await WAM.createInstance(audioContext);
	window.instance = instance;

	// Connect the audionode to the host
	connectPlugin(instance.audioNode);

	audioContext.resume();
	//player.play();

	// Load the GUI if need (ie. if the option noGui was set to true)
	// And calls the method createElement of the Gui module
	const pluginDomNode = await instance.createGui();

	currentPluginDomNode = pluginDomNode;

	// Show plugin info
	showPluginInfo(instance, pluginDomNode);

	populateParamSelector(instance.audioNode);

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

// ------- LIVE INPUT ------
// live input
let liveInputActivated = false;
let inputStreamNode;

function convertToMono(input) {
	const splitter = audioContext.createChannelSplitter(2);
	const merger = audioContext.createChannelMerger(2);

	input.connect(splitter);
	splitter.connect(merger, 0, 0);
	splitter.connect(merger, 0, 1);
	splitter.connect(merger, 1, 0);
	splitter.connect(merger, 1, 1);
	return merger;
}

const defaultConstraints = {
	audio: {
		echoCancellation: false,
		mozNoiseSuppression: false,
		mozAutoGainControl: false,
	},
};
// User input part
const setLiveInputToNewStream = (stream) => {
	window.stream = stream;
	inputStreamNode = audioContext.createMediaStreamSource(stream);
	const inputinputStreamNodeMono = convertToMono(inputStreamNode);

	liveInputGainNode = audioContext.createGain();

	liveInputGainNode.gain.value = liveInputActivated ? 1 : 0;
	console.log(`liveInputGainNode.gain.value = ${liveInputGainNode.gain.value}`);
	inputinputStreamNodeMono.connect(liveInputGainNode);

	console.log('Live Input node created...');
};

// initial live input setup.
navigator.mediaDevices.getUserMedia(defaultConstraints).then((stream) => {
	setLiveInputToNewStream(stream);
});

const toggleLiveInput = () => {
	audioContext.resume();

	const button = document.querySelector('#toggleLiveInput');

	if (!liveInputActivated) {
		button.innerHTML = "Live input: <span style='color:#99c27a;'>ACTIVATED</span>, click to toggle on/off!";
		liveInputGainNode.gain.setValueAtTime(1, audioContext.currentTime);
	} else {
		button.innerHTML = "Live input: <span style='color:#cc7c6e;'>NOT ACTIVATED</span>, click to toggle on/off!";
		liveInputGainNode.gain.setValueAtTime(0, audioContext.currentTime);
	}
	liveInputActivated = !liveInputActivated;
};

const liveInputButton = document.querySelector('#toggleLiveInput');
liveInputButton.onclick = toggleLiveInput;

// -------- select audio input device ---------
const audioInput = document.querySelector('#selectAudioInput');

/**
 * @param {MediaDeviceInfo[]} deviceInfos
 */
const gotDevices = (deviceInfos) => {
	// lets rebuild the menu
	audioInput.innerHTML = '';

	// eslint-disable-next-line no-plusplus
	for (let i = 0; i !== deviceInfos.length; ++i) {
		const deviceInfo = deviceInfos[i];
		if (deviceInfo.kind === 'audioinput') {
			const option = document.createElement('option');
			option.value = deviceInfo.deviceId;
			option.text = deviceInfo.label || `microphone ${audioInput.length + 1}`;
			audioInput.appendChild(option);
			console.log(`adding ${option.text}`);
		} else {
			console.log('Some other kind of source/device: ', deviceInfo);
		}
	}
};

/**
 * @param {string} id
 */
const changeStream = (id) => {
	const constraints = {
		audio: {
			echoCancellation: false,
			mozNoiseSuppression: false,
			mozAutoGainControl: false,
			deviceId: id ? { exact: id } : undefined,
		},
	};
	navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
		setLiveInputToNewStream(stream);
		const pluginUrl = form.pluginUrl.value;
		setPlugin(pluginUrl);
	});
};

const buildAudioDeviceMenu = () => {
	console.log('BUILDING DEVICE MENU');
	navigator.mediaDevices
		.enumerateDevices()
		.then(gotDevices)
		.catch((error) => {
			console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
		});

	audioInput.onchange = (e) => {
		const index = e.target.selectedIndex;
		const id = e.target[index].value;
		const label = e.target[index].text;

		console.dir(`Audio input selected : ${label} id = ${id}`);
		changeStream(id);
	};
};

buildAudioDeviceMenu();

const rebuildAudioDeviceMenu = () => {
	console.log('REBUILDING INPUT DEVICE MENU');
	buildAudioDeviceMenu();
	console.log('RE OPENING INPUT LIVE STREAM WITH DEFAULT DEVICE');
	// initial live input setup.
	navigator.mediaDevices.getUserMedia(defaultConstraints).then((stream) => {
		setLiveInputToNewStream(stream);
	});
	// rebuild graph with plugin
	console.log('REBUILDING GRAPH');
	const pluginUrl = form.pluginUrl.value;
	setPlugin(pluginUrl);
};

const handleDeviceChange = () => {
	console.log('### INPUT DEVICE LIST CHANGED');
	// let's rebuild the menu
	rebuildAudioDeviceMenu();
};

navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

// -------- select MIDI input device ---------
/** @type {HTMLSelectElement} */const midiInputSelector = document.querySelector('#selectMidiInput');

if (navigator.requestMIDIAccess) {
	navigator.requestMIDIAccess().then((midiAccess) => {
		let currentInput;
		const handleMidiMessage = (e) => {
			if (!currentPluginAudioNode) return;
			currentPluginAudioNode.scheduleEvents({ type: 'wam-midi', time: currentPluginAudioNode.context.currentTime, data: { bytes: e.data } });
		};
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
		});
	});
}

// -------- generate MIDI note button ---------
/** @type {HTMLButtonElement} */ const sendMIDINoteButton = document.querySelector('#sendMIDINoteButton');
sendMIDINoteButton.onclick = async () => {
	currentPluginAudioNode.scheduleEvents({ type: 'wam-midi', time: currentPluginAudioNode.context.currentTime, data: { bytes: new Uint8Array([0x90, 74, 100]) } });
	currentPluginAudioNode.scheduleEvents({ type: 'wam-midi', time: currentPluginAudioNode.context.currentTime + 0.25, data: { bytes: new Uint8Array([0x80, 74, 100]) } });
};
