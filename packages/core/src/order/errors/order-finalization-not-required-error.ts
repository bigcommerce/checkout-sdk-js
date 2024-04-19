import { StandardError } from '../../common/error/errors';

/**
 * Throw this error if we are trying to make an order finalization request for a
 * payment method that does not require such procedure.
 */
export default class OrderFinalizationNotRequiredError extends StandardError {
    constructor() {
        super('The current order does not need to be finalized at this stage.');

        this.name = 'OrderFinalizationNotRequiredError';
        this.type = 'order_finalization_not_required';
    }
}
