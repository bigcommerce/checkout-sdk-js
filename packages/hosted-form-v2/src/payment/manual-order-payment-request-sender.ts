import { RequestSender, Response } from '@bigcommerce/request-sender';

import ContentType from '../common/http-request/content-type';
import HostedFormManualOrderData from '../hosted-form-manual-order-data';
import { HostedInputValues } from '../iframe-content';

interface Instrument {
    type: 'card';
    name: string;
    number: string;
    expires: {
        month: number;
        year: number;
    };
    verification_value?: string;
}

export class ManualOrderPaymentRequestSender {
    constructor(private _requestSender: RequestSender, private _paymentOrigin: string) {}

    async submitPayment(
        requestInitializationData: HostedFormManualOrderData,
        instrumentFormData: HostedInputValues,
        nonce?: string,
    ): Promise<Response<unknown>> {
        let instrument: Instrument | null;
        const { paymentMethodId, paymentSessionToken } = requestInitializationData;

        if (paymentMethodId.includes('.offline')) {
            instrument = null;
        } else {
            const [expiryMonth, expiryYear] = instrumentFormData.cardExpiry
                ? instrumentFormData.cardExpiry.split('/')
                : [];

            instrument = {
                type: 'card',
                name: instrumentFormData.cardName ?? '',
                number: instrumentFormData.cardNumber
                    ? instrumentFormData.cardNumber.replace(/ /g, '')
                    : '',
                expires: {
                    month: Number(expiryMonth.trim()),
                    year: Number(`20${expiryYear.trim()}`),
                },
                verification_value: instrumentFormData.cardCode ?? undefined,
            };
        }

        const options = {
            headers: {
                Accept: ContentType.Json,
                'Content-Type': ContentType.Json,
                'X-Payment-Session-Token': paymentSessionToken,
            },
            body: {
                instrument: {
                    type: 'manual_payment',
                    note: 'noteeeeeeee',
                },
                payment_method_id: 'bigcommerce.manual_payment',
                form_nonce: nonce ?? undefined,
            },
        };

        console.log(options, instrument);

        return this._requestSender.post<unknown>(`${this._paymentOrigin}/payments`, options);
    }
}
