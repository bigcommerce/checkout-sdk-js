import StandardError from './standard-error';

export default class NotImplementedError extends StandardError {
    constructor(message?: string) {
        super(message || 'Not implemented.');

        this.type = 'not_implemented';
    }
}
