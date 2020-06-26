export type WamDescriptor = {
    name: string;
    vendor: string;
    entry?: string;
    gui: string;
    url?: string;
}

export class WamLoader {
    static isWebAudioPlugin: boolean;
    static createInstance(audioContext: AudioContext, pluginOptions?: any): Promise<WamLoader>;

    static descriptor: WamDescriptor;

    static guiModuleUrl: string;

    constructor(audioContext: AudioContext);
    audioContext: AudioContext;
    instanceId: string;
    _audioNode: AudioNode;
    initialized: boolean;

    get descriptor(): WamDescriptor;
    get name(): string;
    get vendor(): string;
    get pluginId(): string;
    set audioNode(arg: AudioNode);
    get audioNode(): AudioNode;
    /**
     * This async method must be redefined to get audionode that
     * will connected to the host.
     * It can be any object that extends AudioNode
     */
    createAudioNode(options?: {}): Promise<AudioNode>;
    /**
     * Calling initialize([state]) will initialize the plugin with an initial state.
     * While initializing, the audionode is created by calling createAudionode()
     * Plugins that redefine initialize() must call super.initialize();
     */
    initialize(options?: {}): Promise<WamLoader>;
    loadGui(): Promise<any>;
    createGui(options?: {}): Promise<any>;
}
