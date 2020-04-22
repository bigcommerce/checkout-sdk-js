import { RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, RequestOptions } from '../common/http-request';

import { SignInEmail } from './signin-email';

export default class SignInEmailRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    sendSignInEmail(email: string, { timeout }: RequestOptions = {}): Promise<Response<SignInEmail>> {
        const url = '/login.php?action=passwordless_login';
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.post(url, { body: { email }, headers, timeout });
    }
}
