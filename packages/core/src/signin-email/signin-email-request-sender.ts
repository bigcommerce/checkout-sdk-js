import { RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';
import { parseUrl } from '../common/url';

import { SignInEmail, SignInEmailRequestBody } from './signin-email';

export default class SignInEmailRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    sendSignInEmail(
        {
            email,
            redirectUrl,
        }: SignInEmailRequestBody,
        {
            timeout,
        }: RequestOptions = {}
    ): Promise<Response<SignInEmail>> {
        const url = '/login.php?action=passwordless_login';
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        const href = window.top ? window.top.location.href : '';

        return this._requestSender.post(url, { body: {
            email,
            redirect_url: redirectUrl || parseUrl(href).pathname, 
        }, headers, timeout });
    }
}
