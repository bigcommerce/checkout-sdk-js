import { Action } from '@bigcommerce/data-store';

import { B2BToken } from './b2b-token-state';

export enum B2BTokenActionType {
    LoadB2BTokenRequested = 'LOAD_B2B_TOKEN_REQUESTED',
    LoadB2BTokenSucceeded = 'LOAD_B2B_TOKEN_SUCCEEDED',
    LoadB2BTokenFailed = 'LOAD_B2B_TOKEN_FAILED',
}

export type LoadB2BTokenAction =
    | LoadB2BTokenRequestedAction
    | LoadB2BTokenSucceededAction
    | LoadB2BTokenFailedAction;

export interface LoadB2BTokenRequestedAction extends Action {
    type: B2BTokenActionType.LoadB2BTokenRequested;
}

export interface LoadB2BTokenSucceededAction extends Action<B2BToken> {
    type: B2BTokenActionType.LoadB2BTokenSucceeded;
}

export interface LoadB2BTokenFailedAction extends Action<Error> {
    type: B2BTokenActionType.LoadB2BTokenFailed;
}
