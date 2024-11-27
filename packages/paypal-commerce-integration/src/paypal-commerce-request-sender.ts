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

    /**
     *
     * GraphQL methods
     *
     */
    async createPaymentOrderIntent(
        walletEntityId: string,
        cartId: string,
        options: CreatePaymentOrderIntentOptions,
    ): Promise<PayPalOrderData> {
        const url = '/graphql';

        const graphQLQuery = `
            mutation {
              payment {
                paymentWallet {
                  createPaymentWalletIntent(
                    input: {cartEntityId: "${cartId}", paymentWalletEntityId: "${walletEntityId}"}
                  ) {
                    errors {
                      ... on CreatePaymentWalletIntentGenericError {
                        __typename
                        message
                      }
                    }
                    paymentWalletIntentData {
                      ... on PayPalCommercePaymentWalletIntentData {
                        __typename
                        approvalUrl
                        orderId
                      }
                    }
                  }
                }
              }
            }
        `;

        const requestOptions: CreatePaymentOrderIntentOptions = {
            headers: {
                ...options?.headers,
                'Content-Type': 'application/json',
            },
            body: {
                ...options.body,
                query: graphQLQuery,
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
            // TODO:: add error handling
            throw new Error(errorMessage);
        }

        return {
            orderId: paymentWalletIntentData.orderId,
            approveUrl: paymentWalletIntentData.approvalUrl,
        };
    }
}
