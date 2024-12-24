import { RequestSender, Response } from '@bigcommerce/request-sender';

import {
    ContentType,
    INTERNAL_USE_ONLY,
    RequestOptions,
    SDK_VERSION_HEADERS,
} from '../common/http-request';

import {
    HeadlessPaymentMethodConfig,
    HeadlessPaymentMethodResponse,
    HeadlessPaymentMethodType,
    HeadlessPaymentRequestOptions,
} from './headless-payment';
import PaymentMethod from './payment-method';
import paymentMethodTransformer from './payment-method-transformer';

export default class PaymentMethodRequestSender {
    constructor(private _requestSender: RequestSender) {}

    loadPaymentMethods({ timeout, params }: RequestOptions = {}): Promise<
        Response<PaymentMethod[]>
    > {
        const url = '/api/storefront/payments';

        return this._requestSender.get(url, {
            timeout,
            headers: {
                Accept: ContentType.JsonV1,
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                ...SDK_VERSION_HEADERS,
            },
            params,
        });
    }

    loadPaymentMethod(
        methodId: string,
        { timeout, params }: RequestOptions = {},
    ): Promise<Response<PaymentMethod>> {
        const url = `/api/storefront/payments/${methodId}`;

        return this._requestSender.get(url, {
            timeout,
            headers: {
                Accept: ContentType.JsonV1,
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                ...SDK_VERSION_HEADERS,
            },
            params,
        });
    }

    /**
     * GraphQL payment requests
     */
    loadPaymentWalletWithInitializationData(
        methodId: string,
        options: HeadlessPaymentRequestOptions,
    ): Promise<Response<PaymentMethod>> {
        const entityId = this._getPaymentEntityId(methodId);

        const graphQLQuery = `
            query {
                site {
                    paymentWalletWithInitializationData(filter: { paymentWalletEntityId: "${entityId}" }) {
                        clientToken
                        initializationData
                    }
                }
            }
        `;

        const requestOptions: HeadlessPaymentRequestOptions = {
            headers: {
                ...options.headers,
                'Content-Type': 'application/json',
            },
            body: {
                query: graphQLQuery,
            },
        };

        return this._requestSender
            .post<HeadlessPaymentMethodResponse>('/graphql', requestOptions)
            .then((response) => paymentMethodTransformer(response, methodId));
    }

    private _getPaymentEntityId(methodId: string): HeadlessPaymentMethodType {
        const entityId = HeadlessPaymentMethodConfig[methodId];

        if (!entityId) {
            throw new Error('Unable to get payment entity id.');
        }

        return entityId;
    }
}
