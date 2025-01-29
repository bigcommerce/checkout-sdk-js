import { Checkout } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { Config } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { HostedCreditCardInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { HostedVaultedInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { Order } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { OrderMeta } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { OrderPaymentRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentAdditionalAction } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInstrumentMeta } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentMethodMeta } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { Response } from '@bigcommerce/request-sender';

declare class DetachmentObserver {
    private _mutationObserver;
    constructor(_mutationObserver: MutationObserverFactory);
    ensurePresence<T>(targets: Node[], promise: Promise<T>): Promise<T>;
}

declare interface HostedCardFieldOptions {
    accessibilityLabel?: string;
    containerId: string;
    placeholder?: string;
}

declare interface HostedCardFieldOptionsMap {
    [HostedFieldType.CardCode]?: HostedCardFieldOptions;
    [HostedFieldType.CardExpiry]?: HostedCardFieldOptions;
    [HostedFieldType.CardName]?: HostedCardFieldOptions;
    [HostedFieldType.CardNumber]?: HostedCardFieldOptions;
    [HostedFieldType.Note]?: HostedCardFieldOptions;
    [HostedFieldType.Hidden]?: HostedCardFieldOptions;
}

declare class HostedField {
    private _type;
    private _containerId;
    private _placeholder;
    private _accessibilityLabel;
    private _styles;
    private _eventPoster;
    private _eventListener;
    private _detachmentObserver;
    private _orderId?;
    private _iframe;
    constructor(_type: HostedFieldType, _containerId: string, _placeholder: string, _accessibilityLabel: string, _styles: HostedFieldStylesMap, _eventPoster: IframeEventPoster<HostedFieldEvent>, _eventListener: IframeEventListener<HostedInputEventMap>, _detachmentObserver: DetachmentObserver, _orderId?: number | undefined);
    private getFrameSrc;
    getType(): HostedFieldType;
    attach(): Promise<void>;
    detach(): void;
    submitForm(fields: HostedFieldType[], data: HostedFormOrderData): Promise<HostedInputSubmitSuccessEvent>;
    submitManualOrderForm(data: HostedFormManualOrderData): Promise<HostedInputSubmitManualOrderSuccessEvent>;
    submitStoredCardForm(fields: StoredCardHostedFormInstrumentFields, data: StoredCardHostedFormData): Promise<HostedInputStoredCardSucceededEvent>;
    validateForm(): Promise<void>;
    private _getFontUrls;
    private _isSubmitManualOrderErrorEvent;
    private _isSubmitErrorEvent;
}

declare interface HostedFieldAttachEvent {
    type: HostedFieldEventType.AttachRequested;
    payload: {
        accessibilityLabel?: string;
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

declare type HostedFieldEvent = HostedFieldAttachEvent | HostedFieldSubmitRequestEvent | HostedFieldSubmitManualOrderRequestEvent | HostedFieldValidateRequestEvent | HostedFieldStoredCardRequestEvent;

declare enum HostedFieldEventType {
    AttachRequested = "HOSTED_FIELD:ATTACH_REQUESTED",
    SubmitRequested = "HOSTED_FIELD:SUBMITTED_REQUESTED",
    SubmitManualOrderRequested = "HOSTED_FIELD:SUBMIT_MANUAL_ORDER_REQUESTED",
    ValidateRequested = "HOSTED_FIELD:VALIDATE_REQUESTED",
    StoredCardRequested = "HOSTED_FIELD:STORED_CARD_REQUESTED"
}

declare type HostedFieldFocusEventData = HostedInputFocusEvent['payload'];

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

declare interface HostedFieldSubmitManualOrderRequestEvent {
    type: HostedFieldEventType.SubmitManualOrderRequested;
    payload: {
        data: HostedFormManualOrderData;
    };
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
    CardExpiry = "cardExpiry",
    CardName = "cardName",
    CardNumber = "cardNumber",
    Note = "note",
    Hidden = "hidden"
}

declare type HostedFieldValidateEventData = HostedInputValidateEvent['payload'];

declare interface HostedFieldValidateRequestEvent {
    type: HostedFieldEventType.ValidateRequested;
}

declare class HostedForm implements HostedFormInterface {
    private _fields;
    private _eventListener;
    private _eventCallbacks;
    private _bin?;
    private _cardType?;
    constructor(_fields: HostedField[], _eventListener: IframeEventListener<HostedInputEventMap>, _eventCallbacks: HostedFormEventCallbacks);
    getBin(): string | undefined;
    getCardType(): string | undefined;
    attach(): Promise<void>;
    detach(): void;
    submitManualOrderPayment(payload: {
        data: HostedFormManualOrderData;
    }): Promise<HostedInputSubmitManualOrderSuccessEvent | void>;
    submitStoredCard(payload: {
        fields: StoredCardHostedFormInstrumentFields;
        data: StoredCardHostedFormData;
    }): Promise<HostedInputStoredCardSucceededEvent | void>;
    submit(payload: OrderPaymentRequestBody, paymentIntegrationService: PaymentIntegrationService, payloadTransformer: HostedFormOrderDataTransformer, additionalActionData?: PaymentAdditionalAction): Promise<HostedInputSubmitSuccessEvent>;
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

declare type HostedFormEventCallbacks = Pick<HostedFormOptions, 'onBlur' | 'onCardTypeChange' | 'onFocus' | 'onEnter' | 'onValidate'>;

declare class HostedFormFactory {
    create(host: string, options: HostedFormOptions): HostedForm;
}

declare interface HostedFormInterface {
    attach(): Promise<void>;
    detach(): void;
    getBin(): string | undefined;
    validate(): Promise<void>;
    getCardType(): string | undefined;
}

declare interface HostedFormManualOrderData {
    paymentMethodId: string;
    paymentSessionToken: string;
}

declare interface HostedFormOptions {
    fields: HostedCardFieldOptionsMap;
    orderId?: number;
    styles?: HostedFieldStylesMap;
    onBlur?(data: HostedFieldBlurEventData): void;
    onCardTypeChange?(data: HostedFieldCardTypeChangeEventData): void;
    onEnter?(data: HostedFieldEnterEventData): void;
    onFocus?(data: HostedFieldFocusEventData): void;
    onValidate?(data: HostedFieldValidateEventData): void;
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
    private paymentIntegrationService;
    constructor(paymentIntegrationService: PaymentIntegrationService);
    transform(payload: OrderPaymentRequestBody, additionalAction?: PaymentAdditionalAction): HostedFormOrderData;
}

declare class HostedFormService {
    protected _host: string;
    protected _hostedFormFactory: HostedFormFactory;
    protected _hostedForm?: HostedForm;
    constructor(_host: string, _hostedFormFactory: HostedFormFactory);
    initialize(options: HostedFormOptions): Promise<void>;
    deinitialize(): void;
    submitManualOrderPayment(data: HostedFormManualOrderData): Promise<HostedInputSubmitManualOrderSuccessEvent | void>;
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
    [HostedInputEventType.SubmitManualOrderSucceeded]: HostedInputSubmitManualOrderSuccessEvent;
    [HostedInputEventType.SubmitManualOrderFailed]: HostedInputSubmitManualOrderErrorEvent;
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
    SubmitManualOrderSucceeded = "HOSTED_INPUT:SUBMIT_MANUAL_ORDER_SUCCEEDED",
    SubmitManualOrderFailed = "HOSTED_INPUT:SUBMIT_MANUAL_ORDER_FAILED",
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

declare interface HostedInputSubmitManualOrderErrorEvent {
    type: HostedInputEventType.SubmitManualOrderFailed;
    payload: {
        error: PaymentErrorData;
        response?: Response<PaymentErrorResponseBody>;
    };
}

declare interface HostedInputSubmitManualOrderSuccessEvent {
    type: HostedInputEventType.SubmitManualOrderSucceeded;
    payload: {
        response: Response<unknown>;
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
    [HostedFieldType.CardExpiry]?: HostedInputValidateErrorData[];
    [HostedFieldType.CardName]?: HostedInputValidateErrorData[];
    [HostedFieldType.CardNumber]?: HostedInputValidateErrorData[];
    [HostedFieldType.Note]?: HostedInputValidateErrorData[];
    [HostedFieldType.Hidden]?: HostedInputValidateErrorData[];
}

declare interface HostedInputValidateEvent {
    type: HostedInputEventType.Validated;
    payload: HostedInputValidateResults;
}

declare interface HostedInputValidateResults {
    errors: HostedInputValidateErrorDataMap;
    isValid: boolean;
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

declare interface PaymentErrorData {
    code: string;
    message?: string;
}

declare interface PaymentErrorResponseBody {
    status: string;
    errors: PaymentErrorData[];
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
    initialize(options: HostedFormOptions): Promise<void>;
    deinitialize(): void;
}

/**
 * Creates an instance of `HostedFormService`.
 *
 *
 * @param host - Host url string parameter.
 * @returns An instance of `HostedFormService`.
 */
export declare function createHostedFormService(host: string): HostedFormService;

/**
 * Creates an instance of `StoredCardHostedFormService`.
 *
 *
 * @param host - Host url string parameter.
 * @returns An instance of `StoredCardHostedFormService`.
 */
export declare function createStoredCardHostedFormService(host: string): StoredCardHostedFormService;
