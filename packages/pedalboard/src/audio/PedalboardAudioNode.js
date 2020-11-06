/* eslint-disable no-underscore-dangle */
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
		pluginArray.reduce(async (memo, plugin) => {
			await memo;
			return this.addPlugin(plugin.url, plugin.params);
		}, []);
	}

	async getState() {
		return Promise.all(this.pluginList.map(async (plugin) => (
			{
				url: plugin.url,
				params: await plugin.instance.audioNode.getState(),
			}
		)));
	}

	connectNewPlugin(newPlugin) {
		if (this.pluginList.length === 1) {
			this._input.disconnect();
			this._input.connect(newPlugin.instance.audioNode);
			newPlugin.instance.audioNode.connect(this._output);
			console.warn('INPUT connectd to: ', newPlugin.instance.name);
			console.warn(newPlugin.instance.name, 'connect to: OUTPUT');
		} else {
			const previousPlugin = this.pluginList[this.pluginList.length - 2];
			previousPlugin.instance.audioNode.disconnect();
			previousPlugin.instance.audioNode.connect(newPlugin.instance.audioNode);
			newPlugin.instance.audioNode.connect(this._output);
			console.warn(previousPlugin.instance.name, 'connect to: ', newPlugin.instance.name);
			console.warn(newPlugin.instance.name, 'connect to: OUTPUT');
		}
	}

	async addPlugin(pluginURL, paramsConfig) {
		console.log('ADDING: ', pluginURL);
		const { default: WAM } = await import(pluginURL);
		const instance = await WAM.createInstance(this.audioContext);

		if (paramsConfig !== undefined) {
			instance.audioNode.setState(paramsConfig);
		}

		const newPlugin = {
			id: this.pluginID,
			url: pluginURL,
			instance,
		};
		this.pluginID += 1;

		this.pluginList.push(newPlugin);
		this.connectNewPlugin(newPlugin);
		this.dispatchEvent(new CustomEvent('onchange', { detail: { pluginList: this.pluginList } }));
	}

	removePlugin(pluginID) {
		const deletedPluginIndex = this.pluginList.findIndex((plugin) => plugin.id === pluginID);
		const nextPluginIndex = deletedPluginIndex + 1;
		const previousPluginIndex = deletedPluginIndex - 1;

		const deletedPlugin = this.pluginList[deletedPluginIndex];
		const nextPlugin = this.pluginList[nextPluginIndex];
		const previousPlugin = this.pluginList[previousPluginIndex];

		if (deletedPluginIndex === 0 && this.pluginList.length === 1) {
			this._input.disconnect();
			this._input.connect(this._output);
			deletedPlugin.instance.audioNode.disconnect();
			console.warn('INPUT connected to: OUTPUT');
		} else if (deletedPluginIndex === 0) {
			this._input.disconnect();
			deletedPlugin.instance.audioNode.disconnect();
			this._input.connect(nextPlugin.instance.audioNode);
			console.warn('INPUT connected to: ', nextPlugin.instance.name);
		} else if (deletedPluginIndex === this.pluginList.length - 1) {
			deletedPlugin.instance.audioNode.disconnect();
			previousPlugin.instance.audioNode.disconnect();
			previousPlugin.instance.audioNode.connect(this._output);
			console.warn(previousPlugin.instance.name, 'connect to: OUTPUT');
		} else {
			deletedPlugin.instance.audioNode.disconnect();
			previousPlugin.instance.audioNode.disconnect();
			previousPlugin.instance.audioNode.connect(nextPlugin.instance.audioNode);
			console.warn(previousPlugin.instance.name, 'connect to: ', nextPlugin.instance.name);
		}

		this.pluginList = this.pluginList.filter((plugin) => plugin.id !== pluginID);
		this.dispatchEvent(new CustomEvent('onchange', { detail: { pluginList: this.pluginList } }));
	}

	shiftPluginPosition(from, to) {
		if (from < to) {
			for (let i = from; i < to; i += 1) {
				const temp = this.pluginList[i + 1];
				this.pluginList[i + 1] = this.pluginList[i];
				this.pluginList[i] = temp;
			}
		} else {
			for (let i = from; i > to; i -= 1) {
				const temp = this.pluginList[i - 1];
				this.pluginList[i - 1] = this.pluginList[i];
				this.pluginList[i] = temp;
			}
		}
	}

	swapPlugins(oldIndex, newIndex) {
		if (oldIndex === newIndex) return;

		this._input.disconnect();

		this.pluginList.forEach((plugin) => {
			plugin.instance.audioNode.disconnect();
		});

		//If we swap the plugins, we only have to swap their positions
		if (Math.abs(oldIndex - newIndex) === 1) {
			const temp = this.pluginList[newIndex];
			this.pluginList[newIndex] = this.pluginList[oldIndex];
			this.pluginList[oldIndex] = temp;
		} else {
			//Otherwise we have to shift the plugins
			this.shiftPluginPosition(oldIndex, newIndex);
		}

		this._input.connect(this.pluginList[0].instance.audioNode);
		console.warn('INPUT CONNECTED to:', this.pluginList[0].instance.name);

		this.pluginList.forEach((plugin, index) => {
			if (index === this.pluginList.length - 1) {
				plugin.instance.audioNode.connect(this._output);
				console.warn(plugin.instance.name, 'connect to the output');
			} else {
				plugin.instance.audioNode.connect(this.pluginList[index + 1].instance.audioNode);
				console.warn(plugin.instance.name, ' connected to: ', this.pluginList[index + 1].instance.name);
			}
		});

		this.dispatchEvent(new CustomEvent('onchange', { detail: { pluginList: this.pluginList } }));
	}

	clearPlugins() {
		this._input.disconnect();
		this._input.connect(this._output);
		this.pluginList = [];
		this.pluginID = 0;
		this.dispatchEvent(new CustomEvent('onchange', { detail: { pluginList: this.pluginList } }));
	}
}
