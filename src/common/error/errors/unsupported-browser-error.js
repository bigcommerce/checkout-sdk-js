import StandardError from './standard-error';

export default class UnsupportedBrowserError extends StandardError {
    /**
     * @constructor
     * @param {string} [message]
     */
    constructor(message) {
        super(message || 'Unsupported browser error');

        this.type = 'unsupported_browser';
    }
}
