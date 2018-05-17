import { BillingAddressActionTypes } from '../billing/billing-address-actions';
import * as cartActionTypes from '../cart/cart-action-types';
import { CheckoutActionType } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';
import { CouponActionType } from '../coupon/coupon-actions';
import * as giftCertificateActionTypes from '../coupon/gift-certificate-action-types';
import * as customerActionTypes from '../customer/customer-action-types';
import { getCustomerResponseBody } from '../customer/internal-customers.mock';
import { getQuoteResponseBody } from '../quote/internal-quotes.mock';
import * as quoteActionTypes from '../quote/quote-action-types';
import { ConsignmentActionTypes } from '../shipping/consignment-actions';
import cartReducer from './cart-reducer';
import { getCart } from './internal-carts.mock';

describe('cartReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {
            data: getCart(),
        };
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

    it('returns new data when checkout is loaded', () => {
        const action = {
            type: CheckoutActionType.LoadCheckoutSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when a consignment is updated', () => {
        const action = {
            type: ConsignmentActionTypes.UpdateConsignmentSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when consignments are created', () => {
        const action = {
            type: ConsignmentActionTypes.CreateConsignmentsSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when billing address gets updated', () => {
        const action = {
            type: BillingAddressActionTypes.UpdateBillingAddressSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when coupon gets applied', () => {
        const action = {
            type: CouponActionType.ApplyCouponSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when coupon gets removed', () => {
        const action = {
            type: CouponActionType.RemoveCouponSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when gift certificate gets applied', () => {
        const action = {
            type: giftCertificateActionTypes.APPLY_GIFT_CERTIFICATE_SUCCEEDED,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when gift certificate gets removed', () => {
        const action = {
            type: giftCertificateActionTypes.REMOVE_GIFT_CERTIFICATE_SUCCEEDED,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });
});
