// eslint-disable-next-line no-use-before-define
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { ReactSortable } from 'react-sortablejs';

import Plugin from './Plugin/index.js';

import PedalsJSON from '../../repository/Pedals.json';
import PatchesJSON from '../../repository/Patches.json';
import css from './Pedalboard.scss';

const PedalboardHeader = ({ audioNode, setSelectedType }) => {
	const handleImport = (e) => {
		if (e) {
			audioNode.setState(JSON.parse(e));
		}
	};

	return (
		<header className={css.Pedalboard_Header}>
			<h1>Pedalboard</h1>
			<div className={css.Pedalboard_Header_ContentButtonWrapper}>
				<select
					className={css.Pedalboard_Header_Selector}
					onChange={(e) => handleImport(e.target.value)}
				>
					<option value="">Patches</option>
					{
						PatchesJSON?.length > 0
						&& [...new Set(PatchesJSON)].map((patch) => (
							<option
								key={patch.name}
								value={JSON.stringify(patch.plugins)}
							>
								{patch.name}
							</option>
						))
					}
				</select>
				<select
					className={css.Pedalboard_Header_Selector}
					onChange={(e) => setSelectedType(e.target.value)}
				>
					<option value="default">All plugins</option>
					{
						PedalsJSON?.length > 0
						&& [...new Set(PedalsJSON.map((p) => p.type))].map((type) => (
							<option
								key={type}
								value={type}
							>
								{type}
							</option>
						))
					}
				</select>
			</div>
		</header>
	);
};

const PedalboardBoard = ({
	plugins,
	handleClickRemove,
	onDrop,
	onSortPlugin
}) => {
	const setList = (e) => {
		if (e.url) {
			onDrop(e.url);
		}
	};
	return (
		<ReactSortable
			group={{
				name: 'plugins',
				pull: false,
			}}
			list={plugins}
			setList={setList}
			className={css.PedalboardBoard}
			id="board"
			onSort={(e) => onSortPlugin(e, e.oldIndex, e.newIndex)}
		>
			{plugins.map((plugin) => (
				<Plugin
					key={plugin.id}
					plugin={plugin}
					onClickRemove={handleClickRemove}
				/>
			))}
		</ReactSortable>
	);
};

const PedalboardSelector = ({ onClick, selectedType }) => {
	const [pedals, setPedals] = useState([]);

	useEffect(() => {
		setPedals(PedalsJSON.filter((pedal) => selectedType === 'default' || selectedType === pedal.type));
	}, [selectedType]);

	return (
		<>
			<aside className={css.PedalboardSelector}>
				<ReactSortable
					group={{
						name: 'plugins',
						pull: 'clone',
					}}
					list={pedals}
					setList={setPedals}
					className={css.PedalboardSelectorCell}
					sort={false}
				>
					{
						pedals.map((pedal) => (
							<img
								src={`/packages/pedalboard/demo/public/${pedal.thumbnail}`}
								alt={`image_pedale_${pedal.url}`}
								key={pedal.url}
								className={css.PedalboardSelectorThumbnail}
								onClick={() => onClick(pedal.url)}
							/>
						))
					}
				</ReactSortable>
			</aside>
		</>
	);
};

const Pedalboard = ({ audioNode }) => {
	const [plugins, setPlugins] = useState([]);
	const [selectedType, setSelectedType] = useState('default');

	const handlePluginListChange = (e) => {
		setPlugins([...e.detail.pluginList]);
	};

	useEffect(() => {
		// eslint-disable-next-line react/prop-types
		audioNode.addEventListener('onchange', handlePluginListChange);

		return () => {
			// eslint-disable-next-line react/prop-types
			audioNode.removeEventListener('onchange', handlePluginListChange);
		};
	});

	const handleClickThumbnail = (pluginUrl) => {
		audioNode.addPlugin(pluginUrl);
	};

	const handleClickRemove = (pluginID) => {
		audioNode.removePlugin(pluginID);
	};

	const onSortPlugin = (element, oldIndex, newIndex) => {
		if (element.clone.tagName === 'IMG') {
			handleClickThumbnail(element.clone.attributes['data-id'].value);
		} else {
			audioNode.swapPlugins(oldIndex, newIndex);
		}
	};

	return (
		<div className="Simple-page-container">
			<section className={css.Pedalboard}>
				<PedalboardHeader
					className={css.Pedalboard_Header}
					audioNode={audioNode}
					setSelectedType={setSelectedType}
				/>
				<div className={css.Pedalboard_Body}>
					<div className={css.Pedalboard_Body_Content}>
						<PedalboardBoard
							plugins={plugins}
							handleClickRemove={handleClickRemove}
							onDrop={handleClickThumbnail}
							onSortPlugin={onSortPlugin}
						/>
					</div>
					<PedalboardSelector
						onClick={handleClickThumbnail}
						audioNode={audioNode}
						selectedType={selectedType}
					/>
				</div>
			</section>
		</div>
	);
};

Pedalboard.propTypes = {
	audioNode: PropTypes.shape({
		addPlugin: PropTypes.func.isRequired,
		removePlugin: PropTypes.func.isRequired,
		swapPlugins: PropTypes.func.isRequired,
	}).isRequired,
};

PedalboardSelector.propTypes = {
	onClick: PropTypes.func.isRequired,
	selectedType: PropTypes.string.isRequired,
};

PedalboardBoard.propTypes = {
	plugins: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
	handleClickRemove: PropTypes.func.isRequired,
};

PedalboardHeader.propTypes = {
	audioNode: PropTypes.shape({
		clearPlugins: PropTypes.func.isRequired,
		setState: PropTypes.func.isRequired,
		getState: PropTypes.func.isRequired,
	}).isRequired,
	setSelectedType: PropTypes.func.isRequired,
};

export default Pedalboard;
