import { StandardError } from '../../common/error/errors';

export default class InvalidBillingAddressError extends StandardError {
    constructor(message: string) {
        super(message);

        this.name = 'InvalidBillingAddressError';
        this.type = 'invalid_billing_address';
    }
}
