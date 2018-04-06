import { Response } from '@bigcommerce/request-sender';

import RequestError from './request-error';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class TimeoutError extends RequestError {
    constructor(response?: Response) {
        super(response, 'The request has timed out or aborted.');

        this.type = 'timeout';
    }
}
