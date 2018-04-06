"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("../../payment/errors");
var errors_2 = require("./errors");
var request_error_factory_1 = require("./request-error-factory");
function createRequestErrorFactory() {
    var factory = new request_error_factory_1.default();
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
        factory.register(type, function (response, message) { return new errors_2.UnrecoverableError(response, message); });
    });
    factory.register('invalid_payment_provider', function (response) { return new errors_1.PaymentMethodInvalidError(response); });
    factory.register('payment_config_not_found', function (response) { return new errors_1.PaymentMethodInvalidError(response); });
    return factory;
}
exports.default = createRequestErrorFactory;
//# sourceMappingURL=create-request-error-factory.js.map