import { RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, INTERNAL_USE_ONLY, RequestOptions } from '../common/http-request';

import PaymentMethod from './payment-method';

export default class PaymentMethodRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    loadPaymentMethods({ timeout }: RequestOptions = {}): Promise<Response<PaymentMethod[]>> {
        const url = '/api/storefront/payments';

        return this._requestSender.get(url, {
            timeout,
            headers: {
                Accept: ContentType.JsonV1,
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
            },
        });
    }

    loadPaymentMethod(methodId: string, { timeout }: RequestOptions = {}): Promise<Response<PaymentMethod>> {
        const url = `/api/storefront/payments/${methodId}`;

        return this._requestSender.get(url, {
            timeout,
            headers: {
                Accept: ContentType.JsonV1,
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
            },
        });
    }
}
