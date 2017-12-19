"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var isPromise = require("is-promise");
var lodash_1 = require("lodash");
var timeout_1 = require("./timeout");
var RequestSender = /** @class */ (function () {
    /**
     * @constructor
     * @param {RequestFactory} requestFactory
     * @param {PayloadTransformer} payloadTransformer
     * @param {Cookie} cookie
     */
    function RequestSender(requestFactory, payloadTransformer, cookie) {
        this._requestFactory = requestFactory;
        this._payloadTransformer = payloadTransformer;
        this._cookie = cookie;
    }
    /**
     * @param {string} url
     * @param {RequestOptions} [options={}]
     * @return {Promise<any>}
     */
    RequestSender.prototype.sendRequest = function (url, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var requestOptions = this._mergeDefaultOptions(options);
        var request = this._requestFactory.createRequest(url, requestOptions);
        return new Promise(function (resolve, reject) {
            var requestHandler = function () {
                var response = _this._payloadTransformer.toResponse(request);
                if (response.status >= 200 && response.status < 300) {
                    resolve(response);
                }
                else {
                    reject(response);
                }
            };
            request.onload = requestHandler;
            request.onerror = requestHandler;
            request.onabort = requestHandler;
            request.ontimeout = requestHandler;
            if (requestOptions.timeout instanceof timeout_1.default) {
                requestOptions.timeout.onComplete(function () { return request.abort(); });
                requestOptions.timeout.start();
            }
            if (isPromise(requestOptions.timeout)) {
                requestOptions.timeout.then(function () { return request.abort(); });
            }
            request.send(_this._payloadTransformer.toRequestBody(requestOptions));
        });
    };
    /**
     * @param {string} url
     * @param {RequestOptions} [options={}]
     * @return {Promise<any>}
     */
    RequestSender.prototype.get = function (url, options) {
        if (options === void 0) { options = {}; }
        return this.sendRequest(url, tslib_1.__assign({}, options, { method: 'GET' }));
    };
    /**
     * @param {string} url
     * @param {RequestOptions} [options={}]
     * @return {Promise<any>}
     */
    RequestSender.prototype.post = function (url, options) {
        if (options === void 0) { options = {}; }
        return this.sendRequest(url, tslib_1.__assign({}, options, { method: 'POST' }));
    };
    /**
     * @param {string} url
     * @param {RequestOptions} [options={}]
     * @return {Promise<any>}
     */
    RequestSender.prototype.put = function (url, options) {
        if (options === void 0) { options = {}; }
        return this.sendRequest(url, tslib_1.__assign({}, options, { method: 'PUT' }));
    };
    /**
     * @param {string} url
     * @param {RequestOptions} [options={}]
     * @return {Promise<any>}
     */
    RequestSender.prototype.patch = function (url, options) {
        if (options === void 0) { options = {}; }
        return this.sendRequest(url, tslib_1.__assign({}, options, { method: 'PATCH' }));
    };
    /**
     * @param {string} url
     * @param {RequestOptions} [options={}]
     * @return {Promise<any>}
     */
    RequestSender.prototype.delete = function (url, options) {
        if (options === void 0) { options = {}; }
        return this.sendRequest(url, tslib_1.__assign({}, options, { method: 'DELETE' }));
    };
    /**
     * @private
     * @param {RequestOptions} options
     * @return {RequestOptions}
     */
    RequestSender.prototype._mergeDefaultOptions = function (options) {
        var defaultOptions = {
            credentials: true,
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
            },
        };
        var csrfToken = this._cookie.get('XSRF-TOKEN');
        if (csrfToken) {
            defaultOptions.headers['X-XSRF-TOKEN'] = csrfToken;
        }
        return lodash_1.merge({}, defaultOptions, options);
    };
    return RequestSender;
}());
exports.default = RequestSender;
//# sourceMappingURL=request-sender.js.map