import OrderRequestBody from '../../../order/order-request-body';
import { PaymentInitializeOptions } from '../../payment-request-options';

import {
    StripeResponse,
    StripeV3Client
} from './stripev3';

export function getStripeV3JsMock(): StripeV3Client {
    return {
        elements: jest.fn(() => {
            return {
                create: jest.fn(() => {
                    return {
                        mount: jest.fn(),
                        unmount: jest.fn(),
                    };
                }),
            };
        }),
        handleCardPayment: jest.fn(),
    };
}

export function getStripeV3InitializeOptionsMock(): PaymentInitializeOptions {
    return {
        methodId: 'stripev3',
        stripev3: {
            containerId: 'stripeContainerId',
            style: {
                base: {
                    color: '#32325D',
                    fontWeight: 500,
                    fontFamily: 'Inter UI, Open Sans, Segoe UI, sans-serif',
                    fontSize: '16px',
                    fontSmoothing: 'antialiased',
                    '::placeholder': {
                        color: '#CFD7DF',
                    },
                },
                invalid: {
                    color: '#E25950',
                },
            },
        },
    };
}

export function getStripeV3OrderRequestBodyMock(): OrderRequestBody {
    return {
        payment: {
            methodId: 'stripev3',
        },
    };
}

export function getStripeV3HandleCardResponse(): StripeResponse {
    return {
        paymentIntent: {
            id: 'pi_1234',
        },
    };
}
