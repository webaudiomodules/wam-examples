import { h, Component, render } from 'preact';
import { Knob } from './ui/Knob'
import { Select } from './ui/Select'
import { Fader } from './ui/Fader'

import Synth101 from '.';

// TODO put these in one spot and export them
let waves = ["sine", "square", "sawtooth", "triangle"]
let lfoWaves: OscillatorType[] = ["triangle", "square"]
let ranges = ["32'", "16'", "8'", "4'"]
let pwms = ["LFO", "Manual", "Env"]
let subRanges = ["-10ct", "-20ct pulse", "-20ct sine", "-20ct tri"]
let vcaSources = ["Env", "Gate"]
let envTriggers = ["Gate", "Trig", "Both"]
let portamentoModes = ["Off", "Auto", "On"]

export interface SynthViewProps {
    plugin: Synth101
  }
  
  export class SynthView extends Component<SynthViewProps, any> {
    constructor() {
      super();
    }
  
    // Lifecycle: Called whenever our component is created
    componentDidMount() {
    }
  
    // Lifecycle: Called just before our component will be destroyed
    componentWillUnmount() {
      console.log("Synth-101 unmounting")
    }
  
    detuneChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("detune", value)
    }
  
    waveformChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("waveform", value)
    }
  
    lfoRateChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("lfoRate", value)
    }
  
    lfoWaveformChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("lfoWaveform", value)
    }
  
    oscModChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("oscMod", value)
    }
  
    oscRangeChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("oscRange", value)
    }
  
    pulseWidthChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("pulseWidth", value)
    }
  
    pwmSourceChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("pwmSource", value)
    }
  
    subRangeChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("subRange", value)
    }
  
    mixerPulseChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("mixerPulse", value)
    }
  
    mixerSawChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("mixerSaw", value)
    }
  
    mixerSubChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("mixerSub", value)
    }
  
    mixerNoiseChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("mixerNoise", value)
    }
  
    filterFreqChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("filterFreq", value)
    }
  
    filterResChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("filterRes", value)
    }
  
    filterEnvChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("filterEnv", value)
    }
  
    filterModChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("filterMod", value)
    }
  
    filterKybdChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("filterKeyboard", value)
    }
  
    vcaSourceChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("vcaSource", value)
    }
  
    envTriggerChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("envTrigger", value)
    }
  
    envAttackChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("envAttack", value)
    }
  
    envDecayChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("envDecay", value)
    }
  
    envSustainChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("envSustain", value)
    }
  
    envReleaseChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("envRelease", value)
    }
  
    portamentoModeChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("portamentoMode", value)
    }
  
    portamentoTimeChanged(value: number) {
      this.props.plugin.audioNode.paramMgr.setParamValue("portamentoTime", value)
    }
  
    render() {
      h("div", {})

      let params = this.props.plugin.audioNode.paramMgr

      return <div class="synth-101">
          <div class="synth-101-section">
          <div class="synth-101-header">Portamento</div>
          <div class="synth-101-section-content" style="flex-direction: column">
            <Knob label="Time" value={params.getParamValue("portamentoTime")} onChange={(e) => this.portamentoTimeChanged(e)}/>
            <Select label="Mode" options={portamentoModes} value={params.getParamValue("portamentoMode")} onChange={(e) => this.portamentoModeChanged(parseInt(e))} />
          </div>
        </div>
        <div class="synth-101-section">
          <div class="synth-101-header">LFO</div>
          <div class="synth-101-section-content" style="flex-direction: column">
            <Knob label="Rate" value={params.getParamValue("lfoRate")} onChange={(e) => this.lfoRateChanged(e)}/>
            <Select label="Waveform" options={lfoWaves} value={params.getParamValue("lfoWaveform")} onChange={(e) => this.lfoWaveformChanged(parseInt(e))} />
          </div>
        </div>
        <div class="synth-101-section">
          <div class="synth-101-header">Oscillator</div>
          <div class="synth-101-section-content">
            <div style="display: flex; flex-direction: column">
              <Knob label="Tune" value={params.getParamValue("detune")} minimumValue={-0.5} maximumValue={0.5} bipolar={true} onChange={(e) => this.detuneChanged(e)}/>
              <Select label="Range" options={ranges} value={params.getParamValue("oscRange")} onChange={(e) => this.oscRangeChanged(parseInt(e))} />
            </div>
            <Fader label="Mod" value={params.getParamValue("oscMod")} onChange={(e) => this.oscModChanged(e)}/>
            <Fader label="PW" value={params.getParamValue("pulseWidth")} onChange={(e) => this.pulseWidthChanged(e)}/>
  
            <div style="display: flex; flex-direction: column">
              <Select label="PWM" options={pwms} value={params.getParamValue("pwmSource")} onChange={(e) => this.pwmSourceChanged(parseInt(e))} />
              <Select label="Sub Range" options={subRanges} value={params.getParamValue("subRange")} onChange={(e) => this.subRangeChanged(parseInt(e))} />
              </div>        
          </div>
        </div>
        <div class="synth-101-section">
          <div class="synth-101-header">Mixer</div>
          <div class="synth-101-section-content">
            <Fader label="Pulse" value={params.getParamValue("mixerPulse")} onChange={(e) => this.mixerPulseChanged(e)}/>
            <Fader label="Saw" value={params.getParamValue("mixerSaw")} onChange={(e) => this.mixerSawChanged(e)}/>
            <Fader label="Sub" value={params.getParamValue("mixerSub")} onChange={(e) => this.mixerSubChanged(e)}/>
            <Fader label="Noise" value={params.getParamValue("mixerNoise")} onChange={(e) => this.mixerNoiseChanged(e)}/>
          </div>
        </div>
        <div class="synth-101-section">
          <div class="synth-101-header">Filter</div>
          <div class="synth-101-section-content">
            <Fader label="Freq" value={params.getParamValue("filterFreq")} onChange={(e) => this.filterFreqChanged(e)}/>
            <Fader label="Res" value={params.getParamValue("filterRes")} onChange={(e) => this.filterResChanged(e)}/>
            <div style="width: 10px;"> </div>
            <Fader label="Env" value={params.getParamValue("filterEnv")} onChange={(e) => this.filterEnvChanged(e)}/>
            <Fader label="Mod" value={params.getParamValue("filterMod")} onChange={(e) => this.filterModChanged(e)}/>
            <Fader label="Kybd" value={params.getParamValue("filterKybd")} onChange={(e) => this.filterKybdChanged(e)}/>
          </div>
        </div>
        <div class="synth-101-section">
        <div class="synth-101-header">VCA / Env</div>
        <div class="synth-101-section-content">
          <div style="display: flex; flex-direction: column">
            <Select label="VCA" options={vcaSources} value={params.getParamValue("vcaSource")} onChange={(e) => this.vcaSourceChanged(parseInt(e))} />
            <Select label="Trigger" options={envTriggers} value={params.getParamValue("envTrigger")} onChange={(e) => this.envTriggerChanged(parseInt(e))} />
          </div>
          <Fader label="A" value={params.getParamValue("envAttack")} onChange={(e) => this.envAttackChanged(e)}/>
          <Fader label="D" value={params.getParamValue("envDecay")} onChange={(e) => this.envDecayChanged(e)}/>
          <Fader label="S" value={params.getParamValue("envSustain")} onChange={(e) => this.envSustainChanged(e)}/>
          <Fader label="R" value={params.getParamValue("envRelease")} onChange={(e) => this.envReleaseChanged(e)}/>
        </div>
      </div>
      <style>
        {this.css()}
      </style>
      </div>
    }

    css() {
      // this is bad but quick :)
      return `
      .synth-101 {
        background-color: #4773cc;
        color: white;
        display: flex;
    }
    
    .synth-101 .component-wrapper {
        padding: 5px;
    }
    
    .synth-101-section {
        /* border: 1px solid white; */
        border: 1px solid rgba(0,0,0,0.3);
    
        border-radius: 2px;
        margin: 5px;
        display: flex;
        flex-direction: column;
    }
    
    .synth-101-header {
        background-color: rgba(0,0,0,0.2);
        padding: 2px;
    }
    
    .synth-101-section-content {
        display: flex;
        justify-content: stretch;
        flex: 1;
        padding: 10px;
    }
    
    /* UI elements */
    
    .component-wrapper {
        display: flex;
        flex-direction: column; 
        align-content: center; 
        text-align: center;
        flex: 1;
    }
    
    .component-knob, .component-fader {
        margin-top: auto;
    }
    
    .component-select {
        margin-top: auto;
        margin-bottom: 3px;
    }
    `
    }
  }