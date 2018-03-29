"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CancellablePromise = (function () {
    function CancellablePromise(promise) {
        var _this = this;
        var cancellable = new Promise(function (resolve, reject) {
            _this.cancel = reject;
        });
        this.promise = Promise.race([promise, cancellable]);
    }
    return CancellablePromise;
}());
exports.default = CancellablePromise;
//# sourceMappingURL=cancellable-promise.js.map