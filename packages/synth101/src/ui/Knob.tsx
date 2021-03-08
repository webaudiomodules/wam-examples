import { Component, h } from 'preact';
import { svg_arc } from './svg'

export type KnobProps = {
    value: number

    label: string
    size: number
    padding: number
    bipolar: boolean
    minimumValue: number
    maximumValue: number
    color: string
    onChange(value: number): void
}

type KnobState = {
    value: number
}

export class Knob extends Component<KnobProps, KnobState> {

    static defaultProps = {
        minimumValue: 0.0,
        maximumValue: 1.0,
        size: 50,
        value: 0.5,
        padding: 3,
        color: 'yellow',
        label: "",
        bipolar: false,
    }

    pressed: boolean;
    ref?: HTMLDivElement;
    position?: { x: number; y: number; };

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
        svg.setAttribute('width', `${this.props.size}`);
        svg.setAttribute('height', `${this.props.size * 4/5}`);

        let center: [number, number] = [this.props.size/2, this.props.size/2]
        let radii: [number, number] = [center[0] - this.props.padding, center[1] - this.props.padding]

        let element = svg_arc (center, radii, [136, 270], 0 )
        element.setAttribute('style', 'stroke:black;')
        svg.appendChild(element)

        var e2;
        if (this.props.bipolar) {
            let midValue = (this.props.maximumValue + this.props.minimumValue) / 2
            let percent = (this.state.value - midValue) / (midValue - this.props.minimumValue);

            e2 = svg_arc (center, radii, [270, 135*percent], 0 )
        } else {
            let percent = (this.state.value - this.props.minimumValue) / (this.props.maximumValue - this.props.minimumValue)
            e2 = svg_arc (center, radii, [135, 270*percent], 0 )
        }

        e2.setAttribute('style', `stroke:${this.props.color};`)
        svg.appendChild(e2)

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
            let distance = (e.screenX - this.position!.x) - (e.screenY - this.position!.y)
            this.position = {x: e.screenX, y: e.screenY}
            this.setValue(this.state.value + (distance * 0.005 * (this.props.maximumValue - this.props.minimumValue)))
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

        return (
        <div class="component-wrapper">
            <div ref={(ref) => this.setup(ref)} class="component-knob flex flex-col items-center"
                onMouseDown={(e) => this.onMousedown(e)}>
            </div>
            <label>{this.props.label}</label>
        </div>
        )
    }
}
