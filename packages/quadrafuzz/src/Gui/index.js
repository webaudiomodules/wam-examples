// This file is the factory for the GUI part..bundleRenderer.renderToStream
// The imporant thing here is the createElement async method
// This file must be an es module in order to be loaded with the SDK (with dynamic imports)
import QuadrafuzzHTMLElement from './Gui.js';

export { QuadrafuzzHTMLElement };

/**
 * A mandatory method if you want a gui for your plugin
 * @param {import('@webaudiomodules/api').WebAudioModule} plugin - the plugin instance
 * @returns {Node} - the plugin root node that is inserted in the DOM of the host
 */
export async function createElement(plugin, ...args) {
	// here we return the WebComponent GUI but it could be
// any DOM node
	return new QuadrafuzzHTMLElement(plugin, ...args);
}
