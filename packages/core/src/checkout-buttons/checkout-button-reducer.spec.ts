import { createAction } from '@bigcommerce/data-store';

import { CheckoutButtonActionType } from './checkout-button-actions';
import checkoutButtonReducer from './checkout-button-reducer';
import CheckoutButtonState from './checkout-button-state';
import { getCheckoutButtonState } from './checkout-buttons.mock';
import { CheckoutButtonMethodType } from './strategies';

describe('checkoutButtonReducer', () => {
    let initialState: CheckoutButtonState;

    beforeEach(() => {
        initialState = getCheckoutButtonState();
    });

    it('returns new status state if button is initializing', () => {
        const methodId = CheckoutButtonMethodType.BRAINTREE_PAYPAL;
        const containerId = 'foobar';
        const action = createAction(CheckoutButtonActionType.InitializeButtonRequested, undefined, { methodId, containerId });
        const state = checkoutButtonReducer(initialState, action);

        expect(state.statuses).toEqual({ braintreepaypal: { isInitializing: true } });
    });

    it('returns new status state if button is initialized', () => {
        initialState = {
            ...initialState,
            statuses: {
                braintreepaypal: {
                    isInitializing: true,
                },
            },
        };

        const methodId = CheckoutButtonMethodType.BRAINTREE_PAYPAL;
        const containerId = 'foobar';
        const action = createAction(CheckoutButtonActionType.InitializeButtonSucceeded, undefined, { methodId, containerId });
        const state = checkoutButtonReducer(initialState, action);

        expect(state.statuses).toEqual({ braintreepaypal: { isInitializing: false } });
    });

    it('returns new initialization state if button is initialized', () => {
        const methodId = CheckoutButtonMethodType.BRAINTREE_PAYPAL;
        const containerId = 'foobar';
        const action = createAction(CheckoutButtonActionType.InitializeButtonSucceeded, undefined, { methodId, containerId });
        const state = checkoutButtonReducer(initialState, action);

        expect(state.data).toEqual({ braintreepaypal: { initializedContainers: { [containerId]: true } } });
    });

    it('returns new status state if deinitializing button', () => {
        const methodId = CheckoutButtonMethodType.BRAINTREE_PAYPAL;
        const action = createAction(CheckoutButtonActionType.DeinitializeButtonRequested, undefined, { methodId });
        const state = checkoutButtonReducer(initialState, action);

        expect(state.statuses).toEqual({ braintreepaypal: { isDeinitializing: true } });
    });

    it('returns new status state if button is deinitialized', () => {
        initialState = {
            ...initialState,
            statuses: {
                braintreepaypal: {
                    isDeinitializing: true,
                },
            },
        };

        const methodId = CheckoutButtonMethodType.BRAINTREE_PAYPAL;
        const action = createAction(CheckoutButtonActionType.DeinitializeButtonSucceeded, undefined, { methodId });
        const state = checkoutButtonReducer(initialState, action);

        expect(state.statuses).toEqual({ braintreepaypal: { isDeinitializing: false } });
    });

    it('returns new initialization state if button is deinitialized', () => {
        const methodId = CheckoutButtonMethodType.BRAINTREE_PAYPAL;
        const containerId = 'foobar';

        initialState = {
            ...initialState,
            data: {
                [methodId]: {
                    initializedContainers: {
                        [containerId]: true,
                    },
                },
            },
        };

        const action = createAction(CheckoutButtonActionType.DeinitializeButtonSucceeded, undefined, { methodId });
        const state = checkoutButtonReducer(initialState, action);

        expect(state.data).toEqual({ braintreepaypal: { initializedContainers: {} } });
    });

    it('returns new error state if button fails to initialize', () => {
        const error = new Error('Fail to initialize');
        const methodId = CheckoutButtonMethodType.BRAINTREE_PAYPAL;
        const containerId = 'foobar';
        const action = createAction(CheckoutButtonActionType.InitializeButtonFailed, error, { methodId, containerId });
        const state = checkoutButtonReducer(initialState, action);

        expect(state.errors).toEqual({ braintreepaypal: { initializeError: error } });
    });

    it('returns new error state if button no longer fails to initialize', () => {
        initialState = {
            ...initialState,
            errors: {
                braintreepaypal: {
                    initializeError: new Error('Fail to initialize'),
                },
            },
        };

        const methodId = CheckoutButtonMethodType.BRAINTREE_PAYPAL;
        const containerId = 'foobar';
        const action = createAction(CheckoutButtonActionType.InitializeButtonSucceeded, undefined, { methodId, containerId });
        const state = checkoutButtonReducer(initialState, action);

        expect(state.errors).toEqual({ braintreepaypal: { initializeError: undefined } });
    });

    it('returns new error state if button fails to deinitialize', () => {
        const error = new Error('Fail to initialize');
        const methodId = CheckoutButtonMethodType.BRAINTREE_PAYPAL;
        const containerId = 'foobar';
        const action = createAction(CheckoutButtonActionType.DeinitializeButtonFailed, error, { methodId, containerId });
        const state = checkoutButtonReducer(initialState, action);

        expect(state.errors).toEqual({ braintreepaypal: { deinitializeError: error } });
    });

    it('returns new error state if button no longer fails to deinitialize', () => {
        initialState = {
            ...initialState,
            errors: {
                braintreepaypal: {
                    deinitializeError: new Error('Fail to deinitialize'),
                },
            },
        };

        const methodId = CheckoutButtonMethodType.BRAINTREE_PAYPAL;
        const action = createAction(CheckoutButtonActionType.DeinitializeButtonSucceeded, undefined, { methodId });
        const state = checkoutButtonReducer(initialState, action);

        expect(state.errors).toEqual({ braintreepaypal: { deinitializeError: undefined } });
    });
});
