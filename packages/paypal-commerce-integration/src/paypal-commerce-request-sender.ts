import { RequestSender } from '@bigcommerce/request-sender';

import {
    ContentType,
    INTERNAL_USE_ONLY,
    RequestOptions,
    SDK_VERSION_HEADERS,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { GraphQLRequestOptions } from '@bigcommerce/checkout-sdk/headless-wallet-button-integration';

import {
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
        options?: GraphQLRequestOptions,
    ): Promise<PayPalOrderData> {
        const path = 'wallet/graphql';

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
                        initializationEntityId
                        orderId
                      }
                    }
                  }
                }
              }
            }
        `;

        const requestOptions: GraphQLRequestOptions = {
            headers: {
                ...options?.headers,
                'Content-Type': 'application/json',
            },
            body: {
                ...options?.body,
                query: graphQLQuery,
            },
        };

        const res = await this.requestSender.post<CreatePaymentOrderIntentResponse>(
            `${window.location.origin}/${path}`,
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
        cartId: string,
        orderId: string,
        options?: GraphQLRequestOptions,
    ): Promise<string> {
        const path = 'wallet/graphql';

        const graphQLQuery = `
          mutation {
              cart {
                createCartRedirectUrls(
                  input: {
                    paymentWalletData: {
                      initializationId: 51,
                      providerId: "paypalcommerce",
                      providerOrderId: ${orderId}
                    },
                    cartEntityId: ${cartId},
                    queryParams: [
                      {key: "payment_type", value: "paypal"},
                      {key: "action", value: "set_external_checkout"},
                      {key: "provider", value: "paypalcommerce"}
                      ]
                  }
                ) {
                  redirectUrls {
                    externalCheckoutUrl
                  }
                }
              }
          }
        `;

        const requestOptions: GraphQLRequestOptions = {
            headers: {
                ...options?.headers,
                'Content-Type': 'application/json',
            },
            body: {
                ...options?.body,
                query: graphQLQuery,
            },
        };

        const res = await this.requestSender.get<CreateRedirectToCheckoutResponse>(
            `${window.location.origin}/${path}`,
            requestOptions,
        );

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
