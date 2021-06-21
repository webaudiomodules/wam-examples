
export default function EqualizerDisto(ctx) {
    var filters = [];
  
    [60, 170, 350, 1000, 3500, 10000].forEach(function (freq, i) {
      var eq = ctx.createBiquadFilter();
      eq.frequency.value = freq;
      eq.type = "peaking";
      eq.gain.value = 0;
      filters.push(eq);
    });
  
    for (var i = 0; i < filters.length - 1; i++) {
      filters[i].connect(filters[i + 1]);
    }
  
    function changeGain(sliderVal, nbFilter) {
      var value = parseFloat(sliderVal);
      filters[nbFilter].gain.value = value;
    }
  
    function setValues(values) {
      values.forEach(function (val, index) {
        changeGain(val, index);
      });
    }
  
    function getValues() {
      var values = [];
      filters.forEach(function (f, index) {
        values.push(f.gain.value);
      });
      return values;
    }
  
    return {
      input: filters[0],
      output: filters[filters.length - 1],
      setValues: setValues,
      getValues: getValues,
      changeGain: changeGain,
    };
  }
  
  