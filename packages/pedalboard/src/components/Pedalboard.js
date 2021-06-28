// eslint-disable-next-line no-use-before-define
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { ReactSortable } from 'react-sortablejs';

import Plugin from './Plugin/index.js';

import css from './Pedalboard.scss';

let pedalsList = [];
let patchesList = [];
let typesList = new Set();
let setPedalsList;
let setPatchesList;
let setTypesList;

fetch(new URL('./pedals.json', import.meta.url).href).then((res) => res.json()).then((pedalsJSON) => {
	Promise.all(pedalsJSON.map((url) => fetch(`${url}/descriptor.json`).then((res) => res.json()).then((json) => {
		json.url = url;
		if (!json.keywords) json.keywords = [];
		json.keywords.forEach((k) => typesList.add(k));
		return json;
	})))
	.then((list) => {
		pedalsList = list;
		if (setPedalsList) setPedalsList(pedalsList);
		if (setTypesList) setTypesList(Array.from(typesList));
	});
});

fetch(new URL('./patches.json', import.meta.url).href).then((res) => res.json()).then((patchesJSON) => {
	patchesList = patchesJSON;
	if (setPatchesList) setPatchesList(patchesList);
});

const PedalboardHeader = ({ audioNode, setSelectedType }) => {
	const [types, setTypes] = useState(Array.from(typesList));
	const [patches, setPatches] = useState(patchesList);
	setTypesList = setTypes;
	setPatchesList = setPatches;
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
						patches.map((patch) => (
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
						types.map((type) => (
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
	onSortPlugin,
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
	const [pedals, setPedals] = useState(pedalsList);

	const handleSelectedType = () => {
		setPedals(pedalsList.filter((pedal) => selectedType === 'default' || pedal.keywords.indexOf(selectedType) !== -1));
	};
	setPedalsList = handleSelectedType;
	useEffect(handleSelectedType, [selectedType]);

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
								src={`${pedal.url}/${pedal.thumbnail || 'thumbnail.png'}`}
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
		audioNode.addEventListener('change', handlePluginListChange);

		return () => {
			// eslint-disable-next-line react/prop-types
			audioNode.removeEventListener('change', handlePluginListChange);
		};
	});

	const handleClickThumbnail = (pluginUrl) => {
		audioNode.addPlugin(`${pluginUrl}/index.js`);
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
	onDrop: PropTypes.func.isRequired,
	onSortPlugin: PropTypes.func.isRequired,
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
