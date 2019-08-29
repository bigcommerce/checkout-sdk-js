import { Response } from '@bigcommerce/request-sender';

import RequestError from './request-error';

/**
 * Throw this error if a request fails to complete within its required timeframe
 * because of a network issue.
 */
export default class TimeoutError extends RequestError<{}> {
    constructor(response?: Response) {
        super(response, {
            message: 'The request has timed out or aborted.',
        });

        this.name = 'TimeoutError';
        this.type = 'timeout';
    }
}
