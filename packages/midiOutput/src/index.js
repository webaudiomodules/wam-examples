import WebAudioModule from '../../sdk/src/WebAudioModule.js';
import createElement from './gui.js';
import MidiOutputNode from './MidiOutputNode.js';

/**
 * @param {URL} relativeUrl
 * @returns {string}
 */
const getBaseUrl = (relativeUrl) => {
	const baseUrl = relativeUrl.href.substring(0, relativeUrl.href.lastIndexOf('/'));
	return baseUrl;
};

/**
 * @extends {WebAudioModule}
 */
class MidiOutput extends WebAudioModule {
	onListChange = (list = this.list) => undefined;
	_baseUrl = getBaseUrl(new URL('.', import.meta.url));
	_descriptorUrl = `${this._baseUrl}/descriptor.json`;

    /**
     * @param {any} initialState
     */
	async createAudioNode(initialState) {
        this.midiAccess = await navigator.requestMIDIAccess();
		/** @type {[string, string][]} */
        this.list = [];
        this.midiAccess.outputs.forEach(output => this.list.push([output.id, output.name]));
		this.midiAccess.addEventListener('statechange', () => {
			this.midiAccess.outputs.forEach(output => this.list.push([output.id, output.name]));
			if (this.onListChange) this.onListChange(this.list);
		});
		/** @type {WebMidi.MIDIOutput} */
		this.connected = null;
		await MidiOutputNode.addModules(this.audioContext, this.moduleId);
		const node = new MidiOutputNode(this, {});
		await node._initialize();
		node.onMidi = (e) => {
			if (this.connected) this.connected.send(e);
		}; 

		// Set initial state if applicable
		if (initialState) node.setState(initialState);

		return node;
	}

	disconnectMIDI() {
		this.connected = null;
	}
    /** @param {string} id */
    connectMIDI(id) {
        if (id !== "-1") {
			const output = Array.from(this.midiAccess.outputs).find(([o]) => o === id)[1];
			this.connected = output;
		}
    }
	async createGui() {
		return createElement(this);
	}
}

export default MidiOutput;
