
/*
Code generated with Faust version 2.28.6
Compilation options: -lang wasm-ib -scal -ftz 2
*/

function getJSONTS9_OverdriveFaustGenerated() {
	return '{"name": "TS9_OverdriveFaustGenerated","filename": "TS9_OverdriveFaustGenerated.dsp","version": "2.28.6","compile_options": "-lang wasm-ib -scal -ftz 2","include_pathnames": ["/usr/local/share/faust","/usr/local/share/faust","/usr/share/faust",".","/tmp/sessions/689E01C3A85176301A0526C1013CAB548582D2E4/web/wap"],"size": 900,"inputs": 1,"outputs": 1,"meta": [ { "author": "Guitarix project (http://guitarix.sourceforge.net/)" },{ "basics_lib_name": "Faust Basic Element Library" },{ "basics_lib_version": "0.1" },{ "compilation_options": "-single -scal -I libraries/ -I project/ -lang wasm" },{ "copyright": "Guitarix project" },{ "filename": "TS9_OverdriveFaustGenerated.dsp" },{ "filters_lib_lowpass0_highpass1": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_lowpass0_highpass1_author": "Julius O. Smith III" },{ "filters_lib_lowpass_author": "Julius O. Smith III" },{ "filters_lib_lowpass_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_lowpass_license": "MIT-style STK-4.3 license" },{ "filters_lib_name": "Faust Filters Library" },{ "filters_lib_tf1_author": "Julius O. Smith III" },{ "filters_lib_tf1_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_tf1_license": "MIT-style STK-4.3 license" },{ "filters_lib_tf1s_author": "Julius O. Smith III" },{ "filters_lib_tf1s_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_tf1s_license": "MIT-style STK-4.3 license" },{ "library_path": "FaustDSP" },{ "license": "LGPL" },{ "maths_lib_author": "GRAME" },{ "maths_lib_copyright": "GRAME" },{ "maths_lib_license": "LGPL with exception" },{ "maths_lib_name": "Faust Math Library" },{ "maths_lib_version": "2.1" },{ "name": "TS9_OverdriveFaustGenerated" },{ "signals_lib_name": "Faust Signal Routing Library" },{ "signals_lib_version": "0.0" },{ "tonestacks_lib_author": "Guitarix project (http://guitarix.sourceforge.net/)" },{ "tonestacks_lib_copyright": "Guitarix project" },{ "tonestacks_lib_license": "LGPL" },{ "tonestacks_lib_name": "Tonestack Emulation Library" },{ "tonestacks_lib_version": "0.28" },{ "version": "0.29" }],"ui": [ {"type": "vgroup","label": "TS9_OverdriveFaustGenerated","items": [ {"type": "hgroup","label": "TubeScreamer","items": [ {"type": "vslider","label": "drive","address": "/TS9_OverdriveFaustGenerated/TubeScreamer/drive","index": 456,"meta": [{ "name": "Drive" },{ "style": "knob" }],"init": 0.5,"min": 0,"max": 1,"step": 0.01},{"type": "vslider","label": "level","address": "/TS9_OverdriveFaustGenerated/TubeScreamer/level","index": 484,"meta": [{ "name": "Level" },{ "style": "knob" }],"init": -16,"min": -20,"max": 4,"step": 0.1},{"type": "vslider","label": "tone","address": "/TS9_OverdriveFaustGenerated/TubeScreamer/tone","index": 428,"meta": [{ "log": "" },{ "name": "Tone" },{ "style": "knob" }],"init": 400,"min": 100,"max": 1000,"step": 1.03}]},{"type": "checkbox","label": "bypass","address": "/TS9_OverdriveFaustGenerated/bypass","index": 412}]}]}';
}
function getBase64CodeTS9_OverdriveFaustGenerated() { return "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Zm9yZ2UubmV0LykiIH0seyAiYmFzaWNzX2xpYl9uYW1lIjogIkZhdXN0IEJhc2ljIEVsZW1lbnQgTGlicmFyeSIgfSx7ICJiYXNpY3NfbGliX3ZlcnNpb24iOiAiMC4xIiB9LHsgImNvbXBpbGF0aW9uX29wdGlvbnMiOiAiLXNpbmdsZSAtc2NhbCAtSSBsaWJyYXJpZXMvIC1JIHByb2plY3QvIC1sYW5nIHdhc20iIH0seyAiY29weXJpZ2h0IjogIkd1aXRhcml4IHByb2plY3QiIH0seyAiZmlsZW5hbWUiOiAiVFM5X092ZXJkcml2ZUZhdXN0R2VuZXJhdGVkLmRzcCIgfSx7ICJmaWx0ZXJzX2xpYl9sb3dwYXNzMF9oaWdocGFzczEiOiAiQ29weXJpZ2h0IChDKSAyMDAzLTIwMTkgYnkgSnVsaXVzIE8uIFNtaXRoIElJSSA8am9zQGNjcm1hLnN0YW5mb3JkLmVkdT4iIH0seyAiZmlsdGVyc19saWJfbG93cGFzczBfaGlnaHBhc3MxX2F1dGhvciI6ICJKdWxpdXMgTy4gU21pdGggSUlJIiB9LHsgImZpbHRlcnNfbGliX2xvd3Bhc3NfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfbG93cGFzc19jb3B5cmlnaHQiOiAiQ29weXJpZ2h0IChDKSAyMDAzLTIwMTkgYnkgSnVsaXVzIE8uIFNtaXRoIElJSSA8am9zQGNjcm1hLnN0YW5mb3JkLmVkdT4iIH0seyAiZmlsdGVyc19saWJfbG93cGFzc19saWNlbnNlIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVyc19saWJfbmFtZSI6ICJGYXVzdCBGaWx0ZXJzIExpYnJhcnkiIH0seyAiZmlsdGVyc19saWJfdGYxX2F1dGhvciI6ICJKdWxpdXMgTy4gU21pdGggSUlJIiB9LHsgImZpbHRlcnNfbGliX3RmMV9jb3B5cmlnaHQiOiAiQ29weXJpZ2h0IChDKSAyMDAzLTIwMTkgYnkgSnVsaXVzIE8uIFNtaXRoIElJSSA8am9zQGNjcm1hLnN0YW5mb3JkLmVkdT4iIH0seyAiZmlsdGVyc19saWJfdGYxX2xpY2Vuc2UiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJmaWx0ZXJzX2xpYl90ZjFzX2F1dGhvciI6ICJKdWxpdXMgTy4gU21pdGggSUlJIiB9LHsgImZpbHRlcnNfbGliX3RmMXNfY29weXJpZ2h0IjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnNfbGliX3RmMXNfbGljZW5zZSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImxpYnJhcnlfcGF0aCI6ICJGYXVzdERTUCIgfSx7ICJsaWNlbnNlIjogIkxHUEwiIH0seyAibWF0aHNfbGliX2F1dGhvciI6ICJHUkFNRSIgfSx7ICJtYXRoc19saWJfY29weXJpZ2h0IjogIkdSQU1FIiB9LHsgIm1hdGhzX2xpYl9saWNlbnNlIjogIkxHUEwgd2l0aCBleGNlcHRpb24iIH0seyAibWF0aHNfbGliX25hbWUiOiAiRmF1c3QgTWF0aCBMaWJyYXJ5IiB9LHsgIm1hdGhzX2xpYl92ZXJzaW9uIjogIjIuMSIgfSx7ICJuYW1lIjogIlRTOV9PdmVyZHJpdmVGYXVzdEdlbmVyYXRlZCIgfSx7ICJzaWduYWxzX2xpYl9uYW1lIjogIkZhdXN0IFNpZ25hbCBSb3V0aW5nIExpYnJhcnkiIH0seyAic2lnbmFsc19saWJfdmVyc2lvbiI6ICIwLjAiIH0seyAidG9uZXN0YWNrc19saWJfYXV0aG9yIjogIkd1aXRhcml4IHByb2plY3QgKGh0dHA6Ly9ndWl0YXJpeC5zb3VyY2Vmb3JnZS5uZXQvKSIgfSx7ICJ0b25lc3RhY2tzX2xpYl9jb3B5cmlnaHQiOiAiR3VpdGFyaXggcHJvamVjdCIgfSx7ICJ0b25lc3RhY2tzX2xpYl9saWNlbnNlIjogIkxHUEwiIH0seyAidG9uZXN0YWNrc19saWJfbmFtZSI6ICJUb25lc3RhY2sgRW11bGF0aW9uIExpYnJhcnkiIH0seyAidG9uZXN0YWNrc19saWJfdmVyc2lvbiI6ICIwLjI4IiB9LHsgInZlcnNpb24iOiAiMC4yOSIgfV0sInVpIjogWyB7InR5cGUiOiAidmdyb3VwIiwibGFiZWwiOiAiVFM5X092ZXJkcml2ZUZhdXN0R2VuZXJhdGVkIiwiaXRlbXMiOiBbIHsidHlwZSI6ICJoZ3JvdXAiLCJsYWJlbCI6ICJUdWJlU2NyZWFtZXIiLCJpdGVtcyI6IFsgeyJ0eXBlIjogInZzbGlkZXIiLCJsYWJlbCI6ICJkcml2ZSIsImFkZHJlc3MiOiAiL1RTOV9PdmVyZHJpdmVGYXVzdEdlbmVyYXRlZC9UdWJlU2NyZWFtZXIvZHJpdmUiLCJpbmRleCI6IDQ1NiwibWV0YSI6IFt7ICJuYW1lIjogIkRyaXZlIiB9LHsgInN0eWxlIjogImtub2IiIH1dLCJpbml0IjogMC41LCJtaW4iOiAwLCJtYXgiOiAxLCJzdGVwIjogMC4wMX0seyJ0eXBlIjogInZzbGlkZXIiLCJsYWJlbCI6ICJsZXZlbCIsImFkZHJlc3MiOiAiL1RTOV9PdmVyZHJpdmVGYXVzdEdlbmVyYXRlZC9UdWJlU2NyZWFtZXIvbGV2ZWwiLCJpbmRleCI6IDQ4NCwibWV0YSI6IFt7ICJuYW1lIjogIkxldmVsIiB9LHsgInN0eWxlIjogImtub2IiIH1dLCJpbml0IjogLTE2LCJtaW4iOiAtMjAsIm1heCI6IDQsInN0ZXAiOiAwLjF9LHsidHlwZSI6ICJ2c2xpZGVyIiwibGFiZWwiOiAidG9uZSIsImFkZHJlc3MiOiAiL1RTOV9PdmVyZHJpdmVGYXVzdEdlbmVyYXRlZC9UdWJlU2NyZWFtZXIvdG9uZSIsImluZGV4IjogNDI4LCJtZXRhIjogW3sgImxvZyI6ICIiIH0seyAibmFtZSI6ICJUb25lIiB9LHsgInN0eWxlIjogImtub2IiIH1dLCJpbml0IjogNDAwLCJtaW4iOiAxMDAsIm1heCI6IDEwMDAsInN0ZXAiOiAxLjAzfV19LHsidHlwZSI6ICJjaGVja2JveCIsImxhYmVsIjogImJ5cGFzcyIsImFkZHJlc3MiOiAiL1RTOV9PdmVyZHJpdmVGYXVzdEdlbmVyYXRlZC9ieXBhc3MiLCJpbmRleCI6IDQxMn1dfV19"; }

/*
 faust2wasm: GRAME 2017-2019
*/

'use strict';

if (typeof (AudioWorkletNode) === "undefined") {
    alert("AudioWorklet is not supported in this browser !")
}

class TS9_OverdriveFaustGeneratedNode extends AudioWorkletNode {

    constructor(context, baseURL, options) {
        super(context, 'TS9_OverdriveFaustGenerated', options);

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
                this.setParamValue(path, TS9_OverdriveFaustGeneratedNode.remap(value, 0, 127, this.fCtrlLabel[ctrl][i].min, this.fCtrlLabel[ctrl][i].max));
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
            this.setParamValue(pw.path, TS9_OverdriveFaustGeneratedNode.remap(wheel, 0, 16383, pw.min, pw.max));
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
class TS9_OverdriveFaustGenerated {

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

            let real_url = (this.baseURL === "") ? "TS9_OverdriveFaustGenerated.wasm" : (this.baseURL + "/TS9_OverdriveFaustGenerated.wasm");
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
                    let TS9_OverdriveFaustGeneratedProcessorString1 = TS9_OverdriveFaustGeneratedProcessorString.replace(re, json);
                    let real_url = window.URL.createObjectURL(new Blob([TS9_OverdriveFaustGeneratedProcessorString1], { type: 'text/javascript' }));
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
            this.node = new TS9_OverdriveFaustGeneratedNode(this.context, this.baseURL,
                {
                    numberOfInputs: (parseInt(json_object.inputs) > 0) ? 1 : 0,
                    numberOfOutputs: (parseInt(json_object.outputs) > 0) ? 1 : 0,
                    channelCount: Math.max(1, parseInt(json_object.inputs)),
                    outputChannelCount: [parseInt(json_object.outputs)],
                    channelCountMode: "explicit",
                    channelInterpretation: "speakers",
                    processorOptions: options
                });
            this.node.onprocessorerror = () => { console.log('An error from TS9_OverdriveFaustGenerated-processor was detected.'); }
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
                        var element = createTS9_OverdriveFaustGeneratedGUI(this.node);
                        resolve(element);
                    }
                } else {
                    // LINK EXIST, WE AT LEAST CREATED ONE INSTANCE PREVIOUSLY
                    // so we can create another instance
                    var element = createTS9_OverdriveFaustGeneratedGUI(this.node);
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

let TS9_OverdriveFaustGeneratedProcessorString = `

    'use strict';

    // Monophonic Faust DSP
    class TS9_OverdriveFaustGeneratedProcessor extends AudioWorkletProcessor {
        
        // JSON parsing functions
        static parse_ui(ui, obj, callback)
        {
            for (var i = 0; i < ui.length; i++) {
                TS9_OverdriveFaustGeneratedProcessor.parse_group(ui[i], obj, callback);
            }
        }
        
        static parse_group(group, obj, callback)
        {
            if (group.items) {
                TS9_OverdriveFaustGeneratedProcessor.parse_items(group.items, obj, callback);
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
                TS9_OverdriveFaustGeneratedProcessor.parse_items(item.items, obj, callback);
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
                TS9_OverdriveFaustGeneratedProcessor.parse_items(item.items, obj, callback);
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
            TS9_OverdriveFaustGeneratedProcessor.parse_ui(JSON.parse(\`JSON_STR\`).ui, params, TS9_OverdriveFaustGeneratedProcessor.parse_item1);
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
            
            this.TS9_OverdriveFaustGenerated_instance = new WebAssembly.Instance(options.processorOptions.wasm_module, importObject);
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
            
            this.factory = this.TS9_OverdriveFaustGenerated_instance.exports;
            this.HEAP = this.TS9_OverdriveFaustGenerated_instance.exports.memory.buffer;
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
                TS9_OverdriveFaustGeneratedProcessor.parse_ui(this.json_object.ui, this, TS9_OverdriveFaustGeneratedProcessor.parse_item2);
                
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
        registerProcessor('TS9_OverdriveFaustGenerated', TS9_OverdriveFaustGeneratedProcessor);
    } catch (error) {
        console.warn(error);
    }
`;

const dspName = "TS9_OverdriveFaustGenerated";

// WAP factory or npm package module
if (typeof module === "undefined") {
    window.TS9_OverdriveFaustGenerated = TS9_OverdriveFaustGenerated;
    window.FaustTS9_OverdriveFaustGenerated = TS9_OverdriveFaustGenerated;
    window[dspName] = TS9_OverdriveFaustGenerated;
} else {
    module.exports = { TS9_OverdriveFaustGenerated };
}
