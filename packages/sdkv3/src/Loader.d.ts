import WebAudioPlugin, { PluginDescriptor } from "./WebAudioPlugin";

export interface LoadPluginOptions {
    noGui: boolean;
}

declare class Loader {
    static getDescriptorFromUrl(url: string): Promise<PluginDescriptor>
    static loadPluginFromDescriptor(descriptor: PluginDescriptor, optionsIn: Partial<LoadPluginOptions>): Promise<typeof WebAudioPlugin>;
    static loadPluginFromUrl(url: string): Promise<typeof WebAudioPlugin>;
}
export default Loader;
