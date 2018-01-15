import StandardError from './standard-error';

export default class NotImplementedError extends StandardError {
    /**
     * @constructor
     * @param {string} [message]
     */
    constructor(message) {
        super(message || 'Not implemented.');

        this.type = 'not_implemented';
    }
}
