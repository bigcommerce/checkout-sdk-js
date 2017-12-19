"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var timeout_1 = require("./timeout");
describe('Timeout', function () {
    beforeEach(function () {
        jest.useFakeTimers();
    });
    afterEach(function () {
        jest.useRealTimers();
    });
    it('triggers callback when complete', function (done) {
        var timeout = new timeout_1.default();
        var callback = jest.fn();
        timeout.onComplete(callback);
        timeout.complete();
        process.nextTick(function () {
            expect(callback).toHaveBeenCalled();
            done();
        });
    });
    it('does not trigger callback again after completion', function (done) {
        var timeout = new timeout_1.default();
        var callback = jest.fn();
        timeout.onComplete(callback);
        timeout.complete();
        timeout.complete();
        process.nextTick(function () {
            expect(callback).toHaveBeenCalledTimes(1);
            done();
        });
    });
    it('triggers callback after delay', function (done) {
        var timeout = new timeout_1.default(10);
        var callback = jest.fn();
        timeout.onComplete(callback);
        timeout.start();
        jest.runTimersToTime(10);
        process.nextTick(function () {
            expect(callback).toHaveBeenCalled();
            done();
        });
    });
    it('does not trigger callback again after manual completion', function (done) {
        var timeout = new timeout_1.default(10);
        var callback = jest.fn();
        timeout.onComplete(callback);
        timeout.complete();
        jest.runTimersToTime(10);
        process.nextTick(function () {
            expect(callback).toHaveBeenCalledTimes(1);
            done();
        });
    });
});
//# sourceMappingURL=timeout.spec.js.map