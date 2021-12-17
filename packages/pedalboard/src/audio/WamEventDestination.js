import { WebAudioModule, addFunctionModule } from '@webaudiomodules/sdk';
import Node from './WamEventDestinationNode.js';
import processor from './WamEventDestinationProcessor.js';
//@ts-check

export default class WamEventDestination extends WebAudioModule {
	async createAudioNode(initialState) {
		await addFunctionModule(this.audioContext.audioWorklet, processor, this.moduleId);
		const node = new Node(this);

		return node;
	}

	async createGui() {
		const root = document.createElement('div');
		return root;
	}
}
