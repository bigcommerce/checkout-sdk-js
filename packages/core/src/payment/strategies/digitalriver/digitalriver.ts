export interface DigitalRiverWindow extends Window {
    /**
     * Object to create an instance of the DigitalRiver object. This is called a Digital River publishable API key
     * This function accepts an optional options object using the following format DigitalRiver(publishableApiKey{, options})
     * https://docs.digitalriver.com/digital-river-api/payment-integrations-1/digitalriver.js/reference/digital-river-publishable-api-key
     */
    DigitalRiver?: DigitalRiverClass;
}

export type DigitalRiverClass = new(apiKey: string, options?: DigitalRiverJSOptions) => DigitalRiverJS;

export default interface DigitalRiverJS {
    createDropin(configuration: DigitalRiverDropInConfiguration): DigitalRiverDropIn;
    authenticateSource(data: DigitalRiverAuthenticateSourceRequest): Promise<DigitalRiverAuthenticateSourceResponse>;
    createElement(type: string, options: DigitalRiverElementOptions): DigitalRiverElement;
}

export interface DigitalRiverElementOptions {
    classes: {
        base: string;
    };
    compliance: {
        entity: string;
    };
}

interface DigitalRiverAuthenticateSourceRequest {
    sessionId: string;
    sourceId: string;
    sourceClientSecret: string;
}

export interface DigitalRiverAdditionalProviderData {
    source_id: string;
    source_client_secret: string;
}

export interface DigitalRiverAuthenticateSourceResponse {
    status: AuthenticationSourceStatus;
}

export enum AuthenticationSourceStatus {
    complete = 'complete',
    authentication_not_required = 'authentication_not_required',
    failed = 'failed',
}

export interface DigitalRiverJSOptions {
    /**
     * The locale used to localize the various display and error strings within DigitalRiver.js
     * Currently supported locales:
     * ar-EG, cs-CZ, da-DK, de-AT, de-CH, de-DE, el-GR, en-AU, en-BE, en-CA, en-CH, en-DK, en-FI, en-GB, en-IE, en-IN,
     * en-MY, en-NL, en-NO, en-NZ, en-PR, en-SE, en-SG, en-US, en-ZA, es-AR, es-CL, es-CO, es-EC, es-ES, es-MX, es-PE,
     * es-VE, et-EE, fi-FI, fr-BE, fr-CA, fr-CH, fr-FR, hu-HU, it-CH, it-IT, iw-IL, ja-JP, ko-KR, lt-LT, lv-LV, nl-BE,
     * nl-NL, no-NO, pl-PL, pt-BR, pt-PT, ro-RO, ru-RU, sk-SK, sl-SI, sr-YU, sv-SE, th-TH, tr-TR, zh-CN, zh-HK, zh-TW
     * https://docs.digitalriver.com/digital-river-api/payment-integrations-1/digitalriver.js/reference/digital-river-publishable-api-key
     */
    locale?: string;
}

/**
 * Create a Configuration object for Drop-in
 * https://docs.digitalriver.com/digital-river-api/payment-integrations-1/drop-in/drop-in-integration-guide#step-5-configure-hydrate
 */
export interface DigitalRiverDropInConfiguration {
    /**
     * The  payment session identifier returned by Digital River.
     */
    sessionId: string;

    /**
     * you can specify options to trigger different features or functionality
     */
    options?: OptionsResponse;
    billingAddress: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        address: {
            line1: string;
            line2?: string;
            city?: string;
            state?: string;
            postalCode: string;
            country: string;
        };
    };

    /**
     * Additional configuration details for configuration structure (classes, styles etc..)
     */
    paymentMethodConfiguration?: BaseElementOptions;

    /**
     * The function called when the shopper has authorized payment and a payment source has been successfully created.
     */
    onSuccess?(data: OnSuccessResponse): void;

    /**
     * The function called when the shopper cancels the payment process before authorizing payment.
     */
    onCancel?(error: OnCancelOrErrorResponse): void;

    /**
     * The function called when an error has occurred.
     */
    onError?(error: OnCancelOrErrorResponse): void;

    /**
     * The function called when Drop-in is ready for user interaction.
     */
    onReady?(data: OnReadyResponse): void;
}

export interface OnCancelOrErrorResponse {
    /**
     * If an error occurs, Drop-in emits an event that identifies the payment method associated with the error.
     * Instruct your customer to provide a new method of payment.
     * https://docs.digitalriver.com/digital-river-api/payment-integrations-1/drop-in/drop-in-integration-guide#onerror
     * Or When your customer chooses to pay with a specific payment method and decides to cancel during the redirect phase,
     * Drop-in emits an event that identifies the cancelled payment method.
     * https://docs.digitalriver.com/digital-river-api/payment-integrations-1/drop-in/drop-in-integration-guide#oncancel
     */
    errors: ErrorData[];
}

export interface ErrorData {
    code: string;
    message: string;
}

export interface OnReadyResponse {
    /**
     * When ready, Drop-in will emit an event that contains a "paymentMethodTypes" array of the available payment methods.
     * https://docs.digitalriver.com/digital-river-api/payment-integrations-1/drop-in/drop-in-integration-guide#onready
     */
    paymentMethodTypes: string[];
}

/**
 * When creating your Drop-in instance, you can specify options to trigger different features or functionality.
 * https://docs.digitalriver.com/digital-river-api/payment-integrations-1/drop-in/drop-in-integration-guide#drop-in-options
 */
export interface OptionsResponse {
    /**
     * Use this option if you are using Drop-in within a standard checkout flow. Example Value: "checkout"
     */
    flow?: string;

    /**
     * When enabled, presents the customer with an option to save their payment details for future use within Drop-in.
     * Enabling this feature will show the appropriate check boxes and localized disclosure statements and facilitate
     * any necessary Strong Customer Authentication.
     * If disabled, Drop-in will not present the customer with an option to save their payment details.
     */
    showSavePaymentAgreement?: boolean;

    /**
     * Will show a localized compliance link section as part of Drop-in. This is an important piece for accessing the Digital River business model.
     */
    showComplianceSection?: boolean;

    /**
     * Use this option to customize the text of the Drop-in button.
     */
    button?: ButtonResponse;

    /**
     * Use this option to specify the future use of a source.
     */
    usage?: string;

    /**
     * Use this option to show the required terms of sale disclosure. These localized terms automatically update if recurring products are purchased.
     */
    showTermsOfSaleDisclosure?: boolean;

    /**
     * Additional configuration details for drop-in.
     */
    paymentMethodConfiguration?: BaseElementOptions;
}

export interface ButtonResponse {
    /**
     * https://docs.digitalriver.com/digital-river-api/payment-integrations-1/drop-in/drop-in-integration-guide#customizing-the-text-of-the-drop-in-button
     * The text of the Drop-in button is customizable. You can either display pre-configured text or you can specify a unique text
     * Examples type: "payNow" || type: "buyNow" || type: "completeOrder" || type: "submitOrder"
     */
    type: string;
}

export interface OnSuccessResponse {
    /**
     * Event that gets triggered after the customer's payment has provided with the necessary details for payment
     * https://docs.digitalriver.com/digital-river-api/payment-integrations-1/drop-in/drop-in-integration-guide#onsuccess
     */
    source: {
        id: string;
        reusable: boolean;
        browserInfo?: {
            browserIp?: string;
        };
        owner: {
            email: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
            address: {
                city: string;
                country: string;
                line1: string;
                postalCode: string;
                state: string;
            }
        }
    }

    /**
     * Indicates whether the source has been enabled for future use.
     * Important: If this value is true, it does not mean the customer can use this source multiple times.
     * This flag identifies whether the necessary downstream actions have been triggered to prepare the source for storage.
     * You must attach the source to your customer for it to be truly reusable.
     */
    readyForStorage: boolean;
}

export interface DigitalRiverDropIn {
    /**
     * https://docs.digitalriver.com/digital-river-api/payment-integrations-1/drop-in/drop-in-integration-guide#step-7-place-drop-in-on-your-checkout-or-customer-page
     * example "drop-in"
     */
    mount(dropInId: string): void;
}

interface DigitalRiverElement {
    /**
     * https://docs.digitalriver.com/digital-river-api/payment-integrations-1/drop-in/drop-in-integration-guide#step-7-place-drop-in-on-your-checkout-or-customer-page
     * example "drop-in"
     */
    mount(dropInId: string): void;
}

interface BaseElementOptions {
    /**
     * Set custom class names on the container DOM element when the Digital River element is in a particular state.
     */
    classes?: DigitalRiverElementClasses;
}

/**
 * Custom classes
 * You can specify custom classes as part of a Class object included within the Options object when you create or
 * update an element. If you do not provide custom classes, the system uses the default options.
 * https://docs.digitalriver.com/digital-river-api/payment-integrations-1/digitalriver.js/reference/elements#custom-classes
 */
export interface DigitalRiverElementClasses {
    /**
     * The Element is in its base state. The user either has not entered anything into the input field or is currently typing.
     */
    base?: string;

    /**
     * The Element is in its complete state. The user has input value, and it meets the basic validation requirements of that field.
     */
    complete?: string;

    /**
     * The Element is empty. The Element once had value but is now empty.
     */
    empty?: string;

    /**
     * The Element has focus.
     */
    focus?: string;

    /**
     * The Element has value, but it does not meet the basic validation requirements of the field.
     */
    invalid?: string;

    /**
     * The element has a value that has been automatically filled by the browser.
     */
    webkitAutofill?: string;
}

export interface DigitalRiverInitializeToken {
    sessionId: string;
    checkoutData: DigitalRiverCheckoutData;
}

interface DigitalRiverCheckoutData {
    checkoutId: string;
    sellingEntity: string;
}
