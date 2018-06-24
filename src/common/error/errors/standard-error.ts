import { setPrototypeOf } from '../../utility';

export default class StandardError extends Error {
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
