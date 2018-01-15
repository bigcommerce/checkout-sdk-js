import { StandardError } from '../../common/error/errors';

export default class PaymentMethodUnsupportedError extends StandardError {
    /**
     * @constructor
     * @param {string} name
     */
    constructor(name) {
        super(`Failed to proceed because "${name}" is not supported.`);

        this.type = 'payment_method_unsupported';
    }
}
