import { StandardError } from '../../common/error/errors';

export default class PaymentMethodUninitializedError extends StandardError {
    constructor(name: string) {
        super(`Failed to proceed because "${name}" has not been initialized.`);

        this.type = 'payment_method_uninitialized';
    }
}
