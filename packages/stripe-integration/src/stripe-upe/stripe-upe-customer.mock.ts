// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
    StripeElement,
    StripeUPEClient,
} from '../../../../../stripe-integration/src/stripe-upe/stripe-upe';
import { CustomerInitializeOptions } from '../../customer-request-options';

export function getCustomerStripeUPEJsMock(returnElement?: StripeElement): StripeUPEClient {
    return {
        elements: jest.fn(() => ({
            create: jest.fn(() => ({
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn(),
            })),
            getElement: jest.fn(() => returnElement),
            update: jest.fn(),
            fetchUpdates: jest.fn(),
        })),
        confirmPayment: jest.fn(),
        confirmCardPayment: jest.fn(),
        retrievePaymentIntent: jest.fn(),
    };
}

export function getStripeUPECustomerInitializeOptionsMock(): CustomerInitializeOptions {
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
