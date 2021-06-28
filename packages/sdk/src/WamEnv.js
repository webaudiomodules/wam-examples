/** @typedef {import('./api/types').WamProcessor} IWamProcessor */
/** @typedef {import('./api/types').WamEnv} IWamEnv */
/** @typedef {import('./api/types').AudioWorkletGlobalScope} AudioWorkletGlobalScope */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
/* eslint-disable max-len */

const executable = () => {
	/**
	 * @implements {IWamEnv}
	 */
	class WamEnv {
		constructor() {
			/** @type {Map<IWamProcessor, Set<IWamProcessor>[]>} */
			this._eventGraph = new Map();
			/** @type {Record<string, IWamProcessor>} */
			this._processors = {};
		}

		get eventGraph() {
			return this._eventGraph;
		}

		get processors() {
			return this._processors;
		}

		/**
		 * @param {IWamProcessor} wam
		 */
		create(wam) {
			this._processors[wam.instanceId] = wam;
			// console.log('create', this);
		}

		/**
		 * @param {IWamProcessor} from
		 * @param {IWamProcessor} to
		 * @param {number} [output]
		 */
		connectEvents(from, to, output = 0) {
			/** @type {Set<IWamProcessor>[]} */
			let outputMap;
			if (this._eventGraph.has(from)) {
				outputMap = this._eventGraph.get(from);
			} else {
				outputMap = [];
				this._eventGraph.set(from, outputMap);
			}
			if (outputMap[output]) {
				outputMap[output].add(to);
			} else {
				const set = new Set();
				set.add(to);
				outputMap[output] = set;
			}
			// console.log('connectEvents', this);
		}

		/**
		 * @param {IWamProcessor} from
		 * @param {IWamProcessor} [to]
		 * @param {number} [output]
		 */
		disconnectEvents(from, to, output) {
			if (!this._eventGraph.has(from)) return;
			const outputMap = this._eventGraph.get(from);
			if (typeof to === 'undefined') {
				outputMap.forEach((set) => {
					if (set) set.clear();
				});
				return;
			}
			if (typeof output === 'undefined') {
				outputMap.forEach((set) => {
					if (set) set.delete(to);
				});
				return;
			}
			if (!outputMap[output]) return;
			outputMap[output].delete(to);
			// console.log('disconnectEvents', this);
		}

		/**
		 * @param {IWamProcessor} wam
		 */
		destroy(wam) {
			if (this.eventGraph.has(wam)) this.eventGraph.delete(wam);
			this.eventGraph.forEach((outputMap) => {
				outputMap.forEach((set) => {
					if (set && set.has(wam)) set.delete(wam);
				});
			});
			// console.log('destroy', this);
		}
	}

	/** @type {AudioWorkletGlobalScope} */
	// @ts-ignore
	const audioWorkletGlobalScope = globalThis;
	if (!audioWorkletGlobalScope.webAudioModules) audioWorkletGlobalScope.webAudioModules = new WamEnv();
	return WamEnv;
};

/** @type {AudioWorkletGlobalScope} */
// @ts-ignore
const audioWorkletGlobalScope = globalThis;
if (audioWorkletGlobalScope.AudioWorkletProcessor) {
	if (!audioWorkletGlobalScope.webAudioModules) executable();
}

export default executable;
