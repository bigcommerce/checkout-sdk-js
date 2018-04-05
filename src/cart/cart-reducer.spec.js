import { getBillingAddressResponseBody } from '../billing/internal-billing-addresses.mock';
import { getCartResponseBody } from './internal-carts.mock';
import { getCustomerResponseBody } from '../customer/internal-customers.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
import { getQuoteResponseBody } from '../quote/internal-quotes.mock';
import { getShippingAddressResponseBody } from '../shipping/internal-shipping-addresses.mock';
import { getShippingOptionResponseBody } from '../shipping/internal-shipping-options.mock';
import * as billingAddressActionTypes from '../billing/billing-address-action-types';
import * as cartActionTypes from '../cart/cart-action-types';
import * as couponActionTypes from '../coupon/coupon-action-types';
import * as customerActionTypes from '../customer/customer-action-types';
import * as quoteActionTypes from '../quote/quote-action-types';
import * as shippingAddressActionTypes from '../shipping/shipping-address-action-types';
import * as shippingOptionActionTypes from '../shipping/shipping-option-action-types';
import cartReducer from './cart-reducer';

describe('cartReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {};
    });

    it('returns new data when quote gets updated', () => {
        const response = getQuoteResponseBody();
        const action = {
            type: quoteActionTypes.LOAD_QUOTE_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.cart,
        }));
    });

    it('returns new data if customer has signed in successfully', () => {
        const action = {
            type: customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED,
            payload: getCustomerResponseBody().data,
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.cart,
        }));
    });

    it('returns new data if customer has signed out successfully', () => {
        const action = {
            type: customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED,
            payload: getCustomerResponseBody().data,
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.cart,
        }));
    });

    it('returns new data when shipping options gets updated', () => {
        const response = getShippingOptionResponseBody();
        const action = {
            type: shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.cart,
        }));
    });

    it('returns new data when shipping options gets selected', () => {
        const response = getShippingOptionResponseBody();
        const action = {
            type: shippingOptionActionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.cart,
        }));
    });

    it('returns true if the cart is valid', () => {
        const action = {
            type: cartActionTypes.VERIFY_CART_SUCCEEDED,
            payload: true,
        };

        expect(cartReducer(initialState, action).meta.isValid).toEqual(true);
    });

    it('returns true if the cart is invalid', () => {
        const action = {
            type: cartActionTypes.VERIFY_CART_SUCCEEDED,
            payload: false,
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            meta: expect.objectContaining({
                isValid: false,
            }),
        }));
    });

    it('returns true if fetching a new quote', () => {
        const response = getQuoteResponseBody();
        const action = {
            type: quoteActionTypes.LOAD_QUOTE_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            meta: expect.objectContaining({
                isValid: true,
            }),
        }));
    });

    it('returns new data if fetching cart', () => {
        const action = {
            type: cartActionTypes.LOAD_CART_REQUESTED,
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isLoading: true },
        }));
    });

    it('returns new data if cart is fetched successfully', () => {
        const response = getCartResponseBody();
        const action = {
            type: cartActionTypes.LOAD_CART_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            meta: expect.objectContaining({
                isValid: true,
            }),
            statuses: { isLoading: false },
        }));
    });

    it('returns new data if cart is not fetched successfully', () => {
        const response = getErrorResponse();
        const action = {
            type: cartActionTypes.LOAD_CART_FAILED,
            payload: response.data,
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        }));
    });

    it('returns new data when shipping address gets updated', () => {
        const action = {
            type: shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED,
            payload: getShippingAddressResponseBody().data,
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.cart,
        }));
    });

    it('returns new data when billing address gets updated', () => {
        const action = {
            type: billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED,
            payload: getBillingAddressResponseBody().data,
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.cart,
        }));
    });

    it('returns new data when coupon gets applied', () => {
        const action = {
            type: couponActionTypes.APPLY_COUPON_SUCCEEDED,
            payload: getCartResponseBody().data,
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.cart,
        }));
    });

    it('returns new data when coupon gets removed', () => {
        const action = {
            type: couponActionTypes.APPLY_COUPON_SUCCEEDED,
            payload: getCartResponseBody().data,
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.cart,
        }));
    });
});
