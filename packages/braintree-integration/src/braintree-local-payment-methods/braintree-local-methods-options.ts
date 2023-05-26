export interface WithBraintreeLocalMethodsPaymentInitializeOptions {
    braintreelocalmethods?: BraintreeLocalMethods;
}

export interface BraintreeLocalMethods {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container: string;
    /**
     * Text that will be displayed on lpm button
     */
    buttonText: string;
    /**
     * Css classes of lpm button
     */
    classNames: string;
    /**
     * A callback right before render Smart Payment Button that gets called when
     * This callback can be used to hide the standard submit button.
     */
    onRenderButton(): void;
    /**
     * A callback for submitting payment form that gets called
     * when buyer approved PayPal account.
     */
    submitForm(): void;
    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError(error: any): void;
    /**
     * A callback that gets called when a buyer click on Smart Payment Button
     * and should validate payment form.
     * @returns reject() or resolve()
     */
    onValidate(): Promise<void>;
}

export interface LocalPaymentInstanceConfig {
    paymentType: string;
    amount: number;
    fallback: {
        url: string;
        buttonText: string;
    };
    currencyCode: string;
    shippingAddressRequired: boolean;
    email: string;
    givenName: string;
    surname: string;
    address: {
        countryCode: string;
    }
    onPaymentStart(data: onPaymentStartData, start: () => Promise<void>): void;
}

export interface StartPaymentError {
    code: string;
}

export interface onPaymentStartData {
    paymentId: string;
}

export interface LocalPaymentsPayload {
    nonce: string;
}

export interface LocalPaymentInstance {
    startPayment(
        config: LocalPaymentInstanceConfig,
        callback: (
            startPaymentError: StartPaymentError,
            payload: LocalPaymentsPayload
        ) => void
    ): void;
}

export type GetLocalPaymentInstance = (localPaymentInstance: LocalPaymentInstance) => void;
