import { OrderRequestBody } from '../../../order';
import { PaymentInitializeOptions } from '../../payment-request-options';

import { MollieClient } from './mollie';

export function getInitializeOptions(): PaymentInitializeOptions {
    return {
        methodId: 'creditcard',
        mollie: {
            cardCvcId: 'mollie-card-cvc-component-field',
            cardExpiryId: 'mollie-card-expiry-component-field',
            cardHolderId: 'mollie-card-holder-component-field',
            cardNumberId: 'mollie-card-number-component-field',
            styles: {valid: '#0f0'},
        },
    };
}

export function getMollieClient(): MollieClient {
    return {
        createComponent: jest.fn(() => {
            return {
                mount: jest.fn(),
                unmount: jest.fn(),
            };
        }),

        createToken: jest.fn(() => {
            return 'test_t0k3n';
        }),
    };
}

export function getOrderRequestBodyWithoutPayment(): OrderRequestBody {
    return {
        useStoreCredit: false,
        payment: undefined,
    };
}

export function getOrderRequestBodyWithCreditCard(): OrderRequestBody {
    return {
        useStoreCredit: false,
        payment: {
            methodId: 'creditcard',
            gatewayId: 'mollie',
            paymentData: undefined,
        },
    };
}

export function getOrderRequestBodyAPMs(): OrderRequestBody {
    return {
        useStoreCredit: false,
        payment: {
            methodId: 'belfius',
            gatewayId: 'mollie',
            paymentData: undefined,
        },
    };
}
