// eslint-disable-next-line no-use-before-define
import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import download from 'downloadjs';
import { Draggable, DragDropContainer, Droppable } from 'react-draggable-hoc';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import Plugin from './Plugin/index.js';

import PedalsJSON from '../../repository/Pedals.json';
import css from './Pedalboard.scss';

const PedalboardHeader = ({ audioNode, setSelectedType }) => {
	const inputRef = useRef('0');

	const handleImport = (e) => {
		const file = e.target.files[0];
		const fileReader = new FileReader();
		fileReader.onloadend = () => {
			audioNode.clearPlugins();
			audioNode.setState(JSON.parse(fileReader.result));
		};
		fileReader.readAsText(file);
		e.target.value = '';
	};

	const handleExport = async () => {
		const pedalBoard = await audioNode.getState();
		download(JSON.stringify(pedalBoard), 'exports.json', 'text/plain');
	};

	return (
		<header className={css.Pedalboard_Header}>
			<h1>Pedalboard</h1>
			<div className={css.Pedalboard_Header_ContentButtonWrapper}>
				<button
					type="submit"
					className={css.Pedalboard_Header_ContentButtonWrapper_Import}
					onClick={() => {
						inputRef.current.click();
					}}
				>
					Importer
					<input
						style={{ display: 'none' }}
						ref={inputRef}
						type="file"
						accept=".json"
						onChange={(e) => handleImport(e)}
					/>
				</button>
				<button
					type="submit"
					className={css.Pedalboard_Header_ContentButtonWrapper_Export}
					onClick={handleExport}
				>
					Exporter
				</button>
				<select
					className={css.Pedalboard_Header_Selector}
					onChange={(e) => setSelectedType(e.target.value)}
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
			</div>
		</header>
	);
};

const PluginWrapper = SortableElement(({ plugin, onClickRemove }) => (
	<Plugin plugin={plugin} onClickRemove={onClickRemove} />
));

const PedalboardBoard = SortableContainer(({
	plugins,
	handleClickRemove,
}) => (
	<main className={css.PedalboardBoard} id="board">
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

const PedalboardSelector = ({ onClick, selectedType }) => (
	<>
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

	const onDrop = (pedal) => {
		audioNode.addPlugin(pedal.dragProps.url);
	};

	const onSortPlugin = ({ oldIndex, newIndex }) => {
		audioNode.swapPlugins(oldIndex, newIndex);
	};

	return (
		<DragDropContainer className="Simple-page-container">
			<section className={css.Pedalboard}>
				<PedalboardHeader
					className={css.Pedalboard_Header}
					audioNode={audioNode}
					setSelectedType={setSelectedType}
				/>
				<div className={css.Pedalboard_Body}>
					<PedalboardSelector
						onClick={handleClickThumbnail}
						audioNode={audioNode}
						selectedType={selectedType}
					/>
					<Droppable onDrop={onDrop}>
						{({ isHovered, ref, dragProps }) => (
							<div
								className={css.Pedalboard_Body_Content}
								ref={ref}
								style={{
									backgroundColor: isHovered ? 'rgba(0, 130, 20, 0.2)' : undefined,
									border: dragProps ? '1px dashed #ccc' : undefined,
								}}
							>
								<div
									className={css.Pedalboard_Body_Content_Board}
								>
									<PedalboardBoard
										pressDelay={200}
										axis="x"
										onSortEnd={onSortPlugin}
										plugins={plugins}
										handleClickRemove={handleClickRemove}
									/>
								</div>
							</div>
						)}
					</Droppable>
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
	selectedType: PropTypes.string.isRequired,
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
