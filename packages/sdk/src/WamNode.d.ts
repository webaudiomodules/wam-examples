import { WamLoader } from "./WamLoader";
import { WamParameterSet } from "./WamParameter";

export default class WamNode extends AudioWorkletNode {
    static generateWamParameters(): WamParameterSet;

    constructor(audioContext: AudioContext, processorId: string, instanceId: string, loader: WamLoader, options: AudioWorkletNodeOptions);

    processorId: string;
    instanceId: string;
    loader: WamLoader;
    _params: WamParameterSet;
    _compensationDelay: number;
    _patch: string | undefined;
    _bank: string | undefined;
    _banks: string[];
    _destroyed: boolean;

    onBankChange(cb: any): void;
    onEnabledChange(cb: any): void;
    onParamChange(paramName: any, cb: any): void;
    onPatchChange(cb: any): void;

    getBank(): string;
    setBank(bankName: string, patchName: string): void;

    getPatch(): string;
    setPatch(patchName: string): void;

    getParams(): WamParameterSet;
    setParams(params: WamParameterSet): void;

    getState(): any;
    setState(state: any): void;

    getCompensationDelay(): number;
 
    onAutomation(paramName: string, paramValue: number, time: number): void;
    onMidi(status: number, data1: number, data2: number, time: number): void;

    destroy(): void;
}
