"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("./common/log");
var locale_1 = require("./locale");
/**
 * @param {LanguageConfig} [config={}]
 * @return {CheckoutLegacyServices}
 */
function createLanguageService(config) {
    if (config === void 0) { config = {}; }
    return new locale_1.LanguageService(config, log_1.createLogger(process.env.NODE_ENV !== 'test'));
}
exports.default = createLanguageService;
//# sourceMappingURL=create-language-service.js.map