/* eslint-disable no-underscore-dangle */
/**
 * @typedef {import('sdk').WamNode} IWamNode
 * @typedef {import('sdk').WebAudioModule} WebAudioModule
 * @typedef {import('./PedalboardAudioNode').default} PedalboardAudioNode
 * @typedef {import('sdk/src/api/types').WamParameterInfoMap} WamParameterInfoMap
 * @typedef {import('sdk/src/api/types').WamParameterDataMap} WamParameterDataMap
 * @typedef {import('sdk/src/api/types').WamEvent} WamEvent
 * @typedef {import('sdk/src/api/types').WamEventMap} WamEventMap
 * @typedef {import('sdk/src/api/types').WamEventType} WamEventType
 * @typedef {import('sdk/src/api/types').WamParameterInfoEvent} WamParameterInfoEvent
 * @typedef {import('sdk/src/api/types').WamParameterConfiguration} WamParameterConfiguration
 */
//@ts-check
import { WamParameterInfo } from 'sdk';
/**
 * @implements {IWamNode}
 * @implements {AudioWorkletNode}
 */
export default class WamNode extends AudioWorkletNode {
	/**
	 * @param {WebAudioModule} module
	 * @param {PedalboardAudioNode} pedalboardNode
	 */
	constructor(module, pedalboardNode) {
		const { audioContext, moduleId, instanceId } = module;
		const pluginList = pedalboardNode.pluginList.map((p) => p.instance.instanceId);
		const options = {
			processorOptions: {
				moduleId,
				instanceId,
				pluginList,
			},
		};
		super(audioContext, moduleId, options);

		/** @type {WebAudioModule} */
		this.module = module;
		/** @type {PedalboardAudioNode} */
		this.pedalboardNode = pedalboardNode;
		/** @type {{ instanceId: string; parameterId: string }[]} */
		this._parameterInfoMap = [];
		/** @type {Record<number, ((...args: any[]) => any)>} */
		this._resolves = {};
		/** @type {Record<number, ((...args: any[]) => any)>} */
		this._rejects = {};
		this._messageRequestId = 0;
		/**
		 * @param {string} call
		 * @param {any} args
		 */
		this._call = (call, ...args) => {
			const id = this._messageRequestId;
			this._messageRequestId += 1;
			return new Promise((resolve, reject) => {
				this._resolves[id] = resolve;
				this._rejects[id] = reject;
				this.port.postMessage({ id, call, args });
			});
		};
		this._handleMessage = ({ data }) => {
			// eslint-disable-next-line object-curly-newline
			const { id, call, args, value, error } = data;
			if (call) {
				/** @type {any} */
				const r = { id };
				try {
					r.value = this[call](...args);
				} catch (e) {
					r.error = e;
				}
				this.port.postMessage(r);
			} else {
				if (error) {
					if (this._rejects[id]) this._rejects[id](error);
					delete this._rejects[id];
					return;
				}
				if (this._resolves[id]) {
					this._resolves[id](value);
					delete this._resolves[id];
				}
			}
		};

		this.port.start();
		this.port.addEventListener('message', this._handleMessage);

		/**
		 * @param {CustomEvent<{ pluginList: PedalboardAudioNode['pluginList'] }>} e
		 */
		this.handlePedalboardChange = async (e) => {
			const workletPluginList = e.detail.pluginList.map((p) => p.instance.instanceId);
			this._parameterInfoMap = [];
			// eslint-disable-next-line no-restricted-syntax
			for (const { instance } of this.pedalboardNode.pluginList) {
				// eslint-disable-next-line no-shadow
				const { instanceId } = instance;
				// eslint-disable-next-line no-await-in-loop
				const parameterInfo = await instance.audioNode.getParameterInfo();
				Object.keys(parameterInfo).forEach((parameterId) => {
					this._parameterInfoMap.push({ instanceId, parameterId });
				});
			}
			const parameterInfo = await this.getParameterInfo();
			const parameterIds = Object.keys(parameterInfo);
			await this._call('updatePluginList', workletPluginList);
			await this._call('updateParameterInfo', parameterIds);
			/** @type {CustomEvent<WamParameterInfoEvent>} */
			const wamParameterInfoEvent = new CustomEvent('wam-parameter-info', { detail: { type: 'wam-parameter-info', data: parameterIds, time: this.context.currentTime } });
			this.pedalboardNode.dispatchEvent(wamParameterInfoEvent);
		};
		this.pedalboardNode.addEventListener('change', this.handlePedalboardChange);
	}

	get moduleId() { return this.module.moduleId; }

	get instanceId() { return this.module.instanceId; }

	get processorId() { return this.moduleId; }

	/**
	 * @param {string[]} parameterIds
	 * @returns {Promise<WamParameterInfoMap>}
	 */
	async getParameterInfo(...parameterIds) {
		const ids = parameterIds.length ? parameterIds : Object.keys(this._parameterInfoMap);
		/** @type {WamParameterInfoMap} */
		const map = {};
		await Promise.all(ids.map(async ($parameterId, i) => {
			const { instanceId, parameterId } = this._parameterInfoMap[$parameterId];
			const { instance: plugin } = this.pedalboardNode.pluginList
				.find(({ instance }) => instance.instanceId === instanceId);
			if (plugin) {
				const parameterInfo = await plugin.audioNode.getParameterInfo(parameterId);
				map[$parameterId] = new WamParameterInfo(i.toString(), parameterInfo[parameterId]);
			}
		}));
		return map;
	}

	/**
	 * @param {boolean} normalized
	 * @param {string[]} parameterIds
	 * @returns {Promise<WamParameterDataMap>}
	 */
	async getParameterValues(normalized, ...parameterIds) {
		/** @type {WamParameterDataMap} */
		const map = {};
		await Promise.all(parameterIds.map(async ($parameterId) => {
			const { instanceId, parameterId } = this._parameterInfoMap[$parameterId];
			const { instance: plugin } = this.pedalboardNode.pluginList
				.find(({ instance }) => instance.instanceId === instanceId);
			if (plugin) {
				const parameterValues = await plugin.audioNode.getParameterValues(normalized, parameterId);
				map[$parameterId] = parameterValues[parameterId];
			}
		}));
		return map;
	}

	/**
	 * @param {WamParameterDataMap} parameterValues
	 * @returns {Promise<void>}
	 */
	async setParameterValues(parameterValues) {
		await Promise.all(
			Object.entries(parameterValues).map(async ([$parameterId, { normalized, value }]) => {
				const { instanceId, parameterId } = this._parameterInfoMap[$parameterId];
				const { instance: plugin } = this.pedalboardNode.pluginList
					.find(({ instance }) => instance.instanceId === instanceId);
				if (plugin) {
					const map = { [parameterId]: { id: parameterId, value, normalized } };
					await plugin.audioNode.setParameterValues(map);
				}
			}),
		);
	}

	/**
	 * @param {{ url: string, params: Record<string, number> }[]} pluginArray
	 */
	async setState(pluginArray) {
		this.pedalboardNode.clearPlugins();
		// eslint-disable-next-line no-restricted-syntax
		for (const plugin of pluginArray) {
			// eslint-disable-next-line no-await-in-loop
			await this.pedalboardNode.addPlugin(plugin.url, plugin.params);
		}
	}

	async getState() {
		return Promise.all(this.pedalboardNode.pluginList.map(async (plugin) => (
			{
				url: plugin.url,
				params: await plugin.instance.audioNode.getState(),
			}
		)));
	}

	async getCompensationDelay() {
		let delay = 0;
		await Promise.all(this.pedalboardNode.pluginList.map(async (plugin) => {
			delay += await plugin.instance.audioNode.getCompensationDelay();
		}));
		return delay;
	}

	/**
	 * @param {WamEvent[]} events
	 */
	scheduleEvents(...events) {
		if (this.pedalboardNode.pluginList.length) {
			this.pedalboardNode.pluginList[0].instance.audioNode.scheduleEvents(...events);
		}
	}

	clearEvents() {
		if (this.pedalboardNode.pluginList.length) {
			this.pedalboardNode.pluginList[0].instance.audioNode.clearEvents();
		}
	}

	/**
	 * @param {IWamNode} to
	 * @param {number} [output]
	 */
	connectEvents(to, output) {
		if (this.pedalboardNode.pluginList.length) {
			const last = this.pedalboardNode.pluginList[this.pedalboardNode.pluginList.length - 1];
			last.instance.audioNode.connectEvents(to, output);
		}
	}

	/**
	 * @param {IWamNode} [to]
	 * @param {number} [output]
	 */
	disconnectEvents(to, output) {
		if (this.pedalboardNode.pluginList.length) {
			const last = this.pedalboardNode.pluginList[this.pedalboardNode.pluginList.length - 1];
			last.instance.audioNode.connectEvents(to, output);
		}
	}

	async destroy() {
		this.disconnect();
		this.pedalboardNode.removeEventListener('change', this.handlePedalboardChange);
		await this._call('destroy');
		this.port.close();
	}
}
