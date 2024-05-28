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
        return {
            authToken: data.authToken,
            values,
            nonce,
        };
    }
}
