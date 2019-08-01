import { OrderRequestBody } from '../../../order';
import { PaymentInitializeOptions } from '../../payment-request-options';

import { AdyenClient, AdyenConfiguration } from './adyenv2';

export function getAdyenClient(): AdyenClient {
    return {
        adyenCheckout: jest.fn(() => {
            return {
                create: jest.fn(() => {
                    return {
                        mount: jest.fn(),
                        unmount: jest.fn(),
                    };
                }),
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
