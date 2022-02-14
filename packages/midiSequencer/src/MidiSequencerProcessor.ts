import type { WamParameterInfoMap } from "@webaudiomodules/api";
import type { WamSDKBaseModuleScope } from "@webaudiomodules/sdk";
import type { AudioWorkletGlobalScope, TypedMessageEvent } from "@webaudiomodules/sdk-parammgr";
import type { MidiChannelEvent, MidiData } from "./MidiParser";

export type Parameters = "playing" | "loop";
export type MsgIn = { type: "midiJson"; data: MidiData } | { type: "goto"; data: number };
export type MsgOut = { type: "timeOffset"; data: number };
const getMidiSequencerProcessor = (moduleId?: string) => {
    const audioWorkletGlobalScope = globalThis as unknown as AudioWorkletGlobalScope;
    const { registerProcessor, sampleRate } = audioWorkletGlobalScope;

	const ModuleScope: WamSDKBaseModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);
	const {
		WamProcessor,
		WamParameterInfo,
	} = ModuleScope;

    class MidiSequencerProcessor extends WamProcessor {
        _generateWamParameterInfo(): WamParameterInfoMap {
            return {
                playing: new WamParameterInfo("playing", {
					type: "boolean",
					label: "Playing",
                    minValue: 0,
                    maxValue: 1,
                    defaultValue: 0
                }),
                loop: new WamParameterInfo("loop", {
					type: "boolean",
					label: "Loop",
                    minValue: 0,
                    maxValue: 1,
                    defaultValue: 0
                })
            };
        }
        playing = false;
        loop = false;
        data: MidiData = null;
        orderedEvents: { data: Uint8Array; time: number }[] = [];
        $event = 0;
        timeOffset = 0;
        totalDuration = 0;
        handleMessage: (e: TypedMessageEvent<MsgIn>) => any;
        constructor(options: AudioWorkletNodeOptions) {
            super(options);
            this.handleMessage = (e) => {
                if (e.data.type === "midiJson") {
                    this.setData(e.data.data);
                } else if (e.data.type === "goto") {
                    this.goto(e.data.data);
                }
            };
            this.port.addEventListener("message", this.handleMessage);
        }
        setData(data: MidiData) {
            this.sendFlush();
            this.data = data;
            this.orderedEvents = [];
            this.$event = 0;
            this.timeOffset = 0;
            this.totalDuration = data.duration;
            data.tracks.forEach((track) => {
                track.forEach((event: MidiChannelEvent<any>) => {
                    if (event.bytes) {
                        this.orderedEvents.push({ time: event.time, data: event.bytes });
                    }
                })
            });
            this.orderedEvents.sort((a, b) => a.time - b.time);
        }
        goto(time: number) {
            this.sendFlush();
            let $ = 0;
            this.timeOffset = Math.min(time, this.totalDuration);
            for (let i = 0; i < this.orderedEvents.length; i++) {
                const event = this.orderedEvents[i];
                if (event.time < this.timeOffset) $ = i;
                else break;
            }
            this.$event = $;
        }
        onMidi(data: Uint8Array | number[], time: number) {
            this.emitEvents({ type: "wam-midi", data: { bytes: [...data] as [number, number, number] }, time })
        }
        sendFlush() {
            const { currentTime } = audioWorkletGlobalScope;
            this.onMidi([176, 121, 0], currentTime); // All Controllers Reset
            this.onMidi([176, 123, 0], currentTime); // All Notes Off
        }
        advance(offset: number, playing: boolean, loop: boolean, fromTime: number) {
            if (!playing) return;
            if (this.timeOffset >= this.totalDuration) {
                if (loop) {
                    this.timeOffset = 0;
                    this.$event = 0;
                } else return;
            }
            if (!this.orderedEvents.length) return;
            let advanced = 0;
            while (advanced < offset) {
                let $ = this.$event + 1;
                let nextEventDeltaTime = 0;
                let nextEvent = null;
                const timeOffset = this.timeOffset + advanced;
                if ($ >= this.orderedEvents.length) {
                    nextEventDeltaTime += this.totalDuration - timeOffset;
                    if (loop) {
                        $ = 0;
                        nextEvent = this.orderedEvents[$];
                        const { time } = nextEvent;
                        this.timeOffset -= this.totalDuration;
                        nextEventDeltaTime += time;
                    }
                } else {
                    nextEvent = this.orderedEvents[$];
                    const { time } = nextEvent;
                    nextEventDeltaTime += time - timeOffset;
                }
                if (advanced + nextEventDeltaTime < offset) {
                    if (nextEvent) {
                        const { data } = nextEvent;
                        this.onMidi(data, fromTime + advanced);
                    } else break;
                    this.$event = $;
                }
                advanced += nextEventDeltaTime;
            }
            this.timeOffset += offset;
            if (loop) {
                this.timeOffset %= this.totalDuration;
            } else if (this.timeOffset > this.totalDuration) {
                this.timeOffset = this.totalDuration;
            }
        }
        updateTime() {
            this.port.postMessage({ type: "timeOffset", data: this.timeOffset });
        }
		_process(startSample: number, endSample: number, inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>) {
            const advanceTime = (endSample - startSample) / sampleRate;
            const { currentTime } = audioWorkletGlobalScope;
            const fromTime = currentTime + startSample / sampleRate;
            const playing = !!this._parameterInterpolators.playing.values[startSample];
            if (playing !== this.playing && !playing) this.onMidi([176, 123, 0], currentTime); // All Notes Off
            this.playing = playing;
            this.loop = !!this._parameterInterpolators.loop.values[startSample];
            this.advance(advanceTime, this.playing, this.loop, fromTime);
            this.updateTime();
            return true;
        }
    }
    try {
        registerProcessor(moduleId, MidiSequencerProcessor)
    } catch (error) {
        console.warn(error);
    }
    return MidiSequencerProcessor;
};

export default getMidiSequencerProcessor;
