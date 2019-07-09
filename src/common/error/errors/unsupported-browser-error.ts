import StandardError from './standard-error';

export default class UnsupportedBrowserError extends StandardError {
    constructor(message?: string) {
        super(message || 'Unsupported browser error');

        this.name = 'UnsupportedBrowserError';
        this.type = 'unsupported_browser';
    }
}
