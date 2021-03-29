import { Component, h } from 'preact';
import { svg_line, svg_rectangle } from './svg'

export interface FaderProps {
    value: number
    width: number
    height: number
    minimumValue: number
    maximumValue: number
    capHeight: number
    capWidth: number
    color: string
    label?: string

    onChange(value: number): void
}

type FaderState = {
    value: number
}

export class Fader extends Component<FaderProps, FaderState> {
    pressed: boolean;
    ref?: HTMLDivElement;
    position?: { x: number; y: number; };
    
    static defaultProps = {
        minimumValue: 0.0,
        maximumValue: 1.0,
        width: 30,
        height: 120,
        capWidth: 20,
        capHeight: 8,
        value: 0.5,
        padding: 5,
        color: 'yellow'
    }

    constructor() {
        super();

        this.pressed = false

        this.onMousemove = this.onMousemove.bind(this)
        this.onMouseup = this.onMouseup.bind(this)
        this.state = {
            value: 0.5
        }
    }

    componentWillMount() {
        this.updateStateFromProps()
    }

    componentDidMount() {
    }

    componentWillReceiveProps() {
        this.updateStateFromProps()
    }

    updateStateFromProps() {
        if (!this.pressed) {
            this.setState({
                value: this.props.value
            });
        }
    }

    componentWillUnmount() {
        if (this.pressed) {
            window.removeEventListener('mousemove', this.onMousemove)
            window.removeEventListener('mouseup', this.onMouseup)
        }
    }

    setup(ref: HTMLDivElement | null) {
        if (ref == null) {
            return
        }

        this.ref = ref

        ref.innerHTML = ""

        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('style', "stroke:black; fill:none; stroke-width:2");
        svg.setAttribute('width', `${this.props.width}px`);
        svg.setAttribute('height', `${this.props.height}`);

        let center = this.props.width/2;
        let track = svg_line(center, 0, center, this.props.height, "black");
        let percent = (this.state.value - this.props.minimumValue) / (this.props.maximumValue - this.props.minimumValue)

        let position = (this.props.height - this.props.capHeight) - ((this.props.height - this.props.capHeight) * percent)
        
        let fader = svg_rectangle(center - (this.props.capWidth/2), position, this.props.capWidth, this.props.capHeight, this.props.color)

        svg.appendChild(track)
        svg.appendChild(fader)

        ref.appendChild(svg)
    }

    onMousedown(e: MouseEvent) {
        this.pressed = true
        this.position = {x: e.screenX, y: e.screenY}

        window.addEventListener('mousemove', this.onMousemove)
        window.addEventListener('mouseup', this.onMouseup)
    }

    onMouseup(e: MouseEvent) {
        this.pressed = false
        window.removeEventListener('mousemove', this.onMousemove)
        window.removeEventListener('mouseup', this.onMouseup)
    }

    onMousemove(e: MouseEvent) {
        if (this.pressed) {
            let distance = (e.screenY - this.position!.y)
            this.position = {x: e.screenX, y: e.screenY}

            this.setValue(this.state.value - (distance * 0.01 * (this.props.maximumValue - this.props.minimumValue)))
        }
    }

    setValue(v: number) {
        if (v > this.props.maximumValue) {
            v = this.props.maximumValue
        }
        if (v < this.props.minimumValue) {
            v = this.props.minimumValue
        }

        if (this.props.onChange) {
            this.props.onChange(v)
        }

        this.setState({value: v})
    }

    render() {
        h("div", {})

        return <div class="component-wrapper">
            <div ref={(ref) => this.setup(ref)} class="component-fader flex flex-col items-center"
                onMouseDown={(e) => this.onMousedown(e)}></div>
            <label>{this.props.label ? this.props.label : ""}</label>
        </div>
        
    }
}