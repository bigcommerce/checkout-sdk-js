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
}

export enum BlueSnapDirectErrorCode {
    CC_NOT_SUPORTED = '22013',
    ERROR_403 = '403',
    ERROR_404 = '404',
    ERROR_500 = '500',
    INVALID_OR_EMPTY = '10',
    SESSION_EXPIRED = '400',
    TOKEN_EXPIRED = '14040',
    TOKEN_NOT_ASSOCIATED = '14042',
    TOKEN_NOT_FOUND = '14041',
}

export enum BlueSnapDirectHostedFieldTagId {
    CardCode = 'cvv',
    CardExpiry = 'exp',
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

export interface BlueSnapDirectSdk {
    hostedPaymentFieldsCreate(options: BlueSnapDirectHostedPaymentFieldsOptions): void;
    hostedPaymentFieldsSubmitData(callback: (results: BlueSnapDirectCallbackResults) => void): void;
}

export interface BlueSnapDirectHostWindow extends Window {
    bluesnap?: BlueSnapDirectSdk;
}
