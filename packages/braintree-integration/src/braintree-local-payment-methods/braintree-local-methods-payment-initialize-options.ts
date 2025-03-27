export interface BraintreeLocalMethodsPaymentInitializeOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container: string;
    /**
     * Text that will be displayed on lpm button
     */
    buttonText: string;
    /**
     * A callback right before render Smart Payment Button that gets called when
     * This callback can be used to hide the standard submit button.
     */
    onRenderButton?(): void;
    /**
     * A callback for submitting payment form that gets called
     * when buyer approved PayPal account.
     */
    submitForm?(): void;
    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError(error: unknown): void;

    /**
     * Loading container ID
     */
    loadingContainerId: string;
}

export interface WithBraintreeLocalMethodsPaymentInitializeOptions {
    braintreelocalmethods?: BraintreeLocalMethodsPaymentInitializeOptions;
}
