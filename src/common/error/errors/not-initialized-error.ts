import StandardError from './standard-error';

export default class NotInitializedError extends StandardError {
    constructor(message?: string) {
        super(message || 'Unable to proceed because the required component has not been initialized.');

        this.type = 'not_initialized';
    }
}
