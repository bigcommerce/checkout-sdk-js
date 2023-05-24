import { StripeElement, StripeUPEClient } from '../../../payment/strategies/stripe-upe';
import { ShippingInitializeOptions } from '../../shipping-request-options';

export function getShippingStripeUPEJsMock(): StripeUPEClient {
    return {
        elements: jest.fn(() => ({
            create: jest.fn(() => ({
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn(),
                destroy: jest.fn(),
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

export function getShippingStripeUPEJsOnMock(returnElement?: StripeElement): StripeUPEClient {
    return {
        elements: jest.fn(() => ({
            create: jest.fn(() => returnElement),
            getElement: jest.fn(() => returnElement),
            update: jest.fn(),
            fetchUpdates: jest.fn(),
        })),
        confirmPayment: jest.fn(),
        confirmCardPayment: jest.fn(),
        retrievePaymentIntent: jest.fn(),
    };
}

export function getShippingStripeUPEJsMockWithAnElementCreated(): StripeUPEClient {
    return {
        elements: jest.fn(() => ({
            create: jest.fn(() => ({
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn(),
                destroy: jest.fn(),
            })),
            getElement: jest.fn(() => ({
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn(),
                destroy: jest.fn(),
            })),
            update: jest.fn(),
            fetchUpdates: jest.fn(),
        })),
        confirmPayment: jest.fn(),
        confirmCardPayment: jest.fn(),
        retrievePaymentIntent: jest.fn(),
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
