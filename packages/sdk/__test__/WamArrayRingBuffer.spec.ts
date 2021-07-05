/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */

import expect from './jestUtilities';

import getRingBuffer from '../src/RingBuffer.js';
import getWamArrayRingBuffer from '../src/WamArrayRingBuffer.js';
import { fillRandom, shuffleArray } from './testUtilities';

const RingBuffer = getRingBuffer();
const WamArrayRingBuffer = getWamArrayRingBuffer();

const arrayLength = 16;
const defaultArrayCapacity = WamArrayRingBuffer.DefaultArrayCapacity;
const customArrayCapacity = 2 * defaultArrayCapacity + 1;

const initializeInputArrays = () => {
	const inputInt8Array = new Int8Array(arrayLength);
	fillRandom(inputInt8Array, -128, 127, true);
	const inputUint8Array = new Uint8Array(arrayLength);
	fillRandom(inputUint8Array, 0, 255, true);
	const inputUint8ClampedArray = new Uint8ClampedArray(arrayLength);
	fillRandom(inputUint8ClampedArray, 0, 255, true);
	const inputInt16Array = new Int16Array(arrayLength);
	fillRandom(inputInt16Array, -32768, 32767, true);
	const inputUint16Array = new Uint16Array(arrayLength);
	fillRandom(inputUint16Array, 0, 65535, true);
	const inputInt32Array = new Int32Array(arrayLength);
	fillRandom(inputInt32Array, -2147483648, 2147483647, true);
	const inputUint32Array = new Uint32Array(arrayLength);
	fillRandom(inputUint32Array, 0, 4294967295, true);
	const inputFloat32Array = new Float32Array(arrayLength);
	fillRandom(inputFloat32Array, -1.0, 1.0, false);
	const inputFloat64Array = new Float64Array(arrayLength);
	fillRandom(inputFloat64Array, -1.0, 1.0, false);
	const inputBigInt64Array = new BigInt64Array(arrayLength);
	fillRandom(inputBigInt64Array, BigInt(-Math.pow(2, 53)), BigInt(Math.pow(2, 53) -1), true);
	const inputBigUint64Array = new BigUint64Array(arrayLength);
	fillRandom(inputBigUint64Array, BigInt(0), BigInt(Math.pow(2, 53)), true);
	return [
		inputInt8Array,
		inputUint8Array,
		inputUint8ClampedArray,
		inputInt16Array,
		inputUint16Array,
		inputInt32Array,
		inputUint32Array,
		inputFloat32Array,
		inputFloat64Array,
		inputBigInt64Array,
		inputBigUint64Array,
	];
};

const initializeSabs = () => {
	const defaultCapacityInt8Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		Int8Array, defaultArrayCapacity);
	const customCapacityInt8Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		Int8Array, customArrayCapacity);
	const defaultCapacityUint8Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		Uint8Array, defaultArrayCapacity);
	const customCapacityUint8Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		Uint8Array, customArrayCapacity);
	const defaultCapacityUint8ClampedSab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		Uint8ClampedArray, defaultArrayCapacity);
	const customCapacityUint8ClampedSab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		Uint8ClampedArray, customArrayCapacity);
	const defaultCapacityInt16Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		Int16Array, defaultArrayCapacity);
	const customCapacityInt16Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		Int16Array, customArrayCapacity);
	const defaultCapacityUint16Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		Uint16Array, defaultArrayCapacity);
	const customCapacityUint16Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		Uint16Array, customArrayCapacity);
	const defaultCapacityInt32Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		Int32Array, defaultArrayCapacity);
	const customCapacityInt32Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		Int32Array, customArrayCapacity);
	const defaultCapacityUint32Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		Uint32Array, defaultArrayCapacity);
	const customCapacityUint32Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		Uint32Array, customArrayCapacity);
	const defaultCapacityFloat32Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		Float32Array, defaultArrayCapacity);
	const customCapacityFloat32Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		Float32Array, customArrayCapacity);
	const defaultCapacityFloat64Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		Float64Array, defaultArrayCapacity);
	const customCapacityFloat64Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		Float64Array, customArrayCapacity);
	const defaultCapacityBigInt64Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		BigInt64Array, defaultArrayCapacity);
	const customCapacityBigInt64Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		BigInt64Array, customArrayCapacity);
	const defaultCapacityBigUint64Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		BigUint64Array, defaultArrayCapacity);
	const customCapacityBigUint64Sab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer, arrayLength,
		BigUint64Array, customArrayCapacity);
	return [
		defaultCapacityInt8Sab, customCapacityInt8Sab,
		defaultCapacityUint8Sab, customCapacityUint8Sab,
		defaultCapacityUint8ClampedSab, customCapacityUint8ClampedSab,
		defaultCapacityInt16Sab, customCapacityInt16Sab,
		defaultCapacityUint16Sab, customCapacityUint16Sab,
		defaultCapacityInt32Sab, customCapacityInt32Sab,
		defaultCapacityUint32Sab, customCapacityUint32Sab,
		defaultCapacityFloat32Sab, customCapacityFloat32Sab,
		defaultCapacityFloat64Sab, customCapacityFloat64Sab,
		defaultCapacityBigInt64Sab, customCapacityBigInt64Sab,
		defaultCapacityBigUint64Sab, customCapacityBigUint64Sab,
	];
};

const initializeWamArrayRingBuffers = () => {
	const [
		defaultCapacityInt8Sab, customCapacityInt8Sab,
		defaultCapacityUint8Sab, customCapacityUint8Sab,
		defaultCapacityUint8ClampedSab, customCapacityUint8ClampedSab,
		defaultCapacityInt16Sab, customCapacityInt16Sab,
		defaultCapacityUint16Sab, customCapacityUint16Sab,
		defaultCapacityInt32Sab, customCapacityInt32Sab,
		defaultCapacityUint32Sab, customCapacityUint32Sab,
		defaultCapacityFloat32Sab, customCapacityFloat32Sab,
		defaultCapacityFloat64Sab, customCapacityFloat64Sab,
		defaultCapacityBigInt64Sab, customCapacityBigInt64Sab,
		defaultCapacityBigUint64Sab, customCapacityBigUint64Sab,
	] = initializeSabs();

	const defaultCapacityRingBuffers = [
		new WamArrayRingBuffer(RingBuffer, defaultCapacityInt8Sab, arrayLength, Int8Array),
		new WamArrayRingBuffer(RingBuffer, defaultCapacityUint8Sab, arrayLength, Uint8Array),
		new WamArrayRingBuffer(RingBuffer, defaultCapacityUint8ClampedSab, arrayLength, Uint8ClampedArray),
		new WamArrayRingBuffer(RingBuffer, defaultCapacityInt16Sab, arrayLength, Int16Array),
		new WamArrayRingBuffer(RingBuffer, defaultCapacityUint16Sab, arrayLength, Uint16Array),
		new WamArrayRingBuffer(RingBuffer, defaultCapacityInt32Sab, arrayLength, Int32Array),
		new WamArrayRingBuffer(RingBuffer, defaultCapacityUint32Sab, arrayLength, Uint32Array),
		new WamArrayRingBuffer(RingBuffer, defaultCapacityFloat32Sab, arrayLength, Float32Array),
		new WamArrayRingBuffer(RingBuffer, defaultCapacityFloat64Sab, arrayLength, Float64Array),
		new WamArrayRingBuffer(RingBuffer, defaultCapacityBigInt64Sab, arrayLength, BigInt64Array),
		new WamArrayRingBuffer(RingBuffer, defaultCapacityBigUint64Sab, arrayLength, BigUint64Array),
	];
	const customCapacityRingBuffers = [
		new WamArrayRingBuffer(RingBuffer, customCapacityInt8Sab, arrayLength, Int8Array),
		new WamArrayRingBuffer(RingBuffer, customCapacityUint8Sab, arrayLength, Uint8Array),
		new WamArrayRingBuffer(RingBuffer, customCapacityUint8ClampedSab, arrayLength, Uint8ClampedArray),
		new WamArrayRingBuffer(RingBuffer, customCapacityInt16Sab, arrayLength, Int16Array),
		new WamArrayRingBuffer(RingBuffer, customCapacityUint16Sab, arrayLength, Uint16Array),
		new WamArrayRingBuffer(RingBuffer, customCapacityInt32Sab, arrayLength, Int32Array),
		new WamArrayRingBuffer(RingBuffer, customCapacityUint32Sab, arrayLength, Uint32Array),
		new WamArrayRingBuffer(RingBuffer, customCapacityFloat32Sab, arrayLength, Float32Array),
		new WamArrayRingBuffer(RingBuffer, customCapacityFloat64Sab, arrayLength, Float64Array),
		new WamArrayRingBuffer(RingBuffer, customCapacityBigInt64Sab, arrayLength, BigInt64Array),
		new WamArrayRingBuffer(RingBuffer, customCapacityBigUint64Sab, arrayLength, BigUint64Array),
	];
	return { defaultCapacityRingBuffers, customCapacityRingBuffers };
};

describe('WamArrayRingBuffer Suite', () => {

	it('Should allocate enough bytes for multiple arrays', () => {
		const [
			defaultCapacityInt8Sab, customCapacityInt8Sab,
			defaultCapacityUint8Sab, customCapacityUint8Sab,
			defaultCapacityUint8ClampedSab, customCapacityUint8ClampedSab,
			defaultCapacityInt16Sab, customCapacityInt16Sab,
			defaultCapacityUint16Sab, customCapacityUint16Sab,
			defaultCapacityInt32Sab, customCapacityInt32Sab,
			defaultCapacityUint32Sab, customCapacityUint32Sab,
			defaultCapacityFloat32Sab, customCapacityFloat32Sab,
			defaultCapacityFloat64Sab, customCapacityFloat64Sab,
			defaultCapacityBigInt64Sab, customCapacityBigInt64Sab,
			defaultCapacityBigUint64Sab, customCapacityBigUint64Sab,
		] = initializeSabs();

		expect(defaultCapacityInt8Sab.byteLength).toBeGreaterThan(defaultArrayCapacity * arrayLength * Int8Array.BYTES_PER_ELEMENT);
		expect(defaultCapacityUint8Sab.byteLength).toBeGreaterThan(defaultArrayCapacity * arrayLength * Uint8Array.BYTES_PER_ELEMENT);
		expect(defaultCapacityUint8ClampedSab.byteLength).toBeGreaterThan(defaultArrayCapacity * arrayLength * Uint8ClampedArray.BYTES_PER_ELEMENT);
		expect(defaultCapacityInt16Sab.byteLength).toBeGreaterThan(defaultArrayCapacity * arrayLength * Int16Array.BYTES_PER_ELEMENT);
		expect(defaultCapacityUint16Sab.byteLength).toBeGreaterThan(defaultArrayCapacity * arrayLength * Uint16Array.BYTES_PER_ELEMENT);
		expect(defaultCapacityInt32Sab.byteLength).toBeGreaterThan(defaultArrayCapacity * arrayLength * Int32Array.BYTES_PER_ELEMENT);
		expect(defaultCapacityUint32Sab.byteLength).toBeGreaterThan(defaultArrayCapacity * arrayLength * Uint32Array.BYTES_PER_ELEMENT);
		expect(defaultCapacityFloat32Sab.byteLength).toBeGreaterThan(defaultArrayCapacity * arrayLength * Float32Array.BYTES_PER_ELEMENT);
		expect(defaultCapacityFloat64Sab.byteLength).toBeGreaterThan(defaultArrayCapacity * arrayLength * Float64Array.BYTES_PER_ELEMENT);
		expect(defaultCapacityBigInt64Sab.byteLength).toBeGreaterThan(defaultArrayCapacity * arrayLength * BigInt64Array.BYTES_PER_ELEMENT);
		expect(defaultCapacityBigUint64Sab.byteLength).toBeGreaterThan(defaultArrayCapacity * arrayLength * BigUint64Array.BYTES_PER_ELEMENT);

		expect(customCapacityInt8Sab.byteLength).toBeGreaterThan(customArrayCapacity * arrayLength * Int8Array.BYTES_PER_ELEMENT);
		expect(customCapacityUint8Sab.byteLength).toBeGreaterThan(customArrayCapacity * arrayLength * Uint8Array.BYTES_PER_ELEMENT);
		expect(customCapacityUint8ClampedSab.byteLength).toBeGreaterThan(customArrayCapacity * arrayLength * Uint8ClampedArray.BYTES_PER_ELEMENT);
		expect(customCapacityInt16Sab.byteLength).toBeGreaterThan(customArrayCapacity * arrayLength * Int16Array.BYTES_PER_ELEMENT);
		expect(customCapacityUint16Sab.byteLength).toBeGreaterThan(customArrayCapacity * arrayLength * Uint16Array.BYTES_PER_ELEMENT);
		expect(customCapacityInt32Sab.byteLength).toBeGreaterThan(customArrayCapacity * arrayLength * Int32Array.BYTES_PER_ELEMENT);
		expect(customCapacityUint32Sab.byteLength).toBeGreaterThan(customArrayCapacity * arrayLength * Uint32Array.BYTES_PER_ELEMENT);
		expect(customCapacityFloat32Sab.byteLength).toBeGreaterThan(customArrayCapacity * arrayLength * Float32Array.BYTES_PER_ELEMENT);
		expect(customCapacityFloat64Sab.byteLength).toBeGreaterThan(customArrayCapacity * arrayLength * Float64Array.BYTES_PER_ELEMENT);
		expect(customCapacityBigInt64Sab.byteLength).toBeGreaterThan(customArrayCapacity * arrayLength * BigInt64Array.BYTES_PER_ELEMENT);
		expect(customCapacityBigUint64Sab.byteLength).toBeGreaterThan(customArrayCapacity * arrayLength * BigUint64Array.BYTES_PER_ELEMENT);
	});

	it('Should initialize all expected ring buffers', () => {
		const inputArrays = initializeInputArrays();
		const { defaultCapacityRingBuffers, customCapacityRingBuffers } = initializeWamArrayRingBuffers();
		expect(defaultCapacityRingBuffers.length).toEqual(inputArrays.length);
		expect(customCapacityRingBuffers.length).toEqual(inputArrays.length);
	});

	it('Should only consecutively write number of arrays for which there is enough space', () => {
		const { defaultCapacityRingBuffers, customCapacityRingBuffers } = initializeWamArrayRingBuffers();
		const inputArrays = initializeInputArrays();
		let i = 0;
		while (i < inputArrays.length) {
			const inputArray = inputArrays[i];
			const defaultCapacityRingBuffer = defaultCapacityRingBuffers[i];
			const customCapacityRingBuffer = customCapacityRingBuffers[i];

			let j = 0;
			while (j < defaultArrayCapacity + 1) {
				const success = defaultCapacityRingBuffer.write(inputArray);
				if (j < defaultArrayCapacity) expect(success).toEqual(true);
				else expect(success).not.toEqual(true);
				j++;
			}

			j = 0;
			while (j < customArrayCapacity + 1) {
				const success = customCapacityRingBuffer.write(inputArray);
				if (j < customArrayCapacity) expect(success).toEqual(true);
				else expect(success).not.toEqual(true);
				j++;
			}
			i++;
		}
	});

	it('Should read individual written array of specified type', () => {
		const { defaultCapacityRingBuffers, customCapacityRingBuffers } = initializeWamArrayRingBuffers();
		const inputArrays = initializeInputArrays();
		let i = 0;
		while (i < inputArrays.length) {
			const inputArray = inputArrays[i];
			const outputArray = inputArray.slice();
			const modifiedInputArray = inputArray.slice();
			shuffleArray(modifiedInputArray);

			const defaultCapacityRingBuffer = defaultCapacityRingBuffers[i];
			const customCapacityRingBuffer = customCapacityRingBuffers[i];
			let success = false;

			// ~~ default capacity

			success = defaultCapacityRingBuffer.write(inputArray);
			expect(success).toEqual(true);

			//@ts-ignore
			if (typeof inputArray[0] === 'bigint') outputArray.fill(BigInt(0));
			//@ts-ignore
			else outputArray.fill(0);

			success = defaultCapacityRingBuffer.read(outputArray, false);
			expect(success).toEqual(true);
			expect(outputArray).toEqual(inputArray);

			let j = 0;
			while (j < defaultArrayCapacity - 1) {
				success = defaultCapacityRingBuffer.write(inputArray);
				expect(success).toEqual(true);
				j++;
			}
			success = defaultCapacityRingBuffer.write(modifiedInputArray);
			expect(success).toEqual(true);

			//@ts-ignore
			if (typeof inputArray[0] === 'bigint') outputArray.fill(BigInt(0));
			//@ts-ignore
			else outputArray.fill(0);

			success = defaultCapacityRingBuffer.read(outputArray, true);
			expect(success).toEqual(true);
			expect(outputArray).toEqual(modifiedInputArray);

			// ~~ custom capacity

			success = customCapacityRingBuffer.write(inputArray);
			expect(success).toEqual(true);

			success = customCapacityRingBuffer.read(outputArray, false);
			expect(success).toEqual(true);
			expect(outputArray).toEqual(inputArray);

			j = 0;
			while (j < customArrayCapacity - 1) {
				success = customCapacityRingBuffer.write(inputArray);
				expect(success).toEqual(true);
				j++;
			}
			success = customCapacityRingBuffer.write(modifiedInputArray);
			expect(success).toEqual(true);

			//@ts-ignore
			if (typeof inputArray[0] === 'bigint') outputArray.fill(BigInt(0));
			//@ts-ignore
			else outputArray.fill(0);

			success = customCapacityRingBuffer.read(outputArray, true);
			expect(success).toEqual(true);
			expect(outputArray).toEqual(modifiedInputArray);
			i++;
		}
	});

	it('Should read multiple written arrays of specified type', () => {
		const { defaultCapacityRingBuffers, customCapacityRingBuffers } = initializeWamArrayRingBuffers();
		const inputArrays = initializeInputArrays();
		let i = 0;
		while (i < inputArrays.length) {
			const inputArray = inputArrays[i];
			const outputArray = inputArray.slice();
			const modifiedInputArray = inputArray.slice();
			shuffleArray(modifiedInputArray);

			const defaultCapacityRingBuffer = defaultCapacityRingBuffers[i];
			const customCapacityRingBuffer = customCapacityRingBuffers[i];
			let success = false;

			// ~~ default capacity

			let j = 0;
			while (j < defaultArrayCapacity - 1) {
				success = defaultCapacityRingBuffer.write(inputArray);
				expect(success).toEqual(true);
				j++;
			}
			success = defaultCapacityRingBuffer.write(modifiedInputArray);
			expect(success).toEqual(true);

			const defaultOutputArrays = [];
			j = 0;
			while (j < defaultArrayCapacity) {
				success = defaultCapacityRingBuffer.read(outputArray, false);
				expect(success).toEqual(true);
				defaultOutputArrays.push(outputArray.slice());
				j++;
			}
			expect(defaultOutputArrays.length).toEqual(defaultArrayCapacity);

			j = 0;
			while (j < defaultArrayCapacity - 1) {
				expect(defaultOutputArrays[j]).toEqual(inputArray);
				j++;
			}
			expect(defaultOutputArrays[j]).toEqual(modifiedInputArray);

			// ~~ custom capacity

			j = 0;
			while (j < customArrayCapacity - 1) {
				success = customCapacityRingBuffer.write(inputArray);
				expect(success).toEqual(true);
				j++;
			}
			success = customCapacityRingBuffer.write(modifiedInputArray);
			expect(success).toEqual(true);

			const customOutputArrays = [];
			j = 0;
			while (j < customArrayCapacity) {
				success = customCapacityRingBuffer.read(outputArray, false);
				expect(success).toEqual(true);
				customOutputArrays.push(outputArray.slice());
				j++;
			}
			expect(customOutputArrays.length).toEqual(customArrayCapacity);

			j = 0;
			while (j < customArrayCapacity - 1) {
				expect(customOutputArrays[j]).toEqual(inputArray);
				j++;
			}
			expect(customOutputArrays[j]).toEqual(modifiedInputArray);

			i++;
		}
	});
});
