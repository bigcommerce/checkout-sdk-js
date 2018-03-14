"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var map_to_internal_shipping_option_1 = require("./map-to-internal-shipping-option");
function mapToInternalShippingOptions(consignments, existingOptions) {
    return consignments.reduce(function (result, consignment) {
        return (tslib_1.__assign({}, result, (_a = {}, _a[consignment.shippingAddress.id] = (consignment.availableShippingOptions || []).map(function (option) {
            return map_to_internal_shipping_option_1.default(option, lodash_1.find(existingOptions[consignment.shippingAddress.id], { id: option.id }));
        }), _a)));
        var _a;
    }, {});
}
exports.default = mapToInternalShippingOptions;
//# sourceMappingURL=map-to-internal-shipping-options.js.map