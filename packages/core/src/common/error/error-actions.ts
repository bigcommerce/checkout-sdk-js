import { Action } from '@bigcommerce/data-store';

export enum ErrorActionType {
    ClearError = 'CLEAR_ERROR',
}

export type ErrorAction = ClearErrorAction;

export interface ClearErrorAction extends Action {
    type: ErrorActionType.ClearError;
    payload: Error;
}
