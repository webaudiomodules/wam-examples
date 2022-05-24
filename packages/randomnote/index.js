/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */
import WebAudioModule from '../sdk/src/WebAudioModule.js';
import ParamMgrFactory from '../sdk-parammgr/src/ParamMgrFactory.js';
import CompositeAudioNode from '../sdk-parammgr/src/CompositeAudioNode.js';

/**
 * @param {URL} relativeURL
 * @returns {string}
 */
const getBasetUrl = (relativeURL) => {
	const baseURL = relativeURL.href.substring(0, relativeURL.href.lastIndexOf('/'));
	return baseURL;
};

class Node extends CompositeAudioNode {
	destroyed = false;
	/**
	 * @param {AudioWorkletNode} output
	 * @param {import('../sdk-parammgr').ParamMgrNode} paramMgr
	 */

	setup(output, paramMgr) {
		this.connect(output, 0, 0);
		this._wamNode = paramMgr;
		this._output = output;
	}

	destroy() {
		super.destroy();
		this.destroyed = true;
		if (this._output) this._output.parameters.get('destroyed').value = 1;
	}
}

export default class RandomNotePlugin extends WebAudioModule {
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
		await this.audioContext.audioWorklet.addModule(`${this._baseURL}/processor.worklet.js`);
		const randomizerOptions = {
			processorOptions: {
				moduleId: this.moduleId,
				instanceId: this.instanceId
			}
		};
		const randomizerNode = new AudioWorkletNode(this.audioContext, '__WebAudioModule_RandomNoteProcessor', randomizerOptions);

		const node = new Node(this.audioContext);
		const internalParamsConfig = Object.fromEntries(randomizerNode.parameters);
		delete internalParamsConfig.destroyed;
		const optionsIn = { internalParamsConfig };
		const paramMgrNode = await ParamMgrFactory.create(this, optionsIn);
		node.setup(randomizerNode, paramMgrNode);

		// If there is an initial state at construction for this plugin,
		if (initialState) node.setState(initialState);

		node.connect(this.audioContext.destination);

		return node;
	}

	async createGui() {
		const container = document.createElement('div');
		/** @type {Record<string, HTMLInputElement>} */
		const sliders = {};
		/** @type {Record<string, HTMLSpanElement>} */
		const valueSpans = {};
		const parameters = await this.audioNode.getParameterInfo();
		Object.values(parameters).forEach((info) => {
			const {
				id,
				defaultValue,
				minValue,
				maxValue,
			} = info;
			const div = document.createElement('div');
			div.style.color = 'dimgrey';
			div.style.display = 'flex';
			div.style.flex = '1 1 auto';
			const span = document.createElement('span');
			span.style.margin = 'auto 2px';
			span.style.flex = '0 0 20%';
			span.innerText = id;
			const valueSpan = document.createElement('span');
			valueSpan.innerText = defaultValue.toFixed(2);
			valueSpan.style.margin = 'auto 2px';
			valueSpan.style.flex = '0 0 10%';
			valueSpans[id] = valueSpan;
			const slider = document.createElement('input');
			slider.type = 'range';
			slider.min = minValue;
			slider.max = maxValue;
			slider.value = defaultValue;
			slider.step = (maxValue - minValue) / 1000;
			slider.style.flex = '1 1 auto';
			slider.style.margin = 'auto 2px';
			slider.addEventListener('input', (e) => {
				const { value } = e.currentTarget;
				this.audioNode?.setParameterValues({ [id]: { id, value, normalized: false } });
			});
			div.appendChild(span);
			div.appendChild(slider);
			div.appendChild(valueSpan);
			container.appendChild(div);
			sliders[id] = slider;
		});
		container.style.position = 'relative';
		container.style.display = 'flex';
		container.style.flexDirection = 'column';
		container.style.height = '100%';
		const handleAnimationFrame = async () => {
			if (this.audioNode?.destroyed) return;
			if (!container.isConnected) {
				window.requestAnimationFrame(handleAnimationFrame);
				return;
			}
			const parameterValues = await this.audioNode.getParameterValues();
			Object.values(parameterValues).forEach((data) => {
				const { id, value } = data;
				const s = sliders[id];
				if (+s.value !== value) s.value = value;
				const v = valueSpans[id];
				const text = value.toFixed(2);
				if (v.innerText !== text) v.innerText = text;
			});
			window.requestAnimationFrame(handleAnimationFrame);
		};
		window.requestAnimationFrame(handleAnimationFrame);
		return container;
	}
}
