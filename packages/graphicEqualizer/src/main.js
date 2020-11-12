/*  ################################## WAH ########################################  */

/* ES6 web audio class following the API standard
* Author : Jordan Sintes
* Comment: Based on the Equalizer made by M.BUFFA
*/
window.Equalizer = class Equalizer extends WebAudioPluginCompositeNode {
    constructor(ctx, options) {
        super(ctx, options)
        /*    ################     API PROPERTIES    ###############   */

        this.state;

        this.params = {
            filters: [],
            state: ""
        }
        // mouse selection mode
        this.setup();
    }

    /*    ################     API METHODS    ###############   */

    get numberOfInputs() {
        return 1;
    }

    get numberOfOutputs() {
        return this.outputs.length;
    }
    inputChannelCount() {
        return 1;
    }
    outputChannelCount() {
        return 1
    }
    getMetadata() {
        return this.metadata;
    }

    getDescriptor() {
        return this._descriptor;
    }



    getPatch(index) {
        console.warn("this module does not implements patches use getState / setState to get an array of current params values ");
    }
    setPatch(data, index) {
        console.warn("this module does not implements patches use getState / setState to get an array of current params values ");
    }

    setParam(key, value) {
        console.log(key, value);
        try {
            this[key] = (value);
        } catch (error) {
            console.log(key, error)
            console.warn("this plugin does not implement this param")
        }
    }

    // override setup 
    setup() {
        console.log("delay setup");
        this.createNodes();
        this.connectNodes();
        this.linktoParams();
    }

    createNodes() {
        this.addFilter("highpass", 0.00001, 40, 12, "red");
        this.addFilter("lowshelf", 0, 80, 0, "yellow");
        this.addFilter("peaking", 1, 230, 0, "green");
        this.addFilter("peaking", 1, 2500, 0, "turquoise");
        this.addFilter("peaking", 1, 5000, 0, "blue");
        this.addFilter("highshelf", 1, 10000, 0, "violet");
        this.addFilter("lowpass", 0.00001, 18000, 12, "red");

        // connect also to an analyser node
        // Create an analyser node
        this.analyser = this.context.createAnalyser();

        // Try changing for lower values: 512, 256, 128, 64...
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.9;
        //this.analyser.minDecibels = -this.dbScale;
        //this.analyser.maxDecibels = this.dbScale;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Float32Array(this.bufferLength);

        var analyserRange = this.analyser.maxDecibels - this.analyser.minDecibels;
        // ration between analyser range and our range
        var range = this.dbScale * 2;
        this.dbRatio = range / analyserRange;
        //console.log("arange = " + analyserRange);
        //console.log("range = " + range);
        //console.log("ratio = " + this.dbRatio);

    }

    connectNodes() {
        this._input.connect(this._output);
        if(this.params.state == "enable"){
            this._input.disconnect(this._output);
            for (let i = 0; i < this.params.filters.length; i++) {
                let f = this.params.filters[i];

                if (i === 0) {
                    // connect inputGain to first filter
                    this._input.connect(f);
                } else {
                    this.params.filters[i - 1].connect(f);
                }
            }
            // connect last filter to outputGain
            this.params.filters[this.params.filters.length - 1].connect(this._output);
            this._output.connect(this.analyser);
        }
        else if(this.params.state == "disable"){
            this._input.disconnect(this.filters);
            this.params.filters[this.params.filters.length - 1].disconnect(this._output);
            this._input.connect(this._output);
            this._output.disconnect(this.analyser);
        }
    }

    linktoParams() {
		/*
		 * set default value for parameters and assign it to the web audio nodes
		 */
    };


    /*  #########  Personnal code for the web audio graph  #########   */

    addFilter(type, Q, f, g, color) {
        let filter = this.context.createBiquadFilter();
        filter.type = type;
        filter.Q.value = Q;
        filter.frequency.value = f;
        filter.gain.value = g;
        filter.color = color;
        this.params.filters.push(filter);
    }
}


//////////////////////////////////////////////////////////////////////////////////////////

window.WasabiEqualizer = class WasabiEqualizer extends WebAudioPluginFactory {
    constructor(context, baseUrl) { super(context, baseUrl); }
}

//////////////////////////////////////////////////////////////////////////////////////////

AudioContext.prototype.createWasabiDelayCompositeNode = OfflineAudioContext.prototype.createWasabiDelayCompositeNode = function (options) { return new Equalizer(this, options); };

