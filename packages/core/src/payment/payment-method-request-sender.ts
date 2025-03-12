import { RequestSender, Response } from '@bigcommerce/request-sender';

import {
    ContentType,
    INTERNAL_USE_ONLY,
    RequestOptions,
    SDK_VERSION_HEADERS,
} from '../common/http-request';

import PaymentMethod from './payment-method';

// TODO:: move types to separate files
enum HeadlessPaymentMethodType {
    PAYPALCOMMERCE = 'paypalcommerce.paypal',
    PAYPALCOMMERCECREDIT = 'paypalcommerce.paypalcredit',
}

const paymentMethodConfig: Record<string, HeadlessPaymentMethodType> = {
    paypalcommerce: HeadlessPaymentMethodType.PAYPALCOMMERCE,
    paypalcommercecredit: HeadlessPaymentMethodType.PAYPALCOMMERCECREDIT,
};

interface LoadPaymentMethodResponse<T = any> {
    data: {
        site: {
            paymentWalletWithInitializationData: {
                clientToken?: string;
                initializationData?: T;
            };
        };
    };
}

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
        host?: string,
        { timeout }: RequestOptions = {},
    ): Promise<Response<PaymentMethod>> {
        const path = 'get-initialization-data';
        const url = host ? `${host}/${path}` : `/${path}`;

        const requestOptions = {
            body: {
                entityId: this.getPaymentEntityId(methodId),
            },
            timeout,
        };

        return this._requestSender
            .post<LoadPaymentMethodResponse>(url, requestOptions)
            .then((response) => this.transformToPaymentMethodResponse(response, methodId));
    }

    private transformToPaymentMethodResponse(
        response: Response<LoadPaymentMethodResponse>,
        methodId: string,
    ): Response<PaymentMethod> {
        const {
            body: {
                data: {
                    site: { paymentWalletWithInitializationData },
                },
            },
        } = response;

        return {
            ...response,
            body: {
                initializationData: JSON.parse(
                    atob(paymentWalletWithInitializationData.initializationData),
                ),
                clientToken: paymentWalletWithInitializationData.clientToken,
                id: methodId,
                config: {},
                // TODO:: define method type by methodId
                method: 'paypal',
                supportedCards: [],
                type: 'PAYMENT_TYPE_API',
            },
        };
    }

    private getPaymentEntityId(methodId: string): HeadlessPaymentMethodType {
        const entityId = paymentMethodConfig[methodId];

        if (!entityId) {
            throw new Error('Unable to get payment entity id.');
        }

        return entityId;
    }
}
