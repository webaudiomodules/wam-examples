export function constantSource(audioContext: BaseAudioContext) {
    if (audioContext.createConstantSource) {
        let source = audioContext.createConstantSource();
        source.start()
        return source;
    } else {
        // Implementation 1: works, probably more costly?
        // let osc = audioContext.createOscillator();
        // osc.waveform = "square"
        // osc.start();
        // let shaper = audioContext.createWaveShaper()
        // var curve = new Float32Array(2);
        // curve[0] = 1.0;
        // curve[1] = 1.0;
        // shaper.curve = curve;
        // osc.connect(shaper);
        // return shaper;

        // implementation 2: sample playback of 1.0 samples - works
        let length = audioContext.sampleRate
        var buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
        var noise = buffer.getChannelData(0)
    
        for (var i = 0; i < length; i++) {
            noise[i] = 1.0
        }

        var source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.loopStart = 0.0;
        source.loopEnd = 0.9;

        source.start();
        return source;
    }
}

export function noiseSource(audioContext: BaseAudioContext) {
    let length = audioContext.sampleRate
    var buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
    var noise = buffer.getChannelData(0)

    for (var i = 0; i < length; i++) {
        noise[i] = (Math.random() * 2) - 1;
    }
    var source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = 0.0;
    source.loopEnd = 0.9;

    source.start();
    return source;
}