import { RequestSender } from '@bigcommerce/request-sender';

import { ContentType, INTERNAL_USE_ONLY, SDK_VERSION_HEADERS } from '../../../common/http-request';

import { OrderData, OrderStatus } from './paypal-commerce-sdk';

export interface ParamsForProvider {
    isCredit?: boolean;
    isCheckout?: boolean;
    isCreditCard?: boolean;
    isAPM?: boolean;
}

export default class PaypalCommerceRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    async setupPayment(cartId: string, params: ParamsForProvider = {}): Promise<OrderData> {
        const { isCredit, isCheckout, isCreditCard, isAPM } = params;
        let provider = 'paypalcommerce';

        if (isCreditCard) {
            provider = 'paypalcommercecreditcardscheckout';
        } else if (isCheckout) {
            provider = isCredit ? 'paypalcommercecreditcheckout' : 'paypalcommercecheckout';
        } else if (isCredit) {
            provider = 'paypalcommercecredit';
        }

        if (isAPM) {
            provider = 'paypalcommercealternativemethodscheckout';
        }

        const url = `/api/storefront/payment/${provider}`;
        const body = { cartId };
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        const res = await this._requestSender.post(url, { headers, body });

        return res.body as OrderData;
    }

    async getOrderStatus() {
        const url = '/api/storefront/initialization/paypalcommerce';
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        const res = await this._requestSender.get<OrderStatus>(url, {headers});

        return res.body;
    }

    async deleteCart(cartId: string) {
        const url = `/api/storefront/cart/${cartId}`;
        const res = await this._requestSender.delete(url);

        return res.body;
    }

    async getBilling(checkoutId: string, consignmentId: string, selected: string) {
        const url = `/api/storefront/checkouts/${checkoutId}/consignments/${consignmentId}`;
        const res = await this._requestSender.put(url, {body: {shippingOptionId: selected}});

        return res.body;
    }
}
