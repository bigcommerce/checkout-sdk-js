"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var error_1 = require("./common/error");
var errors_1 = require("./common/error/errors");
var errors_2 = require("./payment/errors");
function createRequestErrorFactory() {
    var factory = new error_1.RequestErrorFactory();
    var unrecoverableErrorTypes = [
        'catalog_only',
        'empty_cart',
        'invalid_order_id',
        'invalid_order_token',
        'missing_order_token',
        'missing_provider_token',
        'missing_shipping_method',
        'order_completion_error',
        'order_could_not_be_finalized_error',
        'order_create_failed',
        'provider_fatal_error',
        'provider_setup_error',
        'stock_too_low',
    ];
    unrecoverableErrorTypes.forEach(function (type) {
        factory.register(type, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new (errors_1.UnrecoverableError.bind.apply(errors_1.UnrecoverableError, [void 0].concat(args)))();
        });
    });
    factory.register('invalid_payment_provider', function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new (errors_2.PaymentMethodInvalidError.bind.apply(errors_2.PaymentMethodInvalidError, [void 0].concat(args)))();
    });
    factory.register('payment_config_not_found', function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new (errors_2.PaymentMethodInvalidError.bind.apply(errors_2.PaymentMethodInvalidError, [void 0].concat(args)))();
    });
    return factory;
}
exports.default = createRequestErrorFactory;
//# sourceMappingURL=create-request-error-factory.js.map