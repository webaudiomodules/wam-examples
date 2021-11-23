//@ts-check
import { CompositeAudioNode } from '@webaudiomodules/sdk-parammgr';
import WamNode from './WamNode.js';
/**
 * @typedef {import('@webaudiomodules/sdk').WebAudioModule} WebAudioModule
 * @typedef {{ id: any; url: string; instance: WebAudioModule }} Plugin
 */

export default class PedalboardAudioNode extends CompositeAudioNode {
	/** @type {WamNode} */
	_wamNode;
	/**
	 * @param {WebAudioModule} module
	 * @param {GainOptions} [options]
	 */
	constructor(module, options) {
		super(module.audioContext, options);
		/** @type {WebAudioModule} */
		this._module = module;

		/** @type {Plugin[]} */
		this.pluginList = [];
		this.pluginID = 0;
		this.createNodes();
	}

	createNodes() {
		this._wamNode = new WamNode(this._module, this);
		this._input = this.context.createGain();
		super.connect(this._input);
		this._output = this.context.createGain();
		this._input.connect(this._output);
	}

	/** @param {Plugin} newPlugin */
	connectNewPlugin(newPlugin) {
		if (this.pluginList.length === 1) {
			this._input.disconnect();
			this._input.connect(newPlugin.instance.audioNode);
			this._wamNode.selfConnectEvents(newPlugin.instance.instanceId);
			newPlugin.instance.audioNode.connect(this._output);
			console.warn('INPUT connectd to: ', newPlugin.instance.name);
			console.warn(newPlugin.instance.name, 'connect to: OUTPUT');
		} else {
			const previousPlugin = this.pluginList[this.pluginList.length - 2];
			previousPlugin.instance.audioNode.disconnect();
			previousPlugin.instance.audioNode.connect(newPlugin.instance.audioNode);
			previousPlugin.instance.audioNode.connectEvents(newPlugin.instance.instanceId);
			newPlugin.instance.audioNode.connect(this._output);
			console.warn(previousPlugin.instance.name, 'connect to: ', newPlugin.instance.name);
			console.warn(newPlugin.instance.name, 'connect to: OUTPUT');
		}
	}

	async addPlugin(pluginURL, paramsConfig) {
		console.log('ADDING: ', pluginURL);
		let instance;
		try {
			const { default: WAM } = await import(pluginURL);
			instance = await WAM.createInstance(this.context);
		} catch (e) {
			console.error(`Error while importing: "${pluginURL}"`);
			console.error(e);
			return;
		}
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
		this.dispatchEvent(new CustomEvent('change', { detail: { pluginList: this.pluginList } }));
	}

	/** @param {string} pluginID */
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
			this._wamNode.selfDisconnectEvents(deletedPlugin.instance.instanceId);
			deletedPlugin.instance.audioNode.disconnect();
			deletedPlugin.instance.audioNode.disconnectEvents();
			console.warn('INPUT connected to: OUTPUT');
		} else if (deletedPluginIndex === 0) {
			this._input.disconnect();
			this._wamNode.selfDisconnectEvents(deletedPlugin.instance.instanceId);
			deletedPlugin.instance.audioNode.disconnect();
			deletedPlugin.instance.audioNode.disconnectEvents();
			this._input.connect(nextPlugin.instance.audioNode);
			this._wamNode.selfConnectEvents(nextPlugin.instance.instanceId);
			console.warn('INPUT connected to: ', nextPlugin.instance.name);
		} else if (deletedPluginIndex === this.pluginList.length - 1) {
			deletedPlugin.instance.audioNode.disconnect();
			deletedPlugin.instance.audioNode.disconnectEvents();
			previousPlugin.instance.audioNode.disconnect();
			previousPlugin.instance.audioNode.disconnectEvents();
			previousPlugin.instance.audioNode.connect(this._output);
			console.warn(previousPlugin.instance.name, 'connect to: OUTPUT');
		} else {
			deletedPlugin.instance.audioNode.disconnect();
			deletedPlugin.instance.audioNode.disconnectEvents();
			previousPlugin.instance.audioNode.disconnect();
			previousPlugin.instance.audioNode.disconnectEvents();
			previousPlugin.instance.audioNode.connect(nextPlugin.instance.audioNode);
			previousPlugin.instance.audioNode.connectEvents(nextPlugin.instance.instanceId);
			console.warn(previousPlugin.instance.name, 'connect to: ', nextPlugin.instance.name);
		}
		deletedPlugin.instance.audioNode.destroy();

		this.pluginList = this.pluginList.filter((plugin) => plugin.id !== pluginID);
		this.dispatchEvent(new CustomEvent('change', { detail: { pluginList: this.pluginList } }));
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
		if (this.pluginList[0]) this._wamNode.selfDisconnectEvents(this.pluginList[0].instance.instanceId);

		this.pluginList.forEach((plugin) => {
			plugin.instance.audioNode.disconnect();
			plugin.instance.audioNode.disconnectEvents();
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
		this._wamNode.selfConnectEvents(this.pluginList[0].instance.instanceId);
		console.warn('INPUT CONNECTED to:', this.pluginList[0].instance.name);

		this.pluginList.forEach((plugin, index) => {
			if (index === this.pluginList.length - 1) {
				plugin.instance.audioNode.connect(this._output);
				console.warn(plugin.instance.name, 'connect to the output');
			} else {
				plugin.instance.audioNode.connect(this.pluginList[index + 1].instance.audioNode);
				plugin.instance.audioNode.connectEvents(this.pluginList[index + 1].instance.instanceId);
				console.warn(plugin.instance.name, ' connected to: ', this.pluginList[index + 1].instance.name);
			}
		});

		this.dispatchEvent(new CustomEvent('change', { detail: { pluginList: this.pluginList } }));
	}

	clearPlugins() {
		this._input.disconnect();
		if (this.pluginList[0]) this._wamNode.selfDisconnectEvents(this.pluginList[0].instance.instanceId);
		this._input.connect(this._output);
		this.pluginList.forEach(({ instance }) => instance.audioNode.destroy());
		this.pluginList = [];
		this.pluginID = 0;
		this.dispatchEvent(new CustomEvent('change', { detail: { pluginList: this.pluginList } }));
	}

	destroy() {
		this.clearPlugins();
		super.destroy();
	}
}
