/** @typedef {import('./api/types').WamProcessor} WamProcessor */
/** @typedef {import('./api/types').WamEnv} IWamEnv */
/** @typedef {import('./api/types').AudioWorkletGlobalScope} AudioWorkletGlobalScope */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
/* eslint-disable max-len */

const processor = () => {
	/**
	 * @implements {IWamEnv}
	 */
	class WamEnv {
		constructor() {
			/** @type {Map<WamProcessor, Set<WamProcessor>[]>} */
			this._graph = new Map();
			/** @type {Record<string, WamProcessor>} */
			this._processors = {};
		}

		get graph() {
			return this._graph;
		}

		get processors() {
			return this._processors;
		}

		/**
		 * @param {WamProcessor} wam
		 */
		create(wam) {
			this._processors[wam.instanceId] = wam;
			// console.log('create', this);
		}

		/**
		 * @param {WamProcessor} from
		 * @param {WamProcessor} to
		 * @param {number} [output]
		 */
		connectEvents(from, to, output = 0) {
			/** @type {Set<WamProcessor>[]} */
			let outputMap;
			if (this._graph.has(from)) {
				outputMap = this._graph.get(from);
			} else {
				outputMap = [];
				this._graph.set(from, outputMap);
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
		 * @param {WamProcessor} from
		 * @param {WamProcessor} [to]
		 * @param {number} [output]
		 */
		disconnectEvents(from, to, output) {
			if (!this._graph.has(from)) return;
			const outputMap = this._graph.get(from);
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
		 * @param {WamProcessor} wam
		 */
		destroy(wam) {
			if (this.graph.has(wam)) this.graph.delete(wam);
			this.graph.forEach((outputMap) => {
				outputMap.forEach((set) => {
					if (set && set.has(wam)) set.delete(wam);
				});
			});
			// console.log('destroy', this);
		}

		/**
		 * @param {number} from
		 * @param {number} to
		 */
		// eslint-disable-next-line
		getTimeInfo(from, to) { throw new Error('Not Implemented.'); return null; }
	}

	/** @type {AudioWorkletGlobalScope} */
	// @ts-ignore
	const audioWorkletGlobalScope = globalThis;
	if (!audioWorkletGlobalScope.webAudioModules) audioWorkletGlobalScope.webAudioModules = new WamEnv();
};

/** @type {AudioWorkletGlobalScope} */
// @ts-ignore
const audioWorkletGlobalScope = globalThis;
if (audioWorkletGlobalScope.AudioWorkletProcessor) {
	if (!audioWorkletGlobalScope.webAudioModules) processor();
}

export default processor;
