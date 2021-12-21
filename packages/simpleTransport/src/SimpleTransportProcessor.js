/** @typedef {import('../../api/src').AudioWorkletGlobalScope} AudioWorkletGlobalScope */
/** @typedef {import('../../api/src').AudioWorkletProcessor} AudioWorkletProcessor */
/** @typedef {import('../../api/src').WamProcessor} WamProcessor */
/** @typedef {import('../../api/src').WamParameterInfo} WamParameterInfo */
/** @typedef {import('../../api/src').WamParameterInfoMap} WamParameterInfoMap */
/** @typedef {import('../../api/src').WamParameterDataMap} WamParameterDataMap */
/** @typedef {import('../../sdk/src').WamSDKBaseModuleScope} WamSDKBaseModuleScope */

/**
 * @param {string} [moduleId]
 */
const getSimpleTransportProcessor = (moduleId) => {
	/** @type {AudioWorkletGlobalScope} */
	// @ts-ignore
	const audioWorkletGlobalScope = globalThis;
	const { registerProcessor } = audioWorkletGlobalScope;

	/** @type {WamSDKBaseModuleScope} */
	const ModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);
	const {
		WamProcessor,
		WamParameterInfo,
	} = ModuleScope;

    class SimpleTransportProcessor extends WamProcessor {
		/**
		 * @param {AudioWorkletNodeOptions} options
		 */
		constructor(options) {
			super(options);
            
            this._tick = 0;
            this._tempo = 60;
            this._ppq = 240 * 4;
            this._playing = !false;
            this._tempo = 60;
            this._timeSigDenominator = 4;
            this._timeSigNumerator = 4;
            this._sab = new SharedArrayBuffer(3 * Uint32Array.BYTES_PER_ELEMENT);
            this._currentMeas = new Uint32Array(this._sab, 0 * Uint32Array.BYTES_PER_ELEMENT, 1);
            this._currentBeat = new Uint32Array(this._sab, 1 * Uint32Array.BYTES_PER_ELEMENT, 1);
            this._currentTick = new Uint32Array(this._sab, 2 * Uint32Array.BYTES_PER_ELEMENT, 1);
            /** @type {(message: MessageEvent<{ setTransport: { measure: number; beat: number; tick: number }}>) => any} */
            this.handleMessage = (message) => {
                if (!message.data.setTransport) return;
                const { measure, beat, tick } = message.data.setTransport;
                this.setTransport(measure, beat, tick);
            };
            this.port.addEventListener('message', this.handleMessage);
            this._updateTransport(this._currentMeas, this._currentBeat, this._currentTick);
        }
        _getMeas() {
            return Atomics.load(this._currentMeas, 0);
        }
        _getBeat() {
            return Atomics.load(this._currentBeat, 0);
        }
        _getTick() {
            return Atomics.load(this._currentTick, 0);
        }
        /**
         * @param {number} [qpm]
         */
        _getQuarterPerSec(qpm = this._parameterState.timeSigNumerator.value) {
            return qpm / 60;
        }
        /**
         * @param {number} [qpm]
         */
        _getSecPerQuarter(qpm = this._parameterState.timeSigNumerator.value) {
            return 60 / qpm;
        }
        /**
         * @param {number} [qpm]
         */
        _getPulsePerSec(qpm = this._parameterState.timeSigNumerator.value) {
            return this._getQuarterPerSec(qpm) * this._ppq;
        }
        /**
         * @param {number} [qpm]
         */
        _getSecPerPulse(qpm = this._parameterState.timeSigNumerator.value) {
            return 1 / this._getPulsePerSec(qpm)
        }
        /**
         * @param {number} meas
         * @param {number} beat
         * @param {number} tick
         */
        setTransport(meas, beat, tick) {
            const [_meas, _beat, _tick] = this._validate(meas - 1, beat - 1, tick);
            this._tick = _tick;
            Atomics.store(this._currentMeas, 0, _meas);
            Atomics.store(this._currentBeat, 0, _beat);
            Atomics.store(this._currentTick, 0, ~~_tick);
            this._updateTransport(this._currentMeas, this._currentBeat, this._currentTick);
            this._emitTranportEvent();
        }
        /**
         * @param {number} meas
         * @param {number} beat
         * @param {number} tick
         * @param {number} [numerator]
         * @param {number} [denominator]
         */
        _validate(meas, beat, tick, numerator = this._parameterState.timeSigNumerator.value, denominator = this._parameterState.timeSigDenominator.value) {
            const ppq = this._ppq;
            const ppb = ppq * 4 / denominator;
            const _tick = (tick % ppb + ppb) % ppb;
            const rbeat = ~~beat + Math.floor(tick / ppb);
            const _beat = (rbeat % numerator + numerator) % numerator;
            const _meas = ~~meas + Math.floor(rbeat / numerator);
            return [_meas, _beat, _tick];
        }
        /**
         * @param {Uint32Array} measure
         * @param {Uint32Array} beat
         * @param {Uint32Array} tick
         */
        _updateTransport(measure, beat, tick) {
            this.port.postMessage({
                tranport: {
                    measure,
                    beat,
                    tick
                }
            });
        }
		/**
		 * Fetch plugin's params.
		 * @returns {WamParameterInfoMap}
		 */
		_generateWamParameterInfo() {
			return {
				playing: new WamParameterInfo('playing', {
					type: 'boolean',
					label: 'Playing',
					defaultValue: 0,
				}),
				tempo: new WamParameterInfo('tempo', {
					type: 'int',
					label: 'Tempo (BPM)',
					defaultValue: 60,
                    minValue: 1,
                    maxValue: 480,
                    discreteStep: 1,
				}),
				timeSigDenominator: new WamParameterInfo('timeSigDenominator', {
					type: 'int',
					label: 'Time Signature Denominator',
					defaultValue: 4,
                    minValue: 1,
                    maxValue: 128
				}),
				timeSigNumerator: new WamParameterInfo('timeSigNumerator', {
					type: 'int',
					label: 'Time Signature Numerator',
					defaultValue: 4,
                    minValue: 1,
                    maxValue: 128
				})
			};
		}

		/**
		 * @param {WamParameterDataMap} parameterUpdates
		 * @param {boolean} interpolate
		 */
		_setParameterValues(parameterUpdates, interpolate) {
            return super._setParameterValues(parameterUpdates, false);
        }

        _getProcessingSlices() {
            this._processingSlices = super._getProcessingSlices();
            return this._processingSlices;
        }
		/**
		 * @param {number} startSample beginning of processing slice
		 * @param {number} endSample end of processing slice
		 * @param {Float32Array[][]} inputs
		 * @param {Float32Array[][]} outputs
		 * @param {{[x: string]: Float32Array}} parameters
		 */
		_process(startSample, endSample, inputs, outputs, parameters) {
            const { sampleRate, currentTime } = audioWorkletGlobalScope;
            const events = this._processingSlices.find(s => s.range[0] === startSample)?.events;
            const playing = !!this._parameterInterpolators.playing.values[startSample];
            const tempo = this._parameterInterpolators.tempo.values[startSample];
            const timeSigDenominator = this._parameterInterpolators.timeSigDenominator.values[startSample];
            const timeSigNumerator = this._parameterInterpolators.timeSigNumerator.values[startSample];
            const ppq = this._ppq;
            const ppb = ppq * 4 / timeSigDenominator;
            let somethingChanged = !!events.length;
            if (playing !== this._playing) {
                this._playing = playing;
                somethingChanged = true;
            }
            if (tempo !== this._tempo) {
                this._tempo = tempo;
                somethingChanged = true;
            }
            if (timeSigDenominator !== this._timeSigDenominator) {
                this._timeSigDenominator = timeSigDenominator;
                somethingChanged = true;
            }
            if (timeSigNumerator !== this._timeSigNumerator) {
                this._timeSigNumerator = timeSigNumerator;
                somethingChanged = true;
            }
            if (somethingChanged) {
                this.emitEvents({ type: 'wam-transport', data: {
                    currentBar: this._getMeas() + 1,
                    currentBarStarted: (currentTime + startSample * sampleRate) - (this._tick + ppb * this._getBeat()) * this._getSecPerPulse(tempo),
                    tempo,
                    timeSigDenominator,
                    timeSigNumerator,
                    playing
                } });
            }
            if (!playing) return;
            const secPerSample = 1 / sampleRate;
            const tickDelta = secPerSample * (endSample - startSample) * this._getPulsePerSec(tempo);
            const [_meas, _beat, _tick] = this._validate(this._getMeas(), this._getBeat(), this._tick + tickDelta, timeSigNumerator, timeSigDenominator);
            this._tick = _tick;
            Atomics.store(this._currentMeas, 0, _meas);
            Atomics.store(this._currentBeat, 0, _beat);
            Atomics.store(this._currentTick, 0, ~~_tick);
		}
		/**
		 * @param {string} wamInstanceId
		 * @param {number} [output]
		 */
		_connectEvents(wamInstanceId, output) {
            super._connectEvents(wamInstanceId, output);
            this._emitTranportEvent();
        }
        _emitTranportEvent() {
            const playing = !!this._parameterState.timeSigNumerator?.value || false;
            const timeSigNumerator = this._parameterState.timeSigNumerator?.value || 4;
            const timeSigDenominator = this._parameterState.timeSigDenominator?.value || 4;
            const tempo = this._parameterState.tempo?.value || 60;
            const ppq = this._ppq;
            const ppb = ppq * 4 / timeSigDenominator;
            const { currentTime } = audioWorkletGlobalScope;
            this.emitEvents({
                type: 'wam-transport', data: {
                    currentBar: this._getMeas() + 1,
                    currentBarStarted: currentTime - (this._tick + ppb * this._getBeat()) * this._getSecPerPulse(tempo),
                    tempo,
                    timeSigDenominator,
                    timeSigNumerator,
                    playing
                }
            });
        }

        destroy() {
            this.port.removeEventListener('message', this.handleMessage);
            super.destroy();
        }
    }
	try {
		registerProcessor(moduleId, SimpleTransportProcessor);
	} catch (error) {
		console.warn(error);
	}

    return SimpleTransportProcessor;
};

export default getSimpleTransportProcessor;
