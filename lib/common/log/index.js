"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var console_logger_1 = require("./console-logger");
var noop_logger_1 = require("./noop-logger");
function createLogger(isEnabled) {
    if (isEnabled === void 0) { isEnabled = true; }
    if (!isEnabled) {
        return new noop_logger_1.default();
    }
    return new console_logger_1.default(console);
}
exports.createLogger = createLogger;
//# sourceMappingURL=index.js.map