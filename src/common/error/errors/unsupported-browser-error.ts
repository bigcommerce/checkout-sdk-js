import StandardError from './standard-error';

/**
 * Throw this error if the shopper is using a browser version that is not
 * supported by us or any third party provider we use.
 */
export default class UnsupportedBrowserError extends StandardError {
    constructor(message?: string) {
        super(message || 'Unsupported browser error');

        this.name = 'UnsupportedBrowserError';
        this.type = 'unsupported_browser';
    }
}
