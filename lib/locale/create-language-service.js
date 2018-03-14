"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("../common/log");
var language_service_1 = require("./language-service");
function createLanguageService(config) {
    if (config === void 0) { config = {}; }
    return new language_service_1.default(config, log_1.createLogger(process.env.NODE_ENV !== 'test'));
}
exports.default = createLanguageService;
//# sourceMappingURL=create-language-service.js.map