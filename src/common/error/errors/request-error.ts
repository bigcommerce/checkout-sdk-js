import { Response } from '@bigcommerce/request-sender';

import StandardError from './standard-error';

const DEFAULT_RESPONSE = {
    body: {},
    headers: {},
    status: 0,
    statusText: '',
};

export default class RequestError extends StandardError {
    body: any;
    headers: { [key: string]: any; };
    status: number;
    statusText: string;

    constructor({ body = {}, headers, status, statusText }: Response = DEFAULT_RESPONSE, message?: string) {
        super(joinErrors(body.errors) || body.detail || body.title || message || 'An unexpected error has occurred.');

        this.type = 'request';
        this.body = body;
        this.headers = headers;
        this.status = status;
        this.statusText = statusText;
    }
}

function joinErrors(errors: Array<string | { code: string, message: string }>): string | undefined {
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
