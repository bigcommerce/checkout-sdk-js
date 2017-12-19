"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger");
describe('Logger', function () {
    var logger;
    var mockConsole;
    beforeEach(function () {
        mockConsole = {
            log: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
        };
        logger = new logger_1.default(mockConsole);
    });
    describe('#log()', function () {
        it('logs messages to console', function () {
            logger.log('hello', 'world');
            expect(mockConsole.log).toHaveBeenCalled();
        });
        it('does not throw an error if console is unavailable', function () {
            logger = new logger_1.default(undefined);
            expect(function () { return logger.log('hello', 'world'); }).not.toThrow();
        });
    });
    describe('#info()', function () {
        it('logs info messages to console', function () {
            logger.info('hello', 'world');
            expect(mockConsole.info).toHaveBeenCalled();
        });
    });
    describe('#warn()', function () {
        it('logs warning messages to console', function () {
            logger.warn('hello', 'world');
            expect(mockConsole.warn).toHaveBeenCalled();
        });
    });
    describe('#error()', function () {
        it('logs error messages to console', function () {
            logger.error('hello', 'world');
            expect(mockConsole.error).toHaveBeenCalled();
        });
    });
    describe('#debug()', function () {
        it('logs debug messages to console', function () {
            logger.debug('hello', 'world');
            expect(mockConsole.debug).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=logger.spec.js.map