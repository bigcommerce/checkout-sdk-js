import { StandardError } from '../../common/error/errors';

export default class InvalidHostedFormConfigError extends StandardError {
    constructor(message?: string) {
        super(message || 'Unable to proceed due to invalid configuration provided for the hosted payment form.');

        this.name = 'InvalidHostedFormConfigError';
        this.type = 'invalid_hosted_form_config';
    }
}
