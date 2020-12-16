/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */

import expect from './jestUtilities';
import { diffArray } from './testUtilities';
import WamParameterInfo from '../src/WamParameterInfo.js';
import WamParameterInterpolator from '../src/WamParameterInterpolator.js';

const samplesPerRenderQuantum = 128;

describe('WamParameterInterpolator Suite', () => {
	// TODO setup should be in a 'beforeEach' but TS can't resolve scope...
	let e = 0.0;
	const samplesPerInterpolation = 32; // Note that some tests will fail if this is made very large
	const startValue = -10;
	const endValue = 10;
	const infoA = new WamParameterInfo('A', { defaultValue: 0.5, minValue: startValue, maxValue: endValue });
	const infoB = new WamParameterInfo('B', { defaultValue: 3.0, minValue: startValue, maxValue: endValue });
	const testA = new WamParameterInterpolator(infoA, samplesPerInterpolation);
	const testB = new WamParameterInterpolator(infoB, samplesPerInterpolation);
	const initialKey = [samplesPerInterpolation, e].join('_');
	let startIndex = 0;
	let endIndex = 0;
	it('Should manage lifecycles of static lookup tables', () => {
		/* eslint-disable-next-line */
		const tables = WamParameterInterpolator['_tables'];
		/* eslint-disable-next-line */
		const tableReferences = WamParameterInterpolator['_tableReferences'];

		// Initial key and corresponding references should be present
		expect(tables[initialKey]).toBeDefined();
		// 2 references -- testA and testB share the table
		expect(tableReferences[initialKey].length).toEqual(2);

		e = 0.5;
		testA.setSkew(e);
		const additionalKey = [samplesPerInterpolation, e].join('_');

		// Initial key and corresponding references should still be present
		expect(tables[initialKey]).toBeDefined();
		// 1 reference, only testB uses this table
		expect(tableReferences[initialKey].length).toEqual(1);

		// Expected key and corresponding references should be present
		expect(tables[additionalKey]).toBeDefined();
		// 1 reference, only testA uses this table
		expect(tableReferences[additionalKey].length).toEqual(1);

		testA.setSkew(0);

		// Expected key and corresponding reference should no longer be present
		expect(tables[additionalKey]).toBeUndefined();
		expect(tableReferences[additionalKey]).toBeUndefined();

		// Initial key and corresponding references should still be present
		expect(tables[initialKey]).toBeDefined();
		// 2 references, testA and testB share the same table again
		expect(tableReferences[initialKey].length).toEqual(2);

		// Tables and references should be cleaned up after destroying instances
		testA.destroy();
		// 1 reference, testB still uses this table
		expect(tableReferences[initialKey].length).toEqual(1);
		testB.destroy();
		// 0 tables, 0 references, all instances destroyed
		expect(tables[initialKey]).toBeUndefined();
		expect(tableReferences[initialKey]).toBeUndefined();
	});

	it('Should be filled after call to setStartValue', () => {
		const expectedValue = 0;
		testA.setStartValue(expectedValue);
		expect(testA.values).toAllEqual(expectedValue);
	});

	it('Should only be done when filled with end value', () => {
		testA.setStartValue(startValue);
		testA.setEndValue(endValue);
		// No processing yet
		expect(testA.done).toEqual(false);

		startIndex = 0;
		endIndex = Math.round(samplesPerInterpolation / 3);
		testA.process(startIndex, endIndex);
		// Partial slice (less than samplesPerInterpolation)
		expect(testA.done).toEqual(false);

		startIndex = endIndex;
		endIndex += samplesPerInterpolation - endIndex;
		testA.process(startIndex, endIndex);
		// Should have finished interpolating, but not yet filled
		expect(testA.done).toEqual(false);

		startIndex = samplesPerInterpolation;
		endIndex = samplesPerRenderQuantum;
		testA.process(startIndex, endIndex);
		const rampedSlice = testA.values.slice(0, samplesPerInterpolation);
		const filledSlice = testA.values.slice(samplesPerInterpolation + 1, samplesPerRenderQuantum);
		// Verify values
		expect(rampedSlice).toAllIncrease();
		expect(filledSlice).toAllEqual(endValue);
		expect(testA.done).toEqual(false);

		startIndex = 0;
		testA.process(startIndex, endIndex);
		// Should have finishing filling values
		expect(testA.done).toEqual(true);
		expect(testA.values).toAllEqual(endValue);
	});

	it('Should continue from current value when setting end value during interpolation', () => {
		testA.setStartValue(startValue);
		testA.setEndValue(endValue);
		const partialInterpolation = Math.round(samplesPerInterpolation / 3);

		startIndex = 0;
		endIndex = partialInterpolation;
		testA.process(startIndex, endIndex);
		// Partial slice (less than samplesPerInterpolation)
		testA.setEndValue(startValue);

		startIndex = endIndex;
		endIndex += samplesPerInterpolation - endIndex;
		testA.process(startIndex, endIndex);
		// Should not have finished interpolating
		expect(testA.done).toEqual(false);

		startIndex = endIndex;
		endIndex = samplesPerRenderQuantum;
		testA.process(startIndex, endIndex);
		// Should have finished interpolating but not filled
		expect(testA.done).toEqual(false);

		startIndex = 0;
		endIndex = partialInterpolation;
		const increasingSlice = testA.values.slice(startIndex, endIndex);
		startIndex = endIndex;
		endIndex = startIndex + samplesPerInterpolation;
		const decreasingSlice = testA.values.slice(startIndex, endIndex);
		startIndex = endIndex;
		endIndex = samplesPerRenderQuantum;
		const filledSlice = testA.values.slice(startIndex, endIndex);
		// Verify values
		expect(increasingSlice).toAllIncrease();
		expect(decreasingSlice).toAllDecrease();
		expect(filledSlice).toAllEqual(startValue);
		expect(testA.done).toEqual(false);

		startIndex = 0;
		testA.process(startIndex, endIndex);
		// Should have finishing filling values
		expect(testA.done).toEqual(true);
		expect(testA.values).toAllEqual(startValue);
	});

	it('Should not interpolate discrete parameters', () => {
		const infoC = new WamParameterInfo('C', {
			defaultValue: startValue,
			minValue: startValue,
			maxValue: endValue,
			discreteStep: 1,
		});
		const testC = new WamParameterInterpolator(infoC, samplesPerInterpolation);

		startIndex = 0;
		endIndex = samplesPerInterpolation;
		testC.process(startIndex, endIndex);
		expect(testC.values.slice(startIndex, endIndex)).toAllEqual(startValue);

		startIndex = endIndex;
		endIndex += samplesPerInterpolation;
		testC.setEndValue(endValue);
		testC.process(startIndex, endIndex);
		expect(testC.values.slice(startIndex, endIndex)).toAllEqual(endValue);

		startIndex = endIndex;
		endIndex = samplesPerRenderQuantum;
		testC.process(startIndex, endIndex);
		expect(testC.values.slice(startIndex, endIndex)).toAllEqual(endValue);

		startIndex = 0;
		testC.process(startIndex, endIndex);
		expect(testC.values.slice(startIndex, endIndex)).toAllEqual(endValue);
	});

	it('Should work properly when interpolation period is greater than that of render quantum', () => {
		const longerInterpolationPeriod = Math.round(samplesPerRenderQuantum * Math.PI);
		const infoD = new WamParameterInfo('D', { defaultValue: startValue, minValue: startValue, maxValue: endValue });
		const testD = new WamParameterInterpolator(infoD, longerInterpolationPeriod);
		testD.setEndValue(endValue);

		startIndex = 0;
		endIndex = samplesPerRenderQuantum;
		const remainder = longerInterpolationPeriod % samplesPerRenderQuantum;
		let fullRenders = Math.floor(longerInterpolationPeriod / samplesPerRenderQuantum);
		while (fullRenders--) {
			testD.process(startIndex, endIndex);
			expect(testD.values).toAllIncrease();
		}
		expect(testD.done).toBe(false);
		testD.process(0, samplesPerRenderQuantum);
		expect(testD.done).toBe(false);
		expect(testD.values.slice(0, remainder)).toAllIncrease();
		expect(testD.values.slice(remainder, samplesPerRenderQuantum)).toAllEqual(endValue);
		testD.process(0, remainder);
		expect(testD.done).toBe(true);
		expect(testD.values).toAllEqual(endValue);
	});

	it('Should throw if skew is set out of range', () => {
		expect(() => new WamParameterInterpolator(infoA, 0, 1.001)).toThrow();
		expect(() => new WamParameterInterpolator(infoA, 0, -1.001)).toThrow();
		expect(() => new WamParameterInterpolator(infoA, 0, 1.0)).not.toThrow();
		expect(() => new WamParameterInterpolator(infoA, 0, -1.0)).not.toThrow();

		expect(() => testA.setSkew(1.001)).toThrow();
		expect(() => testA.setSkew(-1.001)).toThrow();
		expect(() => testA.setSkew(1.0)).not.toThrow();
		expect(() => testA.setSkew(-1.0)).not.toThrow();
		expect(() => testA.setSkew(0.0)).not.toThrow();
	});

	it('Should interpolate linearly when skew is zero', () => {
		startIndex = 0;
		endIndex = samplesPerInterpolation;
		testA.setStartValue(startValue);
		testA.setEndValue(endValue);
		testA.process(startIndex, endIndex);
		let diffs = diffArray(testA.values.slice(startIndex, endIndex));
		let expectedDelta = (endValue - startValue) / samplesPerInterpolation;
		expect(diffs).toAllEqual(expectedDelta);

		startIndex = endIndex;
		endIndex += samplesPerInterpolation;
		testA.process(startIndex, endIndex);
		expect(testA.values.slice(startIndex, endIndex)).toAllEqual(endValue);

		testA.setEndValue(startValue);
		startIndex = endIndex;
		endIndex += samplesPerInterpolation;
		testA.process(startIndex, endIndex);
		diffs = diffArray(testA.values.slice(startIndex, endIndex));
		expectedDelta *= -1;
		expect(diffs).toAllEqual(expectedDelta);

		startIndex = endIndex;
		endIndex += samplesPerInterpolation;
		testA.process(startIndex, endIndex);
		expect(testA.values.slice(startIndex, endIndex)).toAllEqual(startValue);
	});

	it('Should interpolate nonlinearly (convex) when skew is greater than zero', () => {
		startIndex = 0;
		endIndex = samplesPerInterpolation;
		testA.setSkew(0.667);
		testA.setStartValue(startValue);
		testA.setEndValue(endValue);
		testA.process(startIndex, endIndex);
		let diffs = diffArray(testA.values.slice(startIndex, endIndex));
		expect(diffs).toAllDecrease();

		startIndex = endIndex;
		endIndex += samplesPerInterpolation;
		testA.process(startIndex, endIndex);
		expect(testA.values.slice(startIndex, endIndex)).toAllEqual(endValue);

		testA.setEndValue(startValue);
		startIndex = endIndex;
		endIndex += samplesPerInterpolation;
		testA.process(startIndex, endIndex);
		diffs = diffArray(testA.values.slice(startIndex, endIndex));
		expect(diffs).toAllDecrease();

		startIndex = endIndex;
		endIndex += samplesPerInterpolation;
		testA.process(startIndex, endIndex);
		expect(testA.values.slice(startIndex, endIndex)).toAllEqual(startValue);
	});

	it('Should interpolate nonlinearly (concave) when skew is less than zero', () => {
		startIndex = 0;
		endIndex = samplesPerInterpolation;
		testA.setSkew(-0.667);
		testA.setStartValue(startValue);
		testA.setEndValue(endValue);
		testA.process(startIndex, endIndex);
		let diffs = diffArray(testA.values.slice(startIndex, endIndex));
		expect(diffs).toAllIncrease();

		startIndex = endIndex;
		endIndex += samplesPerInterpolation;
		testA.process(startIndex, endIndex);
		expect(testA.values.slice(startIndex, endIndex)).toAllEqual(endValue);

		testA.setEndValue(startValue);
		startIndex = endIndex;
		endIndex += samplesPerInterpolation;
		testA.process(startIndex, endIndex);
		diffs = diffArray(testA.values.slice(startIndex, endIndex));
		expect(diffs).toAllIncrease();

		startIndex = endIndex;
		endIndex += samplesPerInterpolation;
		testA.process(startIndex, endIndex);
		expect(testA.values.slice(startIndex, endIndex)).toAllEqual(startValue);
	});
});
