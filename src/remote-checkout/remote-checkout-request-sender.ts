import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class RemoteCheckoutRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    initializeBilling(methodName: string, params?: { referenceId: string }, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = `/remote-checkout/${methodName}/billing`;

        return this._requestSender.get(url, { params, timeout });
    }

    initializeShipping(methodName: string, params?: { referenceId: string }, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = `/remote-checkout/${methodName}/shipping`;

        return this._requestSender.get(url, { params, timeout });
    }

    initializePayment(methodName: string, params?: InitializePaymentOptions, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = `/remote-checkout/${methodName}/payment`;

        return this._requestSender.get(url, { params, timeout });
    }

    loadSettings(methodName: string, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = `/remote-checkout/${methodName}/settings`;

        return this._requestSender.get(url, { timeout });
    }

    signOut(methodName: string, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = `/remote-checkout/${methodName}/signout`;

        return this._requestSender.get(url, { timeout });
    }

    generateToken({ timeout }: RequestOptions = {}): Promise<Response> {
        const url = '/remote-checkout-token';

        return this._requestSender.get(url, { timeout });
    }

    trackAuthorizationEvent({ timeout }: RequestOptions = {}): Promise<Response> {
        const url = '/remote-checkout/events/shopper-checkout-service-provider-authorization-requested';

        return this._requestSender.post(url, { timeout });
    }
}

export interface InitializePaymentOptions {
    authorizationToken?: string;
    customerMessage?: string;
    referenceId?: string;
    useStoreCredit?: boolean;
}
