import React, { useEffect, useRef } from 'react';

import crossIcon from '../../../demo/public/cross.png';

import css from './index.scss';

const PLUGIN_HEIGHT = 350;

const Plugin = ({
	plugin,
	onClickRemove,
}) => {
	const plugginWrapperRef = useRef(plugin.id);
	let pluginGui;

	useEffect(() => {
		(async () => {
			const createGui = async () => {
				return await plugin.instance.createGui();
			}
			pluginGui = await createGui();

			plugginWrapperRef.current.appendChild(pluginGui);
			const parent = plugginWrapperRef.current.parentNode;
			const instanceRect = plugginWrapperRef.current.getBoundingClientRect();
			const scale = PLUGIN_HEIGHT / instanceRect.height;
			const translateX = (scale - 1) * 100 / 2;
			const translateY = (scale - 1) * 100 / 2;

			plugginWrapperRef.current.style.transform =
				`translate(${translateX}%, ${translateY}%)
			 	scale(${scale})`;

			const pluginSize = plugginWrapperRef.current.getBoundingClientRect();
			parent.style.width = pluginSize.width + 'px';
			parent.style.height = pluginSize.height + 'px';
		})();

		return () => {
			plugginWrapperRef.current.style.removeProperty('transform');
			plugginWrapperRef.current.removeChild(pluginGui);
		}
	}, [plugin, plugginWrapperRef]);


	return (
		<div className={css.PluginWrapper}>
			<div className={css.PluginContainer}>
				<div ref={plugginWrapperRef} />			
			</div>
			<img className={css.Icon} src={crossIcon} onClick={() => onClickRemove(plugin.id)} />
		</div>
	);
}

export default Plugin;