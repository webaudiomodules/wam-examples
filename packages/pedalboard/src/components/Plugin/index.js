// eslint-disable-next-line no-use-before-define
import React, { useEffect, useRef } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';

import crossIcon from '../../../demo/public/cross.png';
import css from './index.scss';

const PLUGIN_HEIGHT = 200;

const Plugin = ({
	plugin,
	onClickRemove,
}) => {
	const plugginWrapperRef = useRef(plugin.id);
	let pluginGui;

	useEffect(() => {
		const pluginWrapper = plugginWrapperRef;
		(async () => {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			pluginGui = await plugin.instance.createGui();

			pluginWrapper.current.appendChild(pluginGui);
			const parent = pluginWrapper.current.parentNode;
			const instanceRect = pluginWrapper.current.getBoundingClientRect();
			const parentRect = pluginWrapper.current.parentNode.getBoundingClientRect();

			const widthRatio = parentRect.width / parentRect.height;
			const scale = PLUGIN_HEIGHT / instanceRect.height;
			const translateX = ((scale - 1) * 100) / 2;
			const translateY = ((scale - 1) * 100) / 2;

			pluginWrapper.current.style.transform = `translate(${translateX}%, ${translateY}%) scale(${scale})`;

			const pluginSize = pluginWrapper.current.getBoundingClientRect();
			parent.style.width = `${pluginSize.height * widthRatio}px`;
			parent.style.height = `${pluginSize.height}px`;

			return pluginGui;
		})();

		return () => {
			pluginWrapper.current.style.removeProperty('transform');
			pluginWrapper.current.removeChild(pluginGui);
		};
	}, [plugin, plugginWrapperRef]);

	return (
		<div className={css.PluginWrapper}>
			<div className={css.PluginContainer}>
				<div ref={plugginWrapperRef} />
			</div>
			<img className={css.Icon} src={crossIcon} onClick={() => onClickRemove(plugin.id)} />
		</div>
	);
};

Plugin.propTypes = {
	plugin: PropTypes.shape({
		id: PropTypes.number.isRequired,
		instance: PropTypes.shape({
			createGui: PropTypes.func.isRequired,
			name: PropTypes.string.isRequired,
		}).isRequired,
	}).isRequired,
	onClickRemove: PropTypes.func.isRequired,
};

export default Plugin;
