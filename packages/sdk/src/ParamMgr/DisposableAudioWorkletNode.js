export default class DisposableAudioWorkletNode extends AudioWorkletNode {
	destroyed = false;

	destroy() {
		this.port.postMessage({ destroy: true });
		this.port.close();
		this.destroyed = true;
	}

	constructor(context, name, options) {
		super(context, name, options);
		this.options = options;
	}
}
