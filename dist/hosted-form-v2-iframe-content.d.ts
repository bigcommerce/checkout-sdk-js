import { RequestSender } from '@bigcommerce/request-sender';
import { Response } from '@bigcommerce/request-sender';

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

declare interface HostedFieldEventMap {
    [HostedFieldEventType.AttachRequested]: HostedFieldAttachEvent;
    [HostedFieldEventType.SubmitManualOrderRequested]: HostedFieldSubmitManualOrderRequestEvent;
    [HostedFieldEventType.ValidateRequested]: HostedFieldValidateRequestEvent;
}

declare enum HostedFieldEventType {
    AttachRequested = "HOSTED_FIELD:ATTACH_REQUESTED",
    SubmitRequested = "HOSTED_FIELD:SUBMITTED_REQUESTED",
    SubmitManualOrderRequested = "HOSTED_FIELD:SUBMIT_MANUAL_ORDER_REQUESTED",
    ValidateRequested = "HOSTED_FIELD:VALIDATE_REQUESTED"
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

declare enum HostedFieldType {
    CardCode = "cardCode",
    CardExpiry = "cardExpiry",
    CardName = "cardName",
    CardNumber = "cardNumber",
    Note = "note",
    Hidden = "hidden"
}

declare interface HostedFieldValidateRequestEvent {
    type: HostedFieldEventType.ValidateRequested;
}

declare interface HostedFormErrorData {
    isEmpty: boolean;
    isPotentiallyValid: boolean;
    isValid: boolean;
}

declare type HostedFormErrorDataKeys = 'number' | 'expirationDate' | 'expirationMonth' | 'expirationYear' | 'cvv' | 'postalCode';

declare type HostedFormErrorsData = Partial<Record<HostedFormErrorDataKeys, HostedFormErrorData>>;

declare interface HostedFormManualOrderData {
    paymentMethodId: string;
    paymentSessionToken: string;
}

declare class HostedInput {
    protected _type: HostedFieldType;
    protected _form: HTMLFormElement;
    protected _placeholder: string;
    protected _accessibilityLabel: string;
    protected _autocomplete: string;
    protected _styles: HostedInputStylesMap;
    protected _fontUrls: string[];
    protected _eventListener: IframeEventListener<HostedFieldEventMap>;
    protected _eventPoster: IframeEventPoster<HostedInputEvent>;
    protected _inputAggregator: HostedInputAggregator;
    protected _inputValidator: HostedInputValidator;
    protected _manualOrderPaymentHandler: HostedInputManualOrderPaymentHandler;
    protected _input: HTMLInputElement;
    protected _previousValue?: string;
    private _fontLinks?;
    private _isTouched;
    getType(): HostedFieldType;
    getValue(): string;
    setValue(value: string): void;
    isTouched(): boolean;
    attach(): void;
    detach(): void;
    protected _formatValue(value: string): void;
    protected _notifyChange(_value: string): void;
    private _configureInput;
    private _applyStyles;
    private _loadFonts;
    private _unloadFonts;
    private _validateForm;
    private _processChange;
    private _handleInput;
    private _handleBlur;
    private _handleFocus;
    private _handleValidate;
    private _handleSubmit;
    private _forceFocusToInput;
}

declare class HostedInputAggregator {
    private _parentWindow;
    constructor(_parentWindow: Window);
    getInputs(filter?: (field: HostedInput) => boolean): HostedInput[];
    getInputValues(filter?: (field: HostedInput) => boolean): HostedInputValues;
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

declare type HostedInputEvent = HostedInputAttachSuccessEvent | HostedInputAttachErrorEvent | HostedInputBinChangeEvent | HostedInputBlurEvent | HostedInputChangeEvent | HostedInputCardTypeChangeEvent | HostedInputEnterEvent | HostedInputFocusEvent | HostedInputSubmitManualOrderSuccessEvent | HostedInputSubmitManualOrderErrorEvent | HostedInputValidateEvent;

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

declare class HostedInputManualOrderPaymentHandler {
    private _inputAggregator;
    private _inputValidator;
    private _inputStorage;
    private _eventPoster;
    private _manualOrderPaymentRequestSender;
    constructor(_inputAggregator: HostedInputAggregator, _inputValidator: HostedInputValidator, _inputStorage: HostedInputStorage, _eventPoster: IframeEventPoster<HostedInputEvent>, _manualOrderPaymentRequestSender: ManualOrderPaymentRequestSender);
    handle: (event: HostedFieldSubmitManualOrderRequestEvent) => Promise<void>;
    private _isPaymentErrorResponse;
    private _isErrorResponse;
}

declare interface HostedInputOptions {
    containerId: string;
    nonce?: string;
    origin: string;
    parentOrigin: string;
    paymentOrigin: string;
}

declare class HostedInputStorage {
    private _nonce?;
    setNonce(nonce: string): void;
    getNonce(): string | undefined;
}

declare type HostedInputStyles = Partial<Pick<CSSStyleDeclaration, 'color' | 'fontFamily' | 'fontSize' | 'fontWeight'>>;

declare interface HostedInputStylesMap {
    default?: HostedInputStyles;
    error?: HostedInputStyles;
    focus?: HostedInputStyles;
}

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

declare class HostedInputValidator {
    private readonly _completeSchema;
    constructor();
    validate(values: HostedInputValues): Promise<HostedInputValidateResults>;
    private _configureCardValidator;
    private _getCardCodeSchema;
    private _getCardExpirySchema;
    private _getCardNameSchema;
    private _getNoteSchema;
    private _getCardNumberSchema;
    private _isValidationErrorType;
}

declare interface HostedInputValues {
    [HostedFieldType.CardCode]?: string;
    [HostedFieldType.CardExpiry]?: string;
    [HostedFieldType.CardName]?: string;
    [HostedFieldType.CardNumber]?: string;
    [HostedFieldType.Note]?: string;
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

declare class ManualOrderPaymentRequestSender {
    private _requestSender;
    private _paymentOrigin;
    constructor(_requestSender: RequestSender, _paymentOrigin: string);
    submitPayment(requestInitializationData: HostedFormManualOrderData, instrumentFormData: HostedInputValues, nonce?: string): Promise<Response<unknown>>;
}

declare interface PaymentErrorData {
    code: string;
    message?: string;
}

declare interface PaymentErrorResponseBody {
    status: string;
    errors: PaymentErrorData[];
}

export declare function initializeHostedInput(options: HostedInputOptions): Promise<HostedInput>;

export declare function notifyInitializeError(error: HostedInputInitializeErrorData): void;
