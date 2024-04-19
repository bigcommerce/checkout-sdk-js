import { RequestError } from '../../common/error/errors';

/**
 * This error should be thrown when the subscriptions fails to be updated
 */
export default class UpdateSubscriptionsError extends RequestError {
    constructor(response?: Response) {
        super(response);

        this.name = 'UpdateSubscriptionsError';
        this.type = 'update_subscriptions';
    }
}
