
/*
Code generated with Faust version 2.28.8
Compilation options: -lang wasm-eb -scal -ftz 2
*/

function getJSONfluteMIDI() {
	return '{"name": "fluteMIDI","filename": "fluteMIDI.dsp","version": "2.28.8","compile_options": "-lang wasm-eb -scal -ftz 2","library_list": ["/usr/local/share/faust/stdfaust.lib","/usr/local/share/faust/physmodels.lib","/usr/local/share/faust/basics.lib","/usr/local/share/faust/maths.lib","/usr/local/share/faust/platform.lib","/usr/local/share/faust/signals.lib","/usr/local/share/faust/noises.lib","/usr/local/share/faust/filters.lib","/usr/local/share/faust/oscillators.lib","/usr/local/share/faust/routes.lib","/usr/local/share/faust/delays.lib"],"include_pathnames": ["/usr/local/share/faust","/usr/local/share/faust","/usr/share/faust",".","/tmp/sessions/34C959DCA4F7153B52818FC9883ED48E4F65B1A5/web/wap-poly"],"size": 295152,"inputs": 0,"outputs": 2,"meta": [ { "basics.lib/name": "Faust Basic Element Library" },{ "basics.lib/version": "0.1" },{ "copyright": "(c)Romain Michon, CCRMA (Stanford University), GRAME" },{ "delays.lib/name": "Faust Delay Library" },{ "delays.lib/version": "0.1" },{ "description": "Simple MIDI-controllable flute physical model with physical parameters." },{ "filename": "fluteMIDI.dsp" },{ "filters.lib/dcblocker:author": "Julius O. Smith III" },{ "filters.lib/dcblocker:copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters.lib/dcblocker:license": "MIT-style STK-4.3 license" },{ "filters.lib/fir:author": "Julius O. Smith III" },{ "filters.lib/fir:copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters.lib/fir:license": "MIT-style STK-4.3 license" },{ "filters.lib/iir:author": "Julius O. Smith III" },{ "filters.lib/iir:copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters.lib/iir:license": "MIT-style STK-4.3 license" },{ "filters.lib/lowpass0_highpass1": "MIT-style STK-4.3 license" },{ "filters.lib/lowpass0_highpass1:author": "Julius O. Smith III" },{ "filters.lib/lowpass:author": "Julius O. Smith III" },{ "filters.lib/lowpass:copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters.lib/lowpass:license": "MIT-style STK-4.3 license" },{ "filters.lib/name": "Faust Filters Library" },{ "filters.lib/pole:author": "Julius O. Smith III" },{ "filters.lib/pole:copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters.lib/pole:license": "MIT-style STK-4.3 license" },{ "filters.lib/tf2:author": "Julius O. Smith III" },{ "filters.lib/tf2:copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters.lib/tf2:license": "MIT-style STK-4.3 license" },{ "filters.lib/tf2s:author": "Julius O. Smith III" },{ "filters.lib/tf2s:copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters.lib/tf2s:license": "MIT-style STK-4.3 license" },{ "filters.lib/version": "0.2" },{ "filters.lib/zero:author": "Julius O. Smith III" },{ "filters.lib/zero:copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters.lib/zero:license": "MIT-style STK-4.3 license" },{ "license": "MIT" },{ "maths.lib/author": "GRAME" },{ "maths.lib/copyright": "GRAME" },{ "maths.lib/license": "LGPL with exception" },{ "maths.lib/name": "Faust Math Library" },{ "maths.lib/version": "2.3" },{ "name": "fluteMIDI" },{ "noises.lib/name": "Faust Noise Generator Library" },{ "noises.lib/version": "0.0" },{ "oscillators.lib/name": "Faust Oscillator Library" },{ "oscillators.lib/version": "0.1" },{ "platform.lib/name": "Generic Platform Library" },{ "platform.lib/version": "0.1" },{ "routes.lib/name": "Faust Signal Routing Library" },{ "routes.lib/version": "0.2" },{ "signals.lib/name": "Faust Signal Routing Library" },{ "signals.lib/version": "0.0" }],"ui": [ {"type": "vgroup","label": "flute","items": [ {"type": "hgroup","label": "midi","meta": [{ "0": "" }],"items": [ {"type": "hslider","label": "freq","address": "/flute/midi/freq","index": 270484,"meta": [{ "0": "" },{ "style": "knob" }],"init": 440,"min": 50,"max": 1000,"step": 0.01},{"type": "hslider","label": "bend","address": "/flute/midi/bend","index": 270488,"meta": [{ "1": "" },{ "hidden": "1" },{ "midi": "pitchwheel" },{ "style": "knob" }],"init": 0,"min": -2,"max": 2,"step": 0.01},{"type": "hslider","label": "gain","address": "/flute/midi/gain","index": 262196,"meta": [{ "2": "" },{ "style": "knob" }],"init": 0.9,"min": 0,"max": 1,"step": 0.01},{"type": "hslider","label": "envAttack","address": "/flute/midi/envAttack","index": 262192,"meta": [{ "3": "" },{ "style": "knob" }],"init": 1,"min": 0,"max": 30,"step": 0.01},{"type": "hslider","label": "sustain","address": "/flute/midi/sustain","index": 262200,"meta": [{ "4": "" },{ "hidden": "1" },{ "midi": "ctrl 64" },{ "style": "knob" }],"init": 0,"min": 0,"max": 1,"step": 1}]},{"type": "hgroup","label": "otherParams","meta": [{ "1": "" }],"items": [ {"type": "hslider","label": "mouthPosition","address": "/flute/otherParams/mouthPosition","index": 270500,"meta": [{ "0": "" },{ "midi": "ctrl 1" },{ "style": "knob" }],"init": 0.5,"min": 0,"max": 1,"step": 0.01},{"type": "hslider","label": "vibratoFreq","address": "/flute/otherParams/vibratoFreq","index": 262180,"meta": [{ "1": "" },{ "style": "knob" }],"init": 5,"min": 1,"max": 10,"step": 0.01},{"type": "hslider","label": "vibratoGain","address": "/flute/otherParams/vibratoGain","index": 262164,"meta": [{ "2": "" },{ "style": "knob" }],"init": 0.5,"min": 0,"max": 1,"step": 0.01},{"type": "hslider","label": "outGain","address": "/flute/otherParams/outGain","index": 262144,"meta": [{ "3": "" },{ "style": "knob" }],"init": 0.5,"min": 0,"max": 1,"step": 0.01}]},{"type": "button","label": "gate","address": "/flute/gate","index": 262204,"meta": [{ "2": "" }]}]}]}';
}
/*
 faust2wasm: GRAME 2017-2019
*/

'use strict';

if (typeof (AudioWorkletNode) === "undefined") {
	alert("AudioWorklet is not supported in this browser !")
}

class fluteMIDIPolyNode extends AudioWorkletNode {

    constructor(context, baseURL, options)
    {
        var json_object = JSON.parse(getJSONfluteMIDI());
      
        // Setting values for the input, the output and the channel count.
        options.numberOfInputs = (parseInt(json_object.inputs) > 0) ? 1 : 0;
        options.numberOfOutputs = (parseInt(json_object.outputs) > 0) ? 1 : 0;
        options.channelCount = Math.max(1, parseInt(json_object.inputs));
        options.outputChannelCount = [parseInt(json_object.outputs)];
        options.channelCountMode = "explicit";
        options.channelInterpretation = "speakers";

        super(context, 'fluteMIDIPoly', options);
        this.baseURL = baseURL;
      
        // JSON parsing functions
        this.parse_ui = function(ui, obj)
        {
            for (var i = 0; i < ui.length; i++) {
                this.parse_group(ui[i], obj);
            }
        }

        this.parse_group = function(group, obj)
        {
            if (group.items) {
                this.parse_items(group.items, obj);
            }
        }

        this.parse_items = function(items, obj)
        {
            for (var i = 0; i < items.length; i++) {
            	this.parse_item(items[i], obj);
            }
        }

        this.parse_item = function(item, obj)
        {
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
                // Define setXXX/getXXX, replacing '/c' with 'C' everywhere in the string
                var set_name = "set" + item.address;
                var get_name = "get" + item.address;
                get_name = get_name.replace(/\/./g, (x) => { return x.substr(1,1).toUpperCase(); });
                set_name = set_name.replace(/\/./g, (x) => { return x.substr(1,1).toUpperCase(); });
                obj[set_name] = (val) => { obj.setParamValue(item.address, val); };
                obj[get_name] = () => { return obj.getParamValue(item.address); };
                //console.log(set_name);
                //console.log(get_name);
            }
        }

        this.json_object = json_object;

        if (typeof (getJSONeffect) !== "undefined") {
            this.effect_json_object = JSON.parse(getJSONeffect());
        }

        this.output_handler = null;

        // input/output items
        this.inputs_items = [];
        this.outputs_items = [];

        // Parse UI
        this.parse_ui(this.json_object.ui, this);

        if (this.effect_json_object) {
            this.parse_ui(this.effect_json_object.ui, this);
        }

        // Set message handler
        this.port.onmessage = this.handleMessage.bind(this);
        try {
            if (this.parameters) this.parameters.forEach(p => p.automationRate = "k-rate");
        } catch (e) {}
    }

    // To be called by the message port with messages coming from the processor
    handleMessage(event)
    {
        var msg = event.data;
        if (this.output_handler) {
            this.output_handler(msg.path, msg.value);
        }
    }

    // Public API
    
    /**
     * Destroy the node, deallocate resources.
     */
    destroy()
    {
        this.port.postMessage({ type: "destroy" });
        this.port.close();
    }
	
    /**
     *  Returns a full JSON description of the DSP.
     */
    getJSON()
    {
        var res = "";
        res = res.concat("{\"name\":\""); res = res.concat(this.json_object.name); res = res.concat("\",");
        res = res.concat("\"version\":\""); res = res.concat(this.json_object.version); res = res.concat("\",");
        res = res.concat("\"options\":\""); res = res.concat(this.json_object.options); res = res.concat("\",");
        res = res.concat("\"inputs\":\""); res = res.concat(this.json_object.inputs); res = res.concat("\",");
        res = res.concat("\"outputs\":\""); res = res.concat(this.json_object.outputs); res = res.concat("\",");
        res = res.concat("\"meta\":"); res = res.concat(JSON.stringify(this.json_object.meta)); res = res.concat(",");

        if (this.effect_json_object) {
            res = res.concat("\"ui\":[{\"type\":\"tgroup\",\"label\":\"Sequencer\",\"items\":[");
            res = res.concat("{\"type\": \"vgroup\",\"label\":\"Instrument\",\"items\":");
            res = res.concat(JSON.stringify(this.json_object.ui));
            res = res.concat("},");
            res = res.concat("{\"type\":\"vgroup\",\"label\":\"Effect\",\"items\":");
            res = res.concat(JSON.stringify(this.effect_json_object.ui));
            res = res.concat("}");
            res = res.concat("]}]}");
            return res;
        } else {
            res = res.concat("\"ui\":[{\"type\":\"tgroup\",\"label\":\"Polyphonic\",\"items\":[");
            res = res.concat("{\"type\": \"vgroup\",\"label\":\"Voices\",\"items\":");
            res = res.concat(JSON.stringify(this.json_object.ui));
            res = res.concat("},");
            res = res.concat("]}]}");
            return res;
        }
    }
    
    // For WAP
    async getMetadata()
    {
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
    setParamValue(path, val)
    {
        this.port.postMessage({ type:"param", key:path, value:val });
        this.parameters.get(path).setValueAtTime(val, 0);
    }
    
    // For WAP
    setParam(path, val)
    {
        this.port.postMessage({ type:"param", key:path, value:val });
        this.parameters.get(path).setValueAtTime(val, 0);
    }

    /**
     *  Get the control value at a given path.
     *
     * @return the current control value
     */
    getParamValue(path)
    {
        return this.parameters.get(path).value;
    }
    
    // For WAP
    getParam(path)
    {
        return this.parameters.get(path).value;
    }

    /**
     * Setup a control output handler with a function of type (path, value)
     * to be used on each generated output value. This handler will be called
     * each audio cycle at the end of the 'compute' method.
     *
     * @param handler - a function of type function(path, value)
     */
    setOutputParamHandler(handler)
    {
        this.output_handler = handler;
    }

    /**
     * Get the current output handler.
     */
    getOutputParamHandler()
    {
        return this.output_handler;
    }

    getNumInputs()
    {
        return parseInt(this.json_object.inputs);
    }

    getNumOutputs()
    {
        return parseInt(this.json_object.outputs);
    }
    
    // For WAP
    inputChannelCount()
    {
        return parseInt(this.json_object.inputs);
    }
    
    outputChannelCount()
    {
        return parseInt(this.json_object.outputs);
    }

    /**
     * Returns an array of all input paths (to be used with setParamValue/getParamValue)
     */
    getParams()
    {
        return this.inputs_items;
    }
        
    // For WAP
    getDescriptor()
    {
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
     * Instantiates a new polyphonic voice.
     *
     * @param channel - the MIDI channel (0..15, not used for now)
     * @param pitch - the MIDI pitch (0..127)
     * @param velocity - the MIDI velocity (0..127)
     */
    keyOn(channel, pitch, velocity)
    {
        this.port.postMessage({ type: "keyOn", data: [channel, pitch, velocity] });
    }

    /**
     * De-instantiates a polyphonic voice.
     *
     * @param channel - the MIDI channel (0..15, not used for now)
     * @param pitch - the MIDI pitch (0..127)
     * @param velocity - the MIDI velocity (0..127)
     */
    keyOff(channel, pitch, velocity)
    {
        this.port.postMessage({ type: "keyOff", data: [channel, pitch, velocity] });
    }

    /**
     * Gently terminates all the active voices.
     */
    allNotesOff()
    {
        this.port.postMessage({ type: "ctrlChange", data: [channel, 123, 0] });
    }

    /**
     * Control change
     *
     * @param channel - the MIDI channel (0..15, not used for now)
     * @param ctrl - the MIDI controller number (0..127)
     * @param value - the MIDI controller value (0..127)
     */
    ctrlChange(channel, ctrl, value)
    {
        this.port.postMessage({ type: "ctrlChange", data: [channel, ctrl, value] });
    }

    /**
     * PitchWeel
     *
     * @param channel - the MIDI channel (0..15, not used for now)
     * @param value - the MIDI controller value (0..16383)
     */
    pitchWheel(channel, wheel)
    {
        this.port.postMessage({ type: "pitchWheel", data: [channel, wheel] });
    }

    /**
     * Generic MIDI message handler.
     */
    midiMessage(data)
    {
    	this.port.postMessage({ type:"midi", data:data });
    }
    
    /**
     * @returns {Object} describes the path for each available param and its current value
     */
    async getState()
    {
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
    async setState(state)
    {
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

}

// Factory class
class fluteMIDIPoly {

    /**
     * Factory constructor.
     *
     * @param context - the audio context
     * @param polyphony - the number of voices
     * @param baseURL - the baseURL of the plugin folder
     */
    constructor(context, polyphony = 16, baseURL = "")
    {
        console.log("baseLatency " + context.baseLatency);
        console.log("outputLatency " + context.outputLatency);
        console.log("sampleRate " + context.sampleRate);

        this.context = context;
        this.polyphony = polyphony;
        this.baseURL = baseURL;
    }

    /**
     * Load additionnal resources to prepare the custom AudioWorkletNode. Returns a promise to be used with the created node.
     */
    async load()
    {
    	return new Promise((resolve, reject) => {   
            let real_url = (this.baseURL === "") ? "fluteMIDI-processor.js" : (this.baseURL + "/fluteMIDI-processor.js");
            let options = { polyphony: this.polyphony };
            this.context.audioWorklet.addModule(real_url).then(() => {
            this.node = new fluteMIDIPolyNode(this.context, this.baseURL, { processorOptions: options });
            this.node.onprocessorerror = () => { console.log('An error from fluteMIDI-processor was detected.');}
            return (this.node);
            }).then((node) => {
                resolve(node);
            }).catch((e) => {
                reject(e);
            });
        });
    }

    async loadGui() 
    {
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
                        var element = createfluteMIDIGUI(this.node);
                        resolve(element);
                    }
                } else {
                    // LINK EXIST, WE AT LEAST CREATED ONE INSTANCE PREVIOUSLY
                    // so we can create another instance
                    var element = createfluteMIDIGUI(this.node);
                    resolve(element);
                }
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    };
    
    linkExists(url) 
    {
    	return document.querySelectorAll(`link[href="${url}"]`).length > 0;
    }
}

const dspName = "fluteMIDIPoly";

// WAP factory or npm package module
if (typeof module === "undefined") {
    window.fluteMIDIPoly = fluteMIDIPoly;
    window.FaustfluteMIDIPoly = fluteMIDIPoly;
    window[dspName] = fluteMIDIPoly;
} else {
    module.exports = { fluteMIDIPoly };
}
