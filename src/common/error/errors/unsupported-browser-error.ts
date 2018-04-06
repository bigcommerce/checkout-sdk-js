import StandardError from './standard-error';

export default class UnsupportedBrowserError extends StandardError {
    constructor(message?: string) {
        super(message || 'Unsupported browser error');

        this.type = 'unsupported_browser';
    }
}
