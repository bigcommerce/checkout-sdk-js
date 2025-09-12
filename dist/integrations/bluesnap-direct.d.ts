import { CreditCardPaymentInitializeOptions } from '@bigcommerce/checkout-sdk/credit-card-integration';
import { HostedFieldOptionsMap } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { HostedInputValidateResults } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ScriptLoader } from '@bigcommerce/script-loader';
import { WithCreditCardPaymentInitializeOptions } from '@bigcommerce/checkout-sdk/credit-card-integration';

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

declare interface WithBlueSnapDirectCardHolderName {
    cardHolderName?: string;
}

declare interface WithBlueSnapV2PaymentInitializeOptions {
    bluesnapv2?: BlueSnapV2PaymentInitializeOptions;
}

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
