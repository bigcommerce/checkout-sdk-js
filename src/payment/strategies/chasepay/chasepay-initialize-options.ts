export default interface ChasePayInitializeOptions {
    /**
     * This container is used to host the chasepay branding logo.
     * It should be an HTML element.
     */
    logoContainer?: string;

    /**
     * This walletButton is used to set an event listener, provide an element ID if you want
     * users to be able to launch the ChasePay wallet modal by clicking on a button.
     * It should be an HTML element.
     */
    walletButton?: string;

    /**
     * A callback that gets called when the customer selects a payment option.
     */
    onPaymentSelect?(): void;

    /**
     * A callback that gets called when the customer cancels their payment selection.
     */
    onCancel?(): void;
}
