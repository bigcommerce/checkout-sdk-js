import RequestError from './request-error';

export default class TimeoutError extends RequestError {
    /**
     * @constructor
     * @param {Response} [response]
     */
    constructor(response) {
        super(response, 'The request has timed out or aborted.');

        this.type = 'timeout';
    }
}
