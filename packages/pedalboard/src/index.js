// eslint-disable-next-line no-use-before-define
import React from 'react';
import ReactDOM from 'react-dom';
import { WebAudioModule } from 'sdk';

import Pedalboard from './components/Pedalboard.js';
import PedalboardAudioNode from './audio/PedalboardAudioNode.js';

export default class PedalboardPlugin extends WebAudioModule {
	static descriptor = {
		name: 'Pedalboard',
		vendor: 'WebAudioModule',
	};

	// The plugin redefines the async method createAudionode()
	// that must return an <Audionode>
	// It also listen to plugin state change event to update the audionode internal state

	async createAudioNode(initialState) {
		const pedalboardAudioNode = new PedalboardAudioNode(this.audioContext);

		if (initialState) pedalboardAudioNode.setState(initialState);
		return pedalboardAudioNode;
	}

	// eslint-disable-next-line class-methods-use-this
	createGui() {
		const root = document.createElement('div');
		ReactDOM.render(<Pedalboard audioNode={this.audioNode} />, root);
		return root;
	}
}
