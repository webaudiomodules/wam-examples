
// This file is the factory for the GUI part..bundleRenderer.renderToStream
// The imporant thing here is the createElement async method
import PingPongDelayHTMLElement from './Gui';

export { PingPongDelayHTMLElement };

export async function createElement(plugin, options) {
	// here we return the WebComponent GUI but it could be
	// any DOM node
	return new PingPongDelayHTMLElement(plugin, options);
}
