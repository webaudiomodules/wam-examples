import { MidiJSON } from "@tonejs/midi";
import { AudioWorkletGlobalScope, TypedAudioParamDescriptor, TypedMessageEvent } from "@webaudiomodules/sdk-parammgr";

type Parameters = "playing" | "loop";
type MsgIn = { type: "midiJson"; data: MidiJSON } | { type: "goto"; data: number };
const getMidiSequencerProcessor = (processorId: string) => {
    const audioWorkletGlobalScope = globalThis as unknown as AudioWorkletGlobalScope;
    const { registerProcessor, sampleRate, AudioWorkletProcessor } = audioWorkletGlobalScope;
    class MidiSequencerProcessor extends AudioWorkletProcessor<MsgIn, any, "playing"> {
        static get parameterDescriptors(): TypedAudioParamDescriptor<Parameters>[] {
            return [{
                name: "playing",
                minValue: 0,
                maxValue: 1,
                defaultValue: 0
            }, {
                name: "loop",
                minValue: 0,
                maxValue: 1,
                defaultValue: 0
            }];
        }
        data: MidiJSON = null;
        handleMessage: (e: TypedMessageEvent<MsgIn>) => any;
        constructor(options: AudioWorkletNodeOptions) {
            super(options);
            this.handleMessage = (e: TypedMessageEvent<MsgIn>) => {
                if (e.data.type === "midiJson") {
                    this.setData(e.data.data);
                }
            };
        }
        setData(data: MidiJSON) {
            this.data = data;
        }
        onMidi() {}
        sendFlush() {
            
        }
    }
    try {
        registerProcessor(processorId, MidiSequencerProcessor)
    } catch (error) {
        console.warn(error);
    }
};

export default getMidiSequencerProcessor;
