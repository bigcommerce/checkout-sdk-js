import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

import { PaymentMethodsResponseBody, PaymentMethodResponseBody } from './payment-method-responses';

export default class PaymentMethodRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    loadPaymentMethods({ timeout }: RequestOptions = {}): Promise<Response<PaymentMethodsResponseBody>> {
        const url = '/internalapi/v1/checkout/payments';

        return this._requestSender.get(url, { timeout });
    }

    loadPaymentMethod(methodId: string, { timeout }: RequestOptions = {}): Promise<Response<PaymentMethodResponseBody>> {
        const url = `/internalapi/v1/checkout/payments/${methodId}`;

        return this._requestSender.get(url, { timeout });
    }
}
