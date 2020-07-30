/* eslint-disable no-plusplus */

import expect from './jestUtilities';

describe('jestUtilities Suite', () => {
	// ArrayLike matcher utilities
	const N = 16;
	const onesBuffer = new Float64Array(N);
	onesBuffer.fill(1);
	const zerosBuffer = new Float64Array(N);
	const randBuffer = new Float64Array(N);
	const randArray = new Array(N);
	const increasingBuffer = new Array(N);
	const decreasingBuffer = new Array(N);
	for (let n = 0; n < N; ++n) {
		const rand = Math.random() - Math.random();
		randBuffer[n] = rand;
		randArray[n] = rand;
		increasingBuffer[n] = n / N;
		decreasingBuffer[n] = 1 - increasingBuffer[n];
	}

	it('ArrayLike matchers | Equality', () => {
		// Make sure expected-received type combinations work
		expect(randArray).toAllEqual(randArray);
		expect(randArray).toAllEqual(randBuffer);
		expect(randBuffer).toAllEqual(randArray);
		expect(randBuffer).toAllEqual(randBuffer);

		// Mismatch between 32/64 bit floats...
		const randBuffer32 = new Float32Array(randArray);
		expect(randBuffer32).not.toAllEqual(randBuffer);

		expect(onesBuffer).toAllEqual(1);
		expect(onesBuffer).not.toAllEqual(0);
	});

	it('ArrayLike matchers | Greater than or equal', () => {
		expect(onesBuffer).toAllBeGreaterThanOrEqual(onesBuffer);
		expect(onesBuffer).toAllBeGreaterThanOrEqual(1);

		expect(onesBuffer).toAllBeGreaterThanOrEqual(zerosBuffer);
		expect(onesBuffer).toAllBeGreaterThanOrEqual(0);

		expect(zerosBuffer).not.toAllBeGreaterThanOrEqual(onesBuffer);
		expect(zerosBuffer).not.toAllBeGreaterThanOrEqual(1);

		onesBuffer[0] = 0;
		expect(onesBuffer).not.toAllBeGreaterThanOrEqual(1);
		onesBuffer[0] = 1;
	});

	it('ArrayLike matchers | Greater than', () => {
		expect(onesBuffer).not.toAllBeGreaterThan(onesBuffer);
		expect(onesBuffer).not.toAllBeGreaterThan(1);

		expect(onesBuffer).toAllBeGreaterThan(zerosBuffer);
		expect(onesBuffer).toAllBeGreaterThan(0);

		onesBuffer[0] = 0;
		expect(onesBuffer).not.toAllBeGreaterThan(zerosBuffer);
		expect(onesBuffer).not.toAllBeGreaterThan(0);
		onesBuffer[0] = 1;
	});

	it('ArrayLike matchers | Less than or equal', () => {
		expect(zerosBuffer).toAllBeLessThanOrEqual(zerosBuffer);
		expect(zerosBuffer).toAllBeLessThanOrEqual(0);

		expect(zerosBuffer).toAllBeLessThanOrEqual(onesBuffer);
		expect(zerosBuffer).toAllBeLessThanOrEqual(1);

		expect(onesBuffer).not.toAllBeLessThanOrEqual(zerosBuffer);
		expect(onesBuffer).not.toAllBeLessThanOrEqual(0);

		zerosBuffer[0] = 1;
		expect(zerosBuffer).not.toAllBeLessThanOrEqual(0);
		zerosBuffer[0] = 0;
	});

	it('ArrayLike matchers | Less than', () => {
		expect(zerosBuffer).not.toAllBeLessThan(zerosBuffer);
		expect(zerosBuffer).not.toAllBeLessThan(0);

		expect(zerosBuffer).toAllBeLessThan(onesBuffer);
		expect(zerosBuffer).toAllBeLessThan(1);

		zerosBuffer[0] = 1;
		expect(zerosBuffer).not.toAllBeLessThan(onesBuffer);
		expect(zerosBuffer).not.toAllBeLessThan(1);
		zerosBuffer[0] = 0;
	});

	it('ArrayLike matchers | Increasing', () => {
		expect(onesBuffer).not.toAllIncrease();
		expect(decreasingBuffer).not.toAllIncrease();
		expect(increasingBuffer).toAllIncrease();
		increasingBuffer[0] = increasingBuffer[N - 1];
		expect(increasingBuffer).not.toAllIncrease();
		increasingBuffer[0] = 0;
	});

	it('ArrayLike matchers | Decreasing', () => {
		expect(onesBuffer).not.toAllDecrease();
		expect(increasingBuffer).not.toAllDecrease();
		expect(decreasingBuffer).toAllDecrease();
		decreasingBuffer[0] = decreasingBuffer[N - 1];
		expect(decreasingBuffer).not.toAllDecrease();
		decreasingBuffer[0] = 1;
	});
});
