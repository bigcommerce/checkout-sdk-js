"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var billing_1 = require("../billing");
var cart_1 = require("../cart");
var geography_1 = require("../geography");
var coupon_1 = require("../coupon");
var customer_1 = require("../customer");
var order_1 = require("../order");
var payment_1 = require("../payment");
var quote_1 = require("../quote");
var shipping_1 = require("../shipping");
var errors_mock_1 = require("../common/error/errors.mock");
var checkout_error_selector_1 = require("./checkout-error-selector");
describe('CheckoutErrorSelector', function () {
    var billingAddress;
    var cart;
    var countries;
    var coupon;
    var customer;
    var giftCertificate;
    var errorResponse;
    var errors;
    var order;
    var paymentMethods;
    var quote;
    var shippingAddress;
    var shippingCountries;
    var shippingOptions;
    beforeEach(function () {
        billingAddress = new billing_1.BillingAddressSelector();
        cart = new cart_1.CartSelector();
        countries = new geography_1.CountrySelector();
        coupon = new coupon_1.CouponSelector();
        customer = new customer_1.CustomerSelector();
        giftCertificate = new coupon_1.GiftCertificateSelector();
        order = new order_1.OrderSelector();
        paymentMethods = new payment_1.PaymentMethodSelector();
        quote = new quote_1.QuoteSelector();
        shippingAddress = new shipping_1.ShippingAddressSelector();
        shippingCountries = new shipping_1.ShippingCountrySelector();
        shippingOptions = new shipping_1.ShippingOptionSelector();
        errors = new checkout_error_selector_1.default(billingAddress, cart, countries, coupon, customer, giftCertificate, order, paymentMethods, quote, shippingAddress, shippingCountries, shippingOptions);
        errorResponse = errors_mock_1.getErrorResponseBody();
    });
    describe('#getLoadCheckoutError()', function () {
        it('returns error if there is an error when loading quote', function () {
            jest.spyOn(quote, 'getLoadError').mockReturnValue(errorResponse);
            expect(errors.getLoadCheckoutError()).toEqual(errorResponse);
            expect(quote.getLoadError).toHaveBeenCalled();
        });
        it('returns undefined if there is no error when loading quote', function () {
            jest.spyOn(quote, 'getLoadError').mockReturnValue();
            expect(errors.getLoadCheckoutError()).toEqual(undefined);
            expect(quote.getLoadError).toHaveBeenCalled();
        });
    });
    describe('#getSubmitOrderError()', function () {
        it('returns error if there is an error when submitting order', function () {
            jest.spyOn(order, 'getSubmitError').mockReturnValue(errorResponse);
            expect(errors.getSubmitOrderError()).toEqual(errorResponse);
            expect(order.getSubmitError).toHaveBeenCalled();
        });
        it('returns undefined if there is no error when submitting order', function () {
            jest.spyOn(order, 'getSubmitError').mockReturnValue();
            expect(errors.getSubmitOrderError()).toEqual(undefined);
            expect(order.getSubmitError).toHaveBeenCalled();
        });
    });
    describe('#getFinalizeOrderError()', function () {
        it('returns error if there is an error when finalizing order', function () {
            jest.spyOn(order, 'getFinalizeError').mockReturnValue(errorResponse);
            expect(errors.getFinalizeOrderError()).toEqual(errorResponse);
            expect(order.getFinalizeError).toHaveBeenCalled();
        });
        it('returns undefined if there is no error when finalizing order', function () {
            jest.spyOn(order, 'getFinalizeError').mockReturnValue();
            expect(errors.getFinalizeOrderError()).toEqual(undefined);
            expect(order.getFinalizeError).toHaveBeenCalled();
        });
    });
    describe('#getLoadOrderError()', function () {
        it('returns error if there is an error when loading order', function () {
            jest.spyOn(order, 'getLoadError').mockReturnValue(errorResponse);
            expect(errors.getLoadOrderError()).toEqual(errorResponse);
            expect(order.getLoadError).toHaveBeenCalled();
        });
        it('returns undefined if there is no error when loading order', function () {
            jest.spyOn(order, 'getLoadError').mockReturnValue();
            expect(errors.getLoadOrderError()).toEqual(undefined);
            expect(order.getLoadError).toHaveBeenCalled();
        });
    });
    describe('#getLoadCartError()', function () {
        it('returns error if there is an error when loading cart', function () {
            jest.spyOn(cart, 'getLoadError').mockReturnValue(errorResponse);
            expect(errors.getLoadCartError()).toEqual(errorResponse);
            expect(cart.getLoadError).toHaveBeenCalled();
        });
        it('returns undefined if there is no error when loading cart', function () {
            jest.spyOn(cart, 'getLoadError').mockReturnValue();
            expect(errors.getLoadCartError()).toEqual(undefined);
            expect(cart.getLoadError).toHaveBeenCalled();
        });
    });
    describe('#getVerifyCartError()', function () {
        it('returns error if there is an error when verifying cart', function () {
            jest.spyOn(cart, 'getVerifyError').mockReturnValue(errorResponse);
            expect(errors.getVerifyCartError()).toEqual(errorResponse);
            expect(cart.getVerifyError).toHaveBeenCalled();
        });
        it('returns undefined if there is no error when verifying cart', function () {
            jest.spyOn(cart, 'getVerifyError').mockReturnValue();
            expect(errors.getVerifyCartError()).toEqual(undefined);
            expect(cart.getVerifyError).toHaveBeenCalled();
        });
    });
    describe('#getLoadBillingCountriesError()', function () {
        it('returns error if there is an error when loading billing countries', function () {
            jest.spyOn(countries, 'getLoadError').mockReturnValue(errorResponse);
            expect(errors.getLoadBillingCountriesError()).toEqual(errorResponse);
            expect(countries.getLoadError).toHaveBeenCalled();
        });
        it('returns undefined if there is no error when loading billing countries', function () {
            jest.spyOn(countries, 'getLoadError').mockReturnValue();
            expect(errors.getLoadBillingCountriesError()).toEqual(undefined);
            expect(countries.getLoadError).toHaveBeenCalled();
        });
    });
    describe('#getLoadShippingCountriesError()', function () {
        it('returns error if there is an error when loading shipping countries', function () {
            jest.spyOn(shippingCountries, 'getLoadError').mockReturnValue(errorResponse);
            expect(errors.getLoadShippingCountriesError()).toEqual(errorResponse);
            expect(shippingCountries.getLoadError).toHaveBeenCalled();
        });
        it('returns undefined if there is no error when loading shipping countries', function () {
            jest.spyOn(shippingCountries, 'getLoadError').mockReturnValue();
            expect(errors.getLoadShippingCountriesError()).toEqual(undefined);
            expect(shippingCountries.getLoadError).toHaveBeenCalled();
        });
    });
    describe('#getLoadPaymentMethodsError()', function () {
        it('returns error if there is an error when loading payment methods', function () {
            jest.spyOn(paymentMethods, 'getLoadError').mockReturnValue(errorResponse);
            expect(errors.getLoadPaymentMethodsError()).toEqual(errorResponse);
            expect(paymentMethods.getLoadError).toHaveBeenCalled();
        });
        it('returns undefined if there is no error when loading payment methods', function () {
            jest.spyOn(paymentMethods, 'getLoadError').mockReturnValue();
            expect(errors.getLoadPaymentMethodsError()).toEqual(undefined);
            expect(paymentMethods.getLoadError).toHaveBeenCalled();
        });
    });
    describe('#getLoadPaymentMethodError()', function () {
        it('returns error if there is an error when loading payment method', function () {
            jest.spyOn(paymentMethods, 'getLoadMethodError').mockReturnValue(errorResponse);
            expect(errors.getLoadPaymentMethodError('braintree')).toEqual(errorResponse);
            expect(paymentMethods.getLoadMethodError).toHaveBeenCalledWith('braintree');
        });
        it('returns undefined if there is no error when loading payment method', function () {
            jest.spyOn(paymentMethods, 'getLoadMethodError').mockReturnValue();
            expect(errors.getLoadPaymentMethodError('braintree')).toEqual(undefined);
            expect(paymentMethods.getLoadMethodError).toHaveBeenCalledWith('braintree');
        });
    });
    describe('#getSignInError()', function () {
        it('returns error if there is an error when signing in', function () {
            jest.spyOn(customer, 'getSignInError').mockReturnValue(errorResponse);
            expect(errors.getSignInError()).toEqual(errorResponse);
            expect(customer.getSignInError).toHaveBeenCalled();
        });
        it('returns undefined if there is no error when signing in', function () {
            jest.spyOn(customer, 'getSignInError').mockReturnValue();
            expect(errors.getSignInError()).toEqual(undefined);
            expect(customer.getSignInError).toHaveBeenCalled();
        });
    });
    describe('#getSignOutError()', function () {
        it('returns error if there is an error when signing out', function () {
            jest.spyOn(customer, 'getSignOutError').mockReturnValue(errorResponse);
            expect(errors.getSignOutError()).toEqual(errorResponse);
            expect(customer.getSignOutError).toHaveBeenCalled();
        });
        it('returns undefined if there is no error when signing out', function () {
            jest.spyOn(customer, 'getSignOutError').mockReturnValue();
            expect(errors.getSignOutError()).toEqual(undefined);
            expect(customer.getSignOutError).toHaveBeenCalled();
        });
    });
    describe('#getLoadShippingOptionsError()', function () {
        it('returns error if there is an error when loading the shipping options', function () {
            jest.spyOn(shippingOptions, 'getLoadError').mockReturnValue(errorResponse);
            expect(errors.getLoadShippingOptionsError()).toEqual(errorResponse);
            expect(shippingOptions.getLoadError).toHaveBeenCalled();
        });
        it('returns undefined if there is NO error when loading the shipping options', function () {
            jest.spyOn(shippingOptions, 'getLoadError').mockReturnValue();
            expect(errors.getLoadShippingOptionsError()).toEqual(undefined);
            expect(shippingOptions.getLoadError).toHaveBeenCalled();
        });
    });
    describe('#getSelectShippingOptionError()', function () {
        it('returns error if there is an error when selecting the shipping options', function () {
            jest.spyOn(shippingOptions, 'getSelectError').mockReturnValue(errorResponse);
            expect(errors.getSelectShippingOptionError()).toEqual(errorResponse);
            expect(shippingOptions.getSelectError).toHaveBeenCalled();
        });
        it('returns undefined if there is NO error when selecting the shipping options', function () {
            jest.spyOn(shippingOptions, 'getSelectError').mockReturnValue();
            expect(errors.getSelectShippingOptionError()).toEqual(undefined);
            expect(shippingOptions.getSelectError).toHaveBeenCalled();
        });
    });
    describe('#getUpdateBillingAddressError()', function () {
        it('returns error if there is an error when updating the billing address', function () {
            jest.spyOn(billingAddress, 'getUpdateError').mockReturnValue(errorResponse);
            expect(errors.getUpdateBillingAddressError()).toEqual(errorResponse);
            expect(billingAddress.getUpdateError).toHaveBeenCalled();
        });
        it('returns undefined if there is NO error when updating the billing address', function () {
            jest.spyOn(billingAddress, 'getUpdateError').mockReturnValue();
            expect(errors.getUpdateBillingAddressError()).toEqual(undefined);
            expect(billingAddress.getUpdateError).toHaveBeenCalled();
        });
    });
    describe('#getUpdateShippingAddressError()', function () {
        it('returns error if there is an error when updating the shipping address', function () {
            jest.spyOn(shippingAddress, 'getUpdateError').mockReturnValue(errorResponse);
            expect(errors.getUpdateShippingAddressError()).toEqual(errorResponse);
            expect(shippingAddress.getUpdateError).toHaveBeenCalled();
        });
        it('returns undefined if there is NO error when updating the shipping address', function () {
            jest.spyOn(shippingAddress, 'getUpdateError').mockReturnValue();
            expect(errors.getUpdateShippingAddressError()).toEqual(undefined);
            expect(shippingAddress.getUpdateError).toHaveBeenCalled();
        });
    });
    describe('#getApplyCouponError()', function () {
        it('returns error if there is an error when updating the a coupon', function () {
            jest.spyOn(coupon, 'getApplyError').mockReturnValue(errorResponse);
            expect(errors.getApplyCouponError()).toEqual(errorResponse);
            expect(coupon.getApplyError).toHaveBeenCalled();
        });
        it('returns undefined if there is NO error when updating the a coupon', function () {
            jest.spyOn(coupon, 'getApplyError').mockReturnValue();
            expect(errors.getApplyCouponError()).toEqual(undefined);
            expect(coupon.getApplyError).toHaveBeenCalled();
        });
    });
    describe('#getRemoveCouponError()', function () {
        it('returns error if there is an error when updating the a coupon', function () {
            jest.spyOn(coupon, 'getRemoveError').mockReturnValue(errorResponse);
            expect(errors.getRemoveCouponError()).toEqual(errorResponse);
            expect(coupon.getRemoveError).toHaveBeenCalled();
        });
        it('returns undefined if there is NO error when updating the a coupon', function () {
            jest.spyOn(coupon, 'getRemoveError').mockReturnValue();
            expect(errors.getRemoveCouponError()).toEqual(undefined);
            expect(coupon.getRemoveError).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=checkout-error-selector.spec.js.map