"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cookie = require("js-cookie");
var request_factory_1 = require("./request-factory");
var request_sender_1 = require("./request-sender");
var payload_transformer_1 = require("./payload-transformer");
var timeout_1 = require("./timeout");
/**
 * @return {RequestSender}
 */
function createRequestSender() {
    return new request_sender_1.default(new request_factory_1.default(), new payload_transformer_1.default(), cookie);
}
exports.createRequestSender = createRequestSender;
/**
 * @param {number} [delay]
 * @return {Timeout}
 */
function createTimeout(delay) {
    return new timeout_1.default(delay);
}
exports.createTimeout = createTimeout;
//# sourceMappingURL=index.js.map