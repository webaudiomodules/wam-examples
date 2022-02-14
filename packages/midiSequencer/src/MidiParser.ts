// https://github.com/carter-thaxton/midi-file/blob/master/lib/midi-parser.js

// data can be any array-like object.  It just needs to support .length, .slice, and an element getter []

export type MidiHeader = {
    format: 0 | 1 | 2;
    numTracks: number;
    timeDivision: number;
} & ({
    framesPerSecond?: undefined;
    ticksPerFrame?: undefined;
    ticksPerBeat: number;
} | {
    framesPerSecond: number;
    ticksPerFrame: number;
    ticksPerBeat?: undefined;
});

export interface MidiData {
    header: MidiHeader;
    tracks: MidiEvent[][];
    duration: number;
}

type MidiMetaEventType = "sequenceNumber" | "text" | "copyrightNotice" | "trackName" | "instrumentName" | "lyrics" | "marker" | "cuePoint" | "channelPrefix" | "portPrefix" | "endOfTrack" | "setTempo" | "smpteOffset" | "timeSignature" | "keySignature" | "sequencerSpecific" | "unknownMeta";
type MidiSysExEventType = "sysEx" | "endSysEx";
type MidiChannelEventType = "noteOn" | "noteOff" | "noteAftertouch" | "controller" | "programChange" | "channelAftertouch" | "pitchBend";
type MidiEventType = MidiMetaEventType | MidiSysExEventType | MidiChannelEventType;

export interface MidiBaseEvent<T extends MidiEventType> {
    deltaTicks: number;
    ticks: number;
    time: number;
    type: T;
}
export interface MidiMetaEvent<T extends MidiMetaEventType> extends MidiBaseEvent<T> {
    meta: true;
}
export interface MidiChannelEvent<T extends MidiChannelEventType> extends MidiBaseEvent<T> {
    running?: true;
    channel: number;
    time: number;
    bytes: Uint8Array;
}
export interface MidiSequenceNumberEvent extends MidiMetaEvent<"sequenceNumber"> {
    type: "sequenceNumber";
    number: number;
}
export interface MidiTextEvent extends MidiMetaEvent<"text"> {
    text: string;
}
export interface MidiCopyrightNoticeEvent extends MidiMetaEvent<"copyrightNotice"> {
    text: string;
}
export interface MidiTrackNameEvent extends MidiMetaEvent<"trackName"> {
    text: string;
}
export interface MidiInstrumentNameEvent extends MidiMetaEvent<"instrumentName"> {
    text: string;
}
export interface MidiLyricsEvent extends MidiMetaEvent<"lyrics"> {
    text: string;
}
export interface MidiMarkerEvent extends MidiMetaEvent<"marker"> {
    text: string;
}
export interface MidiCuePointEvent extends MidiMetaEvent<"cuePoint"> {
    text: string;
}
export interface MidiChannelPrefixEvent extends MidiMetaEvent<"channelPrefix"> {
    channel: number;
}
export interface MidiPortPrefixEvent extends MidiMetaEvent<"portPrefix"> {
    port: number;
}
export interface MidiEndOfTrackEvent extends MidiMetaEvent<"endOfTrack"> {
}
export interface MidiSetTempoEvent extends MidiMetaEvent<"setTempo"> {
    microsecondsPerBeat: number;
}
export interface MidiSmpteOffsetEvent extends MidiMetaEvent<"smpteOffset"> {
    frameRate: number;
    hour: number;
    min: number;
    sec: number;
    frame: number;
    subFrame: number;
}
export interface MidiTimeSignatureEvent extends MidiMetaEvent<"timeSignature"> {
    numerator: number;
    denominator: number;
    metronome: number;
    thirtyseconds: number;
}
export interface MidiKeySignatureEvent extends MidiMetaEvent<"keySignature"> {
    key: number;
    scale: number;
}
export interface MidiSequencerSpecificEvent extends MidiMetaEvent<"sequencerSpecific"> {
    data: number;
}
export interface MidiUnknownMetaEvent extends MidiMetaEvent<"unknownMeta"> {
    data: number;
    metatypeByte: number;
}
export interface MidiSysExEvent extends MidiBaseEvent<"sysEx"> {
    bytes: Uint8Array;
}
export interface MidiEndSysExEvent extends MidiBaseEvent<"endSysEx"> {
    bytes: Uint8Array;
}
export interface MidiNoteOffEvent extends MidiChannelEvent<"noteOff"> {
    velocity: number;
    byte9?: boolean;
}
export interface MidiNoteOnEvent extends MidiChannelEvent<"noteOn"> {
    velocity: number;
}
export interface MidiNoteAftertouchEvent extends MidiChannelEvent<"noteAftertouch"> {
    noteNumber: number;
    amount: number;
}
export interface MidiControllerEvent extends MidiChannelEvent<"controller"> {
    controllerType: number;
    value: number;
}
export interface MidiProgramChangeEvent extends MidiChannelEvent<"programChange"> {
    programNumber: number;
}
export interface MidiChannelAftertouchEvent extends MidiChannelEvent<"channelAftertouch"> {
    amount: number;
}
export interface MidiPitchBendEvent extends MidiChannelEvent<"pitchBend"> {
    value: number;
}

export type MidiEvent =
    | MidiSequenceNumberEvent
    | MidiTextEvent
    | MidiCopyrightNoticeEvent
    | MidiTrackNameEvent
    | MidiInstrumentNameEvent
    | MidiLyricsEvent
    | MidiMarkerEvent
    | MidiCuePointEvent
    | MidiChannelPrefixEvent
    | MidiPortPrefixEvent
    | MidiEndOfTrackEvent
    | MidiSetTempoEvent
    | MidiSmpteOffsetEvent
    | MidiTimeSignatureEvent
    | MidiKeySignatureEvent
    | MidiSequencerSpecificEvent
    | MidiUnknownMetaEvent
    | MidiSysExEvent
    | MidiEndSysExEvent
    | MidiControllerEvent
    | MidiProgramChangeEvent
    | MidiChannelAftertouchEvent
    | MidiPitchBendEvent
    | MidiNoteAftertouchEvent
    | MidiNoteOnEvent
    | MidiNoteOffEvent;

class Parser {
    bufferLen: number;
    buffer: DataView;
    pos: number;
    constructor(data: ArrayBuffer) {
        this.buffer = new DataView(data);
        this.bufferLen = this.buffer.byteLength;
        this.pos = 0;
    }
    eof() {
        return this.pos >= this.bufferLen;
    }
    readUInt8() {
        const result = this.buffer.getUint8(this.pos);
        this.pos += 1;
        return result;
    }
    readInt8() {
        const result = this.buffer.getInt8(this.pos);
        this.pos += 1;
        return result;
    }
    readUInt16() {
        const result = this.buffer.getUint16(this.pos);
        this.pos += 2;
        return result;
    }
    readInt16() {
        const result = this.buffer.getInt16(this.pos);
        this.pos += 2;
        return result;
    }
    readUInt24() {
        const b0 = this.readUInt8();
        const b1 = this.readUInt8();
        const b2 = this.readUInt8();
    
        return (b0 << 16) + (b1 << 8) + b2;
    }
    readInt24() {
        const u = this.readUInt24()
        if (u & 0x800000) return u - 0x1000000;
        else return u;
    }
    readUInt32() {
        const result = this.buffer.getUint32(this.pos);
        this.pos += 4;
        return result;
    }
    readInt32() {
        const result = this.buffer.getInt32(this.pos);
        this.pos += 4;
        return result;
    }
    readBytes(len: number) {
        const bytes = this.buffer.buffer.slice(this.pos, this.pos + len);
        this.pos += len;
        return bytes;
    }
    readString(len: number) {
        const bytes = this.readBytes(len);
        return String.fromCharCode.apply(null, new Uint8Array(bytes));
    }
    readVarInt() {
        let result = 0;
        while (!this.eof()) {
            const b = this.readUInt8();
            if (b & 0x80) {
                result += (b & 0x7f);
                result <<= 7;
            } else {
                // b is last byte
                return result + b;
            }
        }
        // premature eof
        return result;
    }
    readChunk() {
        const id = this.readString(4);
        const length = this.readUInt32();
        const data = this.readBytes(length);
        return { id, length, data };
    }
}

const parseMidi = (data: ArrayBuffer): MidiData => {
    const p = new Parser(data);

    const headerChunk = p.readChunk();
    if (headerChunk.id != "MThd")
        throw new Error(`Bad MIDI file.  Expected "MHdr", got: "${headerChunk.id}"`);
    const header = parseHeader(headerChunk.data);

    const tracks = [];
    let duration = 0;
    for (let i = 0; !p.eof() && i < header.numTracks; i++) {
        const trackChunk = p.readChunk();
        if (trackChunk.id != "MTrk")
            throw new Error(`Bad MIDI file.  Expected "MTrk", got: "${trackChunk.id}"`);
        const track = parseTrack(trackChunk.data, header.ticksPerBeat);
        tracks.push(track);
        const lastEvent = track[track.length - 1] as MidiChannelEvent<any>;
        if ("time" in lastEvent && lastEvent.time > duration) duration = lastEvent.time;
    }
    return { header, tracks, duration };
}

const parseHeader = (data: ArrayBuffer): MidiHeader => {
    const p = new Parser(data);

    const format = p.readUInt16() as 0 | 1 | 2;
    const numTracks = p.readUInt16();

    const timeDivision = p.readUInt16();
    if (timeDivision & 0x8000) {
        const framesPerSecond = 0x100 - (timeDivision >> 8);
        const ticksPerFrame = timeDivision & 0xFF;
        return { format, numTracks, timeDivision, framesPerSecond, ticksPerFrame };
    } else {
        const ticksPerBeat = timeDivision;
        return { format, numTracks, timeDivision, ticksPerBeat };
    }
}

const parseTrack = (data: ArrayBuffer, ppq = 480) => {
    const p = new Parser(data);

    let lastEventTypeByte: number = null;

    let ticks = 0;
    let bpm = 120;
    let tempoTicks = 0;
    let tempoTime = 0;

    const readEvent = (): MidiEvent => {
        const deltaTicks = p.readVarInt();
        ticks += deltaTicks;
        const elapsedBeats = (ticks - tempoTicks) / ppq;
        const time = tempoTime + (60 / bpm) * elapsedBeats;

        let eventTypeByte = p.readUInt8();

        const event: any = { ticks, deltaTicks, time };

        if ((eventTypeByte & 0xf0) === 0xf0) {
            // system / meta event
            if (eventTypeByte === 0xff) {
                // meta event
                event.meta = true;
                const metatypeByte = p.readUInt8();
                const length = p.readVarInt();
                if (metatypeByte === 0x00) {
                    event.type = "sequenceNumber";
                    if (length !== 2) throw `Expected length for sequenceNumber event is 2, got ${length}`;
                    event.number = p.readUInt16();
                } else if (metatypeByte === 0x01) {
                    event.type = "text";
                    event.text = p.readString(length);
                } else if (metatypeByte === 0x02) {
                    event.type = "copyrightNotice";
                    event.text = p.readString(length);
                } else if (metatypeByte === 0x03) {
                    event.type = "trackName";
                    event.text = p.readString(length);
                } else if (metatypeByte === 0x04) {
                    event.type = "instrumentName";
                    event.text = p.readString(length);
                } else if (metatypeByte === 0x05) {
                    event.type = "lyrics";
                    event.text = p.readString(length);
                } else if (metatypeByte === 0x06) {
                    event.type = "marker";
                    event.text = p.readString(length);
                } else if (metatypeByte === 0x07) {
                    event.type = "cuePoint";
                    event.text = p.readString(length);
                } else if (metatypeByte === 0x20) {
                    event.type = "channelPrefix";
                    if (length != 1) throw new Error(`Expected length for channelPrefix event is 1, got ${length}`);
                    event.channel = p.readUInt8();
                } else if (metatypeByte === 0x21) {
                    event.type = "portPrefix";
                    if (length != 1) throw new Error(`Expected length for portPrefix event is 1, got ${length}`);
                    event.port = p.readUInt8();
                } else if (metatypeByte === 0x2f) {
                    event.type = "endOfTrack";
                    if (length != 0) throw new Error(`Expected length for endOfTrack event is 0, got ${length}`);
                } else if (metatypeByte === 0x51) {
                    event.type = "setTempo";
                    if (length != 3) throw new Error(`Expected length for setTempo event is 3, got ${length}`);
                    const microsecondsPerBeat = p.readUInt24();
                    event.microsecondsPerBeat = microsecondsPerBeat;
                    bpm = 60000000 / event.microsecondsPerBeat;
                    tempoTicks = ticks;
                    tempoTime = time;
                } else if (metatypeByte === 0x54) {
                    event.type = "smpteOffset";
                    if (length != 5) throw new Error(`Expected length for smpteOffset event is 5, got ${length}`);
                    const hourByte = p.readUInt8();
                    const FRAME_RATES: Record<number, number> = { 0x00: 24, 0x20: 25, 0x40: 29, 0x60: 30 };
                    event.frameRate = FRAME_RATES[hourByte & 0x60];
                    event.hour = hourByte & 0x1f;
                    event.min = p.readUInt8();
                    event.sec = p.readUInt8();
                    event.frame = p.readUInt8();
                    event.subFrame = p.readUInt8();
                } else if (metatypeByte === 0x58) {
                    event.type = "timeSignature";
                    if (length != 4) throw new Error(`Expected length for timeSignature event is 4, got ${length}`);
                    event.numerator = p.readUInt8();
                    event.denominator = (1 << p.readUInt8());
                    event.metronome = p.readUInt8();
                    event.thirtyseconds = p.readUInt8();
                } else if (metatypeByte === 0x59) {
                    event.type = "keySignature";
                    if (length != 2) throw new Error(`Expected length for keySignature event is 2, got ${length}`);
                    event.key = p.readInt8();
                    event.scale = p.readUInt8();
                } else if (metatypeByte === 0x7f) {
                    event.type = "sequencerSpecific";
                    event.data = p.readBytes(length);
                } else {
                    event.type = "unknownMeta";
                    event.data = p.readBytes(length);
                    event.metatypeByte = metatypeByte;
                }
            } else if (eventTypeByte == 0xf0) {
                event.type = "sysEx";
                const length = p.readVarInt();
                const data = p.readBytes(length);
                event.bytes = new Uint8Array([eventTypeByte, ...new Uint8Array(data)]);
            } else if (eventTypeByte == 0xf7) {
                event.type = "endSysEx";
                const length = p.readVarInt();
                const data = p.readBytes(length);
                event.bytes = new Uint8Array([eventTypeByte, ...new Uint8Array(data)]);
            } else {
                throw new Error(`Unrecognised MIDI event type byte: ${eventTypeByte}`);
            }
        } else {
            // channel event
            let param1: number;
            if ((eventTypeByte & 0x80) === 0) {
                // running status - reuse lastEventTypeByte as the event type.
                // eventTypeByte is actually the first parameter
                if (lastEventTypeByte === null) throw new Error("Running status byte encountered before status byte");
                param1 = eventTypeByte;
                eventTypeByte = lastEventTypeByte;
                event.running = true;
            } else {
                param1 = p.readUInt8();
                lastEventTypeByte = eventTypeByte;
            }
            const eventType = eventTypeByte >> 4;
            event.channel = eventTypeByte & 0x0f;
            if (eventType === 0x08) {
                event.type = "noteOff";
                event.noteNumber = param1;
                const param2 = p.readUInt8();
                event.velocity = param2;
                event.bytes = new Uint8Array([eventTypeByte, param1, param2]);
            } else if (eventType === 0x09) {
                const velocity = p.readUInt8();
                event.type = velocity === 0 ? "noteOff" : "noteOn";
                event.noteNumber = param1;
                event.velocity = velocity;
                if (velocity === 0) event.byte9 = true;
                event.bytes = new Uint8Array([eventTypeByte, param1, velocity]);
            } else if (eventType === 0x0a) {
                event.type = "noteAftertouch";
                event.noteNumber = param1;
                const param2 = p.readUInt8();
                event.amount = param2;
                event.bytes = new Uint8Array([eventTypeByte, param1, param2]);
            } else if (eventType === 0x0b) {
                event.type = "controller";
                event.controllerType = param1;
                const param2 = p.readUInt8();
                event.value = param2;
                event.bytes = new Uint8Array([eventTypeByte, param1, param2]);
            } else if (eventType === 0x0c) {
                event.type = "programChange";
                event.programNumber = param1;
                event.bytes = new Uint8Array([eventTypeByte, param1]);
            } else if (eventType === 0x0d) {
                event.type = "channelAftertouch";
                event.amount = param1;
                event.bytes = new Uint8Array([eventTypeByte, param1]);
            } else if (eventType === 0x0e) {
                event.type = "pitchBend";
                const param2 = p.readUInt8();
                event.value = (param1 + (param2 << 7)) - 0x2000;
                event.bytes = new Uint8Array([eventTypeByte, param1, param2]);
            } else {
                throw new Error(`Unrecognised MIDI event type: ${eventType}`);
            }
        }
        return event;
    }
    const events = [];
    while (!p.eof()) {
        const event = readEvent();
        events.push(event);
    }
    return events;
}

export default parseMidi;
