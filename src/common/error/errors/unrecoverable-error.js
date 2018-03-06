import RequestError from './request-error';

export default class UnrecoverableError extends RequestError {
    /**
     * @constructor
     * @param {Response} response
     * @param {string} [message]
     */
    constructor(response, message) {
        super(response, message || 'An unexpected error has occurred. The checkout process cannot continue as a result.');

        this.type = 'unrecoverable';
    }
}
