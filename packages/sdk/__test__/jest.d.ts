import { TypedArray } from "../src/types";

declare global {
	namespace jest {
		interface Matchers<R> {
			toAllEqual(expected: number | ArrayLike<number> | TypedArray): CustomMatcherResult;
			toAllBeGreaterThanOrEqual(expected: number | ArrayLike<number> | TypedArray): CustomMatcherResult;
			toAllBeGreaterThan(expected: number | ArrayLike<number> | TypedArray): CustomMatcherResult;
			toAllBeLessThanOrEqual(expected: number | ArrayLike<number> | TypedArray): CustomMatcherResult;
			toAllBeLessThan(expected: number | ArrayLike<number> | TypedArray): CustomMatcherResult;
			toAllIncrease(): CustomMatcherResult;
			toAllDecrease(): CustomMatcherResult;
		}
	}
}
