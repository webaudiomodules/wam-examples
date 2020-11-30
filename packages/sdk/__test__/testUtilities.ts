/* eslint-disable no-plusplus */
/* eslint-disable import/prefer-default-export */

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
