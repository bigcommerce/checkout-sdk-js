import StandardError from './standard-error';

/**
 * Throw this error if we try to call a method that is only a stub and has not
 * been fully implemented.
 */
export default class NotImplementedError extends StandardError {
    constructor(message?: string) {
        super(message || 'Not implemented.');

        this.name = 'NotImplementedError';
        this.type = 'not_implemented';
    }
}
