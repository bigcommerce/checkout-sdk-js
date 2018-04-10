import { StandardError } from '../../common/error/errors';

export default class PaymentMethodUnsupportedError extends StandardError {
    constructor(name: string) {
        super(`Failed to proceed because "${name}" is not supported.`);

        this.type = 'payment_method_unsupported';
    }
}
