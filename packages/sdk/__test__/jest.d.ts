declare namespace jest {
	interface Matchers<R> {
		toAllEqual(expected: number | ArrayLike<number>): CustomMatcherResult;
		toAllBeGreaterThanOrEqual(expected: number | ArrayLike<number>): CustomMatcherResult;
		toAllBeGreaterThan(expected: number | ArrayLike<number>): CustomMatcherResult;
		toAllBeLessThanOrEqual(expected: number | ArrayLike<number>): CustomMatcherResult;
		toAllBeLessThan(expected: number | ArrayLike<number>): CustomMatcherResult;
		toAllIncrease(): CustomMatcherResult;
		toAllDecrease(): CustomMatcherResult;
	}
}
