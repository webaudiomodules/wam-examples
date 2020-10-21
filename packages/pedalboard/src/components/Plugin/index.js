import React, { useEffect } from 'react';

import crossIcon from '../../../demo/public/cross.png';

import css from './index.scss';

const Plugin = ({
	pluginUrl,
	audioContext,
	id,
	onClickRemove, 	
	setInstances,
	paramsConfig, 
}) => {	
	useEffect(() => {			
		(async () => {
			const loadAndCreatePlugin = async () => {
				const { default: WAM } = await import(pluginUrl);
				const instance = await WAM.createInstance(audioContext);
				
				if(Object.keys(paramsConfig).length !== 0) {
					instance.audioNode.setState(paramsConfig);
				}				
				const domNode = await instance.createGui();
				return {instance, domNode};
			}			

			const plugin = await loadAndCreatePlugin();				
			setInstances({instance: plugin.instance, id});		

			document.querySelector(`#pedal-${id}`).appendChild(plugin.domNode);		
		})();
	}, [pluginUrl]);	

    return (
        <div className={css.PluginContainer}>
            <div className={css.Plugin} id={`pedal-${id}`}/>            
            <img className={css.PluginIcon} src={crossIcon} onClick={() => onClickRemove(id)}/>
        </div> 
    );
}

export default Plugin;