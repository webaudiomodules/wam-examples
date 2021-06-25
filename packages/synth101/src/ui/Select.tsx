import { Component, h } from 'preact';

export interface SelectProps {
    label?: string
    onChange?(v: string): void
    value: string | number | boolean
    options: string[]
    values?: string[] | number[] | boolean[]
    style?: string
}

export class Select<T> extends Component<SelectProps, any> {
    lastRenderedValue: string;

    constructor() {
        super();

        this.lastRenderedValue = "-1"
    }

    onChange(e: InputEvent & { target: HTMLInputElement }) {
        if (this.props.onChange) {
            this.props.onChange(e.target!.value)
        }
    }

    setup(ref: HTMLDivElement | null) {
        if (ref == null) {
            return
        }

        if (this.lastRenderedValue == this.props.value) {
            return
        }
        ref.innerHTML = ""

        if (this.props.value === undefined || this.props.value === null) {
            throw `Select with label ${this.props.label} values ${this.props.values} has null value`
        }
        this.lastRenderedValue = this.props.value.toString()

        let select = document.createElement("select");

        this.props.options.forEach((name, index) => {
            let option = document.createElement("option");
            option.text = name
            option.value = (this.props.values) ? this.props.values[index].toString() : index.toString()
            option.selected = (option.value == this.props.value)
            select.appendChild(option)
        })

        select.addEventListener("change", e => this.onChange(e as InputEvent & { target: HTMLInputElement }))

        ref.appendChild(select)
    }

    render() {
        h("div", {})

        let style = this.props.style ? this.props.style : ""

        return <div class="component-wrapper" style={style}>
            <div ref={(e) => this.setup(e)} class="component-select text-black">
            </div>
            {this.props.label && <label>{this.props.label}</label>}
        </div>
    }
}