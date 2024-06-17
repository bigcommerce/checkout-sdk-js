import HostedFormOrderData from '../hosted-form-order-data';
import { HostedInputValues } from '../iframe-content';

export class PaymentRequestTransformer {
    transform() {
        return {};
    }

    transformWithHostedFormData(
        values: HostedInputValues,
        data: HostedFormOrderData,
        nonce: string,
    ) {
        // TODO: CHECKOUT-8275 need to add the actual implementation when implementing submitPayment
        return {
            authToken: data.authToken,
            values,
            nonce,
        };
    }
}
