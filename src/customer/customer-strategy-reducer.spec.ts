import { createAction, createErrorAction } from '@bigcommerce/data-store';

import { CustomerStrategyActionType } from './customer-strategy-actions';
import customerStrategyReducer from './customer-strategy-reducer';
import CustomerStrategyState from './customer-strategy-state';

describe('customerStrategyReducer()', () => {
    let initialState: CustomerStrategyState;

    beforeEach(() => {
        initialState = {
            data: {},
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
            initializeMethodId: 'foobar',
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
            initializeMethodId: undefined,
            isInitializing: false,
        });
    });

    it('returns initialization flag as true if customer has initialized successfully', () => {
        const action = createAction(
            CustomerStrategyActionType.InitializeSucceeded,
            undefined,
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).data).toEqual({
            foobar: { isInitialized: true },
        });
    });

    it('returns error if customer has failed to initialize', () => {
        const action = createErrorAction(
            CustomerStrategyActionType.InitializeFailed,
            new Error(),
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).errors).toEqual({
            initializeMethodId: 'foobar',
            initializeError: action.payload,
        });

        expect(customerStrategyReducer(initialState, action).statuses).toEqual({
            isInitializing: false,
        });
    });

    it('returns pending flag as true if deinitializing customer', () => {
        const action = createAction(
            CustomerStrategyActionType.DeinitializeRequested,
            undefined,
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).statuses).toEqual({
            deinitializeMethodId: 'foobar',
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
            deinitializeMethodId: undefined,
            isDeinitializing: false,
        });
    });

    it('returns initialization flag as false if customer has deinitialized successfully', () => {
        const action = createAction(
            CustomerStrategyActionType.DeinitializeSucceeded,
            undefined,
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).data).toEqual({
            foobar: { isInitialized: false },
        });
    });

    it('returns error if customer has failed to deinitialize', () => {
        const action = createErrorAction(
            CustomerStrategyActionType.DeinitializeFailed,
            new Error(),
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).errors).toEqual({
            deinitializeMethodId: 'foobar',
            deinitializeError: action.payload,
        });

        expect(customerStrategyReducer(initialState, action).statuses).toEqual({
            isDeinitializing: false,
        });
    });

    it('returns pending flag as true if signing in customer', () => {
        const action = createAction(
            CustomerStrategyActionType.SignInRequested,
            undefined,
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).statuses).toEqual({
            signInMethodId: 'foobar',
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
            signInMethodId: undefined,
            isSigningIn: false,
        });

        expect(customerStrategyReducer(initialState, action).statuses).toEqual({
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
            signInMethodId: 'foobar',
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
            signOutMethodId: 'foobar',
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
            signOutMethodId: undefined,
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
            signOutMethodId: 'foobar',
            signOutError: action.payload,
        });

        expect(customerStrategyReducer(initialState, action).statuses).toEqual({
            isSigningOut: false,
        });
    });

    it('returns pending flag as true if interacting with widget', () => {
        const action = createAction(
            CustomerStrategyActionType.WidgetInteractionStarted,
            undefined,
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).statuses).toEqual({
            widgetInteractionMethodId: 'foobar',
            isWidgetInteracting: true,
        });
    });

    it('returns pending flag as false if interacting with widget has finished', () => {
        const action = createAction(
            CustomerStrategyActionType.WidgetInteractionFinished,
            undefined,
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).statuses).toEqual({
            widgetInteractionMethodId: undefined,
            isWidgetInteracting: false,
        });
    });

    it('returns error if widget interaction has failed', () => {
        const action = createErrorAction(
            CustomerStrategyActionType.WidgetInteractionFailed,
            new Error(),
            { methodId: 'foobar' }
        );

        expect(customerStrategyReducer(initialState, action).errors).toEqual({
            widgetInteractionMethodId: 'foobar',
            widgetInteractionError: action.payload,
        });

        expect(customerStrategyReducer(initialState, action).statuses).toEqual({
            isWidgetInteracting: false,
        });
    });
});
