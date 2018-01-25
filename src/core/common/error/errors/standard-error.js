import { setPrototypeOf } from '../../utility';

export default class StandardError extends Error {
    /**
     * @constructor
     * @param {string} [message]
     */
    constructor(message) {
        super(message || 'An unexpected error has occurred.');

        setPrototypeOf(this, new.target.prototype);

        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, new.target);
        } else {
            this.stack = (new Error(this.message)).stack;
        }
    }
}
