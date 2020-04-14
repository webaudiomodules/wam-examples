import PingPongDelayHTMLElement from './Gui';

export { PingPongDelayHTMLElement };

export async function createElement(plugin, options) {
	return new PingPongDelayHTMLElement(plugin, options);
}
