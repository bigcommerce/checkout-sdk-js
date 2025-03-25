import { RequestSender, Response } from '@bigcommerce/request-sender';

import {
    ContentType,
    INTERNAL_USE_ONLY,
    RequestOptions,
    SDK_VERSION_HEADERS,
} from '../common/http-request';

import {
    GqlPaymentMethodConfig,
    GqlPaymentMethodResponse,
    GqlPaymentMethodType,
} from './gql-payment';
import GqlPaymentRequestOptions from './gql-payment/gql-payment-request-options';
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
     * Headless payment requests
     */
    loadPaymentWalletWithInitializationData(
        methodId: string,
        { timeout }: RequestOptions = {},
    ): Promise<Response<PaymentMethod>> {
        const url = `${window.location.origin}/api/wallet-buttons/get-initialization-data`;

        const requestOptions: GqlPaymentRequestOptions = {
            body: {
                entityId: this._getPaymentEntityId(methodId),
            },
            timeout,
        };

        return this._requestSender
            .post<GqlPaymentMethodResponse>(url, requestOptions)
            .then((response) => paymentMethodTransformer(response, methodId));
    }

    private _getPaymentEntityId(methodId: string): GqlPaymentMethodType {
        const entityId = GqlPaymentMethodConfig[methodId];

        if (!entityId) {
            throw new Error('Unable to get payment entity id.');
        }

        return entityId;
    }
}
