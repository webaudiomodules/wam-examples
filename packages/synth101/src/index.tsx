/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
/* eslint-disable import/extensions */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */

import { WebAudioModule, ParamMgrFactory, CompositeAudioNode } from 'sdk';
import Synth101Node from './Node';
import { h, Component, render } from 'preact';

/**
 * @typedef {import('../sdk/src/ParamMgr/ParamMgrNode.js').default} ParamMgrNode
 */

/**
 * @param {URL} relativeURL
 * @returns {string}
 */
const getBasetUrl = (relativeURL) => {
	const baseURL = relativeURL.href.substring(0, relativeURL.href.lastIndexOf('/'));
	return baseURL;
};

export default class Synth101 extends WebAudioModule {
	//@ts-ignore
	_baseURL = getBasetUrl(new URL('.', import.meta.url));

	_descriptorUrl = `${this._baseURL}/descriptor.json`;

	async _loadDescriptor() {
		const url = this._descriptorUrl;
		if (!url) throw new TypeError('Descriptor not found');
		const response = await fetch(url);
		const descriptor = await response.json();
		Object.assign(this.descriptor, descriptor);
	}

	async initialize(state) {
		await this._loadDescriptor();
		return super.initialize(state);
	}

	async createAudioNode(initialState) {
		const synthNode = new Synth101Node(this.audioContext);

		const paramsConfig = {
			
		};
		const internalParamsConfig = {
			
		};
		const paramsMapping = {
			
		};
        const optionsIn = { internalParamsConfig, paramsConfig, paramsMapping };
		const paramMgrNode = await ParamMgrFactory.create(this, optionsIn);
		synthNode.setup(paramMgrNode);

		if (initialState) synthNode.setState(initialState);
		return synthNode;
    }

	createGui() {
		return new Promise<Element>((resolve, reject) => {
			const div = document.createElement('div');
			// hack because h() is getting stripped for non-use despite it being what the JSX compiles to
			h("div", {})

    		render(<div>yo</div>, div);

   			return div;
		})
	}
}
