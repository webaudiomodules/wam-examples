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
		this._input = this.context.createGain();
		super.connect(this._input);
		
		this._output = this.context.createGain();
		this._input.connect(this._output);
	}

}
