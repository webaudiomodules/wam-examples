import React, { useEffect, useRef } from 'react';

import crossIcon from '../../../demo/public/cross.png';

import css from './index.scss';

const PLUGIN_WIDTH = 250;
const PLUGIN_HEIGHT = 400;

const Plugin = ({
	plugin,
	onClickRemove,
}) => {
	const plugginWrapperRef = useRef(plugin.id);
	//const plugginCrossRef = useRef(plugin.url);
	let pluginGui;

	useEffect(() => {
		(async () => {
			const createGui = async () => {
				return await plugin.instance.createGui();
			}
			pluginGui = await createGui();

			plugginWrapperRef.current.appendChild(pluginGui);
			plugginWrapperRef.current.style.width = 'fit-content';
			const parent = plugginWrapperRef.current.parentNode;

			const instanceRect = plugginWrapperRef.current.getBoundingClientRect();
			const scaleWidth = PLUGIN_WIDTH / instanceRect.width;
			const scaleHeight = PLUGIN_HEIGHT / instanceRect.height;

			parent.style.width = instanceRect.width * scaleWidth + 'px';
			parent.style.height = instanceRect.height * scaleHeight + 'px';

			const translateX = (scaleWidth - 1) * 100 / 2;
			const translateY = (scaleHeight - 1) * 100 / 2;

			plugginWrapperRef.current.style.transform =
				`translate(${translateX}%, ${translateY}%)
				scale(${scaleWidth}, ${scaleHeight})`;
		})();

		return () => {
			plugginWrapperRef.current.style.removeProperty('transform');
			plugginWrapperRef.current.removeChild(pluginGui);
		}
	}, [plugin, plugginWrapperRef]);


	return (
		<div className={css.PluginContainer}>
			<div className={css.Plugin} ref={plugginWrapperRef} />
			<img className={css.PluginIcon} src={crossIcon} onClick={() => onClickRemove(plugin.id)} />
		</div>
	);
}

export default Plugin;