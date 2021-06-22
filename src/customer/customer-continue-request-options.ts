import { RequestOptions } from '../common/http-request';

/**
 * A set of options for configuring any requests related to the customer step of
 * the current checkout flow.
 *
 * Some payment methods needs to have their own checkout flow. Therefore, you
 * need to indicate the method you want to use if you need to trigger a specific
 * flow for a customer.
 *
 * If you want to use default behavior, you can pass 'default' as methodId,
 * to use default strategy
 */
export interface CustomerContinueRequestOptions extends RequestOptions {
    methodId: string;
}

/**
 * TODO: write description
 */
export interface CustomerContinueOptions extends CustomerContinueRequestOptions {
    email: string;

    /**
     * Fallback function contains default customer flow script
     * that must be used to run it after or skip current step
     */
    fallback(): void;
}
