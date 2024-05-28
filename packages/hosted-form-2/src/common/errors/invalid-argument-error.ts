import StandardError from './standard-error';

/**
 * This error should be thrown when a method is unable to proceed because the
 * caller has not provided all the arguments according to their requirements,
 * i.e.: if an argument is missing or it is not the expected data type.
 */
export default class InvalidArgumentError extends StandardError {
    constructor(message?: string) {
        super(message || 'Invalid arguments have been provided.');

        this.name = 'InvalidArgumentError';
        this.type = 'invalid_argument';
    }
}
