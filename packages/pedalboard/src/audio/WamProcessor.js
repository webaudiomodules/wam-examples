/**
 * @typedef {import('@webaudiomodules/api').WamProcessor} IWamProcessor
 * @typedef {import('@webaudiomodules/api').WamNodeOptions} WamNodeOptions
 * @typedef {import('@webaudiomodules/api').WamParameterInfoMap} WamParameterInfoMap
 * @typedef {import('@webaudiomodules/api').WamEvent} WamEvent
 * @typedef {import('@webaudiomodules/api').WamInfoData} WamInfoData
 * @typedef {import('@webaudiomodules/sdk').WamGroup} WamGroup
 * @typedef {import('@webaudiomodules/sdk-parammgr/src/TypedAudioWorklet').AudioWorkletGlobalScope} AudioWorkletGlobalScope
 * @typedef {InstanceType<ReturnType<import('./WamEventDestinationProcessor').default>>} WamEventDestinationProcessor
 */
//@ts-check

/**
 * @param {string} groupId
 * @param {string} moduleId
 */
const processor = (groupId, moduleId) => {
	/** @type {AudioWorkletGlobalScope} */
	// @ts-ignore
	// eslint-disable-next-line no-undef
	const audioWorkletGlobalScope = globalThis;
	const { AudioWorkletProcessor, registerProcessor, webAudioModules } = audioWorkletGlobalScope;

	/**
	 * @implements {IWamProcessor}
	 */
	class WamProcessor extends AudioWorkletProcessor {
		/**
		 * @param {Omit<AudioWorkletNodeOptions, 'processorOptions'>
		 * & { processorOptions: WamNodeOptions & { pluginList: string[]; subgroupKey: string; destinationId: string } }} options
		 */
		constructor(options) {
			super(options);
			this.destroyed = false;
			const { instanceId, pluginList, subgroupKey, destinationId } = options.processorOptions;
			this.groupId = groupId;
			this.moduleId = moduleId;
			this.instanceId = instanceId;
			/** @type {WamEvent[]} */
			this.eventQueue = [];
			/** @type {string[]} */
			this.pluginList = [];
			/** @type {Map<IWamProcessor, Set<IWamProcessor>[]>} */
			this._eventGraph = new Map();
			/** @type {Record<string, IWamProcessor>} */
			this._processors = {};

			audioWorkletGlobalScope.webAudioModules.addWam(this);
			/** @type {WamGroup} */
			// @ts-ignore
			this.subgroup = webAudioModules.getGroup(this.instanceId, subgroupKey);

			/** @type {WamEventDestinationProcessor} */
			// @ts-ignore
			this.destination = this.subgroup.processors.get(destinationId);
			this.destination.onScheduleEvents = (...events) => this.selfEmitEvents(...events);

			this.updatePluginList(pluginList);

			this._messagePortRequestId = -1;
			/** @type {Record<number, ((...args: any[]) => any)>} */
			const resolves = {};
			/** @type {Record<number, ((...args: any[]) => any)>} */
			const rejects = {};
			/**
			 * @param {string} call
			 * @param {any} args
			 */
			this.call = (call, ...args) => new Promise((resolve, reject) => {
				const id = this._messagePortRequestId;
				this._messagePortRequestId -= 1;
				resolves[id] = resolve;
				rejects[id] = reject;
				this.port.postMessage({ id, call, args });
			});
			this.handleMessage = ({ data }) => {
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
						if (rejects[id]) rejects[id](error);
						delete rejects[id];
						return;
					}
					if (resolves[id]) {
						resolves[id](value);
						delete resolves[id];
					}
				}
			};
			this.port.start();
			this.port.addEventListener('message', this.handleMessage);
		}

		/**
		 * @param {string[]} pluginListIn
		 */
		updatePluginList(pluginListIn) {
			this.pluginList = pluginListIn;
		}

		/**
		 * @param {WamInfoData} data
		 */
		updateParameterInfo(data) {
			const { currentTime } = audioWorkletGlobalScope;
			this.emitEvents({ type: 'wam-info', data, time: currentTime });
		}

		/**
		 * @param {number} delay
		 */
		setCompensationDelay(delay) {
			this._compensationDelay = delay;
		}
		getCompensationDelay() {
			return this._compensationDelay;
		}

		/**
		 * @param {WamEvent[]} events
		 */
		scheduleEvents(...events) {
			this.eventQueue.push(...events);
		}

		/**
		 * @param {WamEvent[]} events
		 */
		emitEvents(...events) {
			this.call("eventEmitted", ...events);
			if (!this.pluginList.length) return;
			const first = this.subgroup.processors.get(this.pluginList[0]);
			webAudioModules.emitEvents(first, ...events.filter((e) => e.type !== "wam-info"));
		}

		/**
		 * @param {WamEvent[]} events
		 */
		selfEmitEvents(...events) {
			webAudioModules.emitEvents(this, ...events);
		}

		clearEvents() {
			this.eventQueue = [];
		}

		/**
		 * @param {string} toId
		 * @param {number} [output]
		 */
		connectEvents(toId, output) {
			webAudioModules.connectEvents(this.groupId, this.instanceId, toId, output);
		}

		/**
		 * @param {string} toId
		 * @param {number} [output]
		 */
		disconnectEvents(toId, output) {
			webAudioModules.disconnectEvents(this.groupId, this.instanceId, toId, output);
		}
		
		/**
		 * Main process
		 *
		 * @param {Float32Array[][]} inputs
		 * @param {Float32Array[][]} outputs
		 * @param {Record<string, Float32Array>} parameters
		 */
		// eslint-disable-next-line no-unused-vars
		process(inputs, outputs, parameters) {
			if (this.destroyed) return false;
			const { currentTime, sampleRate } = audioWorkletGlobalScope;
			let i = 0;
			/** @type {WamEvent[]} */
			const newEventQueue = [];
			/** @type {WamEvent[]} */
			const eventToEmit = [];
			while (i < this.eventQueue.length) {
				const event = this.eventQueue[i];
				const offsetSec = event.time - currentTime;
				const sampleIndex = offsetSec > 0 ? Math.round(offsetSec * sampleRate) : 0;
				if (sampleIndex < outputs[0][0].length) {
					eventToEmit.push(event);
					this.eventQueue.splice(i, 1);
					i = -1;
				} else {
					newEventQueue.push(event);
				}
				i++;
			}
			if (eventToEmit.length) this.emitEvents(...eventToEmit);
			this.eventQueue = newEventQueue;
			return true;
		}

		destroy() {
			audioWorkletGlobalScope.webAudioModules.removeWam(this);
			this.destroyed = true;
			this.port.close();
		}
	}
	try {
		registerProcessor(moduleId, WamProcessor);
	} catch (error) {
		// eslint-disable-next-line no-console
		console.warn(error);
	}
};

export default processor;
