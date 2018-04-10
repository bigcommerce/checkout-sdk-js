import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Response<T>
 */
export default class PaymentMethodRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    loadPaymentMethods({ timeout }: RequestOptions = {}): Promise<Response> {
        const url = '/internalapi/v1/checkout/payments';

        return this._requestSender.get(url, { timeout });
    }

    loadPaymentMethod(methodId: string, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = `/internalapi/v1/checkout/payments/${methodId}`;

        return this._requestSender.get(url, { timeout });
    }
}
