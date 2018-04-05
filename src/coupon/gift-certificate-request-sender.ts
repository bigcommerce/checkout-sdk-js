import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class GiftCertificateRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    applyGiftCertificate(couponCode: string, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = '/internalapi/v1/checkout/coupon';

        return this._requestSender.post(url, { timeout, body: { couponCode } });
    }

    removeGiftCertificate(couponCode: string, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = `/internalapi/v1/checkout/coupon/${couponCode}`;

        return this._requestSender.delete(url, { timeout });
    }
}
