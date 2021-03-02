// eslint-disable-next-line no-use-before-define
import React, { useCallback, useEffect, useRef } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';

import crossIcon from './cross.png';
import css from './index.scss';

const Plugin = ({
	plugin,
	onClickRemove,
}) => {
	const plugginGuiRef = useRef();
	const pluginGuiRectRef = useRef();
	const plugginWrapperRef = useRef();
	const pluginContainerRef = useRef();
	const lastHeightRef = useRef();

	const onResize = useCallback(() => {
		const containerRect = pluginContainerRef.current.getBoundingClientRect();
		const scale = containerRect.height / pluginGuiRectRef.current.height;

		plugginWrapperRef.current.style.transformOrigin = 'top left';
		plugginWrapperRef.current.style.transform = `scale(${scale})`;

		pluginContainerRef.current.style.width = `${pluginGuiRectRef.current.width * scale}px`;
	}, []);

	useEffect(() => {
		(async () => {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			plugginGuiRef.current = await plugin.instance.createGui();
			plugginWrapperRef.current.appendChild(plugginGuiRef.current);
			pluginGuiRectRef.current = plugginGuiRef.current.getBoundingClientRect();

			let resizeLoopEnabled = true;

			const loop = () => {
				const containerRect = pluginContainerRef.current.getBoundingClientRect();
				const { height } = containerRect;

				if (height !== lastHeightRef.current) {
					lastHeightRef.current = height;
					onResize();
				}

				if (!resizeLoopEnabled) return;

				requestAnimationFrame(loop);
			};

			loop();

			return () => {
				resizeLoopEnabled = false;
			};
		})();
	}, [onResize, plugin]);

	return (
		<div className={css.PluginWrapper}>
			<div className={css.PluginWrapper_Header} id="nameAndIcon">
				<p
					title={plugin.instance.name}
					className={css.PluginWrapper_Header_Name}
				>
					{plugin.instance.name}
				</p>
				<img
					className={css.PluginWrapper_Header_Icon}
					src={crossIcon}
					onClick={() => onClickRemove(plugin.id)}
				/>
			</div>
			<div className={css.PluginWrapper_Container} ref={pluginContainerRef}>
				<div className={css.PluginWrapper_Ref} ref={plugginWrapperRef} />
			</div>
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
