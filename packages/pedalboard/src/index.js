//@ts-check
import React from 'react';
import ReactDOM from 'react-dom';
import { WebAudioModule, addFunctionModule, initializeWamGroup } from '@webaudiomodules/sdk';

import Pedalboard from './components/Pedalboard.js';
import PedalboardAudioNode from './audio/PedalboardAudioNode.js';
import processor from './audio/WamProcessor.js';
import descriptor from './descriptor.json';
import WamEventDestination from './audio/WamEventDestination.js';

export default class PedalboardPlugin extends WebAudioModule {
	async initialize(state) {
		Object.assign(this.descriptor, descriptor);
		this.subgroupKey = performance.now().toString();
		return super.initialize(state);
	}

	async createAudioNode(initialState) {
		await addFunctionModule(this.audioContext.audioWorklet, initializeWamGroup, this.instanceId, this.subgroupKey);
		this.destination = await WamEventDestination.createInstance(this.instanceId, this.audioContext);
		await addFunctionModule(this.audioContext.audioWorklet, processor, this.groupId, this.moduleId);
		const pedalboardAudioNode = new PedalboardAudioNode(this);

		if (initialState) pedalboardAudioNode.setState(initialState);
		return pedalboardAudioNode;
	}

	async createGui() {
		const root = document.createElement('div');
		ReactDOM.render(<Pedalboard audioNode={this.audioNode} />, root);
		return root;
	}
}
