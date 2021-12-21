import WebAudioModule from '../../sdk/src/WebAudioModule.js';
import WamEventViewerNode from './WamEventViewerNode.js';
import createElement from './gui.js';

/**
 * @param {URL} relativeUrl
 * @returns {string}
 */
const getBaseUrl = (relativeUrl) => {
	const baseUrl = relativeUrl.href.substring(0, relativeUrl.href.lastIndexOf('/'));
	return baseUrl;
};

/**
 * @extends {WebAudioModule<WamEventViewerNode>}
 */
class WamEventViewer extends WebAudioModule {
	_baseUrl = getBaseUrl(new URL('.', import.meta.url));
	_descriptorUrl = `${this._baseUrl}/descriptor.json`;
	_templateUrl = `${this._baseUrl}/template.html`;

    /**
     * @param {any} initialState
     */
	async createAudioNode(initialState) {
		await WamEventViewerNode.addModules(this.audioContext, this.moduleId);
		const node = new WamEventViewerNode(this, {});
		await node._initialize();

		// Set initial state if applicable
		if (initialState) node.setState(initialState);

		return node;
	}

	async createGui() {
		return createElement(this);
	}
}

export default WamEventViewer;
