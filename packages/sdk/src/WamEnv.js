/** @typedef {import('./api/types').WamProcessor} WamProcessor */
/** @typedef {import('./api/types').WamEnv} IWamEnv */
/** @typedef {import('./api/types').AudioWorkletGlobalScope} AudioWorkletGlobalScope */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
/* eslint-disable max-len */

/**
 * @implements {IWamEnv}
 */
export default class WamEnv {
	constructor() {
		/** @type {Map<WamProcessor, Set<WamProcessor>[]>} */
		this._graph = new Map();
		/** @type {Set<WamProcessor>} */
		this._processors = new Set();
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
		this._processors.add(wam);
	}

	/**
	 * @param {WamProcessor} from
	 * @param {number} output
	 * @param {WamProcessor} to
	 */
	connectEvents(from, output, to) {
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
	}

	/**
	 * @param {WamProcessor} from
	 * @param {number} output
	 * @param {WamProcessor} to
	 */
	disconnectEvents(from, output, to) {
		if (!this._graph.has(from)) return;
		const outputMap = this._graph.get(from);
		if (!outputMap[output]) return;
		outputMap[output].delete(to);
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
