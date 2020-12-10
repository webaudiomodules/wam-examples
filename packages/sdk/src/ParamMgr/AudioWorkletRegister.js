export const registeredProcessors = new WeakMap();
export const registeringProcessors = new WeakMap();

export default class AudioWorkletRegister {
	static registeredProcessors = registeredProcessors;

	static registeringProcessors = registeringProcessors;

	static resolves = {};

	static rejects = {};

	static async registerProcessor(processorId, processor, audioWorklet, ...injection) {
		this.registeringProcessors.get(audioWorklet).add(processorId);
		try {
			// @ts-ignore
			const url = window.URL.createObjectURL(new Blob([`(${processor.toString()})(${[processorId, ...injection].map(JSON.stringify).join(', ')});`], { type: 'text/javascript' }));
			await audioWorklet.addModule(url);
			this.resolves[processorId].forEach((f) => f());
			this.registeringProcessors.get(audioWorklet).delete(processorId);
			this.registeredProcessors.get(audioWorklet).add(processorId);
		} catch (e) {
			this.rejects[processorId].forEach((f) => f(e));
		}
		this.rejects[processorId] = [];
		this.resolves[processorId] = [];
	}

	static async register(processorId, processor, audioWorklet, ...injection) {
		if (!this.resolves[processorId]) this.resolves[processorId] = [];
		if (!this.rejects[processorId]) this.rejects[processorId] = [];
		const promise = new Promise((resolve, reject) => {
			this.resolves[processorId].push(resolve);
			this.rejects[processorId].push(reject);
		});
		if (!this.registeringProcessors.has(audioWorklet)) {
			this.registeringProcessors.set(audioWorklet, new Set());
		}
		if (!this.registeredProcessors.has(audioWorklet)) {
			this.registeredProcessors.set(audioWorklet, new Set());
		}
		const registered = this.registeredProcessors.get(audioWorklet).has(processorId);
		const registering = this.registeringProcessors.get(audioWorklet).has(processorId);
		if (registered) return Promise.resolve();
		if (registering) return promise;
		if (!registered && audioWorklet) {
			this.registerProcessor(processorId, processor, audioWorklet, ...injection);
		}
		return promise;
	}
}

// @ts-ignore
if (!window.AudioWorkletRegister) window.AudioWorkletRegister = AudioWorkletRegister;
