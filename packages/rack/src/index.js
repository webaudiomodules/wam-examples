import React, { useRef, useLayoutEffect, useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const PluginRack = ({ pluginUrl, src }) => {
	const audioContext = useRef(new AudioContext());
	const mediaSource = useRef(null);
	const intermediateGain = useRef(null);
	const player = useRef(null);
	const pluginContainer = useRef(null);

	useLayoutEffect(() => {
		mediaSource.current = audioContext.current.createMediaElementSource(player.current);
		intermediateGain.current = audioContext.current.createGain();
	}, []);

	useEffect(() => {
		const plugin = new global.WasabiPingPongDelay(audioContext.current, pluginUrl);
		plugin.load().then((node) => {
			console.log('node', node);
			plugin.loadGui().then((elem) => {
				console.log('elem', elem);
				pluginContainer.current.innerHtml = '';
				pluginContainer.current.appendChild(elem);
			});
			mediaSource.current.connect(node);
			node.connect(audioContext.current.destination);
		});
	}, [pluginUrl]);

	return (
		<div className="PluginRack">
			<audio ref={player} src={src} controls loop crossOrigin="anonymous" />
			<div className="PluginRack_plugin" ref={pluginContainer} />
		</div>
	);
};

PluginRack.propTypes = {
	src: PropTypes.string.isRequired,
	pluginUrl: PropTypes.string.isRequired,
};

const render = (node) => {
	console.info(`[PluginRack] React version: ${ReactDOM.version}`);
	ReactDOM.render(
		(
			<PluginRack
				pluginUrl="https://wasabi.i3s.unice.fr/WebAudioPluginBank/WASABI/PingPongDelay3"
				src="https://wasabi.i3s.unice.fr/WebAudioPluginBank/BasketCaseGreendayriffDI.mp3"
			/>
		),
		node,
	);
};

export {
	PluginRack,
	render,
};
