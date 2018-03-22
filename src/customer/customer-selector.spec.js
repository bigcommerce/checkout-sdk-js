import { getCustomerState, getCustomerStrategyState } from './internal-customers.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
import CustomerSelector from './customer-selector';

describe('CustomerSelector', () => {
    let customerSelector;
    let state;

    beforeEach(() => {
        state = {
            customer: getCustomerState(),
            customerStrategy: getCustomerStrategyState(),
        };
    });

    describe('#getCustomer()', () => {
        it('returns the current customer', () => {
            customerSelector = new CustomerSelector(state.customer, state.customerStrategy);

            expect(customerSelector.getCustomer()).toEqual(state.customer.data);
        });
    });

    describe('#getSignInError()', () => {
        it('returns error if unable to sign in', () => {
            const signInError = getErrorResponse();

            customerSelector = new CustomerSelector(state.customer, {
                ...state.customerStrategy,
                errors: { signInError },
            });

            expect(customerSelector.getSignInError()).toEqual(signInError);
        });

        it('does not returns error if able to sign in', () => {
            customerSelector = new CustomerSelector(state.customer, state.customerStrategy);

            expect(customerSelector.getSignInError()).toBeUndefined();
        });
    });

    describe('#getSignOutError()', () => {
        it('returns error if unable to sign out', () => {
            const signOutError = getErrorResponse();

            customerSelector = new CustomerSelector(state.customer, {
                ...state.customerStrategy,
                errors: { signOutError },
            });

            expect(customerSelector.getSignOutError()).toEqual(signOutError);
        });

        it('does not returns error if able to sign out', () => {
            customerSelector = new CustomerSelector(state.customer, state.customerStrategy);

            expect(customerSelector.getSignOutError()).toBeUndefined();
        });
    });

    describe('#getInitializeError()', () => {
        it('returns error if unable to initialize any method', () => {
            customerSelector = new CustomerSelector(state.customer, {
                ...state.customerStrategy,
                errors: { initializeError: getErrorResponse(), initializeMethodId: 'foobar' },
            });

            expect(customerSelector.getInitializeError()).toEqual(getErrorResponse());
        });

        it('returns error if unable to initialize specific method', () => {
            customerSelector = new CustomerSelector(state.customer, {
                ...state.customerStrategy,
                errors: { initializeError: getErrorResponse(), initializeMethodId: 'foobar' },
            });

            expect(customerSelector.getInitializeError('foobar')).toEqual(getErrorResponse());
            expect(customerSelector.getInitializeError('bar')).toEqual(undefined);
        });

        it('does not return error if able to initialize', () => {
            customerSelector = new CustomerSelector(state.customer, {
                ...state.customerStrategy,
                errors: {},
            });

            expect(customerSelector.getInitializeError()).toEqual(undefined);
        });
    });

    describe('#isSigningIn()', () => {
        it('returns true if signing in', () => {
            customerSelector = new CustomerSelector(state.customer, {
                ...state.customerStrategy,
                statuses: { isSigningIn: true },
            });

            expect(customerSelector.isSigningIn()).toEqual(true);
        });

        it('returns false if not signing in', () => {
            customerSelector = new CustomerSelector(state.customer, state.customerStrategy);

            expect(customerSelector.isSigningIn()).toEqual(false);
        });
    });

    describe('#isSigningOut()', () => {
        it('returns true if signing out', () => {
            customerSelector = new CustomerSelector(state.customer, {
                ...state.customerStrategy,
                statuses: { isSigningOut: true },
            });

            expect(customerSelector.isSigningOut()).toEqual(true);
        });

        it('returns false if not signing out', () => {
            customerSelector = new CustomerSelector(state.customer, state.customerStrategy);

            expect(customerSelector.isSigningOut()).toEqual(false);
        });
    });

    describe('#isInitializing()', () => {
        it('returns true if initializing any method', () => {
            customerSelector = new CustomerSelector(state.customer, {
                statuses: { initializeMethodId: 'foobar', isInitializing: true },
            });

            expect(customerSelector.isInitializing()).toEqual(true);
        });

        it('returns true if initializing specific method', () => {
            customerSelector = new CustomerSelector(state.customer, {
                statuses: { initializeMethodId: 'foobar', isInitializing: true },
            });

            expect(customerSelector.isInitializing('foobar')).toEqual(true);
            expect(customerSelector.isInitializing('bar')).toEqual(false);
        });

        it('returns false if not initializing method', () => {
            customerSelector = new CustomerSelector(state.customer, {
                statuses: { initializeMethodId: undefined, isInitializing: false },
            });

            expect(customerSelector.isInitializing()).toEqual(false);
        });
    });
});
