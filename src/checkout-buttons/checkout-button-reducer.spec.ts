import { createAction } from '@bigcommerce/data-store';

import { CheckoutButtonActionType } from './checkout-button-actions';
import checkoutButtonReducer from './checkout-button-reducer';
import CheckoutButtonState from './checkout-button-state';
import { getCheckoutButtonState } from './checkout-buttons.mock';

describe('checkoutButtonReducer', () => {
    let initialState: CheckoutButtonState;

    beforeEach(() => {
        initialState = getCheckoutButtonState();
    });

    it('returns new status state if button is initializing', () => {
        const action = createAction(CheckoutButtonActionType.InitializeButtonRequested, undefined, { methodId: 'foobar' });
        const state = checkoutButtonReducer(initialState, action);

        expect(state.statuses).toEqual({ foobar: { isInitializing: true } });
    });

    it('returns new status state if button is initialized', () => {
        initialState = {
            ...initialState,
            statuses: {
                foobar: {
                    isInitializing: true,
                },
            },
        };

        const action = createAction(CheckoutButtonActionType.InitializeButtonSucceeded, undefined, { methodId: 'foobar' });
        const state = checkoutButtonReducer(initialState, action);

        expect(state.statuses).toEqual({ foobar: { isInitializing: false } });
    });

    it('returns new status state if deinitializing button', () => {
        const action = createAction(CheckoutButtonActionType.DeinitializeButtonRequested, undefined, { methodId: 'foobar' });
        const state = checkoutButtonReducer(initialState, action);

        expect(state.statuses).toEqual({ foobar: { isDeinitializing: true } });
    });

    it('returns new status state if button is deinitialized', () => {
        initialState = {
            ...initialState,
            statuses: {
                foobar: {
                    isDeinitializing: true,
                },
            },
        };

        const action = createAction(CheckoutButtonActionType.DeinitializeButtonSucceeded, undefined, { methodId: 'foobar' });
        const state = checkoutButtonReducer(initialState, action);

        expect(state.statuses).toEqual({ foobar: { isDeinitializing: false } });
    });

    it('returns new error state if button fails to initialize', () => {
        const error = new Error('Fail to initialize');
        const action = createAction(CheckoutButtonActionType.InitializeButtonFailed, error, { methodId: 'foobar' });
        const state = checkoutButtonReducer(initialState, action);

        expect(state.errors).toEqual({ foobar: { initializeError: error } });
    });

    it('returns new error state if button no longer fails to initialize', () => {
        initialState = {
            ...initialState,
            errors: {
                foobar: {
                    initializeError: new Error('Fail to initialize'),
                },
            },
        };

        const action = createAction(CheckoutButtonActionType.InitializeButtonSucceeded, undefined, { methodId: 'foobar' });
        const state = checkoutButtonReducer(initialState, action);

        expect(state.errors).toEqual({ foobar: { initializeError: undefined } });
    });

    it('returns new error state if button fails to deinitialize', () => {
        const error = new Error('Fail to initialize');
        const action = createAction(CheckoutButtonActionType.DeinitializeButtonFailed, error, { methodId: 'foobar' });
        const state = checkoutButtonReducer(initialState, action);

        expect(state.errors).toEqual({ foobar: { deinitializeError: error } });
    });

    it('returns new error state if button no longer fails to deinitialize', () => {
        initialState = {
            ...initialState,
            errors: {
                foobar: {
                    deinitializeError: new Error('Fail to deinitialize'),
                },
            },
        };

        const action = createAction(CheckoutButtonActionType.DeinitializeButtonSucceeded, undefined, { methodId: 'foobar' });
        const state = checkoutButtonReducer(initialState, action);

        expect(state.errors).toEqual({ foobar: { deinitializeError: undefined } });
    });
});
