export default interface BigCommerceVenmoPaymentInitializeOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container: string;

    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: Error): void;

    /**
     * A callback right before render Smart Payment Button that gets called when
     * Smart Payment Button is eligible. This callback can be used to hide the standard submit button.
     */
    onRenderButton?(): void;

    /**
     * A callback that gets called when a buyer click on Smart Payment Button
     * and should validate payment form.
     *
     * @param resolve - A function, that gets called if form is valid.
     * @param reject - A function, that gets called if form is not valid.
     *
     * @returns reject() or resolve()
     */
    onValidate(resolve: () => void, reject: () => void): Promise<void>;

    /**
     * A callback for submitting payment form that gets called
     * when buyer approved BigCommerce account.
     */
    submitForm(): void;
}

export interface WithBigCommerceVenmoPaymentInitializeOptions {
    bigcommerce?: BigCommerceVenmoPaymentInitializeOptions; // FIXME: this option is deprecated
    bigcommerce_payments_venmo?: BigCommerceVenmoPaymentInitializeOptions;
}
