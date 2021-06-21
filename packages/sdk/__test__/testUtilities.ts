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

/**
 * Randomly shuffles values in `arrayLike`, in place. Adapted from
 * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 * @param arrayLike the sequence of values to difference
 */
export function shuffleArray(arrayLike: ArrayLike<any>) {
	let currentIndex = arrayLike.length;
	let randomIndex = -1;

	// While there remain elements to shuffle...
	while (currentIndex !== 0) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		// @ts-ignore
		[arrayLike[currentIndex], arrayLike[randomIndex]] = [arrayLike[randomIndex],
			arrayLike[currentIndex]];
	}
}
