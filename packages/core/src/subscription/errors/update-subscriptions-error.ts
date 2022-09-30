import { RequestError } from "@bigcommerce/checkout-sdk/payment-integration-api";

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
