/* eslint-disable no-undef */
/** @typedef {typeof import('./types').RingBuffer} RingBufferConstructor */
/** @typedef {import('./types').RingBuffer} RingBuffer */
/** @typedef {import('./types').TypedArray} TypedArray */
/** @typedef {import('./types').TypedArrayConstructor} TypedArrayConstructor */
/** @typedef {import('./types').WamArrayRingBuffer} IWamArrayRingBuffer */
/** @typedef {typeof import('./types').WamArrayRingBuffer} WamArrayRingBufferConstructor */
/** @typedef {import('./types').AudioWorkletGlobalScope} AudioWorkletGlobalScope */

/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */

/**
 * @returns {WamArrayRingBufferConstructor}
 */
const executable = () => {
	/**
	 * @implements {IWamArrayRingBuffer}
	 */
	class WamArrayRingBuffer {
		/**
		 * Default number of arrays for which memory will be allocated.
		 *
		 * @type {number}
		 */
		 static DefaultArrayCapacity = 2;

		/**
		 * Returns a SharedArrayBuffer large enough to safely store the
		 * specified number of arrays of the specified length. Specify
		 * `maxArrayCapacity` to support storing more than
		 * `DefaultArrayCapacity` arrays in the buffer.
		 *
		 * @param {RingBufferConstructor} RingBuffer
		 * @param {number} arrayLength
		 * @param {TypedArrayConstructor} arrayType
		 * @param {number} [maxArrayCapacity=undefined]
		 * @returns {SharedArrayBuffer}
		 */
		static getStorageForEventCapacity(RingBuffer, arrayLength, arrayType, maxArrayCapacity = undefined) {
			if (maxArrayCapacity === undefined) maxArrayCapacity = WamArrayRingBuffer.DefaultArrayCapacity;
			else maxArrayCapacity = Math.max(maxArrayCapacity, WamArrayRingBuffer.DefaultArrayCapacity);
			if (!arrayType.BYTES_PER_ELEMENT) {
				throw new Error('Pass in a ArrayBuffer subclass');
			}
			const capacity = arrayLength * maxArrayCapacity;
			return RingBuffer.getStorageForCapacity(capacity, arrayType);
		}

		/**
		 * Provides methods for writing / reading arrays to / from a
		 * RingBuffer. Specify `maxArrayCapacity` to support storing more
	 	 * than `DefaultArrayCapacity` arrays in the buffer.
		 *
		 * @param {RingBufferConstructor} RingBuffer
		 * @param {SharedArrayBuffer} sab
		 * @param {number} arrayLength
		 * @param {TypedArrayConstructor} arrayType
		 * @param {number} [maxArrayCapacity=undefined]
		 */
		constructor(RingBuffer, sab, arrayLength, arrayType, maxArrayCapacity = undefined) {
			if (!arrayType.BYTES_PER_ELEMENT) {
				throw new Error('Pass in a ArrayBuffer subclass');
			}

			/** @type {number} */
			this._arrayLength = arrayLength;

			/** @type {TypedArrayConstructor} */
			this._arrayType = arrayType;

			/** @type {number} */
			this._arrayElementSizeBytes = arrayType.BYTES_PER_ELEMENT;

			/** @type {number} */
			this._arraySizeBytes = this._arrayLength * this._arrayElementSizeBytes;

			/** @type {SharedArrayBuffer} */
			this._sab = sab;

			if (maxArrayCapacity === undefined) maxArrayCapacity = WamArrayRingBuffer.DefaultArrayCapacity;
			else maxArrayCapacity = Math.max(maxArrayCapacity, WamArrayRingBuffer.DefaultArrayCapacity);

			/** @type {TypedArray} */
			this._arrayArray = new arrayType(this._arrayLength);

			/** @type {RingBuffer} */
			this._rb = new RingBuffer(this._sab, arrayType);
		}

		/**
		 * Attempt to write array to the ring buffer, returning whether
		 * or not it was successfully written.
		 *
		 * @param {TypedArray} array
		 * @returns {boolean}
		 */
		write(array) {
			if (array.length !== this._arrayLength) return false;
			const elementsAvailable = this._rb.availableWrite;
			if (elementsAvailable < this._arrayLength) return false;

			let success = true;
			const elementsWritten = this._rb.push(array);
			if (elementsWritten != this._arrayLength) success = false;
			return success;
		}

		/**
		 * Attempt to read array from the ring buffer, returning whether
		 * or not it was successfully read. If `newest` is true, skips
		 * all pending arrays but the most recently written one.
		 *
		 * @param {TypedArray} array
		 * @param {boolean} newest
		 * @returns {boolean}
		 */
		read(array, newest) {
			if (array.length !== this._arrayLength) return false;
			const elementsAvailable = this._rb.availableRead;
			if (elementsAvailable < this._arrayLength) return false;

			// skip all but most recently written array?
			if (newest && elementsAvailable > this._arrayLength) this._rb.pop(elementsAvailable - this._arrayLength);

			let success = false;
			const elementsRead = this._rb.pop(array);
			if (elementsRead === this._arrayLength) success = true;
			return success;
		}

	}
	/** @type {AudioWorkletGlobalScope} */
	// @ts-ignore
	const audioWorkletGlobalScope = globalThis;
	if (audioWorkletGlobalScope.AudioWorkletProcessor) {
		if (!audioWorkletGlobalScope.WamArrayRingBuffer) {
			audioWorkletGlobalScope.WamArrayRingBuffer = WamArrayRingBuffer;
		}
	}

	return WamArrayRingBuffer;
};
/** @type {AudioWorkletGlobalScope} */
// @ts-ignore
const audioWorkletGlobalScope = globalThis;
if (audioWorkletGlobalScope.AudioWorkletProcessor) {
	if (!audioWorkletGlobalScope.WamArrayRingBuffer) executable();
}

export default executable;
