
/*
Code generated with Faust version 2.28.6
Compilation options: -lang wasm-ib -scal -ftz 2
*/

function getJSONStonePhaserStereo() {
	return '{"name": "StonePhaserStereo","filename": "StonePhaserStereo.dsp","version": "2.28.6","compile_options": "-lang wasm-ib -scal -ftz 2","include_pathnames": ["/usr/local/share/faust","/usr/local/share/faust","/usr/share/faust",".","/tmp/sessions/5B85546961804B5328FFEE9E8E97254F2B6121CF/web/wap"],"size": 788,"inputs": 2,"outputs": 2,"meta": [ { "author": "Jean Pierre Cimalando" },{ "basics_lib_name": "Faust Basic Element Library" },{ "basics_lib_version": "0.1" },{ "compilation_options": "-single -scal -I libraries/ -I project/ -lang wasm" },{ "filename": "StonePhaserStereo.dsp" },{ "filters_lib_fir_author": "Julius O. Smith III" },{ "filters_lib_fir_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_fir_license": "MIT-style STK-4.3 license" },{ "filters_lib_iir_author": "Julius O. Smith III" },{ "filters_lib_iir_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_iir_license": "MIT-style STK-4.3 license" },{ "filters_lib_lowpass0_highpass1": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_name": "Faust Filters Library" },{ "library_path": "FaustDSP" },{ "license": "CC0-1.0" },{ "maths_lib_author": "GRAME" },{ "maths_lib_copyright": "GRAME" },{ "maths_lib_license": "LGPL with exception" },{ "maths_lib_name": "Faust Math Library" },{ "maths_lib_version": "2.1" },{ "name": "StonePhaserStereo" },{ "oscillators_lib_name": "Faust Oscillator Library" },{ "oscillators_lib_version": "0.0" },{ "signals_lib_name": "Faust Signal Routing Library" },{ "signals_lib_version": "0.0" },{ "version": "1.2.2" }],"ui": [ {"type": "vgroup","label": "StonePhaserStereo","items": [ {"type": "checkbox","label": "Bypass","address": "/StonePhaserStereo/Bypass","index": 528,"meta": [{ "0": "" },{ "symbol": "bypass" }]},{"type": "checkbox","label": "Color","address": "/StonePhaserStereo/Color","index": 572,"meta": [{ "1": "" },{ "symbol": "color" }]},{"type": "hslider","label": "LFO","address": "/StonePhaserStereo/LFO","index": 644,"meta": [{ "2": "" },{ "scale": "log" },{ "style": "knob" },{ "symbol": "lfo_frequency" },{ "unit": "Hz" }],"init": 0.2,"min": 0.01,"max": 5,"step": 0.01},{"type": "hslider","label": "Feedback","address": "/StonePhaserStereo/Feedback","index": 580,"meta": [{ "3": "" },{ "integer": "" },{ "style": "knob" },{ "symbol": "feedback_depth" },{ "unit": "%" }],"init": 75,"min": 0,"max": 99,"step": 1},{"type": "hslider","label": "Lo-cut","address": "/StonePhaserStereo/Lo-cut","index": 604,"meta": [{ "4": "" },{ "abbrev": "Fb bass cut" },{ "scale": "log" },{ "style": "knob" },{ "symbol": "feedback_hpf_cutoff" },{ "unit": "Hz" }],"init": 500,"min": 10,"max": 5000,"step": 1},{"type": "hslider","label": "Mix","address": "/StonePhaserStereo/Mix","index": 540,"meta": [{ "5": "" },{ "integer": "" },{ "style": "knob" },{ "symbol": "mix" },{ "unit": "%" }],"init": 50,"min": 0,"max": 100,"step": 1},{"type": "hslider","label": "Stereo phase","address": "/StonePhaserStereo/Stereo_phase","index": 728,"meta": [{ "6": "" },{ "integer": "" },{ "style": "knob" },{ "symbol": "stereo_phase" },{ "unit": "deg" }],"init": 0,"min": -180,"max": 180,"step": 1}]}]}';
}
function getBase64CodeStonePhaserStereo() { return "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biBQaWVycmUgQ2ltYWxhbmRvIiB9LHsgImJhc2ljc19saWJfbmFtZSI6ICJGYXVzdCBCYXNpYyBFbGVtZW50IExpYnJhcnkiIH0seyAiYmFzaWNzX2xpYl92ZXJzaW9uIjogIjAuMSIgfSx7ICJjb21waWxhdGlvbl9vcHRpb25zIjogIi1zaW5nbGUgLXNjYWwgLUkgbGlicmFyaWVzLyAtSSBwcm9qZWN0LyAtbGFuZyB3YXNtIiB9LHsgImZpbGVuYW1lIjogIlN0b25lUGhhc2VyU3RlcmVvLmRzcCIgfSx7ICJmaWx0ZXJzX2xpYl9maXJfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfZmlyX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl9maXJfbGljZW5zZSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnNfbGliX2lpcl9hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl9paXJfY29weXJpZ2h0IjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnNfbGliX2lpcl9saWNlbnNlIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVyc19saWJfbG93cGFzczBfaGlnaHBhc3MxIjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnNfbGliX25hbWUiOiAiRmF1c3QgRmlsdGVycyBMaWJyYXJ5IiB9LHsgImxpYnJhcnlfcGF0aCI6ICJGYXVzdERTUCIgfSx7ICJsaWNlbnNlIjogIkNDMC0xLjAiIH0seyAibWF0aHNfbGliX2F1dGhvciI6ICJHUkFNRSIgfSx7ICJtYXRoc19saWJfY29weXJpZ2h0IjogIkdSQU1FIiB9LHsgIm1hdGhzX2xpYl9saWNlbnNlIjogIkxHUEwgd2l0aCBleGNlcHRpb24iIH0seyAibWF0aHNfbGliX25hbWUiOiAiRmF1c3QgTWF0aCBMaWJyYXJ5IiB9LHsgIm1hdGhzX2xpYl92ZXJzaW9uIjogIjIuMSIgfSx7ICJuYW1lIjogIlN0b25lUGhhc2VyU3RlcmVvIiB9LHsgIm9zY2lsbGF0b3JzX2xpYl9uYW1lIjogIkZhdXN0IE9zY2lsbGF0b3IgTGlicmFyeSIgfSx7ICJvc2NpbGxhdG9yc19saWJfdmVyc2lvbiI6ICIwLjAiIH0seyAic2lnbmFsc19saWJfbmFtZSI6ICJGYXVzdCBTaWduYWwgUm91dGluZyBMaWJyYXJ5IiB9LHsgInNpZ25hbHNfbGliX3ZlcnNpb24iOiAiMC4wIiB9LHsgInZlcnNpb24iOiAiMS4yLjIiIH1dLCJ1aSI6IFsgeyJ0eXBlIjogInZncm91cCIsImxhYmVsIjogIlN0b25lUGhhc2VyU3RlcmVvIiwiaXRlbXMiOiBbIHsidHlwZSI6ICJjaGVja2JveCIsImxhYmVsIjogIkJ5cGFzcyIsImFkZHJlc3MiOiAiL1N0b25lUGhhc2VyU3RlcmVvL0J5cGFzcyIsImluZGV4IjogNTI4LCJtZXRhIjogW3sgIjAiOiAiIiB9LHsgInN5bWJvbCI6ICJieXBhc3MiIH1dfSx7InR5cGUiOiAiY2hlY2tib3giLCJsYWJlbCI6ICJDb2xvciIsImFkZHJlc3MiOiAiL1N0b25lUGhhc2VyU3RlcmVvL0NvbG9yIiwiaW5kZXgiOiA1NzIsIm1ldGEiOiBbeyAiMSI6ICIiIH0seyAic3ltYm9sIjogImNvbG9yIiB9XX0seyJ0eXBlIjogImhzbGlkZXIiLCJsYWJlbCI6ICJMRk8iLCJhZGRyZXNzIjogIi9TdG9uZVBoYXNlclN0ZXJlby9MRk8iLCJpbmRleCI6IDY0NCwibWV0YSI6IFt7ICIyIjogIiIgfSx7ICJzY2FsZSI6ICJsb2ciIH0seyAic3R5bGUiOiAia25vYiIgfSx7ICJzeW1ib2wiOiAibGZvX2ZyZXF1ZW5jeSIgfSx7ICJ1bml0IjogIkh6IiB9XSwiaW5pdCI6IDAuMiwibWluIjogMC4wMSwibWF4IjogNSwic3RlcCI6IDAuMDF9LHsidHlwZSI6ICJoc2xpZGVyIiwibGFiZWwiOiAiRmVlZGJhY2siLCJhZGRyZXNzIjogIi9TdG9uZVBoYXNlclN0ZXJlby9GZWVkYmFjayIsImluZGV4IjogNTgwLCJtZXRhIjogW3sgIjMiOiAiIiB9LHsgImludGVnZXIiOiAiIiB9LHsgInN0eWxlIjogImtub2IiIH0seyAic3ltYm9sIjogImZlZWRiYWNrX2RlcHRoIiB9LHsgInVuaXQiOiAiJSIgfV0sImluaXQiOiA3NSwibWluIjogMCwibWF4IjogOTksInN0ZXAiOiAxfSx7InR5cGUiOiAiaHNsaWRlciIsImxhYmVsIjogIkxvLWN1dCIsImFkZHJlc3MiOiAiL1N0b25lUGhhc2VyU3RlcmVvL0xvLWN1dCIsImluZGV4IjogNjA0LCJtZXRhIjogW3sgIjQiOiAiIiB9LHsgImFiYnJldiI6ICJGYiBiYXNzIGN1dCIgfSx7ICJzY2FsZSI6ICJsb2ciIH0seyAic3R5bGUiOiAia25vYiIgfSx7ICJzeW1ib2wiOiAiZmVlZGJhY2tfaHBmX2N1dG9mZiIgfSx7ICJ1bml0IjogIkh6IiB9XSwiaW5pdCI6IDUwMCwibWluIjogMTAsIm1heCI6IDUwMDAsInN0ZXAiOiAxfSx7InR5cGUiOiAiaHNsaWRlciIsImxhYmVsIjogIk1peCIsImFkZHJlc3MiOiAiL1N0b25lUGhhc2VyU3RlcmVvL01peCIsImluZGV4IjogNTQwLCJtZXRhIjogW3sgIjUiOiAiIiB9LHsgImludGVnZXIiOiAiIiB9LHsgInN0eWxlIjogImtub2IiIH0seyAic3ltYm9sIjogIm1peCIgfSx7ICJ1bml0IjogIiUiIH1dLCJpbml0IjogNTAsIm1pbiI6IDAsIm1heCI6IDEwMCwic3RlcCI6IDF9LHsidHlwZSI6ICJoc2xpZGVyIiwibGFiZWwiOiAiU3RlcmVvIHBoYXNlIiwiYWRkcmVzcyI6ICIvU3RvbmVQaGFzZXJTdGVyZW8vU3RlcmVvX3BoYXNlIiwiaW5kZXgiOiA3MjgsIm1ldGEiOiBbeyAiNiI6ICIiIH0seyAiaW50ZWdlciI6ICIiIH0seyAic3R5bGUiOiAia25vYiIgfSx7ICJzeW1ib2wiOiAic3RlcmVvX3BoYXNlIiB9LHsgInVuaXQiOiAiZGVnIiB9XSwiaW5pdCI6IDAsIm1pbiI6IC0xODAsIm1heCI6IDE4MCwic3RlcCI6IDF9XX1dfQ=="; }

/*
 faust2wasm: GRAME 2017-2019
*/

'use strict';

if (typeof (AudioWorkletNode) === "undefined") {
    alert("AudioWorklet is not supported in this browser !")
}

class StonePhaserStereoNode extends AudioWorkletNode {

    constructor(context, baseURL, options) {
        super(context, 'StonePhaserStereo', options);

        this.baseURL = baseURL;
        this.json = options.processorOptions.json;
        this.json_object = JSON.parse(this.json);

        // JSON parsing functions
        this.parse_ui = function (ui, obj) {
            for (var i = 0; i < ui.length; i++) {
                this.parse_group(ui[i], obj);
            }
        }

        this.parse_group = function (group, obj) {
            if (group.items) {
                this.parse_items(group.items, obj);
            }
        }

        this.parse_items = function (items, obj) {
            for (var i = 0; i < items.length; i++) {
                this.parse_item(items[i], obj);
            }
        }

        this.parse_item = function (item, obj) {
            if (item.type === "vgroup"
                || item.type === "hgroup"
                || item.type === "tgroup") {
                this.parse_items(item.items, obj);
            } else if (item.type === "hbargraph"
                || item.type === "vbargraph") {
                // Keep bargraph adresses
                obj.outputs_items.push(item.address);
            } else if (item.type === "vslider"
                || item.type === "hslider"
                || item.type === "button"
                || item.type === "checkbox"
                || item.type === "nentry") {
                // Keep inputs adresses
                obj.inputs_items.push(item.address);
                obj.descriptor.push(item);
                // Decode MIDI
                if (item.meta !== undefined) {
                    for (var i = 0; i < item.meta.length; i++) {
                        if (item.meta[i].midi !== undefined) {
                            if (item.meta[i].midi.trim() === "pitchwheel") {
                                obj.fPitchwheelLabel.push({
                                    path: item.address,
                                    min: parseFloat(item.min),
                                    max: parseFloat(item.max)
                                });
                            } else if (item.meta[i].midi.trim().split(" ")[0] === "ctrl") {
                                obj.fCtrlLabel[parseInt(item.meta[i].midi.trim().split(" ")[1])]
                                    .push({
                                        path: item.address,
                                        min: parseFloat(item.min),
                                        max: parseFloat(item.max)
                                    });
                            }
                        }
                    }
                }
                // Define setXXX/getXXX, replacing '/c' with 'C' everywhere in the string
                var set_name = "set" + item.address;
                var get_name = "get" + item.address;
                set_name = set_name.replace(/\/./g, (x) => { return x.substr(1, 1).toUpperCase(); });
                get_name = get_name.replace(/\/./g, (x) => { return x.substr(1, 1).toUpperCase(); });
                obj[set_name] = (val) => { obj.setParamValue(item.address, val); };
                obj[get_name] = () => { return obj.getParamValue(item.address); };
                //console.log(set_name);
                //console.log(get_name);
            }
        }

        this.output_handler = null;

        // input/output items
        this.inputs_items = [];
        this.outputs_items = [];
        this.descriptor = [];

        // MIDI
        this.fPitchwheelLabel = [];
        this.fCtrlLabel = new Array(128);
        for (var i = 0; i < this.fCtrlLabel.length; i++) { this.fCtrlLabel[i] = []; }

        // Parse UI
        this.parse_ui(this.json_object.ui, this);

        // Set message handler
        this.port.onmessage = this.handleMessage.bind(this);
        try {
            if (this.parameters) this.parameters.forEach(p => p.automationRate = "k-rate");
        } catch (e) { }
    }

    // To be called by the message port with messages coming from the processor
    handleMessage(event) {
        var msg = event.data;
        if (this.output_handler) {
            this.output_handler(msg.path, msg.value);
        }
    }

    // Public API

    /**
     * Destroy the node, deallocate resources.
     */
    destroy() {
        this.port.postMessage({ type: "destroy" });
        this.port.close();
    }

    /**
     *  Returns a full JSON description of the DSP.
     */
    getJSON() {
        return this.json;
    }

    // For WAP
    async getMetadata() {
        return new Promise(resolve => {
            let real_url = (this.baseURL === "") ? "main.json" : (this.baseURL + "/main.json");
            fetch(real_url).then(responseJSON => {
                return responseJSON.json();
            }).then(json => {
                resolve(json);
            })
        });
    }

    /**
     *  Set the control value at a given path.
     *
     * @param path - a path to the control
     * @param val - the value to be set
     */
    setParamValue(path, val) {
        // Needed for sample accurate control
        this.parameters.get(path).setValueAtTime(val, 0);
    }

    // For WAP
    setParam(path, val) {
        // Needed for sample accurate control
        this.parameters.get(path).setValueAtTime(val, 0);
    }

    /**
     *  Get the control value at a given path.
     *
     * @return the current control value
     */
    getParamValue(path) {
        return this.parameters.get(path).value;
    }

    // For WAP
    getParam(path) {
        return this.parameters.get(path).value;
    }

    /**
     * Setup a control output handler with a function of type (path, value)
     * to be used on each generated output value. This handler will be called
     * each audio cycle at the end of the 'compute' method.
     *
     * @param handler - a function of type function(path, value)
     */
    setOutputParamHandler(handler) {
        this.output_handler = handler;
    }

    /**
     * Get the current output handler.
     */
    getOutputParamHandler() {
        return this.output_handler;
    }

    getNumInputs() {
        return parseInt(this.json_object.inputs);
    }

    getNumOutputs() {
        return parseInt(this.json_object.outputs);
    }

    // For WAP
    inputChannelCount() {
        return parseInt(this.json_object.inputs);
    }

    outputChannelCount() {
        return parseInt(this.json_object.outputs);
    }

    /**
     * Returns an array of all input paths (to be used with setParamValue/getParamValue)
     */
    getParams() {
        return this.inputs_items;
    }

    // For WAP
    getDescriptor() {
        var desc = {};
        for (const item in this.descriptor) {
            if (this.descriptor.hasOwnProperty(item)) {
                if (this.descriptor[item].label != "bypass") {
                    desc = Object.assign({ [this.descriptor[item].label]: { minValue: this.descriptor[item].min, maxValue: this.descriptor[item].max, defaultValue: this.descriptor[item].init } }, desc);
                }
            }
        }
        return desc;
    }

    /**
     * Control change
     *
     * @param channel - the MIDI channel (0..15, not used for now)
     * @param ctrl - the MIDI controller number (0..127)
     * @param value - the MIDI controller value (0..127)
     */
    ctrlChange(channel, ctrl, value) {
        if (this.fCtrlLabel[ctrl] !== []) {
            for (var i = 0; i < this.fCtrlLabel[ctrl].length; i++) {
                var path = this.fCtrlLabel[ctrl][i].path;
                this.setParamValue(path, StonePhaserStereoNode.remap(value, 0, 127, this.fCtrlLabel[ctrl][i].min, this.fCtrlLabel[ctrl][i].max));
                if (this.output_handler) {
                    this.output_handler(path, this.getParamValue(path));
                }
            }
        }
    }

    /**
     * PitchWeel
     *
     * @param channel - the MIDI channel (0..15, not used for now)
     * @param value - the MIDI controller value (0..16383)
     */
    pitchWheel(channel, wheel) {
        for (var i = 0; i < this.fPitchwheelLabel.length; i++) {
            var pw = this.fPitchwheelLabel[i];
            this.setParamValue(pw.path, StonePhaserStereoNode.remap(wheel, 0, 16383, pw.min, pw.max));
            if (this.output_handler) {
                this.output_handler(pw.path, this.getParamValue(pw.path));
            }
        }
    }

    /**
     * Generic MIDI message handler.
     */
    midiMessage(data) {
        var cmd = data[0] >> 4;
        var channel = data[0] & 0xf;
        var data1 = data[1];
        var data2 = data[2];

        if (channel === 9) {
            return;
        } else if (cmd === 11) {
            this.ctrlChange(channel, data1, data2);
        } else if (cmd === 14) {
            this.pitchWheel(channel, (data2 * 128.0 + data1));
        }
    }

    // For WAP
    onMidi(data) {
        midiMessage(data);
    }

    /**
     * @returns {Object} describes the path for each available param and its current value
     */
    async getState() {
        var params = new Object();
        for (let i = 0; i < this.getParams().length; i++) {
            Object.assign(params, { [this.getParams()[i]]: `${this.getParam(this.getParams()[i])}` });
        }
        return new Promise(resolve => { resolve(params) });
    }

    /**
     * Sets each params with the value indicated in the state object
     * @param {Object} state 
     */
    async setState(state) {
        return new Promise(resolve => {
            for (const param in state) {
                if (state.hasOwnProperty(param)) this.setParam(param, state[param]);
            }
            try {
                this.gui.setAttribute('state', JSON.stringify(state));
            } catch (error) {
                console.warn("Plugin without gui or GUI not defined", error);
            }
            resolve(state);
        })
    }

    /**
     * A different call closer to the preset management
     * @param {Object} patch to assign as a preset to the node
     */
    setPatch(patch) {
        this.setState(this.presets[patch])
    }

    static remap(v, mn0, mx0, mn1, mx1) {
        return (1.0 * (v - mn0) / (mx0 - mn0)) * (mx1 - mn1) + mn1;
    }

}

// Factory class
class StonePhaserStereo {

    static fWorkletProcessors;

    /**
     * Factory constructor.
     *
     * @param context - the audio context
     * @param baseURL - the baseURL of the plugin folder
     */
    constructor(context, baseURL = "") {
        console.log("baseLatency " + context.baseLatency);
        console.log("outputLatency " + context.outputLatency);
        console.log("sampleRate " + context.sampleRate);

        this.context = context;
        this.baseURL = baseURL;
        this.pathTable = [];

        this.fWorkletProcessors = this.fWorkletProcessors || [];
    }

    heap2Str(buf) {
        let str = "";
        let i = 0;
        while (buf[i] !== 0) {
            str += String.fromCharCode(buf[i++]);
        }
        return str;
    }

    /**
     * Load additionnal resources to prepare the custom AudioWorkletNode. Returns a promise to be used with the created node.
     */
    async load() {
        try {
            const importObject = {
                env: {
                    memoryBase: 0,
                    tableBase: 0,
                    _abs: Math.abs,

                    // Float version
                    _acosf: Math.acos,
                    _asinf: Math.asin,
                    _atanf: Math.atan,
                    _atan2f: Math.atan2,
                    _ceilf: Math.ceil,
                    _cosf: Math.cos,
                    _expf: Math.exp,
                    _floorf: Math.floor,
                    _fmodf: (x, y) => x % y,
                    _logf: Math.log,
                    _log10f: Math.log10,
                    _max_f: Math.max,
                    _min_f: Math.min,
                    _remainderf: (x, y) => x - Math.round(x / y) * y,
                    _powf: Math.pow,
                    _roundf: Math.fround,
                    _sinf: Math.sin,
                    _sqrtf: Math.sqrt,
                    _tanf: Math.tan,
                    _acoshf: Math.acosh,
                    _asinhf: Math.asinh,
                    _atanhf: Math.atanh,
                    _coshf: Math.cosh,
                    _sinhf: Math.sinh,
                    _tanhf: Math.tanh,

                    // Double version
                    _acos: Math.acos,
                    _asin: Math.asin,
                    _atan: Math.atan,
                    _atan2: Math.atan2,
                    _ceil: Math.ceil,
                    _cos: Math.cos,
                    _exp: Math.exp,
                    _floor: Math.floor,
                    _fmod: (x, y) => x % y,
                    _log: Math.log,
                    _log10: Math.log10,
                    _max_: Math.max,
                    _min_: Math.min,
                    _remainder: (x, y) => x - Math.round(x / y) * y,
                    _pow: Math.pow,
                    _round: Math.fround,
                    _sin: Math.sin,
                    _sqrt: Math.sqrt,
                    _tan: Math.tan,
                    _acosh: Math.acosh,
                    _asinh: Math.asinh,
                    _atanh: Math.atanh,
                    _cosh: Math.cosh,
                    _sinh: Math.sinh,
                    _tanh: Math.tanh,

                    table: new WebAssembly.Table({ initial: 0, element: "anyfunc" })
                }
            };

            let real_url = (this.baseURL === "") ? "StonePhaserStereo.wasm" : (this.baseURL + "/StonePhaserStereo.wasm");
            const dspFile = await fetch(real_url);
            const dspBuffer = await dspFile.arrayBuffer();
            const dspModule = await WebAssembly.compile(dspBuffer);
            const dspInstance = await WebAssembly.instantiate(dspModule, importObject);

            let HEAPU8 = new Uint8Array(dspInstance.exports.memory.buffer);
            let json = this.heap2Str(HEAPU8);
            let json_object = JSON.parse(json);
            let options = { wasm_module: dspModule, json: json };

            if (this.fWorkletProcessors.indexOf(name) === -1) {
                try {
                    let re = /JSON_STR/g;
                    let StonePhaserStereoProcessorString1 = StonePhaserStereoProcessorString.replace(re, json);
                    let real_url = window.URL.createObjectURL(new Blob([StonePhaserStereoProcessorString1], { type: 'text/javascript' }));
                    await this.context.audioWorklet.addModule(real_url);
                    // Keep the DSP name
                    console.log("Keep the DSP name");
                    this.fWorkletProcessors.push(name);
                } catch (e) {
                    console.error(e);
                    console.error("Faust " + this.name + " cannot be loaded or compiled");
                    return null;
                }
            }
            this.node = new StonePhaserStereoNode(this.context, this.baseURL,
                {
                    numberOfInputs: (parseInt(json_object.inputs) > 0) ? 1 : 0,
                    numberOfOutputs: (parseInt(json_object.outputs) > 0) ? 1 : 0,
                    channelCount: Math.max(1, parseInt(json_object.inputs)),
                    outputChannelCount: [parseInt(json_object.outputs)],
                    channelCountMode: "explicit",
                    channelInterpretation: "speakers",
                    processorOptions: options
                });
            this.node.onprocessorerror = () => { console.log('An error from StonePhaserStereo-processor was detected.'); }
            return (this.node);
        } catch (e) {
            console.error(e);
            console.error("Faust " + this.name + " cannot be loaded or compiled");
            return null;
        }
    }

    async loadGui() {
        return new Promise((resolve, reject) => {
            try {
                // DO THIS ONLY ONCE. If another instance has already been added, do not add the html file again
                let real_url = (this.baseURL === "") ? "main.html" : (this.baseURL + "/main.html");
                if (!this.linkExists(real_url)) {
                    // LINK DOES NOT EXIST, let's add it to the document
                    var link = document.createElement('link');
                    link.rel = 'import';
                    link.href = real_url;
                    document.head.appendChild(link);
                    link.onload = (e) => {
                        // the file has been loaded, instanciate GUI
                        // and get back the HTML elem
                        // HERE WE COULD REMOVE THE HARD CODED NAME
                        var element = createStonePhaserStereoGUI(this.node);
                        resolve(element);
                    }
                } else {
                    // LINK EXIST, WE AT LEAST CREATED ONE INSTANCE PREVIOUSLY
                    // so we can create another instance
                    var element = createStonePhaserStereoGUI(this.node);
                    resolve(element);
                }
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    };

    linkExists(url) {
        return document.querySelectorAll(`link[href="${url}"]`).length > 0;
    }
}

// Template string for AudioWorkletProcessor

let StonePhaserStereoProcessorString = `

    'use strict';

    // Monophonic Faust DSP
    class StonePhaserStereoProcessor extends AudioWorkletProcessor {
        
        // JSON parsing functions
        static parse_ui(ui, obj, callback)
        {
            for (var i = 0; i < ui.length; i++) {
                StonePhaserStereoProcessor.parse_group(ui[i], obj, callback);
            }
        }
        
        static parse_group(group, obj, callback)
        {
            if (group.items) {
                StonePhaserStereoProcessor.parse_items(group.items, obj, callback);
            }
        }
        
        static parse_items(items, obj, callback)
        {
            for (var i = 0; i < items.length; i++) {
                callback(items[i], obj, callback);
            }
        }
        
        static parse_item1(item, obj, callback)
        {
            if (item.type === "vgroup"
                || item.type === "hgroup"
                || item.type === "tgroup") {
                StonePhaserStereoProcessor.parse_items(item.items, obj, callback);
            } else if (item.type === "hbargraph"
                       || item.type === "vbargraph") {
                // Nothing
            } else if (item.type === "vslider"
                       || item.type === "hslider"
                       || item.type === "button"
                       || item.type === "checkbox"
                       || item.type === "nentry") {
                obj.push({ name: item.address,
                         defaultValue: item.init,
                         minValue: item.min,
                         maxValue: item.max });
            }
        }
        
        static parse_item2(item, obj, callback)
        {
            if (item.type === "vgroup"
                || item.type === "hgroup"
                || item.type === "tgroup") {
                StonePhaserStereoProcessor.parse_items(item.items, obj, callback);
            } else if (item.type === "hbargraph"
                       || item.type === "vbargraph") {
                // Keep bargraph adresses
                obj.outputs_items.push(item.address);
                obj.pathTable[item.address] = parseInt(item.index);
            } else if (item.type === "vslider"
                       || item.type === "hslider"
                       || item.type === "button"
                       || item.type === "checkbox"
                       || item.type === "nentry") {
                // Keep inputs adresses
                obj.inputs_items.push(item.address);
                obj.pathTable[item.address] = parseInt(item.index);
            }
        }
     
        static get parameterDescriptors() 
        {
            // Analyse JSON to generate AudioParam parameters
            var params = [];
            StonePhaserStereoProcessor.parse_ui(JSON.parse(\`JSON_STR\`).ui, params, StonePhaserStereoProcessor.parse_item1);
            return params;
        }
       
        constructor(options)
        {
            super(options);
            this.running = true;
            
            const importObject = {
                    env: {
                        memoryBase: 0,
                        tableBase: 0,

                        // Integer version
                        _abs: Math.abs,

                        // Float version
                        _acosf: Math.acos,
                        _asinf: Math.asin,
                        _atanf: Math.atan,
                        _atan2f: Math.atan2,
                        _ceilf: Math.ceil,
                        _cosf: Math.cos,
                        _expf: Math.exp,
                        _floorf: Math.floor,
                        _fmodf: function(x, y) { return x % y; },
                        _logf: Math.log,
                        _log10f: Math.log10,
                        _max_f: Math.max,
                        _min_f: Math.min,
                        _remainderf: function(x, y) { return x - Math.round(x/y) * y; },
                        _powf: Math.pow,
                        _roundf: Math.fround,
                        _sinf: Math.sin,
                        _sqrtf: Math.sqrt,
                        _tanf: Math.tan,
                        _acoshf: Math.acosh,
                        _asinhf: Math.asinh,
                        _atanhf: Math.atanh,
                        _coshf: Math.cosh,
                        _sinhf: Math.sinh,
                        _tanhf: Math.tanh,

                        // Double version
                        _acos: Math.acos,
                        _asin: Math.asin,
                        _atan: Math.atan,
                        _atan2: Math.atan2,
                        _ceil: Math.ceil,
                        _cos: Math.cos,
                        _exp: Math.exp,
                        _floor: Math.floor,
                        _fmod: function(x, y) { return x % y; },
                        _log: Math.log,
                        _log10: Math.log10,
                        _max_: Math.max,
                        _min_: Math.min,
                        _remainder:function(x, y) { return x - Math.round(x/y) * y; },
                        _pow: Math.pow,
                        _round: Math.fround,
                        _sin: Math.sin,
                        _sqrt: Math.sqrt,
                        _tan: Math.tan,
                        _acosh: Math.acosh,
                        _asinh: Math.asinh,
                        _atanh: Math.atanh,
                        _cosh: Math.cosh,
                        _sinh: Math.sinh,
                        _tanh: Math.tanh,

                        table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' })
                    }
            };
            
            this.StonePhaserStereo_instance = new WebAssembly.Instance(options.processorOptions.wasm_module, importObject);
            this.json_object = JSON.parse(options.processorOptions.json);
         
            this.output_handler = function(path, value) { this.port.postMessage({ path: path, value: value }); };
            
            this.ins = null;
            this.outs = null;

            this.dspInChannnels = [];
            this.dspOutChannnels = [];

            this.numIn = parseInt(this.json_object.inputs);
            this.numOut = parseInt(this.json_object.outputs);

            // Memory allocator
            this.ptr_size = 4;
            this.sample_size = 4;
            this.integer_size = 4;
            
            this.factory = this.StonePhaserStereo_instance.exports;
            this.HEAP = this.StonePhaserStereo_instance.exports.memory.buffer;
            this.HEAP32 = new Int32Array(this.HEAP);
            this.HEAPF32 = new Float32Array(this.HEAP);

            // Warning: keeps a ref on HEAP in Chrome and prevent proper GC
            //console.log(this.HEAP);
            //console.log(this.HEAP32);
            //console.log(this.HEAPF32);

            // bargraph
            this.outputs_timer = 5;
            this.outputs_items = [];

            // input items
            this.inputs_items = [];
        
            // Start of HEAP index

            // DSP is placed first with index 0. Audio buffer start at the end of DSP.
            this.audio_heap_ptr = parseInt(this.json_object.size);

            // Setup pointers offset
            this.audio_heap_ptr_inputs = this.audio_heap_ptr;
            this.audio_heap_ptr_outputs = this.audio_heap_ptr_inputs + (this.numIn * this.ptr_size);

            // Setup buffer offset
            this.audio_heap_inputs = this.audio_heap_ptr_outputs + (this.numOut * this.ptr_size);
            this.audio_heap_outputs = this.audio_heap_inputs + (this.numIn * NUM_FRAMES * this.sample_size);
            
            // Start of DSP memory : DSP is placed first with index 0
            this.dsp = 0;

            this.pathTable = [];
         
            // Send output values to the AudioNode
            this.update_outputs = function ()
            {
                if (this.outputs_items.length > 0 && this.output_handler && this.outputs_timer-- === 0) {
                    this.outputs_timer = 5;
                    for (var i = 0; i < this.outputs_items.length; i++) {
                        this.output_handler(this.outputs_items[i], this.HEAPF32[this.pathTable[this.outputs_items[i]] >> 2]);
                    }
                }
            }
            
            this.initAux = function ()
            {
                var i;
                
                if (this.numIn > 0) {
                    this.ins = this.audio_heap_ptr_inputs;
                    for (i = 0; i < this.numIn; i++) {
                        this.HEAP32[(this.ins >> 2) + i] = this.audio_heap_inputs + ((NUM_FRAMES * this.sample_size) * i);
                    }
                    
                    // Prepare Ins buffer tables
                    var dspInChans = this.HEAP32.subarray(this.ins >> 2, (this.ins + this.numIn * this.ptr_size) >> 2);
                    for (i = 0; i < this.numIn; i++) {
                        this.dspInChannnels[i] = this.HEAPF32.subarray(dspInChans[i] >> 2, (dspInChans[i] + NUM_FRAMES * this.sample_size) >> 2);
                    }
                }
                
                if (this.numOut > 0) {
                    this.outs = this.audio_heap_ptr_outputs;
                    for (i = 0; i < this.numOut; i++) {
                        this.HEAP32[(this.outs >> 2) + i] = this.audio_heap_outputs + ((NUM_FRAMES * this.sample_size) * i);
                    }
                    
                    // Prepare Out buffer tables
                    var dspOutChans = this.HEAP32.subarray(this.outs >> 2, (this.outs + this.numOut * this.ptr_size) >> 2);
                    for (i = 0; i < this.numOut; i++) {
                        this.dspOutChannnels[i] = this.HEAPF32.subarray(dspOutChans[i] >> 2, (dspOutChans[i] + NUM_FRAMES * this.sample_size) >> 2);
                    }
                }
                
                // Parse UI
                StonePhaserStereoProcessor.parse_ui(this.json_object.ui, this, StonePhaserStereoProcessor.parse_item2);
                
                // Init DSP
                this.factory.init(this.dsp, sampleRate); // 'sampleRate' is defined in AudioWorkletGlobalScope  
            }

            this.setParamValue = function (path, val)
            {
                this.HEAPF32[this.pathTable[path] >> 2] = val;
            }

            this.getParamValue = function (path)
            {
                return this.HEAPF32[this.pathTable[path] >> 2];
            }

            // Init resulting DSP
            this.initAux();
        }
        
        process(inputs, outputs, parameters) 
        {
            var input = inputs[0];
            var output = outputs[0];
            
            // Check inputs
            if (this.numIn > 0 && (!input || !input[0] || input[0].length === 0)) {
                //console.log("Process input error");
                return true;
            }
            // Check outputs
            if (this.numOut > 0 && (!output || !output[0] || output[0].length === 0)) {
                //console.log("Process output error");
                return true;
            }
            
            // Copy inputs
            if (input !== undefined) {
                for (var chan = 0; chan < Math.min(this.numIn, input.length); ++chan) {
                    var dspInput = this.dspInChannnels[chan];
                    dspInput.set(input[chan]);
                }
            }
            
            /*
            TODO: sample accurate control change is not yet handled
            When no automation occurs, params[i][1] has a length of 1,
            otherwise params[i][1] has a length of NUM_FRAMES with possible control change each sample
            */
            
            // Update controls
            for (const path in parameters) {
                const paramArray = parameters[path];
                this.setParamValue(path, paramArray[0]);
            }
        
          	// Compute
            try {
                this.factory.compute(this.dsp, NUM_FRAMES, this.ins, this.outs);
            } catch(e) {
                console.log("ERROR in compute (" + e + ")");
            }
            
            // Update bargraph
            this.update_outputs();
            
            // Copy outputs
            if (output !== undefined) {
                for (var chan = 0; chan < Math.min(this.numOut, output.length); ++chan) {
                    var dspOutput = this.dspOutChannnels[chan];
                    output[chan].set(dspOutput);
                }
            }
            
            return this.running;
    	}
        
        handleMessage(event)
        {
            var msg = event.data;
            switch (msg.type) {
                case "destroy": this.running = false; break;
            }
        }
    }

    // Globals
    const NUM_FRAMES = 128;
    try {
        registerProcessor('StonePhaserStereo', StonePhaserStereoProcessor);
    } catch (error) {
        console.warn(error);
    }
`;

const dspName = "StonePhaserStereo";

// WAP factory or npm package module
if (typeof module === "undefined") {
    window.StonePhaserStereo = StonePhaserStereo;
    window.FaustStonePhaserStereo = StonePhaserStereo;
    window[dspName] = StonePhaserStereo;
} else {
    module.exports = { StonePhaserStereo };
}
