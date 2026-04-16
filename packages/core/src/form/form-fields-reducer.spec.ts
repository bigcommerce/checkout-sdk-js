import { createAction, createErrorAction } from '@bigcommerce/data-store';

import { CheckoutHydrateActionType } from '../checkout';

import { FormFieldsActionType } from './form-fields-actions';
import { getAddressExtraFields, getFormFields } from './form.mock';

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

    it('hydrates extraFields from initial state', () => {
        const extraFields = { address: getAddressExtraFields(), order: [] };
        const action = createAction(CheckoutHydrateActionType.HydrateInitialState, {
            extraFields,
        });

        expect(formFieldsReducer(initialState, action)).toMatchObject({
            extraFields,
        });
    });

    it('keeps extraFields undefined when not in hydration payload', () => {
        const action = createAction(CheckoutHydrateActionType.HydrateInitialState, {
            formFields: getFormFields(),
        });

        const result = formFieldsReducer(initialState, action);

        expect(result.extraFields).toBeUndefined();
    });
});
