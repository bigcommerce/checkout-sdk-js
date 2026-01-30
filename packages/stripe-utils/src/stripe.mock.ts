import {
    OrderRequestBody,
    PaymentInitializeOptions,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    StripeCheckoutSession,
    StripeClient,
    StripeLoadActionsResultType,
    StripePaymentMethodType,
} from './stripe';
import StripePaymentInitializeOptions from './stripe-initialize-options';

const gatewayId = 'stripeupe';

export interface WithStripePaymentInitializeOptions {
    stripeupe?: StripePaymentInitializeOptions;
    stripeocs?: StripePaymentInitializeOptions;
}

export const StripeEventMock = {
    complete: false,
    elementType: 'type',
    empty: true,
    value: {
        type: StripePaymentMethodType.CreditCard,
    },
};

export function getStripeMock(method = 'card'): PaymentMethod {
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
            allowRedisplayForStoredInstruments: true,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'clientToken',
        returnUrl: 'http://www.example.com',
        skipRedirectConfirmationAlert: true,
    };
}

export function getStripeJsMock(): StripeClient {
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
        initCheckout: jest.fn(),
    };
}

export function getFailingStripeJsMock(): StripeClient {
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
        initCheckout: jest.fn(),
    };
}

export function getStripeInitializeOptionsMock(
    stripePaymentMethodType: StripePaymentMethodType = StripePaymentMethodType.CreditCard,
    style: { [key: string]: string } = { fieldText: '#ccc' },
): PaymentInitializeOptions & WithStripePaymentInitializeOptions {
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

export function getStripeCheckoutSessionMock(): StripeCheckoutSession {
    return {
        loadActions: () =>
            Promise.resolve({
                type: StripeLoadActionsResultType.SUCCESS,
                actions: {
                    updateEmail: jest.fn(),
                },
            }),
    };
}
