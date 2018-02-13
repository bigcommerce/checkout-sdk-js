import { createAction, createErrorAction } from '../../data-store';
import * as actionTypes from './shipping-action-types';
import shippingReducer from './shipping-reducer';
import ShippingActionCreator from './shipping-action-creator';

describe('shippingReducer', () => {
    const initialState = { errors: {}, statuses: {} };

    it('returns state with loading flag set to true if waiting to initialize', () => {
        const action = createAction(actionTypes.INITIALIZE_SHIPPING_REQUESTED, true, { methodId: 'foobar' });
        const state = shippingReducer(initialState, action);

        expect(state.statuses).toEqual({
            initializingMethod: 'foobar',
            isInitializing: true,
        });
    });

    it('returns state with no errors if waiting to initialize', () => {
        const action = createAction(actionTypes.INITIALIZE_SHIPPING_REQUESTED, undefined, { methodId: 'foobar' });
        const state = shippingReducer(initialState, action);

        expect(state.errors).toEqual({
            initializeError: undefined,
            initializeMethod: undefined,
        });
    });

    it('returns state with loading flag set to false if initialization has succeeded', () => {
        const action = createAction(actionTypes.INITIALIZE_SHIPPING_SUCCEEDED, true, { methodId: 'foobar' });
        const state = shippingReducer(initialState, action);

        expect(state.statuses).toEqual({
            initializingMethod: undefined,
            isInitializing: false,
        });
    });

    it('returns state with no errors if initialization has succeeded', () => {
        const action = createAction(actionTypes.INITIALIZE_SHIPPING_SUCCEEDED, true, { methodId: 'foobar' });
        const state = shippingReducer(initialState, action);

        expect(state.errors).toEqual({
            initializeError: undefined,
            initializeMethod: undefined,
        });
    });

    it('returns state with loading flag set to false if initialization has failed', () => {
        const action = createErrorAction(actionTypes.INITIALIZE_SHIPPING_FAILED, true, { methodId: 'foobar' });
        const state = shippingReducer(initialState, action);

        expect(state.statuses).toEqual({
            initializingMethod: undefined,
            isInitializing: false,
        });
    });

    it('returns state with error if initialization has failed', () => {
        const error = new Error();
        const action = createAction(actionTypes.INITIALIZE_SHIPPING_FAILED, error, { methodId: 'foobar' });
        const state = shippingReducer(initialState, action);

        expect(state.errors).toEqual({
            initializeError: error,
            initializeMethod: 'foobar',
        });
    });
});
