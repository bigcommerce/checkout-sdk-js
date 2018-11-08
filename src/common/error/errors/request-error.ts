import { Response } from '@bigcommerce/request-sender';

import StandardError from './standard-error';

const DEFAULT_RESPONSE = {
    body: {},
    headers: {},
    status: 0,
};

export default class RequestError<TBody = any> extends StandardError {
    body: TBody | {};
    headers: { [key: string]: any; };
    errors: Array<{ code: string, message?: string }>;
    status: number;

    constructor(
        response?: Response<TBody | {}>,
        { message, errors }: {
            message?: string;
            errors?: Array<{ code: string, message?: string }>,
        } = {}
    ) {
        const { body, headers, status } = response || DEFAULT_RESPONSE;

        super(message || 'An unexpected error has occurred.');

        this.type = 'request';
        this.body = body;
        this.headers = headers;
        this.status = status;
        this.errors = errors || [];
    }
}
