import { RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';

import { Subscriptions } from './subscriptions';

export default class SubscriptionsRequestSender {
    constructor(private _requestSender: RequestSender) {}

    updateSubscriptions(
        subscriptions: Subscriptions,
        { timeout }: RequestOptions = {},
    ): Promise<Response<Subscriptions>> {
        const url = '/api/storefront/subscriptions';
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender.post(url, { body: subscriptions, headers, timeout });
    }
}
