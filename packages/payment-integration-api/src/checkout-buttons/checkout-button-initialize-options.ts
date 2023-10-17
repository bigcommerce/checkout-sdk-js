import RequestOptions from '../util-types/request-options';

/**
 * The set of options for configuring the checkout button.
 */
export interface CheckoutButtonOptions extends RequestOptions {
    /**
     * The identifier of the payment method.
     */
    methodId: string;
}

export default interface CheckoutButtonInitializeOptions extends CheckoutButtonOptions {
    [key: string]: unknown;
    /**
     * The ID of a container which the checkout button should be inserted.
     */
    containerId: string;
}
