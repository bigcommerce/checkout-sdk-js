"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bigpay_client_1 = require("bigpay-client");
var billing_1 = require("./billing");
var cart_1 = require("./cart");
var checkout_1 = require("./checkout");
var geography_1 = require("./geography");
var coupon_1 = require("./coupon");
var customer_1 = require("./customer");
var order_1 = require("./order");
var payment_1 = require("./payment");
var instrument_1 = require("./payment/instrument");
var quote_1 = require("./quote");
var shipping_1 = require("./shipping");
var create_checkout_client_1 = require("./create-checkout-client");
var create_checkout_store_1 = require("./create-checkout-store");
var create_payment_strategy_registry_1 = require("./create-payment-strategy-registry");
function createCheckoutService(options) {
    if (options === void 0) { options = {}; }
    var client = options.client || create_checkout_client_1.default({ locale: options.locale });
    var store = create_checkout_store_1.default(createInitialState({ config: options.config }), { shouldWarnMutation: options.shouldWarnMutation });
    var paymentClient = bigpay_client_1.createClient({ host: options.config && options.config.bigpayBaseUrl });
    var paymentRequestSender = new payment_1.PaymentRequestSender(paymentClient);
    var paymentActionCreator = new payment_1.PaymentActionCreator(paymentRequestSender);
    var instrumentRequestSender = new instrument_1.InstrumentRequestSender(paymentClient);
    var orderActionCreator = new order_1.OrderActionCreator(client);
    var placeOrderService = new order_1.PlaceOrderService(store, orderActionCreator, paymentActionCreator);
    return new checkout_1.CheckoutService(store, create_payment_strategy_registry_1.default(store, placeOrderService), new billing_1.BillingAddressActionCreator(client), new cart_1.CartActionCreator(client), new geography_1.CountryActionCreator(client), new coupon_1.CouponActionCreator(client), new customer_1.CustomerActionCreator(client), new coupon_1.GiftCertificateActionCreator(client), new instrument_1.InstrumentActionCreator(instrumentRequestSender), orderActionCreator, new payment_1.PaymentMethodActionCreator(client), new quote_1.QuoteActionCreator(client), new shipping_1.ShippingAddressActionCreator(client), new shipping_1.ShippingCountryActionCreator(client), new shipping_1.ShippingOptionActionCreator(client));
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