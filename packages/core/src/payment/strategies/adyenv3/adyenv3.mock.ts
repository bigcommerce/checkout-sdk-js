import { RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { OrderPaymentRequestBody, OrderRequestBody } from '../../../order';
import Payment from '../../payment';
import { PaymentInitializeOptions } from '../../payment-request-options';
import {
    getCreditCardInstrument,
    getErrorPaymentResponseBody,
    getVaultedInstrument,
} from '../../payments.mock';

import {
    AdyenAdditionalActionErrorResponse,
    AdyenClient,
    AdyenComponent,
    AdyenConfiguration,
    AdyenError,
    AdyenPaymentMethodType,
    AdyenV3ComponentState,
    ResultCode,
} from './adyenv3';

function getAdditionalActionErrorResponse(
    resultCode: ResultCode,
): AdyenAdditionalActionErrorResponse {
    return {
        provider_data: {
            resultCode,
            action: '{"paymentData":"ADYEN_PAYMENT_DATA","paymentMethodType":"scheme","token":"TOKEN","type":"threeDS2Fingerprint"}',
        },
        errors: [
            {
                code: 'additional_action_required',
            },
        ],
    };
}

function getPayment(paymentMethodType: AdyenPaymentMethodType): Payment {
    return {
        methodId: paymentMethodType,
        paymentData: getCreditCardInstrument(),
    };
}

function getUnknownErrorResponse(): any {
    return {
        errors: [
            {
                code: 'unknown_error',
            },
        ],
    };
}

function getVaultedPayment(paymentMethodType: AdyenPaymentMethodType): Payment {
    return {
        methodId: paymentMethodType,
        paymentData: getVaultedInstrument(),
    };
}

export function getAdditionalActionError(resultCode: ResultCode): RequestError {
    return new RequestError(
        getResponse({
            ...getErrorPaymentResponseBody(),
            ...getAdditionalActionErrorResponse(resultCode),
        }),
    );
}

export function getAdyenClient(): AdyenClient {
    return {
        create: jest.fn(() => {
            return {
                mount: jest.fn(),
                unmount: jest.fn(),
            };
        }),

        createFromAction: jest.fn(() => {
            return {
                mount: jest.fn(),
                unmount: jest.fn(),
            };
        }),
    };
}

export function getAdyenConfiguration(): AdyenConfiguration {
    return {
        environment: 'test',
        clientKey: 'YOUR_CLIENT_KEY',
    };
}

export function getAdyenError(): AdyenError {
    return {
        errorCode: 'CODE',
        message: 'MESSAGE',
    };
}

export function getComponentState(isValid = true): AdyenV3ComponentState {
    return {
        data: {
            paymentMethod: {
                encryptedCardNumber: 'ENCRYPTED_CARD_NUMBER',
                encryptedExpiryMonth: 'ENCRYPTED_EXPIRY_MONTH',
                encryptedExpiryYear: 'ENCRYPTED_EXPIRY_YEAR',
                encryptedSecurityCode: 'ENCRYPTED_CVV',
                holderName: 'John Smith',
            },
        },
        isValid,
    };
}

export function getFailingComponent(): AdyenComponent {
    return {
        mount: jest.fn(() => {
            throw new Error();
        }),
        unmount: jest.fn(),
    };
}

export function getInitializeOptions(hasVaultedInstruments = false): PaymentInitializeOptions {
    return {
        methodId: 'adyenv3',
        adyenv3: {
            containerId: 'adyen-scheme-component-field',
            cardVerificationContainerId: 'adyen-custom-card-component-field',
            hasVaultedInstruments,
            options: {
                hasHolderName: true,
                styles: {},
                placeholders: {},
            },
            additionalActionOptions: {
                containerId: 'adyen-scheme-additional-action-component-field',
                onBeforeLoad: jest.fn(),
                onComplete: jest.fn(),
                onLoad: jest.fn(),
                widgetSize: '05',
            },
            validateCardFields: jest.fn(),
        },
    };
}

export function getInitializeOptionsWithNoCallbacks(): PaymentInitializeOptions {
    return {
        methodId: 'adyenv3',
        adyenv3: {
            containerId: 'adyen-scheme-component-field',
            cardVerificationContainerId: 'adyen-custom-card-component-field',
            options: {
                hasHolderName: true,
                styles: {},
                placeholders: {},
            },
            additionalActionOptions: {
                containerId: 'adyen-scheme-additional-action-component-field',
                widgetSize: '05',
            },
            validateCardFields: jest.fn(),
        },
    };
}

export function getInitializeOptionsWithUndefinedWidgetSize(): PaymentInitializeOptions {
    return {
        methodId: 'adyenv3',
        adyenv3: {
            containerId: 'adyen-scheme-component-field',
            cardVerificationContainerId: 'adyen-custom-card-component-field',
            options: {
                hasHolderName: true,
                styles: {},
                placeholders: {},
            },
            additionalActionOptions: {
                containerId: 'adyen-scheme-additional-action-component-field',
                onBeforeLoad: jest.fn(),
                onComplete: jest.fn(),
                onLoad: jest.fn(),
            },
            validateCardFields: jest.fn(),
        },
    };
}

export function getOrderRequestBody(
    paymentMethodType: AdyenPaymentMethodType = AdyenPaymentMethodType.CreditCard,
): OrderRequestBody {
    return {
        useStoreCredit: false,
        payment: getPayment(paymentMethodType) as OrderPaymentRequestBody,
    };
}

export function getOrderRequestBodyWithVaultedInstrument(
    paymentMethodType: AdyenPaymentMethodType = AdyenPaymentMethodType.CreditCard,
): OrderRequestBody {
    return {
        useStoreCredit: false,
        payment: getVaultedPayment(paymentMethodType) as OrderPaymentRequestBody,
    };
}

export function getOrderRequestBodyWithoutPayment(): OrderRequestBody {
    return {
        useStoreCredit: false,
        payment: undefined,
    };
}

export function getUnknownError(): RequestError {
    return new RequestError(
        getResponse({
            ...getUnknownErrorResponse(),
            ...getErrorPaymentResponseBody(),
        }),
    );
}
