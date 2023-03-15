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
            getAppearance: jest.fn().mockReturnValue({
                rules: {
                    '.Input': {
                        borderColor: '#123456',
                        boxShadow: '#123456',
                        color: '#123456',
                    },
                },
                variables: {
                    borderRadius: '4px',
                    colorBackground: '#123456',
                    colorDanger: '#123456',
                    colorIcon: '#123456',
                    colorPrimary: '#123456',
                    colorText: '#123456',
                    colorTextPlaceholder: '#123456',
                    colorTextSecondary: '#123456',
                    spacingUnit: '4px',
                },
            }),
        },
    };
}
