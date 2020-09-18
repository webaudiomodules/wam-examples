import { CompositeAudioNode } from 'sdk';

export default class PedalboardAudioNode extends CompositeAudioNode {
	wamNode = undefined;

	get paramMgr() {
		return this.wamNode;
	}

	constructor(audioContext, options) {
		super(audioContext, options);
		this.createNodes();
	}

	createNodes() {
		this.input = this.context.createGain();
		this.output = this.context.createGain();
	}

	connectNodes() {
		super.connect(this.input);
		this.input.connect(this.output);
	}

	setup(wamNode) {
		this.wamNode = wamNode;
		this.connectNodes();
	}
}
