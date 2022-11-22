/// <reference types="applepayjs" />

import { createTimeout } from '@bigcommerce/request-sender';
import { RequestOptions as RequestOptions_2 } from '@bigcommerce/request-sender';
import { Response as Response_2 } from '@bigcommerce/request-sender';
import { Timeout } from '@bigcommerce/request-sender';

declare type AccountInstrument = PayPalInstrument | BankInstrument;

declare interface Address extends AddressRequestBody {
    country: string;
    shouldSaveAddress?: boolean;
}

declare type AddressKey = keyof Address;

declare interface AddressRequestBody {
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    stateOrProvince: string;
    stateOrProvinceCode: string;
    countryCode: string;
    postalCode: string;
    phone: string;
    customFields: Array<{
        fieldId: string;
        fieldValue: string | number | string[];
    }>;
}

declare interface AdyenAdditionalActionCallbacks {
    /**
     * A callback that gets called before adyen component is loaded
     */
    onBeforeLoad?(shopperInteraction?: boolean): void;
    /**
     * A callback that gets called when adyen component is loaded
     */
    onLoad?(cancel?: () => void): void;
    /**
     * A callback that gets called when adyen component verification
     * is completed
     */
    onComplete?(): void;
}

declare interface AdyenAdditionalActionCallbacks_2 {
    /**
     * A callback that gets called before adyen component is loaded
     */
    onBeforeLoad?(shopperInteraction?: boolean): void;
    /**
     * A callback that gets called when adyen component is loaded
     */
    onLoad?(cancel?: () => void): void;
    /**
     * A callback that gets called when adyen component verification
     * is completed
     */
    onComplete?(): void;
}

declare interface AdyenAdditionalActionOptions extends AdyenAdditionalActionCallbacks {
    /**
     * The location to insert the additional action component.
     */
    containerId: string;
    /**
     * Specify Three3DS2Challenge Widget Size
     *
     * Values
     * '01' = 250px x 400px
     * '02' = 390px x 400px
     * '03' = 500px x 600px
     * '04' = 600px x 400px
     * '05' = 100% x 100%
     */
    widgetSize?: string;
}

declare interface AdyenAdditionalActionOptions_2 extends AdyenAdditionalActionCallbacks_2 {
    /**
     * The location to insert the additional action component.
     */
    containerId: string;
    /**
     * Specify Three3DS2Challenge Widget Size
     *
     * Values
     * '01' = 250px x 400px
     * '02' = 390px x 400px
     * '03' = 500px x 600px
     * '04' = 600px x 400px
     * '05' = 100% x 100%
     */
    widgetSize?: string;
}

declare interface AdyenBaseCardComponentOptions {
    /**
     * Array of card brands that will be recognized by the component.
     *
     */
    brands?: string[];
    /**
     * Set a style object to customize the input fields. See Styling Secured Fields
     * for a list of supported properties.
     */
    styles?: StyleOptions;
}

declare interface AdyenBaseCardComponentOptions_2 {
    /**
     * Array of card brands that will be recognized by the component.
     *
     */
    brands?: string[];
    /**
     * Set a style object to customize the input fields. See Styling Secured Fields
     * for a list of supported properties.
     */
    styles?: StyleOptions_2;
    showBrandsUnderCardNumber?: boolean;
}

declare interface AdyenComponent {
    componentRef?: {
        showValidation(): void;
    };
    props?: {
        type?: string;
    };
    state?: CardState;
    mount(containerId: string): HTMLElement;
    unmount(): void;
}

declare interface AdyenComponent_2 {
    componentRef?: {
        showValidation(): void;
    };
    props?: {
        type?: string;
    };
    state?: CardState_2;
    mount(containerId: string): HTMLElement;
    unmount(): void;
}

declare interface AdyenComponentEvents {
    /**
     * Called when the shopper enters data in the card input fields.
     * Here you have the option to override your main Adyen Checkout configuration.
     */
    onChange?(state: AdyenComponentState, component: AdyenComponent): void;
    /**
     * Called in case of an invalid card number, invalid expiry date, or
     *  incomplete field. Called again when errors are cleared.
     */
    onError?(state: AdyenV2ValidationState, component: AdyenComponent): void;
    onFieldValid?(state: AdyenV2ValidationState, component: AdyenComponent): void;
}

declare interface AdyenComponentEvents_2 {
    /**
     * Called when the shopper enters data in the card input fields.
     * Here you have the option to override your main Adyen Checkout configuration.
     */
    onChange?(state: AdyenV3ComponentState, component: AdyenComponent_2): void;
    /**
     * Called in case of an invalid card number, invalid expiry date, or
     *  incomplete field. Called again when errors are cleared.
     */
    onError?(state: AdyenV3ValidationState, component: AdyenComponent_2): void;
    onFieldValid?(state: AdyenV3ValidationState, component: AdyenComponent_2): void;
}

declare type AdyenComponentState = (CardState | WechatState);

declare interface AdyenCreditCardComponentOptions extends AdyenBaseCardComponentOptions, AdyenComponentEvents {
    /**
     * Set an object containing the details array for type: scheme from
     * the /paymentMethods response.
     */
    details?: InputDetail[];
    /**
     * Set to true to show the checkbox to save card details for the next payment.
     */
    enableStoreDetails?: boolean;
    /**
     * Set to true to request the name of the card holder.
     */
    hasHolderName?: boolean;
    /**
     * Set to true to require the card holder name.
     */
    holderNameRequired?: boolean;
    /**
     * Information to prefill fields.
     */
    data?: AdyenPlaceholderData;
    /**
     * Defaults to ['mc','visa','amex']. Configure supported card types to
     * facilitate brand recognition used in the Secured Fields onBrand callback.
     * See list of available card types. If a shopper enters a card type not
     * specified in the GroupTypes configuration, the onBrand callback will not be invoked.
     */
    groupTypes?: string[];
    /**
     * Specify the sample values you want to appear for card detail input fields.
     */
    placeholders?: CreditCardPlaceHolder | SepaPlaceHolder;
}

declare interface AdyenIdealComponentOptions {
    /**
     * Optional. Set to **false** to remove the bank logos from the iDEAL form.
     */
    showImage?: boolean;
}

declare interface AdyenPaymentMethodState {
    type: string;
}

declare interface AdyenPaymentMethodState_2 {
    type: string;
}

declare interface AdyenPlaceholderData {
    holderName?: string;
    billingAddress?: {
        street: string;
        houseNumberOrName: string;
        postalCode: string;
        city: string;
        stateOrProvince: string;
        country: string;
    };
}

declare interface AdyenPlaceholderData_2 {
    holderName?: string;
    billingAddress?: {
        street: string;
        houseNumberOrName: string;
        postalCode: string;
        city: string;
        stateOrProvince: string;
        country: string;
    };
}

declare interface AdyenThreeDS2Options extends AdyenAdditionalActionCallbacks {
    /**
     * Specify Three3DS2Challenge Widget Size
     *
     * Values
     * '01' = 250px x 400px
     * '02' = 390px x 400px
     * '03' = 500px x 600px
     * '04' = 600px x 400px
     * '05' = 100% x 100%
     */
    widgetSize?: string;
}

declare enum AdyenV2CardFields {
    CardNumber = "encryptedCardNumber",
    SecurityCode = "encryptedSecurityCode",
    ExpiryDate = "encryptedExpiryDate"
}

/**
 * A set of options that are required to initialize the AdyenV2 payment method.
 *
 * Once AdyenV2 payment is initialized, credit card form fields, provided by the
 * payment provider as IFrames, will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 *
 * ```html
 * <!-- This is where the credit card component will be inserted -->
 * <div id="container"></div>
 *
 * <!-- This is where the secondary components (i.e.: 3DS) will be inserted -->
 * <div id="additional-action-container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'adyenv2',
 *     adyenv2: {
 *         containerId: 'container',
 *         additionalActionOptions: {
 *             containerId: 'additional-action-container',
 *         },
 *     },
 * });
 * ```
 *
 * Additional options can be passed in to customize the components and register
 * event callbacks.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'adyenv2',
 *     adyenv2: {
 *         containerId: 'container',
 *         additionalActionOptions: {
 *             containerId: 'additional-action-container',
 *             onBeforeLoad(shopperInteraction) {
 *                 console.log(shopperInteraction);
 *             },
 *             onLoad(cancel) {
 *                 console.log(cancel);
 *             },
 *             onComplete() {
 *                 console.log('Completed');
 *             },
 *         },
 *         options: {
 *             scheme: {
 *                 hasHolderName: true,
 *             },
 *             bcmc: {
 *                 hasHolderName: true,
 *             },
 *             ideal: {
 *                 showImage: true,
 *             },
 *         },
 *     },
 * });
 * ```
 */
declare interface AdyenV2PaymentInitializeOptions {
    /**
     * The location to insert the Adyen component.
     */
    containerId: string;
    /**
     * @deprecated The location to insert the Adyen 3DS V2 component.
     * Use additionalActionOptions instead as this property will be removed in the future
     */
    threeDS2ContainerId: string;
    /**
     * The location to insert the Adyen custom card component
     */
    cardVerificationContainerId?: string;
    /**
     * True if the Adyen component has some Vaulted instrument
     */
    hasVaultedInstruments?: boolean;
    /**
     * @deprecated
     * Use additionalActionOptions instead as this property will be removed in the future
     */
    threeDS2Options?: AdyenThreeDS2Options;
    /**
     * A set of options that are required to initialize additional payment actions.
     */
    additionalActionOptions: AdyenAdditionalActionOptions;
    /**
     * Optional. Overwriting the default options
     */
    options?: Omit_3<AdyenCreditCardComponentOptions, 'onChange'> | AdyenIdealComponentOptions;
    shouldShowNumberField?: boolean;
    validateCardFields(validateState: AdyenV2ValidationState): void;
}

declare interface AdyenV2ValidationState {
    valid: boolean;
    fieldType?: AdyenV2CardFields;
    endDigits?: string;
    encryptedFieldName?: string;
    i18n?: string;
    error?: string;
    errorKey?: string;
}

declare enum AdyenV3CardFields {
    CardNumber = "encryptedCardNumber",
    SecurityCode = "encryptedSecurityCode",
    ExpiryDate = "encryptedExpiryDate"
}

declare type AdyenV3ComponentState = CardState_2 | WechatState_2;

declare interface AdyenV3CreditCardComponentOptions extends AdyenBaseCardComponentOptions_2, AdyenComponentEvents_2 {
    /**
     * Set an object containing the details array for type: scheme from
     * the /paymentMethods response.
     */
    details?: InputDetail_2[];
    /**
     * Set to true to show the checkbox to save card details for the next payment.
     */
    enableStoreDetails?: boolean;
    /**
     * Set to true to request the name of the card holder.
     */
    hasHolderName?: boolean;
    /**
     * Set to true to require the card holder name.
     */
    holderNameRequired?: boolean;
    /**
     * Information to prefill fields.
     */
    data?: AdyenPlaceholderData_2;
    /**
     * Defaults to ['mc','visa','amex']. Configure supported card types to
     * facilitate brand recognition used in the Secured Fields onBrand callback.
     * See list of available card types. If a shopper enters a card type not
     * specified in the GroupTypes configuration, the onBrand callback will not be invoked.
     */
    groupTypes?: string[];
    /**
     * Specify the sample values you want to appear for card detail input fields.
     */
    placeholders?: CreditCardPlaceHolder_2 | SepaPlaceHolder_2;
}

/**
 * A set of options that are required to initialize the Adyenv3 payment method.
 *
 * Once Adyenv3 payment is initialized, credit card form fields, provided by the
 * payment provider as IFrames, will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 *
 * ```html
 * <!-- This is where the credit card component will be inserted -->
 * <div id="container"></div>
 *
 * <!-- This is where the secondary components (i.e.: 3DS) will be inserted -->
 * <div id="additional-action-container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'adyenv3',
 *     adyenv3: {
 *         containerId: 'container',
 *         additionalActionOptions: {
 *             containerId: 'additional-action-container',
 *         },
 *     },
 * });
 * ```
 *
 * Additional options can be passed in to customize the components and register
 * event callbacks.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'adyenv3',
 *     adyenv3: {
 *         containerId: 'container',
 *         additionalActionOptions: {
 *             containerId: 'additional-action-container',
 *             onBeforeLoad(shopperInteraction) {
 *                 console.log(shopperInteraction);
 *             },
 *             onLoad(cancel) {
 *                 console.log(cancel);
 *             },
 *             onComplete() {
 *                 console.log('Completed');
 *             },
 *         },
 *         options: {
 *             scheme: {
 *                 hasHolderName: true,
 *             },
 *         },
 *     },
 * });
 * ```
 */
declare interface AdyenV3PaymentInitializeOptions {
    /**
     * The location to insert the Adyen component.
     */
    containerId: string;
    /**
     * The location to insert the Adyen custom card component
     */
    cardVerificationContainerId?: string;
    /**
     * True if the Adyen component has some Vaulted instrument
     */
    hasVaultedInstruments?: boolean;
    /**
     * A set of options that are required to initialize additional payment actions.
     */
    additionalActionOptions: AdyenAdditionalActionOptions_2;
    /**
     * Optional. Overwriting the default options
     */
    options?: Omit_3<AdyenV3CreditCardComponentOptions, 'onChange'>;
    shouldShowNumberField?: boolean;
    validateCardFields(validateState: AdyenV3ValidationState): void;
}

declare interface AdyenV3ValidationState {
    valid: boolean;
    fieldType?: AdyenV3CardFields;
    endDigits?: string;
    encryptedFieldName?: string;
    i18n?: string;
    error?: string;
    errorKey?: string;
}

/**
 * A set of options that are required to initialize the customer step of
 * checkout to support Amazon Pay.
 *
 * When AmazonPay is initialized, a sign-in button will be inserted into the
 * DOM. When the customer clicks on it, they will be redirected to Amazon to
 * sign in.
 */
declare interface AmazonPayCustomerInitializeOptions {
    /**
     * The ID of a container which the sign-in button should insert into.
     */
    container: string;
    /**
     * The colour of the sign-in button.
     */
    color?: 'Gold' | 'LightGray' | 'DarkGray';
    /**
     * The size of the sign-in button.
     */
    size?: 'small' | 'medium' | 'large' | 'x-large';
    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: AmazonPayWidgetError | StandardError): void;
}

declare interface AmazonPayOrderReference {
    getAmazonBillingAgreementId(): string;
    getAmazonOrderReferenceId(): string;
}

/**
 * A set of options that are required to initialize the Amazon Pay payment
 * method.
 *
 * When AmazonPay is initialized, a widget will be inserted into the DOM. The
 * widget has a list of payment options for the customer to choose from.
 *
 * ```html
 * <!-- This is where the widget will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'amazon',
 *     amazon: {
 *         container: 'container',
 *     },
 * });
 * ```
 */
declare interface AmazonPayPaymentInitializeOptions {
    /**
     * The ID of a container which the payment widget should insert into.
     */
    container: string;
    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the payment options.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: AmazonPayWidgetError | StandardError): void;
    /**
     * A callback that gets called when the customer selects one of the payment
     * options provided by the widget.
     *
     * @param reference - The order reference provided by Amazon.
     */
    onPaymentSelect?(reference: AmazonPayOrderReference): void;
    /**
     * A callback that gets called when the widget is loaded and ready to be
     * interacted with.
     *
     * @param reference - The order reference provided by Amazon.
     */
    onReady?(reference: AmazonPayOrderReference): void;
}

/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support Amazon Pay.
 *
 * When Amazon Pay is initialized, a widget will be inserted into the DOM. The
 * widget has a list of shipping addresses for the customer to choose from.
 */
declare interface AmazonPayShippingInitializeOptions {
    /**
     * The ID of a container which the address widget should insert into.
     */
    container: string;
    /**
     * A callback that gets called when the customer selects an address option.
     *
     * @param reference - The order reference provided by Amazon.
     */
    onAddressSelect?(reference: AmazonPayOrderReference): void;
    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure of the initialization.
     */
    onError?(error: AmazonPayWidgetError | StandardError): void;
    /**
     * A callback that gets called when the widget is loaded and ready to be
     * interacted with.
     *
     * @param reference - The order reference provided by Amazon.
     */
    onReady?(reference: AmazonPayOrderReference): void;
}

declare enum AmazonPayV2ButtonColor {
    Gold = "Gold",
    LightGray = "LightGray",
    DarkGray = "DarkGray"
}

declare interface AmazonPayV2ButtonConfig {
    /**
     * Amazon Pay merchant account identifier.
     */
    merchantId: string;
    /**
     * Placement of the Amazon Pay button on your website.
     */
    placement: AmazonPayV2Placement;
    /**
     * Ledger currency provided during registration for the given merchant identifier.
     */
    ledgerCurrency: AmazonPayV2LedgerCurrency;
    /**
     * Product type selected for checkout. Default is 'PayAndShip'.
     */
    productType?: AmazonPayV2PayOptions;
    /**
     * Color of the Amazon Pay button.
     */
    buttonColor?: AmazonPayV2ButtonColor;
    /**
     * Language used to render the button and text on Amazon Pay hosted pages.
     */
    checkoutLanguage?: AmazonPayV2CheckoutLanguage;
    /**
     * Sets button to Sandbox environment. You do not have to set this parameter
     * if your `publicKeyId` has an environment prefix. Default is false.
     */
    sandbox?: boolean;
}

/**
 * The required config to render the AmazonPayV2 buttton.
 */
declare type AmazonPayV2ButtonInitializeOptions = AmazonPayV2ButtonParameters;

declare type AmazonPayV2ButtonParameters = AmazonPayV2ButtonParams | AmazonPayV2NewButtonParams;

declare interface AmazonPayV2ButtonParams extends AmazonPayV2ButtonConfig {
    /**
     * Configuration for calling the endpoint to Create Checkout Session.
     */
    createCheckoutSession: AmazonPayV2CheckoutSession;
}

declare enum AmazonPayV2CheckoutLanguage {
    en_US = "en_US",
    en_GB = "en_GB",
    de_DE = "de_DE",
    fr_FR = "fr_FR",
    it_IT = "it_IT",
    es_ES = "es_ES",
    ja_JP = "ja_JP"
}

declare interface AmazonPayV2CheckoutSession {
    /**
     * Endpoint URL to Create Checkout Session.
     */
    url: string;
    /**
     * HTTP request method. Default is 'POST'.
     */
    method?: 'GET' | 'POST';
    /**
     * Checkout Session ID parameter in the response. Default is 'checkoutSessionId'.
     */
    extractAmazonCheckoutSessionId?: string;
}

declare interface AmazonPayV2CheckoutSessionConfig {
    /**
     * A payload that Amazon Pay will use to create a Checkout Session object.
     */
    payloadJSON: string;
    /**
     * Payload's signature.
     */
    signature: string;
    /**
     * Credential provided by Amazon Pay. You do not have to set this parameter
     * if your `publicKeyId` has an environment prefix.
     */
    publicKeyId?: string;
}

/**
 * A set of options that are required to initialize the customer step of
 * checkout in order to support AmazonPayV2.
 *
 * When AmazonPayV2 is initialized, a sign-in button will be inserted into the
 * DOM. When the customer clicks on it, they will be redirected to Amazon to
 * sign in.
 */
declare interface AmazonPayV2CustomerInitializeOptions {
    /**
     * The ID of a container which the sign-in button should insert into.
     */
    container: string;
}

declare enum AmazonPayV2LedgerCurrency {
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP",
    JPY = "JPY"
}

declare interface AmazonPayV2NewButtonParams extends AmazonPayV2ButtonConfig {
    /**
     * Credential provided by Amazon Pay. You must also set the `sandbox`
     * parameter if your `publicKeyId` does not have an environment prefix.
     */
    publicKeyId?: string;
    /**
     * It does not have to match the final order amount if the buyer updates
     * their order after starting checkout. Amazon Pay will use this value to
     * assess transaction risk and prevent buyers from selecting payment methods
     * that can't be used to process the order.
     */
    estimatedOrderAmount?: AmazonPayV2Price;
    /**
     * Create Checkout Session configuration.
     */
    createCheckoutSessionConfig?: AmazonPayV2CheckoutSessionConfig;
}

/**
 * A set of options that are required to initialize the payment step of
 * checkout in order to support AmazonPayV2.
 *
 * When AmazonPayV2 is initialized, a change payment button will be bound.
 * When the customer clicks on it, they will be redirected to Amazon to
 * select a different payment method.
 *
 * ```html
 * <!-- This is where the Amazon button will be inserted -->
 * <div id="edit-button"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'amazonpay',
 *     amazonpay: {
 *         editButtonId: 'edit-button',
 *     },
 * });
 * ```
 */
declare interface AmazonPayV2PaymentInitializeOptions {
    /**
     * This editButtonId is used to set an event listener, provide an element ID
     * if you want users to be able to select a different payment method by
     * clicking on a button. It should be an HTML element.
     */
    editButtonId?: string;
}

declare enum AmazonPayV2PayOptions {
    /** Select this product type if you need the buyer's shipping details. */
    PayAndShip = "PayAndShip",
    /** Select this product type if you do not need the buyer's shipping details. */
    PayOnly = "PayOnly"
}

declare enum AmazonPayV2Placement {
    /** Initial or main page. */
    Home = "Home",
    /** Product details page. */
    Product = "Product",
    /** Cart review page before buyer starts checkout. */
    Cart = "Cart",
    /** Any page after buyer starts checkout. */
    Checkout = "Checkout",
    /** Any page that doesn't fit the previous descriptions. */
    Other = "Other"
}

declare interface AmazonPayV2Price {
    /**
     * Transaction amount.
     */
    amount: string;
    /**
     * Transaction currency code in ISO 4217 format. Example: USD.
     */
    currencyCode: string;
}

/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support AmazonPayV2.
 *
 * When AmazonPayV2 is initialized, a change shipping button will be bound.
 * When the customer clicks on it, they will be redirected to Amazon to
 * select a different shipping address.
 */
declare interface AmazonPayV2ShippingInitializeOptions {
    /**
     * This editAddressButtonId is used to set an event listener, provide an
     * element ID if you want users to be able to select a different shipping
     * address by clicking on a button. It should be an HTML element.
     */
    editAddressButtonId?: string;
}

declare interface AmazonPayWidgetError extends Error {
    getErrorCode(): string;
}

declare type AnalyticStepType = 'customer' | 'shipping' | 'billing' | 'payment';

/**
 * A set of options that are required to initialize ApplePay in cart.
 *
 * When ApplePay is initialized, an ApplePay button will be inserted into the
 * DOM. When a customer clicks on it, it will trigger Apple sheet.
 */
declare interface ApplePayButtonInitializeOptions {
    /**
     * The class name of the ApplePay button style.
     */
    buttonClassName?: string;
    /**
     * A callback that gets called when a payment is successfully completed.
     */
    onPaymentAuthorize(): void;
}

/**
 * A set of options that are required to initialize ApplePay in cart.
 *
 * When ApplePay is initialized, an ApplePay button will be inserted into the
 * DOM. When a customer clicks on it, it will trigger Apple sheet.
 */
declare interface ApplePayButtonInitializeOptions_2 {
    /**
     * The class name of the ApplePay button style.
     */
    buttonClassName?: string;
    /**
     * A callback that gets called when a payment is successfully completed.
     */
    onPaymentAuthorize(): void;
}

/**
 * A set of options that are required to initialize the customer step of
 * checkout in order to support ApplePay.
 *
 * When ApplePay is initialized, a sign-in button will be inserted into the
 * DOM. When the customer clicks on it, it will trigger apple sheet
 */
declare interface ApplePayCustomerInitializeOptions {
    /**
     * The ID of a container which the sign-in button should insert into.
     */
    container: string;
    /**
     * Shipping label to be passed to apple sheet.
     */
    shippingLabel?: string;
    /**
     * Sub total label to be passed to apple sheet.
     */
    subtotalLabel?: string;
    /**
     * A callback that gets called when a payment is successfully completed.
     */
    onPaymentAuthorize(): void;
    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error?: Error): void;
}

/**
 * A set of options that are required to initialize the Applepay payment method with:
 *
 * 1) ApplePay:
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'applepay',
 *     applepay: {
 *         shippingLabel: 'Shipping',
 *         subtotalLabel: 'Sub total',
 *     }
 * });
 * ```
 */
declare interface ApplePayPaymentInitializeOptions {
    /**
     * Shipping label to be passed to apple sheet.
     */
    shippingLabel?: string;
    /**
     * Sub total label to be passed to apple sheet.
     */
    subtotalLabel?: string;
}

declare interface BankInstrument extends BaseAccountInstrument {
    accountNumber: string;
    issuer: string;
    iban: string;
    method: string;
    type: 'bank';
}

declare interface Banner {
    type: string;
    text: string;
}

declare interface BaseAccountInstrument extends BaseInstrument {
    externalId: string;
    method: string;
    type: 'account' | 'bank';
}

declare interface BaseCheckoutButtonInitializeOptions extends CheckoutButtonOptions {
    [key: string]: unknown;
    /**
     * The options that are required to initialize the ApplePay payment method.
     * They can be omitted unless you need to support ApplePay in cart.
     */
    applepay?: ApplePayButtonInitializeOptions;
    /**
     * The options that are required to facilitate AmazonPayV2. They can be
     * omitted unless you need to support AmazonPayV2.
     */
    amazonpay?: AmazonPayV2ButtonInitializeOptions;
    /**
     * The options that are required to facilitate Braintree PayPal. They can be
     * omitted unless you need to support Braintree PayPal.
     */
    braintreepaypal?: BraintreePaypalButtonInitializeOptions;
    /**
     * The options that are required to facilitate Braintree Credit. They can be
     * omitted unless you need to support Braintree Credit.
     */
    braintreepaypalcredit?: BraintreePaypalCreditButtonInitializeOptions;
    /**
     * The options that are required to facilitate Braintree Venmo. They can be
     * omitted unless you need to support Braintree Venmo.
     */
    braintreevenmo?: BraintreeVenmoButtonInitializeOptions;
    /**
     * The ID of a container which the checkout button should be inserted.
     */
    containerId: string;
    /**
     * The option that is required to load payment method configuration for provided currency code in Buy Now flow.
     */
    currencyCode?: string;
    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support adyenv2 GooglePay.
     */
    googlepayadyenv2?: GooglePayButtonInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support adyenv2 GooglePay.
     */
    googlepayadyenv3?: GooglePayButtonInitializeOptions;
    /**
     * The options that are required to facilitate BNZ GooglePay. They can be
     * omitted unless you need to support BNZ GooglePay.
     */
    googlepaybnz?: GooglePayButtonInitializeOptions;
    /**
     * The options that are required to facilitate Braintree GooglePay. They can be
     * omitted unless you need to support Braintree GooglePay.
     */
    googlepaybraintree?: GooglePayButtonInitializeOptions;
    /**
     * The options that are required to facilitate Checkout.com GooglePay. They can be
     * omitted unless you need to support Checkout.com GooglePay.
     */
    googlepaycheckoutcom?: GooglePayButtonInitializeOptions;
    /**
     * The options that are required to facilitate CybersourceV2 GooglePay. They can be
     * omitted unless you need to support CybersourceV2 GooglePay.
     */
    googlepaycybersourcev2?: GooglePayButtonInitializeOptions;
    /**
     * The options that are required to facilitate Orbital GooglePay. They can be
     * omitted unless you need to support Orbital GooglePay.
     */
    googlepayorbital?: GooglePayButtonInitializeOptions;
    /**
     * The options that are required to facilitate Stripe GooglePay. They can be
     * omitted unless you need to support Stripe GooglePay.
     */
    googlepaystripe?: GooglePayButtonInitializeOptions;
    /**
     * The options that are required to facilitate Stripe GooglePay. They can be
     * omitted unless you need to support Stripe GooglePay.
     */
    googlepaystripeupe?: GooglePayButtonInitializeOptions;
    /**
     * The options that are required to facilitate Authorize.Net GooglePay.
     * They can be omitted unless you need to support Authorize.Net GooglePay.
     */
    googlepayauthorizenet?: GooglePayButtonInitializeOptions;
    /**
     * The options that are required to facilitate PayPal. They can be omitted
     * unless you need to support Paypal.
     */
    paypal?: PaypalButtonInitializeOptions;
    /**
     * The options that are required to facilitate PayPal Commerce V2. They can be omitted
     * unless you need to support Paypal Commerce.
     */
    paypalcommerce?: PaypalCommerceButtonInitializeOptions;
    /**
     * The options that are required to facilitate PayPal Commerce. They can be omitted
     * unless you need to support PayPal Commerce Credit / PayLater.
     */
    paypalcommercecredit?: PaypalCommerceCreditButtonInitializeOptions;
    /**
     * The options that are required to facilitate PayPal Commerce. They can be omitted
     * unless you need to support PayPal Commerce Alternative Payment Methods.
     */
    paypalcommercealternativemethods?: PaypalCommerceAlternativeMethodsButtonOptions;
    /**
     * The options that are required to facilitate PayPal Commerce Inline Checkout. They can be omitted
     * unless you need to support PayPal Commerce Inline(Accelerated) Checkout.
     */
    paypalcommerceinline?: PaypalCommerceInlineCheckoutButtonInitializeOptions;
    /**
     * The options that are required to facilitate PayPal Commerce Venmo. They can be omitted
     * unless you need to support PayPal Commerce Venmo.
     */
    paypalcommercevenmo?: PaypalCommerceVenmoButtonInitializeOptions;
}

/**
 * A set of options that are required to initialize the customer step of the
 * current checkout flow.
 *
 * Some payment methods have specific requirements for setting the customer
 * details for checkout. For example, Amazon Pay requires the customer to sign in
 * using their sign-in button. As a result, you may need to provide additional
 * information in order to initialize the customer step of checkout.
 */
declare interface BaseCustomerInitializeOptions extends CustomerRequestOptions {
    [key: string]: unknown;
    /**
     * The options that are required to initialize the customer step of checkout
     * when using Amazon Pay.
     */
    amazon?: AmazonPayCustomerInitializeOptions;
    /**
     * The options that are required to initialize the customer step of checkout
     * when using AmazonPayV2.
     */
    amazonpay?: AmazonPayV2CustomerInitializeOptions;
    /**
     * The options that are required to initialize the customer step of checkout
     * when using Visa Checkout provided by Braintree.
     */
    braintreevisacheckout?: BraintreeVisaCheckoutCustomerInitializeOptions;
    /**
     * The options that are required to initialize the customer step of checkout
     * when using Bolt.
     */
    bolt?: BoltCustomerInitializeOptions;
    /**
     * The options that are required to initialize the Chasepay payment method.
     * They can be omitted unless you need to support Chasepay.
     */
    chasepay?: ChasePayCustomerInitializeOptions;
    /**
     * The options that are required to initialize the Masterpass payment method.
     * They can be omitted unless you need to support Masterpass.
     */
    masterpass?: MasterpassCustomerInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepayadyenv2?: GooglePayCustomerInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepayadyenv3?: GooglePayCustomerInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepayauthorizenet?: GooglePayCustomerInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaybnz?: GooglePayCustomerInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaybraintree?: GooglePayCustomerInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaycheckoutcom?: GooglePayCustomerInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaycybersourcev2?: GooglePayCustomerInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepayorbital?: GooglePayCustomerInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaystripe?: GooglePayCustomerInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaystripeupe?: GooglePayCustomerInitializeOptions;
    /**
     * The options that are required to initialize the Customer Stripe Upe payment method.
     * They can be omitted unless you need to support Customer Stripe Upe.
     */
    stripeupe?: StripeUPECustomerInitializeOptions;
}

declare interface BaseElementOptions {
    /**
     * Set custom class names on the container DOM element when the Digital River element is in a particular state.
     */
    classes?: DigitalRiverElementClasses;
    /**
     * Use disabledPaymentMethods to disable specific payment methods.
     */
    disabledPaymentMethods?: string[];
}

declare interface BaseElementOptions_2 {
    /**
     * Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
     * which consists of CSS properties nested under objects for each variant.
     */
    style?: StripeElementStyle;
    /**
     * Set custom class names on the container DOM element when the Stripe element is in a particular state.
     */
    classes?: StripeElementClasses;
    /**
     * Applies a disabled state to the Element such that user input is not accepted. Default is false.
     */
    disabled?: boolean;
}

declare interface BaseIndividualElementOptions extends BaseElementOptions_2 {
    containerId: string;
}

declare interface BaseInstrument {
    bigpayToken: string;
    defaultInstrument: boolean;
    provider: string;
    trustedShippingAddress: boolean;
    method: string;
    type: string;
}

/**
 * A set of options that are required to initialize the payment step of the
 * current checkout flow.
 */
declare interface BasePaymentInitializeOptions extends PaymentRequestOptions {
    /**
     * @alpha
     * Please note that this option is currently in an early stage of
     * development. Therefore the API is unstable and not ready for public
     * consumption.
     */
    creditCard?: CreditCardPaymentInitializeOptions;
    /**
     * The options that are required to initialize the Amazon Pay payment
     * method. They can be omitted unless you need to support AmazonPay.
     */
    amazon?: AmazonPayPaymentInitializeOptions;
    /**
     * The options that are required to initialize the AmazonPayV2 payment
     * method. They can be omitted unless you need to support AmazonPayV2.
     */
    amazonpay?: AmazonPayV2PaymentInitializeOptions;
    /**
     * The options that are required to initialize the BlueSnapV2 payment method.
     * They can be omitted unless you need to support BlueSnapV2.
     */
    bluesnapv2?: BlueSnapV2PaymentInitializeOptions;
    /**
     * The options that allow Bolt to load the client script and handle the checkout.
     * They can be omitted if Bolt's full checkout take over is intended.
     */
    bolt?: BoltPaymentInitializeOptions;
    /**
     * The options that are required to initialize the Braintree payment method.
     * They can be omitted unless you need to support Braintree.
     */
    braintree?: BraintreePaymentInitializeOptions;
    /**
     * The options that are required to initialize the Visa Checkout payment
     * method provided by Braintree. They can be omitted unless you need to
     * support Visa Checkout.
     */
    braintreevisacheckout?: BraintreeVisaCheckoutPaymentInitializeOptions;
    /**
     * The options that are required to initialize the Digital River payment method.
     * They can be omitted unless you need to support Digital River.
     */
    digitalriver?: DigitalRiverPaymentInitializeOptions;
    /**
     * The options that are required to initialize the Klarna payment method.
     * They can be omitted unless you need to support Klarna.
     */
    klarna?: KlarnaPaymentInitializeOptions;
    /**
     * The options that are required to initialize the KlarnaV2 payment method.
     * They can be omitted unless you need to support KlarnaV2.
     */
    klarnav2?: KlarnaV2PaymentInitializeOptions;
    /**
     * The options that are required to initialize the Masterpass payment method.
     * They can be omitted unless you need to support Masterpass.
     */
    masterpass?: MasterpassPaymentInitializeOptions;
    /**
     * The options that are required to initialize the Moneris payment method.
     * They can be omitted unless you need to support Moneris.
     */
    moneris?: MonerisPaymentInitializeOptions;
    /**
     * The options that are required to initialize the Opy payment
     * method. They can be omitted unless you need to support Opy.
     */
    opy?: OpyPaymentInitializeOptions;
    /**
     * The options that are required to initialize the PayPal Express payment method.
     * They can be omitted unless you need to support PayPal Express.
     */
    paypalexpress?: PaypalExpressPaymentInitializeOptions;
    /**
     * The options that are required to initialize the PayPal Commerce payment method.
     * They can be omitted unless you need to support PayPal Commerce.
     */
    paypalcommerce?: PaypalCommerceInitializeOptions;
    /**
     * The options that are required to initialize the Square payment method.
     * They can be omitted unless you need to support Square.
     */
    square?: SquarePaymentInitializeOptions;
    /**
     * The options that are required to initialize the Chasepay payment method.
     * They can be omitted unless you need to support Chasepay.
     */
    chasepay?: ChasePayInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay Authorize.Net
     * payment method. They can be omitted unless you need to support GooglePay.
     */
    googlepayadyenv2?: GooglePayPaymentInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay Authorize.Net
     * payment method. They can be omitted unless you need to support GooglePay.
     */
    googlepayadyenv3?: GooglePayPaymentInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay Authorize.Net
     * payment method. They can be omitted unless you need to support GooglePay.
     */
    googlepayauthorizenet?: GooglePayPaymentInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay Authorize.Net
     * payment method. They can be omitted unless you need to support GooglePay.
     */
    googlepaybnz?: GooglePayPaymentInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay Braintree payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaybraintree?: GooglePayPaymentInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay Checkout.com payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaycheckoutcom?: GooglePayPaymentInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay CybersourceV2 payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaycybersourcev2?: GooglePayPaymentInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepayorbital?: GooglePayPaymentInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay Stripe payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaystripe?: GooglePayPaymentInitializeOptions;
    /**
     * The options that are required to initialize the GooglePay Stripe payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaystripeupe?: GooglePayPaymentInitializeOptions;
    /**
     * The options that are required to initialize the Stripe payment method.
     * They can be omitted unless you need to support StripeV3.
     */
    stripev3?: StripeV3PaymentInitializeOptions;
    /**
     * The options that are required to initialize the StripeUPE payment method.
     * They can be omitted unless you need to support StripeUPE.
     */
    stripeupe?: StripeUPEPaymentInitializeOptions;
    /**
     * The options that are required to initialize the Mollie payment method.
     * They can be omitted unless you need to support Mollie.
     */
    mollie?: MolliePaymentInitializeOptions;
    /**
     * The options that are required to initialize the Worldpay payment method.
     * They can be omitted unless you need to support Worldpay.
     */
    worldpay?: WorldpayAccessPaymentInitializeOptions;
}

declare interface BillingAddress extends Address {
    id: string;
    email?: string;
}

declare interface BillingAddressRequestBody extends AddressRequestBody {
    email?: string;
}

declare interface BlockElementStyles extends InlineElementStyles {
    backgroundColor?: string;
    boxShadow?: string;
    borderColor?: string;
    borderWidth?: string;
}

/**
 * A set of options that are required to initialize the BlueSnap V2 payment
 * method.
 *
 * The payment step is done through a web page via an iframe provided by the
 * strategy.
 *
 * ```html
 * <!-- This is where the BlueSnap iframe will be inserted. It can be an in-page container or a modal -->
 * <div id="container"></div>
 *
 * <!-- This is a cancellation button -->
 * <button type="button" id="cancel-button"></button>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'bluesnapv2',
 *     bluesnapv2: {
 *         onLoad: (iframe) => {
 *             document.getElementById('container')
 *                 .appendChild(iframe);
 *
 *             document.getElementById('cancel-button')
 *                 .addEventListener('click', () => {
 *                     document.getElementById('container').innerHTML = '';
 *                 });
 *         },
 *     },
 * });
 * ```
 */
declare interface BlueSnapV2PaymentInitializeOptions {
    /**
     * A set of CSS properties to apply to the iframe.
     */
    style?: BlueSnapV2StyleProps;
    /**
     * A callback that gets called when the iframe is ready to be added to the
     * current page. It is responsible for determining where the iframe should
     * be inserted in the DOM.
     *
     * @param iframe - The iframe element containing the payment web page
     * provided by the strategy.
     * @param cancel - A function, when called, will cancel the payment
     * process and remove the iframe.
     */
    onLoad(iframe: HTMLIFrameElement, cancel: () => void): void;
}

declare interface BlueSnapV2StyleProps {
    border?: string;
    height?: string;
    width?: string;
}

declare interface BodlEventsPayload {
    [key: string]: unknown;
}

declare interface BodlService {
    checkoutBegin(): void;
    orderPurchased(): void;
    stepCompleted(step?: string): void;
    customerEmailEntry(email?: string): void;
    customerSuggestionExecute(): void;
    customerPaymentMethodExecuted(payload?: BodlEventsPayload): void;
    showShippingMethods(): void;
    selectedPaymentMethod(methodName?: string): void;
    clickPayButton(payload?: BodlEventsPayload): void;
    paymentRejected(): void;
    paymentComplete(): void;
    exitCheckout(): void;
}

declare interface BodyStyles {
    backgroundColor?: string;
}

/**
 * A set of options that are required to initialize the customer step of
 * checkout to support Bolt.
 */
declare interface BoltCustomerInitializeOptions {
    /**
     * A callback that gets called on initialize the strategy
     *
     * @param hasBoltAccount - The hasBoltAccount variable handle the result of checking user account availability on Bolt.
     */
    onInit?(hasBoltAccount: boolean): void;
}

/**
 * A set of options that are required to initialize the Bolt payment method with:
 *
 * 1) Bolt Full Checkout:
 *
 * If the customer chooses to pay with Bolt, he will be asked to
 * enter his payment details via Bolt Full Checkout.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'bolt',
 * });
 * ```
 *
 * 2) Bolt Client:
 *
 * If the customer chooses to pay with Bolt in payment section of Checkout page,
 * the Bolt Payment Modal will be shown, and the customer will be asked
 * to enter payment details via Bolt Modal
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'bolt',
 *     bolt: {
 *         useBigCommerceCheckout: true,
 *     }
 * });
 * ```
 *
 * 3) Bolt Embedded:
 *
 * A set of options that are required to initialize the Bolt payment method
 * for presenting its credit card form.
 *
 * ```html
 * <!-- These containers are where the hosted (iframed) credit card field will be inserted -->
 * <div id="bolt-embedded"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'bolt',
 *     bolt: {
 *         useBigCommerceCheckout: true,
 *         containerId: 'boltEmbeddedContainerId',
 *     }
 * });
 * ```
 */
declare interface BoltPaymentInitializeOptions {
    useBigCommerceCheckout: boolean;
    /**
     * The CSS selector of a container where the Bolt Embedded payment field should be inserted into.
     */
    containerId?: string;
    /**
     * A callback that gets called when the customer selects Bolt as payment option.
     */
    onPaymentSelect?(hasBoltAccount: boolean): void;
}

declare interface BraintreeError extends Error {
    type: 'CUSTOMER' | 'MERCHANT' | 'NETWORK' | 'INTERNAL' | 'UNKNOWN';
    code: string;
    details?: unknown;
}

declare type BraintreeFormFieldBlurEventData = BraintreeFormFieldKeyboardEventData;

declare interface BraintreeFormFieldCardTypeChangeEventData {
    cardType?: string;
}

declare type BraintreeFormFieldEnterEventData = BraintreeFormFieldKeyboardEventData;

declare type BraintreeFormFieldFocusEventData = BraintreeFormFieldKeyboardEventData;

declare interface BraintreeFormFieldKeyboardEventData {
    fieldType: string;
}

declare interface BraintreeFormFieldOptions {
    accessibilityLabel?: string;
    containerId: string;
    placeholder?: string;
}

declare interface BraintreeFormFieldsMap {
    [BraintreeFormFieldType.CardCode]?: BraintreeFormFieldOptions;
    [BraintreeFormFieldType.CardExpiry]: BraintreeFormFieldOptions;
    [BraintreeFormFieldType.CardName]: BraintreeFormFieldOptions;
    [BraintreeFormFieldType.CardNumber]: BraintreeFormFieldOptions;
}

declare type BraintreeFormFieldStyles = Partial<Pick<CSSStyleDeclaration, 'color' | 'fontFamily' | 'fontSize' | 'fontWeight'>>;

declare interface BraintreeFormFieldStylesMap {
    default?: BraintreeFormFieldStyles;
    error?: BraintreeFormFieldStyles;
    focus?: BraintreeFormFieldStyles;
}

declare enum BraintreeFormFieldType {
    CardCode = "cardCode",
    CardCodeVerification = "cardCodeVerification",
    CardExpiry = "cardExpiry",
    CardName = "cardName",
    CardNumber = "cardNumber",
    CardNumberVerification = "cardNumberVerification"
}

declare interface BraintreeFormFieldValidateErrorData {
    fieldType: string;
    message: string;
    type: string;
}

declare interface BraintreeFormFieldValidateEventData {
    errors: {
        [BraintreeFormFieldType.CardCode]?: BraintreeFormFieldValidateErrorData[];
        [BraintreeFormFieldType.CardExpiry]?: BraintreeFormFieldValidateErrorData[];
        [BraintreeFormFieldType.CardName]?: BraintreeFormFieldValidateErrorData[];
        [BraintreeFormFieldType.CardNumber]?: BraintreeFormFieldValidateErrorData[];
        [BraintreeFormFieldType.CardCodeVerification]?: BraintreeFormFieldValidateErrorData[];
        [BraintreeFormFieldType.CardNumberVerification]?: BraintreeFormFieldValidateErrorData[];
    };
    isValid: boolean;
}

declare interface BraintreeFormOptions {
    fields: BraintreeFormFieldsMap | BraintreeStoredCardFieldsMap;
    styles?: BraintreeFormFieldStylesMap;
    onBlur?(data: BraintreeFormFieldBlurEventData): void;
    onCardTypeChange?(data: BraintreeFormFieldCardTypeChangeEventData): void;
    onFocus?(data: BraintreeFormFieldFocusEventData): void;
    onValidate?(data: BraintreeFormFieldValidateEventData): void;
    onEnter?(data: BraintreeFormFieldEnterEventData): void;
}

/**
 * A set of options that are required to initialize the Braintree payment
 * method. You need to provide the options if you want to support 3D Secure
 * authentication flow.
 *
 * ```html
 * <!-- These containers are where the hosted (iframed) credit card fields will be inserted -->
 * <div id="card-number"></div>
 * <div id="card-name"></div>
 * <div id="card-expiry"></div>
 * <div id="card-code"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'braintree',
 *     braintree: {
 *         form: {
 *             fields: {
 *                 cardNumber: { containerId: 'card-number' },
 *                 cardName: { containerId: 'card-name' },
 *                 cardExpiry: { containerId: 'card-expiry' },
 *                 cardCode: { containerId: 'card-code' },
 *             },
 *         },
 *     },
 * });
 * ```
 *
 * Additional options can be passed in to customize the fields and register
 * event callbacks.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'braintree',
 *     creditCard: {
 *         form: {
 *             fields: {
 *                 cardNumber: { containerId: 'card-number' },
 *                 cardName: { containerId: 'card-name' },
 *                 cardExpiry: { containerId: 'card-expiry' },
 *                 cardCode: { containerId: 'card-code' },
 *             },
 *             styles: {
 *                 default: {
 *                     color: '#000',
 *                 },
 *                 error: {
 *                     color: '#f00',
 *                 },
 *                 focus: {
 *                     color: '#0f0',
 *                 },
 *             },
 *             onBlur({ fieldType }) {
 *                 console.log(fieldType);
 *             },
 *             onFocus({ fieldType }) {
 *                 console.log(fieldType);
 *             },
 *             onEnter({ fieldType }) {
 *                 console.log(fieldType);
 *             },
 *             onCardTypeChange({ cardType }) {
 *                 console.log(cardType);
 *             },
 *             onValidate({ errors, isValid }) {
 *                 console.log(errors);
 *                 console.log(isValid);
 *             },
 *         },
 *     },
 * });
 * ```
 */
declare interface BraintreePaymentInitializeOptions {
    threeDSecure?: BraintreeThreeDSecureOptions;
    /**
     * @alpha
     * Please note that this option is currently in an early stage of
     * development. Therefore the API is unstable and not ready for public
     * consumption.
     */
    form?: BraintreeFormOptions;
}

declare interface BraintreePaypalButtonInitializeOptions {
    /**
     * The ID of a container which the messaging should be inserted.
     */
    messagingContainerId?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: Pick<PaypalButtonStyleOptions, 'layout' | 'size' | 'color' | 'label' | 'shape' | 'tagline' | 'fundingicons' | 'height'>;
    /**
     * Address to be used for shipping.
     * If not provided, it will use the first saved address from the active customer.
     */
    shippingAddress?: Address | null;
    /**
     * A callback that gets called if unable to authorize and tokenize payment.
     *
     * @param error - The error object describing the failure.
     */
    onAuthorizeError?(error: BraintreeError | StandardError): void;
    /**
     * A callback that gets called if unable to submit payment.
     *
     * @param error - The error object describing the failure.
     */
    onPaymentError?(error: BraintreeError | StandardError): void;
    /**
     * A callback that gets called on any error instead of submit payment or authorization errors.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | StandardError): void;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
}

declare interface BraintreePaypalCreditButtonInitializeOptions {
    /**
     * A set of styling options for the checkout button.
     */
    style?: Pick<PaypalButtonStyleOptions, 'layout' | 'size' | 'color' | 'label' | 'shape' | 'tagline' | 'fundingicons' | 'height'>;
    /**
     * Address to be used for shipping.
     * If not provided, it will use the first saved address from the active customer.
     */
    shippingAddress?: Address | null;
    /**
     * A callback that gets called if unable to authorize and tokenize payment.
     *
     * @param error - The error object describing the failure.
     */
    onAuthorizeError?(error: BraintreeError | StandardError): void;
    /**
     * A callback that gets called if unable to submit payment.
     *
     * @param error - The error object describing the failure.
     */
    onPaymentError?(error: BraintreeError | StandardError): void;
    /**
     * A callback that gets called on any error instead of submit payment or authorization errors.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | StandardError): void;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
}

declare interface BraintreeStoredCardFieldOptions extends BraintreeFormFieldOptions {
    instrumentId: string;
}

declare interface BraintreeStoredCardFieldsMap {
    [BraintreeFormFieldType.CardCodeVerification]?: BraintreeStoredCardFieldOptions;
    [BraintreeFormFieldType.CardNumberVerification]?: BraintreeStoredCardFieldOptions;
}

/**
 * A set of options that are required to support 3D Secure authentication flow.
 *
 * If the customer uses a credit card that has 3D Secure enabled, they will be
 * asked to verify their identity when they pay. The verification is done
 * through a web page via an iframe provided by the card issuer.
 */
declare interface BraintreeThreeDSecureOptions {
    /**
     * A callback that gets called when the iframe is ready to be added to the
     * current page. It is responsible for determining where the iframe should
     * be inserted in the DOM.
     *
     * @param error - Any error raised during the verification process;
     * undefined if there is none.
     * @param iframe - The iframe element containing the verification web page
     * provided by the card issuer.
     * @param cancel - A function, when called, will cancel the verification
     * process and remove the iframe.
     */
    addFrame(error: Error | undefined, iframe: HTMLIFrameElement, cancel: () => Promise<BraintreeVerifyPayload> | undefined): void;
    /**
     * A callback that gets called when the iframe is about to be removed from
     * the current page.
     */
    removeFrame(): void;
}

declare interface BraintreeVenmoButtonInitializeOptions {
    /**
     * A callback that gets called on any error.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | StandardError): void;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
}

declare interface BraintreeVerifyPayload {
    nonce: string;
    details: {
        cardType: string;
        lastFour: string;
        lastTwo: string;
    };
    description: string;
    liabilityShiftPossible: boolean;
    liabilityShifted: boolean;
}

declare interface BraintreeVisaCheckoutCustomerInitializeOptions {
    container: string;
    onError?(error: Error): void;
}

/**
 * A set of options that are required to initialize the Visa Checkout payment
 * method provided by Braintree.
 *
 * If the customer chooses to pay with Visa Checkout, they will be asked to
 * enter their payment details via a modal. You can hook into events emitted by
 * the modal by providing the callbacks listed below.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'braintreevisacheckout',
 * });
 * ```
 *
 * Additional event callbacks can be registered.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'braintreevisacheckout',
 *     braintreevisacheckout: {
 *         onError(error) {
 *             console.log(error);
 *         },
 *         onPaymentSelect() {
 *             console.log('Selected');
 *         },
 *     },
 * });
 * ```
 */
declare interface BraintreeVisaCheckoutPaymentInitializeOptions {
    /**
     * A callback that gets called when Visa Checkout fails to initialize or
     * selects a payment option.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: Error): void;
    /**
     * A callback that gets called when the customer selects a payment option.
     */
    onPaymentSelect?(): void;
}

declare interface BrowserInfo {
    color_depth: number;
    java_enabled: boolean;
    language: string;
    screen_height: number;
    screen_width: number;
    time_zone_offset: string;
}

declare enum ButtonColor {
    Default = "default",
    Black = "black",
    White = "white"
}

declare interface ButtonResponse {
    /**
     * https://docs.digitalriver.com/digital-river-api/payment-integrations-1/drop-in/drop-in-integration-guide#customizing-the-text-of-the-drop-in-button
     * The text of the Drop-in button is customizable. You can either display pre-configured text or you can specify a unique text
     * Examples type: "payNow" || type: "buyNow" || type: "completeOrder" || type: "submitOrder"
     */
    type: string;
}

declare interface ButtonStyles extends BlockElementStyles {
    active?: BlockElementStyles;
    focus?: BlockElementStyles;
    hover?: BlockElementStyles;
    disabled?: BlockElementStyles;
}

declare enum ButtonType {
    Long = "long",
    Short = "short"
}

/**
 * An object that contains the information required for creating 'Buy now' cart.
 */
declare interface BuyNowCartRequestBody {
    source: 'BUY_NOW';
    lineItems: LineItem_2[];
}

declare interface CardCvcElementOptions extends BaseIndividualElementOptions {
    placeholder?: string;
}

declare interface CardDataPaymentMethodState {
    paymentMethod: CardPaymentMethodState;
}

declare interface CardDataPaymentMethodState_2 {
    paymentMethod: CardPaymentMethodState_2;
}

declare interface CardElementOptions extends BaseElementOptions_2 {
    /**
     * A pre-filled set of values to include in the input (e.g., {postalCode: '94110'}).
     * Note that sensitive card information (card number, CVC, and expiration date)
     * cannot be pre-filled
     */
    value?: string;
    /**
     * Hide the postal code field. Default is false. If you are already collecting a
     * full billing address or postal code elsewhere, set this to true.
     */
    hidePostalCode?: boolean;
    /**
     * Appearance of the icon in the Element.
     */
    iconStyle?: IconStyle;
    hideIcon?: boolean;
}

declare interface CardExpiryElementOptions extends BaseIndividualElementOptions {
    placeholder?: string;
}

declare interface CardInstrument extends BaseInstrument {
    brand: string;
    expiryMonth: string;
    expiryYear: string;
    iin: string;
    last4: string;
    type: 'card';
}

declare interface CardNumberElementOptions extends BaseIndividualElementOptions {
    placeholder?: string;
    showIcon?: boolean;
    /**
     * Appearance of the icon in the Element. Either `solid` or `default`
     */
    iconStyle?: IconStyle;
}

declare interface CardPaymentMethodState extends AdyenPaymentMethodState {
    encryptedCardNumber: string;
    encryptedExpiryMonth: string;
    encryptedExpiryYear: string;
    encryptedSecurityCode: string;
    holderName: string;
}

declare interface CardPaymentMethodState_2 {
    encryptedCardNumber: string;
    encryptedExpiryMonth: string;
    encryptedExpiryYear: string;
    encryptedSecurityCode: string;
    holderName: string;
}

declare interface CardState {
    data: CardDataPaymentMethodState;
    isValid?: boolean;
    valid?: {
        [key: string]: boolean;
    };
    errors?: CardStateErrors;
}

declare interface CardState_2 {
    data: CardDataPaymentMethodState_2;
    isValid?: boolean;
    valid?: {
        [key: string]: boolean;
    };
    errors?: CardStateErrors_2;
}

declare interface CardStateErrors {
    [key: string]: string;
}

declare interface CardStateErrors_2 {
    [key: string]: string;
}

declare interface Cart {
    id: string;
    customerId: number;
    currency: Currency;
    email: string;
    isTaxIncluded: boolean;
    baseAmount: number;
    discountAmount: number;
    cartAmount: number;
    coupons: Coupon[];
    discounts: Discount[];
    lineItems: LineItemMap;
    createdTime: string;
    updatedTime: string;
    source?: 'BUY_NOW';
}

declare class CartChangedError extends StandardError {
    /**
     * @alpha
     * Please note that this option is currently in an early stage of
     * development. Therefore the API is unstable and not ready for public
     * consumption.
     */
    data: {
        previous: ComparableCheckout;
        updated: ComparableCheckout;
    };
    constructor(previous: ComparableCheckout, updated: ComparableCheckout);
}

declare interface ChasePayCustomerInitializeOptions {
    container: string;
}

/**
 * A set of options that are required to initialize the Chase Pay payment method.
 *
 * ```html
 * <!-- This is where the Chase Pay button will be inserted -->
 * <div id="wallet-button"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'chasepay',
 *     chasepay: {
 *         walletButton: 'wallet-button',
 *     },
 * });
 * ```
 *
 * Additional options can be passed in to customize the fields and register
 * event callbacks.
 *
 * ```html
 * <!-- This is where the Chase Pay logo will be inserted -->
 * <div id="logo"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'chasepay',
 *     chasepay: {
 *         walletButton: 'wallet-button',
 *         logoContainer: 'logo',
 *         onPaymentSelect() {
 *             console.log('Selected');
 *         },
 *         onCancel() {
 *             console.log('Cancelled');
 *         },
 *     },
 * });
 * ```
 */
declare interface ChasePayInitializeOptions {
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

declare interface CheckableInputStyles extends InputStyles {
    error?: InputStyles;
    checked?: BlockElementStyles;
}

declare interface ChecklistStyles extends BlockElementStyles {
    hover?: BlockElementStyles;
    checked?: BlockElementStyles;
}

declare interface Checkout {
    id: string;
    billingAddress?: BillingAddress;
    cart: Cart;
    customer: Customer;
    customerMessage: string;
    consignments: Consignment[];
    taxes: Tax[];
    discounts: Discount[];
    isStoreCreditApplied: boolean;
    coupons: Coupon[];
    orderId?: number;
    giftWrappingCostTotal: number;
    shippingCostTotal: number;
    shippingCostBeforeDiscount: number;
    /**
     * Whether the current checkout must execute spam protection
     * before placing the order.
     *
     * Note: You need to enable Google ReCAPTCHA bot protection in your Checkout Settings.
     */
    shouldExecuteSpamCheck: boolean;
    handlingCostTotal: number;
    taxTotal: number;
    subtotal: number;
    grandTotal: number;
    outstandingBalance: number;
    giftCertificates: GiftCertificate[];
    promotions?: Promotion[];
    balanceDue: number;
    createdTime: string;
    updatedTime: string;
    payments?: CheckoutPayment[];
    channelId: number;
}

declare class CheckoutButtonErrorSelector {
    private _checkoutButton;
    getInitializeButtonError(methodId?: CheckoutButtonMethodType): Error | undefined;
    getDeinitializeButtonError(methodId?: CheckoutButtonMethodType): Error | undefined;
}

declare type CheckoutButtonInitializeOptions = BaseCheckoutButtonInitializeOptions & WithApplePayButtonInitializeOptions;

declare class CheckoutButtonInitializer {
    private _store;
    private _buttonStrategyActionCreator;
    private _state;
    /**
     * Returns a snapshot of the current state.
     *
     * The method returns a new instance every time there is a change in the
     * state. You can query the state by calling any of its getter methods.
     *
     * ```js
     * const state = service.getState();
     *
     * console.log(state.errors.getInitializeButtonError());
     * console.log(state.statuses.isInitializingButton());
     * ```
     *
     * @returns The current customer's checkout state
     */
    getState(): CheckoutButtonSelectors;
    /**
     * Subscribes to any changes to the current state.
     *
     * The method registers a callback function and executes it every time there
     * is a change in the current state.
     *
     * ```js
     * service.subscribe(state => {
     *     console.log(state.statuses.isInitializingButton());
     * });
     * ```
     *
     * The method can be configured to notify subscribers only regarding
     * relevant changes, by providing a filter function.
     *
     * ```js
     * const filter = state => state.errors.getInitializeButtonError();
     *
     * // Only trigger the subscriber when the cart changes.
     * service.subscribe(state => {
     *     console.log(state.errors.getInitializeButtonError())
     * }, filter);
     * ```
     *
     * @param subscriber - The function to subscribe to state changes.
     * @param filters - One or more functions to filter out irrelevant state
     * changes. If more than one function is provided, the subscriber will only
     * be triggered if all conditions are met.
     * @returns A function, if called, will unsubscribe the subscriber.
     */
    subscribe(subscriber: (state: CheckoutButtonSelectors) => void, ...filters: Array<(state: CheckoutButtonSelectors) => any>): () => void;
    /**
     * Initializes the checkout button of a payment method.
     *
     * When the checkout button is initialized, it will be inserted into the DOM,
     * ready to be interacted with by the customer.
     *
     * ```js
     * initializer.initializeButton({
     *     methodId: 'braintreepaypal',
     *     containerId: 'checkoutButton',
     *     braintreepaypal: {
     *     },
     * });
     * ```
     *
     * @param options - Options for initializing the checkout button.
     * @returns A promise that resolves to the current state.
     */
    initializeButton(options: CheckoutButtonInitializeOptions): Promise<CheckoutButtonSelectors>;
    /**
     * De-initializes the checkout button by performing any necessary clean-ups.
     *
     * ```js
     * await service.deinitializeButton({
     *     methodId: 'braintreepaypal',
     * });
     * ```
     *
     * @param options - Options for deinitializing the checkout button.
     * @returns A promise that resolves to the current state.
     */
    deinitializeButton(options: CheckoutButtonOptions): Promise<CheckoutButtonSelectors>;
}

declare interface CheckoutButtonInitializerOptions {
    host?: string;
    locale?: string;
}

declare enum CheckoutButtonMethodType {
    APPLEPAY = "applepay",
    AMAZON_PAY_V2 = "amazonpay",
    BRAINTREE_PAYPAL = "braintreepaypal",
    BRAINTREE_VENMO = "braintreevenmo",
    BRAINTREE_PAYPAL_CREDIT = "braintreepaypalcredit",
    GOOGLEPAY_ADYENV2 = "googlepayadyenv2",
    GOOGLEPAY_ADYENV3 = "googlepayadyenv3",
    GOOGLEPAY_AUTHORIZENET = "googlepayauthorizenet",
    GOOGLEPAY_BNZ = "googlepaybnz",
    GOOGLEPAY_BRAINTREE = "googlepaybraintree",
    GOOGLEPAY_CHECKOUTCOM = "googlepaycheckoutcom",
    GOOGLEPAY_CYBERSOURCEV2 = "googlepaycybersourcev2",
    GOOGLEPAY_ORBITAL = "googlepayorbital",
    GOOGLEPAY_STRIPE = "googlepaystripe",
    GOOGLEPAY_STRIPEUPE = "googlepaystripeupe",
    MASTERPASS = "masterpass",
    PAYPALEXPRESS = "paypalexpress",
    PAYPALCOMMERCE = "paypalcommerce",
    PAYPALCOMMERCE_CREDIT = "paypalcommercecredit",
    PAYPALCOMMERCE_APMS = "paypalcommercealternativemethods",
    PAYPALCOMMERCE_INLINE = "paypalcommerceinline",
    PAYPALCOMMERCE_VENMO = "paypalcommercevenmo"
}

/**
 * The set of options for configuring the checkout button.
 */
declare interface CheckoutButtonOptions extends RequestOptions {
    /**
     * The identifier of the payment method.
     */
    methodId: CheckoutButtonMethodType;
}

declare interface CheckoutButtonSelectors {
    errors: CheckoutButtonErrorSelector;
    statuses: CheckoutButtonStatusSelector;
}

declare class CheckoutButtonStatusSelector {
    private _checkoutButton;
    isInitializingButton(methodId?: CheckoutButtonMethodType): boolean;
    isDeinitializingButton(methodId?: CheckoutButtonMethodType): boolean;
}

declare type CheckoutIncludeParam = {
    [key in CheckoutIncludes]?: boolean;
};

declare enum CheckoutIncludes {
    AvailableShippingOptions = "consignments.availableShippingOptions",
    PhysicalItemsCategoryNames = "cart.lineItems.physicalItems.categoryNames",
    DigitalItemsCategoryNames = "cart.lineItems.digitalItems.categoryNames"
}

declare interface CheckoutParams {
    include?: CheckoutIncludes[] | CheckoutIncludeParam;
}

declare interface CheckoutPayment {
    detail: {
        step: string;
    };
    providerId: string;
    providerType: string;
    gatewayId?: string;
}

declare interface CheckoutPaymentMethodExecutedOptions {
    hasBoltAccount?: boolean;
}

declare interface CheckoutRequestBody {
    customerMessage: string;
}

declare interface CheckoutSelectors {
    data: CheckoutStoreSelector;
    errors: CheckoutStoreErrorSelector;
    statuses: CheckoutStoreStatusSelector;
}

/**
 * Responsible for completing the checkout process for the current customer.
 *
 * This object can be used to collect all information that is required for
 * checkout, such as shipping and billing information. It can also be used to
 * retrieve the current checkout state and subscribe to its changes.
 */
declare class CheckoutService {
    private _store;
    private _billingAddressActionCreator;
    private _checkoutActionCreator;
    private _configActionCreator;
    private _customerActionCreator;
    private _consignmentActionCreator;
    private _countryActionCreator;
    private _couponActionCreator;
    private _customerStrategyActionCreator;
    private _errorActionCreator;
    private _giftCertificateActionCreator;
    private _instrumentActionCreator;
    private _orderActionCreator;
    private _paymentMethodActionCreator;
    private _paymentStrategyActionCreator;
    private _pickupOptionActionCreator;
    private _shippingCountryActionCreator;
    private _shippingStrategyActionCreator;
    private _signInEmailActionCreator;
    private _spamProtectionActionCreator;
    private _storeCreditActionCreator;
    private _subscriptionsActionCreator;
    private _formFieldsActionCreator;
    private _storeProjection;
    private _errorTransformer;
    private _selectorsFactory;
    /**
     * Returns a snapshot of the current checkout state.
     *
     * The method returns a new instance every time there is a change in the
     * checkout state. You can query the state by calling any of its getter
     * methods.
     *
     * ```js
     * const state = service.getState();
     *
     * console.log(state.data.getOrder());
     * console.log(state.errors.getSubmitOrderError());
     * console.log(state.statuses.isSubmittingOrder());
     * ```
     *
     * @returns The current customer's checkout state
     */
    getState(): CheckoutSelectors;
    /**
     * Notifies all subscribers with the current state.
     *
     * When this method gets called, the subscribers get called regardless if
     * they have any filters applied.
     */
    notifyState(): void;
    /**
     * Subscribes to any changes to the current state.
     *
     * The method registers a callback function and executes it every time there
     * is a change in the checkout state.
     *
     * ```js
     * service.subscribe(state => {
     *     console.log(state.data.getCart());
     * });
     * ```
     *
     * The method can be configured to notify subscribers only regarding
     * relevant changes, by providing a filter function.
     *
     * ```js
     * const filter = state => state.data.getCart();
     *
     * // Only trigger the subscriber when the cart changes.
     * service.subscribe(state => {
     *     console.log(state.data.getCart())
     * }, filter);
     * ```
     *
     * @param subscriber - The function to subscribe to state changes.
     * @param filters - One or more functions to filter out irrelevant state
     * changes. If more than one function is provided, the subscriber will only
     * be triggered if all conditions are met.
     * @returns A function, if called, will unsubscribe the subscriber.
     */
    subscribe(subscriber: (state: CheckoutSelectors) => void, ...filters: Array<(state: CheckoutSelectors) => any>): () => void;
    /**
     * Loads the current checkout.
     *
     * This method can only be called if there is an active checkout. Also, it
     * can only retrieve data that belongs to the current customer. When it is
     * successfully executed, you can retrieve the data by calling
     * `CheckoutStoreSelector#getCheckout`.
     *
     * ```js
     * const state = await service.loadCheckout('0cfd6c06-57c3-4e29-8d7a-de55cc8a9052');
     *
     * console.log(state.data.getCheckout());
     * ```
     *
     * @param id - The identifier of the checkout to load, or the default checkout if not provided.
     * @param options - Options for loading the current checkout.
     * @returns A promise that resolves to the current state.
     */
    loadCheckout(id?: string, options?: RequestOptions<CheckoutParams>): Promise<CheckoutSelectors>;
    /**
     * Updates specific properties of the current checkout.
     *
     * ```js
     * const state = await service.updateCheckout(checkout);
     *
     * console.log(state.data.getCheckout());
     * ```
     *
     * @param payload - The checkout properties to be updated.
     * @param options - Options for loading the current checkout.
     * @returns A promise that resolves to the current state.
     */
    updateCheckout(payload: CheckoutRequestBody, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Loads an order by an id.
     *
     * The method can only retrieve an order if the order belongs to the current
     * customer. If it is successfully executed, the data can be retrieved by
     * calling `CheckoutStoreSelector#getOrder`.
     *
     * ```js
     * const state = await service.loadOrder(123);
     *
     * console.log(state.data.getOrder());
     * ```
     *
     * @param orderId - The identifier of the order to load.
     * @param options - Options for loading the order.
     * @returns A promise that resolves to the current state.
     */
    loadOrder(orderId: number, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Submits an order, thereby completing a checkout process.
     *
     * Before you can submit an order, you must initialize the payment method
     * chosen by the customer by calling `CheckoutService#initializePayment`.
     *
     * ```js
     * await service.initializePayment({ methodId: 'braintree' });
     * await service.submitOrder({
     *     payment: {
     *         methodId: 'braintree',
     *         paymentData: {
     *             ccExpiry: { month: 10, year: 20 },
     *             ccName: 'BigCommerce',
     *             ccNumber: '4111111111111111',
     *             ccCvv: 123,
     *         },
     *     },
     * });
     * ```
     *
     * You are not required to include `paymentData` if the order does not
     * require additional payment details. For example, the customer has already
     * entered their payment details on the cart page using one of the hosted
     * payment methods, such as PayPal. Or the customer has applied a gift
     * certificate that exceeds the grand total amount.
     *
     * If the order is submitted successfully, you can retrieve the newly
     * created order by calling `CheckoutStoreSelector#getOrder`.
     *
     * ```js
     * const state = await service.submitOrder(payload);
     *
     * console.log(state.data.getOrder());
     * ```
     *
     * @param payload - The request payload to submit for the current order.
     * @param options - Options for submitting the current order.
     * @returns A promise that resolves to the current state.
     */
    submitOrder(payload: OrderRequestBody, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Finalizes the submission process for an order.
     *
     * This method is only required for certain hosted payment methods that
     * require a customer to enter their credit card details on their website.
     * You need to call this method once the customer has redirected back to
     * checkout in order to complete the checkout process.
     *
     * If the method is called before order finalization is required or for a
     * payment method that does not require order finalization, an error will be
     * thrown. Conversely, if the method is called successfully, you should
     * immediately redirect the customer to the order confirmation page.
     *
     * ```js
     * try {
     *     await service.finalizeOrderIfNeeded();
     *
     *     window.location.assign('/order-confirmation');
     * } catch (error) {
     *     if (error.type !== 'order_finalization_not_required') {
     *         throw error;
     *     }
     * }
     * ```
     *
     * @param options - Options for finalizing the current order.
     * @returns A promise that resolves to the current state.
     * @throws `OrderFinalizationNotRequiredError` error if order finalization
     * is not required for the current order at the time of execution.
     */
    finalizeOrderIfNeeded(options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Loads a list of payment methods available for checkout.
     *
     * If a customer enters their payment details before navigating to the
     * checkout page (i.e.: using PayPal checkout button on the cart page), only
     * one payment method will be available for the customer - the selected
     * payment method. Otherwise, by default, all payment methods configured by
     * the merchant will be available for the customer.
     *
     * Once the method is executed successfully, you can call
     * `CheckoutStoreSelector#getPaymentMethods` to retrieve the list of payment
     * methods.
     *
     * ```js
     * const state = service.loadPaymentMethods();
     *
     * console.log(state.data.getPaymentMethods());
     * ```
     *
     * @param options - Options for loading the payment methods that are
     * available to the current customer.
     * @returns A promise that resolves to the current state.
     */
    loadPaymentMethods(options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Initializes the payment step of a checkout process.
     *
     * Before a payment method can accept payment details, it must first be
     * initialized. Some payment methods require you to provide additional
     * initialization options. For example, Amazon requires a container ID in
     * order to initialize their payment widget.
     *
     * ```js
     * await service.initializePayment({
     *     methodId: 'amazon',
     *     amazon: {
     *         container: 'walletWidget',
     *     },
     * });
     * ```
     *
     * @param options - Options for initializing the payment step of checkout.
     * @returns A promise that resolves to the current state.
     */
    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors>;
    /**
     * De-initializes the payment step of a checkout process.
     *
     * The method should be called once you no longer require a payment method
     * to be initialized. It can perform any necessary clean-up behind the
     * scene, i.e.: remove DOM nodes or event handlers that are attached as a
     * result of payment initialization.
     *
     * ```js
     * await service.deinitializePayment({
     *     methodId: 'amazon',
     * });
     * ```
     *
     * @param options - Options for deinitializing the payment step of checkout.
     * @returns A promise that resolves to the current state.
     */
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    /**
     * Loads a list of countries available for billing.
     *
     * Once you make a successful request, you will be able to retrieve the list
     * of countries by calling `CheckoutStoreSelector#getBillingCountries`.
     *
     * ```js
     * const state = await service.loadBillingCountries();
     *
     * console.log(state.data.getBillingCountries());
     * ```
     *
     * @param options - Options for loading the available billing countries.
     * @returns A promise that resolves to the current state.
     */
    loadBillingCountries(options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Loads a list of countries available for shipping.
     *
     * The list is determined based on the shipping zones configured by a
     * merchant. Once you make a successful call, you will be able to retrieve
     * the list of available shipping countries by calling
     * `CheckoutStoreSelector#getShippingCountries`.
     *
     * ```js
     * const state = await service.loadShippingCountries();
     *
     * console.log(state.data.getShippingCountries());
     * ```
     *
     * @param options - Options for loading the available shipping countries.
     * @returns A promise that resolves to the current state.
     */
    loadShippingCountries(options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Loads a list of pickup options for a given criteria.
     *
     * ```js
     * const consignmentId = '1';
     * const searchArea = {
     *     radius: {
     *         value: 1.4,
     *         unit: 'KM'
     *     },
     *     coordinates: {
     *         latitude: 1.4,
     *         longitude: 0
     *     },
     * };
     * const state = await service.loadPickupOptions({ consignmentId, searchArea });
     *
     * console.log(state.data.getPickupOptions(consignmentId, searchArea));
     * ```
     *
     * @alpha
     * @param options - Options for loading the available shipping countries.
     * @returns A promise that resolves to the current state.
     */
    loadPickupOptions(query: PickupOptionRequestBody): Promise<CheckoutSelectors>;
    /**
     * Loads a set of form fields that should be presented to customers in order
     * to capture their billing address.
     *
     * Once the method has been executed successfully, you can call
     * `CheckoutStoreSelector#getBillingAddressFields` to retrieve the set of
     * form fields.
     *
     * ```js
     * const state = service.loadBillingAddressFields();
     *
     * console.log(state.data.getBillingAddressFields('US'));
     * ```
     *
     * @param options - Options for loading the billing address form fields.
     * @returns A promise that resolves to the current state.
     */
    loadBillingAddressFields(options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Loads a set of form fields that should be presented to customers in order
     * to capture their shipping address.
     *
     * Once the method has been executed successfully, you can call
     * `CheckoutStoreSelector#getShippingAddressFields` to retrieve the set of
     * form fields.
     *
     * ```js
     * const state = service.loadShippingAddressFields();
     *
     * console.log(state.data.getShippingAddressFields('US'));
     * ```
     *
     * @param options - Options for loading the shipping address form fields.
     * @returns A promise that resolves to the current state.
     */
    loadShippingAddressFields(options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Initializes the sign-in step of a checkout process.
     *
     * Some payment methods, such as Amazon, have their own sign-in flow. In
     * order to support them, this method must be called.
     *
     * ```js
     * await service.initializeCustomer({
     *     methodId: 'amazon',
     *     amazon: {
     *         container: 'signInButton',
     *     },
     * });
     * ```
     *
     * @param options - Options for initializing the customer step of checkout.
     * @returns A promise that resolves to the current state.
     */
    initializeCustomer(options?: CustomerInitializeOptions): Promise<CheckoutSelectors>;
    /**
     * De-initializes the sign-in step of a checkout process.
     *
     * It should be called once you no longer want to prompt customers to sign
     * in. It can perform any necessary clean-up behind the scene, i.e.: remove
     * DOM nodes or event handlers that are attached as a result of customer
     * initialization.
     *
     * ```js
     * await service.deinitializeCustomer({
     *     methodId: 'amazon',
     * });
     * ```
     *
     * @param options - Options for deinitializing the customer step of checkout.
     * @returns A promise that resolves to the current state.
     */
    deinitializeCustomer(options?: CustomerRequestOptions): Promise<CheckoutSelectors>;
    /**
     * Sends a email that contains a single-use sign-in link. When a valid links is clicked,
     * signs in the customer without requiring any password, redirecting them to the account page if no redirectUrl is provided.
     *
     *
     * ```js
     * checkoutService.sendSignInEmail({ email: 'foo@bar.com', redirectUrl: 'checkout' });
     * ```
     *
     * @param signInEmailRequest - The sign-in email request values.
     * @param options - Options for the send email request.
     * @returns A promise that resolves to the current state.
     */
    sendSignInEmail(signInEmailRequest: SignInEmailRequestBody, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Creates a customer account.
     *
     * @remarks
     * ```js
     * checkoutService.createCustomerAccount({
     *   email: 'foo@bar.com',
     *   firstName: 'Foo',
     *   lastName: 'Bar',
     *   password: 'password',
     *   acceptsMarketingEmails: true,
     *   customFields: [],
     * });
     * ```
     * Please note that `createCustomerAccount` is currently in an early stage
     * of development. Therefore the API is unstable and not ready for public
     * consumption.
     *
     * @alpha
     * @param customerAccount - The customer account data.
     * @param options - Options for creating customer account.
     * @returns A promise that resolves to the current state.
     */
    createCustomerAccount(customerAccount: CustomerAccountRequestBody, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Creates a customer account address.
     *
     * @remarks
     * ```js
     * checkoutService.createCustomerAddress({
     *   firstName: 'Foo',
     *   lastName: 'Bar',
     *   address1: '55 Market St',
     *   stateOrProvinceCode: 'CA',
     *   countryCode: 'US',
     *   postalCode: '90110',
     *   customFields: [],
     * });
     * ```
     * Please note that `createCustomerAccountAddress` is currently in an early stage
     * of development. Therefore the API is unstable and not ready for public
     * consumption.
     *
     * @alpha
     * @param customerAddress - The customer account data.
     * @param options - Options for creating customer account.
     * @returns A promise that resolves to the current state.
     */
    createCustomerAddress(customerAddress: CustomerAddressRequestBody, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Updates the subscriptions associated to an email.
     *
     * @param subscriptions - The email and associated subscriptions to update.
     * @param options - Options for continuing as a guest.
     * @returns A promise that resolves to the current state.
     */
    updateSubscriptions(subscriptions: Subscriptions, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Continues to check out as a guest.
     *
     * If your Checkout Settings allow it, your customers could continue the checkout as guests (without signing in).
     * If you have enabled the checkout setting "Prompt existing accounts to sign in", this information is
     * exposed as part of the [Customer](../interfaces/customer.md) object.
     *
     * Once they provide their email address, it will be stored as
     * part of their [billing address](../interfaces/billingaddress.md).
     *
     * @param credentials - The guest credentials to use, with optional subscriptions.
     * @param options - Options for continuing as a guest.
     * @returns A promise that resolves to the current state.
     */
    continueAsGuest(credentials: GuestCredentials, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Signs into a customer's registered account.
     *
     * Once the customer is signed in successfully, the checkout state will be
     * populated with information associated with the customer, such as their
     * saved addresses. You can call `CheckoutStoreSelector#getCustomer` to
     * retrieve the data.
     *
     * ```js
     * const state = await service.signInCustomer({
     *     email: 'foo@bar.com',
     *     password: 'password123',
     * });
     *
     * console.log(state.data.getCustomer());
     * ```
     *
     * @param credentials - The credentials to be used for signing in the customer.
     * @param options - Options for signing in the customer.
     * @returns A promise that resolves to the current state.
     */
    signInCustomer(credentials: CustomerCredentials, options?: CustomerRequestOptions): Promise<CheckoutSelectors>;
    /**
     * Signs out the current customer if they are previously signed in.
     *
     * Once the customer is successfully signed out, the checkout state will be
     * reset automatically.
     *
     * ```js
     * const state = await service.signOutCustomer();
     *
     * // The returned object should not contain information about the previously signed-in customer.
     * console.log(state.data.getCustomer());
     * ```
     *
     * When a store has "Allow customers to access their cart across multiple devices" enabled, signing out
     * will remove the cart/checkout data from the current session. An error with type="checkout_not_available" will be thrown.
     *
     * ```js
     * try {
     *   await service.signOutCustomer();
     * } catch (error) {
     *   if (error.type === 'checkout_not_available') {
     *     window.top.location.assign('/');
     *   }
     * }
     * ```
     *
     * @param options - Options for signing out the customer.
     * @returns A promise that resolves to the current state.
     */
    signOutCustomer(options?: CustomerRequestOptions): Promise<CheckoutSelectors>;
    /**
     * Executes custom checkout of the priority payment method.
     *
     * Some payment methods, such as Bolt, can use their own checkout
     * with autofilled customers data, to make checkout passing process
     * easier and faster for customers with Bolt account.
     *
     * ```js
     * await service.executePaymentMethodCheckout({
     *     methodId: 'bolt',
     *     fallback: () => {},
     * });
     * ```
     *
     * @param options - Options for executing payment method checkout.
     * @returns A promise that resolves to the current state.
     */
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<CheckoutSelectors>;
    /**
     * Loads a list of shipping options available for checkout.
     *
     * Available shipping options can only be determined once a customer
     * provides their shipping address. If the method is executed successfully,
     * `CheckoutStoreSelector#getShippingOptions` can be called to retrieve the
     * list of shipping options.
     *
     * ```js
     * const state = await service.loadShippingOptions();
     *
     * console.log(state.data.getShippingOptions());
     * ```
     *
     * @param options - Options for loading the available shipping options.
     * @returns A promise that resolves to the current state.
     */
    loadShippingOptions(options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Initializes the shipping step of a checkout process.
     *
     * Some payment methods, such as Amazon, can provide shipping information to
     * be used for checkout. In order to support them, this method must be
     * called.
     *
     * ```js
     * await service.initializeShipping({
     *     methodId: 'amazon',
     *     amazon: {
     *         container: 'addressBook',
     *     },
     * });
     * ```
     *
     * @param options - Options for initializing the shipping step of checkout.
     * @returns A promise that resolves to the current state.
     */
    initializeShipping(options?: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    /**
     * De-initializes the shipping step of a checkout process.
     *
     * It should be called once you no longer need to collect shipping details.
     * It can perform any necessary clean-up behind the scene, i.e.: remove DOM
     * nodes or event handlers that are attached as a result of shipping
     * initialization.
     *
     * ```js
     * await service.deinitializeShipping({
     *     methodId: 'amazon',
     * });
     * ```
     *
     * @param options - Options for deinitializing the shipping step of checkout.
     * @returns A promise that resolves to the current state.
     */
    deinitializeShipping(options?: ShippingRequestOptions): Promise<CheckoutSelectors>;
    /**
     * Selects a shipping option for the current address.
     *
     * If a shipping option has an additional cost, the quote for the current
     * order will be adjusted once the option is selected.
     *
     * ```js
     * const state = await service.selectShippingOption('address-id', 'shipping-option-id');
     *
     * console.log(state.data.getSelectedShippingOption());
     * ```
     *
     * @param shippingOptionId - The identifier of the shipping option to
     * select.
     * @param options - Options for selecting the shipping option.
     * @returns A promise that resolves to the current state.
     */
    selectShippingOption(shippingOptionId: string, options?: ShippingRequestOptions): Promise<CheckoutSelectors>;
    /**
     * Updates the shipping address for the current checkout.
     *
     * When a customer updates their shipping address for an order, they will
     * see an updated list of shipping options and the cost for each option,
     * unless no options are available. If the update is successful, you can
     * call `CheckoutStoreSelector#getShippingAddress` to retrieve the address.
     *
     * If the shipping address changes and the selected shipping option becomes
     * unavailable for the updated address, the shipping option will be
     * deselected.
     *
     * You can submit an address that is partially complete. The address does
     * not get validated until you submit the order.
     *
     * ```js
     * const state = await service.updateShippingAddress(address);
     *
     * console.log(state.data.getShippingAddress());
     * ```
     *
     * @param address - The address to be used for shipping.
     * @param options - Options for updating the shipping address.
     * @returns A promise that resolves to the current state.
     */
    updateShippingAddress(address: Partial<AddressRequestBody>, options?: ShippingRequestOptions<CheckoutParams>): Promise<CheckoutSelectors>;
    /**
     * Creates consignments given a list.
     *
     * Note: this is used when items need to be shipped to multiple addresses,
     * for single shipping address, use `CheckoutService#updateShippingAddress`.
     *
     * When consignments are created, an updated list of shipping options will
     * become available for each consignment, unless no options are available.
     * If the update is successful, you can call
     * `CheckoutStoreSelector#getConsignments` to retrieve the updated list of
     * consignments.'
     *
     * Beware that if a consignment includes all line items from another
     * consignment, that consignment will be deleted as a valid consignment must
     * include at least one valid line item.
     *
     * You can submit an address that is partially complete. The address does
     * not get validated until you submit the order.
     *
     * ```js
     * const state = await service.createConsignments(consignments);
     *
     * console.log(state.data.getConsignments());
     * ```
     *
     * @param consignments - The list of consignments to be created.
     * @param options - Options for updating the shipping address.
     * @returns A promise that resolves to the current state.
     */
    createConsignments(consignments: ConsignmentsRequestBody, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Deletes a consignment
     *
     * ```js
     * const state = await service.deleteConsignment('55c96cda6f04c');
     *
     * console.log(state.data.getConsignments());
     * ```
     *
     * @param consignmentId - The ID of the consignment to be deleted
     * @param options - Options for the consignment delete request
     * @returns A promise that resolves to the current state.
     */
    deleteConsignment(consignmentId: string, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Updates a specific consignment.
     *
     * Note: this is used when items need to be shipped to multiple addresses,
     * for single shipping address, use `CheckoutService#selectShippingOption`.
     *
     * When a shipping address for a consignment is updated, an updated list of
     * shipping options will become available for the consignment, unless no
     * options are available. If the update is successful, you can call
     * `CheckoutStoreSelector#getConsignments` to retrieve updated list of
     * consignments.
     *
     * Beware that if the updated consignment includes all line items from another
     * consignment, that consignment will be deleted as a valid consignment must
     * include at least one valid line item.
     *
     * If the shipping address changes and the selected shipping option becomes
     * unavailable for the updated address, the shipping option will be
     * deselected.
     *
     * You can submit an address that is partially complete. The address does
     * not get validated until you submit the order.
     *
     * ```js
     * const state = await service.updateConsignment(consignment);
     *
     * console.log(state.data.getConsignments());
     * ```
     *
     * @param consignment - The consignment data that will be used.
     * @param options - Options for updating the shipping address.
     * @returns A promise that resolves to the current state.
     */
    updateConsignment(consignment: ConsignmentUpdateRequestBody, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Convenience method that assigns items to be shipped to a specific address.
     *
     * Note: this method finds an existing consignment that matches the provided address
     * and assigns the provided items. If no consignment matches the address, a new one
     * will be created.
     *
     * @param consignment - The consignment data that will be used.
     * @param options - Options for the request
     * @returns A promise that resolves to the current state.
     */
    assignItemsToAddress(consignment: ConsignmentAssignmentRequestBody, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Convenience method that unassigns items from a specific shipping address.
     *
     * Note: this method finds an existing consignment that matches the provided address
     * and unassigns the specified items. If the consignment ends up with no line items
     * after the unassignment, it will be deleted.
     *
     * @param consignment - The consignment data that will be used.
     * @param options - Options for the request
     * @returns A promise that resolves to the current state.
     */
    unassignItemsToAddress(consignment: ConsignmentAssignmentRequestBody, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Selects a shipping option for a given consignment.
     *
     * Note: this is used when items need to be shipped to multiple addresses,
     * for single shipping address, use `CheckoutService#updateShippingAddress`.
     *
     * If a shipping option has an additional cost, the quote for the current
     * order will be adjusted once the option is selected.
     *
     * ```js
     * const state = await service.selectConsignmentShippingOption(consignmentId, optionId);
     *
     * console.log(state.data.getConsignments());
     * ```
     *
     * @param consignmentId - The identified of the consignment to be updated.
     * @param shippingOptionId - The identifier of the shipping option to
     * select.
     * @param options - Options for selecting the shipping option.
     * @returns A promise that resolves to the current state.
     */
    selectConsignmentShippingOption(consignmentId: string, shippingOptionId: string, options?: ShippingRequestOptions): Promise<CheckoutSelectors>;
    /**
     * Updates the billing address for the current checkout.
     *
     * A customer must provide their billing address before they can proceed to
     * pay for their order.
     *
     * You can submit an address that is partially complete. The address does
     * not get validated until you submit the order.
     *
     * ```js
     * const state = await service.updateBillingAddress(address);
     *
     * console.log(state.data.getBillingAddress());
     * ```
     *
     * @param address - The address to be used for billing.
     * @param options - Options for updating the billing address.
     * @returns A promise that resolves to the current state.
     */
    updateBillingAddress(address: Partial<BillingAddressRequestBody>, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Applies or removes customer's store credit code to the current checkout.
     *
     * Once the store credit gets applied, the outstanding balance will be adjusted accordingly.
     *
     * ```js
     * const state = await service.applyStoreCredit(true);
     *
     * console.log(state.data.getCheckout().outstandingBalance);
     * ```
     *
     * @param options - Options for applying store credit.
     * @returns A promise that resolves to the current state.
     */
    applyStoreCredit(useStoreCredit: boolean, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Applies a coupon code to the current checkout.
     *
     * Once the coupon code gets applied, the quote for the current checkout will
     * be adjusted accordingly. The same coupon code cannot be applied more than
     * once.
     *
     * ```js
     * await service.applyCoupon('COUPON');
     * ```
     *
     * @param code - The coupon code to apply to the current checkout.
     * @param options - Options for applying the coupon code.
     * @returns A promise that resolves to the current state.
     */
    applyCoupon(code: string, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Removes a coupon code from the current checkout.
     *
     * Once the coupon code gets removed, the quote for the current checkout will
     * be adjusted accordingly.
     *
     * ```js
     * await service.removeCoupon('COUPON');
     * ```
     *
     * @param code - The coupon code to remove from the current checkout.
     * @param options - Options for removing the coupon code.
     * @returns A promise that resolves to the current state.
     */
    removeCoupon(code: string, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Applies a gift certificate to the current checkout.
     *
     * Once the gift certificate gets applied, the quote for the current
     * checkout will be adjusted accordingly.
     *
     * ```js
     * await service.applyGiftCertificate('GIFT_CERTIFICATE');
     * ```
     *
     * @param code - The gift certificate to apply to the current checkout.
     * @param options - Options for applying the gift certificate.
     * @returns A promise that resolves to the current state.
     */
    applyGiftCertificate(code: string, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Removes a gift certificate from an order.
     *
     * Once the gift certificate gets removed, the quote for the current
     * checkout will be adjusted accordingly.
     *
     * ```js
     * await service.removeGiftCertificate('GIFT_CERTIFICATE');
     * ```
     *
     * @param code - The gift certificate to remove from the current checkout.
     * @param options - Options for removing the gift certificate.
     * @returns A promise that resolves to the current state.
     */
    removeGiftCertificate(code: string, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Loads a list of payment instruments associated with a customer.
     *
     * Once the method has been called successfully, you can retrieve the list
     * of payment instruments by calling `CheckoutStoreSelector#getInstruments`.
     * If the customer does not have any payment instruments on record, i.e.:
     * credit card, you will get an empty list instead.
     *
     * ```js
     * const state = service.loadInstruments();
     *
     * console.log(state.data.getInstruments());
     * ```
     *
     * @returns A promise that resolves to the current state.
     */
    loadInstruments(): Promise<CheckoutSelectors>;
    /**
     * Deletes a payment instrument by an id.
     *
     * Once an instrument gets removed, it can no longer be retrieved using
     * `CheckoutStoreSelector#getInstruments`.
     *
     * ```js
     * const state = service.deleteInstrument('123');
     *
     * console.log(state.data.getInstruments());
     * ```
     *
     * @param instrumentId - The identifier of the payment instrument to delete.
     * @returns A promise that resolves to the current state.
     */
    deleteInstrument(instrumentId: string): Promise<CheckoutSelectors>;
    /**
     * Clear errors that have been collected from previous calls.
     *
     * ```js
     * const state = await service.clearError(error);
     *
     * console.log(state.errors.getError());
     * ```
     *
     * @param error - Specific error object to clear
     * @returns A promise that resolves to the current state.
     */
    clearError(error: Error): Promise<CheckoutSelectors>;
    /**
     * Initializes the spam protection for order creation.
     *
     * Note: Use `CheckoutService#executeSpamCheck` instead.
     * You do not need to call this method before calling
     * `CheckoutService#executeSpamCheck`.
     *
     * With spam protection enabled, the customer has to be verified as
     * a human. The order creation will fail if spam protection
     * is enabled but verification fails.
     *
     * ```js
     * await service.initializeSpamProtection();
     * ```
     *
     * @param options - Options for initializing spam protection.
     * @returns A promise that resolves to the current state.
     * @deprecated - Use CheckoutService#executeSpamCheck instead.
     */
    initializeSpamProtection(options: SpamProtectionOptions): Promise<CheckoutSelectors>;
    /**
     * Verifies whether the current checkout is created by a human.
     *
     * Note: this method will do the initialization, therefore you do not
     * need to call `CheckoutService#initializeSpamProtection`
     * before calling this method.
     *
     * With spam protection enabled, the customer has to be verified as
     * a human. The order creation will fail if spam protection
     * is enabled but verification fails. You should call this method before
     * `submitOrder` method is called (i.e.: when the shopper
     * first gets to the payment step).
     *
     * **Note**: You need to enable Google ReCAPTCHA bot protection in your Checkout Settings.
     *
     * ```js
     * await service.executeSpamCheck();
     * ```
     *
     * @returns A promise that resolves to the current state.
     */
    executeSpamCheck(): Promise<CheckoutSelectors>;
    /**
     * Dispatches an action through the data store and returns the current state
     * once the action is dispatched.
     *
     * @param action - The action to dispatch.
     * @returns A promise that resolves to the current state.
     */
    private _dispatch;
}

declare interface CheckoutServiceOptions {
    locale?: string;
    host?: string;
    shouldWarnMutation?: boolean;
    externalSource?: string;
}

declare interface CheckoutSettings {
    features: {
        [featureName: string]: boolean;
    };
    checkoutBillingSameAsShippingEnabled: boolean;
    enableOrderComments: boolean;
    enableTermsAndConditions: boolean;
    googleMapsApiKey: string;
    googleRecaptchaSitekey: string;
    isAccountCreationEnabled: boolean;
    isStorefrontSpamProtectionEnabled: boolean;
    guestCheckoutEnabled: boolean;
    hasMultiShippingEnabled: boolean;
    isAnalyticsEnabled: boolean;
    isCardVaultingEnabled: boolean;
    isCouponCodeCollapsed: boolean;
    isSignInEmailEnabled: boolean;
    isPaymentRequestEnabled: boolean;
    isPaymentRequestCanMakePaymentEnabled: boolean;
    isSpamProtectionEnabled: boolean;
    isTrustedShippingAddressEnabled: boolean;
    orderTermsAndConditions: string;
    orderTermsAndConditionsLink: string;
    orderTermsAndConditionsType: string;
    privacyPolicyUrl: string;
    providerWithCustomCheckout: string | null;
    shippingQuoteFailedMessage: string;
    realtimeShippingProviders: string[];
    requiresMarketingConsent: boolean;
    remoteCheckoutProviders: any[];
}

/**
 * Responsible for getting the error of any asynchronous checkout action, if
 * there is any.
 *
 * This object has a set of getters that would return an error if an action is
 * not executed successfully. For example, if you are unable to submit an order,
 * you can use this object to retrieve the reason for the failure.
 */
declare interface CheckoutStoreErrorSelector {
    getError(): Error | undefined;
    /**
     * Returns an error if unable to load the current checkout.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadCheckoutError(): Error | undefined;
    /**
     * Returns an error if unable to update the current checkout.
     *
     * @returns The error object if unable to update, otherwise undefined.
     */
    getUpdateCheckoutError(): Error | undefined;
    /**
     * Returns an error if unable to submit the current order.
     *
     * @returns The error object if unable to submit, otherwise undefined.
     */
    getSubmitOrderError(): Error | CartChangedError | undefined;
    /**
     * Returns an error if unable to finalize the current order.
     *
     * @returns The error object if unable to finalize, otherwise undefined.
     */
    getFinalizeOrderError(): Error | undefined;
    /**
     * Returns an error if unable to load the current order.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadOrderError(): Error | undefined;
    /**
     * Returns an error if unable to load the current cart.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadCartError(): Error | undefined;
    /**
     * Returns an error if unable to load billing countries.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadBillingCountriesError(): Error | undefined;
    /**
     * Returns an error if unable to load shipping countries.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadShippingCountriesError(): Error | undefined;
    /**
     * Returns an error if unable to load payment methods.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadPaymentMethodsError(): Error | undefined;
    /**
     * Returns an error if unable to load a specific payment method.
     *
     * @param methodId - The identifier of the payment method to load.
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadPaymentMethodError(methodId?: string): Error | undefined;
    /**
     * Returns an error if unable to initialize a specific payment method.
     *
     * @param methodId - The identifier of the payment method to initialize.
     * @returns The error object if unable to initialize, otherwise undefined.
     */
    getInitializePaymentError(methodId?: string): Error | undefined;
    /**
     * Returns an error if unable to sign in.
     *
     * @returns The error object if unable to sign in, otherwise undefined.
     */
    getSignInError(): Error | undefined;
    /**
     * Returns an error if unable to sign out.
     *
     * @returns The error object if unable to sign out, otherwise undefined.
     */
    getSignOutError(): Error | undefined;
    /**
     * Returns an error if unable to initialize the customer step of a checkout
     * process.
     *
     * @param methodId - The identifer of the initialization method to execute.
     * @returns The error object if unable to initialize, otherwise undefined.
     */
    getInitializeCustomerError(methodId?: string): Error | undefined;
    /**
     * Returns an error if unable to load shipping options.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadShippingOptionsError(): Error | undefined;
    /**
     * Returns an error if unable to select a shipping option.
     *
     * A consignment ID should be provided when checking for an error for a
     * specific consignment, otherwise it will check for all available consignments.
     *
     * @param consignmentId - The identifier of the consignment to be checked.
     * @returns The error object if unable to select, otherwise undefined.
     */
    getSelectShippingOptionError(consignmentId?: string): Error | undefined;
    /**
     * Returns an error if unable to continue as guest.
     *
     * The call could fail in scenarios where guest checkout is not allowed, for example, when existing accounts are required to sign-in.
     *
     * In the background, this call tries to set the billing address email using the Storefront API. You could access the Storefront API response status code using `getContinueAsGuestError` error selector.
     *
     * ```js
     * console.log(state.errors.getContinueAsGuestError());
     * console.log(state.errors.getContinueAsGuestError().status);
     * ```
     *
     * For more information about status codes, check [Checkout Storefront API - Add Checkout Billing Address](https://developer.bigcommerce.com/api-reference/cart-checkout/storefront-checkout-api/checkout-billing-address/checkoutsbillingaddressbycheckoutidpost).
     *
     * @returns The error object if unable to continue, otherwise undefined.
     */
    getContinueAsGuestError(): Error | undefined;
    /**
     * Returns an error if unable to update billing address.
     *
     * @returns The error object if unable to update, otherwise undefined.
     */
    getUpdateBillingAddressError(): Error | undefined;
    /**
     * Returns an error if unable to update subscriptions.
     *
     * @returns The error object if unable to update, otherwise undefined.
     */
    getUpdateSubscriptionsError(): Error | undefined;
    /**
     * Returns an error if unable to update shipping address.
     *
     * @returns The error object if unable to update, otherwise undefined.
     */
    getUpdateShippingAddressError(): Error | undefined;
    /**
     * Returns an error if unable to delete a consignment.
     *
     * A consignment ID should be provided when checking for an error for a
     * specific consignment, otherwise it will check for all available consignments.
     *
     * @param consignmentId - The identifier of the consignment to be checked.
     * @returns The error object if unable to delete, otherwise undefined.
     */
    getDeleteConsignmentError(consignmentId?: string): Error | undefined;
    /**
     * Returns an error if unable to update a consignment.
     *
     * A consignment ID should be provided when checking for an error for a
     * specific consignment, otherwise it will check for all available consignments.
     *
     * @param consignmentId - The identifier of the consignment to be checked.
     * @returns The error object if unable to update, otherwise undefined.
     */
    getUpdateConsignmentError(consignmentId?: string): Error | undefined;
    /**
     * Returns an error if unable to create consignments.
     *
     * @returns The error object if unable to create, otherwise undefined.
     */
    getCreateConsignmentsError(): Error | undefined;
    /**
     * Returns an error if unable to initialize the shipping step of a checkout
     * process.
     *
     * @param methodId - The identifer of the initialization method to execute.
     * @returns The error object if unable to initialize, otherwise undefined.
     */
    getInitializeShippingError(methodId?: string): Error | undefined;
    /**
     * Returns an error if unable to apply store credit.
     *
     * @returns The error object if unable to apply, otherwise undefined.
     */
    getApplyStoreCreditError(): RequestError | undefined;
    /**
     * Returns an error if unable to apply a coupon code.
     *
     * @returns The error object if unable to apply, otherwise undefined.
     */
    getApplyCouponError(): RequestError | undefined;
    /**
     * Returns an error if unable to remove a coupon code.
     *
     * @returns The error object if unable to remove, otherwise undefined.
     */
    getRemoveCouponError(): RequestError | undefined;
    /**
     * Returns an error if unable to apply a gift certificate.
     *
     * @returns The error object if unable to apply, otherwise undefined.
     */
    getApplyGiftCertificateError(): RequestError | undefined;
    /**
     * Returns an error if unable to remove a gift certificate.
     *
     * @returns The error object if unable to remove, otherwise undefined.
     */
    getRemoveGiftCertificateError(): RequestError | undefined;
    /**
     * Returns an error if unable to load payment instruments.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadInstrumentsError(): Error | undefined;
    /**
     * Returns an error if unable to delete a payment instrument.
     *
     * @param instrumentId - The identifier of the payment instrument to delete.
     * @returns The error object if unable to delete, otherwise undefined.
     */
    getDeleteInstrumentError(instrumentId?: string): Error | undefined;
    /**
     * Returns an error if unable to load the checkout configuration of a store.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadConfigError(): Error | undefined;
    /**
     * Returns an error if unable to send sign-in email.
     *
     * @returns The error object if unable to send email, otherwise undefined.
     */
    getSignInEmailError(): Error | undefined;
    /**
     * Returns an error if unable to create customer account.
     *
     * @returns The error object if unable to create account, otherwise undefined.
     */
    getCreateCustomerAccountError(): Error | undefined;
    /**
     * Returns an error if unable to create customer address.
     *
     * @returns The error object if unable to create address, otherwise undefined.
     */
    getCreateCustomerAddressError(): Error | undefined;
    /**
     * Returns an error if unable to fetch pickup options.
     *
     * @returns The error object if unable to fetch pickup options, otherwise undefined.
     */
    getPickupOptionsError(): Error | undefined;
}

/**
 * Responsible for getting the state of the current checkout.
 *
 * This object has a set of methods that allow you to get a specific piece of
 * checkout information, such as shipping and billing details.
 */
declare interface CheckoutStoreSelector {
    /**
     * Gets the current checkout.
     *
     * @returns The current checkout if it is loaded, otherwise undefined.
     */
    getCheckout(): Checkout | undefined;
    /**
     * Gets the current order.
     *
     * @returns The current order if it is loaded, otherwise undefined.
     */
    getOrder(): Order | undefined;
    /**
     * Gets the checkout configuration of a store.
     *
     * @returns The configuration object if it is loaded, otherwise undefined.
     */
    getConfig(): StoreConfig | undefined;
    /**
     * Gets the sign-in email.
     *
     * @returns The sign-in email object if sent, otherwise undefined
     */
    getSignInEmail(): SignInEmail | undefined;
    /**
     * Gets the shipping address of the current checkout.
     *
     * If the address is partially complete, it may not have shipping options
     * associated with it.
     *
     * @returns The shipping address object if it is loaded, otherwise
     * undefined.
     */
    getShippingAddress(): Address | undefined;
    /**
     * Gets a list of shipping options available for the shipping address.
     *
     * If there is no shipping address assigned to the current checkout, the
     * list of shipping options will be empty.
     *
     * @returns The list of shipping options if any, otherwise undefined.
     */
    getShippingOptions(): ShippingOption[] | undefined;
    /**
     * Gets a list of consignments.
     *
     * If there are no consignments created for to the current checkout, the
     * list will be empty.
     *
     * @returns The list of consignments if any, otherwise undefined.
     */
    getConsignments(): Consignment[] | undefined;
    /**
     * Gets the selected shipping option for the current checkout.
     *
     * @returns The shipping option object if there is a selected option,
     * otherwise undefined.
     */
    getSelectedShippingOption(): ShippingOption | undefined;
    /**
     * Gets a list of countries available for shipping.
     *
     * @returns The list of countries if it is loaded, otherwise undefined.
     */
    getShippingCountries(): Country[] | undefined;
    /**
     * Gets the billing address of an order.
     *
     * @returns The billing address object if it is loaded, otherwise undefined.
     */
    getBillingAddress(): BillingAddress | undefined;
    /**
     * Gets a list of countries available for billing.
     *
     * @returns The list of countries if it is loaded, otherwise undefined.
     */
    getBillingCountries(): Country[] | undefined;
    /**
     * Gets a list of payment methods available for checkout.
     *
     * @returns The list of payment methods if it is loaded, otherwise undefined.
     */
    getPaymentMethods(): PaymentMethod[] | undefined;
    /**
     * Gets a payment method by an id.
     *
     * The method returns undefined if unable to find a payment method with the
     * specified id, either because it is not available for the customer, or it
     * is not loaded.
     *
     * @param methodId - The identifier of the payment method.
     * @param gatewayId - The identifier of a payment provider providing the
     * payment method.
     * @returns The payment method object if loaded and available, otherwise,
     * undefined.
     */
    getPaymentMethod(methodId: string, gatewayId?: string): PaymentMethod | undefined;
    /**
     * Gets the payment method that is selected for checkout.
     *
     * @returns The payment method object if there is a selected method;
     * undefined if otherwise.
     */
    getSelectedPaymentMethod(): PaymentMethod | undefined;
    /**
     * Gets the available flash messages.
     *
     * Flash messages contain messages set by the server,
     * e.g: when trying to sign in using an invalid email link.
     *
     * @param type - The type of flash messages to be returned. Optional
     * @returns The flash messages if available, otherwise undefined.
     */
    getFlashMessages(type?: FlashMessageType): FlashMessage[] | undefined;
    /**
     * Gets the current cart.
     *
     * @returns The current cart object if it is loaded, otherwise undefined.
     */
    getCart(): Cart | undefined;
    /**
     * Gets a list of coupons that are applied to the current checkout.
     *
     * @returns The list of applied coupons if there is any, otherwise undefined.
     */
    getCoupons(): Coupon[] | undefined;
    /**
     * Gets a list of gift certificates that are applied to the current checkout.
     *
     * @returns The list of applied gift certificates if there is any, otherwise undefined.
     */
    getGiftCertificates(): GiftCertificate[] | undefined;
    /**
     * Gets the current customer.
     *
     * @returns The current customer object if it is loaded, otherwise
     * undefined.
     */
    getCustomer(): Customer | undefined;
    /**
     * Checks if payment data is required or not.
     *
     * If payment data is required, customers should be prompted to enter their
     * payment details.
     *
     * ```js
     * if (state.checkout.isPaymentDataRequired()) {
     *     // Render payment form
     * } else {
     *     // Render "Payment is not required for this order" message
     * }
     * ```
     *
     * @param useStoreCredit - If true, check whether payment data is required
     * with store credit applied; otherwise, check without store credit.
     * @returns True if payment data is required, otherwise false.
     */
    isPaymentDataRequired(useStoreCredit?: boolean): boolean;
    /**
     * Checks if payment data is submitted or not.
     *
     * If payment data is already submitted using a payment method, customers
     * should not be prompted to enter their payment details again.
     *
     * @param methodId - The identifier of the payment method.
     * @param gatewayId - The identifier of a payment provider providing the
     * payment method.
     * @returns True if payment data is submitted, otherwise false.
     */
    isPaymentDataSubmitted(methodId: string, gatewayId?: string): boolean;
    /**
     * Gets a list of payment instruments associated with the current customer.
     *
     * @returns The list of payment instruments if it is loaded, otherwise undefined.
     */
    getInstruments(): Instrument[] | undefined;
    getInstruments(paymentMethod: PaymentMethod): PaymentInstrument[] | undefined;
    /**
     * Gets a set of form fields that should be presented in order to create a customer.
     *
     * @returns The set of customer account form fields if it is loaded,
     * otherwise undefined.
     */
    getCustomerAccountFields(): FormField[];
    /**
     * Gets a set of form fields that should be presented to customers in order
     * to capture their billing address for a specific country.
     *
     * @param countryCode - A 2-letter country code (ISO 3166-1 alpha-2).
     * @returns The set of billing address form fields if it is loaded,
     * otherwise undefined.
     */
    getBillingAddressFields(countryCode: string): FormField[];
    /**
     * Gets a set of form fields that should be presented to customers in order
     * to capture their shipping address for a specific country.
     *
     * @param countryCode - A 2-letter country code (ISO 3166-1 alpha-2).
     * @returns The set of shipping address form fields if it is loaded,
     * otherwise undefined.
     */
    getShippingAddressFields(countryCode: string): FormField[];
    /**
     * Gets a list of pickup options for specified parameters.
     *
     * @param consignmentId - Id of consignment.
     * @param searchArea - An object containing of radius and co-ordinates.
     * @returns The set of shipping address form fields if it is loaded,
     * otherwise undefined.
     */
    getPickupOptions(consignmentId: string, searchArea: SearchArea): PickupOptionResult[] | undefined;
}

/**
 * Responsible for checking the statuses of various asynchronous actions related
 * to checkout.
 *
 * This object has a set of getters that return true if an action is in
 * progress. For example, you can check whether a customer is submitting an
 * order and waiting for the request to complete.
 */
declare interface CheckoutStoreStatusSelector {
    /**
     * Checks whether any checkout action is pending.
     *
     * @returns True if there is a pending action, otherwise false.
     */
    isPending(): boolean;
    /**
     * Checks whether the current checkout is loading.
     *
     * @returns True if the current checkout is loading, otherwise false.
     */
    isLoadingCheckout(): boolean;
    /**
     * Checks whether the current checkout is being updated.
     *
     * @returns True if the current checkout is being updated, otherwise false.
     */
    isUpdatingCheckout(): boolean;
    /**
     * Checks whether spam check is executing.
     *
     * @returns True if the current checkout is being updated, otherwise false.
     */
    isExecutingSpamCheck(): boolean;
    /**
     * Checks whether the current order is submitting.
     *
     * @returns True if the current order is submitting, otherwise false.
     */
    isSubmittingOrder(): boolean;
    /**
     * Checks whether the current order is finalizing.
     *
     * @returns True if the current order is finalizing, otherwise false.
     */
    isFinalizingOrder(): boolean;
    /**
     * Checks whether the current order is loading.
     *
     * @returns True if the current order is loading, otherwise false.
     */
    isLoadingOrder(): boolean;
    /**
     * Checks whether the current cart is loading.
     *
     * @returns True if the current cart is loading, otherwise false.
     */
    isLoadingCart(): boolean;
    /**
     * Checks whether billing countries are loading.
     *
     * @returns True if billing countries are loading, otherwise false.
     */
    isLoadingBillingCountries(): boolean;
    /**
     * Checks whether shipping countries are loading.
     *
     * @returns True if shipping countries are loading, otherwise false.
     */
    isLoadingShippingCountries(): boolean;
    /**
     * Checks whether payment methods are loading.
     *
     * @returns True if payment methods are loading, otherwise false.
     */
    isLoadingPaymentMethods(): boolean;
    /**
     * Checks whether a specific or any payment method is loading.
     *
     * The method returns true if no ID is provided and at least one payment
     * method is loading.
     *
     * @param methodId - The identifier of the payment method to check.
     * @returns True if the payment method is loading, otherwise false.
     */
    isLoadingPaymentMethod(methodId?: string): boolean;
    /**
     * Checks whether a specific or any payment method is initializing.
     *
     * The method returns true if no ID is provided and at least one payment
     * method is initializing.
     *
     * @param methodId - The identifier of the payment method to check.
     * @returns True if the payment method is initializing, otherwise false.
     */
    isInitializingPayment(methodId?: string): boolean;
    /**
     * Checks whether the current customer is signing in.
     *
     * If an ID is provided, the method also checks whether the customer is
     * signing in using a specific customer method with the same ID.
     *
     * @param methodId - The identifier of the method used for signing in the
     * current customer.
     * @returns True if the customer is signing in, otherwise false.
     */
    isSigningIn(methodId?: string): boolean;
    /**
     * Checks whether the current customer is signing out.
     *
     * If an ID is provided, the method also checks whether the customer is
     * signing out using a specific customer method with the same ID.
     *
     * @param methodId - The identifier of the method used for signing out the
     * current customer.
     * @returns True if the customer is signing out, otherwise false.
     */
    isSigningOut(methodId?: string): boolean;
    /**
     * Checks whether the customer step is initializing.
     *
     * If an ID is provided, the method also checks whether the customer step is
     * initializing using a specific customer method with the same ID.
     *
     * @param methodId - The identifier of the method used for initializing the
     * customer step of checkout.
     * @returns True if the customer step is initializing, otherwise false.
     */
    isInitializingCustomer(methodId?: string): boolean;
    /**
     * Checks whether the current customer is executing payment method checkout.
     *
     * If an ID is provided, the method also checks whether the customer is
     * executing payment method checkout using a specific customer method with the same ID.
     *
     * @param methodId - The identifier of the method used for continuing the
     * current customer.
     * @returns True if the customer is executing payment method checkout, otherwise false.
     */
    isExecutingPaymentMethodCheckout(methodId?: string): boolean;
    /**
     * Checks whether shipping options are loading.
     *
     * @returns True if shipping options are loading, otherwise false.
     */
    isLoadingShippingOptions(): boolean;
    /**
     * Checks whether a shipping option is being selected.
     *
     * A consignment ID should be provided when checking if a shipping option
     * is being selected for a specific consignment, otherwise it will check
     * for all consignments.
     *
     * @param consignmentId - The identifier of the consignment to be checked.
     * @returns True if selecting a shipping option, otherwise false.
     */
    isSelectingShippingOption(consignmentId?: string): boolean;
    /**
     * Checks whether the billing address is being updated.
     *
     * @returns True if updating their billing address, otherwise false.
     */
    isUpdatingBillingAddress(): boolean;
    /**
     * Checks whether the shopper is continuing out as a guest.
     *
     * @returns True if continuing as guest, otherwise false.
     */
    isContinuingAsGuest(): boolean;
    /**
     * Checks the shipping address is being updated.
     *
     * @returns True if updating their shipping address, otherwise false.
     */
    isUpdatingShippingAddress(): boolean;
    /**
     * Checks whether a given/any consignment is being updated.
     *
     * A consignment ID should be provided when checking for a specific consignment,
     * otherwise it will check for any consignment.
     *
     * @param consignmentId - The identifier of the consignment to be checked.
     * @returns True if updating consignment(s), otherwise false.
     */
    isUpdatingConsignment(consignmentId?: string): boolean;
    /**
     * Checks whether a given/any consignment is being deleted.
     *
     * A consignment ID should be provided when checking for a specific consignment,
     * otherwise it will check for any consignment.
     *
     * @param consignmentId - The identifier of the consignment to be checked.
     * @returns True if deleting consignment(s), otherwise false.
     */
    isDeletingConsignment(consignmentId?: string): boolean;
    /**
     * Checks whether a given/any consignment is being updated.
     *
     * A consignment ID should be provided when checking for a specific consignment,
     * otherwise it will check for any consignment.
     *
     * @returns True if creating consignments, otherwise false.
     */
    isCreatingConsignments(): boolean;
    /**
     * Checks whether the shipping step of a checkout process is initializing.
     *
     * If an identifier is provided, the method also checks whether the shipping
     * step is initializing using a specific shipping method with the same
     * identifier.
     *
     * @param methodId - The identifer of the initialization method to check.
     * @returns True if the shipping step is initializing, otherwise false.
     */
    isInitializingShipping(methodId?: string): boolean;
    /**
     * Checks whether the current customer is applying a coupon code.
     *
     * @returns True if applying a coupon code, otherwise false.
     */
    isApplyingCoupon(): boolean;
    /**
     * Checks whether the current customer is applying store credit.
     *
     * @returns True if applying store credit, otherwise false.
     */
    isApplyingStoreCredit(): boolean;
    /**
     * Checks whether the current customer is removing a coupon code.
     *
     * @returns True if removing a coupon code, otherwise false.
     */
    isRemovingCoupon(): boolean;
    /**
     * Checks whether a sign-in email is being sent.
     *
     * @returns True if sending a sign-in email, otherwise false
     */
    isSendingSignInEmail(): boolean;
    /**
     * Checks whether the current customer is applying a gift certificate.
     *
     * @returns True if applying a gift certificate, otherwise false.
     */
    isApplyingGiftCertificate(): boolean;
    /**
     * Checks whether the current customer is removing a gift certificate.
     *
     * @returns True if removing a gift certificate, otherwise false.
     */
    isRemovingGiftCertificate(): boolean;
    /**
     * Checks whether the current customer's payment instruments are loading.
     *
     * @returns True if payment instruments are loading, otherwise false.
     */
    isLoadingInstruments(): boolean;
    /**
     * Checks whether the current customer is deleting a payment instrument.
     *
     * @returns True if deleting a payment instrument, otherwise false.
     */
    isDeletingInstrument(instrumentId?: string): boolean;
    /**
     * Checks whether the checkout configuration of a store is loading.
     *
     * @returns True if the configuration is loading, otherwise false.
     */
    isLoadingConfig(): boolean;
    /**
     * Checks whether the customer step of a checkout is in a pending state.
     *
     * The customer step is considered to be pending if it is in the process of
     * initializing, signing in, signing out, and/or interacting with a customer
     * widget.
     *
     * @returns True if the customer step is pending, otherwise false.
     */
    isCustomerStepPending(): boolean;
    /**
     * Checks whether the shipping step of a checkout is in a pending state.
     *
     * The shipping step is considered to be pending if it is in the process of
     * initializing, updating address, selecting a shipping option, and/or
     * interacting with a shipping widget.
     *
     * @returns True if the shipping step is pending, otherwise false.
     */
    isShippingStepPending(): boolean;
    /**
     * Checks whether the payment step of a checkout is in a pending state.
     *
     * The payment step is considered to be pending if it is in the process of
     * initializing, submitting an order, finalizing an order, and/or
     * interacting with a payment widget.
     *
     * @returns True if the payment step is pending, otherwise false.
     */
    isPaymentStepPending(): boolean;
    /**
     * Checks whether the subscriptions are being updated.
     *
     * @returns True if updating subscriptions, otherwise false.
     */
    isUpdatingSubscriptions(): boolean;
    /**
     * Checks whether a customer account is being created
     *
     * @returns True if creating, otherwise false.
     */
    isCreatingCustomerAccount(): boolean;
    /**
     * Checks whether a customer address is being created
     *
     * @returns True if creating, otherwise false.
     */
    isCreatingCustomerAddress(): boolean;
    /**
     * Checks whether pickup options are loading.
     *
     * @returns True if pickup options are loading, otherwise false.
     */
    isLoadingPickupOptions(): boolean;
}

declare type ComparableCheckout = Pick<Checkout, 'outstandingBalance' | 'coupons' | 'giftCertificates'> & {
    cart: Partial<Cart>;
};

declare interface Consignment {
    id: string;
    address: Address;
    shippingAddress: Address;
    handlingCost: number;
    shippingCost: number;
    availableShippingOptions?: ShippingOption[];
    selectedShippingOption?: ShippingOption;
    selectedPickupOption?: ConsignmentPickupOption;
    lineItemIds: string[];
}

declare interface ConsignmentAssignmentBaseRequestBodyWithAddress {
    address: AddressRequestBody;
    lineItems: ConsignmentLineItem[];
    pickupOption?: ConsignmentPickupOption;
}

declare interface ConsignmentAssignmentBaseRequestBodyWithShippingAddress {
    shippingAddress: AddressRequestBody;
    lineItems: ConsignmentLineItem[];
    pickupOption?: ConsignmentPickupOption;
}

declare type ConsignmentAssignmentRequestBody = ConsignmentAssignmentBaseRequestBodyWithShippingAddress | ConsignmentAssignmentBaseRequestBodyWithAddress;

declare interface ConsignmentCreateRequestBody {
    address?: AddressRequestBody;
    shippingAddress?: AddressRequestBody;
    lineItems: ConsignmentLineItem[];
    pickupOption?: ConsignmentPickupOption;
}

declare interface ConsignmentLineItem {
    itemId: string | number;
    quantity: number;
}

declare interface ConsignmentPickupOption {
    pickupMethodId: number;
}

declare type ConsignmentsRequestBody = ConsignmentCreateRequestBody[];

declare interface ConsignmentUpdateRequestBody {
    id: string;
    address?: AddressRequestBody;
    shippingAddress?: AddressRequestBody;
    lineItems?: ConsignmentLineItem[];
    pickupOption?: ConsignmentPickupOption;
}

declare interface Coordinates {
    latitude: number;
    longitude: number;
}

declare interface Country {
    code: string;
    name: string;
    hasPostalCodes: boolean;
    subdivisions: Region[];
    requiresState: boolean;
}

declare interface Coupon {
    id: string;
    displayName: string;
    code: string;
    couponType: string;
    discountedAmount: number;
}

/**
 * Creates an instance of BodlService.
 *
 * @remarks
 * ```js
 * const bodlService = BodlService();
 * bodlService.checkoutBegin();
 * ```
 *
 * @returns an instance of `BodlService`.
 */
export declare function createBodlService(subscribe: (subscriber: (state: CheckoutSelectors) => void) => void): BodlService;

/**
 * Creates an instance of `CheckoutButtonInitializer`.
 *
 * @remarks
 * ```js
 * const initializer = createCheckoutButtonInitializer();
 *
 * initializer.initializeButton({
 *     methodId: 'braintreepaypal',
 *     braintreepaypal: {
 *         container: '#checkoutButton',
 *     },
 * });
 * ```
 *
 * @alpha
 * Please note that `CheckoutButtonInitializer` is currently in an early stage
 * of development. Therefore the API is unstable and not ready for public
 * consumption.
 *
 * @param options - A set of construction options.
 * @returns an instance of `CheckoutButtonInitializer`.
 */
export declare function createCheckoutButtonInitializer(options?: CheckoutButtonInitializerOptions): CheckoutButtonInitializer;

/**
 * Creates an instance of `CheckoutService`.
 *
 * @remarks
 * ```js
 * const service = createCheckoutService();
 *
 * service.subscribe(state => {
 *     console.log(state);
 * });
 *
 * service.loadCheckout();
 * ```
 *
 * @param options - A set of construction options.
 * @returns an instance of `CheckoutService`.
 */
export declare function createCheckoutService(options?: CheckoutServiceOptions): CheckoutService;

/**
 * Creates an instance of `CurrencyService`.
 *
 * @remarks
 * ```js
 * const { data } = checkoutService.getState();
 * const config = data.getConfig();
 * const checkout = data.getCheckout();
 * const currencyService = createCurrencyService(config);
 *
 * currencyService.toStoreCurrency(checkout.grandTotal);
 * currencyService.toCustomerCurrency(checkout.grandTotal);
 * ```
 *
 * @param config - The config object containing the currency configuration
 * @returns an instance of `CurrencyService`.
 */
export declare function createCurrencyService(config: StoreConfig): CurrencyService;

/**
 * Create an instance of `EmbeddedCheckoutMessenger`.
 *
 * @remarks
 * The object is responsible for posting messages to the parent window from the
 * iframe when certain events have occurred. For example, when the checkout
 * form is first loaded, you should notify the parent window about it.
 *
 * The iframe can only be embedded in domains that are allowed by the store.
 *
 * ```ts
 * const messenger = createEmbeddedCheckoutMessenger({
 *     parentOrigin: 'https://some/website',
 * });
 *
 * messenger.postFrameLoaded();
 * ```
 *
 * @alpha
 * Please note that this feature is currently in an early stage of development.
 * Therefore the API is unstable and not ready for public consumption.
 *
 * @param options - Options for creating `EmbeddedCheckoutMessenger`
 * @returns - An instance of `EmbeddedCheckoutMessenger`
 */
export declare function createEmbeddedCheckoutMessenger(options: EmbeddedCheckoutMessengerOptions): EmbeddedCheckoutMessenger;

/**
 * Creates an instance of `LanguageService`.
 *
 * @remarks
 * ```js
 * const language = {{{langJson 'optimized_checkout'}}}; // `langJson` is a Handlebars helper provided by BigCommerce's Stencil template engine.
 * const service = createLanguageService(language);
 *
 * console.log(service.translate('address.city_label'));
 * ```
 *
 * @param config - A configuration object.
 * @returns An instance of `LanguageService`.
 */
export declare function createLanguageService(config?: Partial<LanguageConfig>): LanguageService;

/**
 * Creates an instance of `StepTracker`.
 *
 * @remarks
 * ```js
 * const checkoutService = createCheckoutService();
 * await checkoutService.loadCheckout();
 * const stepTracker = createStepTracker(checkoutService);
 *
 * stepTracker.trackCheckoutStarted();
 * ```
 *
 * @param CheckoutService - An instance of CheckoutService
 * @param StepTrackerConfig - A step tracker config object
 * @returns an instance of `StepTracker`.
 */
export declare function createStepTracker(checkoutService: CheckoutService, stepTrackerConfig?: StepTrackerConfig): StepTracker;

export { createTimeout }

declare interface CreditCardInstrument {
    ccCustomerCode?: string;
    ccExpiry: {
        month: string;
        year: string;
    };
    ccName: string;
    ccNumber: string;
    ccCvv?: string;
    shouldSaveInstrument?: boolean;
    shouldSetAsDefaultInstrument?: boolean;
    extraData?: any;
    threeDSecure?: ThreeDSecure | ThreeDSecureToken;
    browser_info?: BrowserInfo;
}

/**
 * A set of options to initialize credit card payment methods, unless those
 * methods require provider-specific configuration. If the initialization is
 * successful, hosted (iframed) credit card fields will be inserted into the the
 * containers specified in the options.
 *
 * ```html
 * <!-- These containers are where the hosted (iframed) credit card fields will be inserted -->
 * <div id="card-number"></div>
 * <div id="card-name"></div>
 * <div id="card-expiry"></div>
 * <div id="card-code"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'authorizenet',
 *     creditCard: {
 *         form: {
 *             fields: {
 *                 cardNumber: { containerId: 'card-number' },
 *                 cardName: { containerId: 'card-name' },
 *                 cardExpiry: { containerId: 'card-expiry' },
 *                 cardCode: { containerId: 'card-code' },
 *             },
 *         },
 *     },
 * });
 * ```
 *
 * Additional options can be passed in to customize the fields and register
 * event callbacks.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'authorizenet',
 *     creditCard: {
 *         form: {
 *             fields: {
 *                 cardNumber: { containerId: 'card-number' },
 *                 cardName: { containerId: 'card-name' },
 *                 cardExpiry: { containerId: 'card-expiry' },
 *                 cardCode: { containerId: 'card-code' },
 *             },
 *             styles: {
 *                 default: {
 *                     color: '#000',
 *                     fontFamily: 'Arial',
 *                 },
 *                 error: {
 *                     color: '#f00',
 *                 },
 *                 focus: {
 *                     color: '#0f0',
 *                 },
 *             },
 *             onBlur({ fieldType }) {
 *                 console.log(fieldType);
 *             },
 *             onFocus({ fieldType }) {
 *                 console.log(fieldType);
 *             },
 *             onEnter({ fieldType }) {
 *                 console.log(fieldType);
 *             },
 *             onCardTypeChange({ cardType }) {
 *                 console.log(cardType);
 *             },
 *             onValidate({ errors, isValid }) {
 *                 console.log(errors);
 *                 console.log(isValid);
 *             },
 *         },
 *     },
 * });
 * ```
 */
declare interface CreditCardPaymentInitializeOptions {
    form: HostedFormOptions;
}

declare interface CreditCardPlaceHolder {
    encryptedCardNumber?: string;
    encryptedExpiryDate?: string;
    encryptedSecurityCode: string;
}

declare interface CreditCardPlaceHolder_2 {
    encryptedCardNumber?: string;
    encryptedExpiryDate?: string;
    encryptedSecurityCode: string;
}

declare interface CssProperties {
    background?: string;
    color?: string;
    display?: string;
    font?: string;
    fontFamily?: string;
    fontSize?: string;
    fontSizeAdjust?: string;
    fontSmoothing?: string;
    fontStretch?: string;
    fontStyle?: string;
    fontVariant?: string;
    fontVariantAlternates?: string;
    fontVariantCaps?: string;
    fontVariantEastAsian?: string;
    fontVariantLigatures?: string;
    fontVariantNumeric?: string;
    fontWeight?: string;
    letterSpacing?: string;
    lineHeight?: string;
    mozOsxFontSmoothing?: string;
    mozTransition?: string;
    outline?: string;
    opacity?: string | number;
    padding?: string;
    textAlign?: string;
    textShadow?: string;
    transition?: string;
    webkitFontSmoothing?: string;
    webkitTransition?: string;
}

declare interface CssProperties_2 {
    background?: string;
    color?: string;
    display?: string;
    font?: string;
    fontFamily?: string;
    fontSize?: string;
    fontSizeAdjust?: string;
    fontSmoothing?: string;
    fontStretch?: string;
    fontStyle?: string;
    fontVariant?: string;
    fontVariantAlternates?: string;
    fontVariantCaps?: string;
    fontVariantEastAsian?: string;
    fontVariantLigatures?: string;
    fontVariantNumeric?: string;
    fontWeight?: string;
    letterSpacing?: string;
    lineHeight?: string;
    mozOsxFontSmoothing?: string;
    mozTransition?: string;
    outline?: string;
    opacity?: string | number;
    padding?: string;
    textAlign?: string;
    textShadow?: string;
    transition?: string;
    webkitFontSmoothing?: string;
    webkitTransition?: string;
}

declare interface Currency {
    name: string;
    code: string;
    symbol: string;
    decimalPlaces: number;
}

/**
 * Responsible for formatting and converting currencies.
 */
declare class CurrencyService {
    private _storeConfig;
    private _customerFormatter;
    private _storeFormatter;
    toCustomerCurrency(amount: number): string;
    toStoreCurrency(amount: number): string;
}

declare interface Customer {
    id: number;
    addresses: CustomerAddress[];
    storeCredit: number;
    /**
     * The email address of the signed in customer.
     */
    email: string;
    firstName: string;
    fullName: string;
    isGuest: boolean;
    lastName: string;
    /**
     * Indicates whether the customer should be prompted to sign-in.
     *
     * Note: You need to enable "Prompt existing accounts to sign in" in your Checkout Settings.
     */
    shouldEncourageSignIn: boolean;
    isStripeLinkAuthenticated?: boolean;
    customerGroup?: CustomerGroup;
}

declare interface CustomerAccountRequestBody {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    acceptsMarketingEmails?: boolean;
    customFields?: Array<{
        fieldId: string;
        fieldValue: string | number | string[];
    }>;
}

declare interface CustomerAddress extends Address {
    id: number;
    type: string;
}

declare type CustomerAddressRequestBody = AddressRequestBody;

declare interface CustomerCredentials {
    email: string;
    password: string;
}

declare interface CustomerGroup {
    id: number;
    name: string;
}

declare type CustomerInitializeOptions = BaseCustomerInitializeOptions & WithApplePayCustomerInitializeOptions;

declare interface CustomerPasswordRequirements {
    alpha: string;
    numeric: string;
    minlength: number;
    description: string;
}

/**
 * A set of options for configuring any requests related to the customer step of
 * the current checkout flow.
 *
 * Some payment methods have their own sign-in or sign-out flow. Therefore, you
 * need to indicate the method you want to use if you need to trigger a specific
 * flow for signing in or out a customer. Otherwise, these options are not required.
 */
declare interface CustomerRequestOptions extends RequestOptions {
    methodId?: string;
}

declare interface CustomError extends Error {
    message: string;
    type: string;
    subtype?: string;
}

declare interface CustomItem {
    id: string;
    listPrice: number;
    extendedListPrice: number;
    name: string;
    quantity: number;
    sku: string;
}

declare interface DigitalItem extends LineItem {
    downloadFileUrls: string[];
    downloadPageUrl: string;
    downloadSize: string;
}

/**
 * Custom classes
 * You can specify custom classes as part of a Class object included within the Options object when you create or
 * update an element. If you do not provide custom classes, the system uses the default options.
 * https://docs.digitalriver.com/digital-river-api/payment-integrations-1/digitalriver.js/reference/elements#custom-classes
 */
declare interface DigitalRiverElementClasses {
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

/**
 * A set of options that are required to initialize the DigitalRiver payment method.
 *
 * When DigitalRiver is initialized, a widget will be inserted into the DOM. The widget has a list of payment options for the customer to choose from.
 *
 * ```html
 * <!-- This is where the widget will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *   methodId: 'digitalriver',
 *   digitalriver: {
 *       containerId: 'digitalriver-component-field',
 *       // Callback for submitting payment form that gets called when a buyer approves DR payment
 *       onSubmitForm: () => {
 *           // Example function
 *           this.submitOrder(
 *               {
 *                   payment: {methodId: 'digitalriver',}
 *               }
 *           );
 *       },
 *       onError: (error) => {
 *           console.log(error);
 *       },
 *   }
 * });
 * ```
 *
 * Additional options can be passed in to customize the components and register
 * event callbacks.
 *
 * ```js
 * service.initializePayment({
 *   methodId: 'digitalriver',
 *   digitalriver: {
 *       containerId: 'digitalriver-component-field',
 *       configuration: {
 *           flow: 'checkout',
 *           showSavePaymentAgreement: false,
 *           showComplianceSection: true,
 *           button: {
 *               type: 'submitOrder',
 *           },
 *           usage: 'unscheduled',
 *           showTermsOfSaleDisclosure: true,
 *           paymentMethodConfiguration: {
 *               classes: {
 *                   // these classes are to control styles on BC side
 *                   base: 'form-input optimizedCheckout-form-input'
 *               },
 *           },
 *       },
 *       // Callback for submitting payment form that gets called when a buyer approves DR payment
 *      onSubmitForm: () => {
 *           // Example function
 *           this.submitOrder(
 *               {
 *                   payment: {methodId: 'digitalriver',}
 *               }
 *           );
 *       },
 *       onError: (error) => {
 *           console.log(error);
 *       },
 *   }
 * });
 * ```
 */
declare interface DigitalRiverPaymentInitializeOptions {
    /**
     * The ID of a container which the Digital River drop in component should be mounted
     */
    containerId: string;
    /**
     * Create a Configuration object for Drop-in that contains both required and optional values.
     * https://docs.digitalriver.com/digital-river-api/payment-integrations-1/drop-in/drop-in-integration-guide#step-5-configure-hydrate
     */
    configuration: OptionsResponse;
    /**
     * Callback for submitting payment form that gets called
     * when buyer pay with DigitalRiver.
     */
    onSubmitForm(): void;
    /**
     * Callback used to hide the standard submit button which is rendered right after the payment providers.
     */
    onRenderButton?(): void;
    /**
     * Callback that gets triggered when an error happens when submitting payment form and contains an object with codes and error messages
     */
    onError?(error: Error): void;
}

declare interface Discount {
    id: string;
    discountedAmount: number;
}

declare interface DisplaySettings {
    hidePriceFromGuests: boolean;
}

/**
 * Embed the checkout form in an iframe.
 *
 * @remarks
 * Once the iframe is embedded, it will automatically resize according to the
 * size of the checkout form. It will also notify the parent window when certain
 * events have occurred. i.e.: when the form is loaded and ready to be used.
 *
 * ```js
 * embedCheckout({
 *     url: 'https://checkout/url',
 *     containerId: 'container-id',
 * });
 * ```
 *
 * @param options - Options for embedding the checkout form.
 * @returns A promise that resolves to an instance of `EmbeddedCheckout`.
 */
export declare function embedCheckout(options: EmbeddedCheckoutOptions): Promise<EmbeddedCheckout>;

declare class EmbeddedCheckout {
    private _iframeCreator;
    private _messageListener;
    private _messagePoster;
    private _loadingIndicator;
    private _requestSender;
    private _storage;
    private _location;
    private _options;
    private _iframe?;
    private _isAttached;
    attach(): Promise<this>;
    detach(): void;
    private _configureStyles;
    private _attemptLogin;
    /**
     * This workaround is required for certain browsers (namely Safari) that
     * prevent session cookies to be set for a third party website unless the
     * user has recently visited such website. Therefore, before we attempt to
     * login or set an active cart in the session, we need to first redirect the
     * user to the domain of Embedded Checkout.
     */
    private _allowCookie;
    private _retryAllowCookie;
}

declare interface EmbeddedCheckoutCompleteEvent {
    type: EmbeddedCheckoutEventType.CheckoutComplete;
}

declare interface EmbeddedCheckoutError {
    message: string;
    type?: string;
    subtype?: string;
}

declare interface EmbeddedCheckoutErrorEvent {
    type: EmbeddedCheckoutEventType.CheckoutError;
    payload: EmbeddedCheckoutError;
}

declare enum EmbeddedCheckoutEventType {
    CheckoutComplete = "CHECKOUT_COMPLETE",
    CheckoutError = "CHECKOUT_ERROR",
    CheckoutLoaded = "CHECKOUT_LOADED",
    FrameError = "FRAME_ERROR",
    FrameLoaded = "FRAME_LOADED",
    SignedOut = "SIGNED_OUT"
}

declare interface EmbeddedCheckoutFrameErrorEvent {
    type: EmbeddedCheckoutEventType.FrameError;
    payload: EmbeddedCheckoutError;
}

declare interface EmbeddedCheckoutFrameLoadedEvent {
    type: EmbeddedCheckoutEventType.FrameLoaded;
    payload?: EmbeddedContentOptions;
}

declare interface EmbeddedCheckoutLoadedEvent {
    type: EmbeddedCheckoutEventType.CheckoutLoaded;
}

declare interface EmbeddedCheckoutMessenger {
    postComplete(): void;
    postError(payload: Error | CustomError): void;
    postFrameError(payload: Error | CustomError): void;
    postFrameLoaded(payload?: EmbeddedContentOptions): void;
    postLoaded(): void;
    postSignedOut(): void;
    receiveStyles(handler: (styles: EmbeddedCheckoutStyles) => void): void;
}

declare interface EmbeddedCheckoutMessengerOptions {
    parentOrigin: string;
    parentWindow?: Window;
}

declare interface EmbeddedCheckoutOptions {
    containerId: string;
    url: string;
    styles?: EmbeddedCheckoutStyles;
    onComplete?(event: EmbeddedCheckoutCompleteEvent): void;
    onError?(event: EmbeddedCheckoutErrorEvent): void;
    onFrameError?(event: EmbeddedCheckoutFrameErrorEvent): void;
    onFrameLoad?(event: EmbeddedCheckoutFrameLoadedEvent): void;
    onLoad?(event: EmbeddedCheckoutLoadedEvent): void;
    onSignOut?(event: EmbeddedCheckoutSignedOutEvent): void;
}

declare interface EmbeddedCheckoutSignedOutEvent {
    type: EmbeddedCheckoutEventType.SignedOut;
}

declare interface EmbeddedCheckoutStyles {
    body?: BodyStyles;
    text?: InlineElementStyles;
    heading?: BlockElementStyles;
    secondaryHeading?: BlockElementStyles;
    link?: LinkStyles;
    secondaryText?: InlineElementStyles;
    button?: ButtonStyles;
    secondaryButton?: ButtonStyles;
    input?: TextInputStyles;
    select?: InputStyles;
    radio?: CheckableInputStyles;
    checkbox?: CheckableInputStyles;
    label?: LabelStyles;
    checklist?: ChecklistStyles;
    discountBanner?: BlockElementStyles;
    loadingBanner?: BlockElementStyles;
    loadingIndicator?: LoadingIndicatorStyles;
    orderSummary?: BlockElementStyles;
    step?: StepStyles;
}

declare interface EmbeddedContentOptions {
    contentId?: string;
}

/**
 * A set of options that are required to pass the customer step of the
 * current checkout flow.
 *
 * Some payment methods have specific suggestion for customer to pass
 * the customer step. For example, Bolt suggests the customer to use
 * their custom checkout with prefilled form values. As a result, you
 * may need to provide additional information, error handler or callback
 * to execution method.
 *
 */
declare interface ExecutePaymentMethodCheckoutOptions extends CustomerRequestOptions {
    checkoutPaymentMethodExecuted?(data?: CheckoutPaymentMethodExecutedOptions): void;
    continueWithCheckoutCallback?(): void;
}

declare interface FlashMessage {
    type: FlashMessageType;
    message: string;
    title?: string;
}

declare type FlashMessageType = 'error' | 'info' | 'warning' | 'success';

declare interface FormField {
    name: string | AddressKey;
    custom: boolean;
    id: string;
    label: string;
    required: boolean;
    default?: string;
    fieldType?: FormFieldFieldType;
    type?: FormFieldType;
    itemtype?: string;
    maxLength?: number;
    secret?: boolean;
    min?: string | number;
    max?: string | number;
    options?: FormFieldOptions;
    requirements?: CustomerPasswordRequirements;
}

declare type FormFieldFieldType = 'checkbox' | 'date' | 'text' | 'dropdown' | 'password' | 'radio' | 'multiline';

declare interface FormFieldItem {
    value: string;
    label: string;
}

declare interface FormFieldOptions {
    helperLabel?: string;
    items?: FormFieldItem[];
    rows?: number;
}

declare interface FormFields {
    customerAccount: FormField[];
    shippingAddress: FormField[];
    billingAddress: FormField[];
}

declare type FormFieldType = 'array' | 'date' | 'integer' | 'string';

declare interface GatewayOrderPayment extends OrderPayment {
    detail: {
        step: string;
        instructions: string;
    };
    mandate?: {
        id: string;
        url?: string;
    };
}

declare interface GiftCertificate {
    balance: number;
    remaining: number;
    used: number;
    code: string;
    purchaseDate: string;
}

declare interface GiftCertificateItem {
    id: string | number;
    name: string;
    theme: string;
    amount: number;
    taxable: boolean;
    sender: {
        name: string;
        email: string;
    };
    recipient: {
        name: string;
        email: string;
    };
    message: string;
}

declare interface GiftCertificateOrderPayment extends OrderPayment {
    detail: {
        code: string;
        remaining: number;
    };
}

declare interface GooglePayButtonInitializeOptions {
    /**
     * The color of the GooglePay button that will be inserted.
     *  black (default): a black button suitable for use on white or light backgrounds.
     *  white: a white button suitable for use on colorful backgrounds.
     */
    buttonColor?: ButtonColor;
    /**
     * The size of the GooglePay button that will be inserted.
     *  long: "Buy with Google Pay" button (default). A translated button label may appear
     *         if a language specified in the viewer's browser matches an available language.
     *  short: Google Pay payment button without the "Buy with" text.
     */
    buttonType?: ButtonType;
}

declare interface GooglePayCustomerInitializeOptions {
    /**
     * This container is used to set an event listener, provide an element ID if you want
     * users to be able to launch the GooglePay wallet modal by clicking on a button.
     * It should be an HTML element.
     */
    container: string;
    /**
     * The color of the GooglePay button that will be inserted.
     *  black (default): a black button suitable for use on white or light backgrounds.
     *  white: a white button suitable for use on colorful backgrounds.
     */
    buttonColor?: ButtonColor;
    /**
     * The size of the GooglePay button that will be inserted.
     *  long: "Buy with Google Pay" button (default). A translated button label may appear
     *         if a language specified in the viewer's browser matches an available language.
     *  short: Google Pay payment button without the "Buy with" text.
     */
    buttonType?: ButtonType;
}

/**
 * A set of options that are required to initialize the GooglePay payment method
 *
 * If the customer chooses to pay with GooglePay, they will be asked to
 * enter their payment details via a modal. You can hook into events emitted by
 * the modal by providing the callbacks listed below.
 *
 * ```html
 * <!-- This is where the GooglePay button will be inserted -->
 * <div id="wallet-button"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     // Using GooglePay provided by Braintree as an example
 *     methodId: 'googlepaybraintree',
 *     googlepaybraintree: {
 *         walletButton: 'wallet-button'
 *     },
 * });
 * ```
 *
 * Additional event callbacks can be registered.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'googlepaybraintree',
 *     googlepaybraintree: {
 *         walletButton: 'wallet-button',
 *         onError(error) {
 *             console.log(error);
 *         },
 *         onPaymentSelect() {
 *             console.log('Selected');
 *         },
 *     },
 * });
 * ```
 */
declare interface GooglePayPaymentInitializeOptions {
    /**
     * This walletButton is used to set an event listener, provide an element ID if you want
     * users to be able to launch the GooglePay wallet modal by clicking on a button.
     * It should be an HTML element.
     */
    walletButton?: string;
    /**
     * A callback that gets called when GooglePay fails to initialize or
     * selects a payment option.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: Error): void;
    /**
     * A callback that gets called when the customer selects a payment option.
     */
    onPaymentSelect?(): void;
}

declare type GuestCredentials = Partial<Subscriptions> & {
    id?: string;
    email: string;
};

declare interface HostedCardFieldOptions {
    accessibilityLabel?: string;
    containerId: string;
    placeholder?: string;
}

declare interface HostedCardFieldOptionsMap {
    [HostedFieldType.CardCode]?: HostedCardFieldOptions;
    [HostedFieldType.CardExpiry]: HostedCardFieldOptions;
    [HostedFieldType.CardName]: HostedCardFieldOptions;
    [HostedFieldType.CardNumber]: HostedCardFieldOptions;
}

declare type HostedCreditCardInstrument = Omit_2<CreditCardInstrument, 'ccExpiry' | 'ccName' | 'ccNumber' | 'ccCvv'>;

declare type HostedFieldBlurEventData = HostedInputBlurEvent['payload'];

declare type HostedFieldCardTypeChangeEventData = HostedInputCardTypeChangeEvent['payload'];

declare type HostedFieldEnterEventData = HostedInputEnterEvent['payload'];

declare type HostedFieldFocusEventData = HostedInputFocusEvent['payload'];

declare type HostedFieldOptionsMap = HostedCardFieldOptionsMap | HostedStoredCardFieldOptionsMap;

declare type HostedFieldStyles = HostedInputStyles;

declare interface HostedFieldStylesMap {
    default?: HostedFieldStyles;
    error?: HostedFieldStyles;
    focus?: HostedFieldStyles;
}

declare enum HostedFieldType {
    CardCode = "cardCode",
    CardCodeVerification = "cardCodeVerification",
    CardExpiry = "cardExpiry",
    CardName = "cardName",
    CardNumber = "cardNumber",
    CardNumberVerification = "cardNumberVerification"
}

declare type HostedFieldValidateEventData = HostedInputValidateEvent['payload'];

declare interface HostedFormOptions {
    fields: HostedFieldOptionsMap;
    styles?: HostedFieldStylesMap;
    onBlur?(data: HostedFieldBlurEventData): void;
    onCardTypeChange?(data: HostedFieldCardTypeChangeEventData): void;
    onEnter?(data: HostedFieldEnterEventData): void;
    onFocus?(data: HostedFieldFocusEventData): void;
    onValidate?(data: HostedFieldValidateEventData): void;
}

declare interface HostedInputBlurEvent {
    type: HostedInputEventType.Blurred;
    payload: {
        fieldType: HostedFieldType;
    };
}

declare interface HostedInputCardTypeChangeEvent {
    type: HostedInputEventType.CardTypeChanged;
    payload: {
        cardType?: string;
    };
}

declare interface HostedInputEnterEvent {
    type: HostedInputEventType.Entered;
    payload: {
        fieldType: HostedFieldType;
    };
}

declare enum HostedInputEventType {
    AttachSucceeded = "HOSTED_INPUT:ATTACH_SUCCEEDED",
    AttachFailed = "HOSTED_INPUT:ATTACH_FAILED",
    BinChanged = "HOSTED_INPUT:BIN_CHANGED",
    Blurred = "HOSTED_INPUT:BLURRED",
    Changed = "HOSTED_INPUT:CHANGED",
    CardTypeChanged = "HOSTED_INPUT:CARD_TYPE_CHANGED",
    Entered = "HOSTED_INPUT:ENTERED",
    Focused = "HOSTED_INPUT:FOCUSED",
    SubmitSucceeded = "HOSTED_INPUT:SUBMIT_SUCCEEDED",
    SubmitFailed = "HOSTED_INPUT:SUBMIT_FAILED",
    Validated = "HOSTED_INPUT:VALIDATED"
}

declare interface HostedInputFocusEvent {
    type: HostedInputEventType.Focused;
    payload: {
        fieldType: HostedFieldType;
    };
}

declare type HostedInputStyles = Partial<Pick<CSSStyleDeclaration, 'color' | 'fontFamily' | 'fontSize' | 'fontWeight'>>;

declare interface HostedInputValidateErrorData {
    fieldType: string;
    message: string;
    type: string;
}

declare interface HostedInputValidateErrorDataMap {
    [HostedFieldType.CardCode]?: HostedInputValidateErrorData[];
    [HostedFieldType.CardCodeVerification]?: HostedInputValidateErrorData[];
    [HostedFieldType.CardExpiry]?: HostedInputValidateErrorData[];
    [HostedFieldType.CardName]?: HostedInputValidateErrorData[];
    [HostedFieldType.CardNumber]?: HostedInputValidateErrorData[];
    [HostedFieldType.CardNumberVerification]?: HostedInputValidateErrorData[];
}

declare interface HostedInputValidateEvent {
    type: HostedInputEventType.Validated;
    payload: HostedInputValidateResults;
}

declare interface HostedInputValidateResults {
    errors: HostedInputValidateErrorDataMap;
    isValid: boolean;
}

declare interface HostedInstrument {
    shouldSaveInstrument?: boolean;
    shouldSetAsDefaultInstrument?: boolean;
}

declare interface HostedStoredCardFieldOptions extends HostedCardFieldOptions {
    instrumentId: string;
}

declare interface HostedStoredCardFieldOptionsMap {
    [HostedFieldType.CardCodeVerification]?: HostedStoredCardFieldOptions;
    [HostedFieldType.CardNumberVerification]?: HostedStoredCardFieldOptions;
}

declare type HostedVaultedInstrument = Omit_2<VaultedInstrument, 'ccNumber' | 'ccCvv'>;

declare interface IbanElementOptions extends BaseElementOptions_2 {
    /**
     * Specify the list of countries or country-groups whose IBANs you want to allow.
     * Must be ['SEPA'].
     */
    supportedCountries?: string[];
    /**
     * Customize the country and format of the placeholder IBAN. Default is DE.
     */
    placeholderCountry?: string;
    /**
     * Appearance of the icon in the Element.
     */
    iconStyle?: IconStyle;
}

declare enum IconStyle {
    Solid = "solid",
    Default = "default"
}

declare interface IdealElementOptions extends BaseElementOptions_2 {
    value?: string;
    /**
     * Hides the icon in the Element. Default is false.
     */
    hideIcon?: boolean;
}

declare interface IndividualCardElementOptions {
    cardCvcElementOptions: CardCvcElementOptions;
    cardExpiryElementOptions: CardExpiryElementOptions;
    cardNumberElementOptions: CardNumberElementOptions;
    zipCodeElementOptions?: ZipCodeElementOptions;
}

declare interface InitializationStrategy extends Partial<UnknownObject> {
    type: string;
}

declare interface InlineElementStyles {
    color?: string;
    fontFamily?: string;
    fontWeight?: string;
    letterSpacing?: string;
    lineHeight?: string;
}

declare interface InputDetail {
    /**
     * Configuration parameters for the required input.
     */
    configuration?: object;
    /**
     * Input details can also be provided recursively.
     */
    details?: SubInputDetail[];
    /**
     * In case of a select, the URL from which to query the items.
     */
    itemSearchUrl?: string;
    /**
     * In case of a select, the items to choose from.
     */
    items?: Item_2[];
    /**
     * The value to provide in the result.
     */
    key?: string;
    /**
     * True if this input value is optional.
     */
    optional?: boolean;
    /**
     * The type of the required input.
     */
    type?: string;
    /**
     * The value can be pre-filled, if available.
     */
    value?: string;
}

declare interface InputDetail_2 {
    /**
     * Configuration parameters for the required input.
     */
    configuration?: object;
    /**
     * Input details can also be provided recursively.
     */
    details?: SubInputDetail_2[];
    /**
     * In case of a select, the URL from which to query the items.
     */
    itemSearchUrl?: string;
    /**
     * In case of a select, the items to choose from.
     */
    items?: Item_3[];
    /**
     * The value to provide in the result.
     */
    key?: string;
    /**
     * True if this input value is optional.
     */
    optional?: boolean;
    /**
     * The type of the required input.
     */
    type?: string;
    /**
     * The value can be pre-filled, if available.
     */
    value?: string;
}

declare interface InputStyles extends BlockElementStyles {
    active?: BlockElementStyles;
    error?: InputStyles;
    focus?: BlockElementStyles;
    hover?: BlockElementStyles;
    disabled?: BlockElementStyles;
}

declare type Instrument = CardInstrument;

declare interface Item {
    variantId: number;
    quantity: number;
}

declare interface Item_2 {
    /**
     * The value to provide in the result.
     */
    id?: string;
    /**
     * The display name.
     */
    name?: string;
}

declare interface Item_3 {
    /**
     * The value to provide in the result.
     */
    id?: string;
    /**
     * The display name.
     */
    name?: string;
}

declare interface KlarnaLoadResponse {
    show_form: boolean;
    error?: {
        invalid_fields: string[];
    };
}

declare interface KlarnaLoadResponse_2 {
    show_form: boolean;
    error?: {
        invalid_fields: string[];
    };
}

/**
 * A set of options that are required to initialize the Klarna payment method.
 *
 * When Klarna is initialized, a widget will be inserted into the DOM. The
 * widget has a list of payment options for the customer to choose from.
 *
 * ```html
 * <!-- This is where the widget will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'klarna',
 *     klarna: {
 *         container: 'container'
 *     },
 * });
 * ```
 *
 * An additional event callback can be registered.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'klarnav2',
 *     klarnav2: {
 *         container: 'container',
 *         onLoad(response) {
 *             console.log(response);
 *         },
 *     },
 * });
 * ```
 */
declare interface KlarnaPaymentInitializeOptions {
    /**
     * The ID of a container which the payment widget should insert into.
     */
    container: string;
    /**
     * A callback that gets called when the widget is loaded and ready to be
     * interacted with.
     *
     * @param response - The result of the initialization. It indicates whether
     * or not the widget is loaded successfully.
     */
    onLoad?(response: KlarnaLoadResponse): void;
}

/**
 * A set of options that are required to initialize the KlarnaV2 payment method.
 *
 * When KlarnaV2 is initialized, a list of payment options will be displayed for the customer to choose from.
 * Each one with its own widget.
 *
 * ```html
 * <!-- This is where the widget will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'klarnav2',
 *     klarnav2: {
 *         container: 'container'
 *     },
 * });
 * ```
 *
 * An additional event callback can be registered.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'klarnav2',
 *     klarnav2: {
 *         container: 'container',
 *         onLoad(response) {
 *             console.log(response);
 *         },
 *     },
 * });
 * ```
 */
declare interface KlarnaV2PaymentInitializeOptions {
    /**
     * The ID of a container which the payment widget should insert into.
     */
    container: string;
    /**
     * A callback that gets called when the widget is loaded and ready to be
     * interacted with.
     *
     * @param response - The result of the initialization. It indicates whether
     * or not the widget is loaded successfully.
     */
    onLoad?(response: KlarnaLoadResponse_2): void;
}

declare interface LabelStyles extends InlineElementStyles {
    error?: InlineElementStyles;
}

declare interface LanguageConfig {
    defaultTranslations: Translations;
    defaultLocale?: string;
    fallbackTranslations?: Translations;
    fallbackLocale?: string;
    locale: string;
    locales: Locales;
    translations: Translations;
}

/**
 * Responsible for getting language strings.
 *
 * This object can be used to retrieve language strings that are most
 * appropriate for a given locale.
 *
 * The language strings provided to the object should follow [ICU
 * MessageFormat](http://userguide.icu-project.org/formatparse/messages) syntax.
 */
declare class LanguageService {
    private _logger;
    private _locale;
    private _locales;
    private _translations;
    private _formatters;
    /**
     * Remaps a set of language strings with a different set of keys.
     *
     * ```js
     * service.mapKeys({
     *     'new_key': 'existing_key',
     * });
     *
     * console.log(service.translate('new_key'));
     * ```
     *
     * @param maps - The set of language strings.
     */
    mapKeys(maps: {
        [key: string]: string;
    }): void;
    /**
     * Gets the preferred locale of the current customer.
     *
     * @returns The preferred locale code.
     */
    getLocale(): string;
    /**
     * Gets a language string by a key.
     *
     * ```js
     * service.translate('language_key');
     * ```
     *
     * If the language string contains a placeholder, you can replace it by
     * providing a second argument.
     *
     * ```js
     * service.translate('language_key', { placeholder: 'Hello' });
     * ```
     *
     * @param key - The language key.
     * @param data - Data for replacing placeholders in the language string.
     * @returns The translated language string.
     */
    translate(key: string, data?: TranslationData): string;
    private _transformConfig;
    private _flattenObject;
    private _transformData;
    private _hasTranslations;
}

declare interface LineItem {
    id: string | number;
    variantId: number;
    productId: number;
    sku: string;
    name: string;
    url: string;
    quantity: number;
    brand: string;
    categoryNames?: string[];
    categories?: LineItemCategory[][];
    isTaxable: boolean;
    imageUrl: string;
    discounts: Array<{
        name: string;
        discountedAmount: number;
    }>;
    discountAmount: number;
    couponAmount: number;
    listPrice: number;
    salePrice: number;
    comparisonPrice: number;
    extendedListPrice: number;
    extendedSalePrice: number;
    extendedComparisonPrice: number;
    socialMedia?: LineItemSocialData[];
    options?: LineItemOption[];
    addedByPromotion: boolean;
    parentId?: string | null;
}

declare interface LineItem_2 {
    productId: number;
    quantity: number;
    optionSelections?: {
        optionId: number;
        optionValue: number | string;
    };
}

declare interface LineItemCategory {
    name: string;
}

declare interface LineItemMap {
    physicalItems: PhysicalItem[];
    digitalItems: DigitalItem[];
    customItems?: CustomItem[];
    giftCertificates: GiftCertificateItem[];
}

declare interface LineItemOption {
    name: string;
    nameId: number;
    value: string;
    valueId: number | null;
}

declare interface LineItemSocialData {
    channel: string;
    code: string;
    text: string;
    link: string;
}

declare interface LinkStyles extends InlineElementStyles {
    active?: InlineElementStyles;
    focus?: InlineElementStyles;
    hover?: InlineElementStyles;
}

declare interface LoadingIndicatorStyles {
    size?: number;
    color?: string;
    backgroundColor?: string;
}

declare interface Locales {
    [key: string]: string;
}

declare interface MasterpassCustomerInitializeOptions {
    /**
     * The ID of a container which the checkout button should be inserted into.
     */
    container: string;
}

/**
 * A set of options that are required to initialize the Masterpass payment method.
 *
 * ```html
 * <!-- This is where the Masterpass button will be inserted -->
 * <div id="wallet-button"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'masterpass',
 *     masterpass: {
 *         walletButton: 'wallet-button'
 *     },
 * });
 * ```
 */
declare interface MasterpassPaymentInitializeOptions {
    /**
     * This walletButton is used to set an event listener, provide an element ID if you want
     * users to be able to launch the ChasePay wallet modal by clicking on a button.
     * It should be an HTML element.
     */
    walletButton?: string;
}

/**
 * A set of options that are required to initialize the Mollie payment method.
 *
 * Once Mollie payment is initialized, credit card form fields are provided by the
 * payment provider as IFrames, these will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 *
 * ```js
 * service.initializePayment({
 *      methodId: 'mollie',
 *      mollie: {
 *          containerId: 'container',
 *          cardNumberId: '',
 *          cardHolderId: '',
 *          cardCvcId: '',
 *          cardExpiryId: '',
 *          styles : {
 *              base: {
 *                  color: '#fff'
 *              }
 *          }
 *      }
 * });
 * ```
 */
declare interface MolliePaymentInitializeOptions {
    /**
     * ContainerId is use in Mollie for determined either its showing or not the
     * container, because when Mollie has Vaulted Instruments it gets hide,
     * and shows an error because can't mount Provider Components
     */
    containerId?: string;
    /**
     * The location to insert Mollie Component
     */
    cardNumberId: string;
    /**
     * The location to insert Mollie Component
     */
    cardHolderId: string;
    /**
     * The location to insert Mollie Component
     */
    cardCvcId: string;
    /**
     * The location to insert Mollie Component
     */
    cardExpiryId: string;
    /**
     * A set of styles required for the mollie components
     */
    styles: object;
    /**
     * Hosted Form Validation Options
     */
    form?: HostedFormOptions;
    unsupportedMethodMessage?: string;
    disableButton(disabled: boolean): void;
}

/**
 * A set of options that are required to initialize the Moneris payment method.
 *
 * Once Moneris payment is initialized, a credit card payment form is provided by the
 * payment provider as an IFrame, it will be inserted into the current page. These
 * options provide a location and styling for the payment form.
 *
 * ```js
 * service.initializePayment({
 *      methodId: 'moneris',
 *      moneris: {
 *          containerId: 'container',
 *          style : {
 *              cssBody: 'background:white;';
 *              cssTextbox: 'border-width:2px;';
 *              cssTextboxCardNumber: 'width:140px;';
 *              cssTextboxExpiryDate: 'width:40px;';
 *              cssTextboxCVV: 'width:40px';
 *          }
 *      }
 * });
 * ```
 */
declare interface MonerisPaymentInitializeOptions {
    /**
     * The ID of a container where the Moneris iframe component should be mounted
     */
    containerId: string;
    /**
     * The styling props to apply to the iframe component
     */
    style?: MonerisStylingProps;
    /**
     * Hosted Form Validation Options
     */
    form?: HostedFormOptions;
}

/**
 * A set of stringified CSS to apply to Moneris' IFrame fields.
 * CSS attributes should be converted to string.
 * Please note that ClassNames are not supported.
 *
 * IE:
 * ```js
 * {
 *      cssBody: 'background:white;';
 *      cssTextbox: 'border-width:2px;';
 *      cssTextboxCardNumber: 'width:140px;';
 *      cssTextboxExpiryDate: 'width:40px;';
 *      cssTextboxCVV: 'width:40px;';
 * }
 * ```
 *
 * When using several attributes use semicolon to separate each one.
 * IE: 'background:white;width:40px;'
 */
declare interface MonerisStylingProps {
    /**
     * Stringified CSS to apply to the body of the IFrame.
     */
    cssBody?: string;
    /**
     * Stringified CSS to apply to each of input fields.
     */
    cssTextbox?: string;
    /**
     * Stringified CSS to apply to the card's number field.
     */
    cssTextboxCardNumber?: string;
    /**
     * Stringified CSS to apply to the card's expiry field.
     */
    cssTextboxExpiryDate?: string;
    /**
     * Stringified CSS to apply to the card's CVV field.
     */
    cssTextboxCVV?: string;
    /**
     * Stringified CSS to apply to input labels
     */
    cssInputLabel?: string;
}

declare interface NonceGenerationError {
    type: string;
    message: string;
    field: string;
}

declare interface NonceInstrument {
    nonce: string;
    shouldSaveInstrument?: boolean;
    shouldSetAsDefaultInstrument?: boolean;
    deviceSessionId?: string;
}

declare type Omit_2<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

declare type Omit_3<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

declare interface Option_2 {
    pickupMethod: PickupMethod;
    itemQuantities: Item;
}

/**
 * When creating your Drop-in instance, you can specify options to trigger different features or functionality.
 * https://docs.digitalriver.com/digital-river-api/payment-integrations-1/drop-in/drop-in-integration-guide#drop-in-options
 */
declare interface OptionsResponse {
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

/**
 * A set of options that are required to initialize the payment step of
 * checkout in order to support Opy.
 *
 * When Opy is initialized, a widget will be inserted into the DOM. The
 * widget will open a modal that will show more information about Opy when
 * clicking it.
 *
 * @example
 *
 * ```html
 * <!-- This is where the Opy widget will be inserted -->
 * <div id="opy-widget"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'opy',
 *     opy: {
 *         containerId: 'opy-widget',
 *     },
 * });
 * ```
 */
declare interface OpyPaymentInitializeOptions {
    /**
     * The ID of a container which the payment widget should insert into.
     */
    containerId: string;
}

declare interface Order {
    baseAmount: number;
    billingAddress: BillingAddress;
    cartId: string;
    coupons: Coupon[];
    consignments: OrderConsignment;
    currency: Currency;
    customerCanBeCreated: boolean;
    customerId: number;
    customerMessage: string;
    discountAmount: number;
    handlingCostTotal: number;
    hasDigitalItems: boolean;
    isComplete: boolean;
    isDownloadable: boolean;
    isTaxIncluded: boolean;
    lineItems: LineItemMap;
    orderAmount: number;
    orderAmountAsInteger: number;
    orderId: number;
    payments?: OrderPayments;
    giftWrappingCostTotal: number;
    shippingCostTotal: number;
    shippingCostBeforeDiscount: number;
    status: string;
    taxes: Tax[];
    taxTotal: number;
    channelId: number;
}

declare interface OrderConsignment {
    shipping: OrderShippingConsignment[];
}

declare interface OrderPayment {
    providerId: string;
    gatewayId?: string;
    methodId?: string;
    paymentId?: string;
    description: string;
    amount: number;
}

declare type OrderPaymentInstrument = (CreditCardInstrument | HostedInstrument | HostedCreditCardInstrument | HostedVaultedInstrument | NonceInstrument | VaultedInstrument | CreditCardInstrument & WithDocumentInstrument | CreditCardInstrument & WithCheckoutcomFawryInstrument | CreditCardInstrument & WithCheckoutcomSEPAInstrument | CreditCardInstrument & WithCheckoutcomiDealInstrument | HostedInstrument & WithMollieIssuerInstrument | WithAccountCreation);

/**
 * An object that contains the payment information required for submitting an
 * order.
 */
declare interface OrderPaymentRequestBody {
    /**
     * The identifier of the payment method that is chosen for the order.
     */
    methodId: string;
    /**
     * The identifier of the payment provider that is chosen for the order.
     */
    gatewayId?: string;
    /**
     * An object that contains the details of a credit card, vaulted payment
     * instrument or nonce instrument.
     */
    paymentData?: OrderPaymentInstrument;
}

declare type OrderPayments = Array<GatewayOrderPayment | GiftCertificateOrderPayment>;

/**
 * An object that contains the information required for submitting an order.
 */
declare interface OrderRequestBody {
    /**
     * An object that contains the payment details of a customer. In some cases,
     * you can omit this object if the order does not require further payment.
     * For example, the customer is able to use their store credit to pay for
     * the entire order. Or they have already submitted their payment details
     * using PayPal.
     */
    payment?: OrderPaymentRequestBody;
    /**
     * If true, apply the store credit of the customer to the order. It only
     * works if the customer has previously signed in.
     */
    useStoreCredit?: boolean;
}

declare interface OrderShippingConsignment {
    lineItems: Array<{
        id: number;
    }>;
    shippingAddressId: number;
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    stateOrProvince: string;
    postalCode: string;
    country: string;
    countryCode: string;
    email: string;
    phone: string;
    itemsTotal: number;
    itemsShipped: number;
    shippingMethod: string;
    baseCost: number;
    costExTax: number;
    costIncTax: number;
    costTax: number;
    costTaxClassId: number;
    baseHandlingCost: number;
    handlingCostExTax: number;
    handlingCostIncTax: number;
    handlingCostTax: number;
    handlingCostTaxClassId: number;
    shippingZoneId: number;
    shippingZoneName: string;
    customFields: Array<{
        name: string;
        value: string | null;
    }>;
}

declare interface PasswordRequirements {
    alpha: string;
    numeric: string;
    minlength: number;
    error: string;
}

declare type PaymentInitializeOptions = BasePaymentInitializeOptions & WithAdyenV2PaymentInitializeOptions & WithAdyenV3PaymentInitializeOptions & WithApplePayPaymentInitializeOptions;

declare type PaymentInstrument = CardInstrument | AccountInstrument;

declare interface PaymentMethod<T = any> {
    id: string;
    config: PaymentMethodConfig;
    method: string;
    supportedCards: string[];
    type: string;
    clientToken?: string;
    gateway?: string;
    logoUrl?: string;
    nonce?: string;
    initializationData?: T;
    returnUrl?: string;
    initializationStrategy?: InitializationStrategy;
}

declare interface PaymentMethodConfig {
    cardCode?: boolean;
    displayName?: string;
    enablePaypal?: boolean;
    hasDefaultStoredInstrument?: boolean;
    helpText?: string;
    is3dsEnabled?: boolean;
    isHostedFormEnabled?: boolean;
    isVaultingCvvEnabled?: boolean;
    isVaultingEnabled?: boolean;
    isVisaCheckoutEnabled?: boolean;
    logo?: string;
    merchantId?: string;
    redirectUrl?: string;
    requireCustomerCode?: boolean;
    returnUrl?: string;
    testMode?: boolean;
}

/**
 * The set of options for configuring any requests related to the payment step of
 * the current checkout flow.
 */
declare interface PaymentRequestOptions extends RequestOptions {
    /**
     * The identifier of the payment method.
     */
    methodId: string;
    /**
     * The identifier of the payment provider providing the payment method. This
     * option is only required if the provider offers multiple payment options.
     * i.e.: Adyen and Klarna.
     */
    gatewayId?: string;
}

declare interface PaymentSettings {
    bigpayBaseUrl: string;
    clientSidePaymentProviders: string[];
}

declare interface PaypalButtonInitializeOptions {
    /**
     * The Client ID of the Paypal App
     */
    clientId: string;
    /**
     * Whether or not to show a credit button.
     */
    allowCredit?: boolean;
    /**
     * A set of styling options for the checkout button.
     */
    style?: Pick<PaypalButtonStyleOptions, 'layout' | 'size' | 'color' | 'label' | 'shape' | 'tagline' | 'fundingicons'>;
    /**
     * A callback that gets called if unable to authorize and tokenize payment.
     *
     * @param error - The error object describing the failure.
     */
    onAuthorizeError?(error: StandardError): void;
    /**
     * A callback that gets called if unable to submit payment.
     *
     * @param error - The error object describing the failure.
     */
    onPaymentError?(error: StandardError): void;
}

declare enum PaypalButtonStyleColorOption {
    GOLD = "gold",
    BLUE = "blue",
    SIlVER = "silver",
    BLACK = "black"
}

declare enum PaypalButtonStyleLabelOption {
    CHECKOUT = "checkout",
    PAY = "pay",
    BUYNOW = "buynow",
    PAYPAL = "paypal",
    CREDIT = "credit"
}

declare enum PaypalButtonStyleLayoutOption {
    HORIZONTAL = "horizontal",
    VERTICAL = "vertical"
}

declare interface PaypalButtonStyleOptions {
    layout?: PaypalButtonStyleLayoutOption;
    size?: PaypalButtonStyleSizeOption;
    color?: PaypalButtonStyleColorOption;
    label?: PaypalButtonStyleLabelOption;
    shape?: PaypalButtonStyleShapeOption;
    tagline?: boolean;
    fundingicons?: boolean;
    height?: number;
}

declare interface PaypalButtonStyleOptions_2 {
    layout?: StyleButtonLayout;
    color?: StyleButtonColor;
    shape?: StyleButtonShape;
    height?: number;
    label?: StyleButtonLabel;
    tagline?: boolean;
    custom?: {
        label?: string;
        css?: {
            background?: string;
            color?: string;
            width?: string;
        };
    };
}

declare enum PaypalButtonStyleShapeOption {
    PILL = "pill",
    RECT = "rect"
}

declare enum PaypalButtonStyleSizeOption {
    SMALL = "small",
    MEDIUM = "medium",
    LARGE = "large",
    RESPONSIVE = "responsive"
}

declare interface PaypalCommerceAlternativeMethodsButtonOptions {
    /**
     * Alternative payment method id what used for initialization PayPal button as funding source.
     */
    apm: string;
    /**
     * Flag which helps to detect that the strategy initializes on Checkout page.
     */
    initializesOnCheckoutPage?: boolean;
    /**
     * A set of styling options for the checkout button.
     */
    style?: PaypalButtonStyleOptions_2;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
}

declare interface PaypalCommerceButtonInitializeOptions {
    /**
     * A set of styling options for the checkout button.
     */
    style?: PaypalButtonStyleOptions_2;
    /**
     * Flag which helps to detect that the strategy initializes on Checkout page.
     */
    initializesOnCheckoutPage?: boolean;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
}

declare interface PaypalCommerceCreditButtonInitializeOptions {
    /**
     * Flag which helps to detect that the strategy initializes on Checkout page
     */
    initializesOnCheckoutPage?: boolean;
    /**
     * The ID of a container which the messaging should be inserted.
     */
    messagingContainerId?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: PaypalButtonStyleOptions_2;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
}

/**
 * A set of options that are required to initialize the PayPal Commerce payment
 * method for presenting its credit card form.
 *
 * ```html
 * <!-- These containers are where the hosted (iframed) credit card fields will be inserted -->
 * <div id="card-number"></div>
 * <div id="card-name"></div>
 * <div id="card-expiry"></div>
 * <div id="card-code"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalcommerce',
 *     paypalcommerce: {
 *         form: {
 *             fields: {
 *                 cardNumber: { containerId: 'card-number' },
 *                 cardName: { containerId: 'card-name' },
 *                 cardExpiry: { containerId: 'card-expiry' },
 *                 cardCode: { containerId: 'card-code' },
 *             },
 *         },
 *     },
 * });
 * ```
 *
 * Additional options can be passed in to customize the fields and register
 * event callbacks.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalcommerce',
 *     creditCard: {
 *         form: {
 *             fields: {
 *                 cardNumber: { containerId: 'card-number', placeholder: 'Number of card' },
 *                 cardName: { containerId: 'card-name', placeholder: 'Name of card' },
 *                 cardExpiry: { containerId: 'card-expiry', placeholder: 'Expiry of card' },
 *                 cardCode: { containerId: 'card-code', placeholder: 'Code of card' },
 *             },
 *             styles: {
 *                 default: {
 *                     color: '#000',
 *                 },
 *                 error: {
 *                     color: '#f00',
 *                 },
 *                 focus: {
 *                     color: '#0f0',
 *                 },
 *             },
 *             onBlur({ fieldType }) {
 *                 console.log(fieldType);
 *             },
 *             onFocus({ fieldType }) {
 *                 console.log(fieldType);
 *             },
 *             onEnter({ fieldType }) {
 *                 console.log(fieldType);
 *             },
 *             onCardTypeChange({ cardType }) {
 *                 console.log(cardType);
 *             },
 *             onValidate({ errors, isValid }) {
 *                 console.log(errors);
 *                 console.log(isValid);
 *             },
 *         },
 *     },
 * });
 * ```
 */
declare interface PaypalCommerceCreditCardPaymentInitializeOptions {
    /**
     * The form is data for Credit Card Form
     */
    form: PaypalCommerceFormOptions;
}

declare type PaypalCommerceFormFieldBlurEventData = PaypalCommerceFormFieldKeyboardEventData;

declare interface PaypalCommerceFormFieldCardTypeChangeEventData {
    cardType?: string;
}

declare type PaypalCommerceFormFieldEnterEventData = PaypalCommerceFormFieldKeyboardEventData;

declare type PaypalCommerceFormFieldFocusEventData = PaypalCommerceFormFieldKeyboardEventData;

declare interface PaypalCommerceFormFieldKeyboardEventData {
    fieldType: string;
}

declare interface PaypalCommerceFormFieldOptions {
    containerId: string;
    placeholder?: string;
}

declare interface PaypalCommerceFormFieldsMap {
    [PaypalCommerceFormFieldType.CardCode]?: PaypalCommerceFormFieldOptions;
    [PaypalCommerceFormFieldType.CardExpiry]: PaypalCommerceFormFieldOptions;
    [PaypalCommerceFormFieldType.CardName]: PaypalCommerceFormFieldOptions;
    [PaypalCommerceFormFieldType.CardNumber]: PaypalCommerceFormFieldOptions;
}

declare type PaypalCommerceFormFieldStyles = Partial<Pick<CSSStyleDeclaration, 'color' | 'fontFamily' | 'fontSize' | 'fontWeight'>>;

declare interface PaypalCommerceFormFieldStylesMap {
    default?: PaypalCommerceFormFieldStyles;
    error?: PaypalCommerceFormFieldStyles;
    focus?: PaypalCommerceFormFieldStyles;
}

declare enum PaypalCommerceFormFieldType {
    CardCode = "cardCode",
    CardCodeVerification = "cardCodeVerification",
    CardExpiry = "cardExpiry",
    CardName = "cardName",
    CardNumber = "cardNumber",
    CardNumberVerification = "cardNumberVerification"
}

declare interface PaypalCommerceFormFieldValidateErrorData {
    fieldType: string;
    message: string;
    type: string;
}

declare interface PaypalCommerceFormFieldValidateEventData {
    errors: {
        [PaypalCommerceFormFieldType.CardCode]?: PaypalCommerceFormFieldValidateErrorData[];
        [PaypalCommerceFormFieldType.CardExpiry]?: PaypalCommerceFormFieldValidateErrorData[];
        [PaypalCommerceFormFieldType.CardName]?: PaypalCommerceFormFieldValidateErrorData[];
        [PaypalCommerceFormFieldType.CardNumber]?: PaypalCommerceFormFieldValidateErrorData[];
        [PaypalCommerceFormFieldType.CardCodeVerification]?: PaypalCommerceFormFieldValidateErrorData[];
        [PaypalCommerceFormFieldType.CardNumberVerification]?: PaypalCommerceFormFieldValidateErrorData[];
    };
    isValid: boolean;
}

declare interface PaypalCommerceFormOptions {
    /**
     * Containers for fields can be to present in one set of values
     *
     * ```js
     * { cardNumber: { containerId: 'card-number' },
     *   cardName: { containerId: 'card-name' },
     *   cardExpiry: { containerId: 'card-expiry' },
     *   cardCode: { containerId: 'card-code' }, }
     * ```
     *
     *   Or in another set of values.
     *
     * ```js
     * { cardCodeVerification: { containerId: 'card-number' },
     *   cardNumberVerification: { containerId: 'card-name' }, }
     * ```
     */
    fields: PaypalCommerceFormFieldsMap | PaypalCommerceStoredCardFieldsMap;
    /**
     * Styles for inputs. Change the width, height and other styling.
     *
     * ```js
     *  default: { color: '#000' },
     *  error: { color: '#f00' },
     *  focus: { color: '#0f0' }
     * ```
     */
    styles?: PaypalCommerceFormFieldStylesMap;
    /**
     * A callback that gets called when a field loses focus.
     */
    onBlur?(data: PaypalCommerceFormFieldBlurEventData): void;
    /**
     * A callback that gets called when activity within
     * the number field has changed such that the possible
     * card type has changed.
     */
    onCardTypeChange?(data: PaypalCommerceFormFieldCardTypeChangeEventData): void;
    /**
     * A callback that gets called when a field gains focus.
     */
    onFocus?(data: PaypalCommerceFormFieldFocusEventData): void;
    /**
     * A callback that gets called when the validity of a field has changed.
     */
    onValidate?(data: PaypalCommerceFormFieldValidateEventData): void;
    /**
     * A callback that gets called when the user requests submission
     * of an input field, by pressing the Enter or Return key
     * on their keyboard, or mobile equivalent.
     */
    onEnter?(data: PaypalCommerceFormFieldEnterEventData): void;
}

/**
 * A set of options that are required to initialize the PayPal Commerce payment
 * method could be used for PayPal Smart Payment Buttons or PayPal Credit Card methods.
 */
declare type PaypalCommerceInitializeOptions = PaypalCommercePaymentInitializeOptions | PaypalCommerceCreditCardPaymentInitializeOptions;

declare interface PaypalCommerceInlineCheckoutButtonInitializeOptions {
    /**
     * A class name used to add special class for container where the button will be generated in
     * Default: 'PaypalCommerceInlineButton'
     */
    buttonContainerClassName?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: PaypalButtonStyleOptions_2;
    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete(): void;
    /**
     * A callback that gets called on any error
     */
    onError?(): void;
}

/**
 * A set of options that are required to initialize the PayPal Commerce payment
 * method for presenting its PayPal button.
 *
 * Please note that the minimum version of checkout-sdk is 1.100
 *
 * Also, PayPal (also known as PayPal Commerce Platform) requires specific options to initialize the PayPal Smart Payment Button on checkout page that substitutes a standard submit button
 * ```html
 * <!-- This is where the PayPal button will be inserted -->
 * <div id="container"></div>
 * <!-- This is where the PayPal alternative payment methods fields will be inserted.  -->
 * <div id="apm-fields-container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalcommerce',
 *     paypalcommerce: {
 *         container: '#container',
 *         apmFieldsContainer: '#apm-fields-container',
 *         apmFieldsStyles: {
 *             base: {
 *                   backgroundColor: 'transparent',
 *               },
 *               input: {
 *                   backgroundColor: 'white',
 *                   fontSize: '1rem',
 *                   color: '#333',
 *                   borderColor: '#d9d9d9',
 *                   borderRadius: '4px',
 *                   borderWidth: '1px',
 *                   padding: '1rem',
 *               },
 *               invalid: {
 *                   color: '#ed6a6a',
 *               },
 *               active: {
 *                   color: '#4496f6',
 *               },
 *         },
 *         clientId: 'YOUR_CLIENT_ID',
 * // Callback for submitting payment form that gets called when a buyer approves PayPal payment
 *         submitForm: () => {
 *         // Example function
 *             this.submitOrder(
 *                {
 *                   payment: { methodId: 'paypalcommerce', }
 *               }
 *            );
 *         },
 * // Callback is used to define the state of the payment form, validate if it is applicable for submit.
 *         onValidate: (resolve, reject) => {
 *         // Example function
 *             const isValid = this.validatePaymentForm();
 *             if (isValid) {
 *                 return resolve();
 *             }
 *             return reject();
 *         },
 * // Callback that is called right before render of a Smart Payment Button. It gets called when a buyer is eligible for use of the particular PayPal method. This callback can be used to hide the standard submit button.
 *         onRenderButton: () => {
 *         // Example function
 *             this.hidePaymentSubmitButton();
 *         }
 *     },
 * });
 * ```
 */
declare interface PaypalCommercePaymentInitializeOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container: string;
    /**
     *  The Client ID of the Paypal App
     */
    clientId: string;
    /**
     * The CSS selector of a container where the alternative payment methods fields widget should be inserted into.
     * It's necessary to specify this parameter when using Alternative Payment Methods.
     * Without it alternative payment methods will not work.
     */
    apmFieldsContainer?: string;
    /**
     * Object with styles to customize alternative payment methods fields.
     */
    apmFieldsStyles?: PaypalFieldsStyleOptions;
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
     * when buyer approved PayPal account.
     */
    submitForm(): void;
    /**
     * A callback right before render Smart Payment Button that gets called when
     * Smart Payment Button is eligible. This callback can be used to hide the standard submit button.
     */
    onRenderButton?(): void;
    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: Error): void;
}

declare interface PaypalCommerceStoredCardFieldOptions extends PaypalCommerceFormFieldOptions {
    instrumentId: string;
}

declare interface PaypalCommerceStoredCardFieldsMap {
    [PaypalCommerceFormFieldType.CardCodeVerification]?: PaypalCommerceStoredCardFieldOptions;
    [PaypalCommerceFormFieldType.CardNumberVerification]?: PaypalCommerceStoredCardFieldOptions;
}

declare interface PaypalCommerceVenmoButtonInitializeOptions {
    /**
     * A set of styling options for the checkout button.
     */
    style?: PaypalButtonStyleOptions_2;
    /**
     * Flag which helps to detect that the strategy initializes on Checkout page
     */
    initializesOnCheckoutPage?: boolean;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
}

/**
 * A set of options that are required to initialize the PayPal Express payment
 * method.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalexpress',
 * });
 * ```
 *
 * An additional flag can be passed in to always start the payment flow through
 * a redirect rather than a popup.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalexpress',
 *     paypalexpress: {
 *         useRedirectFlow: true,
 *     },
 * });
 * ```
 */
declare interface PaypalExpressPaymentInitializeOptions {
    useRedirectFlow?: boolean;
}

declare interface PaypalFieldsStyleOptions {
    variables?: {
        fontFamily?: string;
        fontSizeBase?: string;
        fontSizeSm?: string;
        fontSizeM?: string;
        fontSizeLg?: string;
        textColor?: string;
        colorTextPlaceholder?: string;
        colorBackground?: string;
        colorInfo?: string;
        colorDanger?: string;
        borderRadius?: string;
        borderColor?: string;
        borderWidth?: string;
        borderFocusColor?: string;
        spacingUnit?: string;
    };
    rules?: {
        [key: string]: any;
    };
}

declare interface PayPalInstrument extends BaseAccountInstrument {
    method: 'paypal';
}

declare interface PhysicalItem extends LineItem {
    isShippingRequired: boolean;
    giftWrapping?: {
        name: string;
        message: string;
        amount: number;
    };
}

declare interface PickupMethod {
    id: number;
    locationId: number;
    displayName: string;
    collectionInstructions: string;
    collectionTimeDescription: string;
}

declare interface PickupOptionRequestBody {
    searchArea: SearchArea;
    consignmentId: string;
}

declare interface PickupOptionResult {
    options: Option_2[];
}

declare interface Promotion {
    banners: Banner[];
}

declare interface Radius {
    value: number;
    unit: RadiusUnit;
}

declare enum RadiusUnit {
    KM = "KM",
    MI = "MI"
}

declare interface Region {
    code: string;
    name: string;
}

/**
 * Throw this error if we are unable to make a request to the server. It wraps
 * any server response into a JS error object.
 */
declare class RequestError<TBody = any> extends StandardError {
    body: TBody | {};
    headers: {
        [key: string]: any;
    };
    errors: Array<{
        code: string;
        message?: string;
    }>;
    status: number;
    constructor(response?: Response_2<TBody | {}>, { message, errors }?: {
        message?: string;
        errors?: Array<{
            code: string;
            message?: string;
        }>;
    });
}

/**
 * A set of options for configuring an asynchronous request.
 */
declare interface RequestOptions<TParams = {}> {
    /**
     * Provide this option if you want to cancel or time out the request. If the
     * timeout object completes before the request, the request will be
     * cancelled.
     */
    timeout?: Timeout;
    /**
     * The parameters of the request, if required.
     */
    params?: TParams;
}

declare interface SearchArea {
    radius: Radius;
    coordinates: Coordinates;
}

declare interface SepaPlaceHolder {
    ownerName?: string;
    ibanNumber?: string;
}

declare interface SepaPlaceHolder_2 {
    ownerName?: string;
    ibanNumber?: string;
}

/**
 * A set of options that are required to initialize the shipping step of the
 * current checkout flow.
 *
 * Some payment methods have specific requirements for setting the shipping
 * details for checkout. For example, Amazon Pay requires the customer to enter
 * their shipping address using their address book widget. As a result, you may
 * need to provide additional information in order to initialize the shipping
 * step of checkout.
 */
declare interface ShippingInitializeOptions<T = {}> extends ShippingRequestOptions<T> {
    /**
     * The options that are required to initialize the shipping step of checkout
     * when using Amazon Pay.
     */
    amazon?: AmazonPayShippingInitializeOptions;
    /**
     * The options that are required to initialize the shipping step of checkout
     * when using AmazonPayV2.
     */
    amazonpay?: AmazonPayV2ShippingInitializeOptions;
    /**
     * The options that are required to initialize the shipping step of checkout
     * when using Stripe Upe Link.
     */
    stripeupe?: StripeUPEShippingInitializeOptions;
}

declare interface ShippingOption {
    additionalDescription: string;
    description: string;
    id: string;
    isRecommended: boolean;
    imageUrl: string;
    cost: number;
    transitTime: string;
    type: string;
}

/**
 * A set of options for configuring any requests related to the shipping step of
 * the current checkout flow.
 *
 * Some payment methods have their own shipping configuration flow. Therefore,
 * you need to specify the method you intend to use if you want to trigger a
 * specific flow for setting the shipping address or option. Otherwise, these
 * options are not required.
 */
declare interface ShippingRequestOptions<T = {}> extends RequestOptions<T> {
    methodId?: string;
}

declare interface ShopperConfig {
    defaultNewsletterSignup: boolean;
    passwordRequirements: PasswordRequirements;
    showNewsletterSignup: boolean;
}

declare interface ShopperCurrency extends StoreCurrency {
    exchangeRate: number;
    isTransactional: boolean;
}

declare interface SignInEmail {
    sent_email: string;
    expiry: number;
}

declare interface SignInEmailRequestBody {
    email: string;
    redirectUrl?: string;
}

/**
 * The set of options for configuring any requests related to spam protection.
 */
declare interface SpamProtectionOptions extends RequestOptions_2 {
    /**
     * The container ID where the spam protection should be rendered.
     */
    containerId: string;
}

/**
 * Configures any form element provided by Square payment.
 */
declare interface SquareFormElement {
    /**
     * The ID of the container which the form element should insert into.
     */
    elementId: string;
    /**
     * The placeholder text to use for the form element, if provided.
     */
    placeholder?: string;
}

/**
 * A set of options that are required to initialize the Square payment method.
 *
 * Once Square payment is initialized, credit card form fields, provided by the
 * payment provider as iframes, will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 *
 * ```html
 * <!-- These containers are where the hosted (iframed) credit card fields will be inserted -->
 * <div id="card-number"></div>
 * <div id="card-name"></div>
 * <div id="card-expiry"></div>
 * <div id="card-code"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'squarev2',
 *     square: {
 *         cardNumber: {
 *             elementId: 'card-number',
 *         },
 *         cvv: {
 *             elementId: 'card-code',
 *         },
 *         expirationDate: {
 *             elementId: 'card-expiry',
 *         },
 *         postalCode: {
 *             elementId: 'card-code',
 *         },
 *     },
 * });
 * ```
 */
declare interface SquarePaymentInitializeOptions {
    /**
     * The location to insert the credit card number form field.
     */
    cardNumber: SquareFormElement;
    /**
     * The location to insert the CVV form field.
     */
    cvv: SquareFormElement;
    /**
     * The location to insert the expiration date form field.
     */
    expirationDate: SquareFormElement;
    /**
     * The location to insert the postal code form field.
     */
    postalCode: SquareFormElement;
    /**
     * The CSS class to apply to all form fields.
     */
    inputClass?: string;
    /**
     * The set of CSS styles to apply to all form fields.
     */
    inputStyles?: Array<{
        [key: string]: string;
    }>;
    /**
     * A callback that gets called when the customer selects a payment option.
     */
    onPaymentSelect?(): void;
    /**
     * A callback that gets called when an error occurs in the card nonce generation
     */
    onError?(errors?: NonceGenerationError[]): void;
}

/**
 * This error type should not be constructed directly. It is a base class for
 * all custom errors thrown in this library.
 */
declare abstract class StandardError extends Error implements CustomError {
    name: string;
    type: string;
    constructor(message?: string);
}

declare interface StepStyles extends BlockElementStyles {
    icon?: BlockElementStyles;
}

declare interface StepTracker {
    trackOrderComplete(): void;
    trackCheckoutStarted(): void;
    trackStepViewed(step: string): void;
    trackStepCompleted(step: string): void;
}

declare interface StepTrackerConfig {
    checkoutSteps?: AnalyticStepType[];
}

declare interface StoreConfig {
    cdnPath: string;
    checkoutSettings: CheckoutSettings;
    currency: StoreCurrency;
    displayDateFormat: string;
    displaySettings: DisplaySettings;
    inputDateFormat: string;
    /**
     * @deprecated Please use instead the data selectors
     * @remarks
     * ```js
     * const data = CheckoutService.getState().data;
     * const shippingAddressFields = data.getShippingAddressFields('US');
     * const billingAddressFields = data.getBillingAddressFields('US');
     * const customerAccountFields = data.getCustomerAccountFields();
     * ```
     */
    formFields: FormFields;
    links: StoreLinks;
    paymentSettings: PaymentSettings;
    shopperConfig: ShopperConfig;
    storeProfile: StoreProfile;
    imageDirectory: string;
    isAngularDebuggingEnabled: boolean;
    shopperCurrency: ShopperCurrency;
}

declare interface StoreCurrency {
    code: string;
    decimalPlaces: string;
    decimalSeparator: string;
    symbolLocation: string;
    symbol: string;
    thousandsSeparator: string;
}

declare interface StoreLinks {
    cartLink: string;
    checkoutLink: string;
    createAccountLink: string;
    forgotPasswordLink: string;
    loginLink: string;
    siteLink: string;
    orderConfirmationLink: string;
}

declare interface StoreProfile {
    orderEmail: string;
    shopPath: string;
    storeCountry: string;
    storeCountryCode: string;
    storeHash: string;
    storeId: string;
    storeName: string;
    storePhoneNumber: string;
    storeLanguage: string;
}

declare interface StripeCustomerEvent extends StripeEvent {
    collapsed?: boolean;
    authenticated: boolean;
    value: {
        email: string;
    };
}

declare interface StripeElementClasses {
    /**
     * The base class applied to the container. Defaults to StripeElement.
     */
    base?: string;
    /**
     * The class name to apply when the Element is complete. Defaults to StripeElement--complete.
     */
    complete?: string;
    /**
     * The class name to apply when the Element is empty. Defaults to StripeElement--empty.
     */
    empty?: string;
    /**
     * The class name to apply when the Element is focused. Defaults to StripeElement--focus.
     */
    focus?: string;
    /**
     * The class name to apply when the Element is invalid. Defaults to StripeElement--invalid.
     */
    invalid?: string;
    /**
     * The class name to apply when the Element has its value autofilled by the browser
     * (only on Chrome and Safari). Defaults to StripeElement--webkit-autofill.
     */
    webkitAutoFill?: string;
}

/**
 * CSS properties supported by Stripe.js.
 */
declare interface StripeElementCSSProperties {
    /**
     * The [background-color](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color) CSS property.
     *
     * This property works best with the `::selection` pseudo-class.
     * In other cases, consider setting the background color on the element's container instaed.
     */
    backgroundColor?: string;
    /**
     * The [color](https://developer.mozilla.org/en-US/docs/Web/CSS/color) CSS property.
     */
    color?: string;
    /**
     * The [font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family) CSS property.
     */
    fontFamily?: string;
    /**
     * The [font-size](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size) CSS property.
     */
    fontSize?: string;
    /**
     * The [font-smoothing](https://developer.mozilla.org/en-US/docs/Web/CSS/font-smoothing) CSS property.
     */
    fontSmoothing?: string;
    /**
     * The [font-style](https://developer.mozilla.org/en-US/docs/Web/CSS/font-style) CSS property.
     */
    fontStyle?: string;
    /**
     * The [font-variant](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant) CSS property.
     */
    fontVariant?: string;
    /**
     * The [font-weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight) CSS property.
     */
    fontWeight?: string;
    /**
     * A custom property, used to set the color of the icons that are rendered in an element.
     */
    iconColor?: string;
    /**
     * The [line-height](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height) CSS property.
     *
     * To avoid cursors being rendered inconsistently across browsers, consider using a padding on the element's container instead.
     */
    lineHeight?: string;
    /**
     * The [letter-spacing](https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing) CSS property.
     */
    letterSpacing?: string;
    /**
     * The [text-align](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align) CSS property.
     *
     * Available for the `cardNumber`, `cardExpiry`, and `cardCvc` elements.
     */
    textAlign?: string;
    /**
     * The [padding](https://developer.mozilla.org/en-US/docs/Web/CSS/padding) CSS property.
     *
     * Available for the `idealBank` element.
     * Accepts integer `px` values.
     */
    padding?: string;
    /**
     * The [text-decoration](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration) CSS property.
     */
    textDecoration?: string;
    /**
     * The [text-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow) CSS property.
     */
    textShadow?: string;
    /**
     * The [text-transform](https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform) CSS property.
     */
    textTransform?: string;
}

declare type StripeElementOptions = CardElementOptions | CardExpiryElementOptions | CardNumberElementOptions | CardCvcElementOptions | IdealElementOptions | IbanElementOptions | ZipCodeElementOptions;

declare interface StripeElementStyle {
    /**
     * Base variant—all other variants inherit from these styles.
     */
    base?: StripeElementStyleVariant;
    /**
     * Applied when the element has valid input.
     */
    complete?: StripeElementStyleVariant;
    /**
     * Applied when the element has no customer input.
     */
    empty?: StripeElementStyleVariant;
    /**
     * Applied when the element has invalid input.
     */
    invalid?: StripeElementStyleVariant;
}

declare interface StripeElementStyleVariant extends StripeElementCSSProperties {
    ':hover'?: StripeElementCSSProperties;
    ':focus'?: StripeElementCSSProperties;
    '::placeholder'?: StripeElementCSSProperties;
    '::selection'?: StripeElementCSSProperties;
    ':-webkit-autofill'?: StripeElementCSSProperties;
    /**
     * Available for all elements except the `paymentRequestButton` element
     */
    ':disabled'?: StripeElementCSSProperties;
    /**
     * Available for the `cardNumber`, `cardExpiry`, and `cardCvc` elements.
     */
    '::-ms-clear'?: StripeElementCSSProperties & {
        display: string;
    };
}

declare interface StripeEvent {
    complete: boolean;
    elementType: string;
    empty: boolean;
}

declare type StripeEventType = StripeShippingEvent | StripeCustomerEvent;

declare interface StripeShippingEvent extends StripeEvent {
    isNewAddress?: boolean;
    value: {
        address: {
            city: string;
            country: string;
            line1: string;
            line2?: string;
            postal_code: string;
            state: string;
        };
        name: string;
    };
}

declare interface StripeUPECustomerInitializeOptions {
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
    getStyles?(): {
        [key: string]: string;
    } | undefined;
}

/**
 * A set of options that are required to initialize the Stripe payment method.
 *
 * Once Stripe payment is initialized, credit card form fields, provided by the
 * payment provider as iframes, will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 *
 * ```html
 * <!-- This is where the credit card component will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'stripeupe',
 *     stripeupe {
 *         containerId: 'container',
 *     },
 * });
 * ```
 */
declare interface StripeUPEPaymentInitializeOptions {
    /**
     * The location to insert the credit card number form field.
     */
    containerId: string;
    /**
     * Checkout styles from store theme
     */
    style?: {
        [key: string]: string;
    };
    onError?(error?: Error): void;
}

/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support StripeUpe.
 *
 * When StripeUpe is initialized, an iframe will be inserted into the DOM. The
 * iframe has a list of shipping addresses for the customer to choose from.
 */
declare interface StripeUPEShippingInitializeOptions {
    /**
     * The ID of a container which the stripe iframe should be inserted.
     */
    container?: string;
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
     * A callback that gets called whenever the Stripe Link Shipping Element's object is completed.
     */
    onChangeShipping(shipping: StripeEventType): void;
    /**
     * Available countries configured on BC shipping setup.
     */
    availableCountries: string;
    /**
     * get styles from store theme
     */
    getStyles?(): {
        [key: string]: string;
    };
    /**
     * get the state code needed for shipping stripe element
     * @param country
     * @param state
     */
    getStripeState(country: string, state: string): string;
}

/**
 * A set of options that are required to initialize the Stripe payment method.
 *
 * Once Stripe payment is initialized, credit card form fields, provided by the
 * payment provider as iframes, will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 *
 * ```html
 * <!-- This is where the credit card component will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'stripev3',
 *     stripev3: {
 *         containerId: 'container',
 *     },
 * });
 * ```
 *
 * Additional options can be passed in to customize the fields.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'stripev3',
 *     stripev3: {
 *         containerId: 'container',
 *         options: {
 *             card: {
 *                 classes: { base: 'form-input' },
 *             },
 *             iban: {
 *                 classes: { base: 'form-input' },
 *                 supportedCountries: ['SEPA'],
 *             },
 *             idealBank: {
 *                 classes: { base: 'form-input' },
 *             },
 *         },
 *     },
 * });
 * ```
 */
declare interface StripeV3PaymentInitializeOptions {
    /**
     * The location to insert the credit card number form field.
     */
    containerId: string;
    options?: StripeElementOptions | IndividualCardElementOptions;
    /**
     * Hosted Form Validation Options
     */
    form?: HostedFormOptions;
}

declare enum StyleButtonColor {
    gold = "gold",
    blue = "blue",
    silver = "silver",
    black = "black",
    white = "white"
}

declare enum StyleButtonLabel {
    paypal = "paypal",
    checkout = "checkout",
    buynow = "buynow",
    pay = "pay",
    installment = "installment"
}

declare enum StyleButtonLayout {
    vertical = "vertical",
    horizontal = "horizontal"
}

declare enum StyleButtonShape {
    pill = "pill",
    rect = "rect"
}

declare interface StyleOptions {
    /**
     * Base styling applied to the iframe. All styling extends from this style.
     */
    base?: CssProperties;
    /**
     * Styling applied when a field fails validation.
     */
    error?: CssProperties;
    /**
     * Styling applied to the field's placeholder values.
     */
    placeholder?: CssProperties;
    /**
     * Styling applied once a field passes validation.
     */
    validated?: CssProperties;
}

declare interface StyleOptions_2 {
    /**
     * Base styling applied to the iframe. All styling extends from this style.
     */
    base?: CssProperties_2;
    /**
     * Styling applied when a field fails validation.
     */
    error?: CssProperties_2;
    /**
     * Styling applied to the field's placeholder values.
     */
    placeholder?: CssProperties_2;
    /**
     * Styling applied once a field passes validation.
     */
    validated?: CssProperties_2;
}

declare interface SubInputDetail {
    /**
     * Configuration parameters for the required input.
     */
    configuration?: object;
    /**
     * In case of a select, the items to choose from.
     */
    items?: Item_2[];
    /**
     * The value to provide in the result.
     */
    key?: string;
    /**
     * True if this input is optional to provide.
     */
    optional?: boolean;
    /**
     * The type of the required input.
     */
    type?: string;
    /**
     * The value can be pre-filled, if available.
     */
    value?: string;
}

declare interface SubInputDetail_2 {
    /**
     * Configuration parameters for the required input.
     */
    configuration?: object;
    /**
     * In case of a select, the items to choose from.
     */
    items?: Item_3[];
    /**
     * The value to provide in the result.
     */
    key?: string;
    /**
     * True if this input is optional to provide.
     */
    optional?: boolean;
    /**
     * The type of the required input.
     */
    type?: string;
    /**
     * The value can be pre-filled, if available.
     */
    value?: string;
}

declare interface Subscriptions {
    email: string;
    acceptsMarketingNewsletter: boolean;
    acceptsAbandonedCartEmails: boolean;
}

declare interface Tax {
    name: string;
    amount: number;
}

declare interface TextInputStyles extends InputStyles {
    placeholder?: InlineElementStyles;
}

declare interface ThreeDSecure {
    version: string;
    status: string;
    vendor: string;
    cavv: string;
    eci: string;
    xid: string;
}

declare interface ThreeDSecureToken {
    token: string;
}

declare interface TranslationData {
    [key: string]: string | number;
}

declare interface Translations {
    [key: string]: string | Translations;
}

declare interface UnknownObject {
    [key: string]: unknown;
}

declare interface VaultedInstrument {
    instrumentId: string;
    ccCvv?: string;
    ccNumber?: string;
}

declare interface WechatDataPaymentMethodState {
    paymentMethod: AdyenPaymentMethodState;
}

declare interface WechatDataPaymentMethodState_2 {
    paymentMethod: AdyenPaymentMethodState_2;
}

declare interface WechatState {
    data: WechatDataPaymentMethodState;
}

declare interface WechatState_2 {
    data: WechatDataPaymentMethodState_2;
}

declare interface WithAccountCreation {
    shouldCreateAccount?: boolean;
}

declare interface WithAdyenV2PaymentInitializeOptions {
    /**
     * The options that are required to initialize the Apple Pay payment
     * method. They can be omitted unless you need to support Apple Pay.
     */
    adyenv2?: AdyenV2PaymentInitializeOptions;
}

declare interface WithAdyenV3PaymentInitializeOptions {
    /**
     * The options that are required to initialize the Apple Pay payment
     * method. They can be omitted unless you need to support Apple Pay.
     */
    adyenv3?: AdyenV3PaymentInitializeOptions;
}

declare interface WithApplePayButtonInitializeOptions {
    applepay?: ApplePayButtonInitializeOptions_2;
}

declare interface WithApplePayCustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using ApplePay.
     */
    applepay?: ApplePayCustomerInitializeOptions;
}

declare interface WithApplePayPaymentInitializeOptions {
    /**
     * The options that are required to initialize the Apple Pay payment
     * method. They can be omitted unless you need to support Apple Pay.
     */
    applepay?: ApplePayPaymentInitializeOptions;
}

declare interface WithCheckoutcomFawryInstrument {
    customerMobile: string;
    customerEmail: string;
}

declare interface WithCheckoutcomiDealInstrument {
    bic: string;
}

declare interface WithCheckoutcomSEPAInstrument {
    iban: string;
    bic: string;
}

declare interface WithDocumentInstrument {
    ccDocument: string;
}

declare interface WithMollieIssuerInstrument {
    issuer: string;
    shopper_locale: string;
}

declare interface WorldpayAccessPaymentInitializeOptions {
    /**
     * A callback that gets called when the iframe is ready to be added to the
     * current page. It is responsible for determining where the iframe should
     * be inserted in the DOM.
     *
     * @param iframe - The iframe element containing the payment web page
     * provided by the strategy.
     * @param cancel - A function, when called, will cancel the payment
     * process and remove the iframe.
     */
    onLoad(iframe: HTMLIFrameElement, cancel: () => void): void;
}

declare interface ZipCodeElementOptions {
    containerId: string;
}

export { }
