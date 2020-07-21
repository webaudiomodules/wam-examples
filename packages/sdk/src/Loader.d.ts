/* eslint-disable max-len */
import { WebAudioModule, WamDescriptor } from './api/types';

export interface LoadPluginOptions {
    noGui?: boolean;
}
export const getDescriptorFromUrl: (url: string) => Promise<WamDescriptor>;
export const loadModuleFromDescriptor: (descriptor: WamDescriptor, options?: LoadPluginOptions) => Promise<typeof WebAudioModule>;
export const loadModuleFromUrl: (url: string) => Promise<typeof WebAudioModule>;
