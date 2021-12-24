import type { MidiJSON } from "@tonejs/midi";
import type { WamParameterInfoMap } from "@webaudiomodules/api";
import type { WamSDKBaseModuleScope } from "@webaudiomodules/sdk";
import type { AudioWorkletGlobalScope, TypedMessageEvent } from "@webaudiomodules/sdk-parammgr";

export type Parameters = "playing" | "loop";
export type MsgIn = { type: "midiJson"; data: MidiJSON & { duration: number } } | { type: "goto"; data: number };
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
        data: MidiJSON = null;
        orderedEvents: { data: [number, number, number]; time: number }[] = [];
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
        setData(data: MidiJSON & { duration: number }) {
            this.sendFlush();
            this.data = data;
            this.orderedEvents = [];
            this.$event = 0;
            this.timeOffset = 0;
            this.totalDuration = data.duration;
            data.tracks.forEach((track) => {
                const { channel, controlChanges, notes, pitchBends } = track;
                for (let i = 0; i < 128; i++) {
                    controlChanges[i]?.forEach((cc) => {
                        const { number, value, time } = cc;
                        this.orderedEvents.push({ time, data: [176 + channel, number, ~~(value * 127)] });
                    })
                }
                notes.forEach((note) => {
                    const { duration, time, midi, velocity } = note;
                    this.orderedEvents.push({ time, data: [144 + channel, midi, ~~(velocity * 127)] });
                    this.orderedEvents.push({ time: time + duration, data: [144 + channel, midi, 0] });
                });
                pitchBends.forEach((pitchBend) => {
                    const { time, value } = pitchBend;
                    const intValue = Math.round(value * Math.pow(2, 13));
                    this.orderedEvents.push({ time, data: [224 + channel, intValue & 127, (intValue >> 7) & 127] });
                });
            })
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
        onMidi(data: [number, number, number], time: number) {
            this.emitEvents({ type: "wam-midi", data: { bytes: data }, time })
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
            if (playing !== this.playing) this.sendFlush();
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
