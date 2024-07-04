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
        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        create: jest.fn(() => {
            return {
                mount: jest.fn(),
                unmount: jest.fn(),
            };
        }),

        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        createFromAction: jest.fn(() => {
            return {
                mount: jest.fn(),
                unmount: jest.fn(),
            };
        }),
    };
}

export function getAdyenConfiguration(useOriginKey = true): AdyenConfiguration {
    return useOriginKey
        ? {
              environment: 'test',
              originKey: 'YOUR_ORIGIN_KEY',
          }
        : {
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
                type: AdyenPaymentMethodType.CreditCard,
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
        submit: jest.fn(),
    };
}

export function getInitializeOptions(hasVaultedInstruments = false): PaymentInitializeOptions {
    return {
        methodId: 'adyenv2',
        adyenv2: {
            containerId: 'adyen-scheme-component-field',
            cardVerificationContainerId: 'adyen-custom-card-component-field',
            threeDS2ContainerId: 'adyen-scheme-3ds-component-field',
            hasVaultedInstruments,
            options: {
                hasHolderName: true,
                styles: {},
                placeholders: {},
            },
            threeDS2Options: {
                widgetSize: '05',
                onBeforeLoad: jest.fn(),
                onComplete: jest.fn(),
                onLoad: jest.fn(),
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

export function getInitializeOptionsWithNoCallbacks(): PaymentInitializeOptions {
    return {
        methodId: 'adyenv2',
        adyenv2: {
            containerId: 'adyen-scheme-component-field',
            cardVerificationContainerId: 'adyen-custom-card-component-field',
            threeDS2ContainerId: 'adyen-scheme-3ds-component-field',
            options: {
                hasHolderName: true,
                styles: {},
                placeholders: {},
            },
            threeDS2Options: {
                widgetSize: '05',
            },
            additionalActionOptions: {
                containerId: 'adyen-scheme-additional-action-component-field',
            },
            validateCardFields: jest.fn(),
        },
    };
}

export function getInitializeOptionsWithUndefinedWidgetSize(): PaymentInitializeOptions {
    return {
        methodId: 'adyenv2',
        adyenv2: {
            containerId: 'adyen-scheme-component-field',
            cardVerificationContainerId: 'adyen-custom-card-component-field',
            threeDS2ContainerId: 'adyen-scheme-3ds-component-field',
            options: {
                hasHolderName: true,
                styles: {},
                placeholders: {},
            },
            threeDS2Options: {
                onBeforeLoad: jest.fn(),
                onComplete: jest.fn(),
                onLoad: jest.fn(),
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

export function getAdyenV2(method = 'scheme'): PaymentMethod {
    return {
        id: 'adyenv2',
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
