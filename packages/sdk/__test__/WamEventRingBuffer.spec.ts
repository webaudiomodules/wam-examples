/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */

import expect from './jestUtilities';
import { shuffleArray, ensureTextEncoderDecoder } from './testUtilities';
import {
	WamEvent, WamAutomationEvent, WamTransportEvent,
	WamMidiEvent, WamMpeEvent, WamSysexEvent, WamOscEvent, WamInfoEvent
} from '../src/api/types';

import getRingBuffer from '../src/RingBuffer.js';
import getWamEventRingBuffer from '../src/WamEventRingBuffer.js';

const RingBuffer = getRingBuffer();
const WamEventRingBuffer = getWamEventRingBuffer();
ensureTextEncoderDecoder(); // jest / JSDOM doesn't currently have these globals

describe('WamEventRingBuffer Suite', () => {
	const binaryBytesLength = 72;
	const parameterIndices = {
		x: 0,
		y: 1,
		z: 2,
	};

	const inputAutomationEvent: WamAutomationEvent = {
		type: 'wam-automation',
		time: 10 * Math.random(),
		data: {
			id: 'y',
			value: Math.random(),
			normalized: true,
		},
	};

	const inputTransportEvent: WamTransportEvent = {
		type: 'wam-transport',
		time: 10 * Math.random(),
		data: {
			currentBar: Math.round(10 * Math.random()),
			currentBarStarted: 10 * Math.random(),
			tempo: 120,
			timeSigNumerator: 3,
			timeSigDenominator: 4,
		},
	};

	const inputMidiEvent: WamMidiEvent = {
		type: 'wam-midi',
		time: 10 * Math.random(),
		data: {
			bytes: [0x80, 0x80, 0x80],
		},
	};

	const inputMpeEvent: WamMpeEvent = {
		type: 'wam-mpe',
		time: 10 * Math.random(),
		data: {
			bytes: [0x90, 0x90, 0x90],
		},
	};

	const sysexBytes = new Uint8Array(binaryBytesLength);
	let b = 0;
	while (b < binaryBytesLength) {
		sysexBytes[b] = Math.random() * 256;
		b++;
	}
	const inputSysexEvent: WamSysexEvent = {
		type: 'wam-sysex',
		time: 10 * Math.random(),
		data: {
			bytes: sysexBytes,
		},
	};

	const oscBytes = new Uint8Array(binaryBytesLength);
	b = 0;
	while (b < binaryBytesLength) {
		oscBytes[b] = Math.random() * 256;
		b++;
	}
	const inputOscEvent: WamOscEvent = {
		type: 'wam-osc',
		time: 10 * Math.random(),
		data: {
			bytes: sysexBytes,
		},
	};

	const inputInfoEvent: WamInfoEvent = {
		type: 'wam-info',
		time: 10 * Math.random(),
		data: {
			instanceId: `some-wam-name.instance.${Date.now().toString()}`,
		}
	}

	it('Should handle updating parameter indices', () => {
		const xAutomationEvent: WamAutomationEvent = {
			type: 'wam-automation',
			time: 10 * Math.random(),
			data: {
				id: 'x',
				value: Math.random(),
				normalized: true,
			},
		};
		const yAutomationEvent = inputAutomationEvent;
		const zAutomationEvent: WamAutomationEvent = {
			type: 'wam-automation',
			time: 10 * Math.random(),
			data: {
				id: 'z',
				value: Math.random(),
				normalized: true,
			},
		};
		const aAutomationEvent: WamAutomationEvent = {
			type: 'wam-automation',
			time: 10 * Math.random(),
			data: {
				id: 'a',
				value: Math.random(),
				normalized: true,
			},
		};
		const bAutomationEvent: WamAutomationEvent = {
			type: 'wam-automation',
			time: 10 * Math.random(),
			data: {
				id: 'b',
				value: Math.random(),
				normalized: true,
			},
		};

		const inputEvents = [
			xAutomationEvent,
			yAutomationEvent,
			zAutomationEvent,
			aAutomationEvent,
			bAutomationEvent,
		];

		const sab = WamEventRingBuffer.getStorageForEventCapacity(RingBuffer, inputEvents.length);
		const test = new WamEventRingBuffer(RingBuffer, sab, parameterIndices, binaryBytesLength);

		let numWritten = test.write(...inputEvents);
		expect(numWritten).toEqual(inputEvents.length - 2);

		let expectedOutputEvents = [
			xAutomationEvent,
			yAutomationEvent,
			zAutomationEvent,
		];

		let outputEvents = test.read();
		let numRead = outputEvents.length;
		expect(numRead).toEqual(numWritten);
		expect(outputEvents).toEqual(expectedOutputEvents);

		const newParameterIndices = {
			a: 0,
			b: 1,
			y: 2,
			z: 3,
		};

		test.setParameterIndices(newParameterIndices);

		numWritten = test.write(...inputEvents);
		expect(numWritten).toEqual(inputEvents.length - 1);

		expectedOutputEvents = [
			yAutomationEvent,
			zAutomationEvent,
			aAutomationEvent,
			bAutomationEvent,
		];

		outputEvents = test.read();
		numRead = outputEvents.length;
		expect(numRead).toEqual(numWritten);
		expect(outputEvents).toEqual(expectedOutputEvents);
	});

	it('Should allocate enough bytes for events of all types', () => {
		const defaultSab = WamEventRingBuffer.getStorageForEventCapacity(RingBuffer, 1);
		expect(defaultSab.byteLength).toBeGreaterThan(WamEventRingBuffer.WamEventBaseBytes);
		expect(defaultSab.byteLength).toBeGreaterThan(WamEventRingBuffer.WamAutomationEventBytes);
		expect(defaultSab.byteLength).toBeGreaterThan(WamEventRingBuffer.WamTransportEventBytes);
		expect(defaultSab.byteLength).toBeGreaterThan(WamEventRingBuffer.WamMidiEventBytes);

		const binarySab = WamEventRingBuffer.getStorageForEventCapacity(RingBuffer, 1,
			binaryBytesLength);
		expect(binarySab.byteLength).toBeGreaterThan(WamEventRingBuffer.WamBinaryEventBytes
			+ binaryBytesLength);

		const testNumEvents = 333;
		const testSab = WamEventRingBuffer.getStorageForEventCapacity(RingBuffer, testNumEvents);
		expect(testSab.byteLength).toBeGreaterThan(WamEventRingBuffer.WamTransportEventBytes
			* testNumEvents);
	});

	it('Should only write number of events for which there is enough space', () => {
		const inputEvents = [
			inputSysexEvent,
			inputSysexEvent,
		];

		const sab = WamEventRingBuffer.getStorageForEventCapacity(RingBuffer, 1);
		const test = new WamEventRingBuffer(RingBuffer, sab, parameterIndices, binaryBytesLength);

		const numWritten = test.write(...inputEvents);
		expect(numWritten).toEqual(1);
	});

	it('Should read and write individual events of all types', () => {
		const inputEvents = [
			inputAutomationEvent,
			inputTransportEvent,
			inputMidiEvent,
			inputMpeEvent,
			inputSysexEvent,
			inputOscEvent,
			inputInfoEvent,
		];
		let written = 0;
		let read: WamEvent[] = [];

		const sab = WamEventRingBuffer.getStorageForEventCapacity(RingBuffer, 1, binaryBytesLength);
		const test = new WamEventRingBuffer(RingBuffer, sab, parameterIndices, binaryBytesLength);

		inputEvents.forEach((inputEvent) => {
			written = test.write(inputEvent);
			expect(written).toEqual(1);
			read = test.read();
			expect(read.length).toEqual(1);
			const outputEvent = read[0];
			expect(inputEvent).toEqual(outputEvent);
		});
	});

	it('Should read and write multiple events of all types', () => {
		const inputEvents = [
			inputAutomationEvent,
			inputTransportEvent,
			inputMidiEvent,
			inputMpeEvent,
			inputSysexEvent,
			inputOscEvent,
			inputInfoEvent,
		];
		const numEvents = inputEvents.length;

		shuffleArray(inputEvents);

		const sab = WamEventRingBuffer.getStorageForEventCapacity(RingBuffer,
			numEvents, binaryBytesLength);
		const test = new WamEventRingBuffer(RingBuffer, sab, parameterIndices, binaryBytesLength);

		test.write(...inputEvents);
		const outputEvents = test.read();
		expect(outputEvents.length).toEqual(inputEvents.length);

		inputEvents.forEach((inputEvent, i) => {
			const outputEvent = outputEvents[i];
			expect(inputEvent).toEqual(outputEvent);
		});
	});
});
