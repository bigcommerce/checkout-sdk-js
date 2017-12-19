"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var data_store_1 = require("../../data-store");
var actionTypes = require("./quote-action-types");
var QuoteActionCreator = /** @class */ (function () {
    /**
     * @constructor
     * @param {CheckoutClient} checkoutClient
     */
    function QuoteActionCreator(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }
    /**
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    QuoteActionCreator.prototype.loadQuote = function (options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_QUOTE_REQUESTED));
            _this._checkoutClient.loadCheckout(options)
                .then(function (_a) {
                var _b = _a.body, _c = _b === void 0 ? {} : _b, data = _c.data, meta = _c.meta;
                observer.next(data_store_1.createAction(actionTypes.LOAD_QUOTE_SUCCEEDED, data, meta));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.LOAD_QUOTE_FAILED, response));
            });
        });
    };
    return QuoteActionCreator;
}());
exports.default = QuoteActionCreator;
//# sourceMappingURL=quote-action-creator.js.map