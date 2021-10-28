/** @typedef { import('../../sdk-parammgr').ParamMgrNode } ParamMgrNode */
/* eslint-disable no-console */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
import CompositeAudioNode from '../../sdk-parammgr/src/CompositeAudioNode.js';
import ConvolverDisto from './convolverdisto.js';
import AmpDisto from './ampdisto.js';
import EqualizerDisto from './equalizerdisto.js';
import BoostDisto from './boostdisto.js';

const getAssetUrl = (asset) => {
	const base = new URL('.', import.meta.url);
	return `${base}${asset}`;
};

// name is not so important here, the file Node.js is imported by the main plugin file (index.js)
export default class DistoMachineNode extends CompositeAudioNode {
	/**
	 * @type {ParamMgrNode}
	 */
	_wamNode = undefined;

	reverbImpulses = [
		{
			name: "Fender Hot Rod",
			url: "/assets/impulses/reverb/cardiod-rear-levelled.wav",
		},
		{
			name: "PCM 90 clean plate",
			url: "/assets/impulses/reverb/pcm90cleanplate.wav",
		},
		{
			name: "Scala de Milan",
			url: "/assets/impulses/reverb/ScalaMilanOperaHall.wav",
		},
	];
	cabinetImpulses = [
		{
			name: "Marshall 1960, axis",
			url: "/assets/impulses/cabinet/Marshall1960.wav",
		},
		{
			name: "Vintage Marshall 1",
			url: "/assets/impulses/cabinet/Block%20Inside.wav",
		},
		{
			name: "Vox Custom Bright 4x12 M930 Axis 1",
			url:
				"/assets/impulses/cabinet/voxCustomBrightM930OnAxis1.wav",
		},
		{
			name: "Fender Champ, axis",
			url: "assets/impulses/cabinet/FenderChampAxisStereo.wav",
		},
		{
			name: "Mesa Boogie 4x12",
			url: "/assets/impulses/cabinet/Mesa-OS-Rectifier-3.wav",
		},
		{
			name: "001a-SM57-V30-4x12",
			url:
				"/assets/impulses/cabinet/KalthallenCabsIR/001a-SM57-V30-4x12.wav",
		},
		{
			name: "028a-SM7-V30-4x12",
			url:
				"/assets/impulses/cabinet/KalthallenCabsIR/028a-SM7-V30-4x12.wav",
		},
		{
			name: "034a-SM58-V30-4x12",
			url:
				"/assets/impulses/cabinet/KalthallenCabsIR/034a-SM58-V30-4x12.wav",
		},
		{
			name: "022a-MD21-V30-4x12",
			url:
				"/assets/impulses/cabinet/KalthallenCabsIR/022a-MD21-V30-4x12.wav",
		},
		{
			name: "023a-MD21-V30-4x12",
			url:
				"/assets/impulses/cabinet/KalthallenCabsIR/023a-MD21-V30-4x12.wav",
		},
		{
			name: "024a-MD21-G12T75-4x12",
			url:
				"/assets/impulses/cabinet/KalthallenCabsIR/024a-MD21-G12T75-4x12.wav",
		},
		{
			name: "009a-SM57-G12T75-4x12",
			url:
				"/assets/impulses/cabinet/KalthallenCabsIR/009a-SM57-G12T75-4x12.wav",
		},
	];

	/**
	 * @param {ParamMgrNode} wamNode
	 */
	// Mandatory.
	setup(wamNode) {
		this._wamNode = wamNode;
		this.connectNodes();
	}

	constructor(context, options) {
		super(context, options);
		// add absolute URL to relative urls...
		this.fixImpulseURLs();

		this.createNodes();
	}
	fixImpulseURLs() {
		let relativeURL;
		this.reverbImpulses.forEach(impulse => {
			relativeURL = impulse.url;
			impulse.url = getAssetUrl(relativeURL);
		});

		this.cabinetImpulses.forEach(impulse => {
			relativeURL = impulse.url;
			impulse.url = getAssetUrl(relativeURL);
		});

	}

	/*  #########  Personnal code for the web audio graph  #########   */
	createNodes() {
		// mandatory, will create defaul input and output
		/*
				this.outputNode = this.context.createGain();
				this.dryGainNode = this.context.createGain();
				this.wetGainNode = this.context.createGain();

				this.lowpassLeft = this.context.createBiquadFilter();
				this.lowpassLeft.type = 'lowpass';
				this.lowpassLeft.frequency.value = 147;
				this.lowpassLeft.Q.value = 0.7071;

				this.bandpass1Left = this.context.createBiquadFilter();
				this.bandpass1Left.type = 'bandpass';
				this.bandpass1Left.frequency.value = 587;
				this.bandpass1Left.Q.value = 0.7071;

				this.bandpass2Left = this.context.createBiquadFilter();
				this.bandpass2Left.type = 'bandpass';
				this.bandpass2Left.frequency.value = 2490;
				this.bandpass2Left.Q.value = 0.7071;

				this.highpassLeft = this.context.createBiquadFilter();
				this.highpassLeft.type = 'highpass';
				this.highpassLeft.frequency.value = 4980;
				this.highpassLeft.Q.value = 0.7071;

				this.overdrives = [];
				for (let i = 0; i < 4; i++) {
					this.overdrives[i] = this.context.createWaveShaper();
					this.overdrives[i].curve = this.getDistortionCurve(this.normalize(0.5, 0, 150));
				}
				*/
				this._outputGain = this.context.createGain();
				this._inputGain = this.context.createGain();

		this.equalizer = new EqualizerDisto(this.context);
		this.ampReverb = new ConvolverDisto(
			this.context,
			this.reverbImpulses,
			"reverbImpulses"
		);
		this.cabinetSim = new ConvolverDisto(
			this.context,
			this.cabinetImpulses,
			"cabinetImpulses"
		);
		this.boost = new BoostDisto(this.context);

		this.amp = new AmpDisto(
			this.context,
			this.boost,
			this.equalizer,
			this.ampReverb,
			this.cabinetSim
		);
	}

	connectNodes() {
		/*
		this.connect(this.amp.input);
		// shihong....
		this.amp.output.connect(this._outputGain);
		this._output = this._outputGain;
		*/

		this.connect(this._inputGain);
		this._inputGain.connect(this.amp.input);
		this.amp.output.connect(this._outputGain);
		this._output = this._outputGain;
		this._input = this._inputGain;

	}

	setParam(key, value) {
		try {
		  this[key] = value;
		} catch (error) {
		  console.warn("this plugin does not implement this param");
		}
	  }

	set volume(val) {
		//this.params.volume = val;
		this.amp.changeOutputGain(val);
	}

	set master(val) {
		//this.params.master = val;
		this.amp.changeMasterVolume(val);
	}

	set drive(val) {
		//this.params.drive = val;
		this.amp.changeDrive(val);
	}

	set bass(val) {
		//this.params.bass = val;
		this.amp.changeBassFilterValue(val);
	}

	set middle(val) {
		//this.params.middle = val;
		this.amp.changeMidFilterValue(val);
	}

	set treble(val) {
		//this.params.treble = val;
		this.amp.changeTrebleFilterValue(val);
	}

	set reverb(val) {
		//this.params.reverb = val;
		this.amp.changeReverbGain(val);
	}

	set presence(val) {
		//this.params.presence = val;
		this.amp.changePresenceFilterValue(val);
	}

	set preset(val) {
		console.log("########### SET PRESET val=" + val + "#######");
		//this.params.preset = val;
		this.amp.setPresetByIndex(this, val);
	}

	set LS1Freq(val) {
		//this.params.LS1Freq = val;
		this.amp.changeLowShelf1FrequencyValue(val);
	}

	set LS1Gain(val) {
		//this.params.LS1Gain = val;
		this.amp.changeLowShelf1GainValue(val);
	}

	set LS2Freq(val) {
		//this.params.LS2Freq = val;
		this.amp.changeLowShelf2FrequencyValue(val);
	}

	set LS2Gain(val) {
		//this.params.LS2Gain = val;
		this.amp.changeLowShelf2GainValue(val);
	}

	set LS3Freq(val) {
		//this.params.LS3Freq = val;
		this.amp.changeLowShelf3FrequencyValue = val;
	}

	set LS3Gain(val) {
		//this.params.LS3Gain = val;
		this.amp.changeLowShelf3GainValue(val);
	}
	set gain1(val) {
		//this.params.gain1 = val;
		this.amp.changePreampStage1GainValue(val);
	}

	set gain2(val) {
		//this.params.gain2 = val;
		this.amp.changePreampStage2GainValue(val);
	}

	set HP1Freq(val) {
		//this.params.HP1Freq = val;
		this.amp.changeHighPass1FrequencyValue(val);
	}

	set HP1Q(val) {
		//this.params.HP1Q = val;
		this.amp.changeHighPass1QValue(val);
	}

	set EQ(val) {
		//this.params.EQ = val;
		this.amp.changeEQValues(val);
	}

	set CG(val) {
		//this.params.CG = val;
		this.amp.changeRoom(val);
	}


	isEnabled = true;

	set status(_sig) {
		if (this.isEnabled === _sig) return;

		this.isEnabled = _sig;
		if (_sig) {
			//console.log('BYPASS MODE OFF FX RUNNING');
			this._input.disconnect();
			this._input.connect(this.amp.input);
		} else {
			//console.log('BYPASS MODE ON');
			this._input.disconnect();
			this._input.connect(this._output);
		}
	}

	// MANDATORY : redefine these methods
	// eslint-disable-next-line class-methods-use-this
	getParamValue(name) {
		return this._wamNode.getParamValue(name);
	}

	setParamValue(name, value) {
		return this._wamNode.setParamValue(name, value);
	}

	getParamsValues() {
		return this._wamNode.getParamsValues();
	}

	setParamsValues(values) {
		return this._wamNode.setParamsValues(values);
	}
}

/*
import ConvolverDisto from './convolverdisto.mjs';
import AmpDisto from './ampdisto.mjs';
import EqualizerDisto from './equalizerdisto.mjs';
import BoostDisto from './boostdisto.mjs';

window.DistoMachine = class DistoMachine extends WebAudioPluginCompositeNode {
	constructor(ctx, URL, options) {
		super(ctx, URL, options);

		this.params = { status: "enable", preset: "5" };

		this.reverbImpulses = [
			{
				name: "Fender Hot Rod",
				url: this.URL + "/assets/impulses/reverb/cardiod-rear-levelled.wav",
			},
			{
				name: "PCM 90 clean plate",
				url: this.URL + "/assets/impulses/reverb/pcm90cleanplate.wav",
			},
			{
				name: "Scala de Milan",
				url: this.URL + "/assets/impulses/reverb/ScalaMilanOperaHall.wav",
			},
		];
		this.cabinetImpulses = [
			{
				name: "Marshall 1960, axis",
				url: this.URL + "/assets/impulses/cabinet/Marshall1960.wav",
			},
			{
				name: "Vintage Marshall 1",
				url: this.URL + "/assets/impulses/cabinet/Block%20Inside.wav",
			},
			{
				name: "Vox Custom Bright 4x12 M930 Axis 1",
				url:
					this.URL + "/assets/impulses/cabinet/voxCustomBrightM930OnAxis1.wav",
			},
			{
				name: "Fender Champ, axis",
				url: this.URL + "assets/impulses/cabinet/FenderChampAxisStereo.wav",
			},
			{
				name: "Mesa Boogie 4x12",
				url: this.URL + "/assets/impulses/cabinet/Mesa-OS-Rectifier-3.wav",
			},
			{
				name: "001a-SM57-V30-4x12",
				url:
					this.URL +
					"/assets/impulses/cabinet/KalthallenCabsIR/001a-SM57-V30-4x12.wav",
			},
			{
				name: "028a-SM7-V30-4x12",
				url:
					this.URL +
					"/assets/impulses/cabinet/KalthallenCabsIR/028a-SM7-V30-4x12.wav",
			},
			{
				name: "034a-SM58-V30-4x12",
				url:
					this.URL +
					"/assets/impulses/cabinet/KalthallenCabsIR/034a-SM58-V30-4x12.wav",
			},
			{
				name: "022a-MD21-V30-4x12",
				url:
					this.URL +
					"/assets/impulses/cabinet/KalthallenCabsIR/022a-MD21-V30-4x12.wav",
			},
			{
				name: "023a-MD21-V30-4x12",
				url:
					this.URL +
					"/assets/impulses/cabinet/KalthallenCabsIR/023a-MD21-V30-4x12.wav",
			},
			{
				name: "024a-MD21-G12T75-4x12",
				url:
					this.URL +
					"/assets/impulses/cabinet/KalthallenCabsIR/024a-MD21-G12T75-4x12.wav",
			},
			{
				name: "009a-SM57-G12T75-4x12",
				url:
					this.URL +
					"/assets/impulses/cabinet/KalthallenCabsIR/009a-SM57-G12T75-4x12.wav",
			},
		];

		super.setup();
	}

	getPatch(index) {
		return null;
	}

	getParam(key) {
		try {
			return this.params[key];
		} catch (error) {
			console.warn("this plugin does not implement this param");
		}
	}

	setParam(key, value) {
		try {
			this[key] = value;
		} catch (error) {
			console.warn("this plugin does not implement this param");
		}
	}

	onMidi(msg) {
		return msg;
	}
	createNodes() {
		this.equalizer = new EqualizerDisto(this.context);
		this.ampReverb = new ConvolverDisto(
			this.context,
			this.reverbImpulses,
			"reverbImpulses"
		);
		this.cabinetSim = new ConvolverDisto(
			this.context,
			this.cabinetImpulses,
			"cabinetImpulses"
		);
		this.boost = new BoostDisto(this.context);

		this.amp = new AmpDisto(
			this.context,
			this.boost,
			this.equalizer,
			this.ampReverb,
			this.cabinetSim
		);
	}

	connectNodes() {
		this._input.connect(this.amp.input);
		this.amp.output.connect(this._output);
	}

	set volume(val) {
		this.params.volume = val;
		this.amp.changeOutputGain(val);
	}

	set master(val) {
		this.params.master = val;
		this.amp.changeMasterVolume(val);
	}

	set drive(val) {
		this.params.drive = val;
		this.amp.changeDrive(val);
	}

	set bass(val) {
		this.params.bass = val;
		this.amp.changeBassFilterValue(val);
	}

	set middle(val) {
		this.params.middle = val;
		this.amp.changeMidFilterValue(val);
	}

	set treble(val) {
		this.params.treble = val;
		this.amp.changeTrebleFilterValue(val);
	}

	set reverb(val) {
		this.params.reverb = val;
		this.amp.changeReverbGain(val);
	}

	set presence(val) {
		this.params.presence = val;
		this.amp.changePresenceFilterValue(val);
	}

	set status(_sig) {
		let bypassOn = _sig !== "disable";

		//this.amp.bypass(bypassOn, this);
		this.bypass(bypassOn);
	}

	set preset(val) {
		console.log("########### SET PRESET val=" + val + "#######");
		this.params.preset = val;
		this.amp.setPresetByIndex(this, val);
	}

	set LS1Freq(val) {
		this.params.LS1Freq = val;
		this.amp.changeLowShelf1FrequencyValue(val);
	}

	set LS1Gain(val) {
		this.params.LS1Gain = val;
		this.amp.changeLowShelf1GainValue(val);
	}

	set LS2Freq(val) {
		this.params.LS2Freq = val;
		this.amp.changeLowShelf2FrequencyValue(val);
	}

	set LS2Gain(val) {
		this.params.LS2Gain = val;
		this.amp.changeLowShelf2GainValue(val);
	}

	set LS3Freq(val) {
		this.params.LS3Freq = val;
		this.amp.changeLowShelf3FrequencyValue = val;
	}

	set LS3Gain(val) {
		this.params.LS3Gain = val;
		this.amp.changeLowShelf3GainValue(val);
	}
	set gain1(val) {
		this.params.gain1 = val;
		this.amp.changePreampStage1GainValue(val);
	}

	set gain2(val) {
		this.params.gain2 = val;
		this.amp.changePreampStage2GainValue(val);
	}

	set HP1Freq(val) {
		this.params.HP1Freq = val;
		this.amp.changeHighPass1FrequencyValue(val);
	}

	set HP1Q(val) {
		this.params.HP1Q = val;
		this.amp.changeHighPass1QValue(val);
	}

	set EQ(val) {
		this.params.EQ = val;
		this.amp.changeEQValues(val);
	}

	set CG(val) {
		this.params.CG = val;
		this.amp.changeRoom(val);
	}

	bypass(bypassOn) {
		if (!bypassOn) {
			this._input.disconnect();
			this._input.connect(this._output);
			this.params.status = "disable";
		} else {
			this._input.disconnect();
			this._input.connect(this.amp.input);
			this.params.status = "enable";
		}
	}
};




window.WasabiDistoMachine = class WasabiDistoMachine extends WebAudioPluginFactory {
	constructor(context, baseUrl, options) {
		super(context, baseUrl, options);
	}
};

*/
