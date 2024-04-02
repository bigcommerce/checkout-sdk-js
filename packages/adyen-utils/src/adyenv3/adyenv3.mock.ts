import {
    OrderPaymentRequestBody,
    OrderRequestBody,
    Payment,
    PaymentInitializeOptions,
    PaymentMethod,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCreditCardInstrument,
    getErrorPaymentResponseBody,
    getResponse,
    getVaultedInstrument,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    AdyenAdditionalActionErrorResponse,
    AdyenClient,
    AdyenComponent,
    AdyenComponentState,
    AdyenConfiguration,
    AdyenError,
    AdyenPaymentMethodType,
    BoletoState,
    ResultCode,
} from '../types';

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

export function getComponentState(isValid = true): AdyenComponentState {
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

export function getBoletoComponentState(isValid = true): BoletoState {
    return {
        data: {
            paymentMethod: {
                type: 'boleto',
            },
            shopperName: {
                firstName: 'Test',
                lastName: 'Tester',
            },
            socialSecurityNumber: '123123123',
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

export function getAdyenV3(method = 'scheme'): PaymentMethod {
    return {
        id: 'adyenv3',
        logoUrl: '',
        method,
        supportedCards: [],
        config: {
            displayName: 'Adyen',
            merchantId: 'YOUR_MERCHANT_ID',
            testMode: true,
        },
        initializationData: {
            originKey: 'YOUR_ORIGIN_KEY',
            clientKey: 'YOUR_CLIENT_KEY',
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'clientToken',
    };
}
