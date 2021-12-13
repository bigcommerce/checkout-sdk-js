import { OrderRequestBody } from '../../../order';
import { PaymentInitializeOptions } from '../../payment-request-options';

import { StripePaymentMethodType, StripeUPEClient } from './stripe-upe';

const gatewayId = 'stripeupe';

export function getStripeUPEJsMock(): StripeUPEClient {
    return {
        elements: jest.fn(() => {
            return {
                create: jest.fn(() => {
                    return {
                        mount: jest.fn(),
                        unmount: jest.fn(),
                    };
                }),
                getElement: jest.fn().mockReturnValue(null),
            };
        }),
        confirmPayment: jest.fn(),
    };
}

export function getFailingStripeUPEJsMock(): StripeUPEClient {
    return {
        elements: jest.fn(() => {
            return {
                create: jest.fn(() => {
                    return {
                        mount: jest.fn(() => {
                            throw new Error();
                        }),
                        unmount: jest.fn(),
                    };
                }),
                getElement: jest.fn().mockReturnValue(null),
            };
        }),
        confirmPayment: jest.fn(),
    };
}

export function getStripeUPEInitializeOptionsMock(stripePaymentMethodType: StripePaymentMethodType = StripePaymentMethodType.CreditCard): PaymentInitializeOptions {
    return {
        methodId: stripePaymentMethodType,
        gatewayId,
        stripeupe: {
            containerId: `stripe-${stripePaymentMethodType}-component-field`,
        },
    };
}

export function getStripeUPEOrderRequestBodyMock(stripePaymentMethodType: StripePaymentMethodType = StripePaymentMethodType.CreditCard, shouldSaveInstrument: boolean = false): OrderRequestBody {
    return {
        payment: {
            methodId: stripePaymentMethodType,
            paymentData: {
                shouldSaveInstrument,
            },
        },
    };
}

export function getStripeUPEOrderRequestBodyVaultMock(stripePaymentMethodType: StripePaymentMethodType = StripePaymentMethodType.CreditCard, shouldSetAsDefaultInstrument: boolean = false): OrderRequestBody {
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

export function getPaymentMethodResponse(): unknown {
    return {
        paymentMethod: {
            id: 'pm_1234',
        },
    };
}
