import React, { useState } from 'react';
import download from "downloadjs";

import Plugin from './Plugin';

import PedalsJSON from '../../repository/Pedals.json';
import importIcon from '../../demo/public/import.png';
import exportIcon from '../../demo/public/export.png';
import css from './Pedalboard.scss';

var pluginNumber = 0;

const PedalboardHeader = () => (
	<header className={css.PedalboardHeader}>
		<h1>@wam/Pedalboard</h1>
	</header>
);

const PedalboardBoard = ({
	plugins,
	handleClickRemove,
	setInstances,
	audioContext,
	audioNode
}) => {		
	return (
		<main className={css.PedalboardBoard}>
			{
				plugins?.length > 0 && plugins.map((plugin) => {					
					return (
						<Plugin
							id={plugin.id}
							key={plugin.id}
							pluginUrl={plugin.url}
							onClickRemove={handleClickRemove}
							audioContext={audioContext}	
							setInstances={setInstances}
							paramsConfig={plugin.params || {}}					
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

const Pedalboard = ({audioContext, audioNode}) => {		
	const [plugins, setPlugins] = useState([]);
	const [instances, setInstances] = useState([]);	

	const handleClickThumbnail = pluginUrl => {		
		setPlugins([...plugins, {url: pluginUrl, id: pluginNumber++}]);				
	}

	const handleClickRemove = pluginID => {			
		setPlugins(prevState => prevState.filter(plugin => plugin.id !== pluginID));	
		setInstances(prevState => {//disconect 
	
			const deletedPluginIndex = prevState.findIndex(plugin => plugin.id === pluginID);		

			//plugin = premier et dernier
			if(deletedPluginIndex === 0 && prevState.length === 1){				
				prevState[deletedPluginIndex].instance.audioNode.disconnect();				
				audioNode._input.disconnect();				
				audioNode._input.connect(audioNode._output);				
			}
			//plugin = premier et pas dernier
			else if(deletedPluginIndex === 0 && prevState.length > 1) {		
				prevState[deletedPluginIndex].instance.audioNode.disconnect();
				audioNode._input.disconnect();				
				audioNode._input.connect(prevState[deletedPluginIndex + 1].instance.audioNode);
			}
			//plugin = dernier
			else if(deletedPluginIndex === prevState.length - 1) {				
				prevState[deletedPluginIndex].instance.audioNode.disconnect();				
				prevState[deletedPluginIndex - 1].instance.audioNode.disconnect();				
				prevState[deletedPluginIndex - 1].instance.audioNode.connect(audioNode._output);			
			}
			//plugin = middle
			else {				
				prevState[deletedPluginIndex].instance.audioNode.disconnect();	
				prevState[deletedPluginIndex - 1].instance.audioNode.disconnect();				
				prevState[deletedPluginIndex - 1].instance.audioNode.connect(prevState[deletedPluginIndex + 1].instance.audioNode);				
			}

			return prevState.filter(instance => instance.id !== pluginID);

		});
	}

	const handleInstanceCreated = newPlugin => {	
		setInstances(prevState => {			
			const newState = [...prevState, newPlugin];
			
			const newPluginIndex = newState.findIndex(plugin => plugin.id === newPlugin.id);
			
			//plugin est le premier
			if(newPluginIndex === 0 ){				
				audioNode._input.disconnect();				
				audioNode._input.connect(newState[newPluginIndex].instance.audioNode);				
				newState[newPluginIndex].instance.audioNode.connect(audioNode._output);				
			}			
			//plugin est le dernier
			else if(newPluginIndex === newState.length - 1) {				
				newState[newPluginIndex - 1].instance.audioNode.disconnect();				
				newState[newPluginIndex - 1].instance.audioNode.connect(newState[newPluginIndex].instance.audioNode);				
				newState[newPluginIndex].instance.audioNode.connect(audioNode._output);				
			}

			audioContext.resume();

			return newState;
		});
	}

	const handleImport = file => {
		const fileReader = new FileReader();
		fileReader.onloadend = () => {
			const parsedContent = JSON.parse(fileReader.result);
			const mappedContent = parsedContent.map(plugin => {
				return {
					url: plugin.url,
					params: plugin.params,
					id: pluginNumber++
				}
			});
			setPlugins(mappedContent);
			setInstances([]);	

			audioNode._input.disconnect();
			audioNode._input.connect(audioNode._output);
		}
		fileReader.readAsText(file);
	}

	const handleExport = async () => {
		const pedalBoard = await Promise.all(instances.map(async (plugin, index) => {
			return {
				url: plugins[index].url,
				params: await plugin.instance.audioNode.getState()
			};
		}));		
		download(JSON.stringify(pedalBoard), "exports.json", "text/plain");		
	}

	return (
		<>
			<section className={css.Pedalboard}>						
				<PedalboardHeader />
				<div className={css.Pedalboard_content}>
					<PedalboardBoard
						plugins={plugins}
						handleClickRemove={handleClickRemove}	
						setInstances={handleInstanceCreated}
						audioNode={audioNode}
						audioContext={audioContext}	
					/>
					<PedalboardSelector onClick={handleClickThumbnail} />
				</div>
			</section>
			<img src={importIcon} alt="importer" width="30px"/>							
			<input type="file"  accept=".json" onChange={e => handleImport(e.target.files[0])} />										
			<button className={css.Button} onClick={handleExport}>
				<img src={exportIcon} alt="exporter" width="30px"/>
				Exporter				
			</button>	
		</>
	);
};

export default Pedalboard;
