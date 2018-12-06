import { getErrorResponse } from '../common/http-request/responses.mock';

import CustomerStrategySelector from './customer-strategy-selector';
import { getCustomerStrategyState } from './internal-customers.mock';

describe('CustomerStrategySelector', () => {
    let selector: CustomerStrategySelector;
    let state: any;

    beforeEach(() => {
        state = {
            customerStrategy: getCustomerStrategyState(),
        };
    });

    describe('#getSignInError()', () => {
        it('returns error if unable to sign in', () => {
            const signInError = getErrorResponse();

            selector = new CustomerStrategySelector({
                ...state.customerStrategy,
                errors: { signInError },
            });

            expect(selector.getSignInError()).toEqual(signInError);
        });

        it('does not returns error if able to sign in', () => {
            selector = new CustomerStrategySelector(state.customerStrategy);

            expect(selector.getSignInError()).toBeUndefined();
        });
    });

    describe('#getSignOutError()', () => {
        it('returns error if unable to sign out', () => {
            const signOutError = getErrorResponse();

            selector = new CustomerStrategySelector({
                ...state.customerStrategy,
                errors: { signOutError },
            });

            expect(selector.getSignOutError()).toEqual(signOutError);
        });

        it('does not returns error if able to sign out', () => {
            selector = new CustomerStrategySelector(state.customerStrategy);

            expect(selector.getSignOutError()).toBeUndefined();
        });
    });

    describe('#getInitializeError()', () => {
        it('returns error if unable to initialize any method', () => {
            selector = new CustomerStrategySelector({
                ...state.customerStrategy,
                errors: { initializeError: getErrorResponse(), initializeMethodId: 'foobar' },
            });

            expect(selector.getInitializeError()).toEqual(getErrorResponse());
        });

        it('returns error if unable to initialize specific method', () => {
            selector = new CustomerStrategySelector({
                ...state.customerStrategy,
                errors: { initializeError: getErrorResponse(), initializeMethodId: 'foobar' },
            });

            expect(selector.getInitializeError('foobar')).toEqual(getErrorResponse());
            expect(selector.getInitializeError('bar')).toEqual(undefined);
        });

        it('does not return error if able to initialize', () => {
            selector = new CustomerStrategySelector({
                ...state.customerStrategy,
                errors: {},
            });

            expect(selector.getInitializeError()).toEqual(undefined);
        });
    });

    describe('#getWidgetInteractingError()', () => {
        it('returns error if unable to initialize any method', () => {
            selector = new CustomerStrategySelector({
                ...state.customerStrategy,
                errors: { widgetInteractionError: getErrorResponse(), widgetInteractionMethodId: 'foobar' },
            });

            expect(selector.getWidgetInteractionError()).toEqual(getErrorResponse());
        });

        it('returns error if unable to initialize specific method', () => {
            selector = new CustomerStrategySelector({
                ...state.customerStrategy,
                errors: { widgetInteractionError: getErrorResponse(), widgetInteractionMethodId: 'foobar' },
            });

            expect(selector.getWidgetInteractionError('foobar')).toEqual(getErrorResponse());
            expect(selector.getWidgetInteractionError('bar')).toEqual(undefined);
        });

        it('does not return error if able to initialize', () => {
            selector = new CustomerStrategySelector({
                ...state.customerStrategy,
                errors: {},
            });

            expect(selector.getWidgetInteractionError()).toEqual(undefined);
        });
    });

    describe('#isSigningIn()', () => {
        it('returns true if signing in', () => {
            selector = new CustomerStrategySelector({
                ...state.customerStrategy,
                statuses: { isSigningIn: true },
            });

            expect(selector.isSigningIn()).toEqual(true);
        });

        it('returns false if not signing in', () => {
            selector = new CustomerStrategySelector(state.customerStrategy);

            expect(selector.isSigningIn()).toEqual(false);
        });
    });

    describe('#isSigningOut()', () => {
        it('returns true if signing out', () => {
            selector = new CustomerStrategySelector({
                ...state.customerStrategy,
                statuses: { isSigningOut: true },
            });

            expect(selector.isSigningOut()).toEqual(true);
        });

        it('returns false if not signing out', () => {
            selector = new CustomerStrategySelector(state.customerStrategy);

            expect(selector.isSigningOut()).toEqual(false);
        });
    });

    describe('#isInitializing()', () => {
        it('returns true if initializing any method', () => {
            selector = new CustomerStrategySelector({
                ...state.customerStrategy,
                statuses: { initializeMethodId: 'foobar', isInitializing: true },
            });

            expect(selector.isInitializing()).toEqual(true);
        });

        it('returns true if initializing specific method', () => {
            selector = new CustomerStrategySelector({
                ...state.customerStrategy,
                statuses: { initializeMethodId: 'foobar', isInitializing: true },
            });

            expect(selector.isInitializing('foobar')).toEqual(true);
            expect(selector.isInitializing('bar')).toEqual(false);
        });

        it('returns false if not initializing method', () => {
            selector = new CustomerStrategySelector({
                ...state.customerStrategy,
                statuses: { initializeMethodId: undefined, isInitializing: false },
            });

            expect(selector.isInitializing()).toEqual(false);
        });
    });

    describe('#isInitialized()', () => {
        it('returns true if method is initialized', () => {
            selector = new CustomerStrategySelector({
                ...state.customerStrategy,
                data: { foobar: { isInitialized: true } },
            });

            expect(selector.isInitialized('foobar')).toEqual(true);
        });

        it('returns false if method is not initialized', () => {
            selector = new CustomerStrategySelector({
                ...state.customerStrategy,
                data: { foobar: { isInitialized: false } },
            });

            expect(selector.isInitialized('foobar')).toEqual(false);
            expect(selector.isInitialized('bar')).toEqual(false);
        });
    });

    describe('#isWidgetInteracting()', () => {
        it('returns true if any method is interacting with a widget', () => {
            selector = new CustomerStrategySelector({
                ...state.customerStrategy,
                statuses: { widgetInteractionMethodId: 'foobar', isWidgetInteracting: true },
            });

            expect(selector.isWidgetInteracting()).toEqual(true);
        });

        it('returns true if a specific method is interacting with a widget', () => {
            selector = new CustomerStrategySelector({
                ...state.customerStrategy,
                statuses: { widgetInteractionMethodId: 'foobar', isWidgetInteracting: true },
            });

            expect(selector.isWidgetInteracting('foobar')).toEqual(true);
            expect(selector.isWidgetInteracting('bar')).toEqual(false);
        });

        it('returns false if not interacting with a widget', () => {
            selector = new CustomerStrategySelector({
                ...state.customerStrategy,
                statuses: { widgetInteractionMethodId: undefined, isWidgetInteracting: false },
            });

            expect(selector.isWidgetInteracting()).toEqual(false);
        });
    });
});
