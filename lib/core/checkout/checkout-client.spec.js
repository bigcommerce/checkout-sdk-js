"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var http_request_1 = require("../../http-request");
var responses_mock_1 = require("../../http-request/responses.mock");
var billing_address_mock_1 = require("../billing/billing-address.mock");
var carts_mock_1 = require("../cart/carts.mock");
var orders_mock_1 = require("../order/orders.mock");
var countries_mock_1 = require("../geography/countries.mock");
var customers_mock_1 = require("../customer/customers.mock");
var payment_methods_mock_1 = require("../payment/payment-methods.mock");
var quotes_mock_1 = require("../quote/quotes.mock");
var shipping_address_mock_1 = require("../shipping/shipping-address.mock");
var shipping_options_mock_1 = require("../shipping/shipping-options.mock");
var checkout_client_1 = require("./checkout-client");
describe('CheckoutClient', function () {
    var client;
    var billingAddressRequestSender;
    var cartRequestSender;
    var countryRequestSender;
    var couponRequestSender;
    var customerRequestSender;
    var giftCertificateRequestSender;
    var orderRequestSender;
    var paymentMethodRequestSender;
    var quoteRequestSender;
    var shippingAddressRequestSender;
    var shippingCountryRequestSender;
    var shippingOptionRequestSender;
    beforeEach(function () {
        billingAddressRequestSender = {
            updateAddress: jest.fn(function () { return Promise.resolve(responses_mock_1.getResponse(billing_address_mock_1.getBillingAddress())); }),
        };
        cartRequestSender = {
            loadCart: jest.fn(function () { return Promise.resolve(responses_mock_1.getResponse(carts_mock_1.getCart())); }),
        };
        countryRequestSender = {
            loadCountries: jest.fn(function () { return Promise.resolve(responses_mock_1.getResponse(countries_mock_1.getCountries())); }),
        };
        couponRequestSender = {
            applyCoupon: jest.fn(function () { return Promise.resolve(carts_mock_1.getCartResponseBody()); }),
            removeCoupon: jest.fn(function () { return Promise.resolve(carts_mock_1.getCartResponseBody()); }),
        };
        customerRequestSender = {
            signInCustomer: jest.fn(function () { return Promise.resolve(customers_mock_1.getCustomerResponseBody()); }),
            signOutCustomer: jest.fn(function () { return Promise.resolve(customers_mock_1.getCustomerResponseBody()); }),
        };
        giftCertificateRequestSender = {
            applyGiftCertificate: jest.fn(function () { return Promise.resolve(carts_mock_1.getCartResponseBody()); }),
            removeGiftCertificate: jest.fn(function () { return Promise.resolve(carts_mock_1.getCartResponseBody()); }),
        };
        orderRequestSender = {
            loadOrder: jest.fn(function () { return Promise.resolve(responses_mock_1.getResponse(orders_mock_1.getCompleteOrder())); }),
            finalizeOrder: jest.fn(function () { return Promise.resolve(responses_mock_1.getResponse(orders_mock_1.getCompleteOrder())); }),
            submitOrder: jest.fn(function () { return Promise.resolve(responses_mock_1.getResponse(orders_mock_1.getCompleteOrder())); }),
        };
        orderRequestSender = {
            loadOrder: jest.fn(function () { return Promise.resolve(responses_mock_1.getResponse(orders_mock_1.getCompleteOrder())); }),
            finalizeOrder: jest.fn(function () { return Promise.resolve(responses_mock_1.getResponse(orders_mock_1.getCompleteOrder())); }),
            submitOrder: jest.fn(function () { return Promise.resolve(responses_mock_1.getResponse(orders_mock_1.getCompleteOrder())); }),
        };
        paymentMethodRequestSender = {
            loadPaymentMethods: jest.fn(function () { return Promise.resolve(responses_mock_1.getResponse(payment_methods_mock_1.getPaymentMethods())); }),
            loadPaymentMethod: jest.fn(function () { return Promise.resolve(responses_mock_1.getResponse(payment_methods_mock_1.getPaymentMethod())); }),
        };
        quoteRequestSender = {
            loadQuote: jest.fn(function () { return Promise.resolve(responses_mock_1.getResponse(quotes_mock_1.getQuote())); }),
        };
        shippingCountryRequestSender = {
            loadCountries: jest.fn(function () { return Promise.resolve(responses_mock_1.getResponse(countries_mock_1.getCountries())); }),
        };
        shippingAddressRequestSender = {
            updateAddress: jest.fn(function () { return Promise.resolve(responses_mock_1.getResponse(shipping_address_mock_1.getShippingAddress())); }),
        };
        shippingOptionRequestSender = {
            loadShippingOptions: jest.fn(function () { return Promise.resolve(shipping_options_mock_1.getShippingOptions()); }),
            selectShippingOption: jest.fn(function () { return Promise.resolve(shipping_options_mock_1.getShippingOptions()); }),
        };
        client = new checkout_client_1.default(billingAddressRequestSender, cartRequestSender, countryRequestSender, couponRequestSender, customerRequestSender, giftCertificateRequestSender, orderRequestSender, paymentMethodRequestSender, quoteRequestSender, shippingAddressRequestSender, shippingCountryRequestSender, shippingOptionRequestSender);
    });
    describe('#loadCheckout()', function () {
        it('loads checkout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.loadCheckout()];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(quotes_mock_1.getQuote()));
                        expect(quoteRequestSender.loadQuote).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads checkout with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, client.loadCheckout(options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(quotes_mock_1.getQuote()));
                        expect(quoteRequestSender.loadQuote).toHaveBeenCalledWith(options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#loadOrder()', function () {
        it('loads order', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.loadOrder(295)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(orders_mock_1.getCompleteOrder()));
                        expect(orderRequestSender.loadOrder).toHaveBeenCalledWith(295, undefined);
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads order with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, client.loadOrder(295, options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(orders_mock_1.getCompleteOrder()));
                        expect(orderRequestSender.loadOrder).toHaveBeenCalledWith(295, options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#submitOrder()', function () {
        it('submits order', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var payload, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = { useStoreCredit: false };
                        return [4 /*yield*/, client.submitOrder(payload)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(orders_mock_1.getCompleteOrder()));
                        expect(orderRequestSender.submitOrder).toHaveBeenCalledWith(payload, undefined);
                        return [2 /*return*/];
                }
            });
        }); });
        it('submits order with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var payload, options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = { useStoreCredit: false };
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, client.submitOrder(payload, options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(orders_mock_1.getCompleteOrder()));
                        expect(orderRequestSender.submitOrder).toHaveBeenCalledWith(payload, options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#finalizeOrder()', function () {
        it('finalizes order', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.finalizeOrder(295)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(orders_mock_1.getCompleteOrder()));
                        expect(orderRequestSender.finalizeOrder).toHaveBeenCalledWith(295, undefined);
                        return [2 /*return*/];
                }
            });
        }); });
        it('finalizes order with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, client.finalizeOrder(295, options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(orders_mock_1.getCompleteOrder()));
                        expect(orderRequestSender.finalizeOrder).toHaveBeenCalledWith(295, options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#loadPaymentMethods()', function () {
        it('loads payment methods', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.loadPaymentMethods()];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(payment_methods_mock_1.getPaymentMethods()));
                        expect(paymentMethodRequestSender.loadPaymentMethods).toHaveBeenCalledWith(undefined);
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads payment methods with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, client.loadPaymentMethods(options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(payment_methods_mock_1.getPaymentMethods()));
                        expect(paymentMethodRequestSender.loadPaymentMethods).toHaveBeenCalledWith(options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#loadPaymentMethod()', function () {
        it('loads payment method', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.loadPaymentMethod('braintree')];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(payment_methods_mock_1.getPaymentMethod()));
                        expect(paymentMethodRequestSender.loadPaymentMethod).toHaveBeenCalledWith('braintree', undefined);
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads payment method with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, client.loadPaymentMethod('braintree', options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(payment_methods_mock_1.getPaymentMethod()));
                        expect(paymentMethodRequestSender.loadPaymentMethod).toHaveBeenCalledWith('braintree', options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#loadCart()', function () {
        it('loads cart', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.loadCart()];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(carts_mock_1.getCart()));
                        expect(cartRequestSender.loadCart).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads cart with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, client.loadCart(options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(carts_mock_1.getCart()));
                        expect(cartRequestSender.loadCart).toHaveBeenCalledWith(options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#loadCountries()', function () {
        it('loads billing countries', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.loadCountries()];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(countries_mock_1.getCountries()));
                        expect(countryRequestSender.loadCountries).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads billing countries with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, client.loadCountries(options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(countries_mock_1.getCountries()));
                        expect(countryRequestSender.loadCountries).toHaveBeenCalledWith(options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#loadShippingCountries()', function () {
        it('loads shipping countries', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.loadShippingCountries()];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(countries_mock_1.getCountries()));
                        expect(shippingCountryRequestSender.loadCountries).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads shipping countries with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, client.loadShippingCountries(options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(countries_mock_1.getCountries()));
                        expect(shippingCountryRequestSender.loadCountries).toHaveBeenCalledWith(options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#updateShippingAddress()', function () {
        var address;
        var options;
        beforeEach(function () {
            address = shipping_address_mock_1.getShippingAddress();
            options = {
                timeout: http_request_1.createTimeout(),
            };
        });
        it('updates the shipping address', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.updateShippingAddress(address, options)];
                    case 1:
                        _a.sent();
                        expect(shippingAddressRequestSender.updateAddress)
                            .toHaveBeenCalledWith(address, options);
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns the shipping address', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.updateShippingAddress(address, options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(address));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#updateBillingAddress()', function () {
        var address;
        var options;
        beforeEach(function () {
            address = billing_address_mock_1.getBillingAddress();
            options = {
                timeout: http_request_1.createTimeout(),
            };
        });
        it('updates the billing address', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.updateBillingAddress(address, options)];
                    case 1:
                        _a.sent();
                        expect(billingAddressRequestSender.updateAddress)
                            .toHaveBeenCalledWith(address, options);
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns the billing address', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.updateBillingAddress(address, options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(responses_mock_1.getResponse(address));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#signInCustomer()', function () {
        it('signs in customer', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var credentials, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        credentials = { email: 'foo@bar.com', password: 'foobar' };
                        return [4 /*yield*/, client.signInCustomer(credentials)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(customers_mock_1.getCustomerResponseBody());
                        expect(customerRequestSender.signInCustomer).toHaveBeenCalledWith(credentials, undefined);
                        return [2 /*return*/];
                }
            });
        }); });
        it('signs in customer with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var credentials, options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        credentials = { email: 'foo@bar.com', password: 'foobar' };
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, client.signInCustomer(credentials, options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(customers_mock_1.getCustomerResponseBody());
                        expect(customerRequestSender.signInCustomer).toHaveBeenCalledWith(credentials, options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#signOutCustomer()', function () {
        it('signs out customer', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.signOutCustomer()];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(customers_mock_1.getCustomerResponseBody());
                        expect(customerRequestSender.signOutCustomer).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('signs out customer with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, client.signOutCustomer(options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(customers_mock_1.getCustomerResponseBody());
                        expect(customerRequestSender.signOutCustomer).toHaveBeenCalledWith(options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#loadShippingOptions()', function () {
        it('loads available shipping options', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, client.loadShippingOptions(options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(shipping_options_mock_1.getShippingOptions());
                        expect(shippingOptionRequestSender.loadShippingOptions).toHaveBeenCalledWith(options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#selectShippingOption()', function () {
        it('selects shipping option', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, client.selectShippingOption('addressId', 'shippingOptionId', options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(shipping_options_mock_1.getShippingOptions());
                        expect(shippingOptionRequestSender.selectShippingOption)
                            .toHaveBeenCalledWith('addressId', 'shippingOptionId', options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#applyCoupon()', function () {
        it('applies a coupon code', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.applyCoupon('couponCode1234')];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(carts_mock_1.getCartResponseBody());
                        expect(couponRequestSender.applyCoupon)
                            .toHaveBeenCalledWith('couponCode1234', undefined);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#removeCoupon()', function () {
        it('removes a coupon code', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.removeCoupon('couponCode1234')];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(carts_mock_1.getCartResponseBody());
                        expect(couponRequestSender.removeCoupon)
                            .toHaveBeenCalledWith('couponCode1234', undefined);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#applyGiftCertificate()', function () {
        it('applies a gift certificate', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.applyGiftCertificate('giftCertificate1234')];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(carts_mock_1.getCartResponseBody());
                        expect(giftCertificateRequestSender.applyGiftCertificate)
                            .toHaveBeenCalledWith('giftCertificate1234', undefined);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#removeGiftCertificate()', function () {
        it('removes a gift certificate', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.removeGiftCertificate('giftCertificate1234')];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(carts_mock_1.getCartResponseBody());
                        expect(giftCertificateRequestSender.removeGiftCertificate)
                            .toHaveBeenCalledWith('giftCertificate1234', undefined);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=checkout-client.spec.js.map