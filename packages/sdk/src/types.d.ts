type TParameterType = "boolean" | "float" | "int";
interface ParameterDescriptor {
    /**
     * `"float"` by default
     *
     * @type {TParameterType}
     * @memberof ParameterDescriptor
     */
    type?: TParameterType;
    /**
     * `0` by default
     *
     * @type {number}
     * @memberof ParameterDescriptor
     */
    defaultValue?: number;
    /**
     * `0` by default
     *
     * @type {number}
     * @memberof ParameterDescriptor
     */
    minValue?: number;
    /**
     * `1` by default
     *
     * @type {number}
     * @memberof ParameterDescriptor
     */
    maxValue?: number;
    /**
     * `0` by default (linear)
     *
     * @type {number}
     * @memberof ParameterDescriptor
     */
    exponent?: number;
}
type ParametersDescriptor<Params extends string = string> = Record<Params, ParameterDescriptor>;
interface InternalParameterDescriptor {
    /**
     * `0` by default
     *
     * @type {number}
     * @memberof InternalParameterDescriptor
     */
    minValue?: number;
    /**
     * `1` by default
     *
     * @type {number}
     * @memberof InternalParameterDescriptor
     */
    maxValue?: number;
    /**
     * `30` (1/30s for each change check) by default
     *
     * @type {number}
     * @memberof InternalParameterDescriptor
     */
    automationRate?: number;
}
type InternalParametersDescriptor<InternalParams extends string = string> = Record<InternalParams, AudioParam | InternalParameterDescriptor>;
interface ParameterMappingTarget {
    /**
     * Source param's `[minValue, maxValue]` by default
     *
     * @type {[number, number]}
     * @memberof ParameterMappingTarget
     */
    sourceRange?: [number, number];
    /**
     * Source param's `[minValue, maxValue]` by default
     *
     * @type {[number, number]}
     * @memberof ParameterMappingTarget
     */
    targetRange?: [number, number];
}
type ParametersMapping<Params extends string = string, InternalParams extends string = string> = Record<Params, Record<InternalParams, ParameterMappingTarget>>;
interface PatchDescriptor<Params extends string = string> {
    label: string;
    params: Partial<Record<Params, number>>;
}
type PatchesDescriptor<Patches extends string = string, Params extends string = string> = Record<Patches, PatchDescriptor<Params>>;
interface BankDescriptor<Patches extends string = string> {
    label: string;
    patches: Patches[];
}
type BanksDescriptor<Banks extends string = string, Patches extends string = string> = Record<Banks, BankDescriptor<Patches>>;
interface PluginDescriptor<Params extends string = string, Patches extends string = string, Banks extends string = string> {
    name: string;
    author: string;
    vendor: string;
    version: string;
    entry: string;
    gui: string | "none";
    url: string;
    params?: ParametersDescriptor<Params>;
    patches?: PatchesDescriptor<Patches, Params>;
    banks?: BanksDescriptor<Banks, Patches>;
    [key: string]: any;
}
interface DefaultState<Params extends string = string, Patches extends string = string, Banks extends string = string> {
    enabled: boolean;
    params: Partial<Record<Params, number>>;
    patch: Patches;
    bank: Banks;
}
interface DefaultEventMap<Params extends string = string, Patches extends string = string, Banks extends string = string> {
    "change:enabled": [boolean, boolean];
    "change:params": [Partial<Record<Params, number>>, Partial<Record<Params, number>>, Partial<Record<Params, number>>];
    "change:patch": [Patches, Patches];
    "change:bank": [Banks, Banks];
    "destroy": [];
    "change:paramsMapping": [ParametersMapping, ParametersMapping]
    string: [number, number];
}
