import { Response } from '@bigcommerce/request-sender';

import RequestError from './request-error';

export default class UnrecoverableError extends RequestError {
    constructor(response: Response, message?: string) {
        super(response, message || 'An unexpected error has occurred. The checkout process cannot continue as a result.');

        this.type = 'unrecoverable';
    }
}
