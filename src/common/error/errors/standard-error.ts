import { setPrototypeOf } from '../../utility';

import CustomError from './custom-error';

/**
 * This error type should not be constructed directly. It is a base class for
 * all custom errors thrown in this library.
 */
export default abstract class StandardError extends Error implements CustomError {
    name = 'StandardError';
    type = 'standard';

    constructor(message?: string) {
        super(message || 'An unexpected error has occurred.');

        setPrototypeOf(this, new.target.prototype);

        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, new.target);
        } else {
            this.stack = (new Error(this.message)).stack;
        }
    }
}
