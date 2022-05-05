import { createAction } from '@bigcommerce/data-store';

import { CheckoutActionType } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';
import { CouponActionType } from '../coupon';

import { ConsignmentState } from '.';
import { ConsignmentActionType } from './consignment-actions';
import consignmentReducer from './consignment-reducer';

describe('consignmentReducer', () => {
    const id = 'foo';
    let initialState: ConsignmentState;

    beforeEach(() => {
        initialState = {
            errors: {
                updateError: {},
                updateShippingOptionError: {},
                deleteError: {},
            },
            statuses: {
                isUpdating: {},
                isUpdatingShippingOption: {},
                isDeleting: {},
            },
        };
    });

    it('returns new data when checkout is loaded', () => {
        const action = createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckout());

        expect(consignmentReducer(initialState, action)).toMatchObject({
            data: action.payload && action.payload.consignments,
        });
    });

    it('returns error when checkout fails to load', () => {
        const action = createAction(CheckoutActionType.LoadCheckoutFailed, new Error());

        expect(consignmentReducer(initialState, action)).toMatchObject({
            errors: {
                loadError: action.payload,
            },
        });
    });

    it('returns loading state when checkout is loading', () => {
        const action = createAction(CheckoutActionType.LoadCheckoutRequested);

        expect(consignmentReducer(initialState, action)).toMatchObject({
            statuses: {
                isLoading: true,
            },
        });
    });

    it('returns new data when consignment is created', () => {
        const action = createAction(ConsignmentActionType.CreateConsignmentsSucceeded, getCheckout(), { id });

        expect(consignmentReducer(initialState, action)).toMatchObject({
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
        const action = createAction(ConsignmentActionType.CreateConsignmentsRequested, null, { id });

        expect(consignmentReducer(initialState, action)).toMatchObject({
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

        expect(consignmentReducer(initialState, action)).toMatchObject({
            errors: {
                createError: action.payload,
            },
            statuses: {
                isCreating: false,
            },
        });
    });

    it('returns loading state when updating consignment', () => {
        const action = createAction(ConsignmentActionType.UpdateConsignmentRequested, null, { id });

        expect(consignmentReducer(initialState, action)).toMatchObject({
            statuses: {
                isUpdating: {
                    foo: true,
                },
            },
        });
    });

    it('returns new data when consignment is updated', () => {
        const action = createAction(ConsignmentActionType.UpdateConsignmentSucceeded, getCheckout(), { id });

        expect(consignmentReducer(initialState, action)).toMatchObject({
            data: action.payload && action.payload.consignments,
            errors: {
                updateError: {
                    foo: undefined,
                },
            },
            statuses: {
                isUpdating: {
                    foo: false,
                },
            },
        });
    });

    it('returns error when consignment update fails', () => {
        const action = createAction(ConsignmentActionType.UpdateConsignmentFailed, new Error(), { id });

        expect(consignmentReducer(initialState, action)).toMatchObject({
            errors: {
                updateError: {
                    foo: action.payload,
                },
            },
            statuses: {
                isUpdating: {
                    foo: false,
                },
            },
        });
    });

    it('returns loading state when deleting consignment', () => {
        const action = createAction(ConsignmentActionType.DeleteConsignmentRequested, null, { id });

        expect(consignmentReducer(initialState, action)).toMatchObject({
            statuses: {
                isDeleting: {
                    foo: true,
                },
            },
        });
    });

    it('returns new data when consignment is deleted', () => {
        const action = createAction(ConsignmentActionType.DeleteConsignmentSucceeded, getCheckout(), { id });

        expect(consignmentReducer(initialState, action)).toMatchObject({
            data: action.payload && action.payload.consignments,
            errors: {
                deleteError: {
                    foo: undefined,
                },
            },
            statuses: {
                isDeleting: {
                    foo: false,
                },
            },
        });
    });

    it('returns error when consignment delete fails', () => {
        const action = createAction(ConsignmentActionType.DeleteConsignmentFailed, new Error(), { id });

        expect(consignmentReducer(initialState, action)).toMatchObject({
            errors: {
                deleteError: {
                    foo: action.payload,
                },
            },
            statuses: {
                isDeleting: {
                    foo: false,
                },
            },
        });
    });

    it('returns loading state when updating shipping option', () => {
        const action = createAction(ConsignmentActionType.UpdateShippingOptionRequested, null, { id });

        expect(consignmentReducer(initialState, action)).toMatchObject({
            statuses: {
                isUpdatingShippingOption: {
                    foo: true,
                },
            },
        });
    });

    it('returns new data when shipping option is updated', () => {
        const action = createAction(ConsignmentActionType.UpdateShippingOptionSucceeded, getCheckout(), { id });

        expect(consignmentReducer(initialState, action)).toMatchObject({
            data: action.payload && action.payload.consignments,
            errors: {
                updateShippingOptionError: {
                    foo: undefined,
                },
            },
            statuses: {
                isUpdatingShippingOption: {
                    foo: false,
                },
            },
        });
    });

    it('returns error when shipping option update fails', () => {
        const action = createAction(ConsignmentActionType.UpdateShippingOptionFailed, new Error(), { id });

        expect(consignmentReducer(initialState, action)).toMatchObject({
            errors: {
                updateShippingOptionError: {
                    foo: action.payload,
                },
            },
            statuses: {
                isUpdatingShippingOption: {
                    foo: false,
                },
            },
        });
    });

    it('returns new data when coupon is applied', () => {
        const action = createAction(CouponActionType.ApplyCouponSucceeded, getCheckout());

        expect(consignmentReducer(initialState, action)).toMatchObject({
            data: action.payload && action.payload.consignments,
        });
    });

    it('returns new data when coupon is removed', () => {
        const action = createAction(CouponActionType.RemoveCouponSucceeded, getCheckout());

        expect(consignmentReducer(initialState, action)).toMatchObject({
            data: action.payload && action.payload.consignments,
        });
    });
});
