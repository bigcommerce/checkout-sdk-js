import { PaymentMethodFailedError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { StripeJsVersion, StripeStringConstants } from './stripe';
import StripeIntegrationService from './stripe-integration-service';
import { getStripeJsMock } from './stripe.mock';

export const getStripeIntegrationServiceMock = () =>
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
        mapStripePaymentData: jest.fn((return_url?: string) => ({
            elements: getStripeJsMock().elements({}),
            redirect: StripeStringConstants.IF_REQUIRED,
            confirmParams: {
                payment_method_data: {
                    billing_details: {
                        email: 'test@email.com',
                        address: 'address',
                        name: 'firstName lastName',
                    },
                },
                ...(return_url ? { return_url } : {}),
            },
        })),
        isAdditionalActionError: jest.fn(() => false),
        isRedirectAction: jest.fn(() => false),
        isOnPageAdditionalAction: jest.fn(() => false),
        updateStripePaymentIntent: jest.fn(() => Promise.resolve()),
        throwStripeError: jest.fn(() => {
            throw new Error('throw stripe error');
        }),
        getStripeJsVersion: jest.fn(() => StripeJsVersion.V3),
    } as unknown as StripeIntegrationService);
