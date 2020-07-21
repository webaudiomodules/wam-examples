export interface ITemporalAnalyserProcessor {
    getRMS(): number[];
    getAbsMax(): number[];
    getZCR(): number[];
    getBuffer(): { $: number; data: Float32Array[]; $total: number };
    destroy(): void;
}
export interface ITemporalAnalyserNode {}
export type TemporalAnalyserParameters = "windowSize";
