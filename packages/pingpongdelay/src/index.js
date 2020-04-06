


const getAudioNode = async (audioContext, options) => {
	console.log('PingPongDelay.getAudioNode()');
	const { default: PingPongDelayNode } = await import('./Node');
	console.log('PingPongDelayNode', PingPongDelayNode);
	return new PingPongDelayNode(audioContext, options);
};

const getDomNode = async (pluginAudioNode, options) => {
	console.log('PingPongDelay.getDomNode()');
	const { default: PingPongDelayGui } = await import('./Gui/Gui');
	return new PingPongDelayGui(pluginAudioNode, options);
};

export {
	getAudioNode,
	getDomNode,
};
