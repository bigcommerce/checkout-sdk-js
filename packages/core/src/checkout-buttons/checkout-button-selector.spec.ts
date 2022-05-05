import { createCheckoutButtonSelectorFactory, CheckoutButtonSelectorFactory } from './checkout-button-selector';
import CheckoutButtonState from './checkout-button-state';
import { getCheckoutButtonState } from './checkout-buttons.mock';
import { CheckoutButtonMethodType } from './strategies';

describe('CheckoutButtonSelector', () => {
    let state: CheckoutButtonState;
    let createCheckoutButtonSelector: CheckoutButtonSelectorFactory;

    describe('#isInitializing()', () => {
        beforeEach(() => {
            createCheckoutButtonSelector = createCheckoutButtonSelectorFactory();
            state = {
                ...getCheckoutButtonState(),
                statuses: {
                    braintreepaypal: {
                        isInitializing: true,
                    },
                },
            };
        });

        it('returns true if initializing checkout button', () => {
            const selector = createCheckoutButtonSelector(state);

            expect(selector.isInitializing(CheckoutButtonMethodType.BRAINTREE_PAYPAL)).toEqual(true);
        });

        it('returns true if initializing any checkout button', () => {
            const selector = createCheckoutButtonSelector(state);

            expect(selector.isInitializing()).toEqual(true);
        });

        it('returns false if not initializing checkout button', () => {
            const selector = createCheckoutButtonSelector(state);

            expect(selector.isInitializing(CheckoutButtonMethodType.BRAINTREE_PAYPAL_CREDIT)).toEqual(false);
        });

        it('returns false if not initializing any checkout button', () => {
            state = getCheckoutButtonState();

            const selector = createCheckoutButtonSelector(state);

            expect(selector.isInitializing()).toEqual(false);
        });
    });

    describe('#isInitialized()', () => {
        it('returns true if method is initialized', () => {
            const selector = createCheckoutButtonSelector({
                ...state,
                data: {
                    [CheckoutButtonMethodType.BRAINTREE_PAYPAL]: {
                        initializedContainers: { isInitialized: true },
                    },
                },
            });

            expect(selector.isInitialized(CheckoutButtonMethodType.BRAINTREE_PAYPAL)).toEqual(true);
        });

        it('returns false if method is not initialized', () => {
            const selector = createCheckoutButtonSelector({
                ...state,
                data: {
                    [CheckoutButtonMethodType.BRAINTREE_PAYPAL]: {
                        initializedContainers: { isInitialized: false },
                    },
                },
            });

            expect(selector.isInitialized(CheckoutButtonMethodType.BRAINTREE_PAYPAL)).toEqual(false);
            expect(selector.isInitialized(CheckoutButtonMethodType.PAYPALEXPRESS)).toEqual(false);
        });
    });

    describe('#isDeinitializing()', () => {
        beforeEach(() => {
            state = {
                ...getCheckoutButtonState(),
                statuses: {
                    braintreepaypal: {
                        isDeinitializing: true,
                    },
                },
            };
        });

        it('returns true if deinitializing checkout button', () => {
            const selector = createCheckoutButtonSelector(state);

            expect(selector.isDeinitializing(CheckoutButtonMethodType.BRAINTREE_PAYPAL)).toEqual(true);
        });

        it('returns true if deinitializing any checkout button', () => {
            const selector = createCheckoutButtonSelector(state);

            expect(selector.isDeinitializing()).toEqual(true);
        });

        it('returns false if not deinitializing checkout button', () => {
            const selector = createCheckoutButtonSelector(state);

            expect(selector.isDeinitializing(CheckoutButtonMethodType.BRAINTREE_PAYPAL_CREDIT)).toEqual(false);
        });

        it('returns false if not deinitializing any checkout button', () => {
            state = getCheckoutButtonState();

            const selector = createCheckoutButtonSelector(state);

            expect(selector.isDeinitializing()).toEqual(false);
        });
    });

    describe('#getInitializeError()', () => {
        let expectedError: Error;

        beforeEach(() => {
            expectedError = new Error('Unable to initialize foobar');

            state = {
                ...getCheckoutButtonState(),
                errors: {
                    braintreepaypal: {
                        initializeError: expectedError,
                    },
                },
            };
        });

        it('returns error if unable to initialize checkout button', () => {
            const selector = createCheckoutButtonSelector(state);

            expect(selector.getInitializeError(CheckoutButtonMethodType.BRAINTREE_PAYPAL)).toEqual(expectedError);
        });

        it('returns error if unable to initialize any checkout button', () => {
            const selector = createCheckoutButtonSelector(state);

            expect(selector.getInitializeError()).toEqual(expectedError);
        });

        it('returns undefined if able to initialize checkout button', () => {
            const selector = createCheckoutButtonSelector(state);

            expect(selector.getInitializeError(CheckoutButtonMethodType.BRAINTREE_PAYPAL_CREDIT)).toBeUndefined();
        });

        it('returns undefined if there are no issues initializing any checkout button', () => {
            state = getCheckoutButtonState();

            const selector = createCheckoutButtonSelector(state);

            expect(selector.getInitializeError()).toBeUndefined();
        });
    });

    describe('#getDeinitializeError()', () => {
        let expectedError: Error;

        beforeEach(() => {
            expectedError = new Error('Unable to deinitialize foobar');

            state = {
                ...getCheckoutButtonState(),
                errors: {
                    braintreepaypal: {
                        deinitializeError: expectedError,
                    },
                },
            };
        });

        it('returns error if unable to deinitialize checkout button', () => {
            const selector = createCheckoutButtonSelector(state);

            expect(selector.getDeinitializeError(CheckoutButtonMethodType.BRAINTREE_PAYPAL)).toEqual(expectedError);
        });

        it('returns error if unable to deinitialize any checkout button', () => {
            const selector = createCheckoutButtonSelector(state);

            expect(selector.getDeinitializeError()).toEqual(expectedError);
        });

        it('returns undefined if able to deinitialize checkout button', () => {
            const selector = createCheckoutButtonSelector(state);

            expect(selector.getDeinitializeError(CheckoutButtonMethodType.BRAINTREE_PAYPAL_CREDIT)).toBeUndefined();
        });

        it('returns undefined if there are no issues deinitializing any checkout button', () => {
            state = getCheckoutButtonState();

            const selector = createCheckoutButtonSelector(state);

            expect(selector.getDeinitializeError()).toBeUndefined();
        });
    });
});
