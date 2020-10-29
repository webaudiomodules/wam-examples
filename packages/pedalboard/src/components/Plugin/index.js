import React, { useEffect, useRef } from 'react';

import crossIcon from '../../../demo/public/cross.png';

import css from './index.scss';

const PLUGIN_WIDTH = 230;
const PLUGIN_HEIGHT = 300;

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
			plugginWrapperRef.current.style.width = 'fit-content';
			const parent = plugginWrapperRef.current.parentNode;

			const instanceRect = plugginWrapperRef.current.getBoundingClientRect();
			const scaleWidth = PLUGIN_WIDTH / instanceRect.width;
			const scaleHeight = PLUGIN_HEIGHT / instanceRect.height;

			parent.style.width = PLUGIN_WIDTH + 'px';
			parent.style.height = PLUGIN_HEIGHT + 'px';

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
		<div className={css.PluginWrapper}>
			<div className={css.PluginContainer}>
				<div ref={plugginWrapperRef} />			
			</div>
			<img className={css.Icon} src={crossIcon} onClick={() => onClickRemove(plugin.id)} />
		</div>
	);
}

export default Plugin;