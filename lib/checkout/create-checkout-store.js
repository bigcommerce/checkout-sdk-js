"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var data_store_1 = require("@bigcommerce/data-store");
var cart_1 = require("../cart");
var checkout_1 = require("../checkout");
var config_1 = require("../config");
var geography_1 = require("../geography");
var utility_1 = require("../common/utility");
var error_1 = require("../common/error");
var customer_1 = require("../customer");
var coupon_1 = require("../coupon");
var form_1 = require("../form");
var order_1 = require("../order");
var payment_1 = require("../payment");
var remote_checkout_1 = require("../remote-checkout");
var instrument_1 = require("../payment/instrument");
var quote_1 = require("../quote");
var billing_1 = require("../billing");
var shipping_1 = require("../shipping");
var create_action_transformer_1 = require("./create-action-transformer");
function createCheckoutStore(initialState, options) {
    if (initialState === void 0) { initialState = {}; }
    if (options === void 0) { options = {}; }
    var actionTransformer = create_action_transformer_1.default(error_1.createRequestErrorFactory());
    var stateTransformer = function (state) { return createCheckoutSelectors(state, options); };
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
        customerStrategy: customer_1.customerStrategyReducer,
        giftCertificates: coupon_1.giftCertificateReducer,
        instruments: instrument_1.instrumentReducer,
        order: order_1.orderReducer,
        payment: payment_1.paymentReducer,
        paymentMethods: payment_1.paymentMethodReducer,
        paymentStrategy: payment_1.paymentStrategyReducer,
        quote: quote_1.quoteReducer,
        remoteCheckout: remote_checkout_1.remoteCheckoutReducer,
        shippingCountries: shipping_1.shippingCountryReducer,
        shippingOptions: shipping_1.shippingOptionReducer,
        shippingStrategy: shipping_1.shippingStrategyReducer,
    };
}
function createCheckoutSelectors(state, options) {
    var billingAddress = new billing_1.BillingAddressSelector(state.quote);
    var cart = new cart_1.CartSelector(state.cart);
    var config = new config_1.ConfigSelector(state.config);
    var countries = new geography_1.CountrySelector(state.countries);
    var coupon = new coupon_1.CouponSelector(state.coupons);
    var customer = new customer_1.CustomerSelector(state.customer);
    var customerStrategy = new customer_1.CustomerStrategySelector(state.customerStrategy);
    var form = new form_1.FormSelector(state.config);
    var giftCertificate = new coupon_1.GiftCertificateSelector(state.giftCertificates);
    var instruments = new instrument_1.InstrumentSelector(state.instruments);
    var order = new order_1.OrderSelector(state.order, state.payment, state.customer, state.cart);
    var paymentMethods = new payment_1.PaymentMethodSelector(state.paymentMethods, state.order);
    var paymentStrategy = new payment_1.PaymentStrategySelector(state.paymentStrategy);
    var quote = new quote_1.QuoteSelector(state.quote);
    var remoteCheckout = new remote_checkout_1.RemoteCheckoutSelector(state.remoteCheckout);
    var shippingAddress = new shipping_1.ShippingAddressSelector(state.quote);
    var shippingCountries = new shipping_1.ShippingCountrySelector(state.shippingCountries);
    var shippingOptions = new shipping_1.ShippingOptionSelector(state.shippingOptions, state.quote);
    var shippingStrategy = new shipping_1.ShippingStrategySelector(state.shippingStrategy);
    var checkout = new checkout_1.CheckoutSelector(billingAddress, cart, config, countries, customer, form, instruments, order, paymentMethods, quote, remoteCheckout, shippingAddress, shippingCountries, shippingOptions);
    var errors = new checkout_1.CheckoutErrorSelector(billingAddress, cart, config, countries, coupon, customer, customerStrategy, giftCertificate, instruments, order, paymentMethods, paymentStrategy, quote, shippingAddress, shippingCountries, shippingOptions, shippingStrategy);
    var statuses = new checkout_1.CheckoutStatusSelector(billingAddress, cart, config, countries, coupon, customer, customerStrategy, giftCertificate, instruments, order, paymentMethods, paymentStrategy, quote, shippingAddress, shippingCountries, shippingOptions, shippingStrategy);
    return {
        checkout: options.shouldWarnMutation ? utility_1.createFreezeProxy(checkout) : checkout,
        errors: options.shouldWarnMutation ? utility_1.createFreezeProxy(errors) : errors,
        statuses: options.shouldWarnMutation ? utility_1.createFreezeProxy(statuses) : statuses,
    };
}
//# sourceMappingURL=create-checkout-store.js.map