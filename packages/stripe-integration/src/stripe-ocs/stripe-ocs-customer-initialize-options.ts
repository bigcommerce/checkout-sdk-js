export default interface StripeOCSCustomerInitializeOptions {
    /**
     * The ID of a container which the stripe iframe should be inserted.
     */
    container: string;

    /**
     * The identifier of the payment method.
     */
    methodId: string;

    gatewayId: string;

    isLoading(mounted: boolean): void;
}

export interface WithStripeOCSCustomerInitializeOptions {
    stripe_link_v2?: StripeOCSCustomerInitializeOptions;
}
