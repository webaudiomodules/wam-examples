import type WebAudioPlugin, { PluginDescriptor, CreateOptions } from "./WebAudioPlugin";

export interface LoadPluginOptions {
    noGui: boolean;
}
export interface LoadPluginResponse {
    PluginClass: typeof WebAudioPlugin;
    createInstance: (audioContext: BaseAudioContext, options: CreateOptions) => Promise<WebAudioPlugin>;
}

declare class Loader {
    static async getDescriptorFromUrl(url: string): Promise<PluginDescriptor>
    static async loadPluginFromDescriptor(descriptor: PluginDescriptor, optionsIn: Partial<LoadPluginOptions>): Promise<LoadPluginResponse>;
    static async loadPluginFromUrl(url: string): Promise<LoadPluginResponse>;
}
export default Loader;
