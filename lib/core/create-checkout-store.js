"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var cache_1 = require("./common/cache");
var cart_1 = require("./cart");
var checkout_1 = require("./checkout");
var config_1 = require("./config");
var geography_1 = require("./geography");
var utility_1 = require("./common/utility");
var data_store_1 = require("../data-store");
var customer_1 = require("./customer");
var coupon_1 = require("./coupon");
var order_1 = require("./order");
var payment_1 = require("./payment");
var remote_checkout_1 = require("./remote-checkout");
var instrument_1 = require("./payment/instrument");
var quote_1 = require("./quote");
var billing_1 = require("./billing");
var shipping_1 = require("./shipping");
var create_action_transformer_1 = require("./create-action-transformer");
var create_request_error_factory_1 = require("./create-request-error-factory");
var form_1 = require("./form");
function createCheckoutStore(initialState, options) {
    if (initialState === void 0) { initialState = {}; }
    if (options === void 0) { options = {}; }
    var cacheFactory = new cache_1.CacheFactory();
    var actionTransformer = create_action_transformer_1.default(create_request_error_factory_1.default());
    var stateTransformer = function (state) { return createCheckoutSelectors(state, cacheFactory, options); };
    return data_store_1.createDataStore(createCheckoutReducers(), initialState, tslib_1.__assign({ actionTransformer: actionTransformer, stateTransformer: stateTransformer }, options));
}
exports.default = createCheckoutStore;
function createCheckoutReducers() {
    return {
        cart: cart_1.cartReducer,
        config: config_1.configReducer,
        countries: geography_1.countryReducer,
        coupons: coupon_1.couponReducer,
        customer: customer_1.customerReducer,
        giftCertificates: coupon_1.giftCertificateReducer,
        instruments: instrument_1.instrumentReducer,
        order: order_1.orderReducer,
        payment: payment_1.paymentReducer,
        paymentMethods: payment_1.paymentMethodReducer,
        quote: quote_1.quoteReducer,
        remoteCheckout: remote_checkout_1.remoteCheckoutReducer,
        shipping: shipping_1.shippingReducer,
        shippingCountries: shipping_1.shippingCountryReducer,
        shippingOptions: shipping_1.shippingOptionReducer,
    };
}
function createCheckoutSelectors(state, cacheFactory, options) {
    var billingAddress = new billing_1.BillingAddressSelector(state.quote);
    var cart = new cart_1.CartSelector(state.cart);
    var config = new config_1.ConfigSelector(state.config);
    var countries = new geography_1.CountrySelector(state.countries);
    var coupon = new coupon_1.CouponSelector(state.coupons);
    var customer = new customer_1.CustomerSelector(state.customer);
    var form = new form_1.FormSelector(state.config);
    var giftCertificate = new coupon_1.GiftCertificateSelector(state.giftCertificates);
    var instruments = new instrument_1.InstrumentSelector(state.instruments);
    var order = new order_1.OrderSelector(state.order, state.payment, state.customer, state.cart, cacheFactory);
    var paymentMethods = new payment_1.PaymentMethodSelector(state.paymentMethods, state.order);
    var quote = new quote_1.QuoteSelector(state.quote);
    var remoteCheckout = new remote_checkout_1.RemoteCheckoutSelector(state.remoteCheckout);
    var shipping = new shipping_1.ShippingSelector(state.shipping);
    var shippingAddress = new shipping_1.ShippingAddressSelector(state.quote);
    var shippingCountries = new shipping_1.ShippingCountrySelector(state.shippingCountries);
    var shippingOptions = new shipping_1.ShippingOptionSelector(state.shippingOptions, state.quote);
    var checkout = new checkout_1.CheckoutSelector(billingAddress, cart, config, countries, customer, form, instruments, order, paymentMethods, quote, remoteCheckout, shippingAddress, shippingCountries, shippingOptions, cacheFactory);
    var errors = new checkout_1.CheckoutErrorSelector(billingAddress, cart, config, countries, coupon, customer, giftCertificate, instruments, order, paymentMethods, quote, shipping, shippingAddress, shippingCountries, shippingOptions);
    var statuses = new checkout_1.CheckoutStatusSelector(billingAddress, cart, config, countries, coupon, customer, giftCertificate, instruments, order, paymentMethods, quote, remoteCheckout, shipping, shippingAddress, shippingCountries, shippingOptions);
    return {
        checkout: options.shouldWarnMutation ? utility_1.createFreezeProxy(checkout) : checkout,
        errors: options.shouldWarnMutation ? utility_1.createFreezeProxy(errors) : errors,
        statuses: options.shouldWarnMutation ? utility_1.createFreezeProxy(statuses) : statuses,
    };
}
//# sourceMappingURL=create-checkout-store.js.map