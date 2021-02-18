import { h, Component, render } from 'preact';
import Synth101 from '.';

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
    }
  
    detuneChanged(value: number) {
      this.props.plugin.audioNode.setParameterValues()

      this.props.parameters.setValue("detune", value)
    }
  
    waveformChanged(value: number) {
        this.props.parameters.setValue("waveform", value)
    }
  
    lfoRateChanged(value: number) {
        this.props.parameters.setValue("lfoRate", value)
    }
  
    lfoWaveformChanged(value: number) {
        this.props.parameters.setValue("lfoWaveform", value)
    }
  
    oscModChanged(value: number) {
        this.props.parameters.setValue("oscMod", value)
    }
  
    oscRangeChanged(value: number) {
        this.props.parameters.setValue("oscRange", value)
    }
  
    pulseWidthChanged(value: number) {
        this.props.parameters.setValue("pulseWidth", value)
    }
  
    pwmSourceChanged(value: number) {
        this.props.parameters.setValue("pulseWidth", value)
    }
  
    subRangeChanged(value: number) {
        this.props.parameters.setValue("subRange", value)
    }
  
    mixerPulseChanged(value: number) {
        this.props.parameters.setValue("mixerPulse", value)
    }
  
    mixerSawChanged(value: number) {
        this.props.parameters.setValue("mixerSaw", value)
    }
  
    mixerSubChanged(value: number) {
        this.props.parameters.setValue("mixerSub", value)
    }
  
    mixerNoiseChanged(value: number) {
        this.props.parameters.setValue("mixerNoise", value)
    }
  
    filterFreqChanged(value: number) {
        this.props.parameters.setValue("filterFreq", value)
    }
  
    filterResChanged(value: number) {
        this.props.parameters.setValue("filterRes", value)
    }
  
    filterEnvChanged(value: number) {
        this.props.parameters.setValue("filterEnv", value)
    }
  
    filterModChanged(value: number) {
        this.props.parameters.setValue("filterMod", value)
    }
  
    filterKybdChanged(value: number) {
        this.props.parameters.setValue("filterKeyboard", value)
    }
  
    vcaSourceChanged(value: number) {
        this.props.parameters.setValue("vcaSource", value)
    }
  
    envTriggerChanged(value: number) {
        this.props.parameters.setValue("envTrigger", value)
    }
  
    envAttackChanged(value: number) {
        this.props.parameters.setValue("envAttack", value)
    }
  
    envDecayChanged(value: number) {
        this.props.parameters.setValue("envDecay", value)
    }
  
    envSustainChanged(value: number) {
        this.props.parameters.setValue("envSustain", value)
    }
  
    envReleaseChanged(value: number) {
        this.props.parameters.setValue("envRelease", value)
    }
  
    portamentoModeChanged(value: number) {
        this.props.parameters.setValue("portamentoMode", value)
    }
  
    portamentoTimeChanged(value: number) {
        this.props.parameters.setValue("portamentoTime", value)
    }
  
    render() {
      return <div class="synth-101">
          <div class="synth-101-section">
          <div class="synth-101-header">Portamento</div>
          <div class="synth-101-section-content" style="flex-direction: column">
            <Knob label="Time" value={this.props.plugin.audioNode.getParameterValues(true, "portamentoTime")} onChange={(e) => this.portamentoTimeChanged(e)}/>
            <Select label="Mode" options={portamentoModes} value={this.props.parameters.state.portamentoMode} onChange={(e) => this.portamentoModeChanged(parseInt(e))} />
          </div>
        </div>
        <div class="synth-101-section">
          <div class="synth-101-header">LFO</div>
          <div class="synth-101-section-content" style="flex-direction: column">
            <Knob label="Rate" value={this.props.parameters.state.lfoRate} onChange={(e) => this.lfoRateChanged(e)}/>
            <Select label="Waveform" options={lfoWaves} value={this.props.parameters.state.lfoWaveform} onChange={(e) => this.lfoWaveformChanged(parseInt(e))} />
          </div>
        </div>
        <div class="synth-101-section">
          <div class="synth-101-header">Oscillator</div>
          <div class="synth-101-section-content">
            <div style="display: flex; flex-direction: column">
              <Knob label="Tune" value={this.props.parameters.state.detune} minimumValue={-0.5} maximumValue={0.5} bipolar={true} onChange={(e) => this.detuneChanged(e)}/>
              <Select label="Range" options={ranges} value={this.props.parameters.state.oscRange} onChange={(e) => this.oscRangeChanged(parseInt(e))} />
            </div>
            <Fader label="Mod" value={this.props.parameters.state.oscMod} onChange={(e) => this.oscModChanged(e)}/>
            <Fader label="PW" value={this.props.parameters.state.pulseWidth} onChange={(e) => this.pulseWidthChanged(e)}/>
  
            <div style="display: flex; flex-direction: column">
              <Select label="PWM" options={pwms} value={this.props.parameters.state.pwmSource} onChange={(e) => this.pwmSourceChanged(parseInt(e))} />
              <Select label="Sub Range" options={subRanges} value={this.props.parameters.state.subRange} onChange={(e) => this.subRangeChanged(parseInt(e))} />
              </div>        
          </div>
        </div>
        <div class="synth-101-section">
          <div class="synth-101-header">Mixer</div>
          <div class="synth-101-section-content">
            <Fader label="Pulse" value={this.props.parameters.state.mixerPulse} onChange={(e) => this.mixerPulseChanged(e)}/>
            <Fader label="Saw" value={this.props.parameters.state.mixerSaw} onChange={(e) => this.mixerSawChanged(e)}/>
            <Fader label="Sub" value={this.props.parameters.state.mixerSub} onChange={(e) => this.mixerSubChanged(e)}/>
            <Fader label="Noise" value={this.props.parameters.state.mixerNoise} onChange={(e) => this.mixerNoiseChanged(e)}/>
          </div>
        </div>
        <div class="synth-101-section">
          <div class="synth-101-header">Filter</div>
          <div class="synth-101-section-content">
            <Fader label="Freq" value={this.props.parameters.state.filterFreq} onChange={(e) => this.filterFreqChanged(e)}/>
            <Fader label="Res" value={this.props.parameters.state.filterRes} onChange={(e) => this.filterResChanged(e)}/>
            <div style="width: 10px;"> </div>
            <Fader label="Env" value={this.props.parameters.state.filterEnv} onChange={(e) => this.filterEnvChanged(e)}/>
            <Fader label="Mod" value={this.props.parameters.state.filterMod} onChange={(e) => this.filterModChanged(e)}/>
            <Fader label="Kybd" value={this.props.parameters.state.filterKybd} onChange={(e) => this.filterKybdChanged(e)}/>
          </div>
        </div>
        <div class="synth-101-section">
        <div class="synth-101-header">VCA / Env</div>
        <div class="synth-101-section-content">
          <div style="display: flex; flex-direction: column">
            <Select label="VCA" options={vcaSources} value={this.props.parameters.state.vcaSource} onChange={(e) => this.vcaSourceChanged(parseInt(e))} />
            <Select label="Trigger" options={envTriggers} value={this.props.parameters.state.envTrigger} onChange={(e) => this.envTriggerChanged(parseInt(e))} />
          </div>
          <Fader label="A" value={this.props.parameters.state.envAttack} onChange={(e) => this.envAttackChanged(e)}/>
          <Fader label="D" value={this.props.parameters.state.envDecay} onChange={(e) => this.envDecayChanged(e)}/>
          <Fader label="S" value={this.props.parameters.state.envSustain} onChange={(e) => this.envSustainChanged(e)}/>
          <Fader label="R" value={this.props.parameters.state.envRelease} onChange={(e) => this.envReleaseChanged(e)}/>
        </div>
      </div>
      </div>
    }
  }