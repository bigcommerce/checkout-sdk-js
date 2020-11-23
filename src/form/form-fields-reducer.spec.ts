import { createAction, createErrorAction } from '@bigcommerce/data-store';

import { FormFieldsActionType } from './form-fields-actions';
import { getFormFields } from './form.mock';
import { formFieldsReducer, FormFieldsState } from './index';

describe('formFieldsReducer()', () => {
    let initialState: FormFieldsState;

    beforeEach(() => {
        initialState = {
            errors: {},
            statuses: {},
        };
    });

    it('loads the config', () => {
        const action = createAction(FormFieldsActionType.LoadFormFieldsRequested);

        expect(formFieldsReducer(initialState, action)).toMatchObject({
            statuses: { isLoading: true },
        });
    });

    it('returns config data if it was load successfully', () => {
        const action = createAction(FormFieldsActionType.LoadFormFieldsSucceeded, getFormFields());

        expect(formFieldsReducer(initialState, action)).toMatchObject({
            data: action.payload,
            statuses: { isLoading: false },
        });
    });

    it('returns an error if loading fails', () => {
        const action = createErrorAction(FormFieldsActionType.LoadFormFieldsFailed, new Error());

        expect(formFieldsReducer(initialState, action)).toMatchObject({
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        });
    });
});
