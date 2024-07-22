import {
    OrderRequestBody,
    PaymentInitializeOptions,
    PaymentMethod,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getErrorPaymentResponseBody,
    getResponse,
    getVaultedInstrument,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import DigitalRiverJS, {
    DigitalRiverAdditionalProviderData,
    DigitalRiverInitializeToken,
} from './digitalriver';

export function getDigitalRiverJSMock(): DigitalRiverJS {
    return {
        createDropin: jest.fn(() => {
            return {
                mount: jest.fn(),
            };
        }),
        authenticateSource: jest.fn(),
        createElement: jest.fn(() => {
            return {
                mount: jest.fn(),
            };
        }),
    };
}

export function getInitializeOptionsMock(): PaymentInitializeOptions {
    return {
        digitalriver: {
            containerId: 'drop-in',
            configuration: {
                button: {
                    type: 'submitOrder',
                },
                flow: 'checkout',
                showComplianceSection: true,
                showSavePaymentAgreement: false,
                showTermsOfSaleDisclosure: true,
                usage: 'unscheduled',
            },
            onError: jest.fn(),
            onRenderButton: jest.fn(),
            onSubmitForm: jest.fn(),
        },
        gatewayId: '',
        methodId: 'digitalriver',
    };
}

export function getOrderRequestBodyWithVaultedInstrument(): OrderRequestBody {
    return {
        useStoreCredit: false,
        payment: {
            methodId: 'digitalriver',
            paymentData: getVaultedInstrument(),
        },
    };
}

export function getClientMock(): DigitalRiverInitializeToken {
    return {
        sessionId: '1234',
        checkoutData: {
            checkoutId: '12345676543',
            sellingEntity: 'DR-Entity',
        },
    };
}

export function getDigitalRiverInitializationDataMock() {
    return {
        publicKey: '1234',
        paymentLanguage: 'en-US',
    };
}

export function getDigitalRiverPaymentMethodMock(): PaymentMethod {
    return {
        id: 'digitalriver',
        logoUrl: '',
        method: 'digitalriver',
        supportedCards: [],
        config: {
            testMode: true,
        },
        initializationData: getDigitalRiverInitializationDataMock(),
        type: 'PAYMENT_TYPE_API',
        clientToken: 'clientToken',
    };
}

function getAdditionalActionErrorResponse(): DigitalRiverAdditionalProviderData {
    return {
        source_id: 'sourceId',
        source_client_secret: 'sourceClientSecret',
    };
}

export function getAdditionalActionError(): RequestError {
    return new RequestError(
        getResponse({
            ...getErrorPaymentResponseBody(),
            provider_data: getAdditionalActionErrorResponse(),
            errors: [
                {
                    code: 'additional_action_required',
                },
            ],
        }),
    );
}
