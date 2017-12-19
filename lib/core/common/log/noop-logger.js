"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NoopLogger = /** @class */ (function () {
    function NoopLogger() {
    }
    /**
     * @return {void}
     */
    NoopLogger.prototype.log = function () { };
    /**
     * @return {void}
     */
    NoopLogger.prototype.info = function () { };
    /**
     * @return {void}
     */
    NoopLogger.prototype.warn = function () { };
    /**
     * @return {void}
     */
    NoopLogger.prototype.error = function () { };
    /**
     * @return {void}
     */
    NoopLogger.prototype.debug = function () { };
    return NoopLogger;
}());
exports.default = NoopLogger;
//# sourceMappingURL=noop-logger.js.map