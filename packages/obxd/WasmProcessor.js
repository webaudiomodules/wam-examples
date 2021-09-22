// WAM WasmProcessor
// Jari Kleimola 2017-2020 (jari@webaudiomodules.org)

/** @typedef {import('./types').AudioWorkletGlobalScope} AudioWorkletGlobalScope */
/** @typedef {import('sdk/src/api/types').WamMidiData} WamMidiData */
/** @typedef {import('sdk/src/api/types').WamBinaryData} WamBinaryData */
/** @typedef {import('sdk/src/api/types').WamParameterData} WamParameterData */
// Firefox does not support imports

const executable = () => {
	/** @type {AudioWorkletGlobalScope} */
	const audioWorkletGlobalScope = globalThis;
	const { WamProcessor } = audioWorkletGlobalScope;
	
	class WasmProcessor extends WamProcessor {
		// ===-----------------------------------------------------------------------
		// WamProcessor overrides
		// ===-----------------------------------------------------------------------

		/** @param {AudioWorkletNodeOptions} options */
		constructor(options = {}) {
			super(options);
			this.parameterUpdateQueue = new Map();
			this.init(options);
			this.$defer = 10;
		}

		/**
		 * Messages from main thread appear here.
		 * @param {MessageEvent} message
		 */
		async _onMessage(message) {
			if (message.type === "msg") this.onmsg(msg.verb, msg.prop, msg.data);
			else await super._onMessage(message);
		}

		onmsg(verb, prop, data) {
			if (data instanceof ArrayBuffer) {
				let buffer = new Uint8Array(data);
				let len = data.byteLength;
				let WAM = this.WAM;
				let buf = WAM._malloc(data.byteLength);
				for (var i=0; i<len; i++)
					WAM.setValue(buf+i, buffer[i], 'i8');
				this.wam_onmessageA(this.inst, verb, prop, buf, len);
				WAM._free(buf);
			}
			else if (typeof data === "string")
				this.wam_onmessageS(this.inst, verb, prop, data);
			else this.wam_onmessageN(this.inst, verb, prop, data);
		}

		onpatch(data) {
			let buffer = new Uint8Array(data);
			let len = data.byteLength;
			let WAM = this.WAM;
			let buf = WAM._malloc(len);
			for (var i=0; i<len; i++)
				WAM.setValue(buf+i, buffer[i], 'i8');
			this.wam_onpatch(this.inst, buf, len);
			WAM._free(buf);
		}

		/**
		 * @param {WamMidiData} midiData
		 */
		_onMidi(midiData) {
			const [status, data1, data2] = midiData.bytes;
			this.wam_onmidi(this.inst, status, data1, data2);
		}

		/**
		 * @param {WamBinaryData} sysexData
		 */
		_onSysex({ bytes: data }) {
			let WAM = this.WAM;
			let buf = WAM._malloc(data.length);
			for (var i = 0; i < data.length; i++)
				WAM.setValue(buf+i, data[i], 'i8');
			this.wam_onsysex(this.inst, buf, data.length);
			WAM._free(buf);
		}

		/**
		 * Override this to implement custom DSP.
		 * @param {number} startSample beginning of processing slice
		 * @param {number} endSample end of processing slice
		 * @param {Float32Array[][]} inputs
		 * @param {Float32Array[][]} outputs
		 * @param {{[x: string]: Float32Array}} parameters
		 */
		_process(startSample, endSample, inputs, outputs, parameters) {
			if (this.$defer) {
				this.$defer--;
			} else {
				this.parameterUpdateQueue.forEach((value, key) => {
					if (typeof key === "string") this.wam_onmessageN(this.inst, "set", key, value);
					else this.wam_onparam(this.inst, key, value);
				});
				this.parameterUpdateQueue.clear();
				this.$defer = 10;
			}
			// -- inputs
			for (var i=0; i<this.numInputs; i++) {
				let waain = inputs[i][0];
				let wamin = this.audiobufs[0][i];
				this.WAM.HEAPF32.set(waain, wamin);
			}

			this.wam_onprocess(this.inst, this.audiobus, 0);

			// -- outputs
			for (var i=0; i<this.numOutputs; i++) {
				let numChannels = this.numOutChannels[i];
				for (var c=0; c<numChannels; c++) {
					let waaout = outputs[i][c];
					let wamout = this.audiobufs[1][i*numChannels+c];
					waaout.set(this.WAM.HEAPF32.subarray(wamout, wamout + this.bufsize));
				}
			}

			return true;
		}

		// ===-----------------------------------------------------------------------
		// WasmProcessor
		// ===-----------------------------------------------------------------------

		init(options) {
			if (options.numberOfInputs === undefined)       options.numberOfInputs = 0;
			if (options.numberOfOutputs === undefined)      options.numberOfOutputs = 1;
			if (options.inputChannelCount === undefined)    options.inputChannelCount  = [];
			if (options.outputChannelCount === undefined)   options.outputChannelCount = [1];
			if (options.inputChannelCount.length  != options.numberOfInputs)  throw new Error("InvalidArgumentException");
			if (options.outputChannelCount.length != options.numberOfOutputs) throw new Error("InvalidArgumentException");

			this.bufsize = 128;
			this.sr = globalThis.sampleRate || sampleRate;

			let WAM = options.module;
			this.WAM = WAM;
			WAM.port = this.port;

			this.initIO(options);
			this.initWasm();

			this.inst = this.wam_ctor();
			let desc  = this.wam_init(this.inst, this.bufsize, this.sr, "");
		}

		// bind c functions
		//
		initWasm() {
			let WAM = this.WAM;

			// -- construction C function wrappers
			this.wam_ctor = WAM.cwrap("createModule", 'number', []);
			this.wam_init = WAM.cwrap("wam_init", null, ['number','number','number','string']);

			// -- runtime C function wrappers
			this.wam_terminate = WAM.cwrap("wam_terminate", null, ['number']);
			this.wam_onmidi = WAM.cwrap("wam_onmidi", null, ['number','number','number','number']);
			this.wam_onpatch = WAM.cwrap("wam_onpatch", null, ['number','number','number']);
			this.wam_onprocess = WAM.cwrap("wam_onprocess", 'number', ['number','number','number']);
			this.wam_onparam = WAM.cwrap("wam_onparam", null, ['number','number','number']);
			this.wam_onsysex = WAM.cwrap("wam_onsysex", null, ['number','number','number']);
			this.wam_onmessageN = WAM.cwrap("wam_onmessageN", null, ['number','string','string','number']);
			this.wam_onmessageS = WAM.cwrap("wam_onmessageS", null, ['number','string','string','string']);

			// -- supress warnings for older WAMs
			if (WAM["_wam_onmessageA"])
				this.wam_onmessageA = WAM.cwrap("wam_onmessageA", null, ['number','string','string','number','number']);
		}

		// bind audio buffers
		//
		initIO(options) {
			this.audiobufs = [[],[]];

			// -- audio io configuration
			this.numInputs  = options.numberOfInputs;
			this.numOutputs = options.numberOfOutputs;
			this.numInChannels  = options.inputChannelCount;
			this.numOutChannels = options.outputChannelCount;

			let WAM = this.WAM;
			let ibufs = this.numInputs  > 0 ? WAM._malloc(this.numInputs)  : 0;
			let obufs = this.numOutputs > 0 ? WAM._malloc(this.numOutputs) : 0;
			this.audiobus = WAM._malloc(2*4);
			WAM.setValue(this.audiobus,   ibufs, 'i32');
			WAM.setValue(this.audiobus+4, obufs, 'i32');

			for (let i=0; i<this.numInputs; i++) {
				let buf = WAM._malloc( this.bufsize*4 );
				WAM.setValue(ibufs + i*4, buf, 'i32');
				this.audiobufs[0].push(buf/4);
			}

			for (let i=0; i<this.numOutputs; i++) {
				let numChannels = this.numOutChannels[i];
				for (let c=0; c<numChannels; c++) {
					let buf = WAM._malloc( this.bufsize*4 );
					WAM.setValue(obufs + (i*numChannels+c)*4, buf, 'i32');
					this.audiobufs[1].push(buf/4);
				}
			}
		}

		// event handlers

		/**
		 * @param {WamParameterData} parameterUpdate
		 * @param {boolean} interpolate
		 */
		_setParameterValue(parameterUpdate, interpolate) {
			super._setParameterValue(parameterUpdate, interpolate);
			const { id: key, value } = parameterUpdate;
			this.parameterUpdateQueue.set(key, value);
		}

		/**
		 * @param {boolean} normalized
		 * @param {string[]=} parameterIds
		 * @returns {WamParameterDataMap}
		 */
		_getParameterValues(normalized, parameterIds) {
			//TODO
		}

		destroy() {
			super.destroy();
			//TODO
		}
	}
	if (audioWorkletGlobalScope.AudioWorkletProcessor) {
		if (!audioWorkletGlobalScope.WasmProcessor) audioWorkletGlobalScope.WasmProcessor = WasmProcessor;
	}

	return WasmProcessor;
};

/** @type {AudioWorkletGlobalScope} */
const audioWorkletGlobalScope = globalThis;
if (audioWorkletGlobalScope.AudioWorkletProcessor) {
	if (!audioWorkletGlobalScope.WasmProcessor) executable();
}

export default executable;
