"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_sender_1 = require("@bigcommerce/request-sender");
var billing_1 = require("./billing");
var cart_1 = require("./cart");
var geography_1 = require("./geography");
var coupon_1 = require("./coupon");
var customer_1 = require("./customer");
var payment_1 = require("./payment");
var order_1 = require("./order");
var quote_1 = require("./quote");
var shipping_1 = require("./shipping");
var checkout_client_1 = require("./checkout/checkout-client");
/**
 * @param {Object} [config={}]
 * @param {string} [config.locale]
 * @return {CheckoutClient}
 */
function createCheckoutClient(config) {
    if (config === void 0) { config = {}; }
    var requestSender = request_sender_1.createRequestSender();
    var cartRequestSender = new cart_1.CartRequestSender(requestSender);
    var couponRequestSender = new coupon_1.CouponRequestSender(requestSender);
    var countryRequestSender = new geography_1.CountryRequestSender(requestSender, config);
    var customerRequestSender = new customer_1.CustomerRequestSender(requestSender);
    var giftCertificateRequestSender = new coupon_1.GiftCertificateRequestSender(requestSender);
    var orderRequestSender = new order_1.OrderRequestSender(requestSender);
    var paymentMethodRequestSender = new payment_1.PaymentMethodRequestSender(requestSender);
    var quoteRequestSender = new quote_1.QuoteRequestSender(requestSender);
    var shippingCountryRequestSender = new shipping_1.ShippingCountryRequestSender(requestSender, config);
    var shippingOptionRequestSender = new shipping_1.ShippingOptionRequestSender(requestSender);
    var billingAddressRequestSender = new billing_1.BillingAddressRequestSender(requestSender);
    var shippingAddressRequestSender = new shipping_1.ShippingAddressRequestSender(requestSender);
    return new checkout_client_1.default(billingAddressRequestSender, cartRequestSender, countryRequestSender, couponRequestSender, customerRequestSender, giftCertificateRequestSender, orderRequestSender, paymentMethodRequestSender, quoteRequestSender, shippingAddressRequestSender, shippingCountryRequestSender, shippingOptionRequestSender);
}
exports.default = createCheckoutClient;
//# sourceMappingURL=create-checkout-client.js.map