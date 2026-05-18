import { createAction, createErrorAction } from '@bigcommerce/data-store';

import B2BCompanyPaymentMethod from './b2b-company-payment-method';
import { B2BCompanyPaymentMethodActionType } from './b2b-company-payment-method-actions';
import b2bCompanyPaymentMethodReducer from './b2b-company-payment-method-reducer';
import B2BCompanyPaymentMethodState, { DEFAULT_STATE } from './b2b-company-payment-method-state';

describe('b2bCompanyPaymentMethodReducer()', () => {
    let initialState: B2BCompanyPaymentMethodState;

    beforeEach(() => {
        initialState = DEFAULT_STATE;
    });

    it('returns loading state on requested', () => {
        const action = createAction(
            B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsRequested,
        );
        const state = b2bCompanyPaymentMethodReducer(initialState, action);

        expect(state.statuses.isLoading).toBe(true);
        expect(state.errors.loadError).toBeUndefined();
    });

    it('stores methods and clears loading state on success', () => {
        const methods: B2BCompanyPaymentMethod[] = [
            { code: 'cheque', name: 'Cheque', isEnabled: true, paymentId: 1 },
        ];
        const action = createAction(
            B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsSucceeded,
            methods,
        );
        const state = b2bCompanyPaymentMethodReducer(initialState, action);

        expect(state.data).toEqual(methods);
        expect(state.statuses.isLoading).toBe(false);
        expect(state.errors.loadError).toBeUndefined();
    });

    it('stores error and clears loading state on failure', () => {
        const error = new Error('Failed to load company payment methods');
        const action = createErrorAction(
            B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsFailed,
            error,
        );
        const state = b2bCompanyPaymentMethodReducer(initialState, action);

        expect(state.errors.loadError).toBe(error);
        expect(state.statuses.isLoading).toBe(false);
        expect(state.data).toBeUndefined();
    });

    it('returns previous state for unknown actions', () => {
        const action = { type: 'UNKNOWN_ACTION' } as any;
        const state = b2bCompanyPaymentMethodReducer(initialState, action);

        expect(state).toEqual(initialState);
    });
});
