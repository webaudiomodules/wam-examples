import React, { useState, useEffect } from 'react';
import download from "downloadjs";

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

const PedalboardBoard = ({
	plugins,
	handleClickRemove,
}) => {		
	return (
		<main className={css.PedalboardBoard}>
			{
				plugins?.length > 0 && plugins.map((plugin) => {	
					console.log(plugin)				
					return (
						<Plugin
							plugin={plugin}
							key={plugin.id}
							onClickRemove={handleClickRemove}				
						/>
					)
				})
			}
		</main>
	);
}

const PedalboardSelector = ({onClick}) => (
	<aside className={css.PedalboardSelector}>
		{
			PedalsJSON?.length > 0 && PedalsJSON.map(pedal => {
				return (
					<img
						src={`/packages/pedalboard/demo/public/${pedal.thumbnail}`}
						width="80"
						height="80"
						alt={`image_pedale_${pedal.url}`}
						key={pedal.url}
						className={css.PedalboardSelectorThumbnail}
						onClick={() => onClick(pedal.url)}
					/>
				);
			})
		}
	</aside>
);

const Pedalboard = ({audioNode}) => {		
	const [plugins, setPlugins] = useState([]);

	useEffect(() => {
		audioNode.addEventListener("onchange", handlePluginListChange);

		return () => {
			audioNode.removeEventListener("onchange", handlePluginListChange);
		}
	});

	const handlePluginListChange = (e) => {		
		setPlugins([...e.detail.pluginList])	
	}

	const handleClickThumbnail = pluginUrl => {	
		audioNode.addPlugin(pluginUrl);		
	}

	const handleClickRemove = pluginID => {
		audioNode.removePlugin(pluginID);
	}

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
		<section className={css.Pedalboard}>						
			<PedalboardHeader />
			<div className={css.Pedalboard_content}>
				<PedalboardBoard
					plugins={plugins}
					handleClickRemove={handleClickRemove}							
				/>
				<div>
					<label className={css.Pedalboard_contentButton}>	
						<img src={importIcon} alt="importer" width="30px"/>	
						<p>Importer</p>						
						<input style={{visibility: "hidden"}} type="file"  accept=".json" onChange={e => handleImport(e.target.files[0])} />	
					</label>	

					<button className={css.Button} onClick={handleExport}>
						<img src={exportIcon} alt="exporter" width="30px"/>
						Exporter				
					</button>	
					<PedalboardSelector onClick={handleClickThumbnail} />
				</div>								
			</div>
		</section>			
	);
};

export default Pedalboard;
