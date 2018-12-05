import { createAction, createErrorAction } from '@bigcommerce/data-store';

import { ShippingStrategyActionType } from './shipping-strategy-actions';
import shippingStrategyReducer from './shipping-strategy-reducer';
import ShippingStrategyState from './shipping-strategy-state';

describe('shippingStrategyReducer()', () => {
    let initialState: ShippingStrategyState;

    beforeEach(() => {
        initialState = {
            data: {},
            errors: {},
            statuses: {},
        };
    });

    it('returns pending flag as true if initializing shipping', () => {
        const action = createAction(
            ShippingStrategyActionType.InitializeRequested,
            undefined,
            { methodId: 'foobar' }
        );

        expect(shippingStrategyReducer(initialState, action).statuses).toEqual({
            initializeMethodId: 'foobar',
            isInitializing: true,
        });
    });

    it('returns pending flag as false if shipping has initialized successfully', () => {
        const action = createAction(
            ShippingStrategyActionType.InitializeSucceeded,
            undefined,
            { methodId: 'foobar' }
        );

        expect(shippingStrategyReducer(initialState, action).statuses).toEqual({
            initializeMethodId: undefined,
            isInitializing: false,
        });
    });

    it('returns initialization flag as true if customer has initialized successfully', () => {
        const action = createAction(
            ShippingStrategyActionType.InitializeSucceeded,
            undefined,
            { methodId: 'foobar' }
        );

        expect(shippingStrategyReducer(initialState, action).data).toEqual({
            foobar: { isInitialized: true },
        });
    });

    it('returns error if shipping has failed to initialize', () => {
        const action = createErrorAction(
            ShippingStrategyActionType.InitializeFailed,
            new Error(),
            { methodId: 'foobar' }
        );

        expect(shippingStrategyReducer(initialState, action).errors).toEqual({
            initializeMethodId: 'foobar',
            initializeError: action.payload,
        });

        expect(shippingStrategyReducer(initialState, action).statuses).toEqual({
            isInitializing: false,
        });
    });

    it('returns pending flag as true if deinitializing shipping', () => {
        const action = createAction(
            ShippingStrategyActionType.DeinitializeRequested,
            undefined,
            { methodId: 'foobar' }
        );

        expect(shippingStrategyReducer(initialState, action).statuses).toEqual({
            deinitializeMethodId: 'foobar',
            isDeinitializing: true,
        });
    });

    it('returns pending flag as false if shipping has deinitialized successfully', () => {
        const action = createAction(
            ShippingStrategyActionType.DeinitializeSucceeded,
            undefined,
            { methodId: 'foobar' }
        );

        expect(shippingStrategyReducer(initialState, action).statuses).toEqual({
            deinitializeMethodId: undefined,
            isDeinitializing: false,
        });
    });

    it('returns initialization flag as false if customer has deinitialized successfully', () => {
        const action = createAction(
            ShippingStrategyActionType.DeinitializeSucceeded,
            undefined,
            { methodId: 'foobar' }
        );

        expect(shippingStrategyReducer(initialState, action).data).toEqual({
            foobar: { isInitialized: false },
        });
    });

    it('returns error if shipping has failed to deinitialize', () => {
        const action = createErrorAction(
            ShippingStrategyActionType.DeinitializeFailed,
            new Error(),
            { methodId: 'foobar' }
        );

        expect(shippingStrategyReducer(initialState, action).errors).toEqual({
            deinitializeMethodId: 'foobar',
            deinitializeError: action.payload,
        });

        expect(shippingStrategyReducer(initialState, action).statuses).toEqual({
            isDeinitializing: false,
        });
    });

    it('returns pending flag as true if updating shipping address', () => {
        const action = createAction(
            ShippingStrategyActionType.UpdateAddressRequested,
            undefined,
            { methodId: 'foobar' }
        );

        expect(shippingStrategyReducer(initialState, action).statuses).toEqual({
            updateAddressMethodId: 'foobar',
            isUpdatingAddress: true,
        });
    });

    it('returns pending flag as false if shipping has updated address successfully', () => {
        const action = createAction(
            ShippingStrategyActionType.UpdateAddressSucceeded,
            undefined,
            { methodId: 'foobar' }
        );

        expect(shippingStrategyReducer(initialState, action).statuses).toEqual({
            updateAddressMethodId: undefined,
            isUpdatingAddress: false,
        });

        expect(shippingStrategyReducer(initialState, action).statuses).toEqual({
            isUpdatingAddress: false,
        });
    });

    it('returns error if shipping has failed to update address', () => {
        const action = createErrorAction(
            ShippingStrategyActionType.UpdateAddressFailed,
            new Error(),
            { methodId: 'foobar' }
        );

        expect(shippingStrategyReducer(initialState, action).errors).toEqual({
            updateAddressMethodId: 'foobar',
            updateAddressError: action.payload,
        });
    });

    it('returns pending flag as true if selecting shipping option', () => {
        const action = createAction(
            ShippingStrategyActionType.SelectOptionRequested,
            undefined,
            { methodId: 'foobar' }
        );

        expect(shippingStrategyReducer(initialState, action).statuses).toEqual({
            selectOptionMethodId: 'foobar',
            isSelectingOption: true,
        });
    });

    it('returns pending flag as false if shipping has selected shipping option successfully', () => {
        const action = createAction(
            ShippingStrategyActionType.SelectOptionSucceeded,
            undefined,
            { methodId: 'foobar' }
        );

        expect(shippingStrategyReducer(initialState, action).statuses).toEqual({
            selectOptionMethodId: undefined,
            isSelectingOption: false,
        });
    });

    it('returns error if shipping has failed to select option', () => {
        const action = createErrorAction(
            ShippingStrategyActionType.SelectOptionFailed,
            new Error(),
            { methodId: 'foobar' }
        );

        expect(shippingStrategyReducer(initialState, action).errors).toEqual({
            selectOptionMethodId: 'foobar',
            selectOptionError: action.payload,
        });

        expect(shippingStrategyReducer(initialState, action).statuses).toEqual({
            isSelectingOption: false,
        });
    });
});
