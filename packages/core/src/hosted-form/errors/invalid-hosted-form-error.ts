import { StandardError } from '../../common/error/errors';

export default class InvalidHostedFormError extends StandardError {
    constructor(message?: string) {
        super(message || 'Unable to proceed due to an unknown error with the hosted payment form.');

        this.name = 'InvalidHostedFormError';
        this.type = 'invalid_hosted_form';
    }
}
