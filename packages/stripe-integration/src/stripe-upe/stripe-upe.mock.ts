import {
    OrderRequestBody,
    PaymentInitializeOptions,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { StripePaymentMethodType, StripeUPEClient } from './stripe-upe';
import { WithStripeUPEPaymentInitializeOptions } from './stripe-upe-initialize-options';

const gatewayId = 'stripeupe';

export function getStripeUPE(method = 'card'): PaymentMethod {
    return {
        id: method,
        logoUrl: '',
        method,
        supportedCards: [],
        config: {
            displayName: 'Stripe',
            merchantId: '',
            testMode: true,
        },
        initializationData: {
            stripePublishableKey: 'key',
            stripeConnectedAccount: 'key',
            browserLanguageEnabled: false,
            shopperLanguage: 'en',
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'clientToken',
        returnUrl: 'http://www.example.com',
    };
}

export const StripeEventMock = {
    complete: false,
    elementType: 'type',
    empty: true,
    value: {
        type: StripePaymentMethodType.CreditCard,
    },
};

export function getStripeUPEJsMock(): StripeUPEClient {
    return {
        elements: jest.fn(() => ({
            create: jest.fn(() => ({
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn((_, callback) => callback(StripeEventMock)),
                update: jest.fn(),
                destroy: jest.fn(),
                collapse: jest.fn(),
            })),
            getElement: jest.fn().mockReturnValue(null),
            update: jest.fn(),
            fetchUpdates: jest.fn(),
        })),
        confirmPayment: jest.fn(),
        confirmCardPayment: jest.fn(),
        retrievePaymentIntent: jest.fn(),
    };
}

export function getFailingStripeUPEJsMock(): StripeUPEClient {
    return {
        elements: jest.fn(() => ({
            create: jest.fn(() => ({
                mount: jest.fn(() => {
                    throw new Error();
                }),
                unmount: jest.fn(),
                on: jest.fn((_, callback) => callback(StripeEventMock)),
                update: jest.fn(),
                destroy: jest.fn(),
                collapse: jest.fn(),
            })),
            getElement: jest.fn().mockReturnValue(null),
            update: jest.fn(),
            fetchUpdates: jest.fn(),
        })),
        confirmPayment: jest.fn(),
        confirmCardPayment: jest.fn(),
        retrievePaymentIntent: jest.fn(),
    };
}

export function getStripeUPEInitializeOptionsMock(
    stripePaymentMethodType: StripePaymentMethodType = StripePaymentMethodType.CreditCard,
    style: { [key: string]: string } = { fieldText: '#ccc' },
): PaymentInitializeOptions & WithStripeUPEPaymentInitializeOptions {
    return {
        methodId: stripePaymentMethodType,
        gatewayId,
        stripeupe: {
            containerId: `stripe-${stripePaymentMethodType}-component-field`,
            style,
            render: jest.fn(),
        },
    };
}

export function getStripeUPEOrderRequestBodyMock(
    stripePaymentMethodType: StripePaymentMethodType = StripePaymentMethodType.CreditCard,
    shouldSaveInstrument = false,
): OrderRequestBody {
    return {
        payment: {
            methodId: stripePaymentMethodType,
            gatewayId: 'stripeupe',
            paymentData: {
                shouldSaveInstrument,
            },
        },
    };
}

export function getStripeOCSOrderRequestBodyMock(
    stripePaymentMethodType: StripePaymentMethodType = StripePaymentMethodType.OCS,
): OrderRequestBody {
    return {
        payment: {
            methodId: stripePaymentMethodType,
            gatewayId: 'stripeupe',
        },
    };
}

export function getStripeUPEWithLinkOrderRequestBodyMock(
    stripePaymentMethodType: StripePaymentMethodType = StripePaymentMethodType.CreditCard,
    shouldSaveInstrument = false,
): OrderRequestBody {
    return {
        payment: {
            gatewayId: 'stripeupe',
            methodId: stripePaymentMethodType,
            paymentData: {
                shouldSaveInstrument,
            },
        },
    };
}

export function getStripeUPEOrderRequestBodyVaultMock(
    stripePaymentMethodType: StripePaymentMethodType = StripePaymentMethodType.CreditCard,
    shouldSetAsDefaultInstrument = false,
): OrderRequestBody {
    return {
        payment: {
            methodId: stripePaymentMethodType,
            paymentData: {
                instrumentId: 'token',
                shouldSetAsDefaultInstrument,
            },
        },
    };
}

export function getOrderRequestBodyVaultedCC(): OrderRequestBody {
    return {
        useStoreCredit: false,
        payment: {
            methodId: StripePaymentMethodType.CreditCard,
            gatewayId,
            paymentData: {
                shouldSaveInstrument: true,
                shouldSetAsDefaultInstrument: true,
                instrumentId: '1234',
            },
        },
    };
}

export function getConfirmPaymentResponse(): unknown {
    return {
        paymentIntent: {
            id: 'pi_1234',
        },
    };
}

export function getRetrievePaymentIntentResponse(): unknown {
    return {
        paymentIntent: {
            id: 'pi_1234',
            status: 'requires_action',
        },
    };
}

export function getPaymentMethodResponse(): unknown {
    return {
        paymentMethod: {
            id: 'pm_1234',
        },
    };
}

export function getRetrievePaymentIntentResponseSucceeded() {
    return {
        paymentIntent: {
            id: 'pi_1234',
            status: 'succeeded',
        },
    };
}

export function getRetrievePaymentIntentResponseWithError() {
    return {
        paymentIntent: {
            id: 'pi_1234',
        },
        error: new Error('retrieve_payment_intent_response_with_error'),
    };
}
