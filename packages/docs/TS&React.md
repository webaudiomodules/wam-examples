# Use TypeScript / React to write WebAudio Modules

This document will guide developers to develop WebAudio Modules using TypeScript and/or React.

The WebAudio Module SDK provides TypeScript definition files along with JavaScript files. When the SDK is being imported, these definitions will also be imported automatically.

The main `WebAudioModule` interface, implemented by the SDK, has generics that pre-define some properties of the module. When extending the class or implementing the interface, please use following syntax:

```TypeScript
class MyWAM extends WebAudioModule<MyAudioNode, MyParams, MyInternalParams> {
}

class MyWAM2 implements WebAudioModule<MyAudioNode, MyParams, MyInternalParams> {
}
```

1. `Node extends AudioNode = AudioNode`

    A `WebAudioModule` instance will provide an `AudioNode` with the `audioNode` getter after initialization for the host to connect with other `AudioNode`s. The node is defined by the return value of `createAudioNode()` methods.

    In other words, the class with this generic as `MyAudioNode` infers

```TypeScript
declare class MyAudioNode extends GainNode {} // For example
declare class MyWAM extends WebAudioModule<MyAudioNode> {
    get audioNode(): MyAudioNode;
    createAudioNode(): Promise<MyAudioNode>;
}
```

2. `Params extends string = string`

    The Params generics indicates possible names of exposed parameters. These parameters will be acccessible and changed from the host, then affect the internal parameters of the `WebAudioModule`

```TypeScript
type MyParams = "gain" | "mix" | "feedback"; // For example
declare class MyWAM extends WebAudioModule<AudioNode, MyParams> {
    get paramsConfig(): ParametersDescriptor<MyParams>;
    get paramsMapping(): ParametersMapping<MyParams, string>;
    get params(): Record<MyParams, number>;
    getParams(): Record<MyParams, number>;
    setParams(params: Partial<Record<MyParams, number>>): this;
    getParam(paramName: MyParams): number;
    setParam(paramName: MyParams, paramValue: number): this;
    paramMgr: ParamMgrNode<MyParams, string>;
}
```

3. `InternalParams extends string = string`

    The Params generics indicates possible names of exposed parameters. These parameters will be acccessible and changed from the host, then affect the internal parameters of the `WebAudioModule`

```TypeScript
type MyParams = never; // For example
type MyInternalParams = "dry" | "wet"; // For example
declare class MyWAM extends WebAudioModule<AudioNode, MyParams, MyInternalParams> {
    get internalParamsConfig(): InternalParametersDescriptor<MyInternalParams>;
    get paramsMapping(): ParametersMapping<MyParams, MyInternalParams>;
    paramMgr: ParamMgrNode<MyParams, MyInternalParams>;
}
```

It is quite straightforward to use React Component as the GUI of a `WebAudioModule`. The developer just need to mount the component in the `createElement()` function exported in the JavaScript file dedicated for GUI. The WAM instance can be passed as a property to the React Component.

As an example:

```JavaScript React
export const createElement = (wamInstance) => {
    const div = document.createElement("div");
    ReactDOM.render(<ModuleGUI wamInstance={wamInstance} />, div);
    return div;
};
```