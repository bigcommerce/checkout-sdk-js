import { HostedInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default interface BigCommercePaymentInitializeOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container: string;

    /**
     * If there is no need to initialize the Smart Payment Button, simply pass false as the option value.
     * The default value is true
     */
    shouldRenderBigCommerceButtonOnInitialization?: boolean;

    /**
     * A callback for getting form fields values.
     */
    getFieldsValues?(): HostedInstrument;

    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: unknown): void;

    /**
     * A callback right before render Smart Payment Button that gets called when
     * Smart Payment Button is eligible. This callback can be used to hide the standard submit button.
     */
    onRenderButton?(): void;

    /**
     * A callback that gets called when strategy is in the process of initialization before rendering Smart Payment Button.
     *
     * @param callback - A function, that calls the method to render the Smart Payment Button.
     */
    onInit?(callback: () => void): void;

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

export interface WithBigCommercePaymentInitializeOptions {
    bigcommerce?: BigCommercePaymentInitializeOptions;
}
