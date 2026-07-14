import { Action } from '@bigcommerce/data-store';

import { Checkout } from '../checkout';
import { RequestError } from '../common/error/errors';

export enum FeeActionType {
    ApplyFeesRequested = 'APPLY_FEES_REQUESTED',
    ApplyFeesSucceeded = 'APPLY_FEES_SUCCEEDED',
    ApplyFeesFailed = 'APPLY_FEES_FAILED',
}

export type FeeAction = ApplyFeesRequestedAction | ApplyFeesSucceededAction | ApplyFeesFailedAction;

export interface ApplyFeesRequestedAction extends Action {
    type: FeeActionType.ApplyFeesRequested;
}

export interface ApplyFeesSucceededAction extends Action<Checkout> {
    type: FeeActionType.ApplyFeesSucceeded;
}

export interface ApplyFeesFailedAction extends Action<RequestError> {
    type: FeeActionType.ApplyFeesFailed;
}
