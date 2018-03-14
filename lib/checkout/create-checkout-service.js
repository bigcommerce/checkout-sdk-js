"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_sender_1 = require("@bigcommerce/request-sender");
var bigpay_client_1 = require("bigpay-client");
var billing_1 = require("../billing");
var cart_1 = require("../cart");
var checkout_1 = require("../checkout");
var config_1 = require("../config");
var geography_1 = require("../geography");
var coupon_1 = require("../coupon");
var customer_1 = require("../customer");
var order_1 = require("../order");
var payment_1 = require("../payment");
var instrument_1 = require("../payment/instrument");
var quote_1 = require("../quote");
var shipping_1 = require("../shipping");
var create_checkout_client_1 = require("./create-checkout-client");
var create_checkout_store_1 = require("./create-checkout-store");
function createCheckoutService(options) {
    if (options === void 0) { options = {}; }
    var client = options.client || create_checkout_client_1.default({ locale: options.locale });
    var store = create_checkout_store_1.default(createInitialState({ config: options.config }), { shouldWarnMutation: options.shouldWarnMutation });
    var paymentClient = bigpay_client_1.createClient({ host: options.config && options.config.bigpayBaseUrl });
    var instrumentRequestSender = new instrument_1.InstrumentRequestSender(paymentClient, request_sender_1.createRequestSender());
    return new checkout_1.CheckoutService(store, customer_1.createCustomerStrategyRegistry(store, client), payment_1.createPaymentStrategyRegistry(store, client, paymentClient), shipping_1.createShippingStrategyRegistry(store, client), new billing_1.BillingAddressActionCreator(client), new cart_1.CartActionCreator(client), new config_1.ConfigActionCreator(client), new geography_1.CountryActionCreator(client), new coupon_1.CouponActionCreator(client), new customer_1.CustomerActionCreator(client), new coupon_1.GiftCertificateActionCreator(client), new instrument_1.InstrumentActionCreator(instrumentRequestSender), new order_1.OrderActionCreator(client), new payment_1.PaymentMethodActionCreator(client), new quote_1.QuoteActionCreator(client), new shipping_1.ShippingCountryActionCreator(client), new shipping_1.ShippingOptionActionCreator(client));
}
exports.default = createCheckoutService;
function createInitialState(options) {
    return {
        config: {
            data: options.config,
        },
    };
}
//# sourceMappingURL=create-checkout-service.js.map