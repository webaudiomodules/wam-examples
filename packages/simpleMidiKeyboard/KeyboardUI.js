/* eslint-disable max-len */
/* eslint-disable no-bitwise */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-mixed-operators */
/* eslint-disable object-curly-newline */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */

/**
 * @typedef {{ from: number; to: number; mode: 'mono' | 'poly' | 'touch'; keys: number[]; selected: number }} State
 * @typedef {[number, number, number]} TBPFPoint
 * @typedef {import("../api").WamNode} WamNode
 * @typedef {import("../api").WamParameter} WamParameter
 */

const BLACKS = [1, 3, 6, 8, 10];

class KeyboardUI extends HTMLElement {
	constructor() {
		super();
		/** @type {State} */
		this.state = { from: 24, to: 96, mode: 'touch', keys: [], selected: undefined };
		this.mouseDown = false;
		this.touches = [];
		this.mountedKeysElements = {};

		this.onMidi = undefined;

		this._root = this.attachShadow({ mode: 'open' });
		this._svg = this._root.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this._svg.setAttribute('width', '100%');
		this._svg.setAttribute('height', '100%');
		this._svg.style.touchAction = 'none';
		this._svg.style.maxHeight = '160px';
		this._rect = this._root.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'rect');
		this._rect.setAttribute('x', '0');
		this._rect.setAttribute('y', '0');
		this._rect.setAttribute('width', '100%');
		this._rect.setAttribute('height', '100%');
		this._rect.style.fill = 'transparent';
		this._rect.style.strokeWidth = '2';
		this._rect.style.stroke = 'black';
		this._svg.appendChild(this._rect);
		/** @type {(e: MouseEvent) => any} */
		this.handleMouseDownKey = (e) => {
			const key = +e.currentTarget.getAttribute('values');
			if (this.state.mode === 'touch') {
				if (this.state.keys[key]) return;
				this.touches[-1] = key;
			}
			const rect = e.currentTarget.getBoundingClientRect();
			const y = e.pageY - rect.top;
			const { height } = rect;
			const velocity = (Math.min(127, ~~(y / height * 128)) || 1);
			this.onKeyTriggered?.(key, velocity);
			this.mouseDown = true;
			const handleMouseUp = () => {
				this.mouseDown = false;
				if (this.state.mode === 'touch' && this.touches[-1]) {
					this.onKeyTriggered?.(this.touches[-1], 0);
					delete this.touches[-1];
				}
				this.setState({ selected: undefined });
				document.removeEventListener('mouseup', handleMouseUp);
			};
			document.addEventListener('mouseup', handleMouseUp);
		};
		/** @type {(e: MouseEvent) => any} */
		this.handleMouseEnterKey = (e) => {
			if (!this.mouseDown) return;
			const key = +e.currentTarget.getAttribute('values');
			if (this.state.mode === 'touch') {
				if (this.touches[-1] && this.touches[-1] !== key) {
					this.onKeyTriggered?.(this.touches[-1], 0);
					delete this.touches[-1];
				}
				if (this.state.keys[key]) return;
			}
			const rect = e.currentTarget.getBoundingClientRect();
			const y = e.pageY - rect.top;
			const { height } = rect;
			const velocity = (Math.min(127, ~~(y / height * 128)) || 1);
			this.onKeyTriggered?.(key, velocity);
			if (this.state.mode === 'touch') this.touches[-1] = key;
		};
		/** @type {(e: TouchEvent, keyIn?: number) => any} */
		this.handleTouchStartKey = (e, keyIn) => {
			if (this.state.mode !== 'touch') return;
			e.stopPropagation();
			const key = typeof keyIn === 'number' ? keyIn : +e.currentTarget.getAttribute('values');
			Array.from(e.changedTouches).forEach((touch) => {
				const { identifier: id } = touch;
				if (this.touches[id]) this.onKeyTriggered?.(this.touches[id], 0);
				this.touches[id] = key;
				const rect = e.currentTarget.getBoundingClientRect();
				const y = touch.pageY - rect.top;
				const { height } = rect;
				const velocity = (Math.min(127, ~~(y / height * 128)) || 1);
				this.onKeyTriggered?.(key, velocity);
			});
		};
		/** @type {(e: TouchEvent) => any} */
		this.handleTouchMoveKey = (e) => {
			if (this.state.mode !== 'touch') return;
			e.stopPropagation();
			e.preventDefault();
			Array.from(e.changedTouches).forEach((touch) => {
				const target = document.elementFromPoint(touch.clientX, touch.clientY);
				if (target.parentElement !== e.currentTarget.parentElement) return;
				const key = +target.getAttribute('values');
				if (typeof key === 'undefined') return;
				if (this.state.keys[key]) return;
				this.handleTouchStartKey(e, key);
			});
		};
		/** @type {(e: TouchEvent) => any} */
		this.handleTouchEndKey = (e) => {
			if (this.state.mode !== 'touch') return;
			e.stopPropagation();
			e.preventDefault();
			Array.from(e.changedTouches).forEach((touch) => {
				const { identifier: id } = touch;
				if (this.touches[id]) this.onKeyTriggered?.(this.touches[id], 0);
				delete this.touches[id];
			});
		};
		this.setState(this.state);
	}

	connectedCallback() {
		this._root.appendChild(this._svg);
	}

	/**
	 * @param {Partial<State>} state
	 */
	setState(state) {
		let rangeChanged = false;
		const keysChanged = new Set();
		for (const key in state) {
			if (key === 'from' || key === 'true') {
				rangeChanged = true;
			} else if (key === 'keys') {
				this.state[key].forEach((v, i) => {
					if (v !== this.state[key][i]) keysChanged.add(i);
				});
			} else if (key === 'selected') {
				if (state[key]) keysChanged.add(state[key]);
				if (this.state[key]) keysChanged.add(this.state[key]);
			}
			this.state[key] = state[key];
		}
		if (rangeChanged) {
			this._svg.innerHTML = '';
			this._svg.appendChild(this._rect);
			this.keysElements.forEach((key) => this._svg.appendChild(key));
		} else if (keysChanged) {
			keysChanged.forEach((k) => this.updateKeyElement(k));
		}
	}

	// eslint-disable-next-line class-methods-use-this
	get flushed() {
		const keys = [];
		for (let i = 0; i < 128; i++) {
			keys[i] = 0;
		}
		return keys;
	}

	/**
	 * @param {number} keyIn
	 * @param {number} velocityIn
	 * @param {boolean} [noOutput]
	 */
	onKeyTriggered(keyIn, velocityIn, noOutput) {
		const key = Math.max(0, Math.min(127, ~~+keyIn));
		const velocity = Math.max(0, Math.min(127, ~~+velocityIn));
		const { mode } = this.state;
		if (mode === 'mono') {
			const keys = this.flushed;
			keys[key] = velocity;
			if (!noOutput) this.onMidi?.(new Uint8Array([9 << 4, key, velocity]));
			this.setState({ keys, selected: key });
		} else if (mode === 'poly') {
			const { keys } = this.state;
			const v = +!keys[key] * (velocity || 1);
			keys[key] = v;
			if (!noOutput) this.onMidi?.(new Uint8Array([9 << 4, key, v]));
			this.setState({ keys: [...keys], selected: v ? key : undefined });
		} else {
			const { keys } = this.state;
			keys[key] = velocity;
			if (!noOutput) this.onMidi?.(new Uint8Array([9 << 4, key, velocity]));
			this.setState({ keys: [...keys], selected: velocity ? key : undefined });
		}
	}

	// eslint-disable-next-line class-methods-use-this
	isBlack(key) {
		return BLACKS.indexOf(key % 12) !== -1;
	}

	get from() {
		if (this.isBlack(this.state.from)) return this.state.from - 1;
		return this.state.from;
	}

	get to() {
		if (this.isBlack(this.state.to)) return this.state.to + 1;
		return this.state.to;
	}

	get whiteCount() {
		const { to } = this;
		let { from } = this;
		if (from >= to) return 0;
		let count = 0;
		while (from <= to) {
			if (!this.isBlack(from++)) count++;
		}
		return count;
	}

	updateKeyElement($key) {
		const rect = this.mountedKeysElements[$key];
		if (!rect) return;
		const { state } = this;
		const { selected } = state;
		const blackKeyColor = 'black';
		const whiteKeyColor = 'white';
		const keyOnColor = 'grey';
		const selectedColor = 'yellow';
		/** @type {CSSStyleDeclaration} */
		const blackStyle = { fill: blackKeyColor, strokeWidth: 1, stroke: 'black' };
		/** @type {CSSStyleDeclaration} */
		const whiteStyle = { fill: whiteKeyColor, strokeWidth: 1, stroke: 'black' };
		/** @type {CSSStyleDeclaration} */
		const keyOnStyle = { fill: keyOnColor, strokeWidth: 1, stroke: 'black' };
		/** @type {CSSStyleDeclaration} */
		const selectedStyle = { fill: selectedColor, strokeWidth: 1, stroke: 'black' };
		const keyOn = +!!this.state.keys[$key];
		if (this.isBlack($key)) {
			const style = $key === selected ? selectedStyle : keyOn ? keyOnStyle : blackStyle;
			for (const s in style) {
				rect.style[s] = style[s];
			}
		} else {
			const style = $key === selected ? selectedStyle : keyOn ? keyOnStyle : whiteStyle;
			for (const s in style) {
				rect.style[s] = style[s];
			}
		}
	}

	getKeyElement($key, $white) {
		const { whiteCount, state } = this;
		const { selected } = state;
		const blackKeyColor = 'black';
		const whiteKeyColor = 'white';
		const keyOnColor = 'grey';
		const selectedColor = 'yellow';
		/** @type {CSSStyleDeclaration} */
		const blackStyle = { fill: blackKeyColor, strokeWidth: 1, stroke: 'black' };
		/** @type {CSSStyleDeclaration} */
		const whiteStyle = { fill: whiteKeyColor, strokeWidth: 1, stroke: 'black' };
		/** @type {CSSStyleDeclaration} */
		const keyOnStyle = { fill: keyOnColor, strokeWidth: 1, stroke: 'black' };
		/** @type {CSSStyleDeclaration} */
		const selectedStyle = { fill: selectedColor, strokeWidth: 1, stroke: 'black' };
		const whiteWidthPercentage = 100 / whiteCount;
		const blackWidthPercentage = 100 / whiteCount * 2 / 3;
		const whiteWidth = `${whiteWidthPercentage}%`;
		const blackWidth = `${blackWidthPercentage}%`;
		const keyOn = +!!this.state.keys[$key];
		const rect = this._root.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'rect');
		rect.setAttribute('values', $key);
		rect.onmousedown = this.handleMouseDownKey;
		rect.onmouseenter = this.handleMouseEnterKey;
		rect.ontouchstart = this.handleTouchStartKey;
		rect.ontouchmove = this.handleTouchMoveKey;
		rect.ontouchend = this.handleTouchEndKey;
		if (this.isBlack($key)) {
			const style = $key === selected ? selectedStyle : keyOn ? keyOnStyle : blackStyle;
			const x = `${($white - 1 / 3) * whiteWidthPercentage}%`;
			rect.setAttribute('x', x);
			rect.setAttribute('y', '0');
			rect.setAttribute('width', blackWidth);
			rect.setAttribute('height', '70%');
			for (const s in style) {
				rect.style[s] = style[s];
			}
			return { isBlack: true, rect, $white };
		}
		const style = $key === selected ? selectedStyle : keyOn ? keyOnStyle : whiteStyle;
		const x = `${$white * whiteWidthPercentage}%`;
		rect.setAttribute('x', x);
		rect.setAttribute('y', '0');
		rect.setAttribute('width', whiteWidth);
		rect.setAttribute('height', '100%');
		for (const s in style) {
			rect.style[s] = style[s];
		}
		return { isBlack: false, rect, $white: $white + 1 };
	}

	get keysElements() {
		const { from, to } = this;
		/** @type {SVGRectElement[]} */
		const whites = [];
		/** @type {SVGRectElement[]} */
		const blacks = [];
		let $white = 0;
		let key = from;
		this.mountedKeysElements = {};
		while (key <= to) {
			const { isBlack, rect, $white: white } = this.getKeyElement(key, $white);
			if (isBlack) blacks.push(rect);
			else whites.push(rect);
			this.mountedKeysElements[key] = rect;
			$white = white;
			key++;
		}
		return [...whites, ...blacks];
	}
}

try {
	customElements.define('webaudiomodules-keyboard-ui', KeyboardUI);
	console.log('Element defined');
} catch (error) {
	console.log(error);
	console.log('Element already defined');
}

export default KeyboardUI;
