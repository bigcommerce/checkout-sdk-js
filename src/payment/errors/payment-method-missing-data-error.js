import { StandardError } from '../../common/error/errors';

export default class PaymentMethodMissingDataError extends StandardError {
    /**
     * @constructor
     * @param {string} name
     */
    constructor(field) {
        super(`Failed to proceed because payment method misses "${field}" data`);

        this.type = 'payment_method_missing_data';
    }
}
