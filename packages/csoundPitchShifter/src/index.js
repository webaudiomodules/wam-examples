import { WebAudioModule, ParamMgrFactory, CompositeAudioNode } from 'sdk';
import CsoundObj from '@kunstmusik/csound';
import { createElement } from './Gui/index.js';


class CsoundPitchShifterNode extends CompositeAudioNode {
	setup(csound, output, paramMgr) {
		this.connect(output, 0, 0);
		this._wamNode = paramMgr;
		this._output = output;
		this.csound = csound;
	}

	destroy() {
		super.destroy();
		if (this._output) this._output.destroy();
	}

	getParamValue(name) {
		return this._wamNode.getParamValue(name);
	}

	setParamValue(name, value) {
		return this._wamNode.setParamValue(name, value);
	}
}

// Definition of a new plugin
export default class CsoundPitchShifterPlugin extends WebAudioModule {
	static descriptor = {
		name: 'CsoundPitchShifter',
		vendor: 'WebAudioModule',
	};

	// The plugin redefines the async method createAudionode()
	// that must return an <Audionode>
	// It also listen to plugin state change event to update the audionode internal state
	async createAudioNode(initialState) {
    await CsoundObj.initialize(this.audioContext);

		let cs = new CsoundObj();
		this.csound = cs;
		//cs.getNode().resetIfNeeded();
		cs.setMessageCallback(msg => console.log(msg));
		cs.setOption("-odac");
		cs.setOption("-+msg_color=false");
		cs.compileOrc(`
		sr=48000
		ksmps=32
		nchnls_i = 2
		nchnls=2
		0dbfs=1
		
		instr 1
			a1 = inch(1)
			a2 = inch(1)

			isiz = 2048
			
			kpitch_shift = semitone(chnget:k("pitch_shift"))
			kform_shift = semitone(chnget:k("formant_shift"))

			fs1 = pvsanal(dcblock2(a1),isiz,isiz/8,isiz,1)
			fs2 = pvscale(pvswarp(fs1,kform_shift,0),kpitch_shift)
			aout1 pvsynth fs2		

			fs3 = pvsanal(dcblock2(a2),isiz,isiz/8,isiz,1)
			fs4 = pvscale(pvswarp(fs3,kform_shift,0),kpitch_shift)
			aout2 pvsynth fs4		

			out(aout1, aout2)
		endin
		schedule(1, 0, -1)
		`)
		cs.start();

		const node = cs.getNode();	

		const paramsConfig = {
		  formant_shift: {
		    defaultValue: 0,
		    minValue: -12,
		    maxValue: 12,
		  },
		  pitch_shift: {
		    defaultValue: 0,
		    minValue: -12,
		    maxValue: 12,
		  },
		};

		const internalParamsConfig = {
			formant_shift: { onChange: (v) => cs.setControlChannel("formant_shift", v)},
			pitch_shift: { onChange: (v) => cs.setControlChannel("pitch_shift", v)},
		};
		

		const paramMgrNode = await ParamMgrFactory.create(this, { paramsConfig, internalParamsConfig });
		const pitchShifterNode = new CsoundPitchShifterNode(this.audioContext);
		pitchShifterNode.setup(cs, node, paramMgrNode);
		if (initialState) pitchShifterNode.setState(initialState);
		return pitchShifterNode;
	}

	createGui() {
		return createElement(this);
	}
}
