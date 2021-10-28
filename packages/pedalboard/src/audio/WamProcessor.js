/* eslint-disable no-underscore-dangle */
/**
 * @typedef {import('@webaudiomodules/api').WamProcessor} IWamProcessor
 * @typedef {import('@webaudiomodules/api').WamNodeOptions} WamNodeOptions
 * @typedef {import('@webaudiomodules/api').WamParameterInfoMap} WamParameterInfoMap
 * @typedef {import('@webaudiomodules/api').WamEvent} WamEvent
 * @typedef {import('@webaudiomodules/api').WamInfoData} WamInfoData
 * @typedef {import('@webaudiomodules/sdk-parammgr/src/TypedAudioWorklet')
 * .AudioWorkletGlobalScope} AudioWorkletGlobalScope
 */
//@ts-check

/**
 * @param {string} processorId
 */
const processor = (processorId) => {
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
		 * & { processorOptions: WamNodeOptions & { pluginList: string[] } }} options
		 */
		constructor(options) {
			super(options);
			this.destroyed = false;
			const { instanceId, pluginList } = options.processorOptions;
			this.moduleId = processorId;
			this.instanceId = instanceId;
			/** @type {string[]} */
			this.pluginList = [];

			audioWorkletGlobalScope.webAudioModules.create(this);

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
			if (pluginListIn.length === this.pluginList.length
				&& this.pluginList.every((v, i) => pluginListIn[i] === v)) return;
			/** @type {[IWamProcessor, number][]} */
			const upstreams = [];
			/** @type {Set<IWamProcessor>[]} */
			let downstreams = [];
			const { eventGraph, processors } = webAudioModules;
			if (this.pluginList.length) {
				const oldFirst = processors[this.pluginList[0]];
				const oldLast = processors[this.pluginList[this.pluginList.length - 1]];
				if (oldLast && eventGraph.has(oldLast)) {
					downstreams = eventGraph.get(oldLast);
				}
				if (oldFirst) {
					eventGraph.forEach((v, upstream) => {
						v.forEach((set, output) => {
							if (set.has(oldFirst)) upstreams.push([upstream, output]);
						});
					});
					if (this.pluginList[0] !== pluginListIn[0]) {
						upstreams.forEach(([from, output]) => {
							webAudioModules.disconnectEvents(from, oldFirst, output);
						});
					}
				}
				this.pluginList.forEach((id) => {
					const from = processors[id];
					if (from) {
						webAudioModules.disconnectEvents(from);
					}
				});
			}
			if (pluginListIn.length) {
				if (this.pluginList[0] !== pluginListIn[0]) {
					const to = processors[pluginListIn[0]];
					if (to) {
						upstreams.forEach(([from, output]) => {
							webAudioModules.connectEvents(from, to, output);
						});
					}
				}
				for (let i = 0; i < pluginListIn.length - 1; i += 1) {
					const $from = pluginListIn[i];
					const $to = pluginListIn[i + 1];
					const from = processors[$from];
					const to = processors[$to];
					if (from && to) webAudioModules.connectEvents(from, to);
				}
				const last = processors[pluginListIn[pluginListIn.length - 1]];
				if (last) {
					downstreams.forEach((set) => set.forEach((to) => {
						webAudioModules.connectEvents(last, to);
					}));
				}
			}
			this.pluginList = pluginListIn;
		}

		/**
		 * @param {WamInfoData} data
		 */
		updateParameterInfo(data) {
			const { currentTime } = audioWorkletGlobalScope;
			this.emitEvents({ type: 'wam-info', data, time: currentTime });
		}

		getCompensationDelay() {
			let delay = 0;
			this.pluginList.forEach((id) => {
				const p = webAudioModules.processors[id];
				if (p) delay += p.getCompensationDelay();
			});
			return delay;
		}

		/**
		 * @param {WamEvent[]} events
		 */
		scheduleEvents(...events) {
			if (!this.pluginList.length) return;
			const id = this.pluginList[0];
			const p = webAudioModules.processors[id];
			if (p) p.scheduleEvents(...events);
		}

		/**
		 * @param {WamEvent[]} events
		 */
		emitEvents(...events) {
			if (!this.pluginList.length) return;
			const id = this.pluginList[0];
			const p = webAudioModules.processors[id];
			if (p) p.emitEvents(...events);
		}

		clearEvents() {
			if (!this.pluginList.length) return;
			const id = this.pluginList[0];
			const p = webAudioModules.processors[id];
			if (p) p.clearEvents();
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
			return true;
		}

		destroy() {
			this.pluginList.forEach((id) => {
				const p = webAudioModules.processors[id];
				if (p) p.destroy();
			});
			audioWorkletGlobalScope.webAudioModules.destroy(this);
			this.destroyed = true;
			this.port.close();
		}
	}
	try {
		registerProcessor(processorId, WamProcessor);
	} catch (error) {
		// eslint-disable-next-line no-console
		console.warn(error);
	}
};

export default processor;
