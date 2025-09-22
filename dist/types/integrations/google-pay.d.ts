import { AddressRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { BigCommercePaymentsIntent } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import { BillingAddressRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { BrowserInfo } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { BuyNowCartRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CheckoutButtonInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CheckoutButtonStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CheckoutButtonStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ExecutePaymentMethodCheckoutOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { FormPoster } from '@bigcommerce/form-poster';
import { Omit } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { RequestSender } from '@bigcommerce/request-sender';
import { ScriptLoader } from '@bigcommerce/script-loader';

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

declare enum ErrorReasonType {
    OFFER_INVALID = "OFFER_INVALID",
    PAYMENT_DATA_INVALID = "PAYMENT_DATA_INVALID",
    SHIPPING_ADDRESS_INVALID = "SHIPPING_ADDRESS_INVALID",
    SHIPPING_ADDRESS_UNSERVICEABLE = "SHIPPING_ADDRESS_UNSERVICEABLE",
    SHIPPING_OPTION_INVALID = "SHIPPING_OPTION_INVALID",
    OTHER_ERROR = "OTHER_ERROR"
}

declare interface ExtraPaymentData {
    deviceSessionId?: string;
    browser_info?: BrowserInfo;
}

declare type FundingType = string[];

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
    availableAlternativePaymentMethods: FundingType;
    buttonStyle?: PayPalButtonStyleOptions;
    buyerCountry?: string;
    clientToken?: string;
    enabledAlternativePaymentMethods: FundingType;
    isDeveloperModeApplicable?: boolean;
    intent?: BigCommercePaymentsIntent;
    isHostedCheckoutEnabled?: boolean;
    isPayPalCreditAvailable?: boolean;
    isVenmoEnabled?: boolean;
    isGooglePayEnabled?: boolean;
    orderId?: string;
    shouldRenderFields?: boolean;
    paymentButtonStyles?: Record<string, PayPalButtonStyleOptions>;
}

declare interface GooglePayBraintreeGatewayParameters extends GooglePayGatewayBaseParameters {
    'braintree:apiVersion'?: string;
    'braintree:authorizationFingerprint'?: string;
    'braintree:merchantId'?: string;
    'braintree:sdkVersion'?: string;
}

declare type GooglePayButtonColor = 'default' | 'black' | 'white';

declare interface GooglePayButtonInitializeOptions {
    /**
     * The color of the GooglePay button that will be inserted.
     *  black (default): a black button suitable for use on white or light backgrounds.
     *  white: a white button suitable for use on colorful backgrounds.
     */
    buttonColor?: GooglePayButtonColor;
    /**
     * The size of the GooglePay button that will be inserted.
     *  long: "Buy with Google Pay" button (default). A translated button label may appear
     *         if a language specified in the viewer's browser matches an available language.
     *  short: Google Pay payment button without the "Buy with" text.
     */
    buttonType?: GooglePayButtonType;
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: GooglePayBuyNowInitializeOptions;
    /**
     * The option that is required to load payment method configuration for provided currency code in Buy Now flow.
     */
    currencyCode?: string;
    /**
     * A callback that gets called when GooglePay fails to initialize or
     * selects a payment option.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: Error): void;
}

declare interface GooglePayButtonOptions {
    onClick: (event: MouseEvent) => Promise<void>;
    allowedPaymentMethods: [GooglePayBaseCardPaymentMethod];
    buttonColor?: GooglePayButtonColor;
    buttonType?: GooglePayButtonType;
}

declare class GooglePayButtonStrategy implements CheckoutButtonStrategy {
    private _paymentIntegrationService;
    private _googlePayPaymentProcessor;
    private _paymentButton?;
    private _methodId?;
    private _buyNowCart?;
    private _currencyCode?;
    private _buyNowInitializeOptions?;
    private _countryCode?;
    constructor(_paymentIntegrationService: PaymentIntegrationService, _googlePayPaymentProcessor: GooglePayPaymentProcessor);
    initialize(options: CheckoutButtonInitializeOptions & WithGooglePayButtonInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    private _handleClick;
    private _interactWithPaymentSheet;
    private _getGooglePayClientOptions;
    private _createBuyNowCartOrThrow;
    private _getBuyNowTransactionInfo;
    private _getTransactionInfo;
    private _getMethodOrThrow;
    private _getCurrencyCodeOrThrow;
}

declare type GooglePayButtonType = 'book' | 'buy' | 'checkout' | 'donate' | 'order' | 'pay' | 'plain' | 'subscribe' | 'long' | 'short';

declare interface GooglePayBuyNowInitializeOptions {
    getBuyNowCartRequestBody?(): BuyNowCartRequestBody;
}

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
    availableAlternativePaymentMethods: FundingType;
    buttonStyle?: PayPalButtonStyleOptions;
    buyerCountry?: string;
    clientToken?: string;
    enabledAlternativePaymentMethods: FundingType;
    isDeveloperModeApplicable?: boolean;
    intent?: PayPalCommerceIntent;
    isHostedCheckoutEnabled?: boolean;
    isPayPalCreditAvailable?: boolean;
    isVenmoEnabled?: boolean;
    isGooglePayEnabled?: boolean;
    orderId?: string;
    shouldRenderFields?: boolean;
    paymentButtonStyles?: Record<string, PayPalButtonStyleOptions>;
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

declare interface IntermediatePaymentData {
    callbackTrigger: CallbackTriggerType;
    shippingAddress: GooglePayFullBillingAddress;
    shippingOptionData: GoogleShippingOption;
    offerData: {
        redemptionCodes: string[];
    };
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

declare interface OfferInfoItem {
    redemptionCode: string;
    description: string;
}

declare interface Offers {
    offers: OfferInfoItem[];
}

declare interface PayPalButtonStyleOptions {
    color?: StyleButtonColor;
    shape?: StyleButtonShape;
    height?: number;
    label?: StyleButtonLabel;
}

declare enum PayPalCommerceIntent {
    AUTHORIZE = "authorize",
    CAPTURE = "capture"
}

declare interface ShippingOptionParameters {
    defaultSelectedOptionId?: string;
    shippingOptions?: GoogleShippingOption[];
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

declare enum StyleButtonShape {
    pill = "pill",
    rect = "rect"
}

declare enum TotalPriceStatusType {
    ESTIMATED = "ESTIMATED",
    FINAL = "FINAL",
    NOT_CURRENTLY_KNOWN = "NOT_CURRENTLY_KNOWN"
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

export declare const createGooglePayAdyenV2ButtonStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<GooglePayButtonStrategy>, {
    id: string;
}>;

export declare const createGooglePayAdyenV2CustomerStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayAdyenV2PaymentStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

export declare const createGooglePayAdyenV3ButtonStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<GooglePayButtonStrategy>, {
    id: string;
}>;

export declare const createGooglePayAdyenV3CustomerStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayAdyenV3PaymentStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

export declare const createGooglePayAuthorizeDotNetButtonStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<GooglePayButtonStrategy>, {
    id: string;
}>;

export declare const createGooglePayAuthorizeDotNetCustomerStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayAuthorizeNetPaymentStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

export declare const createGooglePayBigCommercePaymentsButtonStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<GooglePayButtonStrategy>, {
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

export declare const createGooglePayBraintreeButtonStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<GooglePayButtonStrategy>, {
    id: string;
}>;

export declare const createGooglePayBraintreeCustomerStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayBraintreePaymentStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

export declare const createGooglePayCheckoutComButtonStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<GooglePayButtonStrategy>, {
    id: string;
}>;

export declare const createGooglePayCheckoutComCustomerStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayCheckoutComPaymentStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

export declare const createGooglePayCybersourceButtonStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<GooglePayButtonStrategy>, {
    id: string;
}>;

export declare const createGooglePayCybersourceCustomerStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayCybersourcePaymentStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

export declare const createGooglePayOrbitalButtonStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<GooglePayButtonStrategy>, {
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

export declare const createGooglePayPayPalCommerceButtonStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<GooglePayButtonStrategy>, {
    id: string;
}>;

export declare const createGooglePayPayPalCommerceCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayStripeButtonStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<GooglePayButtonStrategy>, {
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

export declare const createGooglePayTdOnlineMartButtonStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<GooglePayButtonStrategy>, {
    id: string;
}>;

export declare const createGooglePayTdOnlineMartCustomerStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayTdOnlineMartPaymentStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

export declare const createGooglePayWorldpayAccessButtonStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<GooglePayButtonStrategy>, {
    id: string;
}>;

export declare const createGooglePayWorldpayAccessCustomerStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<GooglePayCustomerStrategy>, {
    id: string;
}>;

export declare const createGooglePayWorldpayAccessPaymentStrategy: import("../../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<GooglePayPaymentStrategy>, {
    id: string;
}>;

declare type onPaymentDataChangedOut = Promise<(NewTransactionInfo & NewShippingOptionParameters & NewOfferInfo & {
    error?: GooglePayError;
}) | void>;
