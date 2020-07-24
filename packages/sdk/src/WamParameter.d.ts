/* eslint-disable max-classes-per-file */
import { WamParameter, WamParameterInfo } from './api/types';

declare class WamParameterSab extends WamParameter {
	constructor(info: WamParameterInfo, array: Float32Array, index: number);
}

declare class WamParameterNoSab extends WamParameter {}

export { WamParameterNoSab, WamParameterSab };
