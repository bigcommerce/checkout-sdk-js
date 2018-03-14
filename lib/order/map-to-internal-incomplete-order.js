"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function mapToInternalIncompleteOrder(checkout, existingOrder) {
    return {
        orderId: checkout.orderId,
        token: existingOrder.token,
        payment: existingOrder.payment,
        socialData: existingOrder.socialData,
        status: existingOrder.status,
        customerCreated: existingOrder.customerCreated,
        hasDigitalItems: existingOrder.hasDigitalItems,
        isDownloadable: existingOrder.isDownloadable,
        isComplete: existingOrder.isComplete,
        callbackUrl: existingOrder.callbackUrl,
    };
}
exports.default = mapToInternalIncompleteOrder;
//# sourceMappingURL=map-to-internal-incomplete-order.js.map