export interface CurrencyExponent {
    [key: string]: number;
}

export interface AdyenApplePayComponentOptions {
    currencyCode: string;
    amount: number;
    /**
     * The two-letter country code of your merchant account.
     */
    countryCode: string;
    configuration: {
        /**
         * The merchant name that you want displayed on the Apple Pay payment sheet.
         */
        merchantName: string;
        /**
         * Your Apple Merchant ID.
         */
        merchantIdentifier: string;
    };
    /**
     * The type of button you want to be displayed in the payments form.
     */
    buttonType?: string;
    /**
     * Specify the color of the button.
     */
    buttonColor?: string;
    /**
     * Calls your server with validationURL, which then requests a payment session from Apple Pay servers.
     *
     * Your server then receives the session and calls resolve(MERCHANTSESSION) or reject() to complete merchant validation.
     */
    onValidateMerchant(resolve: () => void, reject: () => void, validationURL: string): void;
}
