import { Response } from '@bigcommerce/request-sender';

import RequestError from './request-error';

export default class TimeoutError extends RequestError<{}> {
    constructor(response?: Response) {
        super(response, {
            message: 'The request has timed out or aborted.',
        });

        this.type = 'timeout';
    }
}
