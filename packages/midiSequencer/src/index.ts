import { WebAudioModule } from "@webaudiomodules/sdk";
import createElement from "./gui";
import MidiSequencerNode from "./MidiSequencerNode";

const getBaseUrl = (relativeUrl: URL) => {
	const baseUrl = relativeUrl.href.substring(0, relativeUrl.href.lastIndexOf("/"));
	return baseUrl;
};

class MidiSequencer extends WebAudioModule<MidiSequencerNode> {
	_baseUrl = getBaseUrl(new URL(".", import.meta.url));
	_descriptorUrl = `${this._baseUrl}/descriptor.json`;
	async createAudioNode(initialState: any) {
		await MidiSequencerNode.addModules(this.audioContext, this.moduleId);
		const node: MidiSequencerNode = new MidiSequencerNode(this, {});
		await node._initialize();

		// Set initial state if applicable
		if (initialState) node.setState(initialState);

		return node;
	}
	async createGui() {
		return createElement(this);
	}
}

export default MidiSequencer;
