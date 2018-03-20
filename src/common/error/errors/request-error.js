import StandardError from './standard-error';

export default class RequestError extends StandardError {
    /**
     * @constructor
     * @param {Response} response
     * @param {string} [message] - Fallback message
     */
    constructor({ body = {}, headers, status, statusText } = {}, message) {
        super(joinErrors(body.errors) || body.detail || body.title || message || 'An unexpected error has occurred.');

        this.type = 'request';
        this.body = body;
        this.headers = headers;
        this.status = status;
        this.statusText = statusText;
    }
}

/**
 * @private
 * @param {string[] | Array<{ code: string, message: string }>} errors
 * @return {?string}
 */
function joinErrors(errors) {
    if (!Array.isArray(errors)) {
        return;
    }

    return errors.reduce((result, error) => {
        if (typeof error === 'string' && error) {
            return [...result, error];
        }

        if (error && error.message) {
            return [...result, error.message];
        }

        return result;
    }, []).join(' ');
}
