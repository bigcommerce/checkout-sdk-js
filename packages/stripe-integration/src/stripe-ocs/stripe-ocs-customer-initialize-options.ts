import { ShippingOption } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default interface StripeOCSCustomerInitializeOptions {
    buttonHeight?: number;

    /**
     * The ID of a container which the stripe iframe should be inserted.
     */
    container: string;

    /**
     * The identifier of the payment method.
     */
    methodId: string;

    gatewayId: string;

    onComplete?: (orderId?: number) => Promise<never>;

    loadingContainerId?: string;

    /**
     * @param shippingOptions - The available shipping options.
     * @returns The filtered shipping options.
     * A function that filters the available shipping options.
     */
    filterAvailableShippingOptions?: (
        shippingOptions: ShippingOption[],
    ) => Promise<ShippingOption[]>;
}

export interface WithStripeOCSCustomerInitializeOptions {
    stripeocs?: StripeOCSCustomerInitializeOptions;
}
