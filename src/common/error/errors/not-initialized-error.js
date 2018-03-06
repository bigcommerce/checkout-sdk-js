import StandardError from './standard-error';

export default class NotInitializedError extends StandardError {
    /**
     * @constructor
     * @param {string} [message]
     */
    constructor(message) {
        super(message || 'Not initialized.');

        this.type = 'not_initialized';
    }
}
