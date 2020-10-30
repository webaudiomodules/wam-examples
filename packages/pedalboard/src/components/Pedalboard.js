import React, { useState, useEffect, useRef } from 'react';
import download from "downloadjs";
import { Draggable, DragDropContainer, Droppable } from "react-draggable-hoc";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';

import Plugin from './Plugin';

import PedalsJSON from '../../repository/Pedals.json';
import importIcon from '../../demo/public/import.png';
import exportIcon from '../../demo/public/export.png';
import css from './Pedalboard.scss';


const PedalboardHeader = () => (
	<header className={css.PedalboardHeader}>
		<h1>@wam/Pedalboard</h1>
	</header>
);

const PluginWrapper = SortableElement(({plugin, onClickRemove}) => <Plugin plugin={plugin} onClickRemove={onClickRemove} />);

const PedalboardBoard = SortableContainer(({
	plugins,
	handleClickRemove,
}) => {
	const sortedPlugins = plugins.sort((a, b) => a.position - b.position);
	return (
		<main className={css.PedalboardBoard}>
			{
				sortedPlugins.map((plugin, index) => {
					return (<PluginWrapper
						key={index}
						index={index}
						plugin={plugin}
						onClickRemove={handleClickRemove}
					/>);
				})
			}			
		</main>
	);
})

const PedalboardSelector = ({onClick, audioNode}) => {
	const inputRef = useRef("0");

	const handleImport = file => {
		const fileReader = new FileReader();
		fileReader.onloadend = () => {
			audioNode.clearPlugins();			
			audioNode.setState(JSON.parse(fileReader.result));
		}
		fileReader.readAsText(file);
	}

	const handleExport = async () => {
		const pedalBoard = await audioNode.getState();	
		download(JSON.stringify(pedalBoard), "exports.json", "text/plain");		
	}

	return (
		<>
			<div className={css.Pedalboard_contentButtonWrapper}>
				<button className={css.Button} onClick={() => {
					inputRef.current.click();
				}}>	
					<img src={importIcon} alt="importer" width="30px"/>	
					Importer						
					<input
						style={{display: "none"}}
						ref={inputRef}
						type="file"
						accept=".json"
						onChange={e => handleImport(e.target.files[0])}
					/>	
				</button>	

				<button className={css.Button} onClick={handleExport}>
					<img src={exportIcon} alt="exporter" width="30px"/>
					Exporter			
				</button>
			</div>	
			<aside className={css.PedalboardSelector}>
				{
					PedalsJSON?.length > 0 && PedalsJSON.map((pedal, index) => {
						return (						
							<Draggable key={index} dragProps={pedal} className={css.PedalboardSelectorCell}>
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
						);
					})
				}
			</aside>
		</>
	);
}

const Pedalboard = ({audioNode}) => {		
	const [plugins, setPlugins] = useState([]);	

	useEffect(() => {
		audioNode.addEventListener("onchange", handlePluginListChange);

		return () => {
			audioNode.removeEventListener("onchange", handlePluginListChange);
		}
	});

	const handlePluginListChange = (e) => {				
		setPlugins([...e.detail.pluginList]);		
	}

	const handleClickThumbnail = pluginUrl => {	
		audioNode.addPlugin(pluginUrl);		
	}

	const handleClickRemove = pluginID => {
		audioNode.removePlugin(pluginID);
	}

	const onDrop = pedal => {
		audioNode.addPlugin(pedal.dragProps.url);	
	};

	const onSortPlugin = ({oldIndex, newIndex}) => {
		audioNode.swapPlugins(oldIndex, newIndex);
	}

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
								backgroundColor: isHovered ? "rgba(0, 130, 20, 0.2)" : undefined,
								border: dragProps ? "1px dashed #ccc" : undefined
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
			
export default Pedalboard;
