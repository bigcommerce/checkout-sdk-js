"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var billing_1 = require("../billing");
var cart_1 = require("../cart");
var config_1 = require("../config");
var geography_1 = require("../geography");
var customer_1 = require("../customer");
var order_1 = require("../order");
var payment_1 = require("../payment");
var quote_1 = require("../quote");
var shipping_1 = require("../shipping");
var carts_mock_1 = require("../cart/carts.mock");
var orders_mock_1 = require("../order/orders.mock");
var configs_mock_1 = require("../config/configs.mock");
var countries_mock_1 = require("../geography/countries.mock");
var customers_mock_1 = require("../customer/customers.mock");
var payment_methods_mock_1 = require("../payment/payment-methods.mock");
var quotes_mock_1 = require("../quote/quotes.mock");
var shipping_countries_mock_1 = require("../shipping/shipping-countries.mock");
var shipping_options_mock_1 = require("../shipping/shipping-options.mock");
var checkout_selector_1 = require("./checkout-selector");
describe('CheckoutSelector', function () {
    var selector;
    var state;
    beforeEach(function () {
        state = {
            cart: carts_mock_1.getCartState(),
            config: configs_mock_1.getConfigState(),
            countries: countries_mock_1.getCountriesState(),
            customer: customers_mock_1.getCustomerState(),
            order: orders_mock_1.getCompleteOrderState(),
            paymentMethods: payment_methods_mock_1.getPaymentMethodsState(),
            quote: quotes_mock_1.getQuoteState(),
            shippingOptions: shipping_options_mock_1.getShippingOptionsState(),
            shippingCountries: shipping_countries_mock_1.getShippingCountriesState(),
        };
        selector = new checkout_selector_1.default(new billing_1.BillingAddressSelector(state.quote), new cart_1.CartSelector(state.cart), new config_1.ConfigSelector(state.config), new geography_1.CountrySelector(state.countries), new customer_1.CustomerSelector(state.customer), new order_1.OrderSelector(state.order), new payment_1.PaymentMethodSelector(state.paymentMethods), new quote_1.QuoteSelector(state.quote), new shipping_1.ShippingAddressSelector(state.quote), new shipping_1.ShippingCountrySelector(state.shippingCountries), new shipping_1.ShippingOptionSelector(state.shippingOptions));
    });
    it('returns checkout meta', function () {
        expect(selector.getCheckoutMeta()).toEqual(tslib_1.__assign({ isCartVerified: false, paymentAuthToken: undefined }, state.quote.meta.request, state.order.meta));
    });
    it('returns order', function () {
        expect(selector.getOrder()).toEqual(state.order.data);
    });
    it('returns quote', function () {
        expect(selector.getQuote()).toEqual(state.quote.data);
    });
    it('returns config', function () {
        expect(selector.getConfig()).toEqual(state.config.data);
    });
    it('returns shipping options', function () {
        expect(selector.getShippingOptions()).toEqual(state.shippingOptions.data);
    });
    it('returns shipping countries', function () {
        expect(selector.getShippingCountries()).toEqual(state.shippingCountries.data);
    });
    it('returns billing countries', function () {
        expect(selector.getBillingCountries()).toEqual(state.countries.data);
    });
    it('returns payment methods', function () {
        expect(selector.getPaymentMethods()).toEqual(state.paymentMethods.data);
    });
    it('returns payment method', function () {
        expect(selector.getPaymentMethod('braintree')).toEqual(payment_methods_mock_1.getBraintree());
    });
    it('returns cart', function () {
        expect(selector.getCart()).toEqual(state.cart.data);
    });
    it('returns customer', function () {
        expect(selector.getCustomer()).toEqual(state.customer.data);
    });
    it('returns billing address', function () {
        expect(selector.getBillingAddress()).toEqual(state.quote.data.billingAddress);
    });
    it('returns shipping address', function () {
        expect(selector.getShippingAddress()).toEqual(state.quote.data.shippingAddress);
    });
});
//# sourceMappingURL=checkout-selector.spec.js.map