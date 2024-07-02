import { RequestSender } from '@bigcommerce/request-sender';

import ContentType from '../common/http-request/content-type';
import HostedFormManualOrderData from '../hosted-form-manual-order-data';
import { HostedInputValues } from '../iframe-content';

export class ManualOrderPaymentRequestSender {
    constructor(private _requestSender: RequestSender, private _paymentOrigin: string) {}

    async submitPayment(
        requestInitializationData: HostedFormManualOrderData,
        instrumentFormData: HostedInputValues,
        nonce?: string,
    ): Promise<void> {
        const { paymentMethodId, paymentSessionToken } = requestInitializationData;

        const [expiryMonth, expiryYear] = instrumentFormData.cardExpiry
            ? instrumentFormData.cardExpiry.split('/')
            : [];

        const options = {
            headers: {
                Accept: ContentType.Json,
                'Content-Type': ContentType.Json,
                'X-Payment-Session-Token': paymentSessionToken,
            },
            body: {
                instrument: {
                    type: 'card',
                    name: instrumentFormData.cardName || '',
                    number: instrumentFormData.cardNumber
                        ? instrumentFormData.cardNumber.replace(/ /g, '')
                        : '',
                    expires: {
                        month: Number(expiryMonth.trim()),
                        year: Number(`20${expiryYear.trim()}`),
                    },
                    verification_value: instrumentFormData.cardCode ?? undefined,
                },
                payment_method_id: paymentMethodId,
                form_nonce: nonce || undefined,
            },
        };

        await this._requestSender.post<void>(`${this._paymentOrigin}/payments`, options);
    }
}
