import { StandardError } from '../../common/error/errors';

/**
 * Throw this error if the order finalization request
 * was not completed successfully.
 */
export default class OrderFinalizationNotCompletedError extends StandardError {
    constructor(message?: string) {
        super(message || 'The current order could not be finalized successfully');

        this.name = 'OrderFinalizationNotCompletedError';
        this.type = 'order_finalization_not_completed';
    }
}
