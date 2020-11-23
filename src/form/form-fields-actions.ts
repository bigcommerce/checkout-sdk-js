import { Action } from '@bigcommerce/data-store';

import { FormFields } from './form-field';

export enum FormFieldsActionType {
    LoadFormFieldsRequested = 'LOAD_FORM_FIELDS_REQUESTED',
    LoadFormFieldsSucceeded = 'LOAD_FORM_FIELDS_SUCCEEDED',
    LoadFormFieldsFailed = 'LOAD_FORM_FIELDS_FAILED',
}

export type LoadFormFieldsAction =
    LoadFormFieldsRequestedAction |
    LoadFormFieldsSucceededAction |
    LoadFormFieldsFailedAction;

export interface LoadFormFieldsRequestedAction extends Action {
    type: FormFieldsActionType.LoadFormFieldsRequested;
}

export interface LoadFormFieldsSucceededAction extends Action<FormFields> {
    type: FormFieldsActionType.LoadFormFieldsSucceeded;
}

export interface LoadFormFieldsFailedAction extends Action<Error> {
    type: FormFieldsActionType.LoadFormFieldsFailed;
}
