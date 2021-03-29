/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
/* eslint-disable import/extensions */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */

import { WebAudioModule, ParamMgrFactory, CompositeAudioNode } from 'sdk';
import Synth101Node from './Node';
import { h, render } from 'preact';
import { SynthView } from './SynthView';

/**
 * @typedef {import('../sdk/src/ParamMgr/ParamMgrNode.js').default} ParamMgrNode
 */

/**
 * @param {URL} relativeURL
 * @returns {string}
 */
const getBasetUrl = (relativeURL) => {
	const baseURL = relativeURL.href.substring(0, relativeURL.href.lastIndexOf('/'));
	return baseURL;
};

let waves = ["sine", "square", "sawtooth", "triangle"]
let lfoWaves: OscillatorType[] = ["triangle", "square"]
let ranges = ["32'", "16'", "8'", "4'"]
let pwms = ["LFO", "Manual", "Env"]
let subRanges = ["-10ct", "-20ct pulse", "-20ct sine", "-20ct tri"]
let vcaSources = ["Env", "Gate"]
let envTriggers = ["Gate", "Trig", "Both"]
let portamentoModes = ["Off", "Auto", "On"]

export default class Synth101 extends WebAudioModule<Synth101Node> {
	//@ts-ignore
	_baseURL = getBasetUrl(new URL('.', import.meta.url));

	_descriptorUrl = `${this._baseURL}/descriptor.json`;

	async _loadDescriptor() {
		const url = this._descriptorUrl;
		if (!url) throw new TypeError('Descriptor not found');
		const response = await fetch(url);
		const descriptor = await response.json();
		Object.assign(this.descriptor, descriptor);
	}

	async initialize(state) {
		await this._loadDescriptor();
		return super.initialize(state);
	}

	async createAudioNode(initialState) {
		const synthNode = new Synth101Node(this.audioContext);

		const paramsConfig = {
            waveform: {
                defaultValue: 0,
                minValue: 0,
                maxValue: waves.length-1,
            },
            detune: {
                defaultValue: 0,
                minValue: -1,
                maxValue: 1
            },
            lfoRate: {
                defaultValue: 0.2,
                minValue: 0,
                maxValue: 1
            },
            lfoWaveform: {
                defaultValue: 0,
                minValue: 0,
                maxValue: lfoWaves.length-1
            },
            oscMod: {
                defaultValue: 0,
                minValue: 0,
                maxValue: 1
            },
			oscRange: {
                defaultValue: 0,
                minValue: 0,
                maxValue: ranges.length-1
            },
            pulseWidth: {
                defaultValue: 0,
                minValue: 0,
                maxValue: 1
            },
			pwmSource: {
                defaultValue: 0,
                minValue: 0,
                maxValue: pwms.length-1
            },
			subRange: {
                defaultValue: 0,
                minValue: 0,
                maxValue: subRanges.length-1
            },
			mixerSaw: {
                defaultValue: 1,
                minValue: 0,
                maxValue: 1
            },
			mixerPulse: {
                defaultValue: 0,
                minValue: 0,
                maxValue: 1
            },
			mixerSub: {
                defaultValue: 0,
                minValue: 0,
                maxValue: 1
            },			
			mixerNoise: {
                defaultValue: 0,
                minValue: 0,
                maxValue: 1
            },
			filterFreq: {
				defaultValue: 0.2,
                minValue: 0,
                maxValue: 1
			},
			filterRes: {
				defaultValue: 0.05,
                minValue: 0,
                maxValue: 1
			},
			filterEnv: {
				defaultValue: 0.15,
                minValue: 0,
                maxValue: 1
			},
			filterMod: {
				defaultValue: 0,
                minValue: 0,
                maxValue: 1
			},
			filterKeyboard: {
				defaultValue: 0,
                minValue: 0,
                maxValue: 1
			},
			vcaSource: {
                defaultValue: 0,
                minValue: 0,
                maxValue: vcaSources.length-1
            },
			envTrigger: {
				defaultValue: 0,
				minValue: 0,
				maxValue: envTriggers.length-1
			},
			envAttack: {
				defaultValue: 0,
                minValue: 0,
                maxValue: 1
			},
			envDecay: {
				defaultValue: 0.2,
                minValue: 0,
                maxValue: 1
			},
			envSustain: {
				defaultValue: 0,
                minValue: 0,
                maxValue: 1
			},
			envRelease: {
				defaultValue: 0,
                minValue: 0,
                maxValue: 1
			},
			portamentoMode: {
				defaultValue: 0,
				minValue: 0,
				maxValue: portamentoModes.length-1
			},
			portamentoTime: {
				defaultValue: 0,
				minValue: 0,
				maxValue: 1
			}
        };
        const internalParamsConfig = {
            waveform: {
                onChange: (v: number) => { synthNode.parameters.waveform = v; synthNode.updateFromState() }
            },
            detune: {
				onChange: (v: number) => { synthNode.parameters.detune = v; synthNode.updateFromState() }
            },
            lfoRate: {
				onChange: (v: number) => { synthNode.parameters.lfoRate = v; synthNode.updateFromState() }
            },
            lfoWaveform: {
				onChange: (v: number) => { synthNode.parameters.lfoWaveform = v; synthNode.updateFromState() }
            },
            oscMod: {
				onChange: (v: number) => { synthNode.parameters.oscMod = v; synthNode.updateFromState() }
            },
			oscRange: {
				onChange: (v: number) => { synthNode.parameters.oscRange = v; synthNode.updateFromState() }
            },
            pulseWidth: {
				onChange: (v: number) => { synthNode.parameters.pulseWidth = v; synthNode.updateFromState() }
            },
			pwmSource: {
				onChange: (v: number) => { synthNode.parameters.pwmSource = v; synthNode.updateFromState() }
            },
			subRange: {
				onChange: (v: number) => { synthNode.parameters.subRange = v; synthNode.updateFromState() }
            },
			mixerSaw: {
				onChange: (v: number) => { synthNode.parameters.mixerSaw = v; synthNode.updateFromState() }
            },
			mixerPulse: {
				onChange: (v: number) => { synthNode.parameters.mixerPulse = v; synthNode.updateFromState() }
            },
			mixerSub: {
				onChange: (v: number) => { synthNode.parameters.mixerSub = v; synthNode.updateFromState() }
            },			
			mixerNoise: {
				onChange: (v: number) => { synthNode.parameters.mixerNoise = v; synthNode.updateFromState() }
            },
			filterFreq: {
				onChange: (v: number) => { synthNode.parameters.filterFreq = v; synthNode.updateFromState() }
			},
			filterRes: {
				onChange: (v: number) => { synthNode.parameters.filterRes = v; synthNode.updateFromState() }
			},
			filterEnv: {
				onChange: (v: number) => { synthNode.parameters.filterEnv = v; synthNode.updateFromState() }
			},
			filterMod: {
				onChange: (v: number) => { synthNode.parameters.filterMod = v; synthNode.updateFromState() }
			},
			filterKeyboard: {
				onChange: (v: number) => { synthNode.parameters.filterKeyboard = v; synthNode.updateFromState() }
			},
			vcaSource: {
				onChange: (v: number) => { synthNode.parameters.vcaSource = v; synthNode.updateFromState() }
            },
			envTrigger: {
				onChange: (v: number) => { synthNode.parameters.envTrigger = v; synthNode.updateFromState() }
			},
			envAttack: {
				onChange: (v: number) => { synthNode.parameters.envAttack = v; synthNode.updateFromState() }
			},
			envDecay: {
				onChange: (v: number) => { synthNode.parameters.envDecay = v; synthNode.updateFromState() }
			},
			envSustain: {
				onChange: (v: number) => { synthNode.parameters.envSustain = v; synthNode.updateFromState() }
			},
			envRelease: {
				onChange: (v: number) => { synthNode.parameters.envRelease = v; synthNode.updateFromState() }
			},
			portamentoMode: {
				onChange: (v: number) => { synthNode.parameters.portamentoMode = v; synthNode.updateFromState() }
			},
			portamentoTime: {
				onChange: (v: number) => { synthNode.parameters.portamentoTime = v; synthNode.updateFromState() }
			}
        };

        const optionsIn = { internalParamsConfig, paramsConfig };
		const paramMgrNode = await ParamMgrFactory.create(this, optionsIn);
		synthNode.setup(paramMgrNode);

		if (initialState) synthNode.setState(initialState);
		return synthNode;
    }

	async createGui() {
		const div = document.createElement('div');
		// hack because h() is getting stripped for non-use despite it being what the JSX compiles to
		h("div", {})

		var shadow = div.attachShadow({mode: 'open'});
		render(<SynthView plugin={this}></SynthView>, shadow);

		return div;
	}

	destroyGui(el: Element) {
		console.log("destroyGui called!")
		render(null, el.shadowRoot)
	}
}
