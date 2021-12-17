/**
 * @typedef {import('@webaudiomodules/api').WamNode} IWamNode
 * @typedef {import('@webaudiomodules/sdk').WebAudioModule} WebAudioModule
 * @typedef {import('@webaudiomodules/api').WamParameterInfo} WamParameterInfo
 * @typedef {import('@webaudiomodules/api').WamParameterInfoMap} WamParameterInfoMap
 * @typedef {import('@webaudiomodules/api').WamParameterDataMap} WamParameterDataMap
 * @typedef {import('@webaudiomodules/api').WamEvent} WamEvent
 * @typedef {import('@webaudiomodules/api').WamEventMap} WamEventMap
 * @typedef {import('@webaudiomodules/api').WamEventType} WamEventType
 * @typedef {import('@webaudiomodules/api').WamInfoEvent} WamInfoEvent
 * @typedef {import('@webaudiomodules/api').WamParameterConfiguration} WamParameterConfiguration
 */
//@ts-check

/**
 * @implements {IWamNode}
 * @implements {AudioWorkletNode}
 */
export default class WamEventDestinationNode extends AudioWorkletNode {
	/**
	 * @param {WebAudioModule} module
	 */
	constructor(module) {
		const { audioContext, moduleId, instanceId, groupId } = module;
		const options = {
			processorOptions: { moduleId, instanceId, groupId },
		};
		super(audioContext, moduleId, options);
		/** @type {WebAudioModule} */
		this.module = module;
        
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

    }
	get groupId() { return this.module.groupId; }

	get moduleId() { return this.module.moduleId; }

	get instanceId() { return this.module.instanceId; }

	/**
	 * @param {string[]} parameterIds
	 * @returns {Promise<WamParameterInfoMap>}
	 */
    async getParameterInfo(...parameterIds) {
		return {};
	}

	/**
	 * @param {boolean} normalized
	 * @param {string[]} parameterIds
	 * @returns {Promise<WamParameterDataMap>}
	 */
	async getParameterValues(normalized, ...parameterIds) {
		return {};
	}

	/**
	 * @param {WamParameterDataMap} parameterValues
	 * @returns {Promise<void>}
	 */
	async setParameterValues(parameterValues) {
	}

	/**
	 * @param {any} state
	 */
    async setState(state) {
	}

	async getState() {
		return undefined;
	}

	async getCompensationDelay() {
		return 0;
	}

	/**
	 * @param {WamEvent[]} events
	 */
    scheduleEvents(...events) {
	}

	clearEvents() {
	}

	/**
	 * @param {string} toId
	 * @param {number} [output]
	 */
	connectEvents(toId, output) {
	}

	/**
	 * @param {string} [toId]
	 * @param {number} [output]
	 */
    disconnectEvents(toId, output) {
	}

	async destroy() {
		this.disconnect();
		await this._call('destroy');
		this.port.close();
	}
}
