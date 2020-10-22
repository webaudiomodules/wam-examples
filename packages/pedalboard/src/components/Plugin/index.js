import React, { useEffect, useRef } from 'react';

import crossIcon from '../../../demo/public/cross.png';

import css from './index.scss';

const Plugin = ({
	plugin,	
	onClickRemove,
}) => {	
	const plugginWrapperRef = useRef(plugin.id);

	useEffect(() => {		
		(async () => {
			const createGui = async () => {					
				return await plugin.instance.createGui();				
			}			
			const pluginGui = await createGui();									
			
			plugginWrapperRef.current.appendChild(pluginGui);		
		})();
	}, [plugin, plugginWrapperRef]);
		

    return (
        <div className={css.PluginContainer}>
            <div className={css.Plugin} ref={plugginWrapperRef}/>            
            <img className={css.PluginIcon} src={crossIcon} onClick={() => onClickRemove(plugin.id)}/>
        </div> 
    );
}

export default Plugin;