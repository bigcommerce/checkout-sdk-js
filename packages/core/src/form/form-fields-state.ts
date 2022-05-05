import { FormFields } from './form-field';

export default interface FormFieldsState {
    data?: FormFields;
    errors: FormFieldsErrorState;
    statuses: FormFieldsStatusesState;
}

export interface FormFieldsErrorState {
    loadError?: Error;
}

export interface FormFieldsStatusesState {
    isLoading?: boolean;
}

export const DEFAULT_STATE: FormFieldsState = {
    errors: {},
    statuses: {},
};
