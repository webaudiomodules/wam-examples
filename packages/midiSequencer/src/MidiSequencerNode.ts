import { WamNode, addFunctionModule, WebAudioModule } from "@webaudiomodules/sdk";
import { TypedAudioWorkletNode, TypedAudioWorkletNodeOptions } from "@webaudiomodules/sdk-parammgr";
import parseMidi from "./MidiParser";
import getMidiSequencerProcessor, { MsgIn as MsgOut, MsgOut as MsgIn, Parameters } from "./MidiSequencerProcessor";

class MidiSequencerNode extends WamNode implements TypedAudioWorkletNode<MsgIn, MsgOut> {
    static async addModules(context: BaseAudioContext, moduleId: string) {
		const { audioWorklet } = context;
		await super.addModules(context, moduleId);
		await addFunctionModule(audioWorklet, getMidiSequencerProcessor, moduleId);
	}
    timeOffset: number;
    totalDuration: number;
    handleMessage: (e: MessageEvent<MsgIn>) => void;
    constructor(module: WebAudioModule<MidiSequencerNode>, options: TypedAudioWorkletNodeOptions) {
		options.processorOptions = {
            ...options.processorOptions,
			numberOfInputs: 0,
			numberOfOutputs: 1,
		};
        super(module, options);
        this.timeOffset = 0;
        this.totalDuration = 0;
        this.handleMessage = (e) => {
            if (e.data.type === "timeOffset") {
                this.timeOffset = e.data.data;
            }
        };
		this.port.addEventListener("message", this.handleMessage);
    }
    loadFile(file: ArrayBuffer) {
        const data = parseMidi(file);
        this.totalDuration = data.duration;
        this.port.postMessage({ type: "midiJson", data });
    }
    goto(time: number) {
        this.port.postMessage({ type: "goto", data: time });
    }
	destroy() {
		this.port.removeEventListener("message", this.handleMessage);
		super.destroy();
	}
}

export default MidiSequencerNode;
