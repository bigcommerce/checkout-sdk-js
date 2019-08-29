import { Response } from '@bigcommerce/request-sender';

import RequestError from './request-error';

/**
 * Throw this error if there is an unexpected error and it is not possible to
 * recover from unless the shopper creates a new checkout session.
 */
export default class UnrecoverableError extends RequestError {
    constructor(response: Response, message?: string) {
        super(response, {
            message: message || 'An unexpected error has occurred. The checkout process cannot continue as a result.',
        });

        this.name = 'UnrecoverableError';
        this.type = 'unrecoverable';
    }
}
