import StandardError from './standard-error';

export default class NotImplementedError extends StandardError {
    constructor(message?: string) {
        super(message || 'Not implemented.');

        this.name = 'NotImplementedError';
        this.type = 'not_implemented';
    }
}
