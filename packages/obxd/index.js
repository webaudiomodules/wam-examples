import WebAudioModule from "../sdk/src/WebAudioModule.js";
import { OBXDNode } from "./obxd-node.js";

// OBXD WAM Plugin
// Jari Kleimola 2017-2020 (jari@webaudiomodules.org)

/**
 * @param {URL} relativeURL
 * @returns {string}
 */
 const getBaseUrl = (relativeURL) => {
	const baseURL = relativeURL.href.substring(0, relativeURL.href.lastIndexOf('/'));
	return baseURL;
};

/**
 * @extends {WebAudioModule<OBXDNode>}
 */
export default class OBXDPlugin extends WebAudioModule
{
	_baseURL = getBaseUrl(new URL('.', import.meta.url));

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

	/**
	 * @param {any} initialState
	 */
	async createAudioNode(initialState) {
		await OBXDNode.importScripts(this.audioContext, "wasm/");
		const obxd = new OBXDNode(this, initialState);
		await obxd.loadBank(`${this._baseURL}/presets/factory.fxb`);
		return obxd;
	}

	/**
	 * @param {{ skin?: string }} options
	 */
	async createGui(options = {}) {
    	const { createElement } = await import("./obxd-gui.js");
		return createElement(this, options);
  	}

	destroyGui(gui) {
		gui.destroy();
	}
}
