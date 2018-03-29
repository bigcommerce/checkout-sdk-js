"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CustomerSelector = (function () {
    function CustomerSelector(_customer) {
        this._customer = _customer;
    }
    CustomerSelector.prototype.getCustomer = function () {
        return this._customer.data;
    };
    return CustomerSelector;
}());
exports.default = CustomerSelector;
//# sourceMappingURL=customer-selector.js.map