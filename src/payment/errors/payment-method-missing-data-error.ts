import { StandardError } from '../../common/error/errors';

export default class PaymentMethodMissingDataError extends StandardError {
    constructor(field: string) {
        super(`Failed to proceed because payment method misses "${field}" data`);

        this.type = 'payment_method_missing_data';
    }
}
