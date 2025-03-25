import { RequestSender } from '@bigcommerce/request-sender';

import {
    ContentType,
    INTERNAL_USE_ONLY,
    RequestOptions,
    SDK_VERSION_HEADERS,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    CreatePaymentOrderIntentOptions,
    CreatePaymentOrderIntentResponse,
    CreateRedirectToCheckoutResponse,
    PayPalCreateOrderRequestBody,
    PayPalOrderData,
    PayPalOrderStatusData,
    PayPalUpdateOrderRequestBody,
    PayPalUpdateOrderResponse,
} from './paypal-commerce-types';

export default class PayPalCommerceRequestSender {
    constructor(private requestSender: RequestSender) {}

    async createOrder(
        providerId: string,
        requestBody: Partial<PayPalCreateOrderRequestBody>,
    ): Promise<PayPalOrderData> {
        const url = `/api/storefront/payment/${providerId}`;
        const body = requestBody;
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        const res = await this.requestSender.post<PayPalOrderData>(url, { headers, body });

        return res.body;
    }

    async updateOrder(
        requestBody: PayPalUpdateOrderRequestBody,
    ): Promise<PayPalUpdateOrderResponse> {
        const url = `/api/storefront/initialization/paypalcommerce`;
        const body = requestBody;
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        const res = await this.requestSender.put<PayPalUpdateOrderResponse>(url, { headers, body });

        return res.body;
    }

    async getOrderStatus(
        methodId = 'paypalcommerce',
        options?: RequestOptions,
    ): Promise<PayPalOrderStatusData> {
        const url = `/api/storefront/initialization/${methodId}`;
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        const res = await this.requestSender.get<PayPalOrderStatusData>(url, {
            headers,
            ...options,
        });

        return res.body;
    }

    async createPaymentOrderIntent(
        walletEntityId: string,
        cartId: string,
        options?: CreatePaymentOrderIntentOptions,
    ): Promise<PayPalOrderData> {
        const url = `${window.location.origin}/api/wallet-buttons/create-payment-wallet-intent`;

        const requestOptions: CreatePaymentOrderIntentOptions = {
            body: {
                ...options?.body,
                walletEntityId,
                cartId,
            },
        };

        const res = await this.requestSender.post<CreatePaymentOrderIntentResponse>(
            url,
            requestOptions,
        );

        const {
            data: {
                payment: {
                    paymentWallet: {
                        createPaymentWalletIntent: { paymentWalletIntentData, errors },
                    },
                },
            },
        } = res.body;

        const errorMessage = errors[0]?.message;

        if (errorMessage) {
            throw new Error(errorMessage);
        }

        return {
            orderId: paymentWalletIntentData.orderId,
            approveUrl: paymentWalletIntentData.approvalUrl,
        };
    }

    async getRedirectToCheckoutUrl(
        url: string,
        options?: CreatePaymentOrderIntentOptions,
    ): Promise<string> {
        const res = await this.requestSender.get<CreateRedirectToCheckoutResponse>(url, options);

        const {
            data: {
                cart: {
                    createCartRedirectUrls: { redirectUrls },
                },
            },
        } = res.body;

        if (!redirectUrls?.redirectedCheckoutUrl) {
            throw new Error('Failed to redirection to checkout page');
        }

        return redirectUrls.redirectedCheckoutUrl;
    }
}
