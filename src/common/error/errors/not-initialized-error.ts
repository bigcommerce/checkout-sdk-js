import StandardError from './standard-error';

export default class NotInitializedError extends StandardError {
    constructor(message?: string) {
        super(message || 'Not initialized.');

        this.type = 'not_initialized';
    }
}
