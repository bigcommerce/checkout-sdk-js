import { RequestSender } from '@bigcommerce/request-sender';

import { ContentType, INTERNAL_USE_ONLY, SDK_VERSION_HEADERS } from '../../../common/http-request';

import { OrderData, OrderStatus, ShippingChangeData } from './paypal-commerce-sdk';

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

    async setCountry(countryId: string) {
        const url = `remote/v1/country-states/${countryId}`;
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };
        const res = await this._requestSender.get<OrderStatus>(url, {headers});

        return res.body;
    }

    async setShippingQuote(countryId: string, stateId: number, city: string, stateCode: string) {
        const url = `remote/v1/shipping-quote?city=${city}&country_id=${countryId}&state_id=${stateId}&zip_code=${stateCode}`;
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };
        const res = await this._requestSender.get<OrderStatus>(url, {headers});

        return res.body;
    }

    async updateShippingQuote(shippingOptionIndex: number) {
        const url = `remote/v1/shipping-quote`;
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };
        const res = await this._requestSender.get<OrderStatus>(url, {body:{shipping_method: shippingOptionIndex}, headers});

        return res.body;
    }

    async deleteCart(cartId: string) {
        const url = `/api/storefront/cart/${cartId}`;
        const res = await this._requestSender.delete(url);

        return res.body;
    }

    async setShippingOptions(payload: ShippingChangeData) {
        const url = `/api/storefront/initialization/paypalcommerce`;
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };
        const res = await this._requestSender.put(url, {body: payload, headers});

        return res.body;
    }
}
