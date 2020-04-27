import WebAudioPlugin, { PluginDescriptor } from "./WebAudioPlugin";

export interface LoadPluginOptions {
    noGui: boolean;
}

export const getDescriptorFromUrl: (url: string) => Promise<PluginDescriptor>;
export const loadPluginFromDescriptor: (descriptor: PluginDescriptor, optionsIn: Partial<LoadPluginOptions>) => Promise<typeof WebAudioPlugin>;
export const loadPluginFromUrl: (url: string) => Promise<typeof WebAudioPlugin>;
