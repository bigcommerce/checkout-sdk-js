import { getCheckout } from '../checkout/checkouts.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
import { getCustomerResponseBody } from '../customer/internal-customers.mock';
import { ConsignmentActionTypes } from '../shipping/consignment-actions';
import { getShippingOptions } from '../shipping/internal-shipping-options.mock';
import shippingOptionReducer from './shipping-option-reducer';
import { CheckoutActionType } from '../checkout';
import { CustomerActionType } from '../customer';

describe('shippingOptionReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {
            meta: {},
            data: {},
        };
    });

    it('returns new shipping option data if customer has signed out successfully', () => {
        const action = {
            type: CustomerActionType.SignOutCustomerSucceeded,
            payload: getCustomerResponseBody().data,
        };

        expect(shippingOptionReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.shippingOptions,
        }));
    });

    it('returns a loading state if fetching shipping options', () => {
        const action = {
            type: CheckoutActionType.LoadCheckoutRequested,
        };

        expect(shippingOptionReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { loadError: undefined },
            statuses: { isLoading: true },
        }));
    });

    it('returns new shipping option data if it loads correctly', () => {
        const action = {
            type: CheckoutActionType.LoadCheckoutSucceeded,
            payload: getCheckout(),
        };

        expect(shippingOptionReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getShippingOptions(),
        }));
    });

    it('returns an error state if shipping options can not be fetched', () => {
        const action = {
            type: CheckoutActionType.LoadCheckoutFailed,
            payload: getErrorResponse(),
        };

        expect(shippingOptionReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        }));
    });

    it('returns a new state when updating consignments', () => {
        const action = {
            type: ConsignmentActionTypes.UpdateConsignmentSucceeded,
            payload: getCheckout(),
        };

        expect(shippingOptionReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getShippingOptions(),
        }));
    });

    it('returns a new state when creating consignments', () => {
        const action = {
            type: ConsignmentActionTypes.CreateConsignmentsSucceeded,
            payload: getCheckout(),
        };

        expect(shippingOptionReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getShippingOptions(),
        }));
    });
});
