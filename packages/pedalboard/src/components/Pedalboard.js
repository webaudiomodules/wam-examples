// eslint-disable-next-line no-use-before-define
import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import download from 'downloadjs';
import { Draggable, DragDropContainer, Droppable } from 'react-draggable-hoc';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import Plugin from './Plugin/index.js';

import PedalsJSON from '../../repository/Pedals.json';
import importIcon from '../../demo/public/import.png';
import exportIcon from '../../demo/public/export.png';
import css from './Pedalboard.scss';

const PedalboardHeader = () => (
	<header className={css.PedalboardHeader}>
		<h1>@wam/Pedalboard</h1>
	</header>
);

const PluginWrapper = SortableElement(({ plugin, onClickRemove }) => (
	<Plugin plugin={plugin} onClickRemove={onClickRemove} />
));

const PedalboardBoard = SortableContainer(({
	plugins,
	handleClickRemove,
}) => (
	<main className={css.PedalboardBoard}>
		{
			plugins.map((plugin, index) => (
				<PluginWrapper
					// eslint-disable-next-line react/no-array-index-key
					key={index}
					index={index}
					plugin={plugin}
					onClickRemove={handleClickRemove}
				/>
			))
		}
	</main>
));

const PedalboardSelector = ({ onClick, audioNode }) => {
	const inputRef = useRef('0');
	const [selectedType, setSelectedType] = useState('default');

	const handleImport = (file) => {
		const fileReader = new FileReader();
		fileReader.onloadend = () => {
			audioNode.clearPlugins();
			audioNode.setState(JSON.parse(fileReader.result));
		};
		fileReader.readAsText(file);
	};

	const handleExport = async () => {
		const pedalBoard = await audioNode.getState();
		download(JSON.stringify(pedalBoard), 'exports.json', 'text/plain');
	};

	const handleTypeChange = (type) => setSelectedType(type);

	return (
		<>
			<div className={css.Pedalboard_contentButtonWrapper}>
				<button
					type="submit"
					className={css.Button}
					onClick={() => {
						inputRef.current.click();
					}}
				>
					<img src={importIcon} alt="importer" width="30px" />
					Importer
					<input
						style={{ display: 'none' }}
						ref={inputRef}
						type="file"
						accept=".json"
						onChange={(e) => handleImport(e.target.files[0])}
					/>
				</button>
				<button
					type="submit"
					className={css.Button}
					onClick={handleExport}
				>
					<img src={exportIcon} alt="exporter" width="30px" />
					Exporter
				</button>
			</div>
			<select
				className={css.Pedalboard_contentSelectWrapper}
				onChange={(e) => handleTypeChange(e.target.value)}
			>
				<option value="default">Toutes les pédales</option>
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
			<aside className={css.PedalboardSelector}>
				{
					PedalsJSON?.length > 0 && PedalsJSON.map((pedal) => (
						(selectedType === 'default' || selectedType === pedal.type) && (
							<Draggable key={pedal.url} dragProps={pedal} className={css.PedalboardSelectorCell}>
								<div>
									<img
										src={`/packages/pedalboard/demo/public/${pedal.thumbnail}`}
										alt={`image_pedale_${pedal.url}`}
										key={pedal.url}
										className={css.PedalboardSelectorThumbnail}
										onClick={() => onClick(pedal.url)}
									/>
								</div>
							</Draggable>
						)
					))
				}
			</aside>
		</>
	);
};

const Pedalboard = ({ audioNode }) => {
	const [plugins, setPlugins] = useState([]);

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

	const onDrop = (pedal) => {
		audioNode.addPlugin(pedal.dragProps.url);
	};

	const onSortPlugin = ({ oldIndex, newIndex }) => {
		audioNode.swapPlugins(oldIndex, newIndex);
	};

	return (
		<DragDropContainer className="Simple-page-container">
			<section className={css.Pedalboard}>
				<PedalboardHeader />
				<div className={css.Pedalboard_content}>
					<Droppable onDrop={onDrop}>
						{({ isHovered, ref, dragProps }) => (
							<div
								className={css.Pedalboard_contentScroll}
								ref={ref}
								style={{
									backgroundColor: isHovered ? 'rgba(0, 130, 20, 0.2)' : undefined,
									border: dragProps ? '1px dashed #ccc' : undefined,
								}}
							>
								<div className={css.Pedalboard_content}>
									<PedalboardBoard
										axis="x"
										onSortEnd={onSortPlugin}
										plugins={plugins}
										handleClickRemove={handleClickRemove}
									/>
								</div>
							</div>
						)}
					</Droppable>
					<div className={css.Pedalboard_SelectorWrapper}>
						<PedalboardSelector
							onClick={handleClickThumbnail}
							audioNode={audioNode}
						/>
					</div>
				</div>
			</section>
		</DragDropContainer>
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
	audioNode: PropTypes.shape({
		clearPlugins: PropTypes.func.isRequired,
		setState: PropTypes.func.isRequired,
		getState: PropTypes.func.isRequired,
	}).isRequired,
};

export default Pedalboard;
