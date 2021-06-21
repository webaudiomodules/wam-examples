export default function BoostDisto(context) {
    var activated = false;
  
    var input = context.createGain();
    var inputGain = context.createGain();
    inputGain.gain.value = 0;
    var byPass = context.createGain();
    byPass.gain.value = 1;
    var filter = context.createBiquadFilter();
    filter.frequency.value = 3317;
    var shaper = context.createWaveShaper();
    shaper.curve = makeDistortionCurve(640);
    var outputGain = context.createGain();
    outputGain.gain.value = 2;
    var output = context.createGain();
    input.connect(inputGain);
    inputGain.connect(shaper);
    shaper.connect(filter);
    filter.connect(outputGain);
    outputGain.connect(output);
  
    input.connect(byPass);
    byPass.connect(output);
  
    function isActivated() {
      return activated;
    }
  
    function onOff(wantedState) {
      if (wantedState === undefined) {
        if (activated) toggle();
        return;
      }
      var currentState = activated;
  
      if (wantedState !== currentState) {
        toggle();
      }
    }
  
    function toggle() {
      if (!activated) {
        byPass.gain.value = 0;
        inputGain.gain.value = 1;
      } else {
        byPass.gain.value = 1;
        inputGain.gain.value = 0;
      }
      activated = !activated;
    }
  
    function setOversampling(value) {
      shaper.oversample = value;
    }
  
    function makeDistortionCurve(k) {
      var n_samples = 44100;
      var curve = new Float32Array(n_samples);
      var deg = Math.PI / 180;
      for (var i = 0; i < n_samples; i += 1) {
        var x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
      return curve;
    }
    return {
      input: input,
      output: output,
      onOff: onOff,
      toggle: toggle,
      isActivated: isActivated,
      setOversampling: setOversampling,
    };
  };
  