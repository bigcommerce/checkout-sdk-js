import { OrderRequestBody } from '../../../order';
import { PaymentInitializeOptions } from '../../payment-request-options';

import { AdyenCardState, AdyenCheckout, AdyenConfiguration } from './adyenv2';

export function getAdyenCheckout(): AdyenCheckout {
    return {
        create: jest.fn(() => {
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
        originKey: 'YOUR_ORIGIN_KEY',
    };
}

export function getAdyenInitializeOptions(): PaymentInitializeOptions {
    return {
        methodId: 'adyenv2',
        adyenv2: {
            containerId: 'adyen-component-field',
            options: {
                hasHolderName: true,
                styles: {},
                placeholders: {},
            },
        },
    };
}

export function getAdyenOrderRequestBody(): OrderRequestBody {
    return {
        payment: {
            methodId: 'adyenv2',
        },
    };
}

export function getValidCardState(): AdyenCardState {
    return {
        data: {
            paymentMethod: {
                encryptedCardNumber: 'CARD_NUMBER',
                encryptedExpiryMonth: 'EXPIRY_MONTH',
                encryptedExpiryYear: 'EXPIRY_YEAR',
                encryptedSecurityCode: 'CVV',
                type: 'scheme',
            },
        },
        isValid: true,
    };
}

export function getInvalidCardState(): AdyenCardState {
    return {
        data: {
            paymentMethod: {
                encryptedCardNumber: 'CARD_NUMBER',
                encryptedExpiryMonth: 'EXPIRY_MONTH',
                encryptedExpiryYear: 'EXPIRY_YEAR',
                encryptedSecurityCode: 'CVV',
                type: 'scheme',
            },
        },
        isValid: false,
    };
}
