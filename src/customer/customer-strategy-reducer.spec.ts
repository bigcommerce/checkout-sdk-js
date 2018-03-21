import { createAction, createErrorAction } from '@bigcommerce/data-store';

import { CustomerStrategyActionType } from './customer-strategy-actions';
import customerStrategyReducer from './customer-strategy-reducer';
import CustomerStrategyState from './customer-strategy-state';

describe('customerStrategyReducer()', () => {
    let initialState: CustomerStrategyState;

    beforeEach(() => {
        initialState = {
            errors: {},
            statuses: {},
        };
    });

    it('returns pending flag as true if initializing customer', () => {
        const action = createAction(
            CustomerStrategyActionType.InitializeRequested,
            undefined,
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).statuses).toEqual({
            initializingMethod: 'foobar',
            isInitializing: true,
        });
    });

    it('returns pending flag as false if customer has initialized successfully', () => {
        const action = createAction(
            CustomerStrategyActionType.InitializeSucceeded,
            undefined,
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).statuses).toEqual({
            initializingMethod: undefined,
            isInitializing: false,
        });
    });

    it('returns error if customer has failed to initialize', () => {
        const action = createErrorAction(
            CustomerStrategyActionType.InitializeFailed,
            new Error(),
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).errors).toEqual({
            initializeMethod: 'foobar',
            initializeError: action.payload,
        });
    });

    it('returns pending flag as true if deinitializing customer', () => {
        const action = createAction(
            CustomerStrategyActionType.DeinitializeRequested,
            undefined,
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).statuses).toEqual({
            deinitializingMethod: 'foobar',
            isDeinitializing: true,
        });
    });

    it('returns pending flag as false if customer has deinitialized successfully', () => {
        const action = createAction(
            CustomerStrategyActionType.DeinitializeSucceeded,
            undefined,
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).statuses).toEqual({
            deinitializingMethod: undefined,
            isDeinitializing: false,
        });
    });

    it('returns error if customer has failed to deinitialize', () => {
        const action = createErrorAction(
            CustomerStrategyActionType.DeinitializeFailed,
            new Error(),
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).errors).toEqual({
            deinitializeMethod: 'foobar',
            deinitializeError: action.payload,
        });
    });

    it('returns pending flag as true if signing in customer', () => {
        const action = createAction(
            CustomerStrategyActionType.SignInRequested,
            undefined,
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).statuses).toEqual({
            signingInMethod: 'foobar',
            isSigningIn: true,
        });
    });

    it('returns pending flag as false if customer has signed in successfully', () => {
        const action = createAction(
            CustomerStrategyActionType.SignInSucceeded,
            undefined,
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).statuses).toEqual({
            signingInMethod: undefined,
            isSigningIn: false,
        });
    });

    it('returns error if customer has failed to sign in', () => {
        const action = createErrorAction(
            CustomerStrategyActionType.SignInFailed,
            new Error(),
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).errors).toEqual({
            signInMethod: 'foobar',
            signInError: action.payload,
        });
    });

    it('returns pending flag as true if signing out customer', () => {
        const action = createAction(
            CustomerStrategyActionType.SignOutRequested,
            undefined,
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).statuses).toEqual({
            signingOutMethod: 'foobar',
            isSigningOut: true,
        });
    });

    it('returns pending flag as false if customer has signed out successfully', () => {
        const action = createAction(
            CustomerStrategyActionType.SignOutSucceeded,
            undefined,
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).statuses).toEqual({
            signingOutMethod: undefined,
            isSigningOut: false,
        });
    });

    it('returns error if customer has failed to sign out', () => {
        const action = createErrorAction(
            CustomerStrategyActionType.SignOutFailed,
            new Error(),
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).errors).toEqual({
            signOutMethod: 'foobar',
            signOutError: action.payload,
        });
    });
});
