"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var logger_1 = require("./logger");
var noop_logger_1 = require("./noop-logger");
describe('createLogger()', function () {
    it('returns a console logger if logging is enabled', function () {
        var logger = index_1.createLogger();
        expect(logger instanceof logger_1.default).toEqual(true);
    });
    it('returns a noop logger if logging is disabled', function () {
        var logger = index_1.createLogger(false);
        expect(logger instanceof noop_logger_1.default).toEqual(true);
    });
});
//# sourceMappingURL=index.spec.js.map