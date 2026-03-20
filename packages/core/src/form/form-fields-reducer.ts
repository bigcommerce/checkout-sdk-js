import { Action, combineReducers, composeReducers } from '@bigcommerce/data-store';

import { CheckoutHydrateAction, CheckoutHydrateActionType } from '../checkout';
import { clearErrorReducer } from '../common/error';
import { objectMerge, objectSet } from '../common/utility';

import { ExtraField } from './extra-field';
import { FormFields } from './form-field';
import { FormFieldsActionType, LoadFormFieldsAction } from './form-fields-actions';
import FormFieldsState, {
    DEFAULT_STATE,
    FormFieldsErrorState,
    FormFieldsStatusesState,
} from './form-fields-state';

export default function formFieldsReducer(
    state: FormFieldsState = DEFAULT_STATE,
    action: Action,
): FormFieldsState {
    const reducer = combineReducers<FormFieldsState>({
        data: dataReducer,
        extraFields: extraFieldsReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: FormFields | undefined,
    action: LoadFormFieldsAction | CheckoutHydrateAction,
): FormFields | undefined {
    switch (action.type) {
        case FormFieldsActionType.LoadFormFieldsSucceeded:
            return objectMerge(data, action.payload);

        case CheckoutHydrateActionType.HydrateInitialState:
            return objectMerge(data, action.payload?.formFields);

        default:
            return data;
    }
}

function extraFieldsReducer(
    extraFields: ExtraField[] | undefined,
    action: CheckoutHydrateAction,
): ExtraField[] | undefined {
    switch (action.type) {
        case CheckoutHydrateActionType.HydrateInitialState:
            return action.payload?.extraFields ?? extraFields;

        default:
            return extraFields;
    }
}

function errorsReducer(
    errors: FormFieldsErrorState = DEFAULT_STATE.errors,
    action: LoadFormFieldsAction,
): FormFieldsErrorState {
    switch (action.type) {
        case FormFieldsActionType.LoadFormFieldsSucceeded:
            return objectSet(errors, 'loadError', undefined);

        case FormFieldsActionType.LoadFormFieldsFailed:
            return objectSet(errors, 'loadError', action.payload);

        default:
            return errors;
    }
}

function statusesReducer(
    statuses: FormFieldsStatusesState = DEFAULT_STATE.statuses,
    action: LoadFormFieldsAction,
): FormFieldsStatusesState {
    switch (action.type) {
        case FormFieldsActionType.LoadFormFieldsRequested:
            return objectSet(statuses, 'isLoading', true);

        case FormFieldsActionType.LoadFormFieldsSucceeded:
        case FormFieldsActionType.LoadFormFieldsFailed:
            return objectSet(statuses, 'isLoading', false);

        default:
            return statuses;
    }
}
