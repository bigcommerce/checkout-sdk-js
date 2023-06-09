export type BluesnapDirectNocInputAllowedStyle = Pick<
    CSSStyleDeclaration,
    'color' | 'fontFamily' | 'fontSize' | 'fontWeight'
>;

export interface BlueSnapDirectStyleDeclaration {
    [k: string]: string;
}

export interface BlueSnapDirectStyle {
    '.invalid'?: BlueSnapDirectStyleDeclaration;
    ':focus'?: BlueSnapDirectStyleDeclaration;
    input?: BlueSnapDirectStyleDeclaration;
}

export enum BlueSnapDirectCardType {
    AMEX = 'american-express',
    CHINA_UNION_PAY = 'unionpay',
    DINERS = 'diners-club',
    DISCOVER = 'discover',
    JCB = 'jcb',
    MASTERCARD = 'mastercard',
    UNKNOWN = 'unknown',
    VISA = 'visa',
}

export type BlueSnapDirectCardTypeValues = keyof typeof BlueSnapDirectCardType;

export enum BlueSnapDirectEventOrigin {
    ON_BLUR = 'onBlur',
    ON_SUBMIT = 'onSubmit',
}

export enum BlueSnapDirectErrorDescription {
    EMPTY = 'empty',
    INVALID = 'invalid',
    THREE_DS_NOT_ENABLED = '3D Secure is not enabled',
}

export type BlueSnapDirectInputValidationErrorDescription = Extract<
    BlueSnapDirectErrorDescription,
    BlueSnapDirectErrorDescription.EMPTY | BlueSnapDirectErrorDescription.INVALID
>;

export enum BlueSnapDirectErrorCode {
    CC_NOT_SUPORTED = '22013',
    ERROR_403 = '403',
    ERROR_404 = '404',
    ERROR_500 = '500',
    INVALID_OR_EMPTY = '10',
    SESSION_EXPIRED = '400',
    THREE_DS_AUTH_FAILED = '14101',
    THREE_DS_CLIENT_ERROR = '14103',
    THREE_DS_MISSING_FIELDS = '14102',
    THREE_DS_NOT_ENABLED = '14100',
    TOKEN_EXPIRED = '14040',
    TOKEN_NOT_ASSOCIATED = '14042',
    TOKEN_NOT_FOUND = '14041',
}

export enum BlueSnapDirectHostedFieldTagId {
    CardCode = 'cvv',
    CardExpiry = 'exp',
    CardName = 'noc',
    CardNumber = 'ccn',
}

export interface BlueSnapDirectHostedPaymentFieldsOptions {
    token: string;
    onFieldEventHandler?: {
        setupComplete?: () => void;
        threeDsChallengeExecuted?: () => void;
        onFocus?: (tagId: BlueSnapDirectHostedFieldTagId) => void;
        onBlur?: (tagId: BlueSnapDirectHostedFieldTagId) => void;
        onError?: (
            tagId: BlueSnapDirectHostedFieldTagId | undefined,
            errorCode: BlueSnapDirectErrorCode,
            errorDescription: BlueSnapDirectErrorDescription | undefined,
            eventOrigin: BlueSnapDirectEventOrigin | undefined,
        ) => void;
        onType?: (
            tagId: BlueSnapDirectHostedFieldTagId,
            cardType: BlueSnapDirectCardTypeValues,
            cardData: BlueSnapDirectCardData | undefined,
        ) => void;
        onEnter?: (tagId: BlueSnapDirectHostedFieldTagId) => void;
        onValid?: (tagId: BlueSnapDirectHostedFieldTagId) => void;
    };
    ccnPlaceHolder?: string;
    cvvPlaceHolder?: string;
    expPlaceHolder?: string;
    style?: BlueSnapDirectStyle;
    '3DS'?: boolean;
}

interface BlueSnapDirectCallback {
    statusCode: string;
    transactionFraudInfo: {
        fraudSessionId: string;
    };
}

interface BlueSnapDirectCardData {
    binCategory: string;
    cardSubType: string;
    ccBin: string;
    ccType: string;
    isRegulatedCard: string;
    issuingCountry: string;
    last4Digits: string;
}

export interface BlueSnapDirectCallbackCardData extends BlueSnapDirectCardData {
    cardCategory: string;
    exp: string;
}

interface BlueSnapDirectCallbackData extends BlueSnapDirectCallback {
    cardData: BlueSnapDirectCallbackCardData;
}

export interface WithBlueSnapDirectCardHolderName {
    cardHolderName?: string;
}

interface BlueSnapDirectSubmitError {
    errorCode: string;
    errorDescription: string;
    eventType: string;
    tagId: string;
}

export interface BlueSnapDirectCallbackError extends BlueSnapDirectCallback {
    error: BlueSnapDirectSubmitError[];
}

export type BlueSnapDirectCallbackResults =
    | BlueSnapDirectCallbackData
    | BlueSnapDirectCallbackError;

export interface BlueSnapDirectThreeDSecureData {
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

export interface BlueSnapDirectSdk {
    hostedPaymentFieldsCreate(options: BlueSnapDirectHostedPaymentFieldsOptions): void;
    hostedPaymentFieldsSubmitData(
        callback: (results: BlueSnapDirectCallbackResults) => void,
        threeDSecureData?: BlueSnapDirectThreeDSecureData,
    ): void;
}

export interface BlueSnapDirectHostWindow extends Window {
    bluesnap?: BlueSnapDirectSdk;
}
