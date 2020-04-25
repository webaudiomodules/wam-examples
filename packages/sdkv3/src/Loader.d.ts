import type WebAudioPlugin, { PluginDescriptor, CreateOptions } from "./WebAudioPlugin";

export interface LoadPluginOptions {
    noGui: boolean;
}

declare class Loader {
    static async getDescriptorFromUrl(url: string): Promise<PluginDescriptor>
    static async loadPluginFromDescriptor(descriptor: PluginDescriptor, optionsIn: Partial<LoadPluginOptions>): Promise<typeof WebAudioPlugin>;
    static async loadPluginFromUrl(url: string): Promise<typeof WebAudioPlugin>;
}
export default Loader;
