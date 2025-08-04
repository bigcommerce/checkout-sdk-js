/// <reference types="applepayjs" />
import { AddressRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { AdyenV2ScriptLoader } from '@bigcommerce/checkout-sdk/adyen-utils';
import { AdyenV3ScriptLoader } from '@bigcommerce/checkout-sdk/adyen-utils';
import { AmazonPayV2PaymentProcessor } from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import { AnalyticsExtraItemsManager } from '@bigcommerce/checkout-sdk/analytics';
import { BigCommercePaymentsFastlaneUtils } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import { BigCommercePaymentsIntent as BigCommercePaymentsIntent_2 } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import { BillingAddressRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { BraintreeError } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeFastlane } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeFastlaneStylesOption } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeFastlaneVaultedInstrument } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeFormOptions } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeHostWindow } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeIntegrationService } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeMessages } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeOrderStatusData } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeSdk } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeThreeDSecureOptions } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BrowserInfo } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { BuyNowCartRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CardInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CardinalThreeDSecureFlow } from '@bigcommerce/checkout-sdk/cardinal-integration';
import { CardinalThreeDSecureFlowV2 } from '@bigcommerce/checkout-sdk/cardinal-integration';
import { Cart } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CheckoutButtonStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CreditCardPaymentInitializeOptions } from '@bigcommerce/checkout-sdk/credit-card-integration';
import { CreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/credit-card-integration';
import { CustomerCredentials } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ExecutePaymentMethodCheckoutOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ExternalPaymentStrategy as ExternalPaymentStrategy_2 } from '@bigcommerce/checkout-sdk/external-integration';
import { FormPoster } from '@bigcommerce/form-poster';
import { HostedFieldOptionsMap } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { HostedForm } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { HostedFormOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { HostedInputValidateResults } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { HostedInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';
import { Omit } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { OrderPaymentRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalCommerceFastlaneUtils } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { PayPalCommerceSdk } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { PayPalFastlaneStylesOption } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import { PayPalFastlaneStylesOption as PayPalFastlaneStylesOption_2 } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { PayPalSdkHelper } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { RequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { RequestSender } from '@bigcommerce/request-sender';
import { Response } from '@bigcommerce/request-sender';
import { ScriptLoader } from '@bigcommerce/script-loader';
import { ShippingOption } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { StorefrontPaymentRequestSender } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { VaultedInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WithAdyenV2PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/adyen-utils';
import { WithAdyenV3PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/adyen-utils';
import { WithCreditCardPaymentInitializeOptions } from '@bigcommerce/checkout-sdk/credit-card-integration';

declare interface Address {
    city: string;
    country: string;
    line1: string;
    line2?: string;
    postal_code: string;
    state: string;
}

/**
 * Object definition for part of the data sent to confirm the PaymentIntent.
 * https://stripe.com/docs/api/payment_intents/confirm#confirm_payment_intent-shipping
 */
declare type AddressOptions = Partial<Address>;

/**
 * Object definition for part of the data sent to confirm the PaymentIntent.
 * https://stripe.com/docs/js/elements_object/create_payment_element
 */
declare interface AddressProperties {
    city?: AutoOrNever;
    country?: AutoOrNever;
    state?: AutoOrNever;
    postalCode?: AutoOrNever;
    line1?: AutoOrNever;
    line2?: AutoOrNever;
}

declare class AdyenV2PaymentStrategy implements PaymentStrategy {
    private _paymentIntegrationService;
    private _scriptLoader;
    private _adyenClient?;
    private _cardVerificationComponent?;
    private _componentState?;
    private _paymentComponent?;
    private _paymentInitializeOptions?;
    constructor(_paymentIntegrationService: PaymentIntegrationService, _scriptLoader: AdyenV2ScriptLoader);
    initialize(options: PaymentInitializeOptions & WithAdyenV2PaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _getAdyenClient;
    private _getPaymentInitializeOptions;
    private _getThreeDS2ChallengeWidgetSize;
    private _handleAction;
    private _mapAdyenPlaceholderData;
    private _mountCardVerificationComponent;
    private _mountPaymentComponent;
    private _processAdditionalAction;
    private _updateComponentState;
    private _validateCardData;
    private _mapCardErrors;
}

declare class Adyenv3PaymentStrategy implements PaymentStrategy {
    private _paymentIntegrationService;
    private _scriptLoader;
    private _adyenClient?;
    private _cardVerificationComponent?;
    private _componentState?;
    private _paymentComponent?;
    private _paymentInitializeOptions?;
    constructor(_paymentIntegrationService: PaymentIntegrationService, _scriptLoader: AdyenV3ScriptLoader);
    initialize(options: PaymentInitializeOptions & WithAdyenV3PaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _updateComponentState;
    private _getLocale;
    private _getAdyenClient;
    private _getPaymentInitializeOptions;
    private _handleAction;
    private _mapAdyenPlaceholderData;
    private _mountCardVerificationComponent;
    private _mountPaymentComponent;
    private _processAdditionalAction;
    private _validateCardData;
    private _mapCardErrors;
    private _mountElement;
}

declare interface Affirm {
    checkout: AffirmCheckout;
    ui: {
        error: {
            on(event: string, callback: () => void): void;
        };
        ready(callback: () => void): void;
    };
}

declare interface AffirmAddress {
    name: {
        first: string;
        last: string;
        full?: string;
    };
    address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        zipcode: string;
        country?: string;
    };
    phone_number?: string;
    email?: string;
}

declare interface AffirmCallback {
    onFail(onFail: AffirmFailResponse): void;
    onSuccess(success: AffirmSuccessResponse): void;
}

declare interface AffirmCheckout {
    (options: AffirmRequestData): void;
    open(modalOptions: AffirmCallback): void;
    init(): void;
}

declare interface AffirmDiscount {
    [key: string]: {
        discount_amount: number;
        discount_display_name: string;
    };
}

declare interface AffirmFailResponse {
    reason: string;
}

declare interface AffirmHostWindow extends Window {
    affirm?: Affirm;
}

declare interface AffirmItem {
    display_name: string;
    sku: string;
    unit_price: number;
    qty: number;
    item_image_url: string;
    item_url: string;
    categories?: string[][];
}

declare class AffirmPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private affirmScriptLoader;
    private affirm?;
    constructor(paymentIntegrationService: PaymentIntegrationService, affirmScriptLoader: AffirmScriptLoader);
    initialize(options: PaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    deinitialize(): Promise<void>;
    finalize(): Promise<void>;
    private initializeAffirmCheckout;
    private getCheckoutInformation;
    private getShippingType;
    private getBillingAddress;
    private getShippingAddress;
    private getItems;
    private getDiscounts;
    private getCategories;
}

declare interface AffirmRequestData {
    merchant: {
        user_confirmation_url: string;
        user_cancel_url: string;
        user_confirmation_url_action?: string;
        name?: string;
    };
    shipping: AffirmAddress;
    billing?: AffirmAddress;
    items: AffirmItem[];
    discounts: AffirmDiscount;
    metadata: {
        shipping_type: string;
        entity_name?: string;
        webhook_session_id?: string;
        mode?: string;
        platform_type: string;
        platform_version: string;
        platform_affirm: string;
    };
    order_id?: string;
    shipping_amount: number;
    tax_amount: number;
    total: number;
}

declare class AffirmScriptLoader {
    affirmWindow: AffirmHostWindow;
    constructor(affirmWindow?: AffirmHostWindow);
    load(apikey?: string, testMode?: boolean): Promise<Affirm>;
}

declare interface AffirmSuccessResponse {
    checkout_token: string;
    created: string;
}

declare interface AfterpayDisplayOptions {
    token: string;
}

declare interface AfterpayInitializeOptions {
    countryCode: string;
}

declare class AfterpayPaymentStrategy implements PaymentStrategy {
    private _paymentIntegrationService;
    private _afterpayScriptLoader;
    private _afterpaySdk?;
    constructor(_paymentIntegrationService: PaymentIntegrationService, _afterpayScriptLoader: AfterpayScriptLoader);
    initialize(options: PaymentInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(options: PaymentRequestOptions): Promise<void>;
    private _redirectToAfterpay;
    private _mapCurrencyToISO2;
    private _loadPaymentMethod;
}

/** Class responsible for loading the Afterpay SDK */
declare class AfterpayScriptLoader {
    private _scriptLoader;
    constructor(_scriptLoader: ScriptLoader);
    /**
     * Loads the appropriate Afterpay SDK depending on the payment method data.
     *
     * @param {PaymentMethod} method the payment method data
     */
    load(method: PaymentMethod, countryCode: string): Promise<AfterpaySdk>;
    private _getScriptURI;
}

declare interface AfterpaySdk {
    initialize(options: AfterpayInitializeOptions): void;
    redirect(options: AfterpayDisplayOptions): void;
}

declare interface AllowedPaymentMethods {
    type: string;
    parameters: {
        allowedAuthMethods: string[];
        allowedCardNetworks: string[];
        billingAddressRequired: boolean;
        assuranceDetailsRequired: boolean;
        billingAddressParameters: {
            format: string;
        };
    };
    tokenizationSpecification: {
        type: string;
        parameters: {
            gateway: string;
            gatewayMerchantId: string;
        };
    };
}

declare interface AllowedPaymentMethods_2 {
    type: string;
    parameters: {
        allowedAuthMethods: string[];
        allowedCardNetworks: string[];
        billingAddressRequired: boolean;
        assuranceDetailsRequired: boolean;
        billingAddressParameters: {
            format: string;
        };
    };
    tokenizationSpecification: {
        type: string;
        parameters: {
            gateway: string;
            gatewayMerchantId: string;
        };
    };
}

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

declare class AmazonPayV2CustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private amazonPayV2PaymentProcessor;
    constructor(paymentIntegrationService: PaymentIntegrationService, amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor);
    initialize(options: CustomerInitializeOptions & WithAmazonPayV2CustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
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

declare class AmazonPayV2PaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private amazonPayV2PaymentProcessor;
    private _amazonPayButton?;
    constructor(paymentIntegrationService: PaymentIntegrationService, amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor);
    initialize(options: PaymentInitializeOptions & WithAmazonPayV2PaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _bindEditButton;
    private _isModalFlow;
    private _showLoadingSpinner;
    private _createContainer;
    private _getAmazonPayButton;
    private _isOneTimeTransaction;
    private _isReadyToPay;
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

declare class ApplePayCustomerStrategy implements CustomerStrategy {
    private _requestSender;
    private _paymentIntegrationService;
    private _sessionFactory;
    private _braintreeSdk;
    private _applePayScriptLoader;
    private _paymentMethod?;
    private _applePayButton?;
    private _isWebBrowserSupported?;
    private _onAuthorizeCallback;
    private _onError;
    private _onClick;
    private _subTotalLabel;
    private _shippingLabel;
    private _hasApplePaySession;
    constructor(_requestSender: RequestSender, _paymentIntegrationService: PaymentIntegrationService, _sessionFactory: ApplePaySessionFactory, _braintreeSdk: BraintreeSdk, _applePayScriptLoader: ApplePayScriptLoader);
    initialize(options: CustomerInitializeOptions & WithApplePayCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(): Promise<void>;
    signOut(): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private _createButton;
    private _createThirdPartyButton;
    private _createNativeButton;
    private _handleWalletButtonClick;
    private _getBaseRequest;
    private _handleApplePayEvents;
    private _handleShippingContactSelected;
    private _handleShippingMethodSelected;
    private _getUpdatedLineItems;
    private _updateShippingOption;
    private _onValidateMerchant;
    private _onPaymentAuthorized;
    private _transformContactToAddress;
    private _getBraintreeDeviceData;
    private _initializeBraintreeSdk;
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

declare class ApplePayPaymentStrategy implements PaymentStrategy {
    private _requestSender;
    private _paymentIntegrationService;
    private _sessionFactory;
    private _braintreeSdk;
    private _shippingLabel;
    private _subTotalLabel;
    private _storeCreditLabel;
    constructor(_requestSender: RequestSender, _paymentIntegrationService: PaymentIntegrationService, _sessionFactory: ApplePaySessionFactory, _braintreeSdk: BraintreeSdk);
    initialize(options?: PaymentInitializeOptions & WithApplePayPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _getBaseRequest;
    private _handleApplePayEvents;
    private _onValidateMerchant;
    private _onPaymentAuthorized;
    private _getBraintreeDeviceData;
    private _initializeBraintreeSdk;
}

declare class ApplePayScriptLoader {
    private scriptLoader;
    private sdkVersion;
    constructor(scriptLoader: ScriptLoader);
    loadSdk(): Promise<void>;
}

declare class ApplePaySessionFactory {
    create(request: ApplePayJS.ApplePayPaymentRequest): ApplePaySession;
}

declare interface ApproveCallbackActions {
    order: {
        get: () => Promise<PayPalOrderDetails>;
    };
}

declare interface ApproveCallbackActions_2 {
    order: {
        get: () => Promise<PayPalOrderDetails_2>;
    };
}

declare interface ApproveCallbackPayload {
    orderID?: string;
}

declare interface ApproveCallbackPayload_2 {
    orderID?: string;
}

declare type AutoOrNever = StripeStringConstants.AUTO | StripeStringConstants.NEVER;

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
    onInitButton(actions: InitCallbackActions): Promise<void>;
}

declare class BigCommercePaymentsAlternativeMethodsPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    private bigCommercePaymentsSdkHelper;
    private loadingIndicator;
    private pollingInterval;
    private maxPollingIntervalTime;
    private loadingIndicatorContainer?;
    private orderId?;
    private bigCommercePaymentsButton?;
    private paypalApms?;
    private pollingTimer;
    private stopPolling;
    private isPollingEnabled;
    private bigCommercePaymentsAlternativeMethods?;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService, bigCommercePaymentsSdkHelper: PayPalSdkHelper, loadingIndicator: LoadingIndicator, pollingInterval?: number, maxPollingIntervalTime?: number);
    initialize(options: PaymentInitializeOptions & WithBigCommercePaymentsAlternativeMethodsPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    /**
     *
     * Polling mechanism
     *
     *
     * */
    private initializePollingMechanism;
    private deInitializePollingMechanism;
    private resetPollingMechanism;
    private reinitializeStrategy;
    private handleError;
    /**
     *
     * Button methods/callbacks
     *
     * */
    private renderButton;
    private onCreateOrder;
    private handleApprove;
    private handleFailure;
    /**
     *
     * Fields methods
     *
     * */
    private renderFields;
    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator;
    /**
     *
     * Utils
     *
     * */
    private isNonInstantPaymentMethod;
    private getPaypalAmpsSdkOrThrow;
}

/**
 *
 * BigCommerce Payments Buttons
 *
 */
declare interface BigCommercePaymentsButtons {
    render(id: string): void;
    close(): void;
    isEligible(): boolean;
}

declare interface BigCommercePaymentsButtonsOptions {
    experience?: string;
    style?: PayPalButtonStyleOptions;
    fundingSource: string;
    createOrder(): Promise<string>;
    onApprove(data: ApproveCallbackPayload, actions: ApproveCallbackActions): Promise<boolean | void> | void;
    onInit?(data: InitCallbackPayload, actions: InitCallbackActions): Promise<void>;
    onComplete?(data: CompleteCallbackDataPayload): Promise<void>;
    onClick?(data: ClickCallbackPayload, actions: ClickCallbackActions): Promise<void> | void;
    onError?(error: Error): void;
    onCancel?(): void;
    onShippingAddressChange?(data: ShippingAddressChangeCallbackPayload): Promise<void>;
    onShippingOptionsChange?(data: ShippingOptionChangeCallbackPayload): Promise<void>;
}

declare interface BigCommercePaymentsCardFields {
    isEligible(): boolean;
    CVVField(config?: BigCommercePaymentsFieldsInitializationData): BigCommercePaymentsFields;
    ExpiryField(config?: BigCommercePaymentsFieldsInitializationData): BigCommercePaymentsFields;
    NameField(config?: BigCommercePaymentsFieldsInitializationData): BigCommercePaymentsFields;
    NumberField(config?: BigCommercePaymentsFieldsInitializationData): BigCommercePaymentsFields;
    submit(config?: BigCommercePaymentsCardFieldsSubmitConfig): Promise<void>;
    getState(): Promise<BigCommercePaymentsCardFieldsState>;
}

declare type BigCommercePaymentsCardFieldsCard = BigCommercePaymentsHostedFieldsCard;

/**
 *
 * BigCommerce Payments SDK
 *
 */
declare interface BigCommercePaymentsCardFieldsConfig {
    inputEvents: {
        onChange(data: BigCommercePaymentsCardFieldsState): void;
        onFocus(data: BigCommercePaymentsCardFieldsState): void;
        onBlur(data: BigCommercePaymentsCardFieldsState): void;
        onInputSubmitRequest(data: BigCommercePaymentsCardFieldsState): void;
    };
    createVaultSetupToken?: (data: BigCommercePaymentsCardFieldsState) => void;
    createOrder?: () => Promise<string>;
    style: BigCommercePaymentsHostedFieldsRenderOptions['styles'];
    onApprove(data: BigCommercePaymentsCardFieldsOnApproveData): void;
    onError(): void;
}

declare interface BigCommercePaymentsCardFieldsFieldData {
    isFocused: boolean;
    isEmpty: boolean;
    isValid: boolean;
    isPotentiallyValid: boolean;
}

declare interface BigCommercePaymentsCardFieldsOnApproveData {
    vaultSetupToken?: string;
    orderID: string;
    liabilityShift?: LiabilityShiftEnum;
}

declare interface BigCommercePaymentsCardFieldsState {
    cards: BigCommercePaymentsCardFieldsCard[];
    emittedBy: string;
    isFormValid: boolean;
    errors: string[];
    fields: {
        cardCvvField: BigCommercePaymentsCardFieldsFieldData;
        cardNumberField: BigCommercePaymentsCardFieldsFieldData;
        cardNameField?: BigCommercePaymentsCardFieldsFieldData;
        cardExpiryField: BigCommercePaymentsCardFieldsFieldData;
    };
}

declare interface BigCommercePaymentsCardFieldsSubmitConfig {
    billingAddress: {
        company?: string;
        addressLine1: string;
        addressLine2?: string;
        adminArea1: string;
        adminArea2: string;
        postalCode: string;
        countryCode?: string;
    };
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

declare class BigCommercePaymentsCreditCardsPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    private bigCommercePaymentsSdk;
    private bigCommercePaymentsFastlaneUtils;
    private executionPaymentData?;
    private isCreditCardForm?;
    private isCreditCardVaultedForm?;
    private cardFields?;
    private cvvField?;
    private expiryField?;
    private numberField?;
    private nameField?;
    private hostedFormOptions?;
    private returnedOrderId?;
    private returnedVaultedToken?;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService, bigCommercePaymentsSdk: PayPalSdkHelper, bigCommercePaymentsFastlaneUtils: BigCommercePaymentsFastlaneUtils);
    initialize(options: PaymentInitializeOptions & WithBigCommercePaymentsCreditCardsPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    /**
     *
     * Submit Payment Payload preparing method
     *
     * `vaultedToken` is used when we pay with vaulted instrument (with trusted shipping address and untrusted)
     * `setupToken` is used when we pay with vaulted instrument (untrusted shipping address)
     * `orderId` is used in every case (basic card payment, trusted shipping address and untrusted)
     */
    private preparePaymentPayload;
    /**
     *
     * Card fields initialize
     *
     */
    private initializeFields;
    /**
     *
     * Get execute callback method
     * Depends on shipping address is trusted or not we should pass to PP
     * `createVaultSetupToken` callback if address is untrusted or
     * `createOrder` if address is trusted
     *
     */
    private getExecuteCallback;
    private createVaultSetupTokenCallback;
    private createOrderCallback;
    /**
     *
     * onApprove method
     * When submitting a form with a `submitHostedForm` method if there is no error
     * then onApprove callback is triggered and depends on the flow
     * we will receive an `orderID` if it's basic paying and `vaultSetupToken` if we are paying
     * with vaulted instrument and shipping address is untrusted
     *
     */
    private handleApprove;
    /**
     *
     * Rendering Card Fields methods
     *
     */
    private renderFields;
    private renderVaultedFields;
    /**
     *
     * Instrument params method
     *
     */
    private getInstrumentParams;
    private getFieldTypeByEmittedField;
    /**
     *
     * Form submit method
     * Triggers a form submit
     *
     * */
    private submitHostedForm;
    /**
     *
     * Validation and errors
     *
     */
    private validateHostedFormOrThrow;
    private getValidityData;
    private getInvalidErrorByFieldType;
    private mapValidationErrors;
    /**
     *
     * Fields mappers
     *
     */
    private mapFieldType;
    /**
     *
     * Utils
     *
     */
    private getCardFieldsOrThrow;
    private getInputStyles;
    private stylizeInputContainers;
    private hasUndefinedValues;
    /**
     *
     * Input events methods
     *
     */
    private onChangeHandler;
    private onFocusHandler;
    private onBlurHandler;
    private onInputSubmitRequest;
    /**
     *
     * BigCommercePayments Accelerated checkout related methods
     *
     */
    private shouldInitializePayPalFastlane;
    private initializePayPalFastlaneOrThrow;
}

/**
 * A set of options that are required to initialize the customer step of
 * checkout to support BigCommercePayments.
 */
declare interface BigCommercePaymentsCustomerInitializeOptions {
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

declare class BigCommercePaymentsCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    private onError;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService);
    initialize(options: CustomerInitializeOptions & WithBigCommercePaymentsCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private renderButton;
    private onHostedCheckoutApprove;
    private onShippingAddressChange;
    private onShippingOptionsChange;
    private handleError;
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

declare class BigCommercePaymentsFastlaneCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsSdk;
    private bigCommercePaymentsFastlaneUtils;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsSdk: PayPalSdkHelper, bigCommercePaymentsFastlaneUtils: BigCommercePaymentsFastlaneUtils);
    initialize(options: CustomerInitializeOptions & WithBigCommercePaymentsFastlaneCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    /**
     *
     * Authentication flow methods
     *
     */
    private runPayPalAuthenticationFlowOrThrow;
    private updateCustomerDataState;
    /**
     *
     * Fastlane styling methods
     *
     */
    private getFastlaneStyles;
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
    onChange?: (showPayPalCardSelector: () => Promise<CardInstrument | undefined>) => void;
    /**
     * Callback that handles errors
     */
    onError?: (error: unknown) => void;
    /**
     * Is a stylisation options for customizing BigCommercePayments Fastlane components
     *
     * Note: the styles for all BigCommercePaymentsFastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: PayPalFastlaneStylesOption;
}

declare class BigCommercePaymentsFastlanePaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsRequestSender;
    private bigCommercePaymentsSdk;
    private bigCommercePaymentsFastlaneUtils;
    private paypalComponentMethods?;
    private threeDSVerificationMethod?;
    private paypalFastlaneSdk?;
    private bigcommerce_payments_fastlane?;
    private methodId?;
    private orderId?;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsRequestSender: BigCommercePaymentsRequestSender, bigCommercePaymentsSdk: PayPalSdkHelper, bigCommercePaymentsFastlaneUtils: BigCommercePaymentsFastlaneUtils);
    /**
     *
     * Default methods
     *
     * */
    initialize(options: PaymentInitializeOptions & WithBigCommercePaymentsFastlanePaymentInitializeOptions): Promise<void>;
    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    /**
     *
     * Authentication flow methods
     *
     */
    private shouldRunAuthenticationFlow;
    private runPayPalAuthenticationFlowOrThrow;
    /**
     *
     * BigCommercePayments Fastlane Card Component rendering method
     *
     */
    private initializePayPalPaymentComponent;
    private renderPayPalPaymentComponent;
    private getPayPalComponentMethodsOrThrow;
    /**
     *
     * Payment Payload preparation methods
     *
     */
    private prepareVaultedInstrumentPaymentPayload;
    private preparePaymentPayload;
    private createOrder;
    /**
     *
     * 3DSecure methods
     *
     * */
    private get3DSNonce;
    /**
     *
     * BigCommercePayments Fastlane instrument change
     *
     */
    private handlePayPalStoredInstrumentChange;
    /**
     *
     * Bigcommerce Payments Fastlane experiments handling
     *
     */
    private isBigcommercePaymentsFastlaneThreeDSAvailable;
    private handleError;
}

declare interface BigCommercePaymentsFields {
    render(container: HTMLElement | string): Promise<void>;
    clear(): void;
    removeClass(className: string): Promise<void>;
    close(): Promise<void>;
}

declare interface BigCommercePaymentsFieldsInitializationData {
    placeholder?: string;
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

declare interface BigCommercePaymentsHostedFieldOption {
    selector: string;
    placeholder?: string;
}

declare interface BigCommercePaymentsHostedFields {
    submit(options?: BigCommercePaymentsHostedFieldsSubmitOptions): Promise<BigCommercePaymentsHostedFieldsApprove>;
    getState(): BigCommercePaymentsHostedFieldsState;
    on(eventName: string, callback: (event: BigCommercePaymentsHostedFieldsState) => void): void;
}

declare interface BigCommercePaymentsHostedFieldsApprove {
    orderId: string;
    liabilityShift?: 'POSSIBLE' | 'NO' | 'UNKNOWN';
}

declare interface BigCommercePaymentsHostedFieldsCard {
    type: string;
    niceType: string;
    code: {
        name: string;
        size: number;
    };
}

declare interface BigCommercePaymentsHostedFieldsFieldData {
    container: HTMLElement;
    isFocused: boolean;
    isEmpty: boolean;
    isPotentiallyValid: boolean;
    isValid: boolean;
}

/**
 *
 * BigCommerce Payments Hosted Fields
 *
 */
declare interface BigCommercePaymentsHostedFieldsRenderOptions {
    fields?: {
        number?: BigCommercePaymentsHostedFieldOption;
        cvv?: BigCommercePaymentsHostedFieldOption;
        expirationDate?: BigCommercePaymentsHostedFieldOption;
    };
    paymentsSDK?: boolean;
    styles?: {
        input?: {
            [key: string]: string;
        };
        '.invalid'?: {
            [key: string]: string;
        };
        '.valid'?: {
            [key: string]: string;
        };
        ':focus'?: {
            [key: string]: string;
        };
    };
    createOrder(): Promise<string>;
}

declare interface BigCommercePaymentsHostedFieldsState {
    cards: BigCommercePaymentsHostedFieldsCard[];
    emittedBy: string;
    fields: {
        number?: BigCommercePaymentsHostedFieldsFieldData;
        expirationDate?: BigCommercePaymentsHostedFieldsFieldData;
        expirationMonth?: BigCommercePaymentsHostedFieldsFieldData;
        expirationYear?: BigCommercePaymentsHostedFieldsFieldData;
        cvv?: BigCommercePaymentsHostedFieldsFieldData;
        postalCode?: BigCommercePaymentsHostedFieldsFieldData;
    };
}

declare interface BigCommercePaymentsHostedFieldsSubmitOptions {
    contingencies?: Array<'3D_SECURE'>;
    cardholderName?: string;
}

/**
 *
 * BigCommerce Payments Initialization Data
 *
 */
declare interface BigCommercePaymentsInitializationData {
    attributionId?: string;
    availableAlternativePaymentMethods: FundingType;
    buttonStyle?: PayPalButtonStyleOptions;
    buyerCountry?: string;
    clientId: string;
    clientToken?: string;
    enabledAlternativePaymentMethods: FundingType;
    isDeveloperModeApplicable?: boolean;
    intent?: BigCommercePaymentsIntent;
    isAcceleratedCheckoutEnabled?: boolean;
    isHostedCheckoutEnabled?: boolean;
    isPayPalCreditAvailable?: boolean;
    isVenmoEnabled?: boolean;
    isGooglePayEnabled?: boolean;
    merchantId?: string;
    orderId?: string;
    shouldRenderFields?: boolean;
    shouldRunAcceleratedCheckout?: boolean;
    paymentButtonStyles?: Record<string, PayPalButtonStyleOptions>;
}

declare class BigCommercePaymentsIntegrationService {
    private formPoster;
    private paymentIntegrationService;
    private bigCommercePaymentsRequestSender;
    private bigCommercePaymentsScriptLoader;
    private paypalSdk?;
    constructor(formPoster: FormPoster, paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsRequestSender: BigCommercePaymentsRequestSender, bigCommercePaymentsScriptLoader: BigCommercePaymentsScriptLoader);
    /**
     *
     * PayPalSDK methods
     *
     */
    loadPayPalSdk(methodId: string, providedCurrencyCode?: string, initializesOnCheckoutPage?: boolean, forceLoad?: boolean): Promise<PayPalSDK | undefined>;
    getPayPalSdkOrThrow(): PayPalSDK;
    /**
     *
     * Buy Now cart creation methods
     *
     */
    createBuyNowCartOrThrow(buyNowInitializeOptions: PayPalBuyNowInitializeOptions): Promise<Cart>;
    /**
     *
     * Order methods
     *
     */
    createOrder(providerId: string, requestBody?: Partial<PayPalCreateOrderRequestBody>): Promise<string>;
    createOrderCardFields(providerId: string, requestBody?: Partial<PayPalCreateOrderRequestBody>): Promise<PayPalCreateOrderCardFieldsResponse>;
    updateOrder(): Promise<void>;
    getOrderStatus(methodId?: string, options?: RequestOptions): Promise<PayPalOrderStatus>;
    /**
     *
     * Payment submitting and tokenizing methods
     *
     */
    tokenizePayment(methodId: string, orderId?: string): void;
    submitPayment(methodId: string, orderId: string, gatewayId?: string): Promise<void>;
    /**
     *
     * Shipping options methods
     *
     */
    getShippingOptionOrThrow(selectedShippingOptionId?: string): ShippingOption;
    /**
     *
     * Address transforming methods
     *
     */
    getAddress(address?: Partial<BillingAddressRequestBody>): BillingAddressRequestBody;
    getBillingAddressFromOrderDetails({ payer }: PayPalOrderDetails): BillingAddressRequestBody;
    getShippingAddressFromOrderDetails(orderDetails: PayPalOrderDetails): BillingAddressRequestBody;
    /**
     *
     * Buttons style methods
     *
     */
    getValidButtonStyle(style?: PayPalButtonStyleOptions): PayPalButtonStyleOptions;
    getValidHeight(height?: number): number;
    /**
     *
     * Utils methods
     *
     */
    removeElement(elementId?: string): void;
}

declare enum BigCommercePaymentsIntent {
    AUTHORIZE = "authorize",
    CAPTURE = "capture"
}

/**
 *
 * BigCommercePayments Messages
 */
declare interface BigCommercePaymentsMessages {
    render(id: string): void;
}

declare interface BigCommercePaymentsMessagesOptions {
    amount: number;
    placement: string;
    style?: BigCommercePaymentsMessagesStyleOptions;
    fundingSource?: string;
}

declare interface BigCommercePaymentsMessagesStyleOptions {
    layout?: string;
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

declare class BigCommercePaymentsPayLaterCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    private onError;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService);
    initialize(options: CustomerInitializeOptions & WithBigCommercePaymentsPayLaterCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private renderButton;
    private onHostedCheckoutApprove;
    private onShippingAddressChange;
    private onShippingOptionsChange;
    private handleError;
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

declare class BigCommercePaymentsPayLaterPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    private loadingIndicator;
    private paypalSdkHelper;
    private loadingIndicatorContainer?;
    private orderId?;
    private bigCommercePaymentsButtons?;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService, loadingIndicator: LoadingIndicator, paypalSdkHelper: PayPalSdkHelper);
    initialize(options?: PaymentInitializeOptions & WithBigCommercePaymentsPayLaterPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    /**
     *
     * Button methods/callbacks
     *
     * */
    private renderButton;
    private handleClick;
    private handleApprove;
    private handleError;
    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator;
    /**
     *
     * Render Pay Later Messages
     *
     * */
    private renderMessages;
}

/**
 *
 * BigCommerce Payments Payment fields
 *
 */
declare interface BigCommercePaymentsPaymentFields {
    render(id: string): void;
}

declare interface BigCommercePaymentsPaymentFieldsOptions {
    style?: BigCommercePaymentsFieldsStyleOptions;
    fundingSource: string;
    fields: {
        name?: {
            value?: string;
        };
        email?: {
            value?: string;
        };
    };
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
declare interface BigCommercePaymentsPaymentInitializeOptions {
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
     * when buyer approves PayPal payment.
     */
    submitForm(): void;
}

declare class BigCommercePaymentsPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    private loadingIndicator;
    private loadingIndicatorContainer?;
    private orderId?;
    private paypalButton?;
    private bigcommerce_payments?;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService, loadingIndicator: LoadingIndicator);
    initialize(options?: PaymentInitializeOptions & WithBigCommercePaymentsPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private prepareVaultedInstrumentPaymentPayload;
    private preparePaymentPayload;
    /**
     *
     * Button methods/callbacks
     *
     * */
    private renderButton;
    private handleClick;
    private handleApprove;
    private handleError;
    private createOrder;
    /**
     *
     * Vaulting flow methods
     *
     * */
    private getFieldsValues;
    private isTrustedVaultingFlow;
    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator;
    /**
     *
     * Guards
     *
     */
    private isPayPalVaultedInstrumentPaymentData;
    private isProviderError;
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

declare class BigCommercePaymentsRatePayPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    private loadingIndicator;
    private pollingInterval;
    private maxPollingIntervalTime;
    private guid?;
    private bigcommerce_payments_ratepay?;
    private loadingIndicatorContainer?;
    private pollingTimer;
    private stopPolling;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService, loadingIndicator: LoadingIndicator, pollingInterval?: number, maxPollingIntervalTime?: number);
    initialize(options: PaymentInitializeOptions & WithBigCommercePaymentsRatePayPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private normalizeDate;
    private formatDate;
    private renderLegalText;
    private handleError;
    private createFraudNetScript;
    private generateGUID;
    private loadFraudnetConfig;
    private reinitializeStrategy;
    /**
     *
     * Polling mechanism
     *
     *
     * */
    private initializePollingMechanism;
    private deinitializePollingMechanism;
    private resetPollingMechanism;
    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator;
}

declare class BigCommercePaymentsRequestSender {
    private requestSender;
    constructor(requestSender: RequestSender);
    createOrder(providerId: string, requestBody: Partial<PayPalCreateOrderRequestBody>): Promise<PayPalOrderData>;
    updateOrder(requestBody: PayPalUpdateOrderRequestBody): Promise<PayPalUpdateOrderResponse>;
    getOrderStatus(methodId?: string, options?: RequestOptions): Promise<PayPalOrderStatusData>;
}

declare interface BigCommercePaymentsSDKFunding {
    CARD: string;
    PAYPAL: string;
    CREDIT: string;
    PAYLATER: string;
    OXXO: string;
    SEPA: string;
    VENMO: string;
}

declare class BigCommercePaymentsScriptLoader {
    private scriptLoader;
    private window;
    constructor(scriptLoader: ScriptLoader);
    getPayPalSDK(paymentMethod: PaymentMethod<BigCommercePaymentsInitializationData>, currencyCode: string, initializesOnCheckoutPage?: boolean, forceLoad?: boolean): Promise<PayPalSDK>;
    private loadPayPalSDK;
    private getPayPalSdkScriptConfigOrThrow;
    private transformConfig;
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

declare class BigCommercePaymentsVenmoCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService);
    initialize(options: CustomerInitializeOptions & WithBigCommercePaymentsVenmoCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private renderButton;
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

declare class BigCommercePaymentsVenmoPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    private loadingIndicator;
    private loadingIndicatorContainer?;
    private orderId?;
    private paypalButton?;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService, loadingIndicator: LoadingIndicator);
    initialize(options?: PaymentInitializeOptions & WithBigCommercePaymentsVenmoPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    /**
     *
     * Button methods/callbacks
     *
     * */
    private renderButton;
    private handleClick;
    private handleApprove;
    private handleError;
    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator;
}

/**
 * Object definition for part of the data sent to confirm the PaymentIntent.
 */
declare interface BillingDetailsOptions {
    name?: string;
    email?: string;
    address?: AddressOptions;
    phone?: string;
}

/**
 * Object definition for part of the data sent to confirm the PaymentIntent.
 */
declare interface BillingDetailsProperties {
    name?: AutoOrNever;
    email?: AutoOrNever;
    address?: AutoOrNever | AddressProperties;
    phone?: AutoOrNever;
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

declare class BlueSnapDirect3ds {
    private _blueSnapSdk?;
    initialize(blueSnapSdk: BlueSnapDirectSdk): void;
    initialize3ds(token: string, cardData: BlueSnapDirectPreviouslyUsedCard): Promise<string>;
    private _getBlueSnapSdk;
}

declare interface BlueSnapDirect3dsCallbackResponse {
    code: string;
    cardData: BlueSnapDirectCallbackCardData;
    threeDSecure: {
        authResult: string;
        threeDSecureReferenceId: string;
    };
}

declare class BlueSnapDirectAPMPaymentStrategy implements PaymentStrategy {
    private _paymentIntegrationService;
    constructor(_paymentIntegrationService: PaymentIntegrationService);
    execute(payload: OrderRequestBody): Promise<void>;
    initialize(): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _formatePaymentPayload;
    private _isBlueSnapDirectRedirectResponse;
}

declare interface BlueSnapDirectCallback {
    statusCode: string;
    transactionFraudInfo: {
        fraudSessionId: string;
    };
}

declare interface BlueSnapDirectCallbackCardData extends BlueSnapDirectCardData {
    cardCategory: string;
    exp: string;
}

declare interface BlueSnapDirectCallbackData extends BlueSnapDirectCallback {
    cardData: BlueSnapDirectCallbackCardData;
}

declare interface BlueSnapDirectCallbackError extends BlueSnapDirectCallback {
    error: BlueSnapDirectSubmitError[];
}

declare type BlueSnapDirectCallbackResults = BlueSnapDirectCallbackData | BlueSnapDirectCallbackError;

declare interface BlueSnapDirectCardData {
    binCategory: string;
    cardSubType: string;
    ccBin: string;
    ccType: string;
    isRegulatedCard: string;
    issuingCountry: string;
    last4Digits: string;
}

declare type BlueSnapDirectCardTypeValues = keyof typeof BlueSnapDirectCardType;

declare class BlueSnapDirectCreditCardPaymentStrategy implements PaymentStrategy {
    private _scriptLoader;
    private _paymentIntegrationService;
    private _blueSnapDirectHostedForm;
    private _blueSnapDirect3ds;
    private _paymentFieldsToken?;
    private _shouldUseHostedFields?;
    private _blueSnapSdk?;
    constructor(_scriptLoader: BlueSnapDirectScriptLoader, _paymentIntegrationService: PaymentIntegrationService, _blueSnapDirectHostedForm: BlueSnapDirectHostedForm, _blueSnapDirect3ds: BlueSnapDirect3ds);
    initialize(options: PaymentInitializeOptions & WithCreditCardPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _getBlueSnapDirectThreeDSecureData;
    private _getPaymentFieldsToken;
}

declare enum BlueSnapDirectErrorCode {
    CC_NOT_SUPORTED = "22013",
    ERROR_403 = "403",
    ERROR_404 = "404",
    ERROR_500 = "500",
    INVALID_OR_EMPTY = "10",
    SESSION_EXPIRED = "400",
    THREE_DS_AUTH_FAILED = "14101",
    THREE_DS_CLIENT_ERROR = "14103",
    THREE_DS_MISSING_FIELDS = "14102",
    THREE_DS_NOT_ENABLED = "14100",
    TOKEN_EXPIRED = "14040",
    TOKEN_NOT_ASSOCIATED = "14042",
    TOKEN_NOT_FOUND = "14041"
}

declare enum BlueSnapDirectErrorDescription {
    EMPTY = "empty",
    INVALID = "invalid",
    THREE_DS_NOT_ENABLED = "3D Secure is not enabled"
}

declare enum BlueSnapDirectEventOrigin {
    ON_BLUR = "onBlur",
    ON_SUBMIT = "onSubmit"
}

declare interface BlueSnapDirectHostWindow extends Window {
    bluesnap?: BlueSnapDirectSdk;
}

declare enum BlueSnapDirectHostedFieldTagId {
    CardCode = "cvv",
    CardExpiry = "exp",
    CardName = "noc",
    CardNumber = "ccn"
}

declare class BlueSnapDirectHostedForm {
    private _nameOnCardInput;
    private _hostedInputValidator;
    private _blueSnapSdk?;
    private _onValidate;
    constructor(_nameOnCardInput: BluesnapDirectNameOnCardInput, _hostedInputValidator: BlueSnapHostedInputValidator);
    initialize(blueSnapSdk: BlueSnapDirectSdk, fields?: HostedFieldOptionsMap): void;
    attach(paymentFieldsToken: string, { form: { fields, ...callbacksAndStyles } }: CreditCardPaymentInitializeOptions, enable3DS?: boolean): Promise<void>;
    validate(): this;
    submit(threeDSecureData?: BlueSnapDirectThreeDSecureData, shouldSendName?: boolean): Promise<BlueSnapDirectCallbackCardData & WithBlueSnapDirectCardHolderName>;
    detach(): void;
    private _isBlueSnapDirectCallbackError;
    private _getHostedPaymentFieldsOptions;
    private _mapStyles;
    private _handleError;
    private _usetUiEventCallback;
    private _getBlueSnapSdk;
    private _setCustomBlueSnapAttributes;
    private _setCustomStoredCardsBlueSnapAttributes;
}

declare interface BlueSnapDirectHostedPaymentFieldsOptions {
    token: string;
    onFieldEventHandler?: {
        setupComplete?: () => void;
        threeDsChallengeExecuted?: () => void;
        onFocus?: (tagId: BlueSnapDirectHostedFieldTagId) => void;
        onBlur?: (tagId: BlueSnapDirectHostedFieldTagId) => void;
        onError?: (tagId: BlueSnapDirectHostedFieldTagId | undefined, errorCode: BlueSnapDirectErrorCode, errorDescription: BlueSnapDirectErrorDescription | undefined, eventOrigin: BlueSnapDirectEventOrigin | undefined) => void;
        onType?: (tagId: BlueSnapDirectHostedFieldTagId, cardType: BlueSnapDirectCardTypeValues, cardData: BlueSnapDirectCardData | undefined) => void;
        onEnter?: (tagId: BlueSnapDirectHostedFieldTagId) => void;
        onValid?: (tagId: BlueSnapDirectHostedFieldTagId) => void;
    };
    ccnPlaceHolder?: string;
    cvvPlaceHolder?: string;
    expPlaceHolder?: string;
    style?: BlueSnapDirectStyle;
    '3DS'?: boolean;
}

declare type BlueSnapDirectInputValidationErrorDescription = Extract<BlueSnapDirectErrorDescription, BlueSnapDirectErrorDescription.EMPTY | BlueSnapDirectErrorDescription.INVALID>;

declare interface BlueSnapDirectPreviouslyUsedCard {
    last4Digits?: string;
    ccType?: string;
    amount: number;
    currency: string;
    billingFirstName?: string;
    billingLastName?: string;
    billingCountry?: string;
    billingState?: string;
    billingCity?: string;
    billingAddress?: string;
    billingZip?: string;
    shippingFirstName?: string;
    shippingLastName?: string;
    shippingCountry?: string;
    shippingState?: string;
    shippingCity?: string;
    shippingAddress?: string;
    shippingZip?: string;
    email?: string;
    phone?: string;
}

declare class BlueSnapDirectScriptLoader {
    private _scriptLoader;
    private _window;
    constructor(_scriptLoader: ScriptLoader, _window?: BlueSnapDirectHostWindow);
    load(testMode?: boolean): Promise<BlueSnapDirectSdk>;
}

declare interface BlueSnapDirectSdk {
    hostedPaymentFieldsCreate(options: BlueSnapDirectHostedPaymentFieldsOptions): void;
    hostedPaymentFieldsSubmitData(callback: (results: BlueSnapDirectCallbackResults) => void, threeDSecureData?: BlueSnapDirectThreeDSecureData): void;
    threeDsPaymentsSetup(token: string, callback: (reponse: BlueSnapDirect3dsCallbackResponse) => void): void;
    threeDsPaymentsSubmitData(cardData: BlueSnapDirectPreviouslyUsedCard): void;
}

declare interface BlueSnapDirectStyle {
    '.invalid'?: BlueSnapDirectStyleDeclaration;
    ':focus'?: BlueSnapDirectStyleDeclaration;
    input?: BlueSnapDirectStyleDeclaration;
}

declare interface BlueSnapDirectStyleDeclaration {
    [k: string]: string;
}

declare interface BlueSnapDirectSubmitError {
    errorCode: string;
    errorDescription: string;
    eventType: string;
    tagId: string;
}

declare interface BlueSnapDirectThreeDSecureData {
    amount: number;
    currency: string;
    billingFirstName?: string;
    billingLastName?: string;
    billingCountry?: string;
    billingState?: string;
    billingCity?: string;
    billingAddress?: string;
    billingZip?: string;
    shippingFirstName?: string;
    shippingLastName?: string;
    shippingCountry?: string;
    shippingState?: string;
    shippingCity?: string;
    shippingAddress?: string;
    shippingZip?: string;
    email?: string;
    phone?: string;
}

declare class BlueSnapHostedInputValidator {
    private _errors;
    initialize(): void;
    initializeValidationFields(): void;
    validate(error?: {
        tagId: BlueSnapDirectHostedFieldTagId;
        errorDescription?: BlueSnapDirectInputValidationErrorDescription;
    }): HostedInputValidateResults;
    private _updateErrors;
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

declare class BlueSnapV2PaymentStrategy implements PaymentStrategy {
    private _paymentIntegrationService;
    private _initializeOptions?;
    constructor(_paymentIntegrationService: PaymentIntegrationService);
    execute(orderRequest: OrderRequestBody, options?: PaymentInitializeOptions & WithBlueSnapV2PaymentInitializeOptions): Promise<void>;
    finalize(options?: PaymentRequestOptions): Promise<void>;
    initialize(options?: PaymentInitializeOptions & WithBlueSnapV2PaymentInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    private _createIframe;
}

declare interface BlueSnapV2StyleProps {
    border?: string;
    height?: string;
    width?: string;
}

declare class BluesnapDirectNameOnCardInput {
    private _input?;
    private _style?;
    attach({ style, onFieldEventHandler: { onFocus, onBlur, onValid, onError, onEnter }, }: BlueSnapDirectHostedPaymentFieldsOptions, accessibilityLabel?: string, placeholder?: string): void;
    getValue(): string;
    detach(): void;
    private _handleFocus;
    private _handleBlur;
    private _handleEnter;
    private _applyStyles;
    private _configureInput;
    private _getInput;
    private _create;
}

declare interface BoltAuthorization {
    status: string;
    reason: string;
}

declare interface BoltCallbacks {
    check?(): boolean;
    onCheckoutStart?(): void;
    onPaymentSubmit?(): void;
    success(transaction: BoltTransaction, callback: () => void): void;
    close?(): void;
}

declare interface BoltCart {
    orderToken: string;
}

declare interface BoltCheckout {
    configure(cart: BoltCart, hints: Record<string, never>, callbacks?: BoltCallbacks): BoltClient;
    hasBoltAccount(email: string): Promise<boolean>;
    getTransactionReference(): Promise<string | undefined>;
    openCheckout(email: string, callbacks?: BoltOpenCheckoutCallbacks): Promise<void>;
    setClientCustomCallbacks(callbacks: BoltCallbacks): void;
    setOrderId(orderId: number): Promise<void>;
}

declare interface BoltClient {
    open(): void;
}

declare interface BoltConnect {
    setupProductPageCheckout?(): void;
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

declare class BoltCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private boltScriptLoader;
    private boltHostWindow;
    constructor(paymentIntegrationService: PaymentIntegrationService, boltScriptLoader: BoltScriptLoader);
    initialize(options: CustomerInitializeOptions & WithBoltCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private openBoltCheckoutModalOrThrow;
    private getBoltClientOrThrow;
    private hasBoltAccount;
    private getCustomerEmail;
}

declare enum BoltDeveloperMode {
    SandboxMode = "bolt_sandbox",
    StagingMode = "bolt_staging",
    DevelopmentMode = "bolt_development"
}

declare interface BoltDeveloperModeParams {
    developerMode: BoltDeveloperMode;
    developerDomain: string;
}

declare interface BoltEmbedded {
    create(name: string, options?: BoltEmbeddedOptions): BoltEmbededField;
}

declare interface BoltEmbeddedOptions {
    styles: {
        backgroundColor: string;
    };
    renderSeparateFields?: boolean;
}

declare interface BoltEmbeddedTokenize {
    bin: string;
    expiration: string;
    last4: string;
    postal_code?: string;
    token: string;
    token_type: string;
}

declare interface BoltEmbededField {
    mount(element: string): void;
    unmount(): void;
    tokenize(): Promise<BoltEmbeddedTokenize | Error>;
}

declare interface BoltHostWindow extends Window {
    BoltCheckout?: BoltCheckout;
    BoltConnect?: BoltConnect;
    Bolt?(publicKey: string): BoltEmbedded;
}

declare interface BoltOpenCheckoutCallbacks {
    close?(): void;
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

declare class BoltPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private boltScriptLoader;
    private analyticsExtraItemsManager;
    private boltClient?;
    private boltEmbedded?;
    private embeddedField?;
    private useBoltClient;
    private useBoltEmbedded;
    constructor(paymentIntegrationService: PaymentIntegrationService, boltScriptLoader: BoltScriptLoader, analyticsExtraItemsManager: AnalyticsExtraItemsManager);
    initialize(options: PaymentInitializeOptions & WithBoltPaymentInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    finalize(): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    private getBoltClientPaymentPayload;
    private getBoltEmbeddedPaymentPayload;
    private getBoltFullCheckoutPaymentPayload;
    private getBoltClientOrThrow;
    private getBoltEmbeddedOrThrow;
    private hasBoltAccount;
    private setBoltOrderId;
    private mountBoltEmbeddedField;
    private validateTokenizeResultOrThrow;
    private setExtraItemsForAnalytics;
}

declare class BoltScriptLoader {
    private scriptLoader;
    boltHostWindow: BoltHostWindow;
    constructor(scriptLoader: ScriptLoader, boltHostWindow?: BoltHostWindow);
    loadBoltClient(publishableKey?: string, testMode?: boolean, developerModeParams?: BoltDeveloperModeParams, cartId?: string, storefrontApiToken?: string): Promise<BoltCheckout>;
    loadBoltEmbedded(publishableKey: string, testMode?: boolean, developerModeParams?: BoltDeveloperModeParams): Promise<BoltEmbedded>;
    getDomainURL(testMode: boolean, developerModeParams?: BoltDeveloperModeParams): string;
    private getScriptOptions;
}

declare interface BoltTransaction {
    id: string;
    type: string;
    processor: string;
    date: number;
    reference: string;
    status: string;
    authorization: BoltAuthorization;
}

declare interface BraintreeAchInitializeOptions {
    /**
     * A callback that returns text that should be displayed to the customer in UI for proof of authorization
     */
    getMandateText: () => string;
}

declare class BraintreeAchPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private braintreeSdk;
    private usBankAccount?;
    private getMandateText?;
    constructor(paymentIntegrationService: PaymentIntegrationService, braintreeSdk: BraintreeSdk);
    initialize(options: PaymentInitializeOptions & WithBraintreeAchPaymentInitializeOptions): Promise<void>;
    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private tokenizePayment;
    private tokenizePaymentForVaultedInstrument;
    private preparePaymentData;
    private preparePaymentDataForVaultedInstrument;
    private getBankDetails;
    private getUsBankAccountOrThrow;
    private handleBraintreeError;
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

declare class BraintreeFastlaneCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private braintreeFastlaneUtils;
    private isAcceleratedCheckoutEnabled;
    constructor(paymentIntegrationService: PaymentIntegrationService, braintreeFastlaneUtils: BraintreeFastlaneUtils);
    initialize({ methodId, braintreefastlane, }: CustomerInitializeOptions & WithBraintreeFastlaneCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private shouldRunAuthenticationFlow;
    private getValidPaymentMethodOrThrow;
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
    onChange?: (showPayPalCardSelector: () => Promise<CardInstrument | undefined>) => void;
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

declare class BraintreeFastlanePaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private braintreeFastlaneUtils;
    private braintreeSdk;
    private braintreeCardComponent?;
    private is3DSEnabled?;
    private onError?;
    constructor(paymentIntegrationService: PaymentIntegrationService, braintreeFastlaneUtils: BraintreeFastlaneUtils, braintreeSdk: BraintreeSdk);
    /**
     *
     * Default methods
     *
     */
    initialize(options: PaymentInitializeOptions & WithBraintreeFastlanePaymentInitializeOptions): Promise<void>;
    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    /**
     *
     * Braintree Fastlane Component rendering method
     *
     */
    private initializeCardComponent;
    private renderBraintreeCardComponent;
    /**
     *
     * Payment Payload preparation methods
     *
     */
    private preparePaymentPayload;
    /**
     * 3DS
     */
    private get3DS;
    /**
     *
     * Mapper methods
     *
     */
    private mapToPayPalAddress;
    /**
     *
     * Other methods
     *
     */
    private shouldRunAuthenticationFlow;
    private getBraintreeCardComponentOrThrow;
    private getPayPalInstruments;
    /**
     *
     * Braintree Fastlane instrument change
     *
     */
    private handleBraintreeStoredInstrumentChange;
}

declare class BraintreeFastlaneUtils {
    private paymentIntegrationService;
    private braintreeIntegrationService;
    private braintreeFastlane?;
    private methodId?;
    constructor(paymentIntegrationService: PaymentIntegrationService, braintreeIntegrationService: BraintreeIntegrationService);
    getDeviceSessionId(): Promise<string | undefined>;
    /**
     *
     * Initialization method
     *
     */
    initializeBraintreeFastlaneOrThrow(methodId: string, styles?: BraintreeFastlaneStylesOption): Promise<void>;
    getBraintreeFastlaneOrThrow(): BraintreeFastlane;
    getBraintreeFastlaneComponentOrThrow(): BraintreeFastlane['FastlaneCardComponent'];
    /**
     *
     * Authentication methods
     *
     * */
    runPayPalAuthenticationFlowOrThrow(email?: string, shouldSetShippingOption?: boolean): Promise<void>;
    /**
     *
     * Session id management
     *
     */
    getSessionIdFromCookies(): string;
    saveSessionIdToCookies(sessionId: string): void;
    removeSessionIdFromCookies(): void;
    /**
     *
     * PayPal to BC data mappers
     *
     * */
    mapPayPalToBcInstrument(methodId: string, instruments?: BraintreeFastlaneVaultedInstrument[]): CardInstrument[] | undefined;
    private mapPayPalToBcAddress;
    /**
     *
     * Get PayPal billing addresses from stored braintree instruments info
     *
     * */
    private getPayPalBillingAddresses;
    private normalizeAddress;
    private mergeShippingAndBillingAddresses;
    /**
     *
     * Other
     *
     * */
    private getMethodIdOrThrow;
    private setShippingOption;
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

declare class BraintreeLocalMethodsPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private braintreeSdk;
    private braintreeRequestSender;
    private loadingIndicator;
    private pollingInterval;
    private maxPollingIntervalTime;
    private braintreelocalmethods?;
    private braintreeLocalPayment?;
    private loadingIndicatorContainer?;
    private orderId?;
    private gatewayId?;
    private isLPMsUpdateExperimentEnabled;
    private pollingTimer;
    private stopPolling;
    private isPollingEnabled;
    constructor(paymentIntegrationService: PaymentIntegrationService, braintreeSdk: BraintreeSdk, braintreeRequestSender: BraintreeRequestSender, loadingIndicator: LoadingIndicator, pollingInterval?: number, maxPollingIntervalTime?: number);
    initialize(options: PaymentInitializeOptions & WithBraintreeLocalMethodsPaymentInitializeOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    private executeWithNotInstantLPM;
    private executeWithInstantLPM;
    private getLPMsBasicPaymentData;
    private getInstantLPMConfig;
    private getInstantLPMCallback;
    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator;
    private handleError;
    /**
     *
     * Utils
     *
     * */
    private isNonInstantPaymentMethod;
    private isBraintreeRedirectError;
    private isBraintreeOrderSavedResponse;
    /**
     *
     * Polling mechanism
     *
     *
     * */
    private initializePollingMechanism;
    private deinitializePollingMechanism;
    private resetPollingMechanism;
    private reinitializeStrategy;
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
    onError?(error: BraintreeError | StandardError): void;
    /**
     * A callback that gets called when wallet button clicked
     */
    onClick?(): void;
}

declare class BraintreePaypalCreditCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private formPoster;
    private braintreeIntegrationService;
    private braintreeHostWindow;
    constructor(paymentIntegrationService: PaymentIntegrationService, formPoster: FormPoster, braintreeIntegrationService: BraintreeIntegrationService, braintreeHostWindow: BraintreeHostWindow);
    initialize(options: CustomerInitializeOptions & WithBraintreePaypalCreditCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private renderPayPalButton;
    private setupPayment;
    private tokenizePayment;
    private handleError;
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
    onError?(error: BraintreeError | StandardError): void;
    /**
     * A callback that gets called when wallet button clicked
     */
    onClick?(): void;
}

declare class BraintreePaypalCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private formPoster;
    private braintreeIntegrationService;
    private braintreeHostWindow;
    constructor(paymentIntegrationService: PaymentIntegrationService, formPoster: FormPoster, braintreeIntegrationService: BraintreeIntegrationService, braintreeHostWindow: BraintreeHostWindow);
    initialize(options: CustomerInitializeOptions & WithBraintreePaypalCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private renderPayPalButton;
    private setupPayment;
    private tokenizePayment;
    private handleError;
}

declare interface BraintreePaypalPaymentInitializeOptions {
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
    onPaymentError?(error: BraintreeError | StandardError): void;
    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: unknown): void;
}

declare class BraintreePaypalPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private braintreeIntegrationService;
    private braintreeMessages;
    private loadingIndicator;
    private paymentMethod?;
    private braintreeHostWindow;
    private braintree?;
    private braintreeTokenizePayload?;
    private paypalButtonRender?;
    private loadingIndicatorContainer?;
    constructor(paymentIntegrationService: PaymentIntegrationService, braintreeIntegrationService: BraintreeIntegrationService, braintreeMessages: BraintreeMessages, loadingIndicator: LoadingIndicator);
    initialize(options: PaymentInitializeOptions & WithBraintreePaypalPaymentInitializeOptions): Promise<void>;
    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private preparePaymentData;
    private formattedPayload;
    private loadPaypalCheckoutInstance;
    private renderPayPalMessages;
    private renderPayPalButton;
    private setupPayment;
    private tokenizePaymentOrThrow;
    private loadPaypal;
    private handleError;
    private isProviderError;
    private removeElement;
    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator;
}

declare class BraintreeRequestSender {
    private requestSender;
    constructor(requestSender: RequestSender);
    getOrderStatus(methodId?: string, options?: RequestOptions): Promise<BraintreeOrderStatusData>;
}

declare interface BraintreeVisaCheckoutCustomerInitializeOptions {
    container: string;
    /**
     * A callback that gets called when Visa Checkout fails to initialize or
     * selects a payment option.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: Error): void;
}

declare class BraintreeVisaCheckoutCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private formPoster;
    private braintreeSdk;
    private buttonClassName;
    private onError;
    constructor(paymentIntegrationService: PaymentIntegrationService, formPoster: FormPoster, braintreeSdk: BraintreeSdk);
    initialize(options: CustomerInitializeOptions & WithBraintreeVisaCheckoutCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private tokenizePayment;
    private postForm;
    private mapToVisaCheckoutAddress;
    private getAddress;
    private createSignInButton;
    private insertVisaCheckoutButton;
    private handleError;
}

declare enum CallbackIntentsType {
    OFFER = "OFFER",
    PAYMENT_AUTHORIZATION = "PAYMENT_AUTHORIZATION",
    SHIPPING_ADDRESS = "SHIPPING_ADDRESS",
    SHIPPING_OPTION = "SHIPPING_OPTION"
}

declare enum CallbackTriggerType {
    INITIALIZE = "INITIALIZE",
    SHIPPING_OPTION = "SHIPPING_OPTION",
    SHIPPING_ADDRESS = "SHIPPING_ADDRESS",
    OFFER = "OFFER"
}

declare class CheckoutComCreditCardPaymentStrategy extends CreditCardPaymentStrategy {
    private paymentIntegrationService;
    protected formPoster: FormPoster;
    constructor(paymentIntegrationService: PaymentIntegrationService, formPoster: FormPoster);
    finalize(options?: PaymentRequestOptions): Promise<void>;
    protected _executeWithoutHostedForm(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    protected _executeWithHostedForm(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    private _handleThreeDSecure;
}

declare class CheckoutComCustomPaymentStrategy extends CreditCardPaymentStrategy {
    protected paymentIntegrationService: PaymentIntegrationService;
    constructor(paymentIntegrationService: PaymentIntegrationService);
    finalize(options?: PaymentRequestOptions): Promise<void>;
    protected _executeWithHostedForm(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    protected _processResponse(error: unknown): Promise<void>;
    private _performRedirect;
}

declare class CheckoutComFawryPaymentStrategy extends CheckoutComCustomPaymentStrategy {
    protected _executeWithoutHostedForm(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    private _createFormattedPayload;
}

declare class CheckoutComSEPAPaymentStrategy extends CheckoutComCustomPaymentStrategy {
    protected _executeWithoutHostedForm(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    private _createFormattedPayload;
}

declare class CheckoutComiDealPaymentStrategy extends CheckoutComCustomPaymentStrategy {
    protected _executeWithoutHostedForm(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    private _createFormattedPayload;
}

declare interface Classes {
    base?: string;
    complete?: string;
    empty?: string;
    focus?: string;
    error?: string;
}

declare interface ClearpayDisplayOptions {
    token: string;
}

declare interface ClearpayInitializeOptions {
    countryCode: string;
}

declare class ClearpayPaymentStrategy implements PaymentStrategy {
    private _paymentIntegrationService;
    private _clearpayScriptLoader;
    private _clearpaySdk?;
    constructor(_paymentIntegrationService: PaymentIntegrationService, _clearpayScriptLoader: ClearpayScriptLoader);
    initialize(options: PaymentInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(options: PaymentRequestOptions): Promise<void>;
    private _redirectToClearpay;
    private _isCountrySupported;
    private _loadPaymentMethod;
}

declare class ClearpayScriptLoader {
    private _scriptLoader;
    _window: ClearpayWindow;
    constructor(_scriptLoader: ScriptLoader, _window?: ClearpayWindow);
    load(method: PaymentMethod): Promise<ClearpaySdk>;
    private _getScriptUrl;
}

declare interface ClearpaySdk {
    initialize(options: ClearpayInitializeOptions): void;
    redirect(options: ClearpayDisplayOptions): void;
}

declare interface ClearpayWindow extends Window {
    AfterPay?: ClearpaySdk;
}

declare interface ClickCallbackActions {
    reject(): void;
    resolve(): void;
}

declare interface ClickCallbackActions_2 {
    reject(): void;
    resolve(): void;
}

declare interface ClickCallbackPayload {
    fundingSource: string;
}

declare interface ClickCallbackPayload_2 {
    fundingSource: string;
}

declare interface CompleteCallbackDataPayload {
    intent: string;
    orderID: string;
}

declare interface CompleteCallbackDataPayload_2 {
    intent: string;
    orderID: string;
}

declare interface ConfirmOrderData {
    tokenizationData: {
        type: string;
        token: string;
    };
    info: {
        cardNetwork: string;
        cardDetails: string;
    };
    type: string;
}

declare interface ConfirmOrderData_2 {
    tokenizationData: {
        type: string;
        token: string;
    };
    info: {
        cardNetwork: string;
        cardDetails: string;
    };
    type: string;
}

declare interface CreateTokenError {
    field: string;
    type: string;
    message: string;
}

declare interface CreateTokenResponse {
    code: string;
    error?: CreateTokenError;
    token?: string;
    last4?: string;
    expiryMonth?: string;
    expiryYear?: string;
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

declare class CreditCardPaymentStrategy_2 implements PaymentStrategy {
    protected _paymentIntegrationService: PaymentIntegrationService;
    protected _hostedForm?: HostedForm;
    protected _shouldRenderHostedForm?: boolean;
    constructor(_paymentIntegrationService: PaymentIntegrationService);
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    initialize(options?: PaymentInitializeOptions & WithCreditCardPaymentInitializeOptions_2): Promise<void>;
    deinitialize(): Promise<void>;
    finalize(): Promise<void>;
    protected _executeWithoutHostedForm(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    protected _executeWithHostedForm(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    protected _isHostedPaymentFormEnabled(methodId?: string, gatewayId?: string): boolean;
    private _isHostedFieldAvailable;
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

declare interface CssStyles {
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    fontStyle?: string;
    fontWeight?: string;
    textDecoration?: string;
    padding?: string;
    paddingLeft?: string;
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
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

declare interface CustomerDefaultValues {
    mode: StripeFormMode;
    email: string;
    allowedCountries?: string[];
    display?: {
        name: DisplayName;
    };
}

declare class CyberSourcePaymentStrategy extends CreditCardPaymentStrategy {
    private _threeDSecureFlow;
    constructor(_paymentIntegrationService: PaymentIntegrationService, _threeDSecureFlow: CardinalThreeDSecureFlow);
    initialize(options: PaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
}

declare class CyberSourceV2PaymentStrategy extends CreditCardPaymentStrategy {
    private _threeDSecureFlow;
    constructor(_paymentIntegrationService: PaymentIntegrationService, _threeDSecureFlow: CardinalThreeDSecureFlowV2);
    initialize(options: PaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
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

declare enum DisplayName {
    SPLIT = "split",
    FULL = "full",
    ORGANIZATION = "organization"
}

declare enum ErrorReasonType {
    OFFER_INVALID = "OFFER_INVALID",
    PAYMENT_DATA_INVALID = "PAYMENT_DATA_INVALID",
    SHIPPING_ADDRESS_INVALID = "SHIPPING_ADDRESS_INVALID",
    SHIPPING_ADDRESS_UNSERVICEABLE = "SHIPPING_ADDRESS_UNSERVICEABLE",
    SHIPPING_OPTION_INVALID = "SHIPPING_OPTION_INVALID",
    OTHER_ERROR = "OTHER_ERROR"
}

declare class ExternalPaymentStrategy implements PaymentStrategy {
    private _formPoster;
    private _paymentIntegrationService;
    constructor(_formPoster: FormPoster, _paymentIntegrationService: PaymentIntegrationService);
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    initialize(): Promise<void>;
    deinitialize(): Promise<void>;
    protected redirectUrl(redirect_url: string): void;
    private _isAdditionalActionRequired;
}

declare interface ExtraPaymentData {
    deviceSessionId?: string;
    browser_info?: BrowserInfo;
}

declare interface FieldOptions {
    placeholder?: string;
    style?: Styles;
    classes?: Classes;
    brands?: string[];
}

declare enum FieldType {
    CARD_NUMBER = "card-number",
    CVV = "cvv",
    EXPIRY = "expiry"
}

declare interface FieldsOptions {
    billingDetails?: AutoOrNever | BillingDetailsProperties;
    phone?: string;
}

/**
 *
 * BigCommerce Payments Funding sources
 *
 */
declare type FundingType = string[];

declare type FundingType_2 = string[];

/**
 *
 * PayPal Commerce Funding sources
 *
 */
declare type FundingType_3 = string[];

declare interface GooglePayAdyenV2InitializationData extends GooglePayBaseInitializationData {
    originKey?: string;
    clientKey?: string;
    environment?: string;
    prefillCardHolderName?: boolean;
    paymentMethodsResponse: object;
}

declare interface GooglePayAdyenV3InitializationData extends GooglePayBaseInitializationData {
    clientKey: string;
    environment?: string;
    prefillCardHolderName?: boolean;
    paymentMethodsResponse: object;
}

declare type GooglePayAuthMethod = 'PAN_ONLY' | 'CRYPTOGRAM_3DS';

declare interface GooglePayAuthorizeNetInitializationData extends GooglePayBaseInitializationData {
    paymentGatewayId: string;
}

declare interface GooglePayBaseCardPaymentMethod extends GooglePayPaymentMethod<GooglePayCardParameters> {
    type: 'CARD';
    parameters: GooglePayCardParameters;
}

declare interface GooglePayBaseInitializationData {
    card_information?: {
        type: string;
        number: string;
        bin?: string;
        isNetworkTokenized?: boolean;
    };
    gateway: string;
    gatewayMerchantId?: string;
    googleMerchantId: string;
    googleMerchantName: string;
    isThreeDSecureEnabled: boolean;
    nonce?: string;
    platformToken: string;
    storeCountry?: string;
}

declare interface GooglePayBigCommercePaymentsInitializationData extends GooglePayBaseInitializationData {
    merchantId?: string;
    clientId: string;
    attributionId?: string;
    availableAlternativePaymentMethods: FundingType_2;
    buttonStyle?: PayPalButtonStyleOptions_2;
    buyerCountry?: string;
    clientToken?: string;
    enabledAlternativePaymentMethods: FundingType_2;
    isDeveloperModeApplicable?: boolean;
    intent?: BigCommercePaymentsIntent_2;
    isHostedCheckoutEnabled?: boolean;
    isPayPalCreditAvailable?: boolean;
    isVenmoEnabled?: boolean;
    isGooglePayEnabled?: boolean;
    orderId?: string;
    shouldRenderFields?: boolean;
    paymentButtonStyles?: Record<string, PayPalButtonStyleOptions_2>;
}

declare interface GooglePayBraintreeGatewayParameters extends GooglePayGatewayBaseParameters {
    'braintree:apiVersion'?: string;
    'braintree:authorizationFingerprint'?: string;
    'braintree:merchantId'?: string;
    'braintree:sdkVersion'?: string;
}

declare type GooglePayButtonColor = 'default' | 'black' | 'white';

declare interface GooglePayButtonOptions {
    onClick: (event: MouseEvent) => Promise<void>;
    allowedPaymentMethods: [GooglePayBaseCardPaymentMethod];
    buttonColor?: GooglePayButtonColor;
    buttonType?: GooglePayButtonType;
}

declare type GooglePayButtonType = 'book' | 'buy' | 'checkout' | 'donate' | 'order' | 'pay' | 'plain' | 'subscribe' | 'long' | 'short';

declare interface GooglePayCardData extends GooglePayPaymentMethodData<GooglePayCardInfo> {
    type: 'CARD';
}

declare interface GooglePayCardDataResponse extends GooglePayPaymentDataResponse<GooglePayCardInfo> {
    paymentMethodData: GooglePayCardData;
}

declare interface GooglePayCardInfo {
    cardNetwork: GooglePayCardNetwork;
    cardDetails: string;
    billingAddress?: GooglePayFullBillingAddress;
}

declare enum GooglePayCardNetwork {
    AMEX = "AMEX",
    DISCOVER = "DISCOVER",
    INTERAC = "INTERAC",
    JCB = "JCB",
    MC = "MASTERCARD",
    VISA = "VISA"
}

declare interface GooglePayCardParameters {
    allowedAuthMethods: GooglePayAuthMethod[];
    allowedCardNetworks: GooglePayCardNetwork[];
    billingAddressRequired?: boolean;
    billingAddressParameters?: {
        format?: 'MIN' | 'FULL';
        phoneNumberRequired?: boolean;
    };
}

declare interface GooglePayCardPaymentMethod extends GooglePayBaseCardPaymentMethod {
    tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY';
        parameters: GooglePayGatewayParameters;
    };
}

declare interface GooglePayCheckoutComInitializationData extends GooglePayBaseInitializationData {
    checkoutcomkey: string;
}

declare interface GooglePayConfig {
    allowedPaymentMethods: AllowedPaymentMethods[];
    apiVersion: number;
    apiVersionMinor: number;
    countryCode: string;
    isEligible: boolean;
    merchantInfo: {
        merchantId: string;
        merchantOrigin: string;
    };
}

declare interface GooglePayConfig_2 {
    allowedPaymentMethods: AllowedPaymentMethods_2[];
    apiVersion: number;
    apiVersionMinor: number;
    countryCode: string;
    isEligible: boolean;
    merchantInfo: {
        merchantId: string;
        merchantOrigin: string;
    };
}

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

declare class GooglePayCustomerStrategy implements CustomerStrategy {
    private _paymentIntegrationService;
    private _googlePayPaymentProcessor;
    private _paymentButton?;
    private _methodId?;
    constructor(_paymentIntegrationService: PaymentIntegrationService, _googlePayPaymentProcessor: GooglePayPaymentProcessor);
    initialize(options?: CustomerInitializeOptions & WithGooglePayCustomerInitializeOptions): Promise<void>;
    signIn(): Promise<void>;
    signOut(): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    deinitialize(): Promise<void>;
    private _getGooglePayClientOptions;
    private _addPaymentButton;
    private _handleClick;
    private _interactWithPaymentSheet;
    private _getMethodId;
}

declare interface GooglePayError {
    message: string;
    reason: ErrorReasonType;
    intent: CallbackTriggerType;
}

declare interface GooglePayFullBillingAddress extends GooglePayMinBillingAddress {
    address1: string;
    address2: string;
    address3: string;
    locality: string;
    administrativeArea: string;
    sortingCode: string;
}

declare class GooglePayGateway {
    private _gatewayIdentifier;
    private _paymentIntegrationService;
    private _getPaymentMethodFn?;
    private _isBuyNowFlow;
    private _currencyCode?;
    private _currencyService?;
    constructor(_gatewayIdentifier: string, _paymentIntegrationService: PaymentIntegrationService);
    mapToShippingAddressRequestBody({ shippingAddress, }: GooglePayCardDataResponse): AddressRequestBody | undefined;
    mapToBillingAddressRequestBody(response: GooglePayCardDataResponse): BillingAddressRequestBody | undefined;
    mapToExternalCheckoutData(response: GooglePayCardDataResponse): Promise<GooglePaySetExternalCheckoutData>;
    getRequiredData(): Promise<GooglePayRequiredPaymentData>;
    getCallbackIntents(): CallbackIntentsType[];
    getCallbackTriggers(): {
        [key: string]: CallbackTriggerType[];
    };
    getNonce(methodId: string): Promise<string>;
    extraPaymentData(): Promise<undefined | ExtraPaymentData>;
    getMerchantInfo(): GooglePayMerchantInfo;
    getTransactionInfo(): GooglePayTransactionInfo;
    getPaymentGatewayParameters(): Promise<GooglePayGatewayParameters> | GooglePayGatewayParameters;
    getCardParameters(): GooglePayCardParameters;
    initialize(getPaymentMethod: () => PaymentMethod<GooglePayInitializationData>, isBuyNowFlow?: boolean, currencyCode?: string): Promise<void>;
    handleShippingAddressChange(shippingAddress?: GooglePayFullBillingAddress): Promise<ShippingOptionParameters | undefined>;
    handleShippingOptionChange(optionId: string): Promise<import("@bigcommerce/checkout-sdk/payment-integration-api").PaymentIntegrationSelectors | undefined>;
    getTotalPrice(): string;
    handleCoupons(offerData: IntermediatePaymentData['offerData']): Promise<HandleCouponsOut>;
    getAppliedCoupons(): GooglePayPaymentDataRequest['offerInfo'];
    applyCoupon(code: string): Promise<GooglePayError | void>;
    protected getGooglePayInitializationData(): GooglePayInitializationData;
    protected getPaymentMethod(): PaymentMethod<GooglePayInitializationData>;
    protected getGatewayIdentifier(): string;
    protected setGatewayIdentifier(gateway?: string): void;
    private _isShippingAddressRequired;
    private _mapToAddressRequestBody;
    private _getFirstAndLastName;
    private _getCurrencyCodeOrThrow;
    private _getGooglePayShippingOption;
}

declare interface GooglePayGatewayBaseParameters {
    gateway: string;
}

declare interface GooglePayGatewayBaseRequest {
    apiVersion: 2;
    apiVersionMinor: 0;
}

declare type GooglePayGatewayBaseResponse = GooglePayGatewayBaseRequest;

declare type GooglePayGatewayParameters = GooglePayRegularGatewayParameters | GooglePayStripeGatewayParameters | GooglePayBraintreeGatewayParameters;

declare type GooglePayInitializationData = GooglePayBaseInitializationData | GooglePayAdyenV2InitializationData | GooglePayAdyenV3InitializationData | GooglePayAuthorizeNetInitializationData | GooglePayStripeInitializationData | GooglePayCheckoutComInitializationData | GooglePayPayPalCommerceInitializationData | GooglePayBigCommercePaymentsInitializationData;

declare interface GooglePayIsReadyToPayRequest extends GooglePayGatewayBaseRequest {
    allowedPaymentMethods: [GooglePayBaseCardPaymentMethod];
}

declare interface GooglePayIsReadyToPayResponse {
    result: boolean;
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

declare interface GooglePayMerchantInfo {
    merchantName: string;
    merchantId: string;
    authJwt: string;
}

declare interface GooglePayMinBillingAddress {
    name: string;
    postalCode: string;
    countryCode: string;
    phoneNumber?: string;
}

declare interface GooglePayPayPalCommerceInitializationData extends GooglePayBaseInitializationData {
    merchantId?: string;
    clientId: string;
    attributionId?: string;
    availableAlternativePaymentMethods: FundingType_2;
    buttonStyle?: PayPalButtonStyleOptions_2;
    buyerCountry?: string;
    clientToken?: string;
    enabledAlternativePaymentMethods: FundingType_2;
    isDeveloperModeApplicable?: boolean;
    intent?: PayPalCommerceIntent;
    isHostedCheckoutEnabled?: boolean;
    isPayPalCreditAvailable?: boolean;
    isVenmoEnabled?: boolean;
    isGooglePayEnabled?: boolean;
    orderId?: string;
    shouldRenderFields?: boolean;
    paymentButtonStyles?: Record<string, PayPalButtonStyleOptions_2>;
}

declare interface GooglePayPaymentDataRequest extends GooglePayGatewayBaseRequest {
    allowedPaymentMethods: [GooglePayCardPaymentMethod];
    transactionInfo: GooglePayTransactionInfo;
    merchantInfo: GooglePayMerchantInfo;
    emailRequired?: boolean;
    shippingAddressRequired?: boolean;
    shippingAddressParameters?: {
        allowedCountryCodes?: string[];
        phoneNumberRequired?: boolean;
    };
    offerInfo: Offers;
    shippingOptionRequired?: boolean;
    callbackIntents?: CallbackIntentsType[];
}

declare interface GooglePayPaymentDataResponse<T> extends GooglePayGatewayBaseResponse {
    paymentMethodData: GooglePayPaymentMethodData<T>;
    shippingAddress?: GooglePayFullBillingAddress;
    email?: string;
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

declare interface GooglePayPaymentMethod<T> {
    type: string;
    parameters: T;
}

declare interface GooglePayPaymentMethodData<T> {
    description: string;
    tokenizationData: {
        type: 'PAYMENT_GATEWAY';
        token: string;
    };
    type: string;
    info: T;
}

declare interface GooglePayPaymentOptions {
    paymentDataCallbacks?: {
        onPaymentDataChanged(intermediatePaymentData: IntermediatePaymentData): onPaymentDataChangedOut;
    };
}

declare class GooglePayPaymentProcessor {
    private _scriptLoader;
    private _gateway;
    private _requestSender;
    private _formPoster;
    private _paymentsClient?;
    private _baseRequest;
    private _baseCardPaymentMethod?;
    private _cardPaymentMethod?;
    private _paymentDataRequest?;
    private _isReadyToPayRequest?;
    constructor(_scriptLoader: GooglePayScriptLoader, _gateway: GooglePayGateway, _requestSender: RequestSender, _formPoster: FormPoster);
    initialize(getPaymentMethod: () => PaymentMethod<GooglePayInitializationData>, googlePayPaymentOptions?: GooglePayPaymentOptions, isBuyNowFlow?: boolean, currencyCode?: string): Promise<void>;
    initializeWidget(): Promise<void>;
    getNonce(methodId: string): Promise<string>;
    extraPaymentData(): Promise<import("./types").ExtraPaymentData | undefined>;
    addPaymentButton(containerId: string, options: Omit<GooglePayButtonOptions, 'allowedPaymentMethods'>): HTMLElement | undefined;
    showPaymentSheet(): Promise<GooglePayCardDataResponse>;
    setExternalCheckoutXhr(provider: string, response: GooglePayCardDataResponse): Promise<void>;
    setExternalCheckoutForm(provider: string, response: GooglePayCardDataResponse, siteLink?: string): Promise<void>;
    mapToBillingAddressRequestBody(response: GooglePayCardDataResponse): BillingAddressRequestBody | undefined;
    mapToShippingAddressRequestBody(response: GooglePayCardDataResponse): AddressRequestBody | undefined;
    processAdditionalAction(error: unknown, methodId?: string): Promise<void>;
    signOut(providerId: string): Promise<void>;
    getCallbackTriggers(): {
        [key: string]: import("./types").CallbackTriggerType[];
    };
    handleShippingAddressChange(shippingAddress: GooglePayFullBillingAddress): Promise<ShippingOptionParameters | undefined>;
    handleShippingOptionChange(optionId: string): Promise<void>;
    handleCoupons(offerData: IntermediatePaymentData['offerData']): Promise<HandleCouponsOut>;
    getTotalPrice(): string;
    _setExternalCheckout(provider: string, response: GooglePayCardDataResponse, useFormPoster?: boolean, siteLink?: string): Promise<void>;
    private _prefetchGooglePaymentData;
    private _determineReadinessToPay;
    private _buildButtonPayloads;
    private _buildWidgetPayloads;
    private _getBaseCardPaymentMethod;
    private _getPaymentDataRequest;
    private _getIsReadyToPayRequest;
    private _getPaymentsClient;
    private _getOrThrow;
}

declare class GooglePayPaymentStrategy implements PaymentStrategy {
    protected _paymentIntegrationService: PaymentIntegrationService;
    protected _googlePayPaymentProcessor: GooglePayPaymentProcessor;
    private _loadingIndicator;
    private _loadingIndicatorContainer?;
    private _paymentButton?;
    private _clickListener?;
    private _methodId?;
    constructor(_paymentIntegrationService: PaymentIntegrationService, _googlePayPaymentProcessor: GooglePayPaymentProcessor);
    initialize(options?: PaymentInitializeOptions & WithGooglePayPaymentInitializeOptions): Promise<void>;
    execute({ payment }: OrderRequestBody): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    protected _addPaymentButton(walletButton: string, callbacks: Omit<GooglePayPaymentInitializeOptions, 'walletButton'>): void;
    protected _handleClick({ onPaymentSelect, onError, }: Omit<GooglePayPaymentInitializeOptions, 'walletButton'>): (event: MouseEvent) => unknown;
    protected _interactWithPaymentSheet(): Promise<void>;
    protected _getMethodId(): keyof WithGooglePayPaymentInitializeOptions;
    protected _getIsSignedInOrThrow(): Promise<boolean>;
    protected _handleOfferTrigger(offerData: IntermediatePaymentData['offerData']): Promise<Partial<HandleCouponsOut>>;
    protected _getGooglePayClientOptions(countryCode?: string): GooglePayPaymentOptions;
    private _toggleLoadingIndicator;
}

declare interface GooglePayRegularGatewayParameters extends GooglePayGatewayBaseParameters {
    gatewayMerchantId: string;
}

declare type GooglePayRequiredPaymentData = Pick<GooglePayPaymentDataRequest, 'emailRequired' | 'shippingAddressRequired' | 'shippingAddressParameters' | 'shippingOptionRequired'>;

declare class GooglePayScriptLoader {
    private _scriptLoader;
    private _paymentsClient?;
    private _window;
    constructor(_scriptLoader: ScriptLoader);
    getGooglePaymentsClient(testMode?: boolean, options?: GooglePayPaymentOptions): Promise<GooglePaymentsClient>;
}

declare interface GooglePaySetExternalCheckoutData {
    nonce: string;
    card_information: {
        type: string;
        number: string;
        bin?: string;
        isNetworkTokenized?: boolean;
    };
    cart_id?: string;
}

declare interface GooglePayStripeGatewayParameters extends GooglePayGatewayBaseParameters {
    'stripe:version'?: string;
    'stripe:publishableKey'?: string;
}

declare interface GooglePayStripeInitializationData extends GooglePayBaseInitializationData {
    stripeConnectedAccount: string;
    stripePublishableKey: string;
    stripeVersion: string;
}

declare interface GooglePayTransactionInfo {
    /** [!] Required for EEA countries */
    countryCode?: string;
    currencyCode: string;
    totalPriceStatus: TotalPriceStatusType;
    totalPrice: string;
}

declare interface GooglePaymentsClient {
    isReadyToPay(request: GooglePayIsReadyToPayRequest): Promise<GooglePayIsReadyToPayResponse>;
    createButton(options: GooglePayButtonOptions): HTMLElement;
    loadPaymentData(request: GooglePayPaymentDataRequest): Promise<GooglePayCardDataResponse>;
    prefetchPaymentData(request: GooglePayPaymentDataRequest): void;
}

declare interface GoogleShippingOption {
    id: string;
    label?: string;
}

declare interface HandleCouponsOut {
    newOfferInfo: GooglePayPaymentDataRequest['offerInfo'];
    error?: GooglePayError;
}

declare class HummPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private formPoster;
    constructor(paymentIntegrationService: PaymentIntegrationService, formPoster: FormPoster);
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    initialize(): Promise<void>;
    deinitialize(): Promise<void>;
    private handleOffsiteRedirectResponse;
    private isOffsiteRedirectResponse;
}

declare interface InitCallbackActions {
    disable(): void;
    enable(): void;
}

declare interface InitCallbackActions_2 {
    disable(): void;
    enable(): void;
}

declare interface InitCallbackPayload {
    correlationID: string;
}

declare interface InitCallbackPayload_2 {
    correlationID: string;
}

declare interface IntermediatePaymentData {
    callbackTrigger: CallbackTriggerType;
    shippingAddress: GooglePayFullBillingAddress;
    shippingOptionData: GoogleShippingOption;
    offerData: {
        redemptionCodes: string[];
    };
}

declare interface KlarnaAddress {
    street_address: string;
    street_address2?: string;
    city: string;
    country: string;
    given_name: string;
    family_name: string;
    phone?: string;
    postal_code: string;
    region: string;
    email?: string;
}

declare interface KlarnaAddress_2 {
    street_address: string;
    street_address2?: string;
    city: string;
    country: string;
    given_name: string;
    family_name: string;
    phone?: string;
    postal_code: string;
    region: string;
    email?: string;
    organization_name?: string;
}

declare interface KlarnaAuthorizationResponse {
    authorization_token: string;
    approved: boolean;
    show_form: boolean;
    error?: {
        invalid_fields: string[];
    };
}

declare interface KlarnaAuthorizationResponse_2 {
    authorization_token?: string;
    approved: boolean;
    show_form?: boolean;
    error?: {
        invalid_fields: string[];
    };
}

declare interface KlarnaAuthorizeOptions {
    instance_id?: string;
    payment_method_category: string;
}

declare interface KlarnaCredit {
    authorize(data: KlarnaUpdateSessionParams, callback: (res: KlarnaAuthorizationResponse) => void): void;
    init(params: KlarnaInitParams): void;
    load(params: KlarnaLoadParams, callback: (res: KlarnaLoadResponse) => void): void;
}

declare interface KlarnaInitParams {
    client_token: string;
}

declare interface KlarnaInitParams_2 {
    client_token: string;
}

declare interface KlarnaLoadParams {
    container: string;
    payment_method_category?: string;
    payment_method_categories?: string;
    instance_id?: string;
    preferred_payment_method?: string;
}

declare interface KlarnaLoadParams_2 {
    container: string;
    payment_method_category?: string;
    payment_method_categories?: string;
    instance_id?: string;
    preferred_payment_method?: string;
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

declare class KlarnaPaymentStrategy {
    private paymentIntegrationService;
    private klarnaScriptLoader;
    private klarnaCredit?;
    private unsubscribe?;
    constructor(paymentIntegrationService: PaymentIntegrationService, klarnaScriptLoader: KlarnaScriptLoader);
    initialize(options: PaymentInitializeOptions & WithKlarnaPaymentInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    private loadWidget;
    private getUpdateSessionData;
    private needsStateCode;
    private mapToKlarnaAddress;
    private authorize;
}

declare interface KlarnaPayments {
    authorize(options: KlarnaAuthorizeOptions, data: KlarnaUpdateSessionParams_2, callback: (res: KlarnaAuthorizationResponse_2) => void): void;
    init(params: KlarnaInitParams_2): void;
    load(params: KlarnaLoadParams_2, callback: (res: KlarnaLoadResponse_2) => void): void;
}

declare class KlarnaScriptLoader {
    private scriptLoader;
    private klarnaWindow;
    constructor(scriptLoader: ScriptLoader, klarnaWindow?: KlarnaWindow);
    load(): Promise<KlarnaCredit>;
}

declare type KlarnaUpdateSessionParams = Partial<{
    billing_address: KlarnaAddress;
    shipping_address: KlarnaAddress;
}>;

declare type KlarnaUpdateSessionParams_2 = Partial<{
    billing_address: KlarnaAddress_2;
    shipping_address: KlarnaAddress_2;
}>;

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

declare class KlarnaV2PaymentStrategy {
    private paymentIntegrationService;
    private klarnav2ScriptLoader;
    private klarnav2TokenUpdater;
    private klarnaPayments?;
    private unsubscribe?;
    constructor(paymentIntegrationService: PaymentIntegrationService, klarnav2ScriptLoader: KlarnaV2ScriptLoader, klarnav2TokenUpdater: KlarnaV2TokenUpdater);
    initialize(options: PaymentInitializeOptions & WithKlarnaV2PaymentInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    private loadPaymentsWidget;
    private getUpdateSessionData;
    private needsStateCode;
    private mapToKlarnaAddress;
    private authorizeOrThrow;
    private isKlarnaSingleRadioButtonEnabled;
}

declare class KlarnaV2ScriptLoader {
    private scriptLoader;
    private klarnaWindow;
    constructor(scriptLoader: ScriptLoader, klarnaWindow?: KlarnaV2Window);
    load(): Promise<KlarnaPayments>;
}

declare class KlarnaV2TokenUpdater {
    private requestSender;
    constructor(requestSender: RequestSender);
    updateClientToken(gatewayId: string, { timeout, params }?: RequestOptions): Promise<Response<PaymentMethod>>;
    klarnaOrderInitialization(cartId: string, clientToken: string | undefined): Promise<void>;
}

declare interface KlarnaV2Window extends Window {
    Klarna?: {
        Payments: KlarnaPayments;
    };
}

declare interface KlarnaWindow extends Window {
    Klarna?: {
        Credit: KlarnaCredit;
    };
}

/**
 * The payment error encountered in the previous PaymentIntent confirmation. It will be cleared if the PaymentIntent is later updated for any reason.
 */
declare interface LastPaymentError {
    /**
     * A human-readable message providing more details about the error. For card errors, these messages can be shown to your users.
     */
    message?: string;
}

declare class LegacyPaymentStrategy implements PaymentStrategy {
    private _paymentIntegrationService;
    constructor(_paymentIntegrationService: PaymentIntegrationService);
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    initialize(): Promise<void>;
    deinitialize(): Promise<void>;
}

declare interface LegalFunding {
    FUNDING: {
        PAY_UPON_INVOICE: string;
    };
}

declare interface LegalFunding_2 {
    FUNDING: {
        PAY_UPON_INVOICE: string;
    };
}

declare enum LiabilityShiftEnum {
    Possible = "POSSIBLE",
    No = "NO",
    Unknown = "UNKNOWN",
    Yes = "YES"
}

declare enum LiabilityShiftEnum_2 {
    Possible = "POSSIBLE",
    No = "NO",
    Unknown = "UNKNOWN",
    Yes = "YES"
}

declare interface LineItem {
    name: string;
    amount: number;
}

declare interface MollieClient {
    createComponent(type: string, options?: object): MollieElement;
    createToken(): Promise<MollieToken>;
}

declare interface MollieElement {
    /**
     * The `element.mount` method attaches your element to the DOM.
     */
    mount(domElement: string | HTMLElement): void;
    /**
     * Unmounts the element from the DOM.
     * Call `element.mount` to re-attach it to the DOM.
     */
    unmount(): void;
    /**
     * Components can listen to several events.
     * The callback receives an object with all the related information.
     * blur | focus | change
     */
    addEventListener(event: 'blur' | 'focus' | 'change', callback: (event: Event) => void): void;
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

declare class MolliePaymentStrategy implements PaymentStrategy {
    private mollieScriptLoader;
    private paymentIntegrationService;
    private initializeOptions?;
    private mollieClient?;
    private cardHolderElement?;
    private cardNumberElement?;
    private verificationCodeElement?;
    private expiryDateElement?;
    private locale?;
    private hostedForm?;
    private unsubscribe?;
    constructor(mollieScriptLoader: MollieScriptLoader, paymentIntegrationService: PaymentIntegrationService);
    initialize(options: PaymentInitializeOptions & WithMolliePaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(options?: PaymentRequestOptions): Promise<void>;
    protected executeWithCC(payment: OrderPaymentRequestBody): Promise<void>;
    protected executeWithVaulted(payment: OrderPaymentRequestBody): Promise<void>;
    protected executeWithAPM(payment: OrderPaymentRequestBody): Promise<void>;
    private isCreditCard;
    private shouldShowTSVHostedForm;
    private mountCardVerificationfields;
    private isHostedPaymentFormEnabled;
    private isHostedFieldAvailable;
    private processAdditionalAction;
    private getInitializeOptions;
    private loadMollieJs;
    private getMollieClient;
    private getShopperLocale;
    /**
     * ContainerId is use in Mollie for determined either its showing or not the
     * container, because when Mollie has Vaulted Instruments it gets hide,
     * and shows an error because can't mount Provider Components
     *
     * We had to add a settimeout because Mollie sets de tab index after mounting
     * each component, but without a setTimeOut Mollie is not able to find the
     * components as they are hidden so we need to wait until they are shown
     */
    private mountElements;
    private loadPaymentMethodsAllowed;
}

declare class MollieScriptLoader {
    private scriptLoader;
    private mollieHostWindow;
    constructor(scriptLoader: ScriptLoader, mollieHostWindow?: Window);
    load(merchantId: string, locale: string, testmode: boolean): Promise<MollieClient>;
}

declare interface MollieToken {
    token: string;
    error?: object;
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

declare class MonerisPaymentStrategy {
    private paymentIntegrationService;
    private iframe?;
    private initializeOptions?;
    private windowEventListener?;
    private hostedForm?;
    constructor(paymentIntegrationService: PaymentIntegrationService);
    initialize(options: PaymentInitializeOptions & WithMonerisPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentInitializeOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private executeWithCC;
    private executeWithVaulted;
    private shouldShowTSVHostedForm;
    private isHostedPaymentFormEnabled;
    private isHostedFieldAvailable;
    private getInitializeOptions;
    private mountCardVerificationfields;
    private createIframe;
    private handleMonerisResponse;
    private monerisURL;
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

declare interface NewOfferInfo {
    newOfferInfo?: Offers;
}

declare interface NewShippingOptionParameters {
    newShippingOptionParameters?: ShippingOptionParameters;
}

declare interface NewTransactionInfo {
    newTransactionInfo: {
        currencyCode: string;
        totalPrice: string;
        totalPriceStatus: TotalPriceStatusType;
    };
}

declare class NoPaymentDataRequiredPaymentStrategy implements PaymentStrategy {
    private _paymentIntegrationService;
    constructor(_paymentIntegrationService: PaymentIntegrationService);
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    initialize(): Promise<void>;
    deinitialize(): Promise<void>;
}

declare interface OfferInfoItem {
    redemptionCode: string;
    description: string;
}

declare interface Offers {
    offers: OfferInfoItem[];
}

declare class OfflinePaymentStrategy implements PaymentStrategy {
    private _paymentIntegrationService;
    constructor(_paymentIntegrationService: PaymentIntegrationService);
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    initialize(): Promise<void>;
    deinitialize(): Promise<void>;
}

declare class OffsitePaymentStrategy implements PaymentStrategy {
    private _paymentIntegrationService;
    constructor(_paymentIntegrationService: PaymentIntegrationService);
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(options?: PaymentRequestOptions): Promise<void>;
    initialize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _shouldSubmitFullPayload;
}

declare interface PayPalAddress {
    city: string;
    countryCode: string;
    postalCode: string;
    state: string;
}

declare interface PayPalAddress_2 {
    city: string;
    countryCode: string;
    postalCode: string;
    state: string;
}

declare interface PayPalBNPLConfigurationItem {
    id: string;
    name: string;
    status: boolean;
    styles: Record<string, string>;
}

declare interface PayPalButtonStyleOptions {
    color?: StyleButtonColor;
    shape?: StyleButtonShape;
    height?: number;
    label?: StyleButtonLabel;
}

declare interface PayPalButtonStyleOptions_2 {
    color?: StyleButtonColor_2;
    shape?: StyleButtonShape_2;
    height?: number;
    label?: StyleButtonLabel_2;
}

declare interface PayPalButtonStyleOptions_3 {
    color?: StyleButtonColor_3;
    shape?: StyleButtonShape_3;
    height?: number;
    label?: StyleButtonLabel_3;
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

declare class PayPalCommerceAlternativeMethodsPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    private paypalCommerceSdk;
    private loadingIndicator;
    private pollingInterval;
    private maxPollingIntervalTime;
    private loadingIndicatorContainer?;
    private orderId?;
    private paypalButton?;
    private paypalApms?;
    private pollingTimer;
    private stopPolling;
    private isPollingEnabled;
    private paypalcommercealternativemethods?;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService, paypalCommerceSdk: PayPalCommerceSdk, loadingIndicator: LoadingIndicator, pollingInterval?: number, maxPollingIntervalTime?: number);
    initialize(options: PaymentInitializeOptions & WithPayPalCommerceAlternativeMethodsPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    /**
     *
     * Polling mechanism
     *
     *
     * */
    private initializePollingMechanism;
    private deinitializePollingMechanism;
    private resetPollingMechanism;
    private reinitializeStrategy;
    private handleError;
    /**
     *
     * Button methods/callbacks
     *
     * */
    private renderButton;
    private onCreateOrder;
    private handleApprove;
    private handleFailure;
    /**
     *
     * Fields methods
     *
     * */
    private renderFields;
    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator;
    /**
     *
     * Utils
     *
     * */
    private isNonInstantPaymentMethod;
    private getPaypalAmpsSdkOrThrow;
}

/**
 *
 * PayPal Commerce Buttons
 *
 */
declare interface PayPalCommerceButtons {
    render(id: string): void;
    close(): void;
    isEligible(): boolean;
}

declare interface PayPalCommerceButtonsOptions {
    experience?: string;
    style?: PayPalButtonStyleOptions_3;
    fundingSource: string;
    createOrder(): Promise<string>;
    onApprove(data: ApproveCallbackPayload_2, actions: ApproveCallbackActions_2): Promise<boolean | void> | void;
    onInit?(data: InitCallbackPayload_2, actions: InitCallbackActions_2): Promise<void>;
    onComplete?(data: CompleteCallbackDataPayload_2): Promise<void>;
    onClick?(data: ClickCallbackPayload_2, actions: ClickCallbackActions_2): Promise<void> | void;
    onError?(error: Error): void;
    onCancel?(): void;
    onShippingAddressChange?(data: ShippingAddressChangeCallbackPayload_2): Promise<void>;
    onShippingOptionsChange?(data: ShippingOptionChangeCallbackPayload_2): Promise<void>;
}

declare interface PayPalCommerceCardFields {
    isEligible(): boolean;
    CVVField(config?: PayPalCommerceFieldsInitializationData): PayPalCommerceFields;
    ExpiryField(config?: PayPalCommerceFieldsInitializationData): PayPalCommerceFields;
    NameField(config?: PayPalCommerceFieldsInitializationData): PayPalCommerceFields;
    NumberField(config?: PayPalCommerceFieldsInitializationData): PayPalCommerceFields;
    submit(config?: PayPalCommerceCardFieldsSubmitConfig): Promise<void>;
    getState(): Promise<PayPalCommerceCardFieldsState>;
}

declare type PayPalCommerceCardFieldsCard = PayPalCommerceHostedFieldsCard;

/**
 *
 * PayPal Commerce SDK
 *
 */
declare interface PayPalCommerceCardFieldsConfig {
    inputEvents: {
        onChange(data: PayPalCommerceCardFieldsState): void;
        onFocus(data: PayPalCommerceCardFieldsState): void;
        onBlur(data: PayPalCommerceCardFieldsState): void;
        onInputSubmitRequest(data: PayPalCommerceCardFieldsState): void;
    };
    createVaultSetupToken?: (data: PayPalCommerceCardFieldsState) => void;
    createOrder?: () => Promise<string>;
    style: PayPalCommerceHostedFieldsRenderOptions['styles'];
    onApprove(data: PayPalCommerceCardFieldsOnApproveData): void;
    onError(): void;
}

declare interface PayPalCommerceCardFieldsFieldData {
    isFocused: boolean;
    isEmpty: boolean;
    isValid: boolean;
    isPotentiallyValid: boolean;
}

declare interface PayPalCommerceCardFieldsOnApproveData {
    vaultSetupToken?: string;
    orderID: string;
    liabilityShift?: LiabilityShiftEnum_2;
}

declare interface PayPalCommerceCardFieldsState {
    cards: PayPalCommerceCardFieldsCard[];
    emittedBy: string;
    isFormValid: boolean;
    errors: string[];
    fields: {
        cardCvvField: PayPalCommerceCardFieldsFieldData;
        cardNumberField: PayPalCommerceCardFieldsFieldData;
        cardNameField?: PayPalCommerceCardFieldsFieldData;
        cardExpiryField: PayPalCommerceCardFieldsFieldData;
    };
}

declare interface PayPalCommerceCardFieldsSubmitConfig {
    billingAddress: {
        company?: string;
        addressLine1: string;
        addressLine2?: string;
        adminArea1: string;
        adminArea2: string;
        postalCode: string;
        countryCode?: string;
    };
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

declare class PayPalCommerceCreditCardsPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    private paypalCommerceSdk;
    private paypalCommerceFastlaneUtils;
    private executionPaymentData?;
    private isCreditCardForm?;
    private isCreditCardVaultedForm?;
    private cardFields?;
    private cvvField?;
    private expiryField?;
    private numberField?;
    private nameField?;
    private hostedFormOptions?;
    private returnedOrderId?;
    private returnedVaultedToken?;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService, paypalCommerceSdk: PayPalCommerceSdk, paypalCommerceFastlaneUtils: PayPalCommerceFastlaneUtils);
    initialize(options: PaymentInitializeOptions & WithPayPalCommerceCreditCardsPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    /**
     *
     * Submit Payment Payload preparing method
     *
     * `vaultedToken` is used when we pay with vaulted instrument (with trusted shipping address and untrusted)
     * `setupToken` is used when we pay with vaulted instrument (untrusted shipping address)
     * `orderId` is used in every case (basic card payment, trusted shipping address and untrusted)
     */
    private preparePaymentPayload;
    /**
     *
     * Card fields initialize
     *
     */
    private initializeFields;
    /**
     *
     * Get execute callback method
     * Depends on shipping address is trusted or not we should pass to PP
     * `createVaultSetupToken` callback if address is untrusted or
     * `createOrder` if address is trusted
     *
     */
    private getExecuteCallback;
    private createVaultSetupTokenCallback;
    private createOrderCallback;
    /**
     *
     * onApprove method
     * When submitting a form with a `submitHostedForm` method if there is no error
     * then onApprove callback is triggered and depends on the flow
     * we will receive an `orderID` if it's basic paying and `vaultSetupToken` if we are paying
     * with vaulted instrument and shipping address is untrusted
     *
     */
    private handleApprove;
    /**
     *
     * Rendering Card Fields methods
     *
     */
    private renderFields;
    private renderVaultedFields;
    /**
     *
     * Instrument params method
     *
     */
    private getInstrumentParams;
    private getFieldTypeByEmittedField;
    /**
     *
     * Form submit method
     * Triggers a form submit
     * */
    private submitHostedForm;
    /**
     *
     * Validation and errors
     *
     */
    private validateHostedFormOrThrow;
    private getValidityData;
    private getInvalidErrorByFieldType;
    private mapValidationErrors;
    /**
     *
     * Fields mappers
     *
     */
    private mapFieldType;
    /**
     *
     * Utils
     *
     */
    private getCardFieldsOrThrow;
    private getInputStyles;
    private stylizeInputContainers;
    private hasUndefinedValues;
    /**
     *
     * Input events methods
     *
     */
    private onChangeHandler;
    private onFocusHandler;
    private onBlurHandler;
    private onInputSubmitRequest;
    /**
     *
     * PayPal Commerce Accelerated checkout related methods
     *
     */
    private shouldInitializePayPalFastlane;
    private initializePayPalFastlaneOrThrow;
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

declare class PayPalCommerceCreditCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    private onError;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService);
    initialize(options: CustomerInitializeOptions & WithPayPalCommerceCreditCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private renderButton;
    private onHostedCheckoutApprove;
    private onShippingAddressChange;
    private onShippingOptionsChange;
    private handleError;
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

declare class PayPalCommerceCreditPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    private loadingIndicator;
    private paypalCommerceSdk;
    private loadingIndicatorContainer?;
    private orderId?;
    private paypalButton?;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService, loadingIndicator: LoadingIndicator, paypalCommerceSdk: PayPalCommerceSdk);
    initialize(options?: PaymentInitializeOptions & WithPayPalCommerceCreditPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    /**
     *
     * Button methods/callbacks
     *
     * */
    private renderButton;
    private handleClick;
    private handleApprove;
    private handleError;
    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator;
    /**
     *
     * Render Pay Later Messages
     *
     * */
    private renderMessages;
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

declare class PayPalCommerceCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    private onError;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService);
    initialize(options: CustomerInitializeOptions & WithPayPalCommerceCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private renderButton;
    private onHostedCheckoutApprove;
    private onShippingAddressChange;
    private onShippingOptionsChange;
    private handleError;
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

declare class PayPalCommerceFastlaneCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private paypalCommerceSdk;
    private paypalCommerceFastlaneUtils;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceSdk: PayPalCommerceSdk, paypalCommerceFastlaneUtils: PayPalCommerceFastlaneUtils);
    initialize(options: CustomerInitializeOptions & WithPayPalCommerceFastlaneCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    /**
     *
     * Authentication flow methods
     *
     */
    private runPayPalAuthenticationFlowOrThrow;
    private updateCustomerDataState;
    /**
     *
     * Fastlane styling methods
     *
     */
    private getFastlaneStyles;
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
    onChange?: (showPayPalCardSelector: () => Promise<CardInstrument | undefined>) => void;
    /**
     * Callback that handles errors
     */
    onError?: (error: unknown) => void;
    /**
     * Is a stylisation options for customizing PayPal Fastlane components
     *
     * Note: the styles for all PayPalCommerceFastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: PayPalFastlaneStylesOption_2;
}

declare interface PayPalCommerceFields {
    render(container: HTMLElement | string): Promise<void>;
    clear(): void;
    removeClass(className: string): Promise<void>;
    close(): Promise<void>;
}

declare interface PayPalCommerceFieldsInitializationData {
    placeholder?: string;
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

declare interface PayPalCommerceHostedFieldOption {
    selector: string;
    placeholder?: string;
}

declare interface PayPalCommerceHostedFields {
    submit(options?: PayPalCommerceHostedFieldsSubmitOptions): Promise<PayPalCommerceHostedFieldsApprove>;
    getState(): PayPalCommerceHostedFieldsState;
    on(eventName: string, callback: (event: PayPalCommerceHostedFieldsState) => void): void;
}

declare interface PayPalCommerceHostedFieldsApprove {
    orderId: string;
    liabilityShift?: 'POSSIBLE' | 'NO' | 'UNKNOWN';
}

declare interface PayPalCommerceHostedFieldsCard {
    type: string;
    niceType: string;
    code: {
        name: string;
        size: number;
    };
}

declare interface PayPalCommerceHostedFieldsFieldData {
    container: HTMLElement;
    isFocused: boolean;
    isEmpty: boolean;
    isPotentiallyValid: boolean;
    isValid: boolean;
}

/**
 *
 * PayPal Commerce Hosted Fields
 *
 */
declare interface PayPalCommerceHostedFieldsRenderOptions {
    fields?: {
        number?: PayPalCommerceHostedFieldOption;
        cvv?: PayPalCommerceHostedFieldOption;
        expirationDate?: PayPalCommerceHostedFieldOption;
    };
    paymentsSDK?: boolean;
    styles?: {
        input?: {
            [key: string]: string;
        };
        '.invalid'?: {
            [key: string]: string;
        };
        '.valid'?: {
            [key: string]: string;
        };
        ':focus'?: {
            [key: string]: string;
        };
    };
    createOrder(): Promise<string>;
}

declare interface PayPalCommerceHostedFieldsState {
    cards: PayPalCommerceHostedFieldsCard[];
    emittedBy: string;
    fields: {
        number?: PayPalCommerceHostedFieldsFieldData;
        expirationDate?: PayPalCommerceHostedFieldsFieldData;
        expirationMonth?: PayPalCommerceHostedFieldsFieldData;
        expirationYear?: PayPalCommerceHostedFieldsFieldData;
        cvv?: PayPalCommerceHostedFieldsFieldData;
        postalCode?: PayPalCommerceHostedFieldsFieldData;
    };
}

declare interface PayPalCommerceHostedFieldsSubmitOptions {
    contingencies?: Array<'3D_SECURE'>;
    cardholderName?: string;
}

/**
 *
 * PayPal Commerce Initialization Data
 *
 */
declare interface PayPalCommerceInitializationData {
    attributionId?: string;
    availableAlternativePaymentMethods: FundingType_3;
    buttonStyle?: PayPalButtonStyleOptions_3;
    buyerCountry?: string;
    clientId: string;
    clientToken?: string;
    enabledAlternativePaymentMethods: FundingType_3;
    isDeveloperModeApplicable?: boolean;
    intent?: PayPalCommerceIntent_2;
    isAcceleratedCheckoutEnabled?: boolean;
    isHostedCheckoutEnabled?: boolean;
    isPayPalCreditAvailable?: boolean;
    isVenmoEnabled?: boolean;
    isGooglePayEnabled?: boolean;
    merchantId?: string;
    orderId?: string;
    shouldRenderFields?: boolean;
    shouldRunAcceleratedCheckout?: boolean;
    paymentButtonStyles?: Record<string, PayPalButtonStyleOptions_3>;
    paypalBNPLConfiguration?: PayPalBNPLConfigurationItem[];
}

declare class PayPalCommerceIntegrationService {
    private formPoster;
    private paymentIntegrationService;
    private paypalCommerceRequestSender;
    private paypalCommerceScriptLoader;
    private paypalSdk?;
    constructor(formPoster: FormPoster, paymentIntegrationService: PaymentIntegrationService, paypalCommerceRequestSender: PayPalCommerceRequestSender, paypalCommerceScriptLoader: PayPalCommerceScriptLoader);
    /**
     *
     * PayPalSDK methods
     *
     */
    loadPayPalSdk(methodId: string, providedCurrencyCode?: string, initializesOnCheckoutPage?: boolean, forceLoad?: boolean): Promise<PayPalSDK_2 | undefined>;
    getPayPalSdkOrThrow(): PayPalSDK_2;
    /**
     *
     * Buy Now cart creation methods
     *
     */
    createBuyNowCartOrThrow(buyNowInitializeOptions: PayPalBuyNowInitializeOptions_2): Promise<Cart>;
    /**
     *
     * Order methods
     *
     */
    createOrder(providerId: string, requestBody?: Partial<PayPalCreateOrderRequestBody_2>): Promise<string>;
    createOrderCardFields(providerId: string, requestBody?: Partial<PayPalCreateOrderRequestBody_2>): Promise<PayPalCreateOrderCardFieldsResponse_2>;
    updateOrder(): Promise<void>;
    getOrderStatus(methodId?: string, options?: RequestOptions): Promise<PayPalOrderStatus_2>;
    /**
     *
     * Payment submitting and tokenizing methods
     *
     */
    tokenizePayment(methodId: string, orderId?: string): void;
    submitPayment(methodId: string, orderId: string, gatewayId?: string): Promise<void>;
    /**
     *
     * Shipping options methods
     *
     */
    getShippingOptionOrThrow(selectedShippingOptionId?: string): ShippingOption;
    /**
     *
     * Address transforming methods
     *
     */
    getAddress(address?: Partial<BillingAddressRequestBody>): BillingAddressRequestBody;
    getBillingAddressFromOrderDetails({ payer }: PayPalOrderDetails_2): BillingAddressRequestBody;
    getShippingAddressFromOrderDetails(orderDetails: PayPalOrderDetails_2): BillingAddressRequestBody;
    /**
     *
     * Buttons style methods
     *
     */
    getValidButtonStyle(style?: PayPalButtonStyleOptions_3): PayPalButtonStyleOptions_3;
    getValidHeight(height?: number): number;
    /**
     *
     * Utils methods
     *
     */
    removeElement(elementId?: string): void;
}

declare enum PayPalCommerceIntent {
    AUTHORIZE = "authorize",
    CAPTURE = "capture"
}

declare enum PayPalCommerceIntent_2 {
    AUTHORIZE = "authorize",
    CAPTURE = "capture"
}

/**
 *
 * PayPalCommerce Messages
 */
declare interface PayPalCommerceMessages {
    render(id: string): void;
}

declare interface PayPalCommerceMessagesOptions {
    amount: number;
    placement: string;
    style?: PayPalCommerceMessagesStyleOptions;
    fundingSource?: string;
}

declare interface PayPalCommerceMessagesStyleOptions {
    layout?: string;
}

/**
 *
 * PayPal Commerce Payment fields
 *
 */
declare interface PayPalCommercePaymentFields {
    render(id: string): void;
}

declare interface PayPalCommercePaymentFieldsOptions {
    style?: PayPalCommerceFieldsStyleOptions;
    fundingSource: string;
    fields: {
        name?: {
            value?: string;
        };
        email?: {
            value?: string;
        };
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
    container?: string;
    /**
     * The location to insert the Pay Later Messages.
     */
    bannerContainerId?: string;
    /**
     * If there is no need to initialize the Smart Payment Button, simply pass false as the option value.
     * The default value is true
     */
    shouldRenderPayPalButtonOnInitialization?: boolean;
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
    onValidate?(resolve: () => void, reject: () => void): Promise<void>;
    /**
     * A callback for submitting payment form that gets called
     * when buyer approved PayPal account.
     */
    submitForm?(): void;
}

declare class PayPalCommercePaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    private paypalCommerceSdk;
    private loadingIndicator;
    private loadingIndicatorContainer?;
    private orderId?;
    private paypalButton?;
    private paypalcommerce?;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService, paypalCommerceSdk: PayPalCommerceSdk, loadingIndicator: LoadingIndicator);
    initialize(options?: PaymentInitializeOptions & WithPayPalCommercePaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private prepareVaultedInstrumentPaymentPayload;
    private preparePaymentPayload;
    /**
     *
     * Button methods/callbacks
     *
     * */
    private renderButton;
    private handleClick;
    private handleApprove;
    private handleError;
    private createOrder;
    /**
     *
     * Vaulting flow methods
     *
     * */
    private getFieldsValues;
    private isTrustedVaultingFlow;
    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator;
    /**
     *
     * Guards
     *
     */
    private isPayPalVaultedInstrumentPaymentData;
    /**
     *
     * Render Pay Later Messages
     *
     * */
    private renderMessages;
    /**
     *
     * Error handling
     *
     */
    private isProviderError;
}

declare class PayPalCommerceRequestSender {
    private requestSender;
    constructor(requestSender: RequestSender);
    createOrder(providerId: string, requestBody: Partial<PayPalCreateOrderRequestBody_2>): Promise<PayPalOrderData_2>;
    updateOrder(requestBody: PayPalUpdateOrderRequestBody_2): Promise<PayPalUpdateOrderResponse_2>;
    getOrderStatus(methodId?: string, options?: RequestOptions): Promise<PayPalOrderStatusData_2>;
}

declare interface PayPalCommerceSDKFunding {
    CARD: string;
    PAYPAL: string;
    CREDIT: string;
    PAYLATER: string;
    OXXO: string;
    SEPA: string;
    VENMO: string;
}

declare class PayPalCommerceScriptLoader {
    private scriptLoader;
    private window;
    constructor(scriptLoader: ScriptLoader);
    getPayPalSDK(paymentMethod: PaymentMethod<PayPalCommerceInitializationData>, currencyCode: string, initializesOnCheckoutPage?: boolean, forceLoad?: boolean): Promise<PayPalSDK_2>;
    private loadPayPalSDK;
    private getPayPalSdkScriptConfigOrThrow;
    private transformConfig;
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

declare class PayPalCommerceVenmoCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService);
    initialize(options: CustomerInitializeOptions & WithPayPalCommerceVenmoCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private renderButton;
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

declare class PayPalCommerceVenmoPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    private loadingIndicator;
    private loadingIndicatorContainer?;
    private orderId?;
    private paypalButton?;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService, loadingIndicator: LoadingIndicator);
    initialize(options?: PaymentInitializeOptions & WithPayPalCommerceVenmoPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    /**
     *
     * Button methods/callbacks
     *
     * */
    private renderButton;
    private handleClick;
    private handleApprove;
    private handleError;
    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator;
}

declare interface PayPalCreateOrderCardFieldsResponse {
    orderId: string;
    setupToken?: string;
}

declare interface PayPalCreateOrderCardFieldsResponse_2 {
    orderId: string;
    setupToken?: string;
}

declare interface PayPalCreateOrderRequestBody extends HostedInstrument, VaultedInstrument {
    cartId: string;
    metadataId?: string;
    setupToken?: boolean;
    fastlaneToken?: string;
}

declare interface PayPalCreateOrderRequestBody_2 extends HostedInstrument, VaultedInstrument {
    cartId: string;
    metadataId?: string;
    setupToken?: boolean;
    fastlaneToken?: string;
}

declare type PayPalLegal = (params: {
    fundingSource: string;
}) => {
    render(container: string): void;
};

declare type PayPalLegal_2 = (params: {
    fundingSource: string;
}) => {
    render(container: string): void;
};

declare interface PayPalOrderAddress {
    address_line_1: string;
    address_line_2: string;
    admin_area_2: string;
    admin_area_1?: string;
    postal_code: string;
    country_code: string;
}

declare interface PayPalOrderAddress_2 {
    address_line_1: string;
    address_line_2: string;
    admin_area_2: string;
    admin_area_1?: string;
    postal_code: string;
    country_code: string;
}

declare interface PayPalOrderData {
    orderId: string;
    setupToken?: string;
    approveUrl: string;
}

declare interface PayPalOrderData_2 {
    orderId: string;
    setupToken?: string;
    approveUrl: string;
    fastlaneToken?: string;
}

declare interface PayPalOrderDetails {
    payer: {
        name: {
            given_name: string;
            surname: string;
        };
        email_address: string;
        address: PayPalOrderAddress;
        phone?: {
            phone_number: {
                national_number: string;
            };
        };
    };
    purchase_units: Array<{
        shipping: {
            address: PayPalOrderAddress;
            name: {
                full_name: string;
            };
        };
    }>;
}

declare interface PayPalOrderDetails_2 {
    payer: {
        name: {
            given_name: string;
            surname: string;
        };
        email_address: string;
        address: PayPalOrderAddress_2;
        phone?: {
            phone_number: {
                national_number: string;
            };
        };
    };
    purchase_units: Array<{
        shipping: {
            address: PayPalOrderAddress_2;
            name: {
                full_name: string;
            };
        };
    }>;
}

declare enum PayPalOrderStatus {
    Approved = "APPROVED",
    Created = "CREATED",
    PayerActionRequired = "PAYER_ACTION_REQUIRED",
    PollingStop = "POLLING_STOP",
    PollingError = "POLLING_ERROR"
}

declare interface PayPalOrderStatusData {
    status: PayPalOrderStatus;
}

declare interface PayPalOrderStatusData_2 {
    status: PayPalOrderStatus_2;
}

declare enum PayPalOrderStatus_2 {
    Approved = "APPROVED",
    Created = "CREATED",
    PayerActionRequired = "PAYER_ACTION_REQUIRED",
    PollingStop = "POLLING_STOP",
    PollingError = "POLLING_ERROR"
}

declare interface PayPalSDK {
    CardFields: (data: BigCommercePaymentsCardFieldsConfig) => Promise<BigCommercePaymentsCardFields>;
    Googlepay: () => {
        config: () => Promise<GooglePayConfig>;
        confirmOrder: (arg0: {
            orderId: string;
            paymentMethodData: ConfirmOrderData;
        }) => Promise<{
            status: string;
        }>;
        initiatePayerAction: () => void;
    };
    FUNDING: BigCommercePaymentsSDKFunding;
    HostedFields: {
        isEligible(): boolean;
        render(data: BigCommercePaymentsHostedFieldsRenderOptions): Promise<BigCommercePaymentsHostedFields>;
    };
    Legal: PayPalLegal & LegalFunding;
    Buttons(options: BigCommercePaymentsButtonsOptions): BigCommercePaymentsButtons;
    PaymentFields(options: BigCommercePaymentsPaymentFieldsOptions): BigCommercePaymentsPaymentFields;
    Messages(options: BigCommercePaymentsMessagesOptions): BigCommercePaymentsMessages;
}

declare interface PayPalSDK_2 {
    CardFields: (data: PayPalCommerceCardFieldsConfig) => Promise<PayPalCommerceCardFields>;
    Googlepay: () => {
        config: () => Promise<GooglePayConfig_2>;
        confirmOrder: (arg0: {
            orderId: string;
            paymentMethodData: ConfirmOrderData_2;
        }) => Promise<{
            status: string;
        }>;
        initiatePayerAction: () => void;
    };
    FUNDING: PayPalCommerceSDKFunding;
    HostedFields: {
        isEligible(): boolean;
        render(data: PayPalCommerceHostedFieldsRenderOptions): Promise<PayPalCommerceHostedFields>;
    };
    Legal: PayPalLegal_2 & LegalFunding_2;
    Buttons(options: PayPalCommerceButtonsOptions): PayPalCommerceButtons;
    PaymentFields(options: PayPalCommercePaymentFieldsOptions): PayPalCommercePaymentFields;
    Messages(options: PayPalCommerceMessagesOptions): PayPalCommerceMessages;
}

declare interface PayPalSelectedShippingOption {
    amount: {
        currency_code: string;
        value: string;
    };
    id: string;
    label: string;
    selected: boolean;
    type: string;
}

declare interface PayPalSelectedShippingOption_2 {
    amount: {
        currency_code: string;
        value: string;
    };
    id: string;
    label: string;
    selected: boolean;
    type: string;
}

declare interface PayPalUpdateOrderRequestBody {
    availableShippingOptions?: ShippingOption[];
    cartId: string;
    selectedShippingOption?: ShippingOption;
}

declare interface PayPalUpdateOrderRequestBody_2 {
    availableShippingOptions?: ShippingOption[];
    cartId: string;
    selectedShippingOption?: ShippingOption;
}

declare interface PayPalUpdateOrderResponse {
    statusCode: number;
}

declare interface PayPalUpdateOrderResponse_2 {
    statusCode: number;
}

declare interface PaymentDefaultValues {
    savePaymentMethod?: boolean;
    billingDetails?: BillingDetailsOptions;
}

/**
 * The PaymentIntent object.
 */
declare interface PaymentIntent {
    /**
     * Unique identifier for the object.
     */
    id: string;
    /**
     * Status of this PaymentIntent. Read more about each PaymentIntent [status](https://stripe.com/docs/payments/intents#intent-statuses).
     */
    status: 'succeeded' | string;
    /**
     * The payment error encountered in the previous PaymentIntent confirmation. It will be cleared if the PaymentIntent is later updated for any reason.
     */
    last_payment_error: LastPaymentError | null;
    payment_method_options?: StripePIPaymentMethodOptions;
}

/**
 * Object definition for part of the data sent to confirm the PaymentIntent.
 */
declare interface PaymentMethodDataOptions {
    billing_details: BillingDetailsOptions;
}

declare class PaypalCommerceFastlanePaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private paypalCommerceRequestSender;
    private paypalCommerceSdk;
    private paypalCommerceFastlaneUtils;
    private paypalComponentMethods?;
    private paypalFastlaneSdk?;
    private threeDSVerificationMethod?;
    private paypalcommercefastlane?;
    private orderId?;
    private methodId?;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceRequestSender: PayPalCommerceRequestSender, paypalCommerceSdk: PayPalCommerceSdk, paypalCommerceFastlaneUtils: PayPalCommerceFastlaneUtils);
    /**
     *
     * Default methods
     *
     * */
    initialize(options: PaymentInitializeOptions & WithPayPalCommerceFastlanePaymentInitializeOptions): Promise<void>;
    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    /**
     *
     * Authentication flow methods
     *
     */
    private shouldRunAuthenticationFlow;
    private runPayPalAuthenticationFlowOrThrow;
    /**
     *
     * PayPal Fastlane Card Component rendering method
     *
     */
    private initializePayPalPaymentComponent;
    private renderPayPalPaymentComponent;
    private getPayPalComponentMethodsOrThrow;
    /**
     *
     * Payment Payload preparation methods
     *
     */
    private prepareVaultedInstrumentPaymentPayload;
    private preparePaymentPayload;
    private createOrder;
    /**
     *
     * 3DSecure methods
     *
     * */
    private get3DSNonce;
    /**
     *
     * PayPal Fastlane instrument change
     *
     */
    private handlePayPalStoredInstrumentChange;
    /**
     *
     * PayPal Fastlane experiments handling
     *
     */
    private isPaypalCommerceFastlaneThreeDSAvailable;
    private handleError;
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

declare class PaypalCommerceRatepayPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    private loadingIndicator;
    private pollingInterval;
    private maxPollingIntervalTime;
    private guid?;
    private paypalcommerceratepay?;
    private loadingIndicatorContainer?;
    private pollingTimer;
    private stopPolling;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService, loadingIndicator: LoadingIndicator, pollingInterval?: number, maxPollingIntervalTime?: number);
    initialize(options: PaymentInitializeOptions & WithPayPalCommerceRatePayPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private normalizeDate;
    private formatDate;
    private renderLegalText;
    private handleError;
    private createFraudNetScript;
    private generateGUID;
    private loadFraudnetConfig;
    private reinitializeStrategy;
    /**
     *
     * Polling mechanism
     *
     *
     * */
    private initializePollingMechanism;
    private deinitializePollingMechanism;
    private resetPollingMechanism;
    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator;
}

declare class PaypalProPaymentStrategy extends CreditCardPaymentStrategy {
    protected paymentIntegrationService: PaymentIntegrationService;
    private threeDSecureFlow;
    constructor(paymentIntegrationService: PaymentIntegrationService, threeDSecureFlow: CardinalThreeDSecureFlow);
    initialize(options: PaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
}

declare class SagePayPaymentStrategy extends CreditCardPaymentStrategy {
    private paymentIntegrationService;
    private _formPoster;
    constructor(paymentIntegrationService: PaymentIntegrationService, _formPoster: FormPoster);
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(options?: PaymentRequestOptions): Promise<void>;
    private _isThreeDSTwoExperimentOn;
}

declare class SezzlePaymentStrategy extends ExternalPaymentStrategy_2 {
    protected redirectUrl(url: string): void;
}

declare interface ShippingAddressChangeCallbackPayload {
    orderId: string;
    shippingAddress: PayPalAddress;
}

declare interface ShippingAddressChangeCallbackPayload_2 {
    orderId: string;
    shippingAddress: PayPalAddress_2;
}

declare interface ShippingDefaultValues {
    name?: string;
    firstName?: string;
    lastName?: string;
    phone: string;
    address: Address;
}

declare interface ShippingOptionChangeCallbackPayload {
    orderId: string;
    selectedShippingOption: PayPalSelectedShippingOption;
}

declare interface ShippingOptionChangeCallbackPayload_2 {
    orderId: string;
    selectedShippingOption: PayPalSelectedShippingOption_2;
}

declare interface ShippingOptionParameters {
    defaultSelectedOptionId?: string;
    shippingOptions?: GoogleShippingOption[];
}

declare interface StripeAdditionalActionRequired {
    type: string;
    data: {
        token?: string;
        redirect_url?: string;
    };
}

/**
 * All available options are here https://stripe.com/docs/stripe-js/appearance-api#supported-css-properties
 */
declare interface StripeAppearanceOptions {
    variables?: Record<string, StripeAppearanceValues>;
    rules?: Record<string, Record<string, StripeAppearanceValues>>;
}

declare type StripeAppearanceValues = string | string[] | number | undefined;

declare interface StripeClient {
    /**
     * Use confirmPayment to confirm a PaymentIntent using data collected by the Payment Element.
     * When called, confirmPayment will attempt to complete any required actions,
     * such as authenticating your user by displaying a 3DS dialog or redirecting them to a bank authorization page.
     */
    confirmPayment(options: StripeConfirmPaymentData): Promise<StripeResult>;
    /**
     * When called, it will confirm the PaymentIntent with data you provide and carry out 3DS or other next actions if they are required.
     */
    confirmCardPayment(clientSecret: string): Promise<StripeResult>;
    /**
     * Retrieve a PaymentIntent using its client secret.
     */
    retrievePaymentIntent(clientSecret: string): Promise<StripeResult>;
    /**
     * Create an `Elements` instance, which manages a group of elements.
     */
    elements(options: StripeElementsOptions): StripeElements;
}

/**
 * Initialization options.
 */
declare interface StripeConfigurationOptions {
    /**
     * For usage with [Connect](https://stripe.com/docs/connect) only.
     * Specifying a connected account ID (e.g., acct_24BFMpJ1svR5A89k) allows you to perform actions on behalf of that account.
     */
    stripeAccount?: string;
    /**
     * Override your account's [API version](https://stripe.com/docs/api/versioning)
     */
    apiVersion?: string;
    /**
     * A locale used to globally configure localization in Stripe. Setting the locale here will localize error strings for all Stripe.js methods. It will also configure the locale for Elements and Checkout. Default is auto (Stripe detects the locale of the browser).
     * Note that Checkout supports a slightly different set of locales than Stripe.js.
     */
    locale?: string;
    betas?: string[];
}

/**
 * Parameters that will be passed on to the Stripe API to confirm the PaymentIntent.
 */
declare interface StripeConfirmParams {
    return_url?: string;
    payment_method_data?: PaymentMethodDataOptions;
}

/**
 * Data to be sent with a `stripe.confirmPayment` request.
 * Refer to the [Payment Intents API](https://stripe.com/docs/js/payment_intents/confirm_payment) for a full list of parameters.
 */
declare interface StripeConfirmPaymentData {
    /**
     * The Elements instance that was used to create the Payment Element.
     */
    elements: StripeElements;
    /**
     * Parameters that will be passed on to the Stripe API to confirm the PaymentIntent.
     */
    confirmParams?: StripeConfirmParams;
    /**
     * By default, confirmPayment will always redirect to your return_url after a successful confirmation.
     * If you set redirect: "if_required", then confirmPayment will only redirect if your user chooses a redirect-based payment method.
     */
    redirect?: StripeStringConstants.ALWAYS | StripeStringConstants.IF_REQUIRED;
    clientSecret?: string;
}

declare type StripeCustomFont = CssFontSource | CustomFontSource;

declare interface StripeCustomerEvent extends StripeEvent {
    collapsed?: boolean;
    authenticated: boolean;
    value: {
        email: string;
    };
}

declare interface StripeElement {
    /**
     * The `element.mount` method attaches your element to the DOM.
     */
    mount(domElement: string | HTMLElement): void;
    /**
     * Removes the element from the DOM and destroys it.
     * A destroyed element can not be re-activated or re-mounted to the DOM.
     */
    destroy(): void;
    /**
     * Unmounts the element from the DOM.
     * Call `element.mount` to re-attach it to the DOM.
     */
    unmount(): void;
    /**
     * The change event is triggered when the Element's value changes. The event payload always contains certain keys,
     * in addition to some Element-specific keys.
     * https://stripe.com/docs/js/element/events/on_change?type=paymentElement
     */
    on(event: StripeElementEvent, handler: (event: StripeEventType) => void): void;
    /**
     * Updates the options the Payment Element was initialized with. Updates are merged into the existing configuration.
     * https://docs.stripe.com/js/elements_object/update_payment_element
     */
    update(options?: StripeElementsCreateOptions): void;
    /**
     * This method collapses the Payment Element into a row of payment method tabs.
     * https://docs.stripe.com/js/elements_object/collapse_payment_element
     */
    collapse(): void;
}

declare enum StripeElementEvent {
    CLICK = "click",
    CHANGE = "change",
    READY = "ready",
    SHIPPING_ADDRESS_CHANGE = "shippingaddresschange",
    SHIPPING_RATE_CHANGE = "shippingratechange",
    CONFIRM = "confirm"
}

declare enum StripeElementType {
    PAYMENT = "payment",
    AUTHENTICATION = "linkAuthentication",
    SHIPPING = "address",
    EXPRESS_CHECKOUT = "expressCheckout"
}

declare interface StripeElementUpdateOptions {
    shouldShowTerms?: boolean;
}

declare interface StripeElements {
    /**
     * Creates an Elements instance, which manages a group of elements.
     * https://stripe.com/docs/js/elements_object/create
     */
    create(elementType: StripeElementType, options?: StripeElementsCreateOptions): StripeElement;
    /**
     * Looks up a previously created element.
     * https://stripe.com/docs/js/elements_object/get_payment_element or
     * https://stripe.com/docs/js/elements_object/get_link_authentication_element
     */
    getElement(elementType: StripeElementType): StripeElement | null;
    /**
     * Updates options on an existing instance of Elements.
     * https://stripe.com/docs/js/elements_object/update
     */
    update(options?: StripeUpdateElementsOptions): StripeElement;
    /**
     * Fetches updates from the associated PaymentIntent or SetupIntent on an existing instance of Elements,
     * and reflects these updates in the Payment Element.
     * https://stripe.com/docs/js/elements_object/fetch_updates
     */
    fetchUpdates(): Promise<void>;
}

/**
 * All available options are here https://stripe.com/docs/js/elements_object/create_payment_element
 */
declare interface StripeElementsCreateOptions {
    mode?: string;
    fields?: FieldsOptions;
    wallets?: WalletOptions;
    allowedCountries?: string[];
    defaultValues?: ShippingDefaultValues | CustomerDefaultValues | PaymentDefaultValues;
    validation?: validationElement;
    display?: {
        name: DisplayName;
    };
    terms?: TermOptions;
    layout?: StripeLayoutOptions;
    paymentMethodOrder?: string[];
    lineItems?: LineItem[];
    allowedShippingCountries?: string[];
    shippingAddressRequired?: boolean;
    shippingRates?: StripeLinkV2ShippingRate[];
    billingAddressRequired?: boolean;
    emailRequired?: boolean;
    phoneNumberRequired?: boolean;
    paymentMethods?: {
        link: StripeStringConstants.AUTO;
        applePay: StripeStringConstants.NEVER;
        googlePay: StripeStringConstants.NEVER;
        amazonPay: StripeStringConstants.NEVER;
        paypal: StripeStringConstants.NEVER;
        klarna: StripeStringConstants.NEVER;
    };
    buttonHeight?: number;
    savePaymentMethod?: StripeSavePaymentMethod;
}

declare interface StripeElementsOptions {
    /**
     * An array of custom fonts, which elements created from the Elements object can use.
     * Fonts can be specified as [CssFontSource](https://stripe.com/docs/js/appendix/css_font_source_object)
     * or [CustomFontSource](https://stripe.com/docs/js/appendix/custom_font_source_object) objects.
     */
    fonts?: StripeCustomFont[];
    /**
     * A [locale](https://stripe.com/docs/js/appendix/supported_locales) to display placeholders and
     * error strings in. Default is auto (Stripe detects the locale of the browser).
     * Setting the locale does not affect the behavior of postal code validation—a valid postal code
     * for the billing country of the card is still required.
     */
    locale?: string;
    /**
     * The client secret of this PaymentIntent. Used for client-side retrieval using a publishable key.
     * The client secret can be used to complete a payment from your frontend.
     * It should not be stored, logged, embedded in URLs, or exposed to anyone other than the customer.
     * Make sure that you have TLS enabled on any page that includes the client secret.
     * Refer to our docs to accept a payment and learn about how client_secret should be handled.
     */
    clientSecret?: string;
    /**
     * A token that represents the Stripe customer session.
     * Stripe documentation: https://docs.stripe.com/api/checkout/sessions
     */
    customerSessionClientSecret?: string;
    /**
     * Match the design of your site with the appearance option.
     * The layout of each Element stays consistent, but you can modify colors, fonts, borders, padding, and more.
     */
    appearance?: StripeAppearanceOptions;
    mode?: string;
    amount?: number;
    currency?: string;
    paymentMethodTypes?: string[];
}

declare interface StripeError {
    /**
     * type of error. When the error type is card_error or validation_error, you can display the error message in error.message directly to your user.
     */
    type: string;
    /**
     * A human-readable message providing more details about the error. For card errors, these messages can be shown to your users.
     */
    message?: string;
    /**
     * The PaymentIntent object.
     */
    payment_intent: PaymentIntent;
}

declare interface StripeEvent {
    complete: boolean;
    elementType: string;
    empty: boolean;
}

declare type StripeEventType = StripeShippingEvent | StripeCustomerEvent | StripePaymentEvent | StripeLinkV2Event;

declare enum StripeFormMode {
    SHIPPING = "shipping",
    BILLING = "billing"
}

declare interface StripeHostWindow extends Window {
    bcStripeClient?: StripeClient;
    bcStripeElements?: StripeElements;
    Stripe?<T = StripeClient>(stripePublishableKey: string, options?: StripeConfigurationOptions): T;
}

declare interface StripeInitializationData {
    stripePublishableKey: string;
    stripeConnectedAccount: string;
    shopperLanguage: string;
    customerSessionToken?: string;
    enableLink?: boolean;
}

declare enum StripeInstrumentSetupFutureUsage {
    ON_SESSION = "on_session",
    OFF_SESSION = "off_session"
}

declare class StripeIntegrationService {
    private paymentIntegrationService;
    private scriptLoader;
    private isMounted;
    private checkoutEventsUnsubscribe?;
    constructor(paymentIntegrationService: PaymentIntegrationService, scriptLoader: StripeScriptLoader);
    deinitialize(): void;
    initCheckoutEventsSubscription(gatewayId: string, methodId: string, stripeInitializationOptions: StripeUPEPaymentInitializeOptions | StripeOCSPaymentInitializeOptions, stripeElements?: StripeElements): void;
    mountElement(stripeElement: StripeElement, containerId: string): void;
    mapAppearanceVariables(styles: NonNullable<StripeUPEPaymentInitializeOptions['style']>): {
        colorPrimary: import("./stripe").StripeAppearanceValues;
        colorBackground: import("./stripe").StripeAppearanceValues;
        colorText: import("./stripe").StripeAppearanceValues;
        colorDanger: import("./stripe").StripeAppearanceValues;
        colorTextSecondary: import("./stripe").StripeAppearanceValues;
        colorTextPlaceholder: import("./stripe").StripeAppearanceValues;
        colorIcon: import("./stripe").StripeAppearanceValues;
    };
    mapInputAppearanceRules(styles: NonNullable<StripeUPEPaymentInitializeOptions['style']>): {
        borderColor: import("./stripe").StripeAppearanceValues;
        color: import("./stripe").StripeAppearanceValues;
        boxShadow: import("./stripe").StripeAppearanceValues;
    };
    throwStripeError(stripeError?: unknown): never;
    throwDisplayableStripeError(stripeError: StripeError): void;
    isCancellationError(stripeError?: StripeError): boolean;
    throwPaymentConfirmationProceedMessage(): void;
    isPaymentCompleted(methodId: string, stripeUPEClient?: StripeClient): Promise<boolean>;
    mapStripePaymentData(stripeElements?: StripeElements, returnUrl?: string): StripeConfirmPaymentData;
    isAdditionalActionError(errors: Array<{
        code: string;
    }>): boolean;
    isRedirectAction(additionalAction: StripeAdditionalActionRequired): boolean;
    isOnPageAdditionalAction(additionalAction: StripeAdditionalActionRequired): boolean;
    updateStripePaymentIntent(gatewayId: string, methodId: string): Promise<void>;
    private _mapStripeAddress;
}

declare interface StripeLayoutOptions {
    type?: 'accordion' | 'tabs';
    linkInAccordion?: boolean;
    defaultCollapsed?: boolean;
    radios?: boolean;
    spacedAccordionItems?: boolean;
    visibleAccordionItemsCount?: number;
}

declare class StripeLinkV2CustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private scriptLoader;
    private stripeIntegrationService;
    private loadingIndicator;
    private _stripeClient?;
    private _stripeElements?;
    private _linkV2Element?;
    private _amountTransformer?;
    private _onComplete?;
    private _loadingIndicatorContainer?;
    private _currencyCode?;
    constructor(paymentIntegrationService: PaymentIntegrationService, scriptLoader: StripeScriptLoader, stripeIntegrationService: StripeIntegrationService, loadingIndicator: LoadingIndicator);
    initialize(options: CustomerInitializeOptions & WithStripeOCSCustomerInitializeOptions): Promise<void>;
    signIn(): Promise<void>;
    signOut(): Promise<void>;
    executePaymentMethodCheckout(): Promise<void>;
    deinitialize(): Promise<void>;
    private _mountExpressCheckoutElement;
    /** Events * */
    private _initializeEvents;
    private _onShippingAddressChange;
    private _onShippingRateChange;
    /** Confirm methods * */
    private _onConfirm;
    private _updateShippingAndBillingAddress;
    private _mapShippingAddress;
    private _mapBillingAddress;
    private _processAdditionalAction;
    private _confirmStripePaymentOrThrow;
    private _completeCheckoutFlow;
    private _getPaymentPayload;
    /** Utils * */
    private _shouldRequireShippingAddress;
    private _updateDisplayedPrice;
    private _getCurrency;
    private _getTotalPrice;
    private _getAvailableCountries;
    private _getAvailableShippingOptions;
    private _getStripeShippingOption;
    private _handleShippingOptionChange;
    private _getAmountTransformer;
    private _toCents;
    private _toggleLoadingIndicator;
}

declare interface StripeLinkV2Event {
    value?: null;
    billingDetails?: {
        name?: string;
        email?: string;
        phone?: string;
        address?: {
            line1?: string;
            city?: string;
            country?: string;
            postal_code?: string;
            state?: string;
        };
    };
    shippingAddress?: {
        name?: string;
        address?: {
            line1?: string;
            line2?: string;
            city?: string;
            country?: string;
            postal_code?: string;
            state?: string;
        };
    };
    address?: {
        line1?: string;
        city?: string;
        country?: string;
        postal_code?: string;
        state?: string;
    };
    shippingRate?: StripeLinkV2ShippingRate;
    elementType: string;
    expressPaymentType: string;
    resolve(data: StripeLinkV2EventResolveData): void;
}

declare interface StripeLinkV2EventResolveData {
    lineItems?: LineItem[];
    allowedShippingCountries?: string[];
    shippingAddressRequired?: boolean;
    shippingRates?: StripeLinkV2ShippingRate[];
    billingAddressRequired?: boolean;
    emailRequired?: boolean;
    phoneNumberRequired?: boolean;
}

declare interface StripeLinkV2ShippingRate {
    id: string;
    amount: number;
    displayName: string;
}

declare interface StripeOCSCustomerInitializeOptions {
    buttonHeight?: number;
    /**
     * The ID of a container which the stripe iframe should be inserted.
     */
    container: string;
    /**
     * The identifier of the payment method.
     */
    methodId: string;
    gatewayId: string;
    onComplete?: (orderId?: number) => Promise<never>;
    loadingContainerId?: string;
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

declare class StripeOCSPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private scriptLoader;
    private stripeIntegrationService;
    private stripeClient?;
    private stripeElements?;
    private selectedMethodId?;
    constructor(paymentIntegrationService: PaymentIntegrationService, scriptLoader: StripeScriptLoader, stripeIntegrationService: StripeIntegrationService);
    initialize(options: PaymentInitializeOptions & WithStripeOCSPaymentInitializeOptions): Promise<void>;
    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _initializeStripeElement;
    private _loadStripeJs;
    private _collapseStripeElement;
    private _getPaymentPayload;
    private _processAdditionalAction;
    private _confirmStripePaymentOrThrow;
    private _onStripeElementChange;
    private _shouldSaveCard;
}

declare interface StripePIPaymentMethodOptions {
    card?: {
        setup_future_usage?: StripeInstrumentSetupFutureUsage;
    };
}

declare interface StripePaymentEvent extends StripeEvent {
    value: {
        type: StripePaymentMethodType;
    };
    collapsed?: boolean;
}

declare enum StripePaymentMethodType {
    CreditCard = "card",
    Link = "link",
    EPS = "eps",
    GRABPAY = "grabpay",
    BANCONTACT = "bancontact",
    IDEAL = "ideal",
    ALIPAY = "alipay",
    KLARNA = "klarna",
    OCS = "optimized_checkout"
}

declare interface StripeResult {
    paymentIntent?: PaymentIntent;
    error?: StripeError;
}

declare interface StripeSavePaymentMethod {
    maxVisiblePaymentMethods?: number;
}

declare class StripeScriptLoader {
    private scriptLoader;
    private stripeWindow;
    constructor(scriptLoader: ScriptLoader, stripeWindow?: StripeHostWindow);
    getStripeClient(initializationData: StripeInitializationData, betas?: string[], apiVersion?: string): Promise<StripeClient>;
    getElements(stripeClient: StripeClient, options: StripeElementsOptions): Promise<StripeElements>;
    updateStripeElements(options: StripeElementsOptions): Promise<void>;
    private load;
}

declare interface StripeShippingEvent extends StripeEvent {
    mode?: string;
    isNewAddress?: boolean;
    phoneFieldRequired: boolean;
    value: {
        address: Address;
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

declare enum StripeStringConstants {
    NEVER = "never",
    AUTO = "auto",
    ALWAYS = "always",
    PAYMENT = "payment",
    IF_REQUIRED = "if_required"
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

declare class StripeUPECustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private scriptLoader;
    private _stripeElements?;
    constructor(paymentIntegrationService: PaymentIntegrationService, scriptLoader: StripeScriptLoader);
    initialize(options: CustomerInitializeOptions & WithStripeUPECustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
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

declare class StripeUPEPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private scriptLoader;
    private stripeIntegrationService;
    private _stripeUPEClient?;
    private _stripeElements?;
    private _isStripeElementUpdateEnabled?;
    constructor(paymentIntegrationService: PaymentIntegrationService, scriptLoader: StripeScriptLoader, stripeIntegrationService: StripeIntegrationService);
    initialize(options: PaymentInitializeOptions & WithStripeUPEPaymentInitializeOptions): Promise<void>;
    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _executeWithStripeConfirmation;
    private _executeWithVaulted;
    private _loadStripeElement;
    private _processAdditionalActionWithStripeConfirmation;
    private _confirmStripePaymentOrThrow;
    private _processVaultedAdditionalAction;
    private _loadStripeJs;
    private _getPaymentPayload;
    private _updateStripeElement;
    private _getStripeElementTerms;
    private _updateStripeLinkStateByElementType;
}

declare interface StripeUpdateElementsOptions {
    /**
     * A [locale](https://stripe.com/docs/js/appendix/supported_locales) to display placeholders and
     * error strings in. Default is auto (Stripe detects the locale of the browser).
     * Setting the locale does not affect the behavior of postal code validation—a valid postal code
     * for the billing country of the card is still required.
     */
    locale?: string;
    /**
     * Match the design of your site with the appearance option.
     * The layout of each Element stays consistent, but you can modify colors, fonts, borders, padding, and more.
     */
    appearance?: StripeAppearanceOptions;
    mode?: string;
    amount?: number;
    currency?: string;
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

declare enum StyleButtonColor_3 {
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

declare enum StyleButtonLabel_3 {
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
    pill = "pill",
    rect = "rect"
}

declare enum StyleButtonShape_3 {
    pill = "pill",
    rect = "rect"
}

declare interface Styles {
    base?: CssStyles;
    complete?: CssStyles;
    empty?: CssStyles;
    error?: CssStyles;
}

declare interface TDCustomCheckoutSDK {
    create(fieldType: FieldType, options?: FieldOptions): TdOnlineMartElement;
    createToken(callback: (result: CreateTokenResponse) => void): void;
}

declare class TDOnlineMartPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private tdOnlineMartScriptLoader;
    private formPoster;
    private tdOnlineMartClient?;
    private tdInputs;
    constructor(paymentIntegrationService: PaymentIntegrationService, tdOnlineMartScriptLoader: TDOnlineMartScriptLoader, formPoster: FormPoster);
    initialize(options: PaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private getPaymentPayloadOrThrow;
    private mountHostedFields;
    private loadTDOnlineMartJs;
    private getTokenOrThrow;
    private getTDOnlineMartClientOrThrow;
    private processWithAdditionalAction;
    private throwTokenizationError;
    private getHostedFieldsOptions;
    private isTrustedVaultingInstrument;
}

declare class TDOnlineMartScriptLoader {
    private scriptLoader;
    private tdOnlineMartWindow;
    constructor(scriptLoader: ScriptLoader, tdOnlineMartWindow?: TdOnlineMartHostWindow);
    load(): Promise<TDCustomCheckoutSDK>;
}

declare interface TdOnlineMartElement {
    mount(cssSelector: string): void;
    unmount(): void;
}

declare interface TdOnlineMartHostWindow extends Window {
    customcheckout?(): TDCustomCheckoutSDK;
}

declare interface TermOptions {
    card?: AutoOrNever;
}

declare enum TotalPriceStatusType {
    ESTIMATED = "ESTIMATED",
    FINAL = "FINAL",
    NOT_CURRENTLY_KNOWN = "NOT_CURRENTLY_KNOWN"
}

declare interface WalletOptions {
    applePay?: AutoOrNever;
    googlePay?: AutoOrNever;
    link?: AutoOrNever;
}

declare interface WithAmazonPayV2CustomerInitializeOptions {
    amazonpay?: AmazonPayV2CustomerInitializeOptions;
}

declare interface WithAmazonPayV2PaymentInitializeOptions {
    amazonpay?: AmazonPayV2PaymentInitializeOptions;
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

declare interface WithBigCommercePaymentsAlternativeMethodsPaymentInitializeOptions {
    bigcommerce_payments_apms?: BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions;
}

declare interface WithBigCommercePaymentsCreditCardsPaymentInitializeOptions {
    bigcommerce_payments_creditcards?: BigCommercePaymentsCreditCardsPaymentInitializeOptions;
}

declare interface WithBigCommercePaymentsCustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using BigCommercePayments.
     */
    bigcommerce_payments?: BigCommercePaymentsCustomerInitializeOptions;
}

declare interface WithBigCommercePaymentsFastlaneCustomerInitializeOptions {
    bigcommerce_payments_fastlane?: BigCommercePaymentsFastlaneCustomerInitializeOptions;
}

declare interface WithBigCommercePaymentsFastlanePaymentInitializeOptions {
    bigcommerce_payments_fastlane?: BigCommercePaymentsFastlanePaymentInitializeOptions;
}

declare interface WithBigCommercePaymentsPayLaterCustomerInitializeOptions {
    bigcommerce_payments_paylater?: BigCommercePaymentsPayLaterCustomerInitializeOptions;
}

declare interface WithBigCommercePaymentsPayLaterPaymentInitializeOptions {
    bigcommerce_payments_paylater?: BigCommercePaymentsPayLaterPaymentInitializeOptions;
}

declare interface WithBigCommercePaymentsPaymentInitializeOptions {
    bigcommerce_payments?: BigCommercePaymentsPaymentInitializeOptions;
}

declare interface WithBigCommercePaymentsRatePayPaymentInitializeOptions {
    bigcommerce_payments_ratepay?: BigCommercePaymentsRatePayPaymentInitializeOptions;
}

declare interface WithBigCommercePaymentsVenmoCustomerInitializeOptions {
    bigcommerce_payments_venmo?: BigCommercePaymentsVenmoCustomerInitializeOptions;
}

declare interface WithBigCommercePaymentsVenmoPaymentInitializeOptions {
    bigcommerce_payments_venmo?: BigCommercePaymentsVenmoPaymentInitializeOptions;
}

declare interface WithBlueSnapDirectCardHolderName {
    cardHolderName?: string;
}

declare interface WithBlueSnapV2PaymentInitializeOptions {
    bluesnapv2?: BlueSnapV2PaymentInitializeOptions;
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

declare interface WithBraintreePaypalPaymentInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using Braintree PayPal.
     */
    braintree?: BraintreePaypalPaymentInitializeOptions;
}

declare interface WithBraintreeVisaCheckoutCustomerInitializeOptions {
    braintreevisacheckout?: BraintreeVisaCheckoutCustomerInitializeOptions;
}

declare interface WithCreditCardPaymentInitializeOptions_2 {
    creditCard?: CreditCardPaymentInitializeOptions_2;
}

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

declare interface WithKlarnaPaymentInitializeOptions {
    klarna?: KlarnaPaymentInitializeOptions;
}

declare interface WithKlarnaV2PaymentInitializeOptions {
    klarnav2?: KlarnaV2PaymentInitializeOptions;
}

declare interface WithMolliePaymentInitializeOptions {
    /**
     * The options that are required to initialize the Mollie payment
     * method. They can be omitted unless you need to support Mollie.
     */
    mollie?: MolliePaymentInitializeOptions;
}

declare interface WithMonerisPaymentInitializeOptions {
    moneris?: MonerisPaymentInitializeOptions;
}

declare interface WithPayPalCommerceAlternativeMethodsPaymentInitializeOptions {
    paypalcommerce?: PayPalCommerceAlternativeMethodsPaymentOptions;
    paypalcommercealternativemethods?: PayPalCommerceAlternativeMethodsPaymentOptions;
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

declare interface WithPayPalCommerceVenmoCustomerInitializeOptions {
    paypalcommercevenmo?: PayPalCommerceVenmoCustomerInitializeOptions;
}

declare interface WithPayPalCommerceVenmoPaymentInitializeOptions {
    paypalcommerce?: PayPalCommerceVenmoPaymentInitializeOptions;
    paypalcommercevenmo?: PayPalCommerceVenmoPaymentInitializeOptions;
}

declare interface WithStripeOCSCustomerInitializeOptions {
    stripeocs?: StripeOCSCustomerInitializeOptions;
}

declare interface WithStripeOCSPaymentInitializeOptions {
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

declare class WorldpayAccessPaymentStrategy extends CreditCardPaymentStrategy {
    private _initializeOptions?;
    initialize(options?: PaymentInitializeOptions & WithWorldpayAccessPaymentInitializeOptions): Promise<void>;
    execute(orderRequest: OrderRequestBody, options?: PaymentInitializeOptions): Promise<void>;
    private _processAdditionalAction;
    private _createHiddenIframe;
    private _createIframe;
    private _submitAdditionalAction;
    private _isValidJsonWithSessionId;
}

declare class ZipPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private storefrontPaymentRequestSender;
    constructor(paymentIntegrationService: PaymentIntegrationService, storefrontPaymentRequestSender: StorefrontPaymentRequestSender);
    initialize(): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _prepareForReferredRegistration;
}

export declare const createAdyenV2PaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<AdyenV2PaymentStrategy>, {
    gateway: string;
}>;

export declare const createAdyenV3PaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<Adyenv3PaymentStrategy>, {
    gateway: string;
}>;

export declare const createAffirmPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<AffirmPaymentStrategy>, {
    id: string;
}>;

export declare const createAfterpayPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<AfterpayPaymentStrategy>, {
    gateway: string;
    id?: undefined;
} | {
    id: string;
    gateway?: undefined;
}>;

export declare const createAmazonPayV2CustomerStrategy: import("../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<AmazonPayV2CustomerStrategy>, {
    id: string;
}>;

export declare const createAmazonPayV2PaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<AmazonPayV2PaymentStrategy>, {
    id: string;
}>;

export declare const createApplePayCustomerStrategy: import("../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<ApplePayCustomerStrategy>, {
    id: string;
}>;

export declare const createApplePayPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<ApplePayPaymentStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsAlternativeMethodsPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BigCommercePaymentsAlternativeMethodsPaymentStrategy>, {
    gateway: string;
}>;

export declare const createBigCommercePaymentsCreditCardsPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BigCommercePaymentsCreditCardsPaymentStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<BigCommercePaymentsCustomerStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsFastlaneCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<BigCommercePaymentsFastlaneCustomerStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsFastlanePaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BigCommercePaymentsFastlanePaymentStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsPayLaterCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<BigCommercePaymentsPayLaterCustomerStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsPayLaterPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BigCommercePaymentsPayLaterPaymentStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BigCommercePaymentsPaymentStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsRatePayPayPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BigCommercePaymentsRatePayPaymentStrategy>, {
    gateway: string;
    id: string;
}>;

export declare const createBigCommercePaymentsVenmoCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<BigCommercePaymentsVenmoCustomerStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsVenmoPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BigCommercePaymentsVenmoPaymentStrategy>, {
    id: string;
}>;

export declare const createBlueSnapDirectAPMPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BlueSnapDirectAPMPaymentStrategy>, {
    gateway: string;
}>;

export declare const createBlueSnapDirectCreditCardPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BlueSnapDirectCreditCardPaymentStrategy>, {
    id: string;
    gateway: string;
}>;

export declare const createBlueSnapV2PaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BlueSnapV2PaymentStrategy>, {
    gateway: string;
}>;

export declare const createBoltCustomerStrategy: import("../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<BoltCustomerStrategy>, {
    id: string;
}>;

export declare const createBoltPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BoltPaymentStrategy>, {
    id: string;
}>;

export declare const createBraintreeAchPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BraintreeAchPaymentStrategy>, {
    id: string;
}>;

export declare const createBraintreeFastlaneCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<BraintreeFastlaneCustomerStrategy>, {
    id: string;
}>;

export declare const createBraintreeFastlanePaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BraintreeFastlanePaymentStrategy>, {
    id: string;
}>;

export declare const createBraintreeLocalMethodsPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BraintreeLocalMethodsPaymentStrategy>, {
    gateway: string;
}>;

export declare const createBraintreePaypalCreditCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<BraintreePaypalCreditCustomerStrategy>, {
    id: string;
}>;

export declare const createBraintreePaypalCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<BraintreePaypalCustomerStrategy>, {
    id: string;
}>;

export declare const createBraintreePaypalPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BraintreePaypalPaymentStrategy>, {
    id: string;
}>;

export declare const createBraintreeVisaCheckoutCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<BraintreeVisaCheckoutCustomerStrategy>, {
    id: string;
}>;

export declare const createCheckoutComAPMPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<CheckoutComCustomPaymentStrategy>, {
    gateway: string;
}>;

export declare const createCheckoutComCreditCardPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<CheckoutComCreditCardPaymentStrategy>, {
    gateway: string;
    id: string;
}>;

export declare const createCheckoutComFawryPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<CheckoutComFawryPaymentStrategy>, {
    gateway: string;
    id: string;
}>;

export declare const createCheckoutComIdealPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<CheckoutComiDealPaymentStrategy>, {
    gateway: string;
    id: string;
}>;

export declare const createCheckoutComSepaPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<CheckoutComSEPAPaymentStrategy>, {
    gateway: string;
    id: string;
}>;

export declare const createClearpayPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<ClearpayPaymentStrategy>, {
    gateway: string;
    id?: undefined;
} | {
    id: string;
    gateway?: undefined;
}>;

export declare const createCreditCardPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<CreditCardPaymentStrategy_2>, {
    default: boolean;
}>;

export declare const createCyberSourcePaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<CyberSourcePaymentStrategy>, {
    id: string;
}>;

export declare const createCyberSourceV2PaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<CyberSourceV2PaymentStrategy>, {
    id: string;
}>;

export declare const createExternalPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<ExternalPaymentStrategy>, {
    id: string;
}>;

export declare const createGooglePayAdyenV2CustomerStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayAdyenV2PaymentStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

export declare const createGooglePayAdyenV3CustomerStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayAdyenV3PaymentStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

export declare const createGooglePayAuthorizeDotNetCustomerStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayAuthorizeNetPaymentStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

export declare const createGooglePayBigCommercePaymentsCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayBigCommercePaymentsPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

export declare const createGooglePayBnzCustomerStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayBraintreeCustomerStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayBraintreePaymentStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

export declare const createGooglePayCheckoutComCustomerStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayCheckoutComPaymentStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

export declare const createGooglePayCybersourceCustomerStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayCybersourcePaymentStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

export declare const createGooglePayOrbitalCustomerStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayOrbitalPaymentStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

export declare const createGooglePayPPCPPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

export declare const createGooglePayPayPalCommerceCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayStripeCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayStripePaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

export declare const createGooglePayStripeUpeCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayTdOnlineMartCustomerStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayTdOnlineMartPaymentStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

export declare const createGooglePayWorldpayAccessCustomerStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayWorldpayAccessPaymentStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

export declare const createHummPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<HummPaymentStrategy>, {
    id: string;
}>;

export declare const createKlarnaPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<KlarnaPaymentStrategy>, {
    id: string;
}>;

export declare const createKlarnaV2PaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<KlarnaV2PaymentStrategy>, {
    gateway: string;
}>;

export declare const createLegacyPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<LegacyPaymentStrategy>, {
    id: string;
}>;

export declare const createMolliePaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<MolliePaymentStrategy>, {
    gateway: string;
    id?: undefined;
} | {
    gateway: string;
    id: string;
}>;

export declare const createMonerisPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<MonerisPaymentStrategy>, {
    id: string;
}>;

export declare const createNoPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<NoPaymentDataRequiredPaymentStrategy>, {
    id: string;
}>;

export declare const createOfflinePaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<OfflinePaymentStrategy>, {
    type: string;
}>;

export declare const createOffsitePaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<OffsitePaymentStrategy>, {
    type: string;
}>;

export declare const createPayPalCommerceAlternativeMethodsPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<PayPalCommerceAlternativeMethodsPaymentStrategy>, {
    gateway: string;
}>;

export declare const createPayPalCommerceCreditCardsPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<PayPalCommerceCreditCardsPaymentStrategy>, {
    id: string;
}>;

export declare const createPayPalCommerceCreditCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<PayPalCommerceCreditCustomerStrategy>, {
    id: string;
}>;

export declare const createPayPalCommerceCreditPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<PayPalCommerceCreditPaymentStrategy>, {
    id: string;
}>;

export declare const createPayPalCommerceCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<PayPalCommerceCustomerStrategy>, {
    id: string;
}>;

export declare const createPayPalCommerceFastlaneCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<PayPalCommerceFastlaneCustomerStrategy>, {
    id: string;
}>;

export declare const createPayPalCommerceFastlanePaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<PaypalCommerceFastlanePaymentStrategy>, {
    id: string;
}>;

export declare const createPayPalCommercePaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<PayPalCommercePaymentStrategy>, {
    id: string;
}>;

export declare const createPayPalCommerceRatePayPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<PaypalCommerceRatepayPaymentStrategy>, {
    gateway: string;
    id: string;
}>;

export declare const createPayPalCommerceVenmoCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<PayPalCommerceVenmoCustomerStrategy>, {
    id: string;
}>;

export declare const createPayPalCommerceVenmoPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<PayPalCommerceVenmoPaymentStrategy>, {
    id: string;
}>;

export declare const createPayPalProPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<PaypalProPaymentStrategy>, {
    id: string;
}>;

export declare const createSagePayPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<SagePayPaymentStrategy>, {
    id: string;
}>;

export declare const createSezzlePaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<SezzlePaymentStrategy>, {
    id: string;
}>;

export declare const createSquareV2PaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<PaymentStrategy>, {
    id: string;
}>;

export declare const createStripeLinkV2CustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<StripeLinkV2CustomerStrategy>, {
    id: string;
}>;

export declare const createStripeOCSPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<StripeOCSPaymentStrategy>, {
    gateway: string;
    id: string;
}>;

export declare const createStripeUPECustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<StripeUPECustomerStrategy>, {
    id: string;
}>;

export declare const createStripeUPEPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<StripeUPEPaymentStrategy>, {
    gateway: string;
    id?: undefined;
} | {
    gateway: string;
    id: string;
}>;

export declare const createStripeV3PaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<any>, {
    gateway: string;
}>;

export declare const createTDOnlineMartPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<TDOnlineMartPaymentStrategy>, {
    id: string;
}>;

export declare const createWorldpayAccessPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<WorldpayAccessPaymentStrategy>, {
    id: string;
}>;

export declare const createZipPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<ZipPaymentStrategy>, {
    id: string;
}>;

declare type onPaymentDataChangedOut = Promise<(NewTransactionInfo & NewShippingOptionParameters & NewOfferInfo & {
    error?: GooglePayError;
}) | void>;

declare interface validationElement {
    phone?: validationRequiredElement;
}

declare interface validationRequiredElement {
    required?: string;
}
