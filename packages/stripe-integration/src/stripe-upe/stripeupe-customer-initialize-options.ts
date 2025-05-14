export default interface StripeUPECustomerInitializeOptions {
    /**
     * The ID of a container which the stripe iframe should be inserted.
     */
    container: string;

    /**
     * The identifier of the payment method.
     */
    methodId: string;

    /**
     * The identifier of the payment provider providing the payment method. This
     * option is only required if the provider offers multiple payment options.
     * i.e.: Stripeupe and Klarna.
     */
    gatewayId: string;

    /**
     * A callback that gets called whenever the Stripe Link Authentication Element's value changes.
     *
     * @param authenticated - if the email is authenticated on Stripe.
     * @param email - The new value of the email.
     */
    onEmailChange(authenticated: boolean, email: string): void;

    /**
     * A callback that gets called when Stripe Link Authentication Element is Loaded.
     */
    isLoading(mounted: boolean): void;

    /**
     * get styles from store theme
     */
    getStyles?():
        | {
              [key: string]: string;
          }
        | undefined;
}

export interface WithStripeUPECustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using StripeUPE.
     */
    stripeupe?: StripeUPECustomerInitializeOptions;
    stripe_link_v2?: StripeUPECustomerInitializeOptions;
}
