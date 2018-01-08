"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger");
var noop_logger_1 = require("./noop-logger");
function createLogger(isEnabled) {
    if (isEnabled === void 0) { isEnabled = true; }
    if (!isEnabled) {
        return new noop_logger_1.default();
    }
    return new logger_1.default(console);
}
exports.createLogger = createLogger;
//# sourceMappingURL=index.js.map