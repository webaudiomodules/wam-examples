export type WamParameterType = "boolean" | "float" | "int" | "choice";

export type WamParameterConfiguration = {
    type?: WamParameterType;
    defaultValue?: number;
    minValue?: number;
    maxValue?: number;
    discreteStep?: number;
    exponent?: number;
    choices?: string[];
    units?: string;
}

export class WamParameter {
    constructor(name: string, config?: WamParameterConfiguration);
    _name: string;
    _type: WamParameterType;
    _value: number;
    _defaultValue: number;
    _minValue: number;
    _maxValue: number;
    _discreteStep: number;
    _exponent: number;
    _choices: string[];
    _units: string;

    set value(arg: number);
    get value(): number;
    get name(): string;
    get type(): WamParameterType;
    get defaultValue(): number;
    get minValue(): number;
    get maxValue(): number;
    get discreteStep(): number;
    get exponent(): number;
    get choices(): string[];
    get units(): string;
    set normalizedValue(arg: number);
    get normalizedValue(): number;
    normalize(value: number): number;
    denormalize(value: number): number;
    valueString(value: number): string;
}

export type WamParameterSet = { [x: string]: WamParameter }
