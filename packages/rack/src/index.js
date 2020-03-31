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
		let cleanHtml;
		let cleanAudio;

		const clean = () => {
			if (cleanHtml) cleanHtml();
			if (cleanAudio) cleanAudio();
		};

		const loadPlugin = async () => {
			console.log('loadPlugin');
			const plugin = new global.WasabiPingPongDelay(audioContext.current, pluginUrl);

			const node = await plugin.load();
			console.log('node', node);

			const elem = await plugin.loadGui();
			console.log('elem', elem);

			pluginContainer.current.appendChild(elem);
			const previousPluginContainer = pluginContainer.current;
			cleanHtml = () => { previousPluginContainer.innerHtml = ''; };

			mediaSource.current.connect(node);
			node.connect(audioContext.current.destination);

			const previousMediaSource = mediaSource.current;
			const previousAudioContext = audioContext.current;
			cleanAudio = () => {
				previousMediaSource.disconnect(node);
				node.disconnect(previousAudioContext.destination);
			};
		};

		loadPlugin();

		return clean;
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
