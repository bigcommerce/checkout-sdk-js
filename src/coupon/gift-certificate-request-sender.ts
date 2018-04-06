import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class GiftCertificateRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    applyGiftCertificate(checkoutId: string, giftCertificateCode: string, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = `/api/storefront/checkouts/${checkoutId}/gift-certificates`;

        return this._requestSender.post(url, { timeout, body: { giftCertificateCode } });
    }

    removeGiftCertificate(checkoutId: string, giftCertificateCode: string, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = `/api/storefront/checkouts/${checkoutId}/gift-certificates/${giftCertificateCode}`;

        return this._requestSender.delete(url, { timeout });
    }
}
