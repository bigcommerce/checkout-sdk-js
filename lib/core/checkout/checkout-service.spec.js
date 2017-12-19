"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var rxjs_1 = require("rxjs");
var billing_1 = require("../billing");
var cart_1 = require("../cart");
var geography_1 = require("../geography");
var coupon_1 = require("../coupon");
var customer_1 = require("../customer");
var order_1 = require("../order");
var payment_1 = require("../payment");
var quote_1 = require("../quote");
var shipping_1 = require("../shipping");
var http_request_1 = require("../../http-request");
var billing_address_mock_1 = require("../billing/billing-address.mock");
var carts_mock_1 = require("../cart/carts.mock");
var countries_mock_1 = require("../geography/countries.mock");
var coupon_mock_1 = require("../coupon/coupon.mock");
var orders_mock_1 = require("../order/orders.mock");
var customers_mock_1 = require("../customer/customers.mock");
var gift_certificate_mock_1 = require("../coupon/gift-certificate.mock");
var quotes_mock_1 = require("../quote/quotes.mock");
var payment_methods_mock_1 = require("../payment/payment-methods.mock");
var shipping_address_mock_1 = require("../shipping/shipping-address.mock");
var shipping_options_mock_1 = require("../shipping/shipping-options.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
var create_checkout_store_1 = require("../create-checkout-store");
var checkout_service_1 = require("./checkout-service");
describe('CheckoutService', function () {
    var checkoutClient;
    var checkoutService;
    var paymentStrategy;
    var paymentStrategyRegistry;
    var store;
    beforeEach(function () {
        checkoutClient = {
            loadCart: jest.fn(function () {
                return Promise.resolve(responses_mock_1.getResponse(carts_mock_1.getCartResponseBody()));
            }),
            loadCountries: jest.fn(function () {
                return Promise.resolve(responses_mock_1.getResponse(countries_mock_1.getCountriesResponseBody()));
            }),
            loadOrder: jest.fn(function () {
                return Promise.resolve(responses_mock_1.getResponse(orders_mock_1.getCompleteOrderResponseBody()));
            }),
            submitOrder: jest.fn(function () {
                return Promise.resolve(responses_mock_1.getResponse(orders_mock_1.getCompleteOrderResponseBody()));
            }),
            finalizeOrder: jest.fn(function () {
                return Promise.resolve(responses_mock_1.getResponse(orders_mock_1.getCompleteOrderResponseBody()));
            }),
            loadPaymentMethod: jest.fn(function () {
                return Promise.resolve(responses_mock_1.getResponse(payment_methods_mock_1.getPaymentMethodResponseBody()));
            }),
            loadPaymentMethods: jest.fn(function () {
                return Promise.resolve(responses_mock_1.getResponse(payment_methods_mock_1.getPaymentMethodsResponseBody()));
            }),
            loadCheckout: jest.fn(function () {
                return Promise.resolve(responses_mock_1.getResponse(quotes_mock_1.getQuoteResponseBody()));
            }),
            loadShippingCountries: jest.fn(function () {
                return Promise.resolve(responses_mock_1.getResponse(countries_mock_1.getCountriesResponseBody()));
            }),
            signInCustomer: jest.fn(function () {
                return Promise.resolve(responses_mock_1.getResponse(customers_mock_1.getCustomerResponseBody()));
            }),
            signOutCustomer: jest.fn(function () {
                return Promise.resolve(responses_mock_1.getResponse(customers_mock_1.getCustomerResponseBody()));
            }),
            loadShippingOptions: jest.fn(function () {
                return Promise.resolve(responses_mock_1.getResponse(shipping_options_mock_1.getShippingOptionResponseBody()));
            }),
            updateBillingAddress: jest.fn(function () {
                return Promise.resolve(responses_mock_1.getResponse(billing_address_mock_1.getBillingAddressResponseBody()));
            }),
            updateShippingAddress: jest.fn(function () {
                return Promise.resolve(responses_mock_1.getResponse(shipping_address_mock_1.getShippingAddressResponseBody()));
            }),
            selectShippingOption: jest.fn(function () {
                return Promise.resolve(responses_mock_1.getResponse(shipping_options_mock_1.getShippingOptionResponseBody()));
            }),
            applyCoupon: jest.fn(function () {
                return Promise.resolve(responses_mock_1.getResponse(coupon_mock_1.getCouponResponseBody()));
            }),
            removeCoupon: jest.fn(function () {
                return Promise.resolve(responses_mock_1.getResponse(coupon_mock_1.getCouponResponseBody()));
            }),
            applyGiftCertificate: jest.fn(function () {
                return Promise.resolve(responses_mock_1.getResponse(gift_certificate_mock_1.getGiftCertificateResponseBody()));
            }),
            removeGiftCertificate: jest.fn(function () {
                return Promise.resolve(responses_mock_1.getResponse(gift_certificate_mock_1.getGiftCertificateResponseBody()));
            }),
        };
        store = create_checkout_store_1.default();
        paymentStrategy = {
            execute: jest.fn(function () { return Promise.resolve(store.getState()); }),
            finalize: jest.fn(function () { return Promise.resolve(store.getState()); }),
            initialize: jest.fn(function () { return Promise.resolve(store.getState()); }),
            deinitialize: jest.fn(function () { return Promise.resolve(store.getState()); }),
        };
        paymentStrategyRegistry = {
            getStrategyByMethod: jest.fn(function () { return paymentStrategy; }),
        };
        checkoutService = new checkout_service_1.default(store, paymentStrategyRegistry, new billing_1.BillingAddressActionCreator(checkoutClient), new cart_1.CartActionCreator(checkoutClient), new geography_1.CountryActionCreator(checkoutClient), new coupon_1.CouponActionCreator(checkoutClient), new customer_1.CustomerActionCreator(checkoutClient), new coupon_1.GiftCertificateActionCreator(checkoutClient), new order_1.OrderActionCreator(checkoutClient), new payment_1.PaymentMethodActionCreator(checkoutClient), new quote_1.QuoteActionCreator(checkoutClient), new shipping_1.ShippingAddressActionCreator(checkoutClient), new shipping_1.ShippingCountryActionCreator(checkoutClient), new shipping_1.ShippingOptionActionCreator(checkoutClient));
    });
    describe('#notifyState', function () {
        it('notifies subscribers of its current state', function () {
            var subscriber = jest.fn();
            checkoutService.subscribe(subscriber);
            checkoutService.notifyState();
            expect(subscriber).toHaveBeenLastCalledWith(checkoutService.getState());
            expect(subscriber).toHaveBeenCalledTimes(2);
        });
    });
    describe('#loadCheckout()', function () {
        it('loads quote data', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var checkout;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkoutService.loadCheckout()];
                    case 1:
                        checkout = (_a.sent()).checkout;
                        expect(checkout.getQuote()).toEqual(quotes_mock_1.getQuoteResponseBody().data.quote);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#verifyCart()', function () {
        it('verifies cart data', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var checkout;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkoutService.loadCheckout()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, checkoutService.verifyCart()];
                    case 2:
                        checkout = (_a.sent()).checkout;
                        expect(checkout.getCheckoutMeta().isCartVerified).toEqual(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#loadOrder()', function () {
        it('loads order data', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var checkout;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkoutService.loadOrder(295)];
                    case 1:
                        checkout = (_a.sent()).checkout;
                        expect(checkout.getOrder()).toEqual(orders_mock_1.getCompleteOrderResponseBody().data.order);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#submitOrder()', function () {
        it('finds payment strategy', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkoutService.loadPaymentMethods()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, checkoutService.submitOrder(orders_mock_1.getOrderRequestBody())];
                    case 2:
                        _a.sent();
                        expect(paymentStrategyRegistry.getStrategyByMethod).toHaveBeenCalledWith(payment_methods_mock_1.getAuthorizenet());
                        return [2 /*return*/];
                }
            });
        }); });
        it('executes payment strategy', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkoutService.loadPaymentMethods()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, checkoutService.submitOrder(orders_mock_1.getOrderRequestBody())];
                    case 2:
                        _a.sent();
                        expect(paymentStrategy.execute).toHaveBeenCalledWith(orders_mock_1.getOrderRequestBody(), undefined);
                        return [2 /*return*/];
                }
            });
        }); });
        it('executes payment strategy with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, checkoutService.loadPaymentMethods()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, checkoutService.submitOrder(orders_mock_1.getOrderRequestBody(), options)];
                    case 2:
                        _a.sent();
                        expect(paymentStrategy.execute).toHaveBeenCalledWith(orders_mock_1.getOrderRequestBody(), options);
                        return [2 /*return*/];
                }
            });
        }); });
        it('throws error if payment method is not found or loaded', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                expect(function () { return checkoutService.submitOrder(orders_mock_1.getOrderRequestBody()); }).toThrow();
                return [2 /*return*/];
            });
        }); });
    });
    describe('#finalizeOrderIfNeeded()', function () {
        beforeEach(function () {
            jest.spyOn(checkoutClient, 'loadCheckout').mockReturnValue(Promise.resolve(responses_mock_1.getResponse(lodash_1.merge({}, quotes_mock_1.getQuoteResponseBody(), {
                data: { order: orders_mock_1.getSubmittedOrder() },
            }))));
        });
        it('finds payment strategy', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkoutService.loadCheckout()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, checkoutService.loadPaymentMethods()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, checkoutService.finalizeOrderIfNeeded()];
                    case 3:
                        _a.sent();
                        expect(paymentStrategyRegistry.getStrategyByMethod).toHaveBeenCalledWith(payment_methods_mock_1.getAuthorizenet());
                        return [2 /*return*/];
                }
            });
        }); });
        it('finalizes order', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkoutService.loadCheckout()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, checkoutService.loadPaymentMethods()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, checkoutService.finalizeOrderIfNeeded()];
                    case 3:
                        _a.sent();
                        expect(paymentStrategy.finalize).toHaveBeenCalledWith(undefined);
                        return [2 /*return*/];
                }
            });
        }); });
        it('finalizes order with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, checkoutService.loadCheckout()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, checkoutService.loadPaymentMethods()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, checkoutService.finalizeOrderIfNeeded(options)];
                    case 3:
                        _a.sent();
                        expect(paymentStrategy.finalize).toHaveBeenCalledWith(options);
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns a rejected promise if payment is not yet initialized', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, checkoutService.finalizeOrderIfNeeded()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        expect(error_1).toEqual(checkoutService.getState());
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#loadPaymentMethods()', function () {
        it('loads payment methods', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkoutService.loadPaymentMethods()];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.loadPaymentMethods).toHaveBeenCalledWith(undefined);
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads payment methods with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, checkoutService.loadPaymentMethods(options)];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.loadPaymentMethods).toHaveBeenCalledWith(options);
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns payment methods', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var checkout;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkoutService.loadPaymentMethods()];
                    case 1:
                        checkout = (_a.sent()).checkout;
                        expect(checkout.getPaymentMethods()).toEqual(payment_methods_mock_1.getPaymentMethodsResponseBody().data.paymentMethods);
                        return [2 /*return*/];
                }
            });
        }); });
        it('dispatches action with queue id', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jest.spyOn(store, 'dispatch');
                        return [4 /*yield*/, checkoutService.loadPaymentMethods()];
                    case 1:
                        _a.sent();
                        expect(store.dispatch).toHaveBeenCalledWith(expect.any(rxjs_1.Observable), { queueId: 'paymentMethods' });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#loadPaymentMethod()', function () {
        it('loads payment method', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkoutService.loadPaymentMethod('authorizenet')];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.loadPaymentMethod).toHaveBeenCalledWith('authorizenet', undefined);
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads payment method with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, checkoutService.loadPaymentMethod('authorizenet', options)];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.loadPaymentMethod).toHaveBeenCalledWith('authorizenet', options);
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns payment method', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var checkout;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkoutService.loadPaymentMethod('authorizenet')];
                    case 1:
                        checkout = (_a.sent()).checkout;
                        expect(checkout.getPaymentMethod('authorizenet')).toEqual(payment_methods_mock_1.getPaymentMethodResponseBody().data.paymentMethod);
                        return [2 /*return*/];
                }
            });
        }); });
        it('dispatches action with queue id', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jest.spyOn(store, 'dispatch');
                        return [4 /*yield*/, checkoutService.loadPaymentMethod('authorizenet')];
                    case 1:
                        _a.sent();
                        expect(store.dispatch).toHaveBeenCalledWith(expect.any(rxjs_1.Observable), { queueId: 'paymentMethods' });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#initializePaymentMethod()', function () {
        it('finds payment strategy', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkoutService.loadPaymentMethods()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, checkoutService.initializePaymentMethod('braintree')];
                    case 2:
                        _a.sent();
                        expect(paymentStrategyRegistry.getStrategyByMethod).toHaveBeenCalledWith(payment_methods_mock_1.getBraintree());
                        return [2 /*return*/];
                }
            });
        }); });
        it('initializes payment strategy', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkoutService.loadPaymentMethods()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, checkoutService.initializePaymentMethod('braintree')];
                    case 2:
                        _a.sent();
                        expect(paymentStrategy.initialize).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('throws error if payment method has not been loaded', function () {
            expect(function () { return checkoutService.initializePaymentMethod('braintree'); }).toThrow();
        });
    });
    describe('#deinitializePaymentMethod()', function () {
        it('finds payment strategy', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkoutService.loadPaymentMethods()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, checkoutService.deinitializePaymentMethod('braintree')];
                    case 2:
                        _a.sent();
                        expect(paymentStrategyRegistry.getStrategyByMethod).toHaveBeenCalledWith(payment_methods_mock_1.getBraintree());
                        return [2 /*return*/];
                }
            });
        }); });
        it('deinitializes payment strategy', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkoutService.loadPaymentMethods()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, checkoutService.deinitializePaymentMethod('braintree')];
                    case 2:
                        _a.sent();
                        expect(paymentStrategy.deinitialize).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('throws error if payment method has not been loaded', function () {
            expect(function () { return checkoutService.deinitializePaymentMethod('braintree'); }).toThrow();
        });
    });
    describe('#loadBillingCountries()', function () {
        it('loads billing countries data', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var checkout;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkoutService.loadBillingCountries()];
                    case 1:
                        checkout = (_a.sent()).checkout;
                        expect(checkout.getBillingCountries()).toEqual(countries_mock_1.getCountriesResponseBody().data);
                        return [2 /*return*/];
                }
            });
        }); });
        it('dispatches action with queue id', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jest.spyOn(store, 'dispatch');
                        return [4 /*yield*/, checkoutService.loadBillingCountries()];
                    case 1:
                        _a.sent();
                        expect(store.dispatch).toHaveBeenCalledWith(expect.any(rxjs_1.Observable), { queueId: 'billingCountries' });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#loadShippingCountries()', function () {
        it('loads shipping countries data', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var checkout;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkoutService.loadShippingCountries()];
                    case 1:
                        checkout = (_a.sent()).checkout;
                        expect(checkout.getShippingCountries()).toEqual(countries_mock_1.getCountriesResponseBody().data);
                        return [2 /*return*/];
                }
            });
        }); });
        it('dispatches action with queue id', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jest.spyOn(store, 'dispatch');
                        return [4 /*yield*/, checkoutService.loadShippingCountries()];
                    case 1:
                        _a.sent();
                        expect(store.dispatch).toHaveBeenCalledWith(expect.any(rxjs_1.Observable), { queueId: 'shippingCountries' });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#signInCustomer()', function () {
        it('signs in customer', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var credentials, checkout;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        credentials = { email: 'foo@bar.com', password: 'foobar' };
                        return [4 /*yield*/, checkoutService.signInCustomer(credentials)];
                    case 1:
                        checkout = (_a.sent()).checkout;
                        expect(checkout.getCustomer()).toEqual(customers_mock_1.getCustomerResponseBody().data.customer);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#signOutCustomer()', function () {
        it('signs in customer', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var checkout;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkoutService.signOutCustomer()];
                    case 1:
                        checkout = (_a.sent()).checkout;
                        expect(checkout.getCustomer()).toEqual(customers_mock_1.getCustomerResponseBody().data.customer);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#loadShippingOptions()', function () {
        it('loads shipping options', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var checkout;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkoutService.loadShippingOptions()];
                    case 1:
                        checkout = (_a.sent()).checkout;
                        expect(checkout.getShippingOptions()).toEqual(shipping_options_mock_1.getShippingOptionResponseBody().data.shippingOptions);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#selectShippingOption()', function () {
        it('selects a shipping option', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var addressId, shippingOptionId, options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        addressId = 'addresd-id-123';
                        shippingOptionId = 'shipping-option-id-456';
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, checkoutService.selectShippingOption(addressId, shippingOptionId, options)];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.selectShippingOption)
                            .toHaveBeenCalledWith(addressId, shippingOptionId, options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#updateShippingAddress()', function () {
        it('updates the shipping address', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var address, options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        address = shipping_address_mock_1.getShippingAddress();
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, checkoutService.updateShippingAddress(address, options)];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.updateShippingAddress)
                            .toHaveBeenCalledWith(address, options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#updateBillingAddress()', function () {
        it('updates the billing address', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var address, options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        address = billing_address_mock_1.getBillingAddress();
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, checkoutService.updateBillingAddress(address, options)];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.updateBillingAddress)
                            .toHaveBeenCalledWith(address, options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#applyCoupon()', function () {
        it('applies a coupon', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var code, options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        code = 'myCoupon1234';
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, checkoutService.applyCoupon(code, options)];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.applyCoupon)
                            .toHaveBeenCalledWith(code, options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#removeCoupon()', function () {
        it('removes a coupon', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var code, options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        code = 'myCoupon1234';
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, checkoutService.removeCoupon(code, options)];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.removeCoupon)
                            .toHaveBeenCalledWith(code, options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#applyGiftCertificate()', function () {
        it('applies a gift certificate', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var code, options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        code = 'myGiftCertificate1234';
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, checkoutService.applyGiftCertificate(code, options)];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.applyGiftCertificate)
                            .toHaveBeenCalledWith(code, options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#removeGiftCertificate()', function () {
        it('removes a gift certificate', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var code, options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        code = 'myGiftCertificate1234';
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, checkoutService.removeGiftCertificate(code, options)];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.removeGiftCertificate)
                            .toHaveBeenCalledWith(code, options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=checkout-service.spec.js.map