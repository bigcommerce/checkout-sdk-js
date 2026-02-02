import { StripeClient, StripeElement } from '@bigcommerce/checkout-sdk/stripe-utils';

import { ShippingInitializeOptions } from '../../shipping-request-options';

export function getShippingStripeUPEJsMock(): StripeClient {
    return {
        elements: jest.fn(() => ({
            create: jest.fn(() => ({
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn(),
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

export function getShippingStripeUPEJsOnMock(returnElement?: StripeElement): StripeClient {
    return {
        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        elements: jest.fn(() => ({
            create: jest.fn(() => returnElement),
            getElement: jest.fn(() => returnElement),
            update: jest.fn(),
            fetchUpdates: jest.fn(),
        })),
        confirmPayment: jest.fn(),
        confirmCardPayment: jest.fn(),
        retrievePaymentIntent: jest.fn(),
        initCheckout: jest.fn(),
    };
}

export function getShippingStripeUPEJsMockWithAnElementCreated(): StripeClient {
    return {
        elements: jest.fn(() => ({
            create: jest.fn(() => ({
                mount: jest.fn(),
                unmount: jest.fn(),
                update: jest.fn(),
                on: jest.fn(),
                destroy: jest.fn(),
                collapse: jest.fn(),
            })),
            getElement: jest.fn(() => ({
                mount: jest.fn(),
                unmount: jest.fn(),
                update: jest.fn(),
                on: jest.fn(),
                destroy: jest.fn(),
                collapse: jest.fn(),
            })),
            update: jest.fn(),
            fetchUpdates: jest.fn(),
        })),
        confirmPayment: jest.fn(),
        confirmCardPayment: jest.fn(),
        retrievePaymentIntent: jest.fn(),
        initCheckout: jest.fn(),
    };
}

export function getStripeUPEShippingInitializeOptionsMock(): ShippingInitializeOptions {
    return {
        methodId: 'stripeupe',
        stripeupe: {
            container: 'stripeupeLink',
            methodId: 'card',
            gatewayId: 'stripeupe',
            onChangeShipping: jest.fn(),
            availableCountries: 'US,MX',
            getStyles: jest.fn(),
            getStripeState: jest.fn(),
        },
    };
}

export function getStripeUPEInitializeOptionsMockWithStyles(
    style: { [key: string]: string } = { fieldText: '#ccc' },
): ShippingInitializeOptions {
    return {
        methodId: 'stripeupe',
        stripeupe: {
            container: 'stripeupeLink',
            methodId: 'card',
            gatewayId: 'stripeupe',
            onChangeShipping: jest.fn(),
            availableCountries: 'US,MX',
            getStyles: () => style,
            getStripeState: jest.fn(),
        },
    };
}
