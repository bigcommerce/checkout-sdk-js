import { Checkout } from '../checkout';

import InternalIncompleteOrder from './internal-incomplete-order';

export default function mapToInternalIncompleteOrder(checkout: Checkout, existingOrder: InternalIncompleteOrder): InternalIncompleteOrder {
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
