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
var checkout_status_selector_1 = require("./checkout-status-selector");
describe('CheckoutStatusSelector', function () {
    var billingAddress;
    var cart;
    var countries;
    var coupon;
    var customer;
    var giftCertificate;
    var order;
    var paymentMethods;
    var quote;
    var shippingAddress;
    var shippingCountries;
    var shippingOption;
    var statuses;
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
        shippingOption = new shipping_1.ShippingOptionSelector();
        statuses = new checkout_status_selector_1.default(billingAddress, cart, countries, coupon, customer, giftCertificate, order, paymentMethods, quote, shippingAddress, shippingCountries, shippingOption);
    });
    describe('#isLoadingQuote()', function () {
        it('returns true if loading quote', function () {
            jest.spyOn(quote, 'isLoading').mockReturnValue(true);
            expect(statuses.isLoadingQuote()).toEqual(true);
            expect(quote.isLoading).toHaveBeenCalled();
        });
        it('returns false if loading quote', function () {
            jest.spyOn(quote, 'isLoading').mockReturnValue(false);
            expect(statuses.isLoadingQuote()).toEqual(false);
            expect(quote.isLoading).toHaveBeenCalled();
        });
    });
    describe('#isSubmittingOrder()', function () {
        it('returns true if submitting order', function () {
            jest.spyOn(order, 'isSubmitting').mockReturnValue(true);
            expect(statuses.isSubmittingOrder()).toEqual(true);
            expect(order.isSubmitting).toHaveBeenCalled();
        });
        it('returns false if submitting order', function () {
            jest.spyOn(order, 'isSubmitting').mockReturnValue(false);
            expect(statuses.isSubmittingOrder()).toEqual(false);
            expect(order.isSubmitting).toHaveBeenCalled();
        });
    });
    describe('#isFinalizingOrder()', function () {
        it('returns true if finalizing order', function () {
            jest.spyOn(order, 'isFinalizing').mockReturnValue(true);
            expect(statuses.isFinalizingOrder()).toEqual(true);
            expect(order.isFinalizing).toHaveBeenCalled();
        });
        it('returns false if finalizing order', function () {
            jest.spyOn(order, 'isFinalizing').mockReturnValue(false);
            expect(statuses.isFinalizingOrder()).toEqual(false);
            expect(order.isFinalizing).toHaveBeenCalled();
        });
    });
    describe('#isLoadingOrder()', function () {
        it('returns true if loading order', function () {
            jest.spyOn(order, 'isLoading').mockReturnValue(true);
            expect(statuses.isLoadingOrder()).toEqual(true);
            expect(order.isLoading).toHaveBeenCalled();
        });
        it('returns false if loading order', function () {
            jest.spyOn(order, 'isLoading').mockReturnValue(false);
            expect(statuses.isLoadingOrder()).toEqual(false);
            expect(order.isLoading).toHaveBeenCalled();
        });
    });
    describe('#isLoadingCart()', function () {
        it('returns true if loading cart', function () {
            jest.spyOn(cart, 'isLoading').mockReturnValue(true);
            expect(statuses.isLoadingCart()).toEqual(true);
            expect(cart.isLoading).toHaveBeenCalled();
        });
        it('returns false if loading cart', function () {
            jest.spyOn(cart, 'isLoading').mockReturnValue(false);
            expect(statuses.isLoadingCart()).toEqual(false);
            expect(cart.isLoading).toHaveBeenCalled();
        });
    });
    describe('#isVerifyingCart()', function () {
        it('returns true if verifying cart', function () {
            jest.spyOn(cart, 'isVerifying').mockReturnValue(true);
            expect(statuses.isVerifyingCart()).toEqual(true);
            expect(cart.isVerifying).toHaveBeenCalled();
        });
        it('returns false if verifying cart', function () {
            jest.spyOn(cart, 'isVerifying').mockReturnValue(false);
            expect(statuses.isVerifyingCart()).toEqual(false);
            expect(cart.isVerifying).toHaveBeenCalled();
        });
    });
    describe('#isLoadingBillingCountries()', function () {
        it('returns true if loading countries', function () {
            jest.spyOn(countries, 'isLoading').mockReturnValue(true);
            expect(statuses.isLoadingBillingCountries()).toEqual(true);
            expect(countries.isLoading).toHaveBeenCalled();
        });
        it('returns false if loading countries', function () {
            jest.spyOn(countries, 'isLoading').mockReturnValue(false);
            expect(statuses.isLoadingBillingCountries()).toEqual(false);
            expect(countries.isLoading).toHaveBeenCalled();
        });
    });
    describe('#isLoadingShippingCountries()', function () {
        it('returns true if loading shipping countries', function () {
            jest.spyOn(shippingCountries, 'isLoading').mockReturnValue(true);
            expect(statuses.isLoadingShippingCountries()).toEqual(true);
            expect(shippingCountries.isLoading).toHaveBeenCalled();
        });
        it('returns false if loading shipping countries', function () {
            jest.spyOn(shippingCountries, 'isLoading').mockReturnValue(false);
            expect(statuses.isLoadingShippingCountries()).toEqual(false);
            expect(shippingCountries.isLoading).toHaveBeenCalled();
        });
    });
    describe('#isLoadingPaymentMethods()', function () {
        it('returns true if loading payment methods', function () {
            jest.spyOn(paymentMethods, 'isLoading').mockReturnValue(true);
            expect(statuses.isLoadingPaymentMethods()).toEqual(true);
            expect(paymentMethods.isLoading).toHaveBeenCalled();
        });
        it('returns false if loading payment methods', function () {
            jest.spyOn(paymentMethods, 'isLoading').mockReturnValue(false);
            expect(statuses.isLoadingPaymentMethods()).toEqual(false);
            expect(paymentMethods.isLoading).toHaveBeenCalled();
        });
    });
    describe('#isLoadingPaymentMethod()', function () {
        it('returns true if loading payment method', function () {
            jest.spyOn(paymentMethods, 'isLoadingMethod').mockReturnValue(true);
            expect(statuses.isLoadingPaymentMethod('braintree')).toEqual(true);
            expect(paymentMethods.isLoadingMethod).toHaveBeenCalledWith('braintree');
        });
        it('returns false if loading payment methods', function () {
            jest.spyOn(paymentMethods, 'isLoadingMethod').mockReturnValue(false);
            expect(statuses.isLoadingPaymentMethod('braintree')).toEqual(false);
            expect(paymentMethods.isLoadingMethod).toHaveBeenCalledWith('braintree');
        });
    });
    describe('#isSigningIn()', function () {
        it('returns true if signing in', function () {
            jest.spyOn(customer, 'isSigningIn').mockReturnValue(true);
            expect(statuses.isSigningIn()).toEqual(true);
            expect(customer.isSigningIn).toHaveBeenCalled();
        });
        it('returns false if signing in', function () {
            jest.spyOn(customer, 'isSigningIn').mockReturnValue(false);
            expect(statuses.isSigningIn()).toEqual(false);
            expect(customer.isSigningIn).toHaveBeenCalled();
        });
    });
    describe('#isSigningOut()', function () {
        it('returns true if signing out', function () {
            jest.spyOn(customer, 'isSigningOut').mockReturnValue(true);
            expect(statuses.isSigningOut()).toEqual(true);
            expect(customer.isSigningOut).toHaveBeenCalled();
        });
        it('returns false if signing out', function () {
            jest.spyOn(customer, 'isSigningOut').mockReturnValue(false);
            expect(statuses.isSigningOut()).toEqual(false);
            expect(customer.isSigningOut).toHaveBeenCalled();
        });
    });
    describe('#isLoadingShippingOptions()', function () {
        it('returns true if loading shipping options', function () {
            jest.spyOn(shippingOption, 'isLoading').mockReturnValue(true);
            expect(statuses.isLoadingShippingOptions()).toEqual(true);
            expect(shippingOption.isLoading).toHaveBeenCalled();
        });
        it('returns false if not loading shipping options', function () {
            jest.spyOn(shippingOption, 'isLoading').mockReturnValue(false);
            expect(statuses.isLoadingShippingOptions()).toEqual(false);
            expect(shippingOption.isLoading).toHaveBeenCalled();
        });
    });
    describe('#isSelectingShippingOption()', function () {
        it('returns true if selecting shipping options', function () {
            jest.spyOn(shippingOption, 'isSelecting').mockReturnValue(true);
            expect(statuses.isSelectingShippingOption()).toEqual(true);
            expect(shippingOption.isSelecting).toHaveBeenCalled();
        });
        it('returns false if not selecting shipping options', function () {
            jest.spyOn(shippingOption, 'isSelecting').mockReturnValue(false);
            expect(statuses.isSelectingShippingOption()).toEqual(false);
            expect(shippingOption.isSelecting).toHaveBeenCalled();
        });
    });
    describe('#isUpdatingBillingAddress()', function () {
        it('returns true if updating billing address', function () {
            jest.spyOn(billingAddress, 'isUpdating').mockReturnValue(true);
            expect(statuses.isUpdatingBillingAddress()).toEqual(true);
            expect(billingAddress.isUpdating).toHaveBeenCalled();
        });
        it('returns false if not updating billing address', function () {
            jest.spyOn(billingAddress, 'isUpdating').mockReturnValue(false);
            expect(statuses.isUpdatingBillingAddress()).toEqual(false);
            expect(billingAddress.isUpdating).toHaveBeenCalled();
        });
    });
    describe('#isUpdatingShippingAddress()', function () {
        it('returns true if updating shipping address', function () {
            jest.spyOn(shippingAddress, 'isUpdating').mockReturnValue(true);
            expect(statuses.isUpdatingShippingAddress()).toEqual(true);
            expect(shippingAddress.isUpdating).toHaveBeenCalled();
        });
        it('returns false if not updating shipping address', function () {
            jest.spyOn(shippingAddress, 'isUpdating').mockReturnValue(false);
            expect(statuses.isUpdatingShippingAddress()).toEqual(false);
            expect(shippingAddress.isUpdating).toHaveBeenCalled();
        });
    });
    describe('#isApplyingCoupon()', function () {
        it('returns true if applying a coupon', function () {
            jest.spyOn(coupon, 'isApplying').mockReturnValue(true);
            expect(statuses.isApplyingCoupon()).toEqual(true);
            expect(coupon.isApplying).toHaveBeenCalled();
        });
        it('returns false if not applying a coupon', function () {
            jest.spyOn(coupon, 'isApplying').mockReturnValue(false);
            expect(statuses.isApplyingCoupon()).toEqual(false);
            expect(coupon.isApplying).toHaveBeenCalled();
        });
    });
    describe('#isRemovingCoupon()', function () {
        it('returns true if removing a coupon', function () {
            jest.spyOn(coupon, 'isRemoving').mockReturnValue(true);
            expect(statuses.isRemovingCoupon()).toEqual(true);
            expect(coupon.isRemoving).toHaveBeenCalled();
        });
        it('returns false if not removing a coupon', function () {
            jest.spyOn(coupon, 'isRemoving').mockReturnValue(false);
            expect(statuses.isRemovingCoupon()).toEqual(false);
            expect(coupon.isRemoving).toHaveBeenCalled();
        });
    });
    describe('#isApplyingGiftCertificate()', function () {
        it('returns true if applying a gift certificate', function () {
            jest.spyOn(giftCertificate, 'isApplying').mockReturnValue(true);
            expect(statuses.isApplyingGiftCertificate()).toEqual(true);
            expect(giftCertificate.isApplying).toHaveBeenCalled();
        });
        it('returns false if not applying a gift certificate', function () {
            jest.spyOn(giftCertificate, 'isApplying').mockReturnValue(false);
            expect(statuses.isApplyingGiftCertificate()).toEqual(false);
            expect(giftCertificate.isApplying).toHaveBeenCalled();
        });
    });
    describe('#isRemovingGiftCertificate()', function () {
        it('returns true if removing a gift certificate', function () {
            jest.spyOn(giftCertificate, 'isRemoving').mockReturnValue(true);
            expect(statuses.isRemovingGiftCertificate()).toEqual(true);
            expect(giftCertificate.isRemoving).toHaveBeenCalled();
        });
        it('returns false if not removing a gift certificate', function () {
            jest.spyOn(giftCertificate, 'isRemoving').mockReturnValue(false);
            expect(statuses.isRemovingGiftCertificate()).toEqual(false);
            expect(giftCertificate.isRemoving).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=checkout-status-selector.spec.js.map