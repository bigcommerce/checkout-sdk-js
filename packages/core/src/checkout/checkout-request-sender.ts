import { RequestSender, Response } from '@bigcommerce/request-sender';

import {
    ContentType,
    joinOrMergeIncludes,
    RequestOptions,
    SDK_VERSION_HEADERS,
} from '../common/http-request';

import Checkout, { CheckoutRequestBody } from './checkout';
import CHECKOUT_DEFAULT_INCLUDES from './checkout-default-includes';
import CheckoutParams from './checkout-params';
import { CheckoutNotAvailableError } from './errors';
import { HeadlessCheckout } from './headless-checkout/headless-checkout';
import { HeadlessCheckoutRequestResponse } from './headless-checkout/headless-checkout-request-response';
import mapToCheckout from './headless-checkout/map-to-checkout';

export default class CheckoutRequestSender {
    constructor(private _requestSender: RequestSender) {}

    loadCheckout(
        id: string,
        { params: { include } = {}, timeout }: RequestOptions<CheckoutParams> = {},
    ): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkout/${id}`;
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender
            .get<Checkout>(url, {
                params: {
                    include: joinOrMergeIncludes(CHECKOUT_DEFAULT_INCLUDES, include),
                },
                headers,
                timeout,
            })
            .catch((error) => {
                if (error.status >= 400 && error.status < 500) {
                    throw new CheckoutNotAvailableError(error);
                }

                throw error;
            });
    }

    updateCheckout(
        id: string,
        body: CheckoutRequestBody,
        { params: { include } = {}, timeout }: RequestOptions<CheckoutParams> = {},
    ): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkout/${id}`;
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender.put(url, {
            params: {
                include: joinOrMergeIncludes(CHECKOUT_DEFAULT_INCLUDES, include),
            },
            body,
            headers,
            timeout,
        });
    }

    loadHeadlessCheckout(
        host?: string,
        options?: RequestOptions,
    ): Promise<Response<HeadlessCheckout>> {
        const path = 'load-checkout';
        const url = host ? `${host}/${path}` : `/${path}`;

        return this._requestSender
            .get<HeadlessCheckoutRequestResponse>(url, {
                ...options,
            })
            .then(this.transformToCheckoutResponse);
    }

    private transformToCheckoutResponse(
        response: Response<HeadlessCheckoutRequestResponse>,
    ): Response<HeadlessCheckout> {
        const {
            body: {
                data: { site },
            },
        } = response;

        return {
            ...response,
            // TODO:: need to update HeadlessCheckoutRequestResponse providing all required data
            // eslint-disable-next-line
            // @ts-ignore
            body: mapToCheckout(site),
        };
    }
}
