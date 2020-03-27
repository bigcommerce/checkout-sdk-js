import { RequestSender } from '@bigcommerce/request-sender';

import { ContentType, INTERNAL_USE_ONLY } from '../../../common/http-request';

import { OrderData } from './paypal-commerce-sdk';

export default class PaypalCommerceRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    async setupPayment(cartId: string): Promise<OrderData> {
        const url = '/api/storefront/payment/paypalcommerce';
        const body = { cartId };
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
        };

        const res = await this._requestSender.post(url, { headers, body });

        return res.body;
    }
}
