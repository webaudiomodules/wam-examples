import { CompositeAudioNode, ParamMgrFactory } from 'sdk';

export default class PedalboardAudioNode extends CompositeAudioNode {

	constructor(audioContext, options) {
		super(audioContext, options);
		this.audioContext = audioContext;
		this.createNodes();
		this.pluginList = [];
		this.pluginID = 0;
	}

	createNodes() {
		this._input = this.context.createGain();
		super.connect(this._input);
		
		this._output = this.context.createGain();
		this._input.connect(this._output);
	}

	setState(pluginArray) {		
		pluginArray.length > 0 && pluginArray.forEach(plugin => {			
			this.addPlugin(plugin.url, plugin.params);
		});
	}

	async getState() {
		console.log("before save: ", this.pluginList);
		return await Promise.all(this.pluginList.map(async (plugin) => {			
			return {
				url: plugin.url,
				position: plugin.position,
				params: await plugin.instance.audioNode.getState()
			};
		}));
	}

	connectNewPlugin(newPlugin) {
		const newPluginIndex = this.pluginList.findIndex(plugin => plugin.id === newPlugin.id);
			
			//plugin est le premier
			if(newPluginIndex === 0 ){				
				this._input.disconnect();				
				this._input.connect(this.pluginList[newPluginIndex].instance.audioNode);				
				this.pluginList[newPluginIndex].instance.audioNode.connect(this._output);				
			}			
			//plugin est le dernier
			else if(newPluginIndex === this.pluginList.length - 1) {				
				this.pluginList[newPluginIndex - 1].instance.audioNode.disconnect();				
				this.pluginList[newPluginIndex - 1].instance.audioNode.connect(this.pluginList[newPluginIndex].instance.audioNode);				
				this.pluginList[newPluginIndex].instance.audioNode.connect(this._output);				
			}

			this.audioContext.resume();
	}

	async addPlugin(pluginURL, paramsConfig) {
		const { default: WAM } = await import(pluginURL);
		const instance = await WAM.createInstance(this.audioContext);
		
		if(paramsConfig !== undefined) {			
			//BUG: When we call setParamValue, only the GUI is updated, not the real values
			Object.keys(paramsConfig).forEach(param => {				
				try {
					instance.audioNode.setParamValue(param, paramsConfig[param].value);
				}catch(err){
					console.error("Error: ", err);
				}
			});
			console.log("DEBUUUG:", paramsConfig, instance.audioNode.getState());
		}				
		
		const newPlugin = {
			id: this.pluginID++,
			position: this.pluginList.length,
			url: pluginURL,
			instance
		};
		this.pluginList.push(newPlugin);
		this.connectNewPlugin(newPlugin);
		this.audioContext.resume();
		this.dispatchEvent(new CustomEvent("onchange", {detail: {pluginList: this.pluginList}}));
	}

	removePlugin(pluginID) {
		const deletedPluginIndex = this.pluginList.findIndex(plugin => plugin.id === pluginID);		

		//plugin = premier et dernier
		if(deletedPluginIndex === 0 && this.pluginList.length === 1){				
			this.pluginList[deletedPluginIndex].instance.audioNode.disconnect();				
			this._input.disconnect();				
			this._input.connect(this._output);				
		}
		//plugin = premier et pas dernier
		else if(deletedPluginIndex === 0 && this.pluginList.length > 1) {		
			this.pluginList[deletedPluginIndex].instance.audioNode.disconnect();
			this._input.disconnect();				
			this._input.connect(this.pluginList[deletedPluginIndex + 1].instance.audioNode);
		}
		//plugin = dernier
		else if(deletedPluginIndex === this.pluginList.length - 1) {				
			this.pluginList[deletedPluginIndex].instance.audioNode.disconnect();				
			this.pluginList[deletedPluginIndex - 1].instance.audioNode.disconnect();				
			this.pluginList[deletedPluginIndex - 1].instance.audioNode.connect(this._output);			
		}
		//plugin = middle
		else {				
			this.pluginList[deletedPluginIndex].instance.audioNode.disconnect();	
			this.pluginList[deletedPluginIndex - 1].instance.audioNode.disconnect();				
			this.pluginList[deletedPluginIndex - 1].instance.audioNode.connect(this.pluginList[deletedPluginIndex + 1].instance.audioNode);				
		}

		this.pluginList = this.pluginList.filter(plugin => plugin.id !== pluginID);
		this.dispatchEvent(new CustomEvent("onchange", {detail: {pluginList: this.pluginList}}));
	}

	shiftPluginPosition(from, to){
		if(from < to) {			
			this.pluginList.sort((a, b) => a.position - b.position).forEach(plugin => {
				if(plugin.position > from && plugin.position <= to) {
					plugin.position -= 1;					
				}else if(plugin.position === from) {					
					plugin.position = to;
				}
			});
		}else {
			this.pluginList.sort((a, b) => a.position - b.position).forEach(plugin => {
				if(plugin.position >= to && plugin.position < from) {
					plugin.position += 1;
				}else if(plugin.position === from) {
					plugin.position = to;
				}
			});
		}		
	}

	swapPlugins(oldIndex, newIndex) {		
		if(oldIndex === newIndex) return;

		this._input.disconnect();		

		this.pluginList.forEach(plugin => {
			plugin.instance.audioNode.disconnect();
		});
		
		//If we swap the plugins, we only have to swap their positions
		if(Math.abs(oldIndex - newIndex) === 1) {
			const newPos = this.pluginList[newIndex].position;
			this.pluginList[newIndex].position = this.pluginList[oldIndex].position;
			this.pluginList[oldIndex].position = newPos;
		}else {
			//Otherwise we have to shift the plugins
			this.shiftPluginPosition(oldIndex, newIndex);			
		}


		const pluginToConnect = this.pluginList.find(e => e.position === 0);		
		this._input.connect(pluginToConnect.instance.audioNode);
		console.log("INPUT CONNECTED to:", pluginToConnect.instance.name);

		
		this.pluginList.sort((a, b) => a.position - b.position).forEach((plugin, index) => {
			if(index === this.pluginList.length - 1) {
				plugin.instance.audioNode.connect(this._output);
				console.log("Plugin: ", plugin.instance.name, "connect to the output");
			}else {
				plugin.instance.audioNode.connect(this.pluginList[index + 1].instance.audioNode);
				console.log("Plugin: ", plugin.instance.name, " connected to: ", this.pluginList[index + 1].instance.name)
			}
		});
						
		this.dispatchEvent(new CustomEvent("onchange", {detail: {pluginList: this.pluginList}}));
	}

	clearPlugins() {
		this._input.disconnect();
		this._input.connect(this._output);
		this.pluginList = [];
		this.pluginID = 0;
		this.dispatchEvent(new CustomEvent("onchange", {detail: {pluginList: this.pluginList}}));
	}
}
