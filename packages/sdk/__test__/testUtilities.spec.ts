/* eslint-disable no-plusplus */

import expect from './jestUtilities';
import { diffArray } from './testUtilities';

describe('testUtilities Suite', () => {
	it('diffArray should compute nth discrete difference of sequence', () => {
		const N = 16;
		const y = new Float32Array(N);
		const dyExpected = new Float32Array(N - 1);
		const ddyExpected = new Float32Array(N - 2);
		const dddyExpected = new Float32Array(N - 3);
		const dt = 1 / N;
		for (let n = 0; n < N; ++n) {
			const x = n * dt;
			y[n] = x ** 3 + 2 * x ** 2 + x;
			if (n > 0) dyExpected[n - 1] = y[n] - y[n - 1];
			if (n > 1) ddyExpected[n - 2] = dyExpected[n - 1] - dyExpected[n - 2];
			if (n > 2) dddyExpected[n - 3] = ddyExpected[n - 2] - ddyExpected[n - 3];
		}

		const dyActual = diffArray(y, 1);
		expect(dyActual).toAllEqual(dyExpected);

		const ddyActual = diffArray(y, 2);
		expect(ddyActual).toAllEqual(ddyExpected);

		const dddyActual = diffArray(y, 3);
		expect(dddyActual).toAllEqual(dddyExpected);
	});
});
