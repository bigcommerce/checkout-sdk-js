import StandardError from './standard-error';

export default class MissingDataError extends StandardError {
    constructor(message?: string) {
        super(message || 'Unable to proceed because required data is missing.');

        this.type = 'missing_data';
    }
}
