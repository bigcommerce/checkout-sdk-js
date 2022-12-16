import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class RemoteCheckoutRequestSender {
    constructor(private _requestSender: RequestSender) {}

    initializeBilling(
        methodName: string,
        params?: { referenceId: string },
        { timeout }: RequestOptions = {},
    ): Promise<Response<any>> {
        const url = `/remote-checkout/${methodName}/billing`;

        return this._requestSender.get(url, { params, timeout, headers: SDK_VERSION_HEADERS });
    }

    initializeShipping(
        methodName: string,
        params?: { referenceId: string },
        { timeout }: RequestOptions = {},
    ): Promise<Response<any>> {
        const url = `/remote-checkout/${methodName}/shipping`;

        return this._requestSender.get(url, { params, timeout, headers: SDK_VERSION_HEADERS });
    }

    initializePayment(
        methodName: string,
        params?: InitializePaymentOptions,
        { timeout }: RequestOptions = {},
    ): Promise<Response<any>> {
        const url = `/remote-checkout/${methodName}/payment`;

        return this._requestSender.get(url, { params, timeout, headers: SDK_VERSION_HEADERS });
    }

    loadSettings(methodName: string, { timeout }: RequestOptions = {}): Promise<Response<any>> {
        const url = `/remote-checkout/${methodName}/settings`;

        return this._requestSender.get(url, { timeout, headers: SDK_VERSION_HEADERS });
    }

    signOut(methodName: string, { timeout }: RequestOptions = {}): Promise<Response<any>> {
        const url = `/remote-checkout/${methodName}/signout`;

        return this._requestSender.get(url, { timeout, headers: SDK_VERSION_HEADERS });
    }

    generateToken({ timeout }: RequestOptions = {}): Promise<Response<any>> {
        const url = '/remote-checkout-token';

        return this._requestSender.get(url, { timeout, headers: SDK_VERSION_HEADERS });
    }

    trackAuthorizationEvent({ timeout }: RequestOptions = {}): Promise<Response<any>> {
        const url =
            '/remote-checkout/events/shopper-checkout-service-provider-authorization-requested';

        return this._requestSender.post(url, { timeout, headers: SDK_VERSION_HEADERS });
    }

    forgetCheckout({ timeout }: RequestOptions = {}): Promise<Response<any>> {
        const url = `/remote-checkout/forget-checkout`;

        return this._requestSender.post(url, { timeout, headers: SDK_VERSION_HEADERS });
    }
}

export interface InitializePaymentOptions {
    authorizationToken?: string;
    customerMessage?: string;
    referenceId?: string;
    useStoreCredit?: boolean;
}
