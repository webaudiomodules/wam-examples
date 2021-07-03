/* eslint-disable no-plusplus */
/* eslint-disable import/prefer-default-export */

import { TypedArray } from "../src/types";

/**
 * Computes `n`th discrete difference of sequential values in `arrayLike`.
 * Note that length of the output array will be `n` elements shorter than
 * that of the input.
 * @param arrayLike the sequence of values to difference
 * @param n the number of times values are differenced
 */
export function diffArray(arrayLike: ArrayLike<number>, n = 1) {
	if (n < 0) throw Error('"n" must be greater than or equal to 0');
	if (n === 0) return arrayLike;
	let diffs = [];
	while (n--) {
		diffs = [];
		let previousValue = arrayLike[0];
		for (let i = 1; i < arrayLike.length; ++i) {
			const currentValue = arrayLike[i];
			diffs.push(currentValue - previousValue);
			previousValue = currentValue;
		}
		arrayLike = diffs;
	}
	return diffs;
}

/**
 * Randomly shuffles values in `arrayLike`, in place. Adapted from
 * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 * @param arrayLike the sequence of values to difference
 */
export function shuffleArray(array: ArrayLike<any> | TypedArray) {
	let currentIndex = array.length;
	let randomIndex = -1;

	// While there remain elements to shuffle...
	while (currentIndex !== 0) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		// @ts-ignore
		[array[currentIndex], array[randomIndex]] = [array[randomIndex],
			array[currentIndex]];
	}
}

export function fillRandom(array: ArrayLike<any> | TypedArray | ArrayBuffer, min, max, integers) {
	// @ts-ignore
	const length = array.hasOwnProperty('length') ? array.length : array.byteLength;
	let n = 0;
	if (integers) {
		if (typeof array[0] === 'bigint') {
			while (n < length) {
				array[n] = BigInt(Number(min) + Math.floor(Math.random() * Number(max)));
				n++;
			}
		} else {
			while (n < length) {
				array[n] = min + Math.floor(Math.random() * max);
				n++;
			}
		}
	} else {
		while (n < length) {
			array[n] = min + Math.random() * max;
			n++;
		}
	}
}

export function ensureTextEncoderDecoder() {
	if (typeof TextEncoder === "undefined") {
		globalThis.TextEncoder = require('util').TextEncoder;
	}
	if (typeof TextDecoder === "undefined") {
		globalThis.TextDecoder = require('util').TextDecoder;
	}
}
