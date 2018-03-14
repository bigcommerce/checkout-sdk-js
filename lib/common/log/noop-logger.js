"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NoopLogger = (function () {
    function NoopLogger() {
    }
    NoopLogger.prototype.log = function () { };
    NoopLogger.prototype.info = function () { };
    NoopLogger.prototype.warn = function () { };
    NoopLogger.prototype.error = function () { };
    NoopLogger.prototype.debug = function () { };
    return NoopLogger;
}());
exports.default = NoopLogger;
//# sourceMappingURL=noop-logger.js.map