/* eslint-disable no-console */
/* eslint-disable no-constant-condition */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-shadow */
/* eslint-disable no-mixed-operators */
/* eslint-disable max-len */
/**
 * @typedef {{ points: TBPFPoint[]; ghostPoint: TBPFPoint; domain: number; range: [number, number]; defaultValue: number }} State
 * @typedef {[number, number, number]} TBPFPoint
 * @typedef {import("../api/src").WamNode} WamNode
 * @typedef {import("../api/src").WamParameter} WamParameter
 */
const round = (x, to) => (Math.abs(to) < 1 ? Math.round(x * (1 / to)) / (1 / to) : Math.round(x / to) * to);
const normExp = (x, e) => Math.max(0, x) ** (1.5 ** e);
const scale = (x, l1, h1, l2, h2) => {
	const r1 = h1 - l1;
	const r2 = h2 - l2;
	return (x - l1) / r1 * r2 + l2;
};
const scaleClip = (x, l1, h1, l2, h2) => Math.max(l2, Math.min(h2, scale(x, l1, h1, l2, h2)));

class BPF extends HTMLElement {
	static get observedAttributes() {
		return ['min', 'max', 'domain', 'default'];
	}

	constructor() {
		super();
		/**
         * @type {State}
         */
		this.state = {
			points: [], ghostPoint: undefined, domain: 1, range: [-1, 1], defaultValue: 0,
		};
		this.dragged = false;
		this.mouseDown = false;
		/**
         * @type {{ texts: SVGTextElement[]; ghostText: SVGTextElement; circles: SVGCircleElement[]; ghostCircle: SVGCircleElement; lines: SVGLineElement[]; linesEvents: SVGLineElement[] }}
         */
		this.rendered = {
			texts: [], ghostText: undefined, circles: [], ghostCircle: undefined, lines: [], linesEvents: [],
		};

		this.handleMouseMove = () => {
			this.setState({ ghostPoint: undefined });
		};
		/**
         * @param {MouseEvent} e
         */
		this.handleDoubleClick = (e) => {
			if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
			e.stopPropagation();
			this.dragged = false;
			const { points } = this.state;
			/** @type {SVGSVGElement} */
			const svg = e.currentTarget;
			let {
				left, top, width, height,
			} = svg.getBoundingClientRect();
			left += 0.025 * width;
			top += 0.025 * height;
			width *= 0.95;
			height *= 0.95;
			const normalizedX = (e.clientX - left) / width;
			const normalizedY = 1 - (e.clientY - top) / height;
			const [x, y] = this.denormalizePoint(normalizedX, normalizedY);
			const { index: $point, point } = this.getInsertPoint(x, y);
			points.splice($point, 0, point);
			this.setState({ points: points.slice() });
		};
		/**
         * @param {MouseEvent} e
         */
		this.handleMouseMoveLine = (e) => {
			if (this.mouseDown) return;
			e.stopPropagation();
			/** @type {SVGLineElement} */
			const line = e.currentTarget;
			if (e.altKey) {
				line.style.cursor = 'ns-resize';
				return;
			}
			line.style.cursor = 'unset';
			const { domain } = this.state;
			const svg = line.parentElement.parentElement;
			let { left, width } = svg.getBoundingClientRect();
			left += 0.025 * width;
			width *= 0.95;
			const normalizedX = (e.clientX - left) / width;
			const { point } = this.getInsertPoint(normalizedX * domain);
			this.setState({ ghostPoint: point });
		};
		/**
         * @param {MouseEvent} e
         */
		this.handleMouseDownLine = (e) => {
			e.stopPropagation();
			this.dragged = false;
			this.mouseDown = true;
			/** @type {SVGLineElement} */
			const line = e.currentTarget;
			const { points, domain, range } = this.state;
			const svg = line.parentElement.parentElement;
			let {
				left, top, width, height,
			} = svg.getBoundingClientRect();
			left += 0.025 * width;
			top += 0.025 * height;
			width *= 0.95;
			height *= 0.95;
			if (e.altKey) {
				const i = +line.getAttribute('values');
				const prev = points[i];
				const next = points[i + 1];
				const { clientY } = e;
				if (!prev) return;
				/**
                 * @param {MouseEvent} e
                 */
				const handleMouseMove = (e) => {
					e.stopPropagation();
					this.dragged = true;
					let [rangeMin, rangeMax] = range;
					if (rangeMin > rangeMax) [rangeMin, rangeMax] = [rangeMax, rangeMin];
					const rangeInterval = rangeMax - rangeMin;
					if (!rangeInterval) return;
					const delta = (e.clientY - clientY) / height * rangeInterval;
					points[i] = prev.slice();
					points[i][1] = Math.min(rangeMax, Math.max(rangeMin, prev[1] - delta));
					if (next) {
						points[i + 1] = next.slice();
						points[i + 1][1] = Math.min(rangeMax, Math.max(rangeMin, next[1] - delta));
					}
					this.setState({ points: points.slice() });
				};
				const handleMouseUp = () => {
					e.stopPropagation();
					this.mouseDown = false;
					document.removeEventListener('mousemove', handleMouseMove);
					document.removeEventListener('mouseup', handleMouseUp);
				};
				document.addEventListener('mousemove', handleMouseMove);
				document.addEventListener('mouseup', handleMouseUp);
			} else {
				const normalizedX = (e.clientX - left) / width;
				const { index: $point, point } = this.getInsertPoint(normalizedX * domain);
				const limits = [
					(points.length ? points[$point - 1][0] / domain : 0) * width + left,
					points[$point] ? points[$point][0] / domain * width + left : left + width,
				];
				points.splice($point, 0, point);
				this.setState({ points: points.slice() });
				/**
                 * @param {MouseEvent} e
                 */
				const handleMouseMove = (e) => {
					e.stopPropagation();
					e.preventDefault();
					this.dragged = true;
					const clientX = Math.max(limits[0], Math.min(limits[1], e.clientX));
					const clientY = Math.max(top, Math.min(top + height, e.clientY));
					const normalized = [(clientX - left) / width, 1 - (clientY - top) / height];
					const [x, y] = this.denormalizePoint(...normalized);
					const point = [x, y, 0];
					points[$point] = point;
					this.setState({ points: points.slice() });
				};
				const handleMouseUp = () => {
					e.stopPropagation();
					e.preventDefault();
					this.mouseDown = false;
					document.removeEventListener('mousemove', handleMouseMove);
					document.removeEventListener('mouseup', handleMouseUp);
				};
				document.addEventListener('mousemove', handleMouseMove);
				document.addEventListener('mouseup', handleMouseUp);
			}
		};
		/**
         * @param {MouseEvent} e
         */
		this.handleMouseDownCircle = (e) => {
			e.stopPropagation();
			this.dragged = false;
			const { points, domain } = this.state;
			/** @type {SVGCircleElement} */
			const circle = e.currentTarget;
			/** @type {SVGSVGElement} */
			const svg = circle.parentElement.parentElement;
			let {
				left, top, width, height,
			} = svg.getBoundingClientRect();
			left += 0.025 * width;
			top += 0.025 * height;
			width *= 0.95;
			height *= 0.95;
			const i = +circle.getAttribute('values');
			const limits = [
				points[i - 1] ? points[i - 1][0] / domain * width + left : left,
				points[i + 1] ? points[i + 1][0] / domain * width + left : left + width,
			];
			const [x, y] = this.normalizePoint(points[i][0], points[i][1]);
			const circleX = left + x * width;
			const circleY = top + (1 - y) * height;
			/**
             * @param {MouseEvent} e
             */
			const handleMouseMove = (e) => {
				e.stopPropagation();
				e.preventDefault();
				this.dragged = true;
				const clientX = Math.max(limits[0], Math.min(limits[1], e.shiftKey || Math.abs(circleX - e.clientX) > 5 ? e.clientX : circleX));
				const clientY = Math.max(top, Math.min(top + height, e.shiftKey || Math.abs(circleY - e.clientY) > 5 ? e.clientY : circleY));
				const normalized = [(clientX - left) / width, 1 - (clientY - top) / height];
				const [x, y] = this.denormalizePoint(...normalized);
				const point = [x, y, 0];
				points[i] = point;
				this.setState({ points: points.slice() });
			};
			const handleMouseUp = () => {
				e.stopPropagation();
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			};
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		};
		/**
         * @param {MouseEvent} e
         */
		this.handleDoubleClickCircle = (e) => {
			e.stopPropagation();
			e.preventDefault();
			if (this.dragged) return;
			const circle = e.currentTarget;
			const i = +circle.getAttribute('values');
			const { points } = this.state;
			points.splice(i, 1);
			this.setState({ points: points.slice() });
		};
		this._root = this.attachShadow({ mode: 'open' });
		this._svg = this._root.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this._svg.setAttribute('width', '100%');
		this._svg.setAttribute('height', '100%');
		this._svg.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
		this._svg.addEventListener('mousemove', this.handleMouseMove);
		this._svg.addEventListener('dblclick', this.handleDoubleClick);
		this._root.appendChild(this._svg);
		this._g = this._root.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
		this._g.setAttribute('transform', 'scale(0.95, 0.95)');
		this._g.style.transformOrigin = 'center';
		this._svg.appendChild(this._g);
		this.setState(this.state);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		const value = +newValue;
		if (isNaN(value)) return;
		if (name === 'min' || name === 'max') {
			const prevRange = this.state.range;
			const range = name === 'min' ? [Math.max(-128, value), this.state.range[1]] : [this.state.range[0], Math.min(128, value)];
			const points = this.state.points.map((p) => [p[0], scaleClip(p[1], prevRange[0], prevRange[1], range[0], range[1]), p[2]]);
			this.setState({ points, range });
		} else if (name === 'domain') {
			const prevDomain = this.state.domain;
			const domain = value;
			const points = this.state.points.map((p) => [scaleClip(p[0], 0, prevDomain, 0, domain), p[1], p[2]]);
			this.setState({ points, domain });
		} else if (name === 'default') {
			this.setState({ defaultValue: value });
		}
	}

	get points() {
		return this.state.points;
	}

	get domain() {
		return this.state.domain;
	}

	get range() {
		return this.state.range;
	}

	/**
     * @param {WamNode} wamNode
     * @param {string} wamParamId
     */
	async apply(wamNode, wamParamId) {
		const audioCtx = wamNode.context;
		const { currentTime } = audioCtx;
		wamNode.clearEvents();
		const currentValue = (await wamNode.getParameterValues(false, wamParamId))[wamParamId].value;
		wamNode.scheduleEvents({ type: 'wam-automation', data: { id: wamParamId, value: currentValue }, time: currentTime });
		for (let t = 0; t < this.domain; t += 0.01) {
			const value = this.getYfromX(t);
			wamNode.scheduleEvents({ type: 'wam-automation', data: { id: wamParamId, value }, time: currentTime + t });
		}
	}

	/**
     * @param {Partial<State>} state
     */
	setState(state) {
		const { ghostPoint } = state;
		for (const key in state) {
			this.state[key] = state[key];
		}
		this.state.range = [Math.max(-128, this.state.range[0]), Math.min(128, this.state.range[1])];
		const { domain, points } = this.state;
		const { normalizedPoints } = this;
		if (ghostPoint) {
			const point = this.normalizePoint(ghostPoint[0], ghostPoint[1]);
			const x = `${point[0] * 100}%`;
			const y = `${(1 - point[1]) * 100}%`;
			const textAnchor = point[0] < 0.5 ? 'start' : 'end';
			const textX = `${point[0] * 100 + (point[0] < 0.5 ? 2 : -2)}%`;
			const textY = `${(1 - point[1]) * 100 + (point[1] < 0.5 ? -2 : 8)}%`;
			/** @type {CSSStyleDeclaration} */
			const textStyle = {
				userSelect: 'none',
				WebkitUserSelect: 'none',
				pointerEvents: 'none',
				font: 'Arial',
				fill: 'white',
			};
			if (this.rendered.ghostCircle) {
				this.rendered.ghostCircle.setAttribute('cx', x);
				this.rendered.ghostCircle.setAttribute('cy', y);
			} else {
				const ghostCircle = this._root.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'circle');
				ghostCircle.setAttribute('r', 4);
				ghostCircle.setAttribute('fill', 'white');
				ghostCircle.style.opacity = 0.25;
				ghostCircle.style.pointerEvents = 'none';
				ghostCircle.setAttribute('cx', x);
				ghostCircle.setAttribute('cy', y);
				this.rendered.ghostCircle = ghostCircle;
				this._g.insertBefore(ghostCircle, this._g.firstElementChild);
			}
			if (this.rendered.ghostText) {
				this.rendered.ghostText.setAttribute('x', textX);
				this.rendered.ghostText.setAttribute('y', textY);
				this.rendered.ghostText.setAttribute('text-anchor', textAnchor);
				this.rendered.ghostText.textContent = `${round(ghostPoint[0], 0.01)}, ${round(ghostPoint[1], 0.01)}`;
			} else {
				const text = this._root.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'text');
				text.setAttribute('x', textX);
				text.setAttribute('y', textY);
				text.setAttribute('text-anchor', textAnchor);
				text.textContent = `${round(ghostPoint[0], 0.01)}, ${round(ghostPoint[1], 0.01)}`;
				for (const key in textStyle) {
					text.style[key] = textStyle[key];
				}
				this.rendered.ghostText = text;
				this._g.insertBefore(text, this._g.firstElementChild);
			}
		} else {
			if (this.rendered.ghostCircle) {
				this.rendered.ghostCircle.remove();
				this.rendered.ghostCircle = undefined;
			}
			if (this.rendered.ghostText) {
				this.rendered.ghostText.remove();
				this.rendered.ghostText = undefined;
			}
		}
		let prevX;
		let prevY;
		let lines = 0;
		for (let i = 0; i < normalizedPoints.length; i++) {
			const point = normalizedPoints[i];
			const x = `${point[0] * 100}%`;
			const y = `${(1 - point[1]) * 100}%`;
			const textAnchor = point[0] < 0.5 ? 'start' : 'end';
			const textX = `${point[0] * 100 + (point[0] < 0.5 ? 2 : -2)}%`;
			const textY = `${(1 - point[1]) * 100 + (point[1] < 0.5 ? -2 : 8)}%`;
			/** @type {CSSStyleDeclaration} */
			const textStyle = {
				userSelect: 'none',
				WebkitUserSelect: 'none',
				pointerEvents: 'none',
				font: 'Arial',
				fill: 'white',
			};
			if (this.rendered.circles[i]) {
				this.rendered.circles[i].setAttribute('cx', x);
				this.rendered.circles[i].setAttribute('cy', y);
			} else {
				const circle = this._root.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'circle');
				circle.setAttribute('r', 4);
				circle.setAttribute('values', i);
				circle.setAttribute('fill', 'white');
				circle.setAttribute('cx', x);
				circle.setAttribute('cy', y);
				circle.addEventListener('mousedown', this.handleMouseDownCircle);
				circle.addEventListener('dblclick', this.handleDoubleClickCircle);
				this.rendered.circles[i] = circle;
				this._g.appendChild(circle);
			}
			if (this.rendered.texts[i]) {
				this.rendered.texts[i].setAttribute('x', textX);
				this.rendered.texts[i].setAttribute('y', textY);
				this.rendered.texts[i].setAttribute('text-anchor', textAnchor);
				this.rendered.texts[i].textContent = `${round(points[i][0], 0.01)}, ${round(points[i][1], 0.01)}`;
			} else {
				const text = this._root.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'text');
				text.setAttribute('x', textX);
				text.setAttribute('y', textY);
				text.setAttribute('text-anchor', textAnchor);
				text.textContent = `${round(points[i][0], 0.01)}, ${round(points[i][1], 0.01)}`;
				for (const key in textStyle) {
					text.style[key] = textStyle[key];
				}
				this.rendered.texts[i] = text;
				this._g.insertBefore(text, this._g.firstElementChild);
			}
			if (prevX && prevY) {
				if (this.rendered.lines[i]) {
					this.rendered.lines[i].setAttribute('x1', prevX);
					this.rendered.lines[i].setAttribute('y1', prevY);
					this.rendered.lines[i].setAttribute('x2', x);
					this.rendered.lines[i].setAttribute('y2', y);
				} else {
					const line = this._root.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'line');
					line.setAttribute('x1', prevX);
					line.setAttribute('y1', prevY);
					line.setAttribute('x2', x);
					line.setAttribute('y2', y);
					line.setAttribute('stroke', 'white');
					line.setAttribute('stroke-width', 2);
					this.rendered.lines[i] = line;
					this._g.insertBefore(line, this._g.firstElementChild);
				}
				if (this.rendered.linesEvents[i]) {
					this.rendered.linesEvents[i].setAttribute('x1', prevX);
					this.rendered.linesEvents[i].setAttribute('y1', prevY);
					this.rendered.linesEvents[i].setAttribute('x2', x);
					this.rendered.linesEvents[i].setAttribute('y2', y);
				} else {
					const line = this._root.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'line');
					line.setAttribute('x1', prevX);
					line.setAttribute('y1', prevY);
					line.setAttribute('x2', x);
					line.setAttribute('y2', y);
					line.setAttribute('stroke', 'transparent');
					line.setAttribute('stroke-width', 10);
					line.setAttribute('values', i);
					line.addEventListener('mousedown', this.handleMouseDownLine);
					line.addEventListener('mousemove', this.handleMouseMoveLine);
					this.rendered.linesEvents[i] = line;
					this._g.insertBefore(line, this._g.firstElementChild);
				}
				lines++;
			}
			prevX = x;
			prevY = y;
		}
		if (points.length && points[points.length - 1][0] !== domain) {
			const i = points.length;
			if (this.rendered.lines[i]) {
				this.rendered.lines[i].setAttribute('x1', prevX);
				this.rendered.lines[i].setAttribute('y1', prevY);
				this.rendered.lines[i].setAttribute('x2', '100%');
				this.rendered.lines[i].setAttribute('y2', prevY);
			} else {
				const line = this._root.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'line');
				line.setAttribute('x1', prevX);
				line.setAttribute('y1', prevY);
				line.setAttribute('x2', '100%');
				line.setAttribute('y2', prevY);
				line.setAttribute('stroke', 'white');
				line.setAttribute('stroke-width', 2);
				line.style.pointerEvents = 'none';
				this.rendered.lines[i] = line;
				this._g.insertBefore(line, this._g.firstElementChild);
			}
			if (this.rendered.linesEvents[i]) {
				this.rendered.linesEvents[i].setAttribute('x1', prevX);
				this.rendered.linesEvents[i].setAttribute('y1', prevY);
				this.rendered.linesEvents[i].setAttribute('x2', '100%');
				this.rendered.linesEvents[i].setAttribute('y2', prevY);
			} else {
				const line = this._root.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'line');
				line.setAttribute('x1', prevX);
				line.setAttribute('y1', prevY);
				line.setAttribute('x2', '100%');
				line.setAttribute('y2', prevY);
				line.setAttribute('stroke', 'transparent');
				line.setAttribute('stroke-width', 10);
				line.setAttribute('values', i);
				line.addEventListener('mousedown', this.handleMouseDownLine);
				line.addEventListener('mousemove', this.handleMouseMoveLine);
				this.rendered.linesEvents[i] = line;
				this._g.insertBefore(line, this._g.firstElementChild);
			}
			lines++;
		}
		if (!points.length) {
			const i = 0;
			const y = `${(1 - this.normalizedDefault) * 100}%`;
			if (this.rendered.lines[i]) {
				this.rendered.lines[i].setAttribute('x1', '0%');
				this.rendered.lines[i].setAttribute('y1', y);
				this.rendered.lines[i].setAttribute('x2', '100%');
				this.rendered.lines[i].setAttribute('y2', y);
			} else {
				const line = this._root.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'line');
				line.setAttribute('x1', '0%');
				line.setAttribute('y1', y);
				line.setAttribute('x2', '100%');
				line.setAttribute('y2', y);
				line.setAttribute('stroke', 'white');
				line.setAttribute('stroke-width', 2);
				line.style.pointerEvents = 'none';
				this.rendered.lines[i] = line;
				this._g.insertBefore(line, this._g.firstElementChild);
			}
			if (this.rendered.linesEvents[i]) {
				this.rendered.linesEvents[i].setAttribute('x1', '0%');
				this.rendered.linesEvents[i].setAttribute('y1', y);
				this.rendered.linesEvents[i].setAttribute('x2', '100%');
				this.rendered.linesEvents[i].setAttribute('y2', y);
			} else {
				const line = this._root.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'line');
				line.setAttribute('x1', '0%');
				line.setAttribute('y1', y);
				line.setAttribute('x2', '100%');
				line.setAttribute('y2', y);
				line.setAttribute('stroke', 'transparent');
				line.setAttribute('stroke-width', 10);
				line.setAttribute('values', i);
				line.addEventListener('mousedown', this.handleMouseDownLine);
				line.addEventListener('mousemove', this.handleMouseMoveLine);
				this.rendered.linesEvents[i] = line;
				this._g.insertBefore(line, this._g.firstElementChild);
			}
			lines++;
		}
		for (let i = normalizedPoints.length; i < this.rendered.circles.length; i++) {
			const circle = this.rendered.circles[i];
			if (circle) {
				circle.removeEventListener('mousedown', this.handleMouseDownCircle);
				circle.removeEventListener('dblclick', this.handleDoubleClickCircle);
				circle.remove();
				delete this.rendered.circles[i];
			}
			const text = this.rendered.texts[i];
			if (text) {
				text.remove();
				delete this.rendered.texts[i];
			}
		}
		for (let i = lines + 1; i < this.rendered.lines.length; i++) {
			const line = this.rendered.lines[i];
			if (line) {
				line.remove();
				delete this.rendered.lines[i];
			}
			const lineEvent = this.rendered.linesEvents[i];
			if (lineEvent) {
				lineEvent.removeEventListener('mousedown', this.handleMouseDownLine);
				lineEvent.removeEventListener('mousemove', this.handleMouseMoveLine);
				lineEvent.remove();
				delete this.rendered.linesEvents[i];
			}
		}
		if (true) {
			const i = +!points.length;
			const line = this.rendered.lines[i];
			if (line) {
				line.remove();
				delete this.rendered.lines[i];
			}
			const lineEvent = this.rendered.linesEvents[i];
			if (lineEvent) {
				lineEvent.removeEventListener('mousedown', this.handleMouseDownLine);
				lineEvent.removeEventListener('mousemove', this.handleMouseMoveLine);
				lineEvent.remove();
				delete this.rendered.linesEvents[i];
			}
		}
	}

	/**
     * @param {number} x
     * @returns {number}
     */
	getYfromX(x) {
		const { points, defaultValue } = this.state;
		let $point = 0;
		let prev = points[0];
		/** @type {TBPFPoint} */
		let next;
		while ($point < points.length) {
			next = points[$point];
			if (next[0] > x) break;
			prev = next;
			$point++;
		}
		if (prev === next) return prev ? prev[1] : defaultValue;
		const exponent = prev[2] || 0;
		const normalizedX = (x - prev[0]) / (next[0] - prev[0]);
		const normalizedY = normExp(normalizedX, exponent);
		const y = prev[1] + normalizedY * (next[1] - prev[1]);
		return y;
	}

	/**
     * @param {number} x
     * @param {number} [yIn]
     * @returns {{ index: number; point: TBPFPoint }}
     */
	getInsertPoint(x, yIn, e = 0) {
		const { points, defaultValue } = this.state;
		let $point = 0;
		let prev = points[0];
		/** @type {TBPFPoint} */
		let next;
		while ($point < points.length) {
			next = points[$point];
			if (next[0] > x) break;
			prev = next;
			$point++;
		}
		if (typeof yIn === 'number') return { index: $point, point: [x, yIn, e] };
		if (prev === next) return { index: $point, point: [x, prev ? prev[1] : defaultValue, e] };
		const exponent = prev[2] || 0;
		const normalizedX = (x - prev[0]) / (next[0] - prev[0]);
		const normalizedY = normExp(normalizedX, exponent);
		const y = prev[1] + normalizedY * (next[1] - prev[1]);
		return { index: $point, point: [x, y, e] };
	}

	get normalizedPoints() {
		const { domain, range, points } = this.state;
		let [rangeMin, rangeMax] = range;
		if (rangeMin > rangeMax) [rangeMin, rangeMax] = [rangeMax, rangeMin];
		const rangeInterval = rangeMax - rangeMin;
		return points.map((point) => [point[0] / domain, rangeInterval ? (point[1] - rangeMin) / rangeInterval : 0.5]);
	}

	get normalizedDefault() {
		const { range, defaultValue } = this.state;
		let [rangeMin, rangeMax] = range;
		if (rangeMin > rangeMax) [rangeMin, rangeMax] = [rangeMax, rangeMin];
		const rangeInterval = rangeMax - rangeMin;
		return rangeInterval ? (defaultValue - rangeMin) / rangeInterval : 0.5;
	}

	/**
     * @param {number} x
     * @param {number} y
     */
	normalizePoint(x, y) {
		const { domain, range } = this.state;
		let [rangeMin, rangeMax] = range;
		if (rangeMin > rangeMax) [rangeMin, rangeMax] = [rangeMax, rangeMin];
		const rangeInterval = rangeMax - rangeMin;
		return [x / domain, rangeInterval ? (y - rangeMin) / rangeInterval : 0.5];
	}

	/**
     * @param {number} x
     * @param {number} y
     */
	denormalizePoint(x, y) {
		const { domain, range } = this.state;
		let [rangeMin, rangeMax] = range;
		if (rangeMin > rangeMax) [rangeMin, rangeMax] = [rangeMax, rangeMin];
		const rangeInterval = rangeMax - rangeMin;
		return [x * domain, y * rangeInterval + rangeMin];
	}
}

try {
	customElements.define('webaudiomodules-host-bpf', BPF);
	console.log('Element defined');
} catch (error) {
	console.log(error);
	console.log('Element already defined');
}
