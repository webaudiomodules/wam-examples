// eslint-disable-next-line no-use-before-define
import React, { useEffect, useRef } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';

import crossIcon from '../../../demo/public/cross.png';
import css from './index.scss';

//Used to remove the 'px' part of the string
const parseCSSPropertyToInt = (valueStr) => parseInt(valueStr.slice(0, valueStr.length - 2), 10);

const getHeight = (element, cumulate = false) => {
	const multiplier = cumulate ? 1 : -1;
	const height = element.clientHeight;
	const marginTop = parseCSSPropertyToInt(window.getComputedStyle(element).getPropertyValue('margin-top'));
	const marginBottom = parseCSSPropertyToInt(window.getComputedStyle(element).getPropertyValue('margin-bottom'));
	const paddingTop = parseCSSPropertyToInt(window.getComputedStyle(element).getPropertyValue('padding-top'));
	const paddingBottom = parseCSSPropertyToInt(window.getComputedStyle(element).getPropertyValue('padding-bottom'));
	return height - Math.ceil((marginTop + marginBottom + paddingBottom + paddingTop) * multiplier);
};

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

			const boardHeight = getHeight(document.querySelector('#board'), true);
			const nameHeight = getHeight(document.querySelector('#nameAndIcon'));

			pluginWrapper.current.appendChild(pluginGui);
			const parent = pluginWrapper.current.parentNode;
			const instanceRect = pluginWrapper.current.getBoundingClientRect();
			const parentRect = pluginWrapper.current.parentNode.getBoundingClientRect();

			const widthRatio = parentRect.width / parentRect.height;
			const scale = (boardHeight - nameHeight - 1) / instanceRect.height;
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
			<div className={css.PluginWrapper_Footer} id="nameAndIcon">
				<p
					title={plugin.instance.name}
					className={css.PluginWrapper_Footer_Name}
				>
					{plugin.instance.name}
				</p>
				<img
					className={css.PluginWrapper_Footer_Icon}
					src={crossIcon}
					onClick={() => onClickRemove(plugin.id)}
				/>
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
