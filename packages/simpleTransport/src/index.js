import WebAudioModule from '../../sdk/src/WebAudioModule.js';
import createElement from './gui.js';
import SimpleTransportNode from './SimpleTransportNode.js';

/**
 * @param {URL} relativeUrl
 * @returns {string}
 */
const getBaseUrl = (relativeUrl) => {
	const baseUrl = relativeUrl.href.substring(0, relativeUrl.href.lastIndexOf('/'));
	return baseUrl;
};

/**
 * @extends {WebAudioModule<SimpleTransportNode>}
 */
class SimpleTransport extends WebAudioModule {
    /** @type {SimpleTransportNode} */
    _audioNode;
	_baseUrl = getBaseUrl(new URL('.', import.meta.url));
	_descriptorUrl = `${this._baseUrl}/descriptor.json`;
	_templateUrl = `${this._baseUrl}/template.html`;

    /**
     * @param {any} initialState
     */
	async initialize(initialState) {
		await this._loadDescriptor();
		const templateRes = await fetch(this._templateUrl);
		this.templateHtmlStr = await templateRes.text();
		return super.initialize(initialState);
	}

    /**
     * @param {any} initialState
     */
	async createAudioNode(initialState) {
		await SimpleTransportNode.addModules(this.audioContext, this.moduleId);
		const node = new SimpleTransportNode(this, {});
		await node._initialize();

		// Set initial state if applicable
		if (initialState) node.setState(initialState);

		return node;
	}

	async createGui() {
		return createElement(this);
	}
}

export default SimpleTransport;
