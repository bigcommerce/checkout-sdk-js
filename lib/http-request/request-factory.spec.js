"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_factory_1 = require("./request-factory");
describe('RequestFactory', function () {
    var requestFactory;
    var url;
    beforeEach(function () {
        url = 'http://foobar/v1/endpoint';
        global.XMLHttpRequest = function XMLHttpRequestMock() {
            this.open = jest.fn();
            this.setRequestHeader = jest.fn();
        };
        requestFactory = new request_factory_1.default();
    });
    describe('#createRequest()', function () {
        it('returns XHR object', function () {
            var xhr = requestFactory.createRequest(url);
            expect(xhr instanceof XMLHttpRequest).toEqual(true);
        });
        it('configures XHR object with options', function () {
            var xhr = requestFactory.createRequest(url, {
                credentials: true,
                timeout: 2000,
                method: 'GET',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            });
            expect(xhr.withCredentials).toEqual(true);
            expect(xhr.timeout).toEqual(2000);
            expect(xhr.open).toHaveBeenCalledWith('GET', url, true);
            expect(xhr.setRequestHeader).toHaveBeenCalledWith('Accept', 'application/json, text/plain, */*');
            expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
        });
        it('configures XHR object with parameterized URL', function () {
            var xhr = requestFactory.createRequest(url, {
                method: 'GET',
                params: {
                    foobar: 'foobar',
                    bar: 'bar',
                },
            });
            expect(xhr.open).toHaveBeenCalledWith('GET', url + "?bar=bar&foobar=foobar", true);
        });
    });
});
//# sourceMappingURL=request-factory.spec.js.map