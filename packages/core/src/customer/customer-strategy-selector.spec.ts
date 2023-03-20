import { getErrorResponse } from '../common/http-request/responses.mock';

import CustomerStrategySelector, {
    createCustomerStrategySelectorFactory,
    CustomerStrategySelectorFactory,
} from './customer-strategy-selector';
import { getCustomerStrategyState } from './internal-customers.mock';

describe('CustomerStrategySelector', () => {
    let createCustomerStrategySelector: CustomerStrategySelectorFactory;
    let selector: CustomerStrategySelector;
    let state: any;

    beforeEach(() => {
        createCustomerStrategySelector = createCustomerStrategySelectorFactory();
        state = {
            customerStrategy: getCustomerStrategyState(),
        };
    });

    describe('#getSignInError()', () => {
        it('returns error if unable to sign in', () => {
            const signInError = getErrorResponse();

            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                errors: { signInError },
            });

            expect(selector.getSignInError()).toEqual(signInError);
        });

        it('does not returns error if able to sign in', () => {
            selector = createCustomerStrategySelector(state.customerStrategy);

            expect(selector.getSignInError()).toBeUndefined();
        });
    });

    describe('#getSignOutError()', () => {
        it('returns error if unable to sign out', () => {
            const signOutError = getErrorResponse();

            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                errors: { signOutError },
            });

            expect(selector.getSignOutError()).toEqual(signOutError);
        });

        it('does not returns error if able to sign out', () => {
            selector = createCustomerStrategySelector(state.customerStrategy);

            expect(selector.getSignOutError()).toBeUndefined();
        });
    });

    describe('#getExecutePaymentMethodCheckoutError()', () => {
        it('returns error if unable to execute payment method checkout', () => {
            const executePaymentMethodCheckoutError = getErrorResponse();

            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                errors: { executePaymentMethodCheckoutError },
            });

            expect(selector.getExecutePaymentMethodCheckoutError()).toEqual(
                executePaymentMethodCheckoutError,
            );
        });

        it('does not returns error if able to execute payment method checkout', () => {
            selector = createCustomerStrategySelector(state.customerStrategy);

            expect(selector.getExecutePaymentMethodCheckoutError()).toBeUndefined();
        });
    });

    describe('#getInitializeError()', () => {
        it('returns error if unable to initialize any method', () => {
            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                errors: {
                    initializeErrors: {
                        foobar: getErrorResponse(),
                    },
                    initializeMethodId: 'foobar',
                },
            });

            expect(selector.getInitializeError()).toEqual(getErrorResponse());
        });

        it('returns error if unable to initialize specific method', () => {
            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                errors: {
                    initializeErrors: {
                        foobar: getErrorResponse(),
                    },
                    initializeMethodId: 'foobar',
                },
            });

            expect(selector.getInitializeError('foobar')).toEqual(getErrorResponse());
            expect(selector.getInitializeError('bar')).toBeUndefined();
        });

        it('does not return error if able to initialize', () => {
            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                errors: {},
            });

            expect(selector.getInitializeError()).toBeUndefined();
        });
    });

    describe('#getWidgetInteractingError()', () => {
        it('returns error if unable to initialize any method', () => {
            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                errors: {
                    widgetInteractionError: getErrorResponse(),
                    widgetInteractionMethodId: 'foobar',
                },
            });

            expect(selector.getWidgetInteractionError()).toEqual(getErrorResponse());
        });

        it('returns error if unable to initialize specific method', () => {
            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                errors: {
                    widgetInteractionError: getErrorResponse(),
                    widgetInteractionMethodId: 'foobar',
                },
            });

            expect(selector.getWidgetInteractionError('foobar')).toEqual(getErrorResponse());
            expect(selector.getWidgetInteractionError('bar')).toBeUndefined();
        });

        it('does not return error if able to initialize', () => {
            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                errors: {},
            });

            expect(selector.getWidgetInteractionError()).toBeUndefined();
        });
    });

    describe('#isSigningIn()', () => {
        it('returns true if signing in', () => {
            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                statuses: { isSigningIn: true },
            });

            expect(selector.isSigningIn()).toBe(true);
        });

        it('returns false if not signing in', () => {
            selector = createCustomerStrategySelector(state.customerStrategy);

            expect(selector.isSigningIn()).toBe(false);
        });
    });

    describe('#isSigningOut()', () => {
        it('returns true if signing out', () => {
            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                statuses: { isSigningOut: true },
            });

            expect(selector.isSigningOut()).toBe(true);
        });

        it('returns false if not signing out', () => {
            selector = createCustomerStrategySelector(state.customerStrategy);

            expect(selector.isSigningOut()).toBe(false);
        });
    });

    describe('#isExecutingPaymentMethodCheckout()', () => {
        it('returns true if shopper executing payment method checkout', () => {
            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                statuses: { isExecutingPaymentMethodCheckout: true },
            });

            expect(selector.isExecutingPaymentMethodCheckout()).toBe(true);
        });

        it('returns false if shopper has not executed payment method checkout', () => {
            selector = createCustomerStrategySelector(state.customerStrategy);

            expect(selector.isExecutingPaymentMethodCheckout()).toBe(false);
        });
    });

    describe('#isInitializing()', () => {
        it('returns true if initializing any method', () => {
            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                statuses: { initializeMethodId: 'foobar', isInitializing: true },
            });

            expect(selector.isInitializing()).toBe(true);
        });

        it('returns true if initializing specific method', () => {
            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                statuses: { initializeMethodId: 'foobar', isInitializing: true },
            });

            expect(selector.isInitializing('foobar')).toBe(true);
            expect(selector.isInitializing('bar')).toBe(false);
        });

        it('returns false if not initializing method', () => {
            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                statuses: { initializeMethodId: undefined, isInitializing: false },
            });

            expect(selector.isInitializing()).toBe(false);
        });
    });

    describe('#isInitialized()', () => {
        it('returns true if method is initialized', () => {
            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                data: { foobar: { isInitialized: true } },
            });

            expect(selector.isInitialized('foobar')).toBe(true);
        });

        it('returns false if method is not initialized', () => {
            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                data: { foobar: { isInitialized: false } },
            });

            expect(selector.isInitialized('foobar')).toBe(false);
            expect(selector.isInitialized('bar')).toBe(false);
        });
    });

    describe('#isWidgetInteracting()', () => {
        it('returns true if any method is interacting with a widget', () => {
            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                statuses: { widgetInteractionMethodId: 'foobar', isWidgetInteracting: true },
            });

            expect(selector.isWidgetInteracting()).toBe(true);
        });

        it('returns true if a specific method is interacting with a widget', () => {
            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                statuses: { widgetInteractionMethodId: 'foobar', isWidgetInteracting: true },
            });

            expect(selector.isWidgetInteracting('foobar')).toBe(true);
            expect(selector.isWidgetInteracting('bar')).toBe(false);
        });

        it('returns false if not interacting with a widget', () => {
            selector = createCustomerStrategySelector({
                ...state.customerStrategy,
                statuses: { widgetInteractionMethodId: undefined, isWidgetInteracting: false },
            });

            expect(selector.isWidgetInteracting()).toBe(false);
        });
    });
});
