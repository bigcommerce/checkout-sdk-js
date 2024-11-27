import { RequestSender, Response } from '@bigcommerce/request-sender';

import ContentType from '../common/http-request/content-type';
import HostedFormManualOrderData from '../hosted-form-manual-order-data';
import { HostedInputValues } from '../iframe-content';
import { isOfflinePaymentMethodId } from '../utils';

import { Instrument, InstrumentType, offlinePaymentMethodTypeMap } from './Instrument';

export const manualPaymentMethodId = 'bigcommerce.manual_payment';

export class ManualOrderPaymentRequestSender {
    constructor(private _requestSender: RequestSender, private _paymentOrigin: string) {}

    async submitPayment(
        requestInitializationData: HostedFormManualOrderData,
        instrumentFormData: HostedInputValues,
        nonce?: string,
    ): Promise<Response<unknown>> {
        const { paymentMethodId, paymentSessionToken } = requestInitializationData;

        let instrument: Instrument;

        if (paymentMethodId === manualPaymentMethodId) {
            instrument = {
                type: InstrumentType.ManualPayment,
                note: instrumentFormData.note ?? '',
            };
        } else if (isOfflinePaymentMethodId(paymentMethodId)) {
            instrument = {
                type: offlinePaymentMethodTypeMap[paymentMethodId],
            };
        } else {
            const [expiryMonth, expiryYear] = instrumentFormData.cardExpiry
                ? instrumentFormData.cardExpiry.split('/')
                : [];

            instrument = {
                type: InstrumentType.Card,
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
                instrument,
                payment_method_id: paymentMethodId,
                form_nonce: nonce ?? undefined,
            },
        };

        return this._requestSender.post<unknown>(`${this._paymentOrigin}/payments`, options);
    }
}
