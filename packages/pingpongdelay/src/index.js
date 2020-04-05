import PingPongDelayGui from './Gui/Gui';
import PingPongDelayNode from './Node';

export { default as PingPongDelayNode } from './Node';

export { PingPongDelayGui };

const getAudioNode = async (audioContext, options) => {
	console.log('PingPongDelay.getAudioNode()');
	return new PingPongDelayNode(audioContext, options);
};

const getDomNode = async (pluginAudioNode, options) => {
	console.log('PingPongDelay.getDomNode()');
	return new PingPongDelayGui(pluginAudioNode, options);
};

export {
	getAudioNode,
	getDomNode,
};
