import { CompositeAudioNode } from 'sdk';

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
		return await Promise.all(this.pluginList.map(async (plugin) => {
			return {
				url: plugin.url,
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
			instance.audioNode.setState(paramsConfig);
		}				
		
		const newPlugin = {
			id: this.pluginID++,
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

	clearPlugins() {
		this._input.disconnect();
		this._input.connect(this._output);
		this.pluginList = [];
		this.pluginID = 0;
		this.dispatchEvent(new CustomEvent("onchange", {detail: {pluginList: this.pluginList}}));
	}
}
