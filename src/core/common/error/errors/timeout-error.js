import StandardError from './standard-error';

export default class TimeoutError extends StandardError {
    /**
     * @constructor
     * @param {Response} [response]
     */
    constructor(response) {
        super('The request has timed out or aborted.', response);

        this.type = 'timeout';
    }
}
