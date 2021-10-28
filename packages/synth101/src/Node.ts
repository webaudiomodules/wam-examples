/* eslint-disable no-underscore-dangle */
import { CompositeAudioNode, ParamMgrNode } from '@webaudiomodules/sdk-parammgr';
import { constantSource, noiseSource } from './util'

const shaperLength = 44100;

export type Params = "waveform" | "detune" | "lfoRate" | "lfoWaveform" | "oscMod" | "oscRange" | "pulseWidth" | "pwmSource" | "subRange" | "mixerSaw" | "mixerPulse" | "mixerSub" | "mixerNoise" | "filterFreq" | "filterRes" | "filterEnv" | "filterMod" | "filterKeyboard" | "vcaSource" | "envTrigger" | "envAttack" | "envDecay" | "envSustain" | "envRelease" | "portamentoMode" | "portamentoTime";
export type InternalParams = Params;

export class MIDI {
	static NOTE_ON = 0x90;
	static NOTE_OFF = 0x80;
	static CC = 0xB0;
}

export type MIDIEvent = Uint8Array | [number, number, number];
export type ScheduledMIDIEvent = {
    event: MIDIEvent,
    time: number
}

let lfoWaves: OscillatorType[] = ["triangle", "square"]

// name is not so important here, the file Node.js is imported
// Normally the class does no need to be exported as
// an async mehod createNode is expored at the end of this
// file.
export default class Synth101Node extends CompositeAudioNode {
	/**
	 * @type {ParamMgrNode<Params, InternalParams>}
	 */
	_wamNode: ParamMgrNode<Params, InternalParams> = undefined;

	get paramMgr(): ParamMgrNode {
		return this._wamNode;
	}

	// plugin is an instance of he class that exends WebAudioModule
	// this instance is he plugin as an Observable
	// options is an extra container that could be ussed to indicate
	// the number of inputs and outputs...
	constructor(audioContext: BaseAudioContext, options={}) {        
		super(audioContext, options);
        console.log("Synth101 constructor()")

        // internal note-holding state
        this.heldNotes = []
        this.heldNotes.length = 128
        this.heldNotes.fill(false, 0, 128)
        this.targetFreq = 0

        this.currentNote = -1;

		this.createNodes();
	}

	setup(paramMgr: ParamMgrNode<Params, InternalParams>) {
        paramMgr.addEventListener('wam-midi', (e) => this.processMIDIEvents([{event: e.detail.data.bytes, time: 0}]));

        this._wamNode = paramMgr
        
		this.connectNodes();
	}

	isEnabled = true;

	set status(_sig: boolean) {
		this.isEnabled = _sig;
	}

    heldNotes: boolean[];
    currentNote: number;

    // TODO: replace with ParamMgr
    parameters = {
        waveform: 0,
        detune : 0,
        lfoRate : 0,
        lfoWaveform : 0,
        oscMod: 0,
        oscRange: 0,
        pulseWidth: 0,
        pwmSource: 0,
        subRange: 0,
        mixerPulse: 0,
        mixerSaw: 1,
        mixerNoise: 0,
        mixerSub: 0.2,
        filterFreq: 0.35,
        filterRes: 0,
        filterEnv: 0.3,
        filterKeyboard: 0,
        filterMod: 0,
        vcaSource: 0,
        envTrigger: 0,
        envAttack: 0,
        envDecay: 0.1,
        envSustain: 0,
        envRelease: 0,
        portamentoMode: 0,
        portamentoTime: 0,
    }

    oscillator!: OscillatorNode;
    pulseGain!: GainNode;
    pulseShaper!: WaveShaperNode;
    subOsc!: OscillatorNode;
    lfo!: OscillatorNode;
    lfoPWM!: GainNode;
    lfoFilter!: GainNode;
    lfoOscMod!: GainNode;
    envSource!: AudioBufferSourceNode | ConstantSourceNode;
    env!: GainNode;
    envFilter!: GainNode;
    envVCA!: GainNode;
    envPWM!: GainNode;
    kybdSource!: AudioBufferSourceNode | ConstantSourceNode;
    kybdGain!: GainNode;
    filters!: BiquadFilterNode[];
    mixerSaw!: GainNode;
    mixerPulse!: GainNode;
    mixerSub!: GainNode;
    mixerNoise!: GainNode;
    vca!: GainNode;
    stereoOut!: ChannelMergerNode;
    targetFreq: number;

	/*  #########  Personnal code for the web audio graph  #########   */
	createNodes() {
        // do I need to call super.connect even though I'm not an audio effect with an input?
//		super.connect(this._input);

        this.oscillator = this.context.createOscillator();
        this.oscillator.type = "sawtooth"

        this.pulseGain = this.context.createGain();
        this.pulseShaper = this.context.createWaveShaper();
        var curve = new Float32Array(shaperLength);
        let quarter = shaperLength/4;
        for (var i = 0; i < shaperLength; i++) {
            if (i < quarter) {
                curve[i] = -1.0;
            } else if (i > quarter * 3) {
                curve[i] = -1.0;
            } else {
                curve[i] = 1.0;
            }
        }
        
        this.pulseShaper.curve = curve;

        // subosc
        this.subOsc = this.context.createOscillator();
        this.subOsc.type = "square"
        
        // Modulators (LFO/Env)
        this.lfo = this.context.createOscillator();
        this.lfo.type = "triangle"

        this.lfoPWM = this.context.createGain();
        this.lfoFilter = this.context.createGain();
        this.lfoOscMod = this.context.createGain();

        this.lfo.connect(this.lfoPWM);
        this.lfo.connect(this.lfoOscMod);
        this.lfo.connect(this.lfoFilter);

        this.lfoOscMod.connect(this.oscillator.detune);
        this.lfoOscMod.connect(this.subOsc.detune);

        this.envSource = constantSource(this.context);
        this.env = this.context.createGain();
        this.envFilter = this.context.createGain();
        this.envVCA = this.context.createGain();
        this.envPWM = this.context.createGain();

        this.kybdSource = constantSource(this.context);
        this.kybdGain = this.context.createGain();
        this.kybdSource.connect(this.kybdGain);

        this.filters = [
            this.context.createBiquadFilter(),
            this.context.createBiquadFilter(),
            this.context.createBiquadFilter(),
        ]

        this.filters.forEach(filter => {
            filter.type = "lowpass"
            this.lfoFilter.connect(filter.detune)
            this.envFilter.connect(filter.detune)
            this.kybdGain.connect(filter.detune)
        })

        this.mixerSaw = this.context.createGain();
        this.mixerPulse = this.context.createGain();
        this.mixerSub = this.context.createGain();
        this.mixerNoise = this.context.createGain();

        this.vca = this.context.createGain();
        this.vca.gain.setValueAtTime(0, 0);
        this.oscillator.start(0);
        this.lfo.start(0);
        this.subOsc.start(0);

        // saw -> mixer
        this.oscillator.connect(this.mixerSaw)
        this.mixerSaw.connect(this.filters[0])

        // generate pulse -> mixer
        this.lfoPWM.connect(this.pulseGain.gain)
        this.envPWM.connect(this.pulseGain.gain)
        this.oscillator.connect(this.pulseGain)
        this.pulseGain.connect(this.pulseShaper)
        this.pulseShaper.connect(this.mixerPulse)
        this.mixerPulse.connect(this.filters[0])

        // sub -> mixer
        this.subOsc.connect(this.mixerSub);
        this.mixerSub.connect(this.filters[0]);

        this.filters[0].connect(this.filters[1])
        this.filters[1].connect(this.filters[2])
        this.filters[2].connect(this.vca);

        // noise -> mixer
        let noise = noiseSource(this.context);
        noise.connect(this.mixerNoise);
        this.mixerNoise.connect(this.filters[0]);

        // env
        this.envSource.connect(this.env);
        this.env.connect(this.envFilter)
        this.env.connect(this.envVCA);
        this.env.connect(this.envPWM);

        //this.envVCA.connect(this.vca.gain);

        this._output = this.context.createChannelMerger(2);
        this.vca.connect(this._output, 0, 0)
        this.vca.connect(this._output, 0, 1)

        this.updateFromState()
	}

	connectNodes() {
        // do we need to connect in connectNodes?  currently connecting in createNodes above..
	}

    // MIDI note handling

    processMIDIEvents(midiEvents: ScheduledMIDIEvent[]) {
		midiEvents.forEach (message => {
            if (message.event[0] == MIDI.NOTE_ON) {
                let midiNote = message.event[1]
                let velocity = message.event[2];
                if (velocity) this.noteOn(midiNote, message.time)
                else this.noteOff(midiNote, message.time)
            } else if (message.event[0] == MIDI.NOTE_OFF) {
                let midiNote = message.event[1]
                this.noteOff(midiNote, message.time)
            }
		});
    }


    noteOn(note: number, tickStartTime: number) {
        this.heldNotes[note] = true;
        this.noteUpdate(tickStartTime)
    }

    noteOff(note: number, tickStartTime: number) {
        this.heldNotes[note] = false;
        this.noteUpdate(tickStartTime)
    }

    allNotesOff(tickStartTime: number) {
        this.heldNotes.fill(false, 0, 128);
        this.noteUpdate(tickStartTime)
    }

    setPitch(note: number, tickStartTime: number, portamento: boolean) {
        // note 69 = freq 440
        // every 12 notes, double freq

        let rangeMultiples = [0.5, 1, 2, 4]
        this.targetFreq = 440 * Math.pow(2, ((note-69)/12)) * rangeMultiples[this.parameters.oscRange]

        let time = portamento ? this.parameters.portamentoTime/5 : 0

        this.oscillator.frequency.setTargetAtTime(this.targetFreq, tickStartTime, time);
        this.subOsc.frequency.setTargetAtTime(this.targetFreq, tickStartTime, time);

        // set kybd
        this.kybdGain.gain.setTargetAtTime((note-69) * 100 * this.parameters.filterKeyboard, tickStartTime, time);      
    }

    noteUpdate(tickStartTime: number) {
        tickStartTime += this.context.currentTime

        // find note we should be playing
        for (var i = this.heldNotes.length-1; i >= 0; i--) {
            if (this.heldNotes[i]) {
                break
            }
        }

        if (i == -1 && this.currentNote > 0) {
            // no notes are held, time to release the envelope
            let releaseTime = 0.002 + (this.parameters.envRelease * 9.998);

            if (this.parameters.vcaSource == 0) {
                this.vca.gain.setTargetAtTime(0.0, tickStartTime, releaseTime/5);
            } else {
                this.vca.gain.setTargetAtTime(0.0, tickStartTime, 0.01);
            }
            this.env.gain.setTargetAtTime(0.0, tickStartTime, releaseTime/5);

            this.currentNote = -1;
        }

        if (i > -1 && this.currentNote != i) {
            let portamento = (this.parameters.portamentoMode == 2 || (this.parameters.portamentoMode == 1 && this.currentNote != -1))

            // set frequencies
            this.setPitch(i, tickStartTime, portamento)
            
            if (this.currentNote == -1) {
                // time to start the envelope

                // ideal decay time is decayTime
                // setTargetAtTime will approach the ideal value approximately 63.2% every period
                // (1-.632)^5 = under 1% remaining
                // so a period 5x faster than our ideal decay time will be approximately right

                let attackTime = 0.0015 + (this.parameters.envAttack * this.parameters.envAttack * 3.9985);
                let decayTime = 0.002 + (this.parameters.envDecay * 9.998);

                if (this.parameters.vcaSource == 0) {
                    this.vca.gain.setTargetAtTime(1.0, tickStartTime, attackTime/5)
                    this.vca.gain.setTargetAtTime(this.parameters.envSustain, tickStartTime+attackTime, decayTime/5);
                } else {
                    this.vca.gain.setTargetAtTime(1.0, tickStartTime, 0.01);
                }
                this.env.gain.setTargetAtTime(1.0, tickStartTime, attackTime/5)
                this.env.gain.setTargetAtTime(this.parameters.envSustain, tickStartTime+attackTime, decayTime/5);
            }

            this.currentNote = i
        }
    }

    updateFromState() {
        let state = this.parameters

        if (!this.oscillator) {
            return
        }

        // Oscillator
        this.oscillator.detune.setValueAtTime(state.detune * 100, 0)

        this.lfoOscMod.gain.setValueAtTime(state.oscMod * state.oscMod * 200, 0);

        // sub oscillator
        if (state.subRange == 0) {
            this.subOsc.detune.setValueAtTime(-1200, 0);
        } else {
            this.subOsc.detune.setValueAtTime(-2400, 0);
        }

        let subWaves: OscillatorType[] = ["square", "square", "sine", "triangle"]
        this.subOsc.type = subWaves[state.subRange]

        // PWM
        // TODO this needs a scope on it to look at it
        if (state.pwmSource == 0) {
            this.pulseGain.gain.setValueAtTime(1.0, 0);
            this.envPWM.gain.setValueAtTime(0,0);

            this.lfoPWM.gain.setValueAtTime(state.pulseWidth * 0.2, 0);
        } else if (state.pwmSource == 1) {
            this.lfoPWM.gain.setValueAtTime(0, 0);
            this.envPWM.gain.setValueAtTime(0,0);

            this.pulseGain.gain.setValueAtTime(1.0 - (state.pulseWidth * 0.4), 0);
        } else if (state.pwmSource == 2) {
            this.pulseGain.gain.setValueAtTime(1.0, 0);

            this.lfoPWM.gain.setValueAtTime(0, 0);
            this.envPWM.gain.setValueAtTime(state.pulseWidth * -0.5, 0);
        }

        // LFO update
        this.lfo.type = lfoWaves[state.lfoWaveform]
        let lfoFrequency = 0.1 + (29.9 * state.lfoRate * state.lfoRate);
        this.lfo.frequency.setValueAtTime(lfoFrequency, 0);

        // Mixer
        this.mixerSaw.gain.setValueAtTime(state.mixerSaw, 0);
        this.mixerPulse.gain.setValueAtTime(state.mixerPulse, 0);
        this.mixerSub.gain.setValueAtTime(state.mixerSub, 0);
        this.mixerNoise.gain.setValueAtTime(state.mixerNoise, 0);

        // Filter
        let baseFreq = 10 + (19990 * state.filterFreq * state.filterFreq);
        this.filters.forEach(filter => {
            filter.frequency.setValueAtTime(baseFreq, 0);
            filter.Q.setValueAtTime(state.filterRes * 8, 0);
        })
        this.lfoFilter.gain.setValueAtTime(2400 * state.filterMod, 0);
        this.envFilter.gain.setValueAtTime(2400 * state.filterEnv, 0);

        if (state.vcaSource == 0) {
            this.envVCA.gain.setValueAtTime(1, 0);
        } else {
            this.envVCA.gain.setValueAtTime(0, 0);
        }
    }

}
