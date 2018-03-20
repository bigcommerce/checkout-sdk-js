import { createAction, createErrorAction } from '@bigcommerce/data-store';

import { PaymentStrategyActionType } from './payment-strategy-actions';
import paymentStrategyReducer from './payment-strategy-reducer';
import PaymentStrategyState, { DEFAULT_STATE } from './payment-strategy-state';

describe('paymentStrategyReducer()', () => {
    let initialState: PaymentStrategyState;

    beforeEach(() => {
        initialState = DEFAULT_STATE;
    });

    it('returns pending flag as true if initializing payment', () => {
        const action = createAction(
            PaymentStrategyActionType.InitializeRequested,
            undefined,
            { methodId: 'foobar' }
        );

        expect(paymentStrategyReducer(initialState, action).statuses).toEqual({
            initializeMethodId: 'foobar',
            isInitializing: true,
        });
    });

    it('returns pending flag as false if payment has initialized successfully', () => {
        const action = createAction(
            PaymentStrategyActionType.InitializeSucceeded,
            undefined,
            { methodId: 'foobar' }
        );

        expect(paymentStrategyReducer(initialState, action).statuses).toEqual({
            initializeMethodId: undefined,
            isInitializing: false,
        });
    });

    it('returns error if payment has failed to initialize', () => {
        const action = createErrorAction(
            PaymentStrategyActionType.InitializeFailed,
            new Error(),
            { methodId: 'foobar' }
        );

        expect(paymentStrategyReducer(initialState, action).errors).toEqual({
            initializeMethodId: 'foobar',
            initializeError: action.payload,
        });
    });

    it('returns pending flag as true if deinitializing payment', () => {
        const action = createAction(
            PaymentStrategyActionType.DeinitializeRequested,
            undefined,
            { methodId: 'foobar' }
        );

        expect(paymentStrategyReducer(initialState, action).statuses).toEqual({
            deinitializeMethodId: 'foobar',
            isDeinitializing: true,
        });
    });

    it('returns pending flag as false if payment has deinitialized successfully', () => {
        const action = createAction(
            PaymentStrategyActionType.DeinitializeSucceeded,
            undefined,
            { methodId: 'foobar' }
        );

        expect(paymentStrategyReducer(initialState, action).statuses).toEqual({
            deinitializeMethodId: undefined,
            isDeinitializing: false,
        });
    });

    it('returns error if payment has failed to deinitialize', () => {
        const action = createErrorAction(
            PaymentStrategyActionType.DeinitializeFailed,
            new Error(),
            { methodId: 'foobar' }
        );

        expect(paymentStrategyReducer(initialState, action).errors).toEqual({
            deinitializeMethodId: 'foobar',
            deinitializeError: action.payload,
        });
    });

    it('returns pending flag as true if executing payment', () => {
        const action = createAction(
            PaymentStrategyActionType.ExecuteRequested,
            undefined,
            { methodId: 'foobar' }
        );

        expect(paymentStrategyReducer(initialState, action).statuses).toEqual({
            executeMethodId: 'foobar',
            isExecuting: true,
        });
    });

    it('returns pending flag as false if payment has executed successfully', () => {
        const action = createAction(
            PaymentStrategyActionType.ExecuteSucceeded,
            undefined,
            { methodId: 'foobar' }
        );

        expect(paymentStrategyReducer(initialState, action).statuses).toEqual({
            executeMethodId: undefined,
            isExecuting: false,
        });
    });

    it('returns error if payment has failed to execute', () => {
        const action = createErrorAction(
            PaymentStrategyActionType.ExecuteFailed,
            new Error(),
            { methodId: 'foobar' }
        );

        expect(paymentStrategyReducer(initialState, action).errors).toEqual({
            executeMethodId: 'foobar',
            executeError: action.payload,
        });
    });

    it('returns pending flag as true if finalizing payment', () => {
        const action = createAction(
            PaymentStrategyActionType.FinalizeRequested,
            undefined,
            { methodId: 'foobar' }
        );

        expect(paymentStrategyReducer(initialState, action).statuses).toEqual({
            finalizeMethodId: 'foobar',
            isFinalizing: true,
        });
    });

    it('returns pending flag as false if payment has finalized successfully', () => {
        const action = createAction(
            PaymentStrategyActionType.FinalizeSucceeded,
            undefined,
            { methodId: 'foobar' }
        );

        expect(paymentStrategyReducer(initialState, action).statuses).toEqual({
            finalizeMethodId: undefined,
            isFinalizing: false,
        });
    });

    it('returns error if payment has failed to finalize', () => {
        const action = createErrorAction(
            PaymentStrategyActionType.FinalizeFailed,
            new Error(),
            { methodId: 'foobar' }
        );

        expect(paymentStrategyReducer(initialState, action).errors).toEqual({
            finalizeMethodId: 'foobar',
            finalizeError: action.payload,
        });
    });
});
