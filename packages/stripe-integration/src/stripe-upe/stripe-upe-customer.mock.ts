import { CustomerInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { StripeElement, StripeUPEClient } from './stripe-upe';

export interface StripeUpeCustomerInitializeOptions extends CustomerInitializeOptions {
    stripeupe: {
        container: string;
        methodId: string;
        gatewayId: string;
        onEmailChange(): void;
        isLoading(): void;
        getStyles(): void;
    };
}

export function getCustomerStripeUPEJsMock(returnElement?: StripeElement): StripeUPEClient {
    return {
        elements: jest.fn(() => ({
            create: jest.fn(() => ({
                collapse: jest.fn(),
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn(),
                update: jest.fn(),
                destroy: jest.fn(),
            })),
            getElement: jest.fn().mockReturnValue(returnElement),
            update: jest.fn(),
            fetchUpdates: jest.fn(),
        })),
        confirmPayment: jest.fn(),
        confirmCardPayment: jest.fn(),
        retrievePaymentIntent: jest.fn(),
    };
}

export function getStripeUPECustomerInitializeOptionsMock(): StripeUpeCustomerInitializeOptions {
    return {
        methodId: 'stripeupe',
        stripeupe: {
            container: 'stripeupeLink',
            methodId: 'card',
            gatewayId: 'stripeupe',
            onEmailChange: jest.fn(),
            isLoading: jest.fn(),
            getStyles: jest.fn(),
        },
    };
}
