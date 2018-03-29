"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var braintree_payment_processor_1 = require("./braintree-payment-processor");
var braintree_script_loader_1 = require("./braintree-script-loader");
var braintree_sdk_creator_1 = require("./braintree-sdk-creator");
function createBraintreePaymentProcessor(scriptLoader) {
    var braintreeScriptLoader = new braintree_script_loader_1.default(scriptLoader);
    var braintreeSDKCreator = new braintree_sdk_creator_1.default(braintreeScriptLoader);
    return new braintree_payment_processor_1.default(braintreeSDKCreator);
}
exports.default = createBraintreePaymentProcessor;
//# sourceMappingURL=create-braintree-payment-processor.js.map