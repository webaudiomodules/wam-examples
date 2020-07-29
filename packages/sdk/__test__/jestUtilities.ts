/* eslint-disable no-plusplus */

type Expectation = 'toAllEqual'
| 'toAllBeGreaterThan' | 'toAllBeGreaterThanOrEqual'
| 'toAllBeLessThan' | 'toAllBeLessThanOrEqual'
| 'toAllIncrease' | 'toAllDecrease';

const comparators = {
	'===': (a: number, b: number) => a === b,
	'>=': (a: number, b: number) => a >= b,
	'>': (a: number, b: number) => a > b,
	'<=': (a: number, b: number) => a <= b,
	'<': (a: number, b: number) => a < b,
};

/**
 * Utility for validating / comparing array values.
 * @param jest provides jest `MatcherContext` utilities
 * @param expectation allows canonical formatting of console output
 * @param received 'left-hand side' values
 * @param expected 'right-hand side' value(s) if applicable
 */
function arrayExpectation(jest: jest.MatcherContext,
	expectation: Expectation,
	received: ArrayLike<number>,
	expected?: number | ArrayLike<number>) {
	if (expectation === 'toAllIncrease' || expectation === 'toAllDecrease') {
		if (typeof expected !== 'undefined') throw Error('"expected" argument should not be present for "increase" or "decrease" validation.');
	} else if (typeof expected !== 'number' && !expected) { throw Error('Missing "expected" argument.'); }
	let pass = true;
	let positiveString = '';
	let negativeString = '';
	/* eslint-disable-next-line */
	let comparator = (a: number, b: number) => false;
	switch (expectation) {
	case 'toAllEqual':
		positiveString = 'to equal';
		negativeString = 'to not equal';
		comparator = comparators['==='];
		break;
	case 'toAllBeGreaterThanOrEqual':
		positiveString = 'to be greater than or equal to';
		negativeString = 'to not be greater than or equal to';
		comparator = comparators['>='];
		break;
	case 'toAllBeGreaterThan':
		positiveString = 'to be greater than';
		negativeString = 'to not be greater than';
		comparator = comparators['>'];
		break;
	case 'toAllBeLessThanOrEqual':
		positiveString = 'to be less than or equal to';
		negativeString = 'to not be less than or equal to';
		comparator = comparators['<='];
		break;
	case 'toAllBeLessThan':
		positiveString = 'to be less than';
		negativeString = 'to not be less than';
		comparator = comparators['<'];
		break;
	case 'toAllIncrease':
		positiveString = 'to increase';
		negativeString = 'to not increase';
		comparator = comparators['<'];
		break;
	case 'toAllDecrease':
		positiveString = 'to decrease';
		negativeString = 'to not decrease';
		comparator = comparators['>'];
		break;
	default: break;
	}
	if (!received.length) throw Error(`Can only call ${expectation} on non-empty Array-like objects.`);
	if (typeof expected !== 'number') {
		if (expected) {
			if (expected.length !== received.length) throw Error('Lengths must match when comparing to Array-like object.');
			for (let i = 0; i < received.length; ++i) {
				if (!comparator(received[i], expected[i])) {
					pass = false;
					break;
				}
			}
			positiveString.concat('corresponding values of');
			negativeString.concat('corresponding values of');
		} else {
			let previousValue = received[0];
			for (let i = 1; i < received.length; ++i) {
				const currentValue = received[i];
				if (!comparator(previousValue, currentValue)) {
					pass = false;
					break;
				}
				previousValue = currentValue;
			}
		}
	} else {
		for (let i = 0; i < received.length; ++i) {
			if (!comparator(received[i], expected)) {
				pass = false;
				break;
			}
		}
	}
	const differenceString = jest.utils.diff(expected, received, { expand: jest.expand });
	const resultString = pass ? jest.utils.matcherHint(`.not.${expectation}`) : jest.utils.matcherHint(`.${expectation}`);
	resultString.concat('\n\n', `Expected all values of ${jest.utils.printReceived(received)}`);
	resultString.concat(`${pass ? positiveString : negativeString} ${jest.utils.printReceived(expected)}`);
	if (differenceString) resultString.concat('\n\n', differenceString);

	const message = () => resultString;
	return { actual: received, message, pass };
}

expect.extend({
	toAllEqual(received, expected) { return arrayExpectation(this, 'toAllEqual', received, expected); },
	toAllBeGreaterThanOrEqual(received, expected) { return arrayExpectation(this, 'toAllBeGreaterThanOrEqual', received, expected); },
	toAllBeGreaterThan(received, expected) { return arrayExpectation(this, 'toAllBeGreaterThan', received, expected); },
	toAllBeLessThanOrEqual(received, expected) { return arrayExpectation(this, 'toAllBeLessThanOrEqual', received, expected); },
	toAllBeLessThan(received, expected) { return arrayExpectation(this, 'toAllBeLessThan', received, expected); },
	toAllIncrease(received) { return arrayExpectation(this, 'toAllIncrease', received); },
	toAllDecrease(received) { return arrayExpectation(this, 'toAllDecrease', received); },
});

export default expect;
