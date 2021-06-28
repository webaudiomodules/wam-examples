export default function ConvolverDisto(context, impulses, menuId) {
    var convolverNode, convolverGain, directGain;
    var inputGain = context.createGain();
    var outputGain = context.createGain();
    var decodedImpulse;

    var menuIRs;
    var IRs = impulses;

    var currentImpulse = IRs[0];
    var defaultImpulseURL = IRs[0].url;

    convolverNode = context.createConvolver();
    convolverNode.buffer = decodedImpulse;

    convolverGain = context.createGain();
    convolverGain.gain.value = 0;

    directGain = context.createGain();
    directGain.gain.value = 1;

    buildAudioGraphConvolver();
    setGain(0.2);
    loadImpulseByUrl(defaultImpulseURL);

    function loadSample(audioContext, url) {
		console.log("loadSample url = " + url)
      return new Promise(function (resolve, reject) {
        fetch(url)
          .then((response) => {
            return response.arrayBuffer();
          })
          .then((buffer) => {
            audioContext.decodeAudioData(buffer, (decodedAudioData) => {
              resolve(decodedAudioData);
            });
          });
      });
    }

    function loadImpulseByUrl(url) {
      const samples = Promise.all([loadSample(context, url)]).then(setImpulse);
    }

    function loadImpulseByName(name) {
      if (name === undefined) {
        name = IRs[0].name;
      }

      var url = "none";
      for (var i = 0; i < IRs.length; i++) {
        if (IRs[i].name === name) {
          url = IRs[i].url;
          currentImpulse = IRs[i];
          break;
        }
      }
      if (url === "none") {
      } else {
        loadImpulseByUrl(url);
      }
    }

    function setImpulse(param) {
      inputGain.gain.value =0;
      convolverNode.buffer = param[0];
      inputGain.gain.linearRampToValueAtTime(1, context.currentTime+1);
    }

    function buildAudioGraphConvolver() {
      inputGain.connect(directGain);
      directGain.connect(outputGain);

      inputGain.connect(convolverNode);
      convolverNode.connect(convolverGain);
      convolverGain.connect(outputGain);
    }

    function setGain(value) {
      var v1 = Math.cos((value * Math.PI) / 2);
      var v2 = Math.cos(((1 - value) * Math.PI) / 2);

      directGain.gain.value = v1;
      convolverGain.gain.value = v2;
    }

    function getGain() {
      return (2 * Math.acos(directGain.gain.value)) / Math.PI;
    }

    function getName() {
      return currentImpulse.name;
    }
    return {
      input: inputGain,
      output: outputGain,
      setGain: setGain,
      getGain: getGain,
      getName: getName,
      loadImpulseByName: loadImpulseByName,
    };
  }
