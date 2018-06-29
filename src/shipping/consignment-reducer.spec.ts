import { createAction } from '@bigcommerce/data-store';

import { CheckoutActionType } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';

import { ConsignmentState } from '.';
import { ConsignmentActionType } from './consignment-actions';
import consignmentReducer from './consignment-reducer';

describe('consignmentReducer', () => {
    let initialState: ConsignmentState;

    beforeEach(() => {
        initialState = {
            statuses: {},
            errors: {},
        };
    });

    it('returns new data when checkout is loaded', () => {
        const action = createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckout());

        expect(consignmentReducer(initialState, action)).toEqual({
            data: action.payload && action.payload.consignments,
            errors: {
                loadError: undefined,
            },
            statuses: {
                isLoading: false,
            },
        });
    });

    it('returns error when checkout fails to load', () => {
        const action = createAction(CheckoutActionType.LoadCheckoutFailed, new Error());

        expect(consignmentReducer(initialState, action)).toEqual({
            data: undefined,
            errors: {
                loadError: action.payload,
            },
            statuses: {
                isLoading: false,
            },
        });
    });

    it('returns loading state when checkout is loading', () => {
        const action = createAction(CheckoutActionType.LoadCheckoutRequested);

        expect(consignmentReducer(initialState, action)).toEqual({
            data: undefined,
            errors: {
                loadError: undefined,
            },
            statuses: {
                isLoading: true,
            },
        });
    });

    it('returns new data when consignment is created', () => {
        const action = createAction(ConsignmentActionType.CreateConsignmentsSucceeded, getCheckout());

        expect(consignmentReducer(initialState, action)).toEqual({
            data: action.payload && action.payload.consignments,
            errors: {
                createError: undefined,
            },
            statuses: {
                isCreating: false,
            },
        });
    });

    it('returns loading state when creating consignment', () => {
        const action = createAction(ConsignmentActionType.CreateConsignmentsRequested);

        expect(consignmentReducer(initialState, action)).toEqual({
            data: undefined,
            errors: {
                createError: undefined,
            },
            statuses: {
                isCreating: true,
            },
        });
    });

    it('returns error when consignment creation fails', () => {
        const action = createAction(ConsignmentActionType.CreateConsignmentsFailed, new Error());

        expect(consignmentReducer(initialState, action)).toEqual({
            data: undefined,
            errors: {
                createError: action.payload,
            },
            statuses: {
                isCreating: false,
            },
        });
    });

    it('returns loading state when updating consignment', () => {
        const action = createAction(ConsignmentActionType.UpdateConsignmentRequested);

        expect(consignmentReducer(initialState, action)).toEqual({
            data: undefined,
            errors: {
                updateError: undefined,
            },
            statuses: {
                isUpdating: true,
            },
        });
    });

    it('returns new data when consignment is updated', () => {
        const action = createAction(ConsignmentActionType.UpdateConsignmentSucceeded, getCheckout());

        expect(consignmentReducer(initialState, action)).toEqual({
            data: action.payload && action.payload.consignments,
            errors: {
                updateError: undefined,
            },
            statuses: {
                isUpdating: false,
            },
        });
    });

    it('returns error when consignment update fails', () => {
        const action = createAction(ConsignmentActionType.UpdateConsignmentFailed, new Error());

        expect(consignmentReducer(initialState, action)).toEqual({
            data: undefined,
            errors: {
                updateError: action.payload,
            },
            statuses: {
                isUpdating: false,
            },
        });
    });
});
