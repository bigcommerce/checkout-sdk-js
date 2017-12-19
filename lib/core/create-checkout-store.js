"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cart_1 = require("./cart");
var checkout_1 = require("./checkout");
var config_1 = require("./config");
var geography_1 = require("./geography");
var data_store_1 = require("../data-store");
var customer_1 = require("./customer");
var coupon_1 = require("./coupon");
var order_1 = require("./order");
var payment_1 = require("./payment");
var quote_1 = require("./quote");
var billing_1 = require("./billing");
var shipping_1 = require("./shipping");
/**
 * @private
 * @return {CheckoutReducers}
 */
function createCheckoutReducers() {
    return {
        cart: cart_1.cartReducer,
        config: config_1.configReducer,
        countries: geography_1.countryReducer,
        coupons: coupon_1.couponReducer,
        customer: customer_1.customerReducer,
        giftCertificates: coupon_1.giftCertificateReducer,
        order: order_1.orderReducer,
        payment: payment_1.paymentReducer,
        paymentMethods: payment_1.paymentMethodReducer,
        quote: quote_1.quoteReducer,
        shippingCountries: shipping_1.shippingCountryReducer,
        shippingOptions: shipping_1.shippingOptionReducer,
    };
}
/**
 * @private
 * @param {CheckoutState} state
 * @return {CheckoutSelectors}
 */
function createCheckoutSelectors(state) {
    var billingAddress = new billing_1.BillingAddressSelector(state.quote);
    var cart = new cart_1.CartSelector(state.cart);
    var config = new config_1.ConfigSelector(state.config);
    var countries = new geography_1.CountrySelector(state.countries);
    var coupon = new coupon_1.CouponSelector(state.coupons);
    var customer = new customer_1.CustomerSelector(state.customer);
    var giftCertificate = new coupon_1.GiftCertificateSelector(state.giftCertificates);
    var order = new order_1.OrderSelector(state.order, state.payment, state.customer, state.cart);
    var paymentMethods = new payment_1.PaymentMethodSelector(state.paymentMethods, state.order);
    var quote = new quote_1.QuoteSelector(state.quote);
    var shippingAddress = new shipping_1.ShippingAddressSelector(state.quote);
    var shippingCountries = new shipping_1.ShippingCountrySelector(state.shippingCountries);
    var shippingOptions = new shipping_1.ShippingOptionSelector(state.shippingOptions, state.quote);
    var checkout = new checkout_1.CheckoutSelector(billingAddress, cart, config, countries, customer, order, paymentMethods, quote, shippingAddress, shippingCountries, shippingOptions);
    var errors = new checkout_1.CheckoutErrorSelector(billingAddress, cart, countries, coupon, customer, giftCertificate, order, paymentMethods, quote, shippingAddress, shippingCountries, shippingOptions);
    var statuses = new checkout_1.CheckoutStatusSelector(billingAddress, cart, countries, coupon, customer, giftCertificate, order, paymentMethods, quote, shippingAddress, shippingCountries, shippingOptions);
    return {
        checkout: checkout,
        errors: errors,
        statuses: statuses,
    };
}
/**
 * @param {Object} [initialState={}]
 * @return {DataStore}
 */
function createCheckoutStore(initialState) {
    if (initialState === void 0) { initialState = {}; }
    return data_store_1.createDataStore(createCheckoutReducers(), initialState, createCheckoutSelectors);
}
exports.default = createCheckoutStore;
//# sourceMappingURL=create-checkout-store.js.map