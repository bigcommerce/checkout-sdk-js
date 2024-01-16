import { BirthDate } from '../paypal-commerce-types';

export interface PaypalCommerceRatePay {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container: string;

    /**
     * The CSS selector of a container where the legal text should be inserted into.
     */
    legalTextContainer: string;

    /**
     * The CSS selector of a container where loading indicator should be rendered
     */
    loadingContainerId: string;
    /**
     * A callback that gets form values
     */
    getFieldsValues?(): {
        ratepayBirthDate: BirthDate;
        ratepayPhoneNumber: string;
        ratepayPhoneCountryCode: string;
    };

    /**
     * A callback right before render Smart Payment Button that gets called when
     * Smart Payment Button is eligible. This callback can be used to hide the standard submit button.
     */
    onRenderButton?(): void;

    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: unknown): void;
}

export interface WithPayPalCommerceRatePayPaymentInitializeOptions {
    paypalcommerceratepay?: PaypalCommerceRatePay;
}
