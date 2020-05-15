export const registeredProcessors = new Set();
export const registeringProcessors = new Set();

export default class AudioWorkletRegister {
	static registeredProcessors = registeredProcessors;

	static registeringProcessors = registeringProcessors;

	static resolves = {};

	static rejects = {};

	static async registerProcessor(processorId, processor, audioWorklet, ...injection) {
		this.registeringProcessors.add(processorId);
		try {
			const url = window.URL.createObjectURL(new Blob([`(${processor.toString()})(${[processorId, ...injection].map(JSON.stringify).join(', ')});`], { type: 'text/javascript' }));
			await audioWorklet.addModule(url);
			this.resolves[processorId].forEach((f) => f());
			this.registeringProcessors.delete(processorId);
			this.registeredProcessors.add(processorId);
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
		const registered = this.registeredProcessors.has(processorId);
		const registering = this.registeringProcessors.has(processorId);
		if (registered) return Promise.resolve();
		if (registering) return promise;
		if (!registered && audioWorklet) {
			this.registerProcessor(processorId, processor, audioWorklet, ...injection);
		}
		return promise;
	}
}
