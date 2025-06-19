/// <reference types="applepayjs" />
/// <reference types="grecaptcha" />
/// <reference types="lodash" />
import { Address as Address_2 } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { AmazonPayV2ButtonConfig } from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import { AmazonPayV2ButtonParameters } from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import { BraintreeError } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeFastlaneStylesOption } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BuyNowCartRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CardClassSelectors } from '@square/web-payments-sdk-types';
import { CardInstrument as CardInstrument_2 } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CartSource } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CreditCardPaymentInitializeOptions } from '@bigcommerce/checkout-sdk/credit-card-integration';
import { Currency as Currency_2 } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerAddress as CustomerAddress_2 } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { HostedForm as HostedFormInterface } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { HostedFormOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { HostedInstrument as HostedInstrument_2 } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicatorStyles } from '@bigcommerce/checkout-sdk/ui';
import { Observable } from 'rxjs';
import { Omit as Omit_2 } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalFastlaneStylesOption } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import { PayPalFastlaneStylesOption as PayPalFastlaneStylesOption_2 } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { PaymentErrorData } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentErrorResponseBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentProviderCustomer as PaymentProviderCustomerType } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaypalStyleOptions as PaypalStyleOptions_2 } from '@bigcommerce/checkout-sdk/braintree-utils';
import { ReadableDataStore } from '@bigcommerce/data-store';
import { RequestOptions as RequestOptions_2 } from '@bigcommerce/request-sender';
import { Response } from '@bigcommerce/request-sender';
import { ScriptLoader } from '@bigcommerce/script-loader';
import { StandardError as StandardError_2 } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { StorefrontErrorResponseBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { Timeout } from '@bigcommerce/request-sender';
import { WithAccountCreation } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WithBankAccountInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WithEcpInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WithPayByBankInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WithSepaInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { createTimeout } from '@bigcommerce/request-sender';

declare type AccountInstrument = PayPalInstrument | BankInstrument | AchInstrument;

declare interface AchInstrument extends BaseAccountInstrument {
    issuer: string;
    accountNumber: string;
    type: 'bank';
    method: 'ach' | 'ecp';
}

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
    /**
     * A callback that gets called when an action, for example a QR code or 3D Secure 2 authentication screen, is shown to the shopper
     */
    onActionHandled?(): void;
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
    showBrandsUnderCardNumber?: boolean;
}

declare enum AdyenCardFields {
    CardNumber = "encryptedCardNumber",
    SecurityCode = "encryptedSecurityCode",
    ExpiryDate = "encryptedExpiryDate"
}

declare interface AdyenComponent {
    componentRef?: {
        showValidation(): void;
    };
    props?: {
        type?: string;
    };
    state?: AdyenComponentState;
    mount(containerId: string): HTMLElement;
    unmount(): void;
    submit(): void;
}

declare type AdyenComponentEventState = CardState | BoletoState | WechatState;

declare interface AdyenComponentEvents {
    /**
     * Called when the shopper enters data in the card input fields.
     * Here you have the option to override your main Adyen Checkout configuration.
     */
    onChange?(state: AdyenComponentEventState, component: AdyenComponent): void;
    /**
     * Called when the shopper selects the Pay button and payment details are valid.
     */
    onSubmit?(state: AdyenComponentEventState, component: AdyenComponent): void;
    /**
     * Called in case of an invalid card number, invalid expiry date, or
     *  incomplete field. Called again when errors are cleared.
     */
    onError?(state: AdyenValidationState, component: AdyenComponent): void;
    onFieldValid?(state: AdyenValidationState, component: AdyenComponent): void;
}

declare interface AdyenComponentState {
    data?: CardStateData | IdealStateData | SepaStateData;
    issuer?: string;
    isValid?: boolean;
    valid?: {
        [key: string]: boolean;
    };
    errors?: CardStateErrors;
}

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

declare interface AdyenIdealComponentOptions extends AdyenBaseCardComponentOptions, AdyenComponentEvents {
    /**
     * Optional. Set to **false** to remove the bank logos from the iDEAL form.
     */
    showImage?: boolean;
}

declare interface AdyenPaymentMethodState {
    type: string;
}

declare interface AdyenPlaceholderData {
    firstName?: string;
    lastName?: string;
    holderName?: string;
    prefillCardHolderName?: boolean;
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
    options?: Omit_2<AdyenCreditCardComponentOptions, 'onChange'> | AdyenIdealComponentOptions;
    shouldShowNumberField?: boolean;
    validateCardFields(validateState: AdyenValidationState): void;
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
 *             onActionHandled() {
 *                 console.log('ActionHandled');
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
    additionalActionOptions: AdyenAdditionalActionOptions;
    /**
     * Optional. Overwriting the default options
     */
    options?: Omit_2<AdyenCreditCardComponentOptions, 'onChange'>;
    shouldShowNumberField?: boolean;
    validateCardFields(validateState: AdyenValidationState): void;
}

declare interface AdyenValidationState {
    valid: boolean;
    fieldType?: AdyenCardFields;
    endDigits?: string;
    encryptedFieldName?: string;
    i18n?: string;
    error?: string;
    errorKey?: string;
}

declare interface AmazonPayRemoteCheckout {
    referenceId?: string;
    billing?: {
        address?: InternalAddress | false;
    };
    shipping?: {
        address?: InternalAddress | false;
    };
    settings?: {
        billing: string;
        billingMessage: string;
        customer: string;
        payment: string;
        provider: string;
        shipping: string;
    };
}

/**
 * The required config to render the AmazonPayV2 button.
 */
declare type AmazonPayV2ButtonInitializeOptions = AmazonPayV2ButtonParameters | WithBuyNowFeature;

/**
 * A set of options that are required to initialize the customer step of
 * checkout in order to support AmazonPayV2.
 *
 * When AmazonPayV2 is initialized, a sign-in button will be inserted into the
 * DOM. When the customer clicks on it, they will be redirected to Amazon to
 * sign in.
 *
 * ```html
 * <!-- This is where the Amazon Pay button will be inserted -->
 * <div id="signInButton"></div>
 * ```
 *
 * ```js
 * service.initializeCustomer({
 *     methodId: 'amazonpay',
 *     amazonpay: {
 *         container: 'signInButton',
 *     },
 * });
 * ```
 */
declare interface AmazonPayV2CustomerInitializeOptions {
    /**
     * The ID of a container which the sign-in button should insert into.
     */
    container: string;
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
 * <!-- This is the change payment button that will be bound -->
 * <button id="edit-button">Change card</button>
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

/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support AmazonPayV2.
 *
 * When AmazonPayV2 is initialized, a change shipping button will be bound.
 * When the customer clicks on it, they will be redirected to Amazon to
 * select a different shipping address.
 *
 * ```html
 * <!-- This is the change shipping button that will be bound -->
 * <button id="edit-button">Change shipping</button>
 * ```
 *
 * ```js
 * service.initializeShipping({
 *     methodId: 'amazonpay',
 *     amazonpay: {
 *         editAddressButtonId: 'edit-button',
 *     },
 * });
 * ```
 */
declare interface AmazonPayV2ShippingInitializeOptions {
    /**
     * This editAddressButtonId is used to set an event listener, provide an
     * element ID if you want users to be able to select a different shipping
     * address by clicking on a button. It should be an HTML element.
     */
    editAddressButtonId?: string;
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
     * This option indicates if product requires shipping
     */
    requiresShipping?: boolean;
    /**
     * Enabling a new version of Apple Pay with using Apple Pay SDK
     */
    isWebBrowserSupported?: boolean;
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
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
    /**
     * A callback that gets called when wallet button clicked
     */
    onClick?(): void;
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
     * Store credit label to be passed to apple sheet.
     */
    storeCreditLabel?: string;
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
    method: string;
    type: 'account' | 'bank';
}

declare interface BaseCheckoutButtonInitializeOptions extends CheckoutButtonOptions {
    [key: string]: unknown;
    /**
     * The ID of a container which the checkout button should be inserted.
     */
    containerId: string;
    /**
     * The option that is required to load payment method configuration for provided currency code in Buy Now flow.
     */
    currencyCode?: string;
    /**
     * The options that are required to facilitate PayPal. They can be omitted
     * unless you need to support Paypal.
     */
    paypal?: PaypalButtonInitializeOptions;
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
     * The options that are required to initialize the Masterpass payment method.
     * They can be omitted unless you need to support Masterpass.
     */
    masterpass?: MasterpassCustomerInitializeOptions;
}

declare interface BaseElementOptions {
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

declare interface BaseIndividualElementOptions extends BaseElementOptions {
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
     * The options that are required to initialize the BlueSnapV2 payment method.
     * They can be omitted unless you need to support BlueSnapV2.
     */
    bluesnapv2?: BlueSnapV2PaymentInitializeOptions;
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
     * The options that are required to initialize the Masterpass payment method.
     * They can be omitted unless you need to support Masterpass.
     */
    masterpass?: MasterpassPaymentInitializeOptions;
    /**
     * The options that are required to initialize the PayPal Express payment method.
     * They can be omitted unless you need to support PayPal Express.
     */
    paypalexpress?: PaypalExpressPaymentInitializeOptions;
    /**
     * The options that are required to initialize the Braintree Venmo payment method.
     * They can be omitted unless you need to support Braintree Venmo.
     */
    braintreevenmo?: BraintreeVenmoInitializeOptions;
}

declare interface BigCommercePaymentsAlternativeMethodsButtonInitializeOptions {
    /**
     * Alternative payment method id what used for initialization PayPal button as funding source.
     */
    apm: string;
    /**
     * The options that required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions;
    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

/**
 * A set of options that are required to initialize the BigCommercePayments payment
 * method for presenting its PayPal button.
 *
 *
 * Also, BCP (also known as BigCommercePayments) requires specific options to initialize the PayPal Smart Payment Button on checkout page that substitutes a standard submit button
 * ```html
 * <!-- This is where the APM button will be inserted -->
 * <div id="container"></div>
 * <!-- This is where the alternative payment methods fields will be inserted.  -->
 * <div id="apm-fields-container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     gatewayId: 'bigcommerce_payments_apms',
 *     methodId: 'sepa',
 *     bigcommerce_payments_apms: {
 *         container: '#container',
 *         apmFieldsContainer: '#apm-fields-container',
 *         apmFieldsStyles: {
 *             base: {
 *                 backgroundColor: 'transparent',
 *             },
 *             input: {
 *                 backgroundColor: 'white',
 *                 fontSize: '1rem',
 *                 color: '#333',
 *                 borderColor: '#d9d9d9',
 *                 borderRadius: '4px',
 *                 borderWidth: '1px',
 *                 padding: '1rem',
 *             },
 *             invalid: {
 *                 color: '#ed6a6a',
 *             },
 *             active: {
 *                 color: '#4496f6',
 *             },
 *         },
 *         clientId: 'YOUR_CLIENT_ID',
 * // Callback for submitting payment form that gets called when a buyer approves payment
 *         submitForm: () => {
 *         // Example function
 *             this.submitOrder(
 *                {
 *                   payment: { methodId: 'bigcommerce_payments_apms', }
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
declare interface BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions {
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
    apmFieldsStyles?: BigCommercePaymentsFieldsStyleOptions;
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
     * when buyer approved PayPal account.
     */
    submitForm(): void;
    /**
     * A callback that gets called
     * when Smart Payment Button is initialized.
     */
    onInitButton(actions: InitCallbackActions): Promise<void>;
}

/**
 * A set of options that are required to initialize the BigCommercePayments Credit Card payment
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
 *     methodId: 'bigcommerce_payments_creditcards',
 *     bigcommerce_payments_creditcards: {
 *         form: {
 *             fields: {
 *                 cardNumber: { containerId: 'card-number' },
 *                 cardName: { containerId: 'card-name' },
 *                 cardExpiry: { containerId: 'card-expiry' },
 *                 cardCode: { containerId: 'card-code' },
 *             },
 *         },
 *         onCreditCardFieldsRenderingError: (error) => handleError(error),
 *     },
 * });
 * ```
 *
 * Additional options can be passed in to customize the fields and register
 * event callbacks.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'bigcommerce_payments_creditcards',
 *     bigcommerce_payments_creditcards: {
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
 *         onCreditCardFieldsRenderingError: (error) => handleError(error),
 *     },
 * });
 * ```
 */
declare interface BigCommercePaymentsCreditCardsPaymentInitializeOptions {
    /**
     * The form is data for Credit Card Form
     */
    form: HostedFormOptions;
    /**
     * The callback that gets called when there is an issue with rendering credit card fields
     */
    onCreditCardFieldsRenderingError?: (error: unknown) => void;
}

/**
 * A set of options that are optional to initialize the BigCommercePayments Fastlane customer strategy
 * that are responsible for BigCommercePayments Fastlane components styling and initialization
 *
 * ```js
 * service.initializeCustomer({
 *     methodId: 'bigcommerce_payments_fastlane',
 *     bigcommerce_payments_fastlane: {
 *         styles: {
 *              root: {
 *                  backgroundColorPrimary: 'transparent',
 *                  errorColor: '#C40B0B',
 *                  fontFamily: 'Montserrat, Helvetica, Arial, sans-serif',
 *              },
 *              input: {
 *                  borderRadius: '0.25rem',
 *                  borderColor: '#9E9E9E',
 *                  focusBorderColor: '#4496F6',
 *              },
 *              toggle: {
 *                  colorPrimary: '#0F005E',
 *                  colorSecondary: '#ffffff',
 *              },
 *              text: {
 *                  body: {
 *                      color: '#222222',
 *                      fontSize: '1rem',
 *                  },
 *                  caption: {
 *                      color: '#515151',
 *                      fontSize: '0.875rem',
 *                  },
 *              },
 *              branding: 'light',
 *         },
 *     },
 * });
 * ```
 */
declare interface BigCommercePaymentsFastlaneCustomerInitializeOptions {
    /**
     * Is a stylisation options for customizing BigCommercePayments Fastlane components
     *
     * Note: the styles for all BigCommercePayments Fastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter which strategy was initialised first
     */
    styles?: PayPalFastlaneStylesOption;
}

/**
 * A set of options that are required to initialize the BigCommercePayments Fastlane payment
 * method for presenting on the page.
 *
 *
 * Also, BigCommercePayments requires specific options to initialize BigCommercePayments Fastlane Card Component
 * ```html
 * <!-- This is where the BigCommercePayments Fastlane Card Component will be inserted -->
 * <div id="container"></div>
 * ```
 * ```js
 * service.initializePayment({
 *     methodId: 'bigcommerce_payments_fastlane',
 *     bigcommerce_payments_fastlane: {
 *         onInit: (renderPayPalCardComponent) => renderPayPalCardComponent('#container-id'),
 *         onChange: (showPayPalCardSelector) => showPayPalCardSelector(),
 *         styles: {
 *              root: {
 *                  backgroundColorPrimary: 'transparent',
 *                  errorColor: '#C40B0B',
 *                  fontFamily: 'Montserrat, Helvetica, Arial, sans-serif',
 *              },
 *              input: {
 *                  borderRadius: '0.25rem',
 *                  borderColor: '#9E9E9E',
 *                  focusBorderColor: '#4496F6',
 *              },
 *              toggle: {
 *                  colorPrimary: '#0F005E',
 *                  colorSecondary: '#ffffff',
 *              },
 *              text: {
 *                  body: {
 *                      color: '#222222',
 *                      fontSize: '1rem',
 *                  },
 *                  caption: {
 *                      color: '#515151',
 *                      fontSize: '0.875rem',
 *                  },
 *              },
 *              branding: 'light',
 *         },
 *     },
 * });
 * ```
 */
declare interface BigCommercePaymentsFastlanePaymentInitializeOptions {
    /**
     * Is a callback that takes the CSS selector of a container
     * where the BigCommercePayments Fastlane form should be inserted into.
     */
    onInit?: (renderPayPalCardComponent: (container: string) => void) => void;
    /**
     * Is a callback that shows fastlane stored instruments
     * when get triggered
     */
    onChange?: (showPayPalCardSelector: () => Promise<CardInstrument_2 | undefined>) => void;
    /**
     * Is a stylisation options for customizing BigCommercePayments Fastlane components
     *
     * Note: the styles for all BigCommercePaymentsFastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: PayPalFastlaneStylesOption;
}

/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support BigCommercePayments  Fastlane.
 */
declare interface BigCommercePaymentsFastlaneShippingInitializeOptions {
    /**
     * Is a stylisation options for customizing BigCommercePayments Fastlane components
     *
     * Note: the styles for all BigCommercePayments Fastlane strategies should be the same,
     * because they will be provided to fastlane library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: PayPalFastlaneStylesOption;
    /**
     * Is a callback that shows BigCommercePayments Fastlane popup with customer addresses
     * when get triggered
     */
    onPayPalFastlaneAddressChange?: (showPayPalFastlaneAddressSelector: () => Promise<CustomerAddress_2 | undefined>) => void;
}

declare interface BigCommercePaymentsFieldsStyleOptions {
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

declare interface BigCommercePaymentsPayLaterButtonInitializeOptions {
    /**
     * The ID of a container which the messaging should be inserted.
     */
    messagingContainerId?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions;
    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

declare interface BigCommercePaymentsPayLaterCustomerInitializeOptions {
    /**
     * The ID of a container which the checkout button should be inserted into.
     */
    container: string;
    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error?: Error): void;
    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
    /**
     * A callback that gets called when paypal button clicked.
     */
    onClick?(): void;
}

/**
 * A set of options that are required to initialize the BigCommercePayments PayLater payment
 * method for presenting its BigCommercePayments PayLater button.
 *
 *
 * Also, BigCommercePayments requires specific options to initialize the BigCommercePayments Smart Payment Button on checkout page that substitutes a standard submit button
 * ```html
 * <!-- This is where the BigCommercePayments PayLater button will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'bigcommerce_payments_paylater',
 *     bigcommerce_payments_paylater: {
 *         container: '#container',
 * // Callback for submitting payment form that gets called when a buyer approves BigCommercePayments payment
 *         submitForm: () => {
 *         // Example function
 *             this.submitOrder(
 *                {
 *                   payment: { methodId: 'bigcommerce_payments_paylater', }
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
 * // Callback that is called right before render of a Smart Payment Button. It gets called when a buyer is eligible for use of the particular BigCommercePayments method. This callback can be used to hide the standard submit button.
 *         onRenderButton: () => {
 *         // Example function
 *             this.hidePaymentSubmitButton();
 *         }
 *     },
 * });
 * ```
 */
declare interface BigCommercePaymentsPayLaterPaymentInitializeOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container?: string;
    /**
     * The location to insert the Pay Later Messages.
     */
    bannerContainerId?: string;
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
    onValidate?(resolve: () => void, reject: () => void): Promise<void>;
    /**
     * A callback for submitting payment form that gets called
     * when buyer approved BigCommercePayments account.
     */
    submitForm?(): void;
}

declare interface BigCommercePaymentsRatePayPaymentInitializeOptions {
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

declare interface BigCommercePaymentsVenmoButtonInitializeOptions {
    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * The options that required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions;
    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

declare interface BigCommercePaymentsVenmoCustomerInitializeOptions {
    /**
     * The ID of a container which the checkout button should be inserted into.
     */
    container: string;
    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error?: Error): void;
    /**
     * A callback that gets called when Venmo button clicked.
     */
    onClick?(): void;
}

/**
 * A set of options that are required to initialize the BigCommercePayments Venmo payment
 * method for presenting its Venmo button.
 *
 *
 * Also, BigCommercePayments requires specific options to initialize the Venmo Button on checkout page that substitutes a standard submit button
 * ```html
 * <!-- This is where the Venmo button will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'bigcommerce_payments_venmo',
 *     bigcommerce_payments_venmo: {
 *         container: '#container',
 * // Callback for submitting payment form that gets called when a buyer approves payment
 *         submitForm: () => {
 *         // Example function
 *             this.submitOrder(
 *                {
 *                   payment: { methodId: 'bigcommerce_payments_venmo', }
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
declare interface BigCommercePaymentsVenmoPaymentInitializeOptions {
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
     * when buyer approved PayPal account.
     */
    submitForm(): void;
}

/**
 * A set of options that are required to initialize BigCommercePaymentsButtonStrategy in cart or product details page.
 *
 * When BigCommercePayments is initialized, an BigCommercePayments PayPal button will be inserted into the
 * DOM. When a customer clicks on it, it will trigger PayPal flow.
 */
declare interface BigcommercePaymentsButtonInitializeOptions {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions;
    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

/**
 * A set of options that are required to initialize the customer step of
 * checkout to support BigCommercePayments.
 */
declare interface BigcommercePaymentsCustomerInitializeOptions {
    /**
     * The ID of a container which the checkout button should be inserted into.
     */
    container: string;
    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error?: Error): void;
    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
    /**
     * A callback that gets called when paypal button clicked.
     */
    onClick?(): void;
}

/**
 * A set of options that are required to initialize the BigCommercePayments payment
 * method for presenting its PayPal button.
 *
 * Please note that the minimum version of checkout-sdk is 1.100
 *
 * Also, BigCommercePayments requires specific options to initialize the PayPal Smart Payment Button on checkout page that substitutes a standard submit button
 * ```html
 * <!-- This is where the BigCommercePayments PayPal button will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'bigcommerce_payments',
 *     bigcommerce_payments: {
 *         container: '#container',
 * // Callback for submitting payment form that gets called when a buyer approves PayPal payment
 *         submitForm: () => {
 *         // Example function
 *             this.submitOrder(
 *                {
 *                   payment: { methodId: 'bigcommerce_payments', }
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
declare interface BigcommercePaymentsPaymentInitializeOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container: string;
    /**
     * If there is no need to initialize the Smart Payment Button, simply pass false as the option value.
     * The default value is true
     */
    shouldRenderPayPalButtonOnInitialization?: boolean;
    /**
     * A callback for getting form fields values.
     */
    getFieldsValues?(): HostedInstrument_2;
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
     * when buyer approves PayPal payment.
     */
    submitForm(): void;
}

declare interface BillingAddress extends Address {
    id: string;
    email?: string;
}

declare interface BillingAddressRequestBody extends AddressRequestBody {
    email?: string;
}

declare interface BillingAddressSelector {
    getBillingAddress(): BillingAddress | undefined;
    getBillingAddressOrThrow(): BillingAddress;
    getUpdateError(): Error | undefined;
    getContinueAsGuestError(): Error | undefined;
    getLoadError(): Error | undefined;
    isUpdating(): boolean;
    isContinuingAsGuest(): boolean;
    isLoading(): boolean;
}

declare interface BirthDate {
    getFullYear(): number;
    getDate(): number;
    getMonth(): number;
}

declare interface BirthDate_2 {
    getFullYear(): number;
    getDate(): number;
    getMonth(): number;
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
 *     methodId: 'bluesnapDirect',
 *     bluesnapDirect: {
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
declare interface BlueSnapDirectAPMInitializeOptions {
    /**
     * A set of CSS properties to apply to the iframe.
     */
    style?: BlueSnapDirectStyleProps;
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

declare interface BlueSnapDirectStyleProps {
    border?: string;
    height?: string;
    width?: string;
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
    customerSuggestionInit(payload?: BodlEventsPayload): void;
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

declare interface BoletoDataPaymentMethodState {
    paymentMethod: AdyenPaymentMethodState;
    shopperName?: {
        firstName?: string;
        lastName?: string;
    };
    socialSecurityNumber?: string;
}

declare interface BoletoState {
    data: BoletoDataPaymentMethodState;
}

declare interface BoltButtonInitializeOptions {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: BoltBuyNowInitializeOptions;
    style?: BoltButtonStyleOptions;
}

declare interface BoltButtonStyleOptions {
    shape?: StyleButtonShape_2;
    size?: StyleButtonSize;
}

declare interface BoltBuyNowInitializeOptions {
    storefrontApiToken?: string;
    getBuyNowCartRequestBody(): BuyNowCartRequestBody;
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
     * @param email - Email address which was used for checking user account availability on Bolt.
     */
    onInit?(hasBoltAccount: boolean, email?: string): void;
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

declare interface BraintreeAchInitializeOptions {
    /**
     * A callback that returns text that should be displayed to the customer in UI for proof of authorization
     */
    getMandateText: () => string;
}

declare interface BraintreeAnalyticTrackerService {
    customerPaymentMethodExecuted(): void;
    paymentComplete(): void;
    selectedPaymentMethod(methodId: string): void;
    walletButtonClick(methodId: string): void;
}

/**
 * A set of options that are optional to initialize the Braintree Fastlane customer strategy
 * that are responsible for Braintree Fastlane components styling and initialization
 *
 * ```js
 * service.initializeCustomer({
 *     methodId: 'braintreeacceleratedcheckout', // 'braintree' only for A/B testing
 *     braintreefastlane: {
 *         styles: {
 *              root: {
 *                  backgroundColorPrimary: 'transparent',
 *                  errorColor: '#C40B0B',
 *                  fontFamily: 'Montserrat, Helvetica, Arial, sans-serif',
 *              },
 *              input: {
 *                  borderRadius: '0.25rem',
 *                  borderColor: '#9E9E9E',
 *                  focusBorderColor: '#4496F6',
 *              },
 *              toggle: {
 *                  colorPrimary: '#0F005E',
 *                  colorSecondary: '#ffffff',
 *              },
 *              text: {
 *                  body: {
 *                      color: '#222222',
 *                      fontSize: '1rem',
 *                  },
 *                  caption: {
 *                      color: '#515151',
 *                      fontSize: '0.875rem',
 *                  },
 *              },
 *              branding: 'light',
 *         },
 *     },
 * });
 * ```
 */
declare interface BraintreeFastlaneCustomerInitializeOptions {
    /**
     * Is a stylisation options for customizing PayPal Fastlane components
     *
     * Note: the styles for all Braintree Fastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: BraintreeFastlaneStylesOption;
}

/**
 * A set of options that are required to initialize the Braintree Fastlane payment
 * method for presenting on the page.
 *
 *
 * Also, Braintree requires specific options to initialize Braintree Fastlane Credit Card Component
 * ```html
 * <!-- This is where the Braintree Credit Card Component will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'braintreeacceleratedcheckout',
 *     braintreefastlane: {
 *         onInit: (renderPayPalComponentMethod) => renderPayPalComponentMethod('#container-id'),
 *         onChange: (showPayPalCardSelector) => showPayPalCardSelector(),
 *         styles: {
 *              root: {
 *                  backgroundColorPrimary: 'transparent',
 *                  errorColor: '#C40B0B',
 *                  fontFamily: 'Montserrat, Helvetica, Arial, sans-serif',
 *              },
 *              input: {
 *                  borderRadius: '0.25rem',
 *                  borderColor: '#9E9E9E',
 *                  focusBorderColor: '#4496F6',
 *              },
 *              toggle: {
 *                  colorPrimary: '#0F005E',
 *                  colorSecondary: '#ffffff',
 *              },
 *              text: {
 *                  body: {
 *                      color: '#222222',
 *                      fontSize: '1rem',
 *                  },
 *                  caption: {
 *                      color: '#515151',
 *                      fontSize: '0.875rem',
 *                  },
 *              },
 *              branding: 'light',
 *         },
 *     },
 * });
 * ```
 */
declare interface BraintreeFastlanePaymentInitializeOptions {
    /**
     * Is a callback that takes the CSS selector of a container
     * where the Braintree Fastlane form should be inserted into.
     */
    onInit?: (renderPayPalComponentMethod: (container: string) => void) => void;
    /**
     * Is a callback that shows Braintree stored instruments
     * when get triggered
     */
    onChange?: (showPayPalCardSelector: () => Promise<CardInstrument_2 | undefined>) => void;
    /**
     * Is a stylisation options for customizing Braintree Fastlane components
     *
     * Note: the styles for all Braintree Fastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: BraintreeFastlaneStylesOption;
    onError?: (error: Error) => void;
}

/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support Braintree Fastlane.
 */
declare interface BraintreeFastlaneShippingInitializeOptions {
    /**
     * Is a stylisation options for customizing PayPal Fastlane components
     *
     * Note: the styles for all Braintree Fastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: BraintreeFastlaneStylesOption;
    /**
     * Is a callback that shows Braintree Fastlane popup with customer addresses
     * when get triggered
     */
    onPayPalFastlaneAddressChange?: (showBraintreeFastlaneAddressSelector: () => Promise<CustomerAddress_2 | undefined>) => void;
}

declare type BraintreeFormErrorData = Omit<BraintreeFormFieldState, 'isFocused'>;

declare type BraintreeFormErrorDataKeys = 'number' | 'expirationDate' | 'expirationMonth' | 'expirationYear' | 'cvv' | 'postalCode';

declare type BraintreeFormErrorsData = Partial<Record<BraintreeFormErrorDataKeys, BraintreeFormErrorData>>;

declare type BraintreeFormFieldBlurEventData = BraintreeFormFieldKeyboardEventData;

declare interface BraintreeFormFieldCardTypeChangeEventData {
    cardType?: string;
}

declare type BraintreeFormFieldEnterEventData = BraintreeFormFieldKeyboardEventData;

declare type BraintreeFormFieldFocusEventData = BraintreeFormFieldKeyboardEventData;

declare interface BraintreeFormFieldKeyboardEventData {
    fieldType: string;
    errors?: BraintreeFormErrorsData;
}

declare interface BraintreeFormFieldOptions {
    accessibilityLabel?: string;
    containerId: string;
    placeholder?: string;
}

declare interface BraintreeFormFieldState {
    isFocused: boolean;
    isEmpty: boolean;
    isPotentiallyValid: boolean;
    isValid: boolean;
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

declare interface BraintreeFormFieldsMap {
    [BraintreeFormFieldType.CardCode]?: BraintreeFormFieldOptions;
    [BraintreeFormFieldType.CardExpiry]: BraintreeFormFieldOptions;
    [BraintreeFormFieldType.CardName]: BraintreeFormFieldOptions;
    [BraintreeFormFieldType.CardNumber]: BraintreeFormFieldOptions;
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

declare interface BraintreeLocalMethodsPaymentInitializeOptions {
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
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    containerId?: string;
    threeDSecure?: BraintreeThreeDSecureOptions;
    /**
     * @alpha
     * Please note that this option is currently in an early stage of
     * development. Therefore the API is unstable and not ready for public
     * consumption.
     */
    form?: BraintreeFormOptions;
    /**
     * The location to insert the Pay Later Messages.
     */
    bannerContainerId?: string;
    /**
     * A callback right before render Smart Payment Button that gets called when
     * Smart Payment Button is eligible. This callback can be used to hide the standard submit button.
     */
    onRenderButton?(): void;
    /**
     * A callback for submitting payment form that gets called
     * when buyer approved PayPal account.
     */
    submitForm?(): void;
    /**
     * A callback that gets called if unable to submit payment.
     *
     * @param error - The error object describing the failure.
     */
    onPaymentError?(error: BraintreeError | StandardError_2): void;
    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: unknown): void;
}

declare interface BraintreePaypalButtonInitializeOptions {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: Pick<PaypalStyleOptions_2, 'layout' | 'size' | 'color' | 'label' | 'shape' | 'tagline' | 'fundingicons' | 'height'>;
    /**
     * Address to be used for shipping.
     * If not provided, it will use the first saved address from the active customer.
     */
    shippingAddress?: Address_2 | null;
    /**
     * A callback that gets called if unable to authorize and tokenize payment.
     *
     * @param error - The error object describing the failure.
     */
    onAuthorizeError?(error: BraintreeError | StandardError_2): void;
    /**
     * A callback that gets called if unable to submit payment.
     *
     * @param error - The error object describing the failure.
     */
    onPaymentError?(error: BraintreeError | StandardError_2): void;
    /**
     * A callback that gets called on any error instead of submit payment or authorization errors.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | StandardError_2): void;
    /**
     *
     *  A callback that gets called when Braintree SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

declare interface BraintreePaypalCreditButtonInitializeOptions {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * The ID of a container where the messaging component should be inserted.
     */
    messagingContainerId?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: Pick<PaypalStyleOptions_2, 'layout' | 'size' | 'color' | 'label' | 'shape' | 'tagline' | 'fundingicons' | 'height'>;
    /**
     * Address to be used for shipping.
     * If not provided, it will use the first saved address from the active customer.
     */
    shippingAddress?: Address_2 | null;
    /**
     * A callback that gets called if unable to authorize and tokenize payment.
     *
     * @param error - The error object describing the failure.
     */
    onAuthorizeError?(error: BraintreeError | StandardError_2): void;
    /**
     * A callback that gets called if unable to submit payment.
     *
     * @param error - The error object describing the failure.
     */
    onPaymentError?(error: BraintreeError | StandardError_2): void;
    /**
     * A callback that gets called on any error instead of submit payment or authorization errors.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | StandardError_2): void;
    /**
     *
     *  A callback that gets called when Braintree SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

declare interface BraintreePaypalCreditCustomerInitializeOptions {
    /**
     * The ID of a container which the checkout button should be inserted into.
     */
    container: string;
    buttonHeight?: number;
    /**
     * A callback that gets called on any error instead of submit payment or authorization errors.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | StandardError_2): void;
    /**
     * A callback that gets called when wallet button clicked
     */
    onClick?(): void;
}

declare interface BraintreePaypalCustomerInitializeOptions {
    /**
     * The ID of a container which the checkout button should be inserted into.
     */
    container: string;
    buttonHeight?: number;
    /**
     * A callback that gets called on any error instead of submit payment or authorization errors.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | StandardError_2): void;
    /**
     * A callback that gets called when wallet button clicked
     */
    onClick?(): void;
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
    challengeRequested?: boolean;
    additionalInformation?: {
        acsWindowSize?: '01' | '02' | '03' | '04' | '05';
    };
}

declare interface BraintreeVenmoInitializeOptions {
    /**
     * An option that can provide different payment authorization methods, for more information use the following link: https://developer.paypal.com/braintree/docs/guides/venmo/client-side/javascript/v3/#desktop-qr-code
     * If no value is specified, it will be true
     */
    allowDesktop?: boolean;
}

declare interface BraintreeVerifyPayload {
    nonce: string;
    details?: {
        cardType: string;
        lastFour: string;
        lastTwo: string;
    };
    description?: string;
    liabilityShiftPossible?: boolean;
    liabilityShifted?: boolean;
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

declare interface ButtonStyles extends BlockElementStyles {
    active?: BlockElementStyles;
    focus?: BlockElementStyles;
    hover?: BlockElementStyles;
    disabled?: BlockElementStyles;
}

declare interface CardCvcElementOptions extends BaseIndividualElementOptions {
    placeholder?: string;
}

declare interface CardDataPaymentMethodState {
    paymentMethod: CardPaymentMethodState;
    installments?: {
        value: number;
        plan?: 'string';
    };
}

declare interface CardElementOptions extends BaseElementOptions {
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
    untrustedShippingCardVerificationMode: UntrustedShippingCardVerificationType;
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

declare interface CardState {
    data: CardDataPaymentMethodState;
    isValid?: boolean;
    valid?: {
        [key: string]: boolean;
    };
    errors?: CardStateErrors;
}

declare interface CardStateData {
    encryptedCardNumber: string;
    encryptedExpiryMonth: string;
    encryptedExpiryYear: string;
    encryptedSecurityCode: string;
    holderName: string;
}

declare interface CardStateErrors {
    [key: string]: string;
}

declare interface CardingProtectionActionData {
    human_verification_token?: string;
}

declare interface Cart {
    id: string;
    customerId: number;
    currency: Currency;
    email: string;
    isTaxIncluded: boolean;
    baseAmount: number;
    /**
     * This is the total amount of discount applied on line_items.
     */
    discountAmount: number;
    cartAmount: number;
    /**
     * This is an array of all applied coupons.
     */
    coupons: Coupon[];
    /**
     * This is the total amount of discount applied on cart including coupons and line_items discounts.
     */
    discounts: Discount[];
    lineItems: LineItemMap;
    createdTime: string;
    updatedTime: string;
    source?: CartSource;
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

/**
 * This error is thrown when the server detects inconsistency in cart data since it is last requested,
 * for example, product prices or eligible discounts have changed.
 */
declare class CartConsistencyError extends StandardError {
    constructor(message?: string);
}

declare interface CartSelector {
    getCart(): Cart | undefined;
    getCartOrThrow(): Cart;
    getLoadError(): Error | undefined;
    isLoading(): boolean;
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
    fees: Fee[];
}

declare interface CheckoutButtonDataState {
    initializedContainers: {
        [key: string]: boolean;
    };
}

declare class CheckoutButtonErrorSelector {
    private _checkoutButton;
    getInitializeButtonError(methodId?: CheckoutButtonMethodType): Error | undefined;
    getDeinitializeButtonError(methodId?: CheckoutButtonMethodType): Error | undefined;
}

declare interface CheckoutButtonErrorsState {
    initializeError?: Error;
    deinitializeError?: Error;
}

declare type CheckoutButtonInitializeOptions = BaseCheckoutButtonInitializeOptions & WithAmazonPayV2ButtonInitializeOptions & WithApplePayButtonInitializeOptions & WithBigCommercePaymentsButtonInitializeOptions & WithBigCommercePaymentsPayLaterButtonInitializeOptions & WithBigCommercePaymentsAlternativeMethodsButtonInitializeOptions & WithBigCommercePaymentsVenmoButtonInitializeOptions & WithBoltButtonInitializeOptions & WithBraintreePaypalButtonInitializeOptions & WithBraintreePaypalCreditButtonInitializeOptions & WithGooglePayButtonInitializeOptions & WithPayPalCommerceButtonInitializeOptions & WithPayPalCommerceCreditButtonInitializeOptions & WithPayPalCommerceVenmoButtonInitializeOptions & WithPayPalCommerceAlternativeMethodsButtonInitializeOptions;

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
    GOOGLEPAY_WORLDPAYACCESS = "googlepayworldpayaccess",
    MASTERPASS = "masterpass",
    PAYPALEXPRESS = "paypalexpress"
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

declare interface CheckoutButtonSelector {
    getState(): CheckoutButtonState;
    isInitializing(methodId?: CheckoutButtonMethodType): boolean;
    isInitialized(methodId: CheckoutButtonMethodType, containerId?: string): boolean;
    isDeinitializing(methodId?: CheckoutButtonMethodType): boolean;
    getInitializeError(methodId?: CheckoutButtonMethodType): Error | undefined;
    getDeinitializeError(methodId?: CheckoutButtonMethodType): Error | undefined;
}

declare interface CheckoutButtonSelectors {
    errors: CheckoutButtonErrorSelector;
    statuses: CheckoutButtonStatusSelector;
}

declare interface CheckoutButtonState {
    data: {
        [key in CheckoutButtonMethodType]?: CheckoutButtonDataState | undefined;
    };
    errors: {
        [key in CheckoutButtonMethodType]?: CheckoutButtonErrorsState | undefined;
    };
    statuses: {
        [key in CheckoutButtonMethodType]?: CheckoutButtonStatusesState | undefined;
    };
}

declare class CheckoutButtonStatusSelector {
    private _checkoutButton;
    isInitializingButton(methodId?: CheckoutButtonMethodType): boolean;
    isDeinitializingButton(methodId?: CheckoutButtonMethodType): boolean;
}

declare interface CheckoutButtonStatusesState {
    isInitializing?: boolean;
    isDeinitializing?: boolean;
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

declare interface CheckoutSelector {
    getCheckout(): Checkout | undefined;
    getCheckoutOrThrow(): Checkout;
    getOutstandingBalance(useStoreCredit?: boolean): number | undefined;
    getLoadError(): Error | undefined;
    getUpdateError(): Error | undefined;
    isExecutingSpamCheck(): boolean;
    isLoading(): boolean;
    isUpdating(): boolean;
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
    private _storeProjection;
    private _extensionMessenger;
    private _extensionEventBroadcaster;
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
    private _extensionActionCreator;
    private _workerExtensionMessenger;
    private _errorTransformer;
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
     * Loads a list of payment methods for given ids.
     *
     *
     * Once the method is executed successfully, you can call
     * `CheckoutStoreSelector#getPaymentMethods` to retrieve the list of payment
     * methods.
     *
     * ```js
     * const state = service.loadPaymentMethodsById(['applepay']);
     *
     * console.log(state.data.getPaymentMethodOrThrow('applepay'));
     * ```
     *
     * @param methodIds - The identifier for the payment methods to load.
     * @param options - Options for loading the payment methods that are
     * available to the current customer.
     * @returns A promise that resolves to the current state.
     */
    loadPaymentMethodByIds(methodIds: string[], options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Initializes the payment step of a checkout process.
     *
     * Before a payment method can accept payment details, it must first be
     * initialized. Some payment methods require you to provide additional
     * initialization options. For example, you can provide an element ID for
     * Amazon Pay if you want users to be able to select a different payment
     * method by clicking on the element.
     *
     * ```js
     * await service.initializePayment({
     *     methodId: 'amazonpay',
     *     amazonpay: {
     *         editButtonId: 'edit-button',
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
     *     methodId: 'amazonpay',
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
     * @param query - Options for loading the available shipping countries.
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
     * Some payment methods, such as Amazon Pay, have their own sign-in flow. In
     * order to support them, this method must be called.
     *
     * ```js
     * await service.initializeCustomer({
     *     methodId: 'amazonpay',
     *     amazonpay: {
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
     *     methodId: 'amazonpay',
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
     * Some payment methods, such as Amazon Pay, can provide shipping
     * information to be used for checkout. In order to support them, this
     * method must be called.
     *
     * ```js
     * await service.initializeShipping({
     *     methodId: 'amazonpay',
     *     amazonpay: {
     *         editAddressButtonId: 'changeAddressButton',
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
     *     methodId: 'amazonpay',
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
     * Loads a list of extensions available for checkout.
     *
     * ```js
     * const state = await service.loadExtensions();
     *
     * console.log(state.data.getExtensions());
     * ```
     *
     * @alpha
     * @param options - Options for loading the extensions that are
     * available to the current customer.
     * @returns A promise that resolves to the current state.
     */
    loadExtensions(options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Renders an extension for a checkout extension region.
     * Currently, only one extension is allowed per region.
     *
     * @alpha
     * @param container - The ID of a container which the extension should be inserted.
     * @param region - The name of an area where the extension should be presented.
     * @returns A promise that resolves to the current state.
     */
    renderExtension(container: string, region: ExtensionRegion): Promise<CheckoutSelectors>;
    /**
     * Clear cache for a checkout extension when removing it from UI.
     * This function should be used whenver an extension is removed from the UI.
     *
     * @alpha
     * @param region - The name of an area where the extension should be presented.
     */
    clearExtensionCache(region: ExtensionRegion): void;
    /**
     * Posts a message to a checkout extension.
     *
     * @alpha
     * @param extensionId - The ID of an extension to post the event to.
     * @param message - The message to post to an extension.
     */
    postMessageToExtension(extensionId: string, message: ExtensionMessage): void;
    /**
     * Manages the command handler for an extension.
     *
     * @alpha
     * @param extensionId - The ID of the extension sending the command.
     * @param command - The command to be handled.
     * @param handler - The handler function for the extension command.
     * @returns A function that, when called, will deregister the command handler.
     */
    handleExtensionCommand<T extends keyof ExtensionCommandMap>(extensionId: string, command: T, handler: (command: ExtensionCommandMap[T]) => Promise<void> | void): () => void;
    /**
     * Manages the query handler for an extension.
     *
     * @alpha
     * @param extensionId - The ID of the extension sending the query.
     * @param query - The query to be handled.
     * @param handler - The handler function for the extension query.
     * @returns A function that, when called, will deregister the query handler.
     */
    handleExtensionQuery<T extends keyof ExtensionQueryMap>(extensionId: string, query: T, handler: (command: ExtensionQueryMap[T]) => Promise<void> | void): () => void;
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
    checkoutUserExperienceSettings: UserExperienceSettings;
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
    isExpressPrivacyPolicy: boolean;
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
    shouldRedirectToStorefrontForAuth: boolean;
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
    getSubmitOrderError(): Error | CartChangedError | CartConsistencyError | undefined;
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
    /**
     * Returns an error if unable to fetch extensions.
     *
     * @alpha
     * @returns The error object if unable to fetch extensions, otherwise undefined.
     */
    getLoadExtensionsError(): Error | undefined;
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
    /**
     * Gets user experience settings.
     *
     * @returns The object of user experience settings if it is loaded, otherwise undefined.
     */
    getUserExperienceSettings(): UserExperienceSettings | undefined;
    /**
     * Gets a list of extensions available for checkout.
     *
     * @alpha
     * @returns The list of extensions if it is loaded, otherwise undefined.
     */
    getExtensions(): Extension[] | undefined;
    /**
     * Gets payment provider customers data.
     *
     * @alpha
     * @returns The object with payment provider customer data
     */
    getPaymentProviderCustomer(): PaymentProviderCustomer | undefined;
    /**
     * Gets the extension associated with a given region.
     *
     * @alpha
     * @param region - A checkout extension region.
     * @returns The extension corresponding to the specified region, otherwise undefined.
     */
    getExtensionByRegion(region: ExtensionRegion): Extension | undefined;
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
     * Checks whether a wallet button is initialized.
     *
     * @param methodId - The identifier of the payment method to check.
     * @returns True if the wallet button method is initialized, otherwise false.
     */
    isInitializedCustomer(methodId?: string): boolean;
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

declare interface Config {
    context: ContextConfig;
    customization: CustomizationConfig;
    storeConfig: StoreConfig;
}

declare interface ConfigSelector {
    getConfig(): Config | undefined;
    getFlashMessages(type?: FlashMessageType): FlashMessage[] | undefined;
    getStoreConfig(): StoreConfig | undefined;
    getStoreConfigOrThrow(): StoreConfig;
    getContextConfig(): ContextConfig | undefined;
    getExternalSource(): string | undefined;
    getHost(): string | undefined;
    getLocale(): string | undefined;
    getVariantIdentificationToken(): string | undefined;
    getLoadError(): Error | undefined;
    isLoading(): boolean;
}

declare interface Consignment {
    id: string;
    address: Address;
    shippingAddress: Address;
    discounts: ConsignmentDiscount[];
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

declare interface ConsignmentAutomaticDiscount extends ConsignmentDiscountBase<'AUTOMATIC'> {
}

declare interface ConsignmentCouponDiscount extends ConsignmentDiscountBase<'COUPON'> {
    couponId: number;
    couponCode: string;
}

declare interface ConsignmentCreateRequestBody {
    address?: AddressRequestBody;
    shippingAddress?: AddressRequestBody;
    lineItems: ConsignmentLineItem[];
    pickupOption?: ConsignmentPickupOption;
}

declare type ConsignmentDiscount = ConsignmentAutomaticDiscount | ConsignmentCouponDiscount;

declare interface ConsignmentDiscountBase<T> {
    id: number;
    amount: number;
    type: T;
}

declare interface ConsignmentLineItem {
    itemId: string | number;
    quantity: number;
}

declare interface ConsignmentPickupOption {
    pickupMethodId: number;
}

declare interface ConsignmentSelector {
    getConsignments(): Consignment[] | undefined;
    getConsignmentsOrThrow(): Consignment[];
    getConsignmentById(id: string): Consignment | undefined;
    getConsignmentByAddress(address: AddressRequestBody): Consignment | undefined;
    getShippingOption(): ShippingOption | undefined;
    getLoadError(): Error | undefined;
    getCreateError(): Error | undefined;
    getLoadShippingOptionsError(): Error | undefined;
    getUnassignedItems(): PhysicalItem[];
    getUpdateError(consignmentId?: string): Error | undefined;
    getDeleteError(consignmentId?: string): Error | undefined;
    getItemAssignmentError(address: AddressRequestBody): Error | undefined;
    getUpdateShippingOptionError(consignmentId?: string): Error | undefined;
    isLoading(): boolean;
    isLoadingShippingOptions(): boolean;
    isCreating(): boolean;
    isUpdating(consignmentId?: string): boolean;
    isDeleting(consignmentId?: string): boolean;
    isAssigningItems(address: AddressRequestBody): boolean;
    isUpdatingShippingOption(consignmentId?: string): boolean;
}

declare interface ConsignmentUpdateRequestBody {
    id: string;
    address?: AddressRequestBody;
    shippingAddress?: AddressRequestBody;
    lineItems?: ConsignmentLineItem[];
    pickupOption?: ConsignmentPickupOption;
    shippingOptionId?: string;
}

declare interface ConsignmentsChangedEvent {
    type: ExtensionEventType.ConsignmentsChanged;
    payload: {
        consignments: Consignment[];
        previousConsignments: Consignment[];
    };
}

declare type ConsignmentsRequestBody = ConsignmentCreateRequestBody[];

declare interface ContextConfig {
    checkoutId?: string;
    geoCountryCode: string;
    flashMessages: FlashMessage[];
    payment: {
        formId?: string;
        token?: string;
    };
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

declare interface CountrySelector {
    getCountries(): Country[] | undefined;
    getLoadError(): Error | undefined;
    isLoading(): boolean;
}

declare interface Coupon {
    id: string;
    displayName: string;
    code: string;
    couponType: string;
    discountedAmount: number;
}

declare interface CouponSelector {
    getCoupons(): Coupon[] | undefined;
    getRemoveError(): RequestError | undefined;
    getApplyError(): RequestError | undefined;
    isApplying(): boolean;
    isRemoving(): boolean;
}

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
declare interface CreditCardPaymentInitializeOptions_2 {
    form: HostedFormOptions;
    bigpayToken?: string;
}

declare interface CreditCardPlaceHolder {
    encryptedCardNumber?: string;
    encryptedExpiryDate?: string;
    encryptedSecurityCode: string;
}

/**
 * This object is used to pass custom fonts when creating an [Elements](https://stripe.com/docs/js/elements_object/create) object.
 */
declare interface CssFontSource {
    /**
     * A relative or absolute URL pointing to a CSS file with [@font-face](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face) definitions, for example:
     * `https://fonts.googleapis.com/css?family=Open+Sans`
     * Note that if you are using a [content security policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) (CSP),
     * [additional directives](https://stripe.com/docs/security#content-security-policy) may be necessary.
     */
    cssSrc: string;
}

declare interface CssProperties {
    background?: string;
    caretColor?: string;
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

declare interface CustomError extends Error {
    message: string;
    type: string;
    subtype?: string;
}

/**
 * This object is used to pass custom fonts when creating an [Elements](https://stripe.com/docs/js/elements_object/create) object.
 */
declare interface CustomFontSource {
    /**
     * The name to give the font.
     */
    family: string;
    /**
     * A valid [src](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/src) value pointing to your
     * custom font file. This is usually (though not always) a link to a file with a .woff , .otf, or .svg suffix.
     */
    src: string;
    /**
     * A valid [font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display) value.
     */
    display?: string;
    /**
     * One of normal, italic, oblique. Defaults to normal.
     */
    style?: string;
    /**
     * A valid [unicode-range](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range) value.
     */
    unicodeRange?: string;
    /**
     * A valid [font-weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight). Note that this is a string, not a number.
     */
    weight?: string;
}

declare interface CustomItem {
    id: string;
    listPrice: number;
    extendedListPrice: number;
    name: string;
    quantity: number;
    sku: string;
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

declare type CustomerInitializeOptions = BaseCustomerInitializeOptions & WithAmazonPayV2CustomerInitializeOptions & WithApplePayCustomerInitializeOptions & WithBigCommercePaymentsCustomerInitializeOptions & WithBigCommercePaymentsFastlaneCustomerInitializeOptions & WithBigCommercePaymentsPayLaterCustomerInitializeOptions & WithBigCommercePaymentsVenmoCustomerInitializeOptions & WithBoltCustomerInitializeOptions & WithBraintreePaypalCustomerInitializeOptions & WithBraintreePaypalCreditCustomerInitializeOptions & WithBraintreeFastlaneCustomerInitializeOptions & WithGooglePayCustomerInitializeOptions & WithPayPalCommerceCustomerInitializeOptions & WithPayPalCommerceCreditCustomerInitializeOptions & WithPayPalCommerceVenmoCustomerInitializeOptions & WithPayPalCommerceFastlaneCustomerInitializeOptions & WithStripeUPECustomerInitializeOptions;

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

declare interface CustomerSelector {
    getCustomer(): Customer | undefined;
    getCustomerOrThrow(): Customer;
    getCreateAccountError(): Error | undefined;
    isCreatingCustomerAccount(): boolean;
    getCreateAddressError(): Error | undefined;
    isCreatingCustomerAddress(): boolean;
}

declare interface CustomerStrategySelector {
    getSignInError(methodId?: string): Error | undefined;
    getSignOutError(methodId?: string): Error | undefined;
    getExecutePaymentMethodCheckoutError(methodId?: string): Error | undefined;
    getInitializeError(methodId?: string): Error | undefined;
    getWidgetInteractionError(methodId?: string): Error | undefined;
    isSigningIn(methodId?: string): boolean;
    isSigningOut(methodId?: string): boolean;
    isExecutingPaymentMethodCheckout(methodId?: string): boolean;
    isInitializing(methodId?: string): boolean;
    isInitialized(methodId: string): boolean;
    isWidgetInteracting(methodId?: string): boolean;
}

declare interface CustomizationConfig {
    languageData: any[];
}

declare interface DeprecatedPayPalCommerceCreditCardsPaymentInitializeOptions {
    /**
     * The form is data for Credit Card Form
     */
    form?: HostedFormOptions;
    /**
     * The callback that gets called when there is an issue with rendering credit card fields
     */
    onCreditCardFieldsRenderingError?: (error: unknown) => void;
}

declare class DetachmentObserver {
    private _mutationObserver;
    constructor(_mutationObserver: MutationObserverFactory);
    ensurePresence<T>(targets: Node[], promise: Promise<T>): Promise<T>;
}

declare interface DigitalItem extends LineItem {
    downloadFileUrls: string[];
    downloadPageUrl: string;
    downloadSize: string;
}

declare interface Discount {
    id: string;
    discountedAmount: number;
}

declare interface DisplaySettings {
    hidePriceFromGuests: boolean;
}

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

declare interface Extension {
    id: string;
    name: string;
    region: ExtensionRegion;
    url: string;
    type: ExtensionType;
}

declare interface ExtensionCommandMap {
    [ExtensionCommandType.ReloadCheckout]: ReloadCheckoutCommand;
    [ExtensionCommandType.ShowLoadingIndicator]: ShowLoadingIndicatorCommand;
    [ExtensionCommandType.SetIframeStyle]: SetIframeStyleCommand;
    [ExtensionCommandType.ReRenderShippingForm]: ReRenderShippingForm;
}

export declare enum ExtensionCommandType {
    ReloadCheckout = "EXTENSION:RELOAD_CHECKOUT",
    ShowLoadingIndicator = "EXTENSION:SHOW_LOADING_INDICATOR",
    SetIframeStyle = "EXTENSION:SET_IFRAME_STYLE",
    ReRenderShippingForm = "EXTENSION:RE_RENDER_SHIPPING_FORM"
}

declare type ExtensionEvent = ConsignmentsChangedEvent;

declare enum ExtensionEventType {
    ConsignmentsChanged = "EXTENSION:CONSIGNMENTS_CHANGED"
}

declare type ExtensionMessage = ExtensionEvent | GetConsignmentsMessage;

declare const enum ExtensionMessageType {
    GetConsignments = "EXTENSION:GET_CONSIGNMENTS"
}

export declare interface ExtensionQueryMap {
    [ExtensionQueryType.GetConsignments]: GetConsignmentsQuery;
}

export declare enum ExtensionQueryType {
    GetConsignments = "EXTENSION:GET_CONSIGNMENTS"
}

declare const enum ExtensionRegion {
    ShippingShippingAddressFormBefore = "shipping.shippingAddressForm.before",
    ShippingShippingAddressFormAfter = "shipping.shippingAddressForm.after",
    ShippingSelectedShippingMethod = "shipping.selectedShippingMethod",
    PaymentPaymentMethodListBefore = "payment.paymentMethodList.before",
    SummaryAfter = "summary.after",
    SummaryLastItemAfter = "summary.lastItem.after",
    GlobalWebWorker = "global"
}

declare interface ExtensionSelector {
    getExtensions(): Extension[] | undefined;
    getExtensionByRegion(region: ExtensionRegion): Extension | undefined;
    getLoadError(): Error | undefined;
    isLoading(): boolean;
}

declare const enum ExtensionType {
    Iframe = "iframe",
    Worker = "worker"
}

declare interface Fee {
    id: string;
    type: string;
    name: string;
    displayName: string;
    cost: number;
    source: string;
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
    inputDateFormat?: string;
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

declare type FormFieldType = 'array' | 'date' | 'integer' | 'string';

declare interface FormFields {
    customerAccount: FormField[];
    shippingAddress: FormField[];
    billingAddress: FormField[];
}

declare interface FormSelector {
    getShippingAddressFields(countries: Country[] | undefined, countryCode: string): FormField[];
    getBillingAddressFields(countries: Country[] | undefined, countryCode: string): FormField[];
    getCustomerAccountFields(): FormField[];
    getLoadError(): Error | undefined;
    isLoading(): boolean;
}

declare interface GatewayOrderPayment extends OrderPayment {
    detail: {
        step: string;
        instructions: string;
    };
    mandate?: {
        id: string;
        url?: string;
        mandateText?: {
            [key: string]: string;
        };
    };
}

declare interface GetConsignmentsMessage {
    type: ExtensionMessageType.GetConsignments;
    payload: {
        consignments: Consignment[];
    };
}

declare interface GetConsignmentsQuery {
    type: ExtensionQueryType.GetConsignments;
    payload?: {
        useCache?: boolean;
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

declare interface GiftCertificateSelector {
    getGiftCertificates(): GiftCertificate[] | undefined;
    getRemoveError(): RequestError<StorefrontErrorResponseBody> | undefined;
    getApplyError(): RequestError<StorefrontErrorResponseBody> | undefined;
    isApplying(): boolean;
    isRemoving(): boolean;
}

declare type GooglePayButtonColor = 'default' | 'black' | 'white';

declare interface GooglePayButtonInitializeOptions {
    /**
     * All Google Pay payment buttons exist in two styles: dark (default) and light.
     * To provide contrast, use dark buttons on light backgrounds and light buttons on dark or colorful backgrounds.
     */
    buttonColor?: GooglePayButtonColor;
    /**
     * Variant buttons:
     * book: The "Book with Google Pay" payment button.
     * buy: The "Buy with Google Pay" payment button.
     * checkout: The "Checkout with Google Pay" payment button.
     * donate: The "Donate with Google Pay" payment button.
     * order: The "Order with Google Pay" payment button.
     * pay: The "Pay with Google Pay" payment button.
     * plain: The Google Pay payment button without the additional text (default).
     * subscribe: The "Subscribe with Google Pay" payment button.
     *
     * Note: "long" and "short" button types have been renamed to "buy" and "plain", but are still valid button types
     * for backwards compatability.
     */
    buttonType?: GooglePayButtonType;
}

declare type GooglePayButtonType = 'book' | 'buy' | 'checkout' | 'donate' | 'order' | 'pay' | 'plain' | 'subscribe' | 'long' | 'short';

declare interface GooglePayCustomerInitializeOptions {
    /**
     * This container is used to set an event listener, provide an element ID if you want users to be able to launch
     * the GooglePay wallet modal by clicking on a button. It should be an HTML element.
     */
    container: string;
    /**
     * All Google Pay payment buttons exist in two styles: dark (default) and light.
     * To provide contrast, use dark buttons on light backgrounds and light buttons on dark or colorful backgrounds.
     */
    buttonColor?: GooglePayButtonColor;
    /**
     * Variant buttons:
     * book: The "Book with Google Pay" payment button.
     * buy: The "Buy with Google Pay" payment button.
     * checkout: The "Checkout with Google Pay" payment button.
     * donate: The "Donate with Google Pay" payment button.
     * order: The "Order with Google Pay" payment button.
     * pay: The "Pay with Google Pay" payment button.
     * plain: The Google Pay payment button without the additional text (default).
     * subscribe: The "Subscribe with Google Pay" payment button.
     *
     * Note: "long" and "short" button types have been renamed to "buy" and "plain", but are still valid button types
     * for backwards compatability.
     */
    buttonType?: GooglePayButtonType;
    /**
     * A callback that gets called when GooglePay fails to initialize or
     * selects a payment option.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: Error): void;
    /**
     * Callback that get called on wallet button click
     */
    onClick?(): void;
}

/**
 * The recognized keys to pass the initialization options for Google Pay.
 */
declare enum GooglePayKey {
    ADYEN_V2 = "googlepayadyenv2",
    ADYEN_V3 = "googlepayadyenv3",
    AUTHORIZE_NET = "googlepayauthorizenet",
    BNZ = "googlepaybnz",
    BRAINTREE = "googlepaybraintree",
    PAYPAL_COMMERCE = "googlepaypaypalcommerce",
    BIGCOMMERCE_PAYMENTS = "googlepay_bigcommerce_payments",
    CHECKOUT_COM = "googlepaycheckoutcom",
    CYBERSOURCE_V2 = "googlepaycybersourcev2",
    ORBITAL = "googlepayorbital",
    STRIPE = "googlepaystripe",
    STRIPE_UPE = "googlepaystripeupe",
    STRIPE_OCS = "googlepaystripeocs",
    WORLDPAY_ACCESS = "googlepayworldpayaccess",
    TD_ONLINE_MART = "googlepaytdonlinemart"
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
     * A container for loading spinner.
     */
    loadingContainerId?: string;
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

declare class GoogleRecaptcha {
    private googleRecaptchaScriptLoader;
    private mutationObserverFactory;
    private _event$?;
    private _recaptcha?;
    private _memoized;
    private _widgetId?;
    constructor(googleRecaptchaScriptLoader: GoogleRecaptchaScriptLoader, mutationObserverFactory: MutationObserverFactory);
    load(containerId: string, sitekey: string): Promise<void>;
    reset(containerId: string): void;
    execute(): Observable<RecaptchaResult>;
    private _watchRecaptchaChallengeWindow;
}

declare class GoogleRecaptchaScriptLoader {
    private _scriptLoader;
    private _window;
    private _loadPromise?;
    constructor(_scriptLoader: ScriptLoader, _window?: GoogleRecaptchaWindow);
    load(): Promise<ReCaptchaV2.ReCaptcha | undefined>;
    private _loadScript;
}

declare interface GoogleRecaptchaWindow extends Window {
    grecaptcha?: ReCaptchaV2.ReCaptcha;
    initRecaptcha?(): void;
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

declare type HostedCreditCardInstrument = Omit<CreditCardInstrument, 'ccExpiry' | 'ccName' | 'ccNumber' | 'ccCvv'>;

declare class HostedField {
    private _type;
    private _containerId;
    private _placeholder;
    private _accessibilityLabel;
    private _styles;
    private _eventPoster;
    private _eventListener;
    private _detachmentObserver;
    private _cardInstrument?;
    private _iframe;
    constructor(_type: HostedFieldType, _containerId: string, _placeholder: string, _accessibilityLabel: string, _styles: HostedFieldStylesMap, _eventPoster: IframeEventPoster<HostedFieldEvent>, _eventListener: IframeEventListener<HostedInputEventMap>, _detachmentObserver: DetachmentObserver, _cardInstrument?: CardInstrument | undefined);
    getType(): HostedFieldType;
    attach(): Promise<void>;
    detach(): void;
    submitForm(fields: HostedFieldType[], data: HostedFormOrderData): Promise<HostedInputSubmitSuccessEvent>;
    submitStoredCardForm(fields: StoredCardHostedFormInstrumentFields, data: StoredCardHostedFormData): Promise<HostedInputStoredCardSucceededEvent>;
    validateForm(): Promise<void>;
    private _getFontUrls;
    private _isSubmitErrorEvent;
}

declare interface HostedFieldAttachEvent {
    type: HostedFieldEventType.AttachRequested;
    payload: {
        accessibilityLabel?: string;
        cardInstrument?: CardInstrument;
        fontUrls?: string[];
        placeholder?: string;
        styles?: HostedFieldStylesMap;
        origin?: string;
        type: HostedFieldType;
    };
}

declare type HostedFieldBlurEventData = HostedInputBlurEvent['payload'];

declare type HostedFieldCardTypeChangeEventData = HostedInputCardTypeChangeEvent['payload'];

declare type HostedFieldEnterEventData = HostedInputEnterEvent['payload'];

declare type HostedFieldEvent = HostedFieldAttachEvent | HostedFieldSubmitRequestEvent | HostedFieldValidateRequestEvent | HostedFieldStoredCardRequestEvent;

declare enum HostedFieldEventType {
    AttachRequested = "HOSTED_FIELD:ATTACH_REQUESTED",
    SubmitRequested = "HOSTED_FIELD:SUBMITTED_REQUESTED",
    ValidateRequested = "HOSTED_FIELD:VALIDATE_REQUESTED",
    StoredCardRequested = "HOSTED_FIELD:STORED_CARD_REQUESTED"
}

declare type HostedFieldFocusEventData = HostedInputFocusEvent['payload'];

declare type HostedFieldOptionsMap = HostedCardFieldOptionsMap | HostedStoredCardFieldOptionsMap;

declare interface HostedFieldStoredCardRequestEvent {
    type: HostedFieldEventType.StoredCardRequested;
    payload: {
        data: StoredCardHostedFormData;
        fields: StoredCardHostedFormInstrumentFields;
    };
}

declare type HostedFieldStyles = HostedInputStyles;

declare interface HostedFieldStylesMap {
    default?: HostedFieldStyles;
    error?: HostedFieldStyles;
    focus?: HostedFieldStyles;
}

declare interface HostedFieldSubmitRequestEvent {
    type: HostedFieldEventType.SubmitRequested;
    payload: {
        data: HostedFormOrderData;
        fields: HostedFieldType[];
    };
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

declare interface HostedFieldValidateRequestEvent {
    type: HostedFieldEventType.ValidateRequested;
}

declare class HostedForm implements HostedFormInterface {
    private _fields;
    private _eventListener;
    private _payloadTransformer;
    private _eventCallbacks;
    private _paymentHumanVerificationHandler;
    private _bin?;
    private _cardType?;
    constructor(_fields: HostedField[], _eventListener: IframeEventListener<HostedInputEventMap>, _payloadTransformer: HostedFormOrderDataTransformer, _eventCallbacks: HostedFormEventCallbacks, _paymentHumanVerificationHandler: PaymentHumanVerificationHandler);
    getBin(): string | undefined;
    getCardType(): string | undefined;
    attach(): Promise<void>;
    detach(): void;
    submit(payload: OrderPaymentRequestBody, additionalActionData?: PaymentAdditionalAction): Promise<HostedInputSubmitSuccessEvent>;
    submitStoredCard(payload: {
        fields: StoredCardHostedFormInstrumentFields;
        data: StoredCardHostedFormData;
    }): Promise<HostedInputStoredCardSucceededEvent | void>;
    validate(): Promise<void>;
    private _getFirstField;
    private _handleEnter;
}

declare interface HostedFormErrorData {
    isEmpty: boolean;
    isPotentiallyValid: boolean;
    isValid: boolean;
}

declare type HostedFormErrorDataKeys = 'number' | 'expirationDate' | 'expirationMonth' | 'expirationYear' | 'cvv' | 'postalCode';

declare type HostedFormErrorsData = Partial<Record<HostedFormErrorDataKeys, HostedFormErrorData>>;

declare type HostedFormEventCallbacks = Pick<LegacyHostedFormOptions, 'onBlur' | 'onCardTypeChange' | 'onFocus' | 'onEnter' | 'onValidate'>;

declare class HostedFormFactory {
    private _store;
    constructor(_store: ReadableCheckoutStore);
    create(host: string, options: LegacyHostedFormOptions): HostedForm;
    private _getCardInstrument;
}

declare interface HostedFormOrderData {
    additionalAction?: PaymentAdditionalAction;
    authToken: string;
    checkout?: Checkout;
    config?: Config;
    order?: Order;
    orderMeta?: OrderMeta;
    payment?: (HostedCreditCardInstrument | HostedVaultedInstrument) & PaymentInstrumentMeta;
    paymentMethod?: PaymentMethod;
    paymentMethodMeta?: PaymentMethodMeta;
}

declare class HostedFormOrderDataTransformer {
    private _store;
    constructor(_store: ReadableCheckoutStore);
    transform(payload: OrderPaymentRequestBody, additionalAction?: PaymentAdditionalAction): HostedFormOrderData;
}

declare interface HostedInputAttachErrorEvent {
    type: HostedInputEventType.AttachFailed;
    payload: {
        error: HostedInputInitializeErrorData;
    };
}

declare interface HostedInputAttachSuccessEvent {
    type: HostedInputEventType.AttachSucceeded;
}

declare interface HostedInputBinChangeEvent {
    type: HostedInputEventType.BinChanged;
    payload: {
        bin?: string;
    };
}

declare interface HostedInputBlurEvent {
    type: HostedInputEventType.Blurred;
    payload: {
        fieldType: HostedFieldType;
        errors?: HostedFormErrorsData;
    };
}

declare interface HostedInputCardTypeChangeEvent {
    type: HostedInputEventType.CardTypeChanged;
    payload: {
        cardType?: string;
    };
}

declare interface HostedInputChangeEvent {
    type: HostedInputEventType.Changed;
    payload: {
        fieldType: HostedFieldType;
    };
}

declare interface HostedInputEnterEvent {
    type: HostedInputEventType.Entered;
    payload: {
        fieldType: HostedFieldType;
    };
}

declare interface HostedInputEventMap {
    [HostedInputEventType.AttachSucceeded]: HostedInputAttachSuccessEvent;
    [HostedInputEventType.AttachFailed]: HostedInputAttachErrorEvent;
    [HostedInputEventType.BinChanged]: HostedInputBinChangeEvent;
    [HostedInputEventType.Blurred]: HostedInputBlurEvent;
    [HostedInputEventType.Changed]: HostedInputChangeEvent;
    [HostedInputEventType.CardTypeChanged]: HostedInputCardTypeChangeEvent;
    [HostedInputEventType.Entered]: HostedInputEnterEvent;
    [HostedInputEventType.Focused]: HostedInputFocusEvent;
    [HostedInputEventType.SubmitSucceeded]: HostedInputSubmitSuccessEvent;
    [HostedInputEventType.SubmitFailed]: HostedInputSubmitErrorEvent;
    [HostedInputEventType.Validated]: HostedInputValidateEvent;
    [HostedInputEventType.StoredCardFailed]: HostedInputStoredCardErrorEvent;
    [HostedInputEventType.StoredCardSucceeded]: HostedInputStoredCardSucceededEvent;
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
    Validated = "HOSTED_INPUT:VALIDATED",
    StoredCardSucceeded = "HOSTED_INPUT:STORED_CARD_SUCCEEDED",
    StoredCardFailed = "HOSTED_INPUT:STORED_CARD_FAILED"
}

declare interface HostedInputFocusEvent {
    type: HostedInputEventType.Focused;
    payload: {
        fieldType: HostedFieldType;
    };
}

declare interface HostedInputInitializeErrorData {
    message: string;
    redirectUrl: string;
}

declare interface HostedInputStoredCardErrorEvent {
    type: HostedInputEventType.StoredCardFailed;
    payload?: {
        errors?: string[];
        error?: PaymentErrorData;
        response?: Response<PaymentErrorResponseBody>;
    };
}

declare interface HostedInputStoredCardSucceededEvent {
    type: HostedInputEventType.StoredCardSucceeded;
}

declare type HostedInputStyles = Partial<Pick<CSSStyleDeclaration, 'color' | 'fontFamily' | 'fontSize' | 'fontWeight'>>;

declare interface HostedInputSubmitErrorEvent {
    type: HostedInputEventType.SubmitFailed;
    payload: {
        error: PaymentErrorData;
        response?: Response<PaymentErrorResponseBody>;
    };
}

declare interface HostedInputSubmitSuccessEvent {
    type: HostedInputEventType.SubmitSucceeded;
    payload: {
        response: Response<unknown>;
    };
}

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

declare type HostedVaultedInstrument = Omit<VaultedInstrument, 'ccNumber' | 'ccCvv'>;

declare interface IbanElementOptions extends BaseElementOptions {
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

declare interface IdealElementOptions extends BaseElementOptions {
    value?: string;
    /**
     * Hides the icon in the Element. Default is false.
     */
    hideIcon?: boolean;
}

declare interface IdealStateData {
    issuer: string;
}

declare interface IframeEvent<TType = string, TPayload = any> {
    type: TType;
    payload?: TPayload;
}

declare class IframeEventListener<TEventMap extends IframeEventMap<keyof TEventMap>, TContext = undefined> {
    private _isListening;
    private _listeners;
    private _sourceOrigins;
    constructor(sourceOrigin: string);
    listen(): void;
    stopListen(): void;
    addListener<TType extends keyof TEventMap>(type: TType, listener: (event: TEventMap[TType], context?: TContext) => void): void;
    removeListener<TType extends keyof TEventMap>(type: TType, listener: (event: TEventMap[TType], context?: TContext) => void): void;
    trigger<TType extends keyof TEventMap>(event: TEventMap[TType], context?: TContext): void;
    private _handleMessage;
}

declare type IframeEventMap<TType extends string | number | symbol = string> = {
    [key in TType]: IframeEvent<TType>;
};

declare interface IframeEventPostOptions<TSuccessEvent extends IframeEvent, TErrorEvent extends IframeEvent> {
    errorType?: TErrorEvent['type'];
    successType?: TSuccessEvent['type'];
}

declare class IframeEventPoster<TEvent, TContext = undefined> {
    private _targetWindow?;
    private _context?;
    private _targetOrigin;
    constructor(targetOrigin: string, _targetWindow?: Window | undefined, _context?: TContext | undefined);
    post(event: TEvent): void;
    post<TSuccessEvent extends IframeEvent = IframeEvent, TErrorEvent extends IframeEvent = IframeEvent>(event: TEvent, options: IframeEventPostOptions<TSuccessEvent, TErrorEvent>): Promise<TSuccessEvent>;
    setTarget(window: Window): void;
    setContext(context: TContext): void;
}

declare interface IndividualCardElementOptions {
    cardCvcElementOptions: CardCvcElementOptions;
    cardExpiryElementOptions: CardExpiryElementOptions;
    cardNumberElementOptions: CardNumberElementOptions;
    zipCodeElementOptions?: ZipCodeElementOptions;
}

declare interface InitCallbackActions {
    disable(): void;
    enable(): void;
}

declare interface InitCallbackActions_2 {
    disable(): void;
    enable(): void;
}

declare interface InitiaizedQuery {
    methodId: string;
    gatewayId?: string;
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

declare interface InputStyles extends BlockElementStyles {
    active?: BlockElementStyles;
    error?: InputStyles;
    focus?: BlockElementStyles;
    hover?: BlockElementStyles;
    disabled?: BlockElementStyles;
}

declare type Instrument = CardInstrument;

declare type InstrumentMeta = VaultAccessToken;

declare interface InstrumentSelector {
    getCardInstrument(instrumentId: string): CardInstrument | undefined;
    getCardInstrumentOrThrow(instrumentId: string): CardInstrument;
    getInstruments(): PaymentInstrument[] | undefined;
    getInstrumentsByPaymentMethod(paymentMethod: PaymentMethod): PaymentInstrument[] | undefined;
    getInstrumentsMeta(): InstrumentMeta | undefined;
    getLoadError(): Error | undefined;
    getDeleteError(instrumentId?: string): Error | undefined;
    isLoading(): boolean;
    isDeleting(instrumentId?: string): boolean;
}

declare interface InternalAddress<T = string> {
    id?: T;
    firstName: string;
    lastName: string;
    company: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    province: string;
    provinceCode: string;
    postCode: string;
    country: string;
    countryCode: string;
    phone: string;
    customFields: Array<{
        fieldId: string;
        fieldValue: string | number | string[];
    }>;
    type?: string;
}

declare interface InternalCheckoutSelectors {
    billingAddress: BillingAddressSelector;
    cart: CartSelector;
    checkout: CheckoutSelector;
    checkoutButton: CheckoutButtonSelector;
    config: ConfigSelector;
    consignments: ConsignmentSelector;
    countries: CountrySelector;
    coupons: CouponSelector;
    customer: CustomerSelector;
    customerStrategies: CustomerStrategySelector;
    extensions: ExtensionSelector;
    form: FormSelector;
    giftCertificates: GiftCertificateSelector;
    instruments: InstrumentSelector;
    order: OrderSelector;
    orderBillingAddress: OrderBillingAddressSelector;
    payment: PaymentSelector;
    paymentMethods: PaymentMethodSelector;
    paymentStrategies: PaymentStrategySelector;
    paymentProviderCustomer: PaymentProviderCustomerSelector;
    pickupOptions: PickupOptionSelector;
    remoteCheckout: RemoteCheckoutSelector;
    shippingAddress: ShippingAddressSelector;
    shippingCountries: ShippingCountrySelector;
    shippingStrategies: ShippingStrategySelector;
    signInEmail: SignInEmailSelector;
    subscriptions: SubscriptionsSelector;
    storeCredit: StoreCreditSelector;
}

declare interface InternalOrderMeta {
    deviceFingerprint?: string;
}

declare interface InternalOrderPayment {
    id?: string;
    gateway?: string;
    redirectUrl?: string;
    returnUrl?: string;
    status?: string;
    helpText?: string;
}

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
    /**
     * @hidden This property is intended for toggling an experimental change only.
     */
    isCspNonceExperimentEnabled?: boolean;
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
    private _isCspNonceExperimentEnabled;
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
    private _isFormatError;
    private _escapeSpecialCharacters;
}

declare interface LegacyHostedFormOptions {
    fields: HostedFieldOptionsMap;
    styles?: HostedFieldStylesMap;
    onBlur?(data: HostedFieldBlurEventData): void;
    onCardTypeChange?(data: HostedFieldCardTypeChangeEventData): void;
    onEnter?(data: HostedFieldEnterEventData): void;
    onFocus?(data: HostedFieldFocusEventData): void;
    onValidate?(data: HostedFieldValidateEventData): void;
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
    retailPrice: number;
    comparisonPrice: number;
    extendedListPrice: number;
    extendedSalePrice: number;
    extendedComparisonPrice: number;
    socialMedia?: LineItemSocialData[];
    options?: LineItemOption[];
    addedByPromotion: boolean;
    parentId?: string | null;
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
     * users to be able to launch the Masterpass wallet modal by clicking on a button.
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

declare interface MutationObeserverCreator {
    prototype: MutationObserver;
    new (callback: MutationCallback): MutationObserver;
}

declare class MutationObserverFactory {
    private _window;
    constructor(_window?: MutationObserverWindow);
    create(callback: MutationCallback): MutationObserver;
}

declare interface MutationObserverWindow extends Window {
    MutationObserver: MutationObeserverCreator;
}

declare interface NonceInstrument {
    nonce: string;
    shouldSaveInstrument?: boolean;
    shouldSetAsDefaultInstrument?: boolean;
    deviceSessionId?: string;
    tokenType?: string;
}

declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

declare interface Option {
    pickupMethod: PickupMethod;
    itemQuantities: Item;
}

declare interface Order {
    baseAmount: number;
    billingAddress: OrderBillingAddress;
    cartId: string;
    coupons: Coupon[];
    consignments: OrderConsignment;
    currency: Currency_2;
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
    fees: OrderFee[];
}

declare interface OrderBillingAddress extends Address {
    email?: string;
}

declare interface OrderBillingAddressSelector {
    getOrderBillingAddress(): OrderBillingAddress | undefined;
}

declare interface OrderConsignment {
    shipping: OrderShippingConsignment[];
}

declare interface OrderFee {
    id: number;
    type: string;
    customerDisplayName: string;
    cost: number;
    source: string;
}

declare type OrderMeta = OrderMetaState;

declare interface OrderMetaState extends InternalOrderMeta {
    token?: string;
    orderToken?: string;
    callbackUrl?: string;
    payment?: InternalOrderPayment;
}

declare interface OrderPayment {
    providerId: string;
    gatewayId?: string;
    methodId?: string;
    paymentId?: string;
    description: string;
    amount: number;
}

declare type OrderPaymentInstrument = WithBankAccountInstrument | WithEcpInstrument | WithSepaInstrument | WithPayByBankInstrument | WithIdealInstrument | CreditCardInstrument | HostedInstrument | HostedCreditCardInstrument | HostedVaultedInstrument | NonceInstrument | VaultedInstrument | (CreditCardInstrument & WithDocumentInstrument) | (CreditCardInstrument & WithCheckoutcomFawryInstrument) | (CreditCardInstrument & WithCheckoutcomSEPAInstrument) | (CreditCardInstrument & WithIdealInstrument) | (HostedInstrument & WithMollieIssuerInstrument) | WithAccountCreation;

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

declare interface OrderSelector {
    getOrder(): Order | undefined;
    getOrderOrThrow(): Order;
    getOrderMeta(): OrderMetaState | undefined;
    getLoadError(): Error | undefined;
    getPaymentId(methodId: string): string | undefined;
    isLoading(): boolean;
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
    discounts: OrderShippingConsignmentDiscount[];
}

declare interface OrderShippingConsignmentDiscount {
    id: number;
    amount: number;
    code: string | null;
}

declare interface PasswordRequirements {
    alpha: string;
    numeric: string;
    minlength: number;
    error: string;
}

declare interface PayPalButtonStyleOptions {
    color?: StyleButtonColor;
    shape?: StyleButtonShape;
    height?: number;
    label?: StyleButtonLabel;
}

declare interface PayPalButtonStyleOptions_2 {
    color?: StyleButtonColor_2;
    shape?: StyleButtonShape_3;
    height?: number;
    label?: StyleButtonLabel_2;
}

/**
 *
 * BigCommerce Payments BuyNow
 *
 */
declare interface PayPalBuyNowInitializeOptions {
    getBuyNowCartRequestBody(): BuyNowCartRequestBody;
}

/**
 *
 * PayPal Commerce BuyNow
 *
 */
declare interface PayPalBuyNowInitializeOptions_2 {
    getBuyNowCartRequestBody(): BuyNowCartRequestBody;
}

declare interface PayPalCommerceAlternativeMethodsButtonOptions {
    /**
     * Alternative payment method id what used for initialization PayPal button as funding source.
     */
    apm: string;
    /**
     * The options that required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions_2;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions_2;
    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
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
 *     gatewayId: 'paypalcommercealternativemethods',
 *     methodId: 'sepa',
 *     paypalcommercealternativemethods: {
 *         container: '#container',
 *         apmFieldsContainer: '#apm-fields-container',
 *         apmFieldsStyles: {
 *             base: {
 *                 backgroundColor: 'transparent',
 *             },
 *             input: {
 *                 backgroundColor: 'white',
 *                 fontSize: '1rem',
 *                 color: '#333',
 *                 borderColor: '#d9d9d9',
 *                 borderRadius: '4px',
 *                 borderWidth: '1px',
 *                 padding: '1rem',
 *             },
 *             invalid: {
 *                 color: '#ed6a6a',
 *             },
 *             active: {
 *                 color: '#4496f6',
 *             },
 *         },
 *         clientId: 'YOUR_CLIENT_ID',
 * // Callback for submitting payment form that gets called when a buyer approves PayPal payment
 *         submitForm: () => {
 *         // Example function
 *             this.submitOrder(
 *                {
 *                   payment: { methodId: 'paypalcommercealternativemethods', }
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
declare interface PayPalCommerceAlternativeMethodsPaymentOptions {
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
    apmFieldsStyles?: PayPalCommerceFieldsStyleOptions;
    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: Error | unknown): void;
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
     * when buyer approved PayPal account.
     */
    submitForm(): void;
    /**
     * A callback that gets called
     * when Smart Payment Button is initialized.
     */
    onInitButton(actions: InitCallbackActions_2): Promise<void>;
}

declare interface PayPalCommerceAnalyticTrackerService {
    customerPaymentMethodExecuted(): void;
    paymentComplete(): void;
    selectedPaymentMethod(methodId: string): void;
    walletButtonClick(methodId: string): void;
}

/**
 * A set of options that are required to initialize PayPalCommerce in cart or product details page.
 *
 * When PayPalCommerce is initialized, an PayPalCommerce button will be inserted into the
 * DOM. When a customer clicks on it, it will trigger Apple sheet.
 */
declare interface PayPalCommerceButtonInitializeOptions {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions_2;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions_2;
    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

declare interface PayPalCommerceCreditButtonInitializeOptions {
    /**
     * The ID of a container which the messaging should be inserted.
     */
    messagingContainerId?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions_2;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions_2;
    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
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
 *     methodId: 'paypalcommercecreditcard',
 *     paypalcommercecreditcard: {
 *         form: {
 *             fields: {
 *                 cardNumber: { containerId: 'card-number' },
 *                 cardName: { containerId: 'card-name' },
 *                 cardExpiry: { containerId: 'card-expiry' },
 *                 cardCode: { containerId: 'card-code' },
 *             },
 *         },
 *         onCreditCardFieldsRenderingError: (error) => handleError(error),
 *     },
 * });
 * ```
 *
 * Additional options can be passed in to customize the fields and register
 * event callbacks.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalcommercecreditcard',
 *     paypalcommercecreditcard: {
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
 *         onCreditCardFieldsRenderingError: (error) => handleError(error),
 *     },
 * });
 * ```
 */
declare interface PayPalCommerceCreditCardsPaymentInitializeOptions {
    /**
     * The form is data for Credit Card Form
     */
    form: HostedFormOptions;
    /**
     * The callback that gets called when there is an issue with rendering credit card fields
     */
    onCreditCardFieldsRenderingError?: (error: unknown) => void;
}

declare interface PayPalCommerceCreditCustomerInitializeOptions {
    /**
     * The ID of a container which the checkout button should be inserted into.
     */
    container: string;
    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error?: Error): void;
    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
    /**
     * A callback that gets called when paypal button clicked.
     */
    onClick?(): void;
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
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalcommercecredit',
 *     paypalcommercecredit: {
 *         container: '#container',
 * // Callback for submitting payment form that gets called when a buyer approves PayPal payment
 *         submitForm: () => {
 *         // Example function
 *             this.submitOrder(
 *                {
 *                   payment: { methodId: 'paypalcommercecredit', }
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
declare interface PayPalCommerceCreditPaymentInitializeOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container?: string;
    /**
     * The location to insert the Pay Later Messages.
     */
    bannerContainerId?: string;
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
    onValidate?(resolve: () => void, reject: () => void): Promise<void>;
    /**
     * A callback for submitting payment form that gets called
     * when buyer approved PayPal account.
     */
    submitForm?(): void;
}

/**
 * A set of options that are required to initialize the customer step of
 * checkout to support PayPalCommerce.
 */
declare interface PayPalCommerceCustomerInitializeOptions {
    /**
     * The ID of a container which the checkout button should be inserted into.
     */
    container: string;
    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error?: Error): void;
    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
    /**
     * A callback that gets called when paypal button clicked.
     */
    onClick?(): void;
}

/**
 * A set of options that are optional to initialize the PayPalCommerce Fastlane customer strategy
 * that are responsible for PayPalCommerce Fastlane components styling and initialization
 *
 * ```js
 * service.initializeCustomer({
 *     methodId: 'paypalcommerceacceleratedcheckout', // PayPalCommerce Fastlane has 'paypalcommerceacceleratedcheckout' method id
 *     paypalcommercefastlane: {
 *         styles: {
 *              root: {
 *                  backgroundColorPrimary: 'transparent',
 *                  errorColor: '#C40B0B',
 *                  fontFamily: 'Montserrat, Helvetica, Arial, sans-serif',
 *              },
 *              input: {
 *                  borderRadius: '0.25rem',
 *                  borderColor: '#9E9E9E',
 *                  focusBorderColor: '#4496F6',
 *              },
 *              toggle: {
 *                  colorPrimary: '#0F005E',
 *                  colorSecondary: '#ffffff',
 *              },
 *              text: {
 *                  body: {
 *                      color: '#222222',
 *                      fontSize: '1rem',
 *                  },
 *                  caption: {
 *                      color: '#515151',
 *                      fontSize: '0.875rem',
 *                  },
 *              },
 *              branding: 'light',
 *         },
 *     },
 * });
 * ```
 */
declare interface PayPalCommerceFastlaneCustomerInitializeOptions {
    /**
     * Is a stylisation options for customizing PayPal Fastlane components
     *
     * Note: the styles for all PayPalCommerce Fastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter which strategy was initialised first
     */
    styles?: PayPalFastlaneStylesOption_2;
}

/**
 * A set of options that are required to initialize the PayPalCommerce Accelerated Checkout payment
 * method for presenting on the page.
 *
 *
 * Also, PayPalCommerce requires specific options to initialize PayPal Fastlane Card Component
 * ```html
 * <!-- This is where the PayPal Fastlane Card Component will be inserted -->
 * <div id="container"></div>
 * ```
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalcommerceacceleratedcheckout', // PayPal Fastlane has 'paypalcommerceacceleratedcheckout' method id
 *     paypalcommercefastlane: {
 *         onInit: (renderPayPalCardComponent) => renderPayPalCardComponent('#container-id'),
 *         onChange: (showPayPalCardSelector) => showPayPalCardSelector(),
 *         styles: {
 *              root: {
 *                  backgroundColorPrimary: 'transparent',
 *                  errorColor: '#C40B0B',
 *                  fontFamily: 'Montserrat, Helvetica, Arial, sans-serif',
 *              },
 *              input: {
 *                  borderRadius: '0.25rem',
 *                  borderColor: '#9E9E9E',
 *                  focusBorderColor: '#4496F6',
 *              },
 *              toggle: {
 *                  colorPrimary: '#0F005E',
 *                  colorSecondary: '#ffffff',
 *              },
 *              text: {
 *                  body: {
 *                      color: '#222222',
 *                      fontSize: '1rem',
 *                  },
 *                  caption: {
 *                      color: '#515151',
 *                      fontSize: '0.875rem',
 *                  },
 *              },
 *              branding: 'light',
 *         },
 *     },
 * });
 * ```
 */
declare interface PayPalCommerceFastlanePaymentInitializeOptions {
    /**
     * Is a callback that takes the CSS selector of a container
     * where the PayPal Fastlane form should be inserted into.
     */
    onInit?: (renderPayPalCardComponent: (container: string) => void) => void;
    /**
     * Is a callback that shows PayPal stored instruments
     * when get triggered
     */
    onChange?: (showPayPalCardSelector: () => Promise<CardInstrument_2 | undefined>) => void;
    /**
     * Is a stylisation options for customizing PayPal Fastlane components
     *
     * Note: the styles for all PayPalCommerceFastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: PayPalFastlaneStylesOption_2;
}

/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support PayPal Commerce Fastlane.
 */
declare interface PayPalCommerceFastlaneShippingInitializeOptions {
    /**
     * Is a stylisation options for customizing PayPal Fastlane components
     *
     * Note: the styles for all PayPal Commerce Fastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: PayPalFastlaneStylesOption_2;
    /**
     * Is a callback that shows PayPal Fastlane popup with customer addresses
     * when get triggered
     */
    onPayPalFastlaneAddressChange?: (showPayPalFastlaneAddressSelector: () => Promise<CustomerAddress_2 | undefined>) => void;
}

declare interface PayPalCommerceFieldsStyleOptions {
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
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalcommerce',
 *     paypalcommerce: {
 *         container: '#container',
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
declare interface PayPalCommercePaymentInitializeOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container: string;
    /**
     * If there is no need to initialize the Smart Payment Button, simply pass false as the option value.
     * The default value is true
     */
    shouldRenderPayPalButtonOnInitialization?: boolean;
    /**
     * A callback for getting form fields values.
     */
    getFieldsValues?(): HostedInstrument_2;
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
     * when buyer approved PayPal account.
     */
    submitForm(): void;
}

declare interface PayPalCommerceVenmoButtonInitializeOptions {
    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions_2;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * The options that required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions_2;
    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

declare interface PayPalCommerceVenmoCustomerInitializeOptions {
    /**
     * The ID of a container which the checkout button should be inserted into.
     */
    container: string;
    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error?: Error): void;
    /**
     * A callback that gets called when paypal button clicked.
     */
    onClick?(): void;
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
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalcommercevenmo',
 *     paypalcommercevenmo: {
 *         container: '#container',
 * // Callback for submitting payment form that gets called when a buyer approves PayPal payment
 *         submitForm: () => {
 *         // Example function
 *             this.submitOrder(
 *                {
 *                   payment: { methodId: 'paypalcommercevenmo', }
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
declare interface PayPalCommerceVenmoPaymentInitializeOptions {
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
     * when buyer approved PayPal account.
     */
    submitForm(): void;
}

declare interface PayPalInstrument extends BaseAccountInstrument {
    externalId: string;
    method: 'paypal';
}

declare interface PaymentAdditionalAction {
    type: string;
    data: CardingProtectionActionData;
}

declare class PaymentHumanVerificationHandler {
    private _googleRecaptcha;
    constructor(_googleRecaptcha: GoogleRecaptcha);
    handle(error: any): Promise<PaymentAdditionalAction>;
    handle(id: string, key: string): Promise<PaymentAdditionalAction>;
    private handleWithPaymentHumanVerificationRequestError;
    private handleWithRecaptchaSitekey;
    private _performRecaptcha;
    private _initialize;
    private _isPaymentHumanVerificationRequest;
}

declare type PaymentInitializeOptions = BasePaymentInitializeOptions & WithAdyenV3PaymentInitializeOptions & WithAdyenV2PaymentInitializeOptions & WithAmazonPayV2PaymentInitializeOptions & WithApplePayPaymentInitializeOptions & WithBigCommercePaymentsPaymentInitializeOptions & WithBigCommercePaymentsFastlanePaymentInitializeOptions & WithBigCommercePaymentsPayLaterPaymentInitializeOptions & WithBigCommercePaymentsRatePayPaymentInitializeOptions & WithBigCommercePaymentsCreditCardsPaymentInitializeOptions & WithBigCommercePaymentsAlternativeMethodsPaymentInitializeOptions & WithBigCommercePaymentsVenmoPaymentInitializeOptions & WithBlueSnapDirectAPMPaymentInitializeOptions & WithBoltPaymentInitializeOptions & WithBraintreeAchPaymentInitializeOptions & WithBraintreeLocalMethodsPaymentInitializeOptions & WithBraintreeFastlanePaymentInitializeOptions & WithCreditCardPaymentInitializeOptions & WithGooglePayPaymentInitializeOptions & WithMolliePaymentInitializeOptions & WithPayPalCommercePaymentInitializeOptions & WithPayPalCommerceCreditPaymentInitializeOptions & WithPayPalCommerceVenmoPaymentInitializeOptions & WithPayPalCommerceAlternativeMethodsPaymentInitializeOptions & WithPayPalCommerceCreditCardsPaymentInitializeOptions & WithPayPalCommerceRatePayPaymentInitializeOptions & WithPayPalCommerceFastlanePaymentInitializeOptions & WithSquareV2PaymentInitializeOptions & WithStripeV3PaymentInitializeOptions & WithStripeUPEPaymentInitializeOptions & WithStripeOCSPaymentInitializeOptions & WithWorldpayAccessPaymentInitializeOptions;

declare type PaymentInstrument = CardInstrument | AccountInstrument;

declare interface PaymentInstrumentMeta {
    deviceSessionId?: string;
}

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
    showCardHolderName?: boolean;
    testMode?: boolean;
}

declare interface PaymentMethodMeta {
    deviceSessionId: string;
    sessionHash: string;
}

declare interface PaymentMethodSelector {
    getPaymentMethods(): PaymentMethod[] | undefined;
    getPaymentMethodsMeta(): PaymentMethodMeta | undefined;
    getPaymentMethod(methodId: string, gatewayId?: string): PaymentMethod | undefined;
    getPaymentMethodOrThrow(methodId: string, gatewayId?: string): PaymentMethod;
    getLoadError(): Error | undefined;
    getLoadMethodError(methodId?: string): Error | undefined;
    isLoading(): boolean;
    isLoadingMethod(methodId?: string): boolean;
}

declare type PaymentProviderCustomer = PaymentProviderCustomerType;

declare interface PaymentProviderCustomerSelector {
    getPaymentProviderCustomer(): PaymentProviderCustomer | undefined;
    getPaymentProviderCustomerOrThrow(): PaymentProviderCustomer;
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

declare interface PaymentSelector {
    getPaymentId(): {
        providerId: string;
        gatewayId?: string;
    } | undefined;
    getPaymentIdOrThrow(): {
        providerId: string;
        gatewayId?: string;
    };
    getPaymentStatus(): string | undefined;
    getPaymentStatusOrThrow(): string;
    getPaymentToken(): string | undefined;
    getPaymentTokenOrThrow(): string;
    getPaymentRedirectUrl(): string | undefined;
    getPaymentRedirectUrlOrThrow(): string;
    isPaymentDataRequired(useStoreCredit?: boolean): boolean;
    isPaymentDataSubmitted(paymentMethod?: PaymentMethod): boolean;
}

declare interface PaymentSettings {
    bigpayBaseUrl: string;
    clientSidePaymentProviders: string[];
}

declare interface PaymentStrategySelector {
    getInitializeError(methodId?: string): Error | undefined;
    getExecuteError(methodId?: string): Error | undefined;
    getFinalizeError(methodId?: string): Error | undefined;
    getWidgetInteractingError(methodId?: string): Error | undefined;
    isInitializing(methodId?: string): boolean;
    isInitialized(query: InitiaizedQuery): boolean;
    isExecuting(methodId?: string): boolean;
    isFinalizing(methodId?: string): boolean;
    isWidgetInteracting(methodId?: string): boolean;
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
    style?: Pick<PaypalStyleOptions, 'layout' | 'size' | 'color' | 'label' | 'shape' | 'tagline' | 'fundingicons'>;
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
    BLACK = "black",
    WHITE = "white"
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

declare interface PaypalCommerceRatePay {
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
        ratepayBirthDate: BirthDate_2;
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

declare interface PaypalStyleOptions {
    layout?: PaypalButtonStyleLayoutOption;
    size?: PaypalButtonStyleSizeOption;
    color?: PaypalButtonStyleColorOption;
    label?: PaypalButtonStyleLabelOption;
    shape?: PaypalButtonStyleShapeOption;
    tagline?: boolean;
    fundingicons?: boolean;
    height?: number;
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
    options: Option[];
}

declare interface PickupOptionSelector {
    getPickupOptions(consignmentId: string, searchArea: SearchArea): PickupOptionResult[] | undefined;
    getLoadError(): Error | undefined;
    isLoading(): boolean;
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

declare interface ReRenderShippingForm {
    type: ExtensionCommandType.ReRenderShippingForm;
}

declare type ReadableCheckoutStore = ReadableDataStore<InternalCheckoutSelectors>;

declare interface RecaptchaResult {
    error?: Error;
    token?: string;
}

declare interface Region {
    code: string;
    name: string;
}

declare interface ReloadCheckoutCommand {
    type: ExtensionCommandType.ReloadCheckout;
}

declare interface RemoteCheckoutSelector {
    getCheckout<TMethodId extends keyof RemoteCheckoutStateData>(methodId: TMethodId): RemoteCheckoutStateData[TMethodId] | undefined;
}

declare interface RemoteCheckoutStateData {
    amazon?: AmazonPayRemoteCheckout;
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
    constructor(response?: Response<TBody | {}>, { message, errors, }?: {
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

declare interface SepaStateData {
    ownerName: string;
    ibanNumber: string;
}

declare interface SetIframeStyleCommand {
    type: ExtensionCommandType.SetIframeStyle;
    payload: {
        style: {
            [key: string]: string | number | null;
        };
    };
}

declare interface ShippingAddressSelector {
    getShippingAddress(): Address | undefined;
    getShippingAddressOrThrow(): Address;
    getShippingAddresses(): Address[];
    getShippingAddressesOrThrow(): Address[];
}

declare interface ShippingCountrySelector {
    getShippingCountries(): Country[] | undefined;
    getLoadError(): Error | undefined;
    isLoading(): boolean;
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
     * when using AmazonPayV2.
     */
    amazonpay?: AmazonPayV2ShippingInitializeOptions;
    /**
     * The options that are required to initialize the shipping step of checkout
     * when using Stripe Upe Link.
     */
    stripeupe?: StripeUPEShippingInitializeOptions;
    /**
     * The options that are required to initialize the shipping step of checkout
     * when using Braintree Fastlane.
     */
    braintreefastlane?: BraintreeFastlaneShippingInitializeOptions;
    /**
     * The options that are required to initialize the shipping step of checkout
     * when using PayPal Commerce Fastlane.
     */
    paypalcommercefastlane?: PayPalCommerceFastlaneShippingInitializeOptions;
    /**
     * The options that are required to initialize the shipping step of checkout
     * when using BigCommercePayments Fastlane.
     */
    bigcommerce_payments_fastlane?: BigCommercePaymentsFastlaneShippingInitializeOptions;
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

declare interface ShippingStrategySelector {
    getUpdateAddressError(methodId?: string): Error | undefined;
    getSelectOptionError(methodId?: string): Error | undefined;
    getInitializeError(methodId?: string): Error | undefined;
    getWidgetInteractionError(methodId?: string): Error | undefined;
    isUpdatingAddress(methodId?: string): boolean;
    isSelectingOption(methodId?: string): boolean;
    isInitializing(methodId?: string): boolean;
    isInitialized(methodId: string): boolean;
    isWidgetInteracting(methodId?: string): boolean;
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

declare interface ShowLoadingIndicatorCommand {
    type: ExtensionCommandType.ShowLoadingIndicator;
    payload: {
        show: boolean;
    };
}

declare interface SignInEmail {
    sent_email: string;
    expiry: number;
}

declare interface SignInEmailRequestBody {
    email: string;
    redirectUrl?: string;
}

declare interface SignInEmailSelector {
    getEmail(): SignInEmail | undefined;
    getSendError(): Error | undefined;
    isSending(): boolean;
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
 * A set of options that are required to initialize the Square payment method.
 *
 * Once Square payment is initialized, an iframed payment element will be
 * inserted into the current page. These options provide a location, styling,
 * and a callback function that advises when it's safe to pay.
 *
 * @example
 *
 * ```html
 * <!-- These container is where the hosted (iframed) payment method element will be inserted -->
 * <div id="card-payment"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'squarev2',
 *     squarev2: {
 *         containerId: 'card-payment',
 *         style: {
 *             input: {
 *                 backgroundColor: '#F7F8F9',
 *                 color: '#373F4A',
 *                 fontFamily: 'Helvetica Neue',
 *                 fontSize: '16px',
 *                 fontWeight: 'normal'
 *             }
 *         },
 *         onValidationChange: (isReadyToPay: boolean) => {
 *             if (isReadyToPay) {
 *                 // Show or hide some component or message...
 *             }
 *         }
 *     },
 * });
 * ```
 */
declare interface SquareV2PaymentInitializeOptions {
    /**
     * The ID of a container which the payment widget should insert into.
     */
    containerId: string;
    /**
     * A map of .css classes and values that customize the style of the
     * input fields from the card element.
     *
     * For more information about applying custom styles to the card form, see
     * the available [CardClassSelectors](https://developer.squareup.com/reference/sdks/web/payments/objects/CardClassSelectors)
     * for styling.
     */
    style?: CardClassSelectors;
    /**
     * A callback that gets called when the validity of the
     * payment component changes.
     */
    onValidationChange?: (isReadyToPay: boolean) => void;
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

declare interface StoreCreditSelector {
    getApplyError(): RequestError | undefined;
    isApplying(): boolean;
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
    logoutLink: string;
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

declare interface StoredCardHostedFormBillingAddress {
    address1: string;
    address2?: string;
    city: string;
    postalCode: string;
    countryCode: string;
    company?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    stateOrProvinceCode?: string;
}

declare interface StoredCardHostedFormData {
    currencyCode: string;
    paymentsUrl: string;
    providerId: string;
    shopperId: string;
    storeHash: string;
    vaultToken: string;
}

declare interface StoredCardHostedFormInstrumentFields extends StoredCardHostedFormBillingAddress {
    defaultInstrument: boolean;
}

declare class StoredCardHostedFormService {
    protected _host: string;
    protected _hostedFormFactory: HostedFormFactory;
    protected _hostedForm?: HostedForm;
    constructor(_host: string, _hostedFormFactory: HostedFormFactory);
    submitStoredCard(fields: StoredCardHostedFormInstrumentFields, data: StoredCardHostedFormData): Promise<void>;
    initialize(options: LegacyHostedFormOptions): Promise<void>;
    deinitialize(): void;
}

/**
 * All available options are here https://stripe.com/docs/stripe-js/appearance-api#supported-css-properties
 */
declare interface StripeAppearanceOptions {
    variables?: Record<string, StripeAppearanceValues>;
    rules?: Record<string, Record<string, StripeAppearanceValues>>;
}

declare type StripeAppearanceValues = string | string[] | number | undefined;

declare type StripeCustomFont = CssFontSource | CustomFontSource;

declare interface StripeCustomerEvent extends StripeEvent {
    collapsed?: boolean;
    authenticated: boolean;
    value: {
        email: string;
    };
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

declare interface StripeElementUpdateOptions {
    shouldShowTerms?: boolean;
}

declare interface StripeEvent {
    complete: boolean;
    elementType: string;
    empty: boolean;
}

declare type StripeEventType = StripeShippingEvent | StripeCustomerEvent;

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
 *     gateway: 'stripeocs',
 *     id: 'optimized_checkout',
 *     stripeocs {
 *         containerId: 'container',
 *     },
 * });
 * ```
 */
declare interface StripeOCSPaymentInitializeOptions {
    /**
     * The location to insert the credit card number form field.
     */
    containerId: string;
    /**
     * Stripe OCS layout options
     */
    layout?: Record<string, string | number | boolean>;
    /**
     * Stripe OCS appearance options for styling the accordion.
     */
    appearance?: StripeAppearanceOptions;
    /**
     * Stripe OCS fonts options for styling the accordion.
     */
    fonts?: StripeCustomFont[];
    onError?(error?: Error): void;
    render(): void;
    initStripeElementUpdateTrigger?(updateTriggerFn: (payload: StripeElementUpdateOptions) => void): void;
    paymentMethodSelect?(id: string): void;
    handleClosePaymentMethod?(collapseElement: () => void): void;
}

declare interface StripeShippingEvent extends StripeEvent {
    mode?: string;
    isNewAddress?: boolean;
    phoneFieldRequired: boolean;
    value: {
        address: {
            city: string;
            country: string;
            line1: string;
            line2?: string;
            postal_code: string;
            state: string;
        };
        name?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
    };
    fields?: {
        phone: string;
    };
    display?: {
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
     *
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
    style?: Record<string, StripeAppearanceValues>;
    onError?(error?: Error): void;
    render(): void;
    initStripeElementUpdateTrigger?(updateTriggerFn: (payload: StripeElementUpdateOptions) => void): void;
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
     * Available countries configured on BC shipping setup.
     */
    availableCountries: string;
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
     * get styles from store theme
     */
    getStyles?(): {
        [key: string]: string;
    };
    /**
     * get the state code needed for shipping stripe element
     *
     * @param country
     * @param state
     */
    getStripeState(country: string, state: string, isStripeStateMappingDisabledForES?: boolean): string;
    /**
     * Set the Stripe experiments to be used in checkout-js components;
     * Stripe specific experiments broadcasts to SDK from payment provider configs request.
     *
     * @param experiments
     * @returns void
     */
    setStripeExperiments?(experiments: Record<string, boolean>): void;
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

declare enum StyleButtonColor_2 {
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

declare enum StyleButtonLabel_2 {
    paypal = "paypal",
    checkout = "checkout",
    buynow = "buynow",
    pay = "pay",
    installment = "installment"
}

declare enum StyleButtonShape {
    pill = "pill",
    rect = "rect"
}

declare enum StyleButtonShape_2 {
    Pill = "pill",
    Rect = "rect"
}

declare enum StyleButtonShape_3 {
    pill = "pill",
    rect = "rect"
}

declare enum StyleButtonSize {
    Small = "small",
    Medium = "medium",
    Large = "large"
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

declare interface Subscriptions {
    email: string;
    acceptsMarketingNewsletter: boolean;
    acceptsAbandonedCartEmails: boolean;
}

declare interface SubscriptionsSelector {
    getUpdateError(): Error | undefined;
    isUpdating(): boolean;
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

declare enum UntrustedShippingCardVerificationType {
    CVV = "cvv",
    PAN = "pan"
}

declare interface UserExperienceSettings {
    walletButtonsOnTop: boolean;
    floatingLabelEnabled: boolean;
}

declare interface VaultAccessToken {
    vaultAccessToken: string;
    vaultAccessExpiry: number;
}

declare interface VaultedInstrument {
    instrumentId: string;
    ccCvv?: string;
    ccNumber?: string;
}

declare interface WechatDataPaymentMethodState {
    paymentMethod: AdyenPaymentMethodState;
}

declare interface WechatState {
    data: WechatDataPaymentMethodState;
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

declare interface WithAmazonPayV2ButtonInitializeOptions {
    amazonpay?: AmazonPayV2ButtonInitializeOptions;
}

declare interface WithAmazonPayV2CustomerInitializeOptions {
    amazonpay?: AmazonPayV2CustomerInitializeOptions;
}

declare interface WithAmazonPayV2PaymentInitializeOptions {
    amazonpay?: AmazonPayV2PaymentInitializeOptions;
}

declare interface WithApplePayButtonInitializeOptions {
    applepay?: ApplePayButtonInitializeOptions;
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

declare interface WithBigCommercePaymentsAlternativeMethodsButtonInitializeOptions {
    bigcommerce_payments_apms?: BigCommercePaymentsAlternativeMethodsButtonInitializeOptions;
}

declare interface WithBigCommercePaymentsAlternativeMethodsPaymentInitializeOptions {
    bigcommerce_payments_apms?: BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions;
}

declare interface WithBigCommercePaymentsButtonInitializeOptions {
    bigcommerce_payments?: BigcommercePaymentsButtonInitializeOptions;
}

declare interface WithBigCommercePaymentsCreditCardsPaymentInitializeOptions {
    bigcommerce_payments_creditcards?: BigCommercePaymentsCreditCardsPaymentInitializeOptions;
}

declare interface WithBigCommercePaymentsCustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using BigCommercePayments.
     */
    bigcommerce_payments?: BigcommercePaymentsCustomerInitializeOptions;
}

declare interface WithBigCommercePaymentsFastlaneCustomerInitializeOptions {
    bigcommerce_payments_fastlane?: BigCommercePaymentsFastlaneCustomerInitializeOptions;
}

declare interface WithBigCommercePaymentsFastlanePaymentInitializeOptions {
    bigcommerce_payments_fastlane?: BigCommercePaymentsFastlanePaymentInitializeOptions;
}

declare interface WithBigCommercePaymentsPayLaterButtonInitializeOptions {
    bigcommerce_payments_paylater?: BigCommercePaymentsPayLaterButtonInitializeOptions;
}

declare interface WithBigCommercePaymentsPayLaterCustomerInitializeOptions {
    bigcommerce_payments_paylater?: BigCommercePaymentsPayLaterCustomerInitializeOptions;
}

declare interface WithBigCommercePaymentsPayLaterPaymentInitializeOptions {
    bigcommerce_payments_paylater?: BigCommercePaymentsPayLaterPaymentInitializeOptions;
}

declare interface WithBigCommercePaymentsPaymentInitializeOptions {
    bigcommerce_payments?: BigcommercePaymentsPaymentInitializeOptions;
}

declare interface WithBigCommercePaymentsRatePayPaymentInitializeOptions {
    bigcommerce_payments_ratepay?: BigCommercePaymentsRatePayPaymentInitializeOptions;
}

declare interface WithBigCommercePaymentsVenmoButtonInitializeOptions {
    bigcommerce_payments_venmo?: BigCommercePaymentsVenmoButtonInitializeOptions;
}

declare interface WithBigCommercePaymentsVenmoCustomerInitializeOptions {
    bigcommerce_payments_venmo?: BigCommercePaymentsVenmoCustomerInitializeOptions;
}

declare interface WithBigCommercePaymentsVenmoPaymentInitializeOptions {
    bigcommerce_payments_venmo?: BigCommercePaymentsVenmoPaymentInitializeOptions;
}

declare interface WithBlueSnapDirectAPMPaymentInitializeOptions {
    /**
     * The options that are required to initialize the Apple Pay payment
     * method. They can be omitted unless you need to support Apple Pay.
     */
    bluesnapdirect?: BlueSnapDirectAPMInitializeOptions;
}

declare interface WithBoltButtonInitializeOptions {
    /**
     * The options that are required to initialize the Bolt payment
     * method. They can be omitted unless you need to support Bolt.
     */
    bolt?: BoltButtonInitializeOptions;
}

declare interface WithBoltCustomerInitializeOptions {
    bolt?: BoltCustomerInitializeOptions;
}

declare interface WithBoltPaymentInitializeOptions {
    /**
     * The options that are required to initialize the Bolt payment
     * method. They can be omitted unless you need to support Bolt.
     */
    bolt?: BoltPaymentInitializeOptions;
}

declare interface WithBraintreeAchPaymentInitializeOptions {
    /**
     * The options that are required to initialize the Braintree ACH payment
     * method. They can be omitted unless you need to support Apple Pay.
     */
    braintreeach?: BraintreeAchInitializeOptions;
}

declare interface WithBraintreeFastlaneCustomerInitializeOptions {
    braintreefastlane?: BraintreeFastlaneCustomerInitializeOptions;
}

declare interface WithBraintreeFastlanePaymentInitializeOptions {
    braintreefastlane?: BraintreeFastlanePaymentInitializeOptions;
}

declare interface WithBraintreeLocalMethodsPaymentInitializeOptions {
    braintreelocalmethods?: BraintreeLocalMethodsPaymentInitializeOptions;
}

declare interface WithBraintreePaypalButtonInitializeOptions {
    /**
     * The options that are required to initialize Braintree PayPal wallet button on Product and Cart page.
     */
    braintreepaypal?: BraintreePaypalButtonInitializeOptions;
}

declare interface WithBraintreePaypalCreditButtonInitializeOptions {
    /**
     * The options that are required to initialize Braintree PayPal Credit wallet button on Product and Cart page.
     */
    braintreepaypalcredit?: BraintreePaypalCreditButtonInitializeOptions;
}

declare interface WithBraintreePaypalCreditCustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using Braintree PayPal.
     */
    braintreepaypalcredit?: BraintreePaypalCreditCustomerInitializeOptions;
}

declare interface WithBraintreePaypalCustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using Braintree PayPal.
     */
    braintreepaypal?: BraintreePaypalCustomerInitializeOptions;
}

declare interface WithBuyNowFeature extends AmazonPayV2ButtonConfig {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
}

declare interface WithCheckoutcomFawryInstrument {
    customerMobile: string;
    customerEmail: string;
}

declare interface WithCheckoutcomSEPAInstrument {
    iban: string;
    bic: string;
}

declare interface WithCreditCardPaymentInitializeOptions {
    creditCard?: CreditCardPaymentInitializeOptions_2;
}

declare interface WithDocumentInstrument {
    ccDocument: string;
}

/**
 * The options that are required to initialize the GooglePay payment method.
 * They can be omitted unless you need to support GooglePay.
 */
declare type WithGooglePayButtonInitializeOptions = {
    [k in GooglePayKey]?: GooglePayButtonInitializeOptions;
};

/**
 * The options that are required to initialize the GooglePay payment method.
 * They can be omitted unless you need to support GooglePay.
 */
declare type WithGooglePayCustomerInitializeOptions = {
    [k in GooglePayKey]?: GooglePayCustomerInitializeOptions;
};

/**
 * The options that are required to initialize the GooglePay payment method.
 * They can be omitted unless you need to support GooglePay.
 */
declare type WithGooglePayPaymentInitializeOptions = {
    [k in GooglePayKey]?: GooglePayPaymentInitializeOptions;
};

declare interface WithIdealInstrument {
    bic: string;
}

declare interface WithMollieIssuerInstrument {
    issuer: string;
    shopper_locale: string;
}

declare interface WithMolliePaymentInitializeOptions {
    /**
     * The options that are required to initialize the Mollie payment
     * method. They can be omitted unless you need to support Mollie.
     */
    mollie?: MolliePaymentInitializeOptions;
}

declare interface WithPayPalCommerceAlternativeMethodsButtonInitializeOptions {
    paypalcommercealternativemethods?: PayPalCommerceAlternativeMethodsButtonOptions;
}

declare interface WithPayPalCommerceAlternativeMethodsPaymentInitializeOptions {
    paypalcommerce?: PayPalCommerceAlternativeMethodsPaymentOptions;
    paypalcommercealternativemethods?: PayPalCommerceAlternativeMethodsPaymentOptions;
}

declare interface WithPayPalCommerceButtonInitializeOptions {
    paypalcommerce?: PayPalCommerceButtonInitializeOptions;
}

declare interface WithPayPalCommerceCreditButtonInitializeOptions {
    paypalcommercecredit?: PayPalCommerceCreditButtonInitializeOptions;
}

declare interface WithPayPalCommerceCreditCardsPaymentInitializeOptions {
    paypalcommercecreditcards?: PayPalCommerceCreditCardsPaymentInitializeOptions;
    paypalcommerce?: DeprecatedPayPalCommerceCreditCardsPaymentInitializeOptions;
}

declare interface WithPayPalCommerceCreditCustomerInitializeOptions {
    paypalcommercecredit?: PayPalCommerceCreditCustomerInitializeOptions;
}

declare interface WithPayPalCommerceCreditPaymentInitializeOptions {
    paypalcommerce?: PayPalCommerceCreditPaymentInitializeOptions;
    paypalcommercecredit?: PayPalCommerceCreditPaymentInitializeOptions;
}

declare interface WithPayPalCommerceCustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using PayPalCommerce.
     */
    paypalcommerce?: PayPalCommerceCustomerInitializeOptions;
}

declare interface WithPayPalCommerceFastlaneCustomerInitializeOptions {
    paypalcommercefastlane?: PayPalCommerceFastlaneCustomerInitializeOptions;
}

declare interface WithPayPalCommerceFastlanePaymentInitializeOptions {
    paypalcommercefastlane?: PayPalCommerceFastlanePaymentInitializeOptions;
}

declare interface WithPayPalCommercePaymentInitializeOptions {
    paypalcommerce?: PayPalCommercePaymentInitializeOptions;
}

declare interface WithPayPalCommerceRatePayPaymentInitializeOptions {
    paypalcommerceratepay?: PaypalCommerceRatePay;
}

declare interface WithPayPalCommerceVenmoButtonInitializeOptions {
    paypalcommercevenmo?: PayPalCommerceVenmoButtonInitializeOptions;
}

declare interface WithPayPalCommerceVenmoCustomerInitializeOptions {
    paypalcommercevenmo?: PayPalCommerceVenmoCustomerInitializeOptions;
}

declare interface WithPayPalCommerceVenmoPaymentInitializeOptions {
    paypalcommerce?: PayPalCommerceVenmoPaymentInitializeOptions;
    paypalcommercevenmo?: PayPalCommerceVenmoPaymentInitializeOptions;
}

declare interface WithSquareV2PaymentInitializeOptions {
    /**
     * The options that are required to initialize the Square payment method.
     * They can be omitted unless you need to support Square.
     */
    squarev2?: SquareV2PaymentInitializeOptions;
}

declare interface WithStripeOCSPaymentInitializeOptions {
    stripeupe?: StripeOCSPaymentInitializeOptions;
    stripeocs?: StripeOCSPaymentInitializeOptions;
}

declare interface WithStripeUPECustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using StripeUPE.
     */
    stripeupe?: StripeUPECustomerInitializeOptions;
}

declare interface WithStripeUPEPaymentInitializeOptions {
    stripeupe?: StripeUPEPaymentInitializeOptions;
}

declare interface WithStripeV3PaymentInitializeOptions {
    stripev3?: StripeV3PaymentInitializeOptions;
}

declare interface WithWorldpayAccessPaymentInitializeOptions {
    /**
     * The options that are required to initialize the Apple Pay payment
     * method. They can be omitted unless you need to support Apple Pay.
     */
    worldpay?: WorldpayAccessPaymentInitializeOptions;
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

/**
 * Creates an instance of `BodlService`.
 *
 * @remarks
 *
 * ```js
 * const bodlService = BodlService();
 * bodlService.checkoutBegin();
 *
 * ```
 *
 * @param subscribe - The callback function, what get a subscriber as a property, that subscribes to state changes.
 * @returns an instance of `BodlService`.
 */
export declare function createBodlService(subscribe: (subscriber: (state: CheckoutSelectors) => void) => void): BodlService;

/**
 * Creates an instance of `BraintreeAnalyticTrackerService`.
 *
 * @remarks
 * ```js
 * const checkoutService = createCheckoutService();
 * await checkoutService.loadCheckout();
 * const braintreeAnalyticTracker = createBraintreeAnalyticTracker(checkoutService);
 *
 * braintreeAnalyticTracker.customerPaymentMethodExecuted();
 * braintreeAnalyticTracker.paymentComplete();
 * braintreeAnalyticTracker.selectedPaymentMethod('applepay');
 * braintreeAnalyticTracker.walletButtonClick('paypal');
 * ```
 *
 * @returns an instance of `BraintreeAnalyticTrackerService`.
 */
export declare function createBraintreeAnalyticTracker(checkoutService: CheckoutService): BraintreeAnalyticTrackerService;

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
 * Creates an instance of `PayPalCommerceAnalyticTrackerService`.
 *
 * @remarks
 * ```js
 * const checkoutService = createCheckoutService();
 * await checkoutService.loadCheckout();
 * const paypalCommerceAnalyticTracker = createPayPalCommerceAnalyticTracker(checkoutService);
 *
 * paypalCommerceAnalyticTracker.customerPaymentMethodExecuted();
 * paypalCommerceAnalyticTracker.paymentComplete();
 * paypalCommerceAnalyticTracker.selectedPaymentMethod('applepay');
 * paypalCommerceAnalyticTracker.walletButtonClick('paypal');
 * ```
 *
 * @returns an instance of `PayPalCommerceAnalyticTrackerService`.
 */
export declare function createPayPalCommerceAnalyticTracker(checkoutService: CheckoutService): PayPalCommerceAnalyticTrackerService;

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

/**
 * Creates an instance of `StoredCardHostedFormService`.
 *
 *
 * @param host - Host url string parameter.
 * @returns An instance of `StoredCardHostedFormService`.
 */
export declare function createStoredCardHostedFormService(host: string): StoredCardHostedFormService;

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
