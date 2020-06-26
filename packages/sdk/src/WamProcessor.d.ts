import { WamParameterSet } from "./WamParameter";

export default class WamProcessor {
    constructor(options: AudioWorkletNodeOptions);

    processorId: string;
    instanceId: string;
    _params: WamParameterSet;
    _destroyed: boolean;
    
    onAutomation(paramName: string, paramValue: number, time: number): void;
    onMidi(status: number, data1: number, data2: number, time: number): void;
    
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: {
        [x: string]: Float32Array;
    }): boolean;
    
    destroy(): void;
}
