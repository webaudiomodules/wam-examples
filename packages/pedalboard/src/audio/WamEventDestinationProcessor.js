/**
 * @typedef {import('@webaudiomodules/api').WamProcessor} IWamProcessor
 * @typedef {import('@webaudiomodules/api').WamNodeOptions} WamNodeOptions
 * @typedef {import('@webaudiomodules/api').WamEvent} WamEvent
 * @typedef {import('@webaudiomodules/sdk-parammgr/src/TypedAudioWorklet').AudioWorkletGlobalScope} AudioWorkletGlobalScope
 */
//@ts-check

/**
 * @param {string} moduleId
 */
const processor = (moduleId) => {
	/** @type {AudioWorkletGlobalScope} */
	// @ts-ignore
	// eslint-disable-next-line no-undef
	const audioWorkletGlobalScope = globalThis;
	const { AudioWorkletProcessor, registerProcessor, webAudioModules } = audioWorkletGlobalScope;

	/**
	 * @implements {IWamProcessor}
	 */
    class WamEventDestinationProcessor extends AudioWorkletProcessor {
		/**
		 * @param {Omit<AudioWorkletNodeOptions, 'processorOptions'> & { processorOptions: WamNodeOptions } } options
		 */
		constructor(options) {
			super();
			this.destroyed = false;
			const { instanceId, groupId } = options.processorOptions;
			this.groupId = groupId;
			this.moduleId = moduleId;
			this.instanceId = instanceId;
			webAudioModules.addWam(this);
            /** @type {(...events: WamEvent[]) => any} */
            this.onScheduleEvents = (...events) => events;
            /** @type {(...events: WamEvent[]) => any} */
            this.onEmitEvents = (...events) => events;
            /** @type {() => any} */
            this.onClearEvents = () => {};

            
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
					if (error) rejects[id]?.(error);
					else resolves[id]?.(value);
					delete resolves[id];
					delete rejects[id];
				}
			};
			this.port.start();
			this.port.addEventListener('message', this.handleMessage);
        }
		getCompensationDelay() {
			return 0;
		}
		/**
		 * @param {WamEvent[]} events
		 */
		scheduleEvents(...events) {
            if (this.destroyed) return;
			this.onScheduleEvents?.(...events);
		}
		/**
		 * @param {WamEvent[]} events
		 */
		emitEvents(...events) {
            if (this.destroyed) return;
			this.onEmitEvents?.(...events);
		}
		clearEvents() {
            if (this.destroyed) return;
			this.onClearEvents?.();
		}
		process() {
			return true;
		}
		destroy() {
			audioWorkletGlobalScope.webAudioModules.removeWam(this);
			this.destroyed = true;
			this.port.close();
		}
    }
	try {
		registerProcessor(moduleId, WamEventDestinationProcessor);
	} catch (error) {
		// eslint-disable-next-line no-console
		console.warn(error);
	}

	return WamEventDestinationProcessor;
};

export default processor;
