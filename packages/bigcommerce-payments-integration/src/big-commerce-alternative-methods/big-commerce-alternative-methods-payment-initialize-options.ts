import { BigCommerceFieldsStyleOptions, InitCallbackActions } from '../big-commerce-types';

export default interface BigCommerceAlternativeMethodsPaymentOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container: string;

    /**
     * The CSS selector of a container where the alternative payment methods fields widget should be inserted into.
     * It's necessary to specify this parameter when using Alternative Payment Methods.
     * Without it alternative payment methods will not work.
     */
    apmFieldsContainer?: string;

    /**
     * Object with styles to customize alternative payment methods fields.
     */
    apmFieldsStyles?: BigCommerceFieldsStyleOptions;

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

    /**
     * A callback that gets called
     * when Smart Payment Button is initialized.
     */
    onInitButton(actions: InitCallbackActions): Promise<void>;
}

export interface WithBigCommerceAlternativeMethodsPaymentInitializeOptions {
    bigcommerce?: BigCommerceAlternativeMethodsPaymentOptions; // FIXME: this option is deprecated
    bigcommercealternativemethods?: BigCommerceAlternativeMethodsPaymentOptions;
}
