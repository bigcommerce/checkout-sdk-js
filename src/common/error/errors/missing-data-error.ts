import StandardError from './standard-error';

export default class MissingDataError extends StandardError {
    constructor(message?: string) {
        super(message || 'Unable to call this method because the data required for the call is not available. Please refer to the documentation to see what you need to do in order to obtain the required data.');

        this.type = 'missing_data';
    }
}
