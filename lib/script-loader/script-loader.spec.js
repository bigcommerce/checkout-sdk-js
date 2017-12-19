"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var script_loader_1 = require("./script-loader");
describe('ScriptLoader', function () {
    var document;
    var loader;
    var script;
    beforeEach(function () {
        script = {};
        document = {
            createElement: jest.fn(function () { return script; }),
            body: {
                appendChild: jest.fn(function (element) {
                    return element.onreadystatechange(new Event('readystatechange'));
                }),
            },
        };
        loader = new script_loader_1.default(document);
    });
    it('attaches script tag to document', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loader.loadScript('https://code.jquery.com/jquery-3.2.1.min.js')];
                case 1:
                    _a.sent();
                    expect(document.body.appendChild).toHaveBeenCalledWith(script);
                    expect(script.src).toEqual('https://code.jquery.com/jquery-3.2.1.min.js');
                    return [2 /*return*/];
            }
        });
    }); });
    it('resolves promise if script is loaded', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var output;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loader.loadScript('https://code.jquery.com/jquery-3.2.1.min.js')];
                case 1:
                    output = _a.sent();
                    expect(output).toBeInstanceOf(Event);
                    return [2 /*return*/];
            }
        });
    }); });
    it('rejects promise if script is not loaded', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var output_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jest.spyOn(document.body, 'appendChild').mockImplementation(function (element) { return element.onerror(new Event('error')); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, loader.loadScript('https://code.jquery.com/jquery-3.2.1.min.js')];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    output_1 = _a.sent();
                    expect(output_1).toBeInstanceOf(Event);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=script-loader.spec.js.map