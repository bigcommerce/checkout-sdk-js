"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var billing_address_mock_1 = require("../billing/billing-address.mock");
var carts_mock_1 = require("./carts.mock");
var customers_mock_1 = require("../customer/customers.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var quotes_mock_1 = require("../quote/quotes.mock");
var shipping_address_mock_1 = require("../shipping/shipping-address.mock");
var shipping_options_mock_1 = require("../shipping/shipping-options.mock");
var billingAddressActionTypes = require("../billing/billing-address-action-types");
var cartActionTypes = require("../cart/cart-action-types");
var couponActionTypes = require("../coupon/coupon-action-types");
var customerActionTypes = require("../customer/customer-action-types");
var quoteActionTypes = require("../quote/quote-action-types");
var shippingAddressActionTypes = require("../shipping/shipping-address-action-types");
var shippingOptionActionTypes = require("../shipping/shipping-option-action-types");
var cart_reducer_1 = require("./cart-reducer");
describe('cartReducer()', function () {
    var initialState;
    beforeEach(function () {
        initialState = {};
    });
    it('returns new data when quote gets updated', function () {
        var response = quotes_mock_1.getQuoteResponseBody();
        var action = {
            type: quoteActionTypes.LOAD_QUOTE_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(cart_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.cart,
        }));
    });
    it('returns new data when the cart gets updated', function () {
        var cart = carts_mock_1.getCart();
        var action = {
            type: cartActionTypes.CART_UPDATED,
            payload: cart,
        };
        expect(cart_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: tslib_1.__assign({}, initialState.data, action.payload),
        }));
    });
    it('returns new data if customer has signed in successfully', function () {
        var action = {
            type: customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED,
            payload: customers_mock_1.getCustomerResponseBody().data,
        };
        expect(cart_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.cart,
        }));
    });
    it('returns new data if customer has signed out successfully', function () {
        var action = {
            type: customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED,
            payload: customers_mock_1.getCustomerResponseBody().data,
        };
        expect(cart_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.cart,
        }));
    });
    it('returns new data when shipping options gets updated', function () {
        var response = shipping_options_mock_1.getShippingOptionResponseBody();
        var action = {
            type: shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(cart_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.cart,
        }));
    });
    it('returns new data when shipping options gets selected', function () {
        var response = shipping_options_mock_1.getShippingOptionResponseBody();
        var action = {
            type: shippingOptionActionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(cart_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.cart,
        }));
    });
    it('returns true if the cart is valid', function () {
        var action = {
            type: cartActionTypes.VERIFY_CART_SUCCEEDED,
            payload: true,
        };
        expect(cart_reducer_1.default(initialState, action).meta.isValid).toEqual(true);
    });
    it('returns true if the cart is invalid', function () {
        var action = {
            type: cartActionTypes.VERIFY_CART_SUCCEEDED,
            payload: false,
        };
        expect(cart_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            meta: expect.objectContaining({
                isValid: false,
            }),
        }));
    });
    it('returns true if fetching a new quote', function () {
        var response = quotes_mock_1.getQuoteResponseBody();
        var action = {
            type: quoteActionTypes.LOAD_QUOTE_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(cart_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            meta: expect.objectContaining({
                isValid: true,
            }),
        }));
    });
    it('returns new data if fetching cart', function () {
        var action = {
            type: cartActionTypes.LOAD_CART_REQUESTED,
        };
        expect(cart_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isLoading: true },
        }));
    });
    it('returns new data if cart is fetched successfully', function () {
        var response = carts_mock_1.getCartResponseBody();
        var action = {
            type: cartActionTypes.LOAD_CART_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(cart_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            meta: expect.objectContaining({
                isValid: true,
            }),
            statuses: { isLoading: false },
        }));
    });
    it('returns new data if cart is not fetched successfully', function () {
        var response = errors_mock_1.getErrorResponseBody();
        var action = {
            type: cartActionTypes.LOAD_CART_FAILED,
            payload: response.data,
        };
        expect(cart_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        }));
    });
    it('returns new data when shipping address gets updated', function () {
        var action = {
            type: shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED,
            payload: shipping_address_mock_1.getShippingAddressResponseBody().data,
        };
        expect(cart_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.cart,
        }));
    });
    it('returns new data when billing address gets updated', function () {
        var action = {
            type: billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED,
            payload: billing_address_mock_1.getBillingAddressResponseBody().data,
        };
        expect(cart_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.cart,
        }));
    });
    it('returns new data when coupon gets applied', function () {
        var action = {
            type: couponActionTypes.APPLY_COUPON_SUCCEEDED,
            payload: carts_mock_1.getCartResponseBody().data,
        };
        expect(cart_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.cart,
        }));
    });
    it('returns new data when coupon gets removed', function () {
        var action = {
            type: couponActionTypes.APPLY_COUPON_SUCCEEDED,
            payload: carts_mock_1.getCartResponseBody().data,
        };
        expect(cart_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.cart,
        }));
    });
});
//# sourceMappingURL=cart-reducer.spec.js.map