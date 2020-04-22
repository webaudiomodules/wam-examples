/* eslint-disable no-underscore-dangle */
import { CompositeAudioNode } from 'sdk';

// name is not so important here, the file Node.js is imported
// Normally the class does no need to be exported as
// an async mehod createNode is expored at the end of this
// file.
export default class PingPongDelayNode extends CompositeAudioNode {
	// plugin is an instance of he class that exends WebAudioPlugin
	// this instance is the plugin as an Observable
	// options is an extra container that could be used to indicate
	// the number of inputs and outputs...
	constructor(plugin, options) {
		super(plugin.audioContext, options);
		this.plugin = plugin;
		this.options = options;
		this.setup();
	}

	// MANDATORY if you have params...
	// Called automatically by CompositeAudioNode each time the state
	// is updated...
	updateState = () => {
		const {
			enabled,
			feedback,
			mix,
			time,
		} = this.plugin.state;

		this.status = enabled;
		this.feedback = feedback;
		this.mix = mix;
		this.time = time;
	}

	/*  #########  Personnal code for the web audio graph  #########   */
	createNodes() {
		super.createNodes();
		this.delayNodeLeft = this.context.createDelay();
		this.delayNodeRight = this.context.createDelay();
		this.dryGainNode = this.context.createGain();
		this.wetGainNode = this.context.createGain();
		this.feedbackGainNode = this.context.createGain();
		this.channelMerger = this.context.createChannelMerger(2);
	}

	connectNodes() {
		super.connectNodes();
		// dry mix
		this._input.connect(this.dryGainNode);
		// dry mix out
		this.dryGainNode.connect(this._output);

		// the feedback loop
		this.delayNodeLeft.connect(this.channelMerger, 0, 0);
		this.delayNodeRight.connect(this.channelMerger, 0, 1);

		this.feedbackGainNode.connect(this.delayNodeLeft);
		this.delayNodeRight.connect(this.feedbackGainNode);

		this.delayNodeLeft.connect(this.delayNodeRight);

		// wet mix
		this._input.connect(this.feedbackGainNode);

		// wet out
		this.channelMerger.connect(this.wetGainNode);
		this.wetGainNode.connect(this._output);
	}

	async setup() {
		await super.setup();
		this.updateState();
		this.plugin.addEventListener('change', this.updateState);
	}

	// Setter part, it is here that you define the link between the params and the nodes values.
	set time(_time) {
		this.delayNodeLeft.delayTime.setValueAtTime(
			_time,
			this.context.currentTime,
		);
		this.delayNodeRight.delayTime.setValueAtTime(
			_time,
			this.context.currentTime,
		);
	}

	set feedback(_feedback) {
		this.feedbackGainNode.gain.setValueAtTime(
			parseFloat(_feedback, 10),
			this.context.currentTime,
		);
	}

	set mix(_mix) {
		this.dryGainNode.gain.setValueAtTime(
			this.getDryLevel(_mix),
			this.context.currentTime,
		);
		this.wetGainNode.gain.setValueAtTime(
			this.getWetLevel(_mix),
			this.context.currentTime,
		);
	}

	set status(_sig) {
		if (this.isEnabled === _sig) return;
		this.isEnabled = _sig;
		if (_sig) {
			this._input.disconnect(this._output);
			this._input.connect(this.feedbackGainNode);
			this._input.connect(this.dryGainNode);
		} else {
			this._input.disconnect(this.feedbackGainNode);
			this._input.disconnect(this.dryGainNode);
			this._input.connect(this._output);
		}
	}

	// delay tools
	// Tools to build sounds
	isNumber(arg) {
		return toString.call(arg) === '[object Number]' && arg === +arg;
	}

	getDryLevel(mix) {
		if (!this.isNumber(mix) || mix > 1 || mix < 0) return 0;
		if (mix <= 0.5) return 1;
		return 1 - (mix - 0.5) * 2;
	}

	getWetLevel(mix) {
		if (!this.isNumber(mix) || mix > 1 || mix < 0) return 0;
		if (mix >= 0.5) return 1;
		return 1 - (0.5 - mix) * 2;
	}
}

// MANDATORY !!! Here a dev could make some async stuff
// i.e if the node is an AudioWorklet, call async
// importScripts() before doing the new ...
export async function createNode(plugin, options) {
	return new PingPongDelayNode(plugin, options);
}
