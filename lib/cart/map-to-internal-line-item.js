"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function mapToInternalLineItem(item, existingItem, type) {
    return {
        amount: existingItem.amount,
        amountAfterDiscount: existingItem.amountAfterDiscount,
        attributes: existingItem.attributes,
        discount: item.discountAmount,
        id: item.id,
        imageUrl: item.imageUrl,
        integerAmount: existingItem.integerAmount,
        integerAmountAfterDiscount: existingItem.integerAmountAfterDiscount,
        integerDiscount: existingItem.integerDiscount,
        integerTax: existingItem.integerTax,
        name: item.name,
        quantity: item.quantity,
        tax: existingItem.tax,
        variantId: item.variantId,
        type: type,
    };
}
exports.default = mapToInternalLineItem;
//# sourceMappingURL=map-to-internal-line-item.js.map