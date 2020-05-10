import WebAudioPlugin from './WebAudioPlugin';

/**
 * @type {WebAudioPlugin<AudioNode, "a">}
 */
const p = new WebAudioPlugin();
const param = p.paramsConfig.a;
if (param.type === 'enum') param.values
