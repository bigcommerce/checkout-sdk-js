import { RequestSender, Response } from '@bigcommerce/request-sender';

import { Checkout } from '../checkout';
import { ContentType, RequestOptions } from '../common/http-request';

export default class GiftCertificateRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    applyGiftCertificate(checkoutId: string, giftCertificateCode: string, { timeout }: RequestOptions = {}): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/gift-certificates`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.post(url, { headers, timeout, body: { giftCertificateCode } });
    }

    removeGiftCertificate(checkoutId: string, giftCertificateCode: string, { timeout }: RequestOptions = {}): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/gift-certificates/${giftCertificateCode}`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.delete(url, { headers, timeout });
    }
}
