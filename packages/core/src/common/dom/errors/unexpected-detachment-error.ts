import { StandardError } from '../../error/errors';

export default class UnexpectedDetachmentError extends StandardError {
    constructor(message?: string) {
        super(message || 'Unable to proceed because the required element is unexpectedly detached from the page.');

        this.name = 'UnexpectedDetachmentError';
        this.type = 'unexpected_detachment';
    }
}
