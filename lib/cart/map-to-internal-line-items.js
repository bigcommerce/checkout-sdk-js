"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var map_to_internal_line_item_1 = require("./map-to-internal-line-item");
function mapToInternalLineItems(itemMap, existingItems) {
    return Object.keys(itemMap)
        .reduce(function (result, key) { return result.concat(itemMap[key].map(function (item) {
        var existingItem = lodash_1.find(existingItems, { id: item.id });
        return map_to_internal_line_item_1.default(item, existingItem, mapToInternalLineItemType(key));
    })); }, []);
}
exports.default = mapToInternalLineItems;
function mapToInternalLineItemType(type) {
    switch (type) {
        case 'physicalItems':
            return 'ItemPhysicalEntity';
        case 'digitalItems':
            return 'ItemDigitalEntity';
        case 'giftCertificates':
            return 'ItemGiftCertificateEntity';
        default:
            return '';
    }
}
//# sourceMappingURL=map-to-internal-line-items.js.map