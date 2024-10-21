import { PaymentMethodFailedError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { StripeStringConstants } from './stripe-upe';
import StripeUPEIntegrationService from './stripe-upe-integration-service';
import { getStripeUPEJsMock } from './stripe-upe.mock';

export const getStripeUPEIntegrationServiceMock = () =>
    ({
        deinitialize: jest.fn(),
        initCheckoutEventsSubscription: jest.fn(),
        mountElement: jest.fn(),
        mapAppearanceVariables: jest.fn(),
        mapInputAppearanceRules: jest.fn(),
        throwDisplayableStripeError: jest.fn((message?: string) => {
            throw new Error(message);
        }),
        throwPaymentConfirmationProceedMessage: jest.fn(() => {
            throw new PaymentMethodFailedError('PaymentMethodFailedError');
        }),
        isCancellationError: jest.fn(() => false),
        isPaymentCompleted: jest.fn(() => Promise.resolve(false)),
        mapStripePaymentData: jest.fn(() => ({
            elements: getStripeUPEJsMock().elements({}),
            redirect: StripeStringConstants.IF_REQUIRED,
            confirmParams: {
                payment_method_data: {
                    billing_details: {
                        email: 'test@email.com',
                        address: 'address',
                        name: 'firstName lastName',
                    },
                },
                return_url: 'return.url',
            },
        })),
        isAdditionalActionError: jest.fn(() => false),
        isRedirectAction: jest.fn(() => false),
        isOnPageAdditionalAction: jest.fn(() => false),
    } as unknown as StripeUPEIntegrationService);
