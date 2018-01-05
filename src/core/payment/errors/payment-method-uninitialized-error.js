import { StandardError } from '../../common/error/errors';

export default class PaymentMethodUninitializedError extends StandardError {
    /**
     * @constructor
     * @param {string} name
     */
    constructor(name) {
        super(`Failed to proceed because "${name}" has not been initialized.`);

        this.type = 'payment_method_uninitialized';
    }
}
