import { OrderRequestBody } from '../../../order';
import { PaymentInitializeOptions } from '../../payment-request-options';

import { StripePaymentMethodType, StripeUPEClient } from './stripe-upe';

const gatewayId = 'stripeupe';

export function getStripeUPEJsMock(): StripeUPEClient {
    return {
        elements: jest.fn(() => ({
            create: jest.fn(() => ({
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn((_, callback) => callback()),
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
): PaymentInitializeOptions {
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
            paymentData: {
                shouldSaveInstrument,
            },
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
