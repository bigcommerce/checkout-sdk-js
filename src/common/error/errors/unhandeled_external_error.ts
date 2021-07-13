import StandardError from './standard-error';

/**
 * Throw this error if we get an error from external services/partners.
 */
export default class UnhandledExternalError extends StandardError {
    constructor(message?: string) {
        super(message || 'Unhandled external error.');

        this.name = 'UnhandledExternalError';
        this.type = 'unhandled_external';
    }
}
