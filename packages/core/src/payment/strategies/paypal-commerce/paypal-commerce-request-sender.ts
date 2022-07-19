import { RequestSender } from '@bigcommerce/request-sender';

import { ContentType, INTERNAL_USE_ONLY, SDK_VERSION_HEADERS } from '../../../common/http-request';

import { OrderData, OrderStatus } from './paypal-commerce-sdk';

export interface ParamsForProvider {
    isCredit?: boolean;
    isCheckout?: boolean;
    isCreditCard?: boolean;
    isAPM?: boolean;
    isVenmo?: boolean;
}

export default class PaypalCommerceRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    // TODO: this method should be removed when provider will be passed as an argument
    // (to prevent containing unnecessary provider detecting logic inside)
    async setupPayment(cartId: string, params: ParamsForProvider = {}): Promise<OrderData> {
        const { isCredit, isCheckout, isCreditCard, isAPM, isVenmo} = params;
        let provider = 'paypalcommerce';

        if (isCreditCard) {
            provider = 'paypalcommercecreditcardscheckout';
        } else if (isCheckout) {
            provider = isCredit ? 'paypalcommercecreditcheckout' : 'paypalcommercecheckout';
        } else if (isCredit) {
            provider = 'paypalcommercecredit';
        }
        if (isVenmo && !isAPM) {
            provider = isCheckout ? 'paypalcommercevenmocheckout' : 'paypalcommercevenmo';
        }

        if (isAPM) {
            provider = isCheckout ? 'paypalcommercealternativemethodscheckout' : 'paypalcommercealternativemethod';
        }

        return this.createOrder(cartId, provider);
    }

    async createOrder(cartId: string, providerId: string): Promise<OrderData> {
        const url = `/api/storefront/payment/${providerId}`;
        const body = { cartId };
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        const res = await this._requestSender.post<OrderData>(url, { headers, body });

        return res.body;
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
}
