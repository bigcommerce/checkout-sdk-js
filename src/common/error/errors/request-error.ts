import { Response } from '@bigcommerce/request-sender';

import ErrorResponseBody, { ErrorListResponseBody } from '../error-response-body';

import StandardError from './standard-error';

const DEFAULT_RESPONSE = {
    body: {
        errors: undefined,
        detail: undefined,
        title: undefined,
    },
    headers: {},
    status: 0,
    statusText: '',
};

// todo: this request error accepts a TPayload, but there should be subclasses for different request errors
// with well defined payloads (e.g. Internal Order API, Payment (BigPay) and Storefront API).
export default class RequestError<TPayload extends ErrorResponseBody = any> extends StandardError {
    body: TPayload | {};
    headers: { [key: string]: any; };
    status: number;
    statusText: string;

    constructor(response?: Response<TPayload>, message?: string) {
        const { body, headers, status, statusText } = response || DEFAULT_RESPONSE;

        super(joinErrors(body.errors) || body.detail || body.title || message || 'An unexpected error has occurred.');

        this.type = 'request';
        this.body = response ? response.body : {};
        this.headers = headers;
        this.status = status;
        this.statusText = statusText;
    }
}

function joinErrors(errors?: ErrorListResponseBody): string | undefined {
    if (!Array.isArray(errors)) {
        return;
    }

    return errors.reduce((result: string[], error) => {
        if (typeof error === 'string') {
            return [...result, error];
        }

        if (error && error.message) {
            return [...result, error.message];
        }

        return result;
    }, []).join(' ');
}
