import { EventEmitter } from 'events';

import {
    InvalidArgumentError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { StripeStringConstants } from '../stripe-upe/stripe-upe';
import StripeUPEScriptLoader from '../stripe-upe/stripe-upe-script-loader';
import { getStripeUPEJsMock } from '../stripe-upe/stripe-upe.mock';

import StripeLinkV2CustomerStrategy from './stripe-link-v2-customer-strategy';
import {
    StripeLinkV2Client,
    StripeLinkV2Element,
    StripeLinkV2ElementEvent,
    StripeLinkV2Elements,
} from './types';

describe('StripeLinkV2CustomerStrategy', () => {
    let strategy: StripeLinkV2CustomerStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let scriptLoader: jest.Mocked<StripeUPEScriptLoader>;
    let stripeClient: jest.Mocked<StripeLinkV2Client>;
    let elements: jest.Mocked<StripeLinkV2Elements>;
    let element: jest.Mocked<StripeLinkV2Element>;
    let stripeEventEmitter: EventEmitter;
    const isLoading = jest.fn();
    const expressCheckoutOptionsMock = {
        allowedShippingCountries: ['AU', 'US', 'JP'],
        shippingAddressRequired: true,
        shippingRates: [{ id: '_', amount: 0, displayName: 'Pending rates' }],
        billingAddressRequired: true,
        emailRequired: true,
        phoneNumberRequired: true,
        paymentMethods: {
            link: StripeStringConstants.AUTO,
            applePay: StripeStringConstants.NEVER,
            googlePay: StripeStringConstants.NEVER,
            amazonPay: StripeStringConstants.NEVER,
            paypal: StripeStringConstants.NEVER,
        },
        buttonHeight: 40,
    };

    beforeEach(async () => {
        stripeEventEmitter = new EventEmitter();
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        element = {
            mount: jest.fn(),
            on: jest.fn((eventName, callback) => {
                stripeEventEmitter.on(eventName, callback);
            }),
        } as any;

        elements = {
            create: jest.fn().mockReturnValue(element),
            update: jest.fn().mockReturnValue(element),
        } as any;

        stripeClient = {
            ...getStripeUPEJsMock(),
            elements: jest.fn().mockReturnValue(elements),
            confirmPayment: jest.fn(),
        } as any;

        scriptLoader = {
            getStripeLinkV2Client: jest.fn().mockResolvedValue(stripeClient),
        } as any;

        jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockReturnValue(
            Promise.resolve(paymentIntegrationService.getState()),
        );

        strategy = new StripeLinkV2CustomerStrategy(paymentIntegrationService, scriptLoader);
        await strategy.initialize({
            methodId: 'card',
            stripe_link_v2: {
                container: 'checkout-button',
                isLoading,
            },
        } as any);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        it('throws if stripe_link_v2 option is missing', async () => {
            await expect(
                strategy.initialize({ methodId: 'card', stripe_link_v2: undefined } as any),
            ).rejects.toThrow(InvalidArgumentError);
        });

        it('throws if required stripe_link_v2 fields are missing', async () => {
            await expect(
                strategy.initialize({
                    methodId: 'card',
                    stripe_link_v2: {
                        container: '',
                        isLoading: undefined,
                    },
                } as any),
            ).rejects.toThrow(InvalidArgumentError);
        });

        it('loads Stripe client and mounts element successfully', () => {
            // TODO remove mock id below
            expect(scriptLoader.getStripeLinkV2Client).toHaveBeenCalledWith(
                'pk_test_iyRKkVUt0YWpJ3Lq7mfsw3VW008KiFDH4s',
            );
            expect(elements.create).toHaveBeenCalled();
            expect(element.mount).toHaveBeenCalledWith('#checkout-button');
            expect(isLoading).toHaveBeenCalledWith(false);
        });
    });

    describe('Stripe Link V2 Element mounting', () => {
        it('calls mountExpressCheckoutElement during initialize()', () => {
            expect(elements.create).toHaveBeenCalledWith(
                'expressCheckout',
                expressCheckoutOptionsMock,
            );
            expect(element.mount).toHaveBeenCalledWith('#checkout-button');
        });
    });

    describe('Stripe Events', () => {
        it('calls onShippingAddressChange callback if event was triggered', async () => {
            stripeEventEmitter.emit(StripeLinkV2ElementEvent.SHIPPING_ADDRESS_CHANGE, {
                address: {
                    city: 'London',
                    country: 'UK',
                    postal_code: '091-22',
                    state: 'CA',
                },
            });
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.updateShippingAddress).toHaveBeenCalled();
            expect(paymentIntegrationService.loadShippingCountries).toHaveBeenCalled();
            expect(paymentIntegrationService.getState).toHaveBeenCalledTimes(5);
        });

        it('calls onShippingRateChange callback if event was triggered', async () => {
            stripeEventEmitter.emit(StripeLinkV2ElementEvent.SHIPPING_RATE_CHANGE, {
                shippingRate: {
                    id: '123',
                },
            });
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalled();
            expect(paymentIntegrationService.getState).toHaveBeenCalledTimes(4);
        });
        // TODO add onConfirm tests coverage after it will be implemented
    });
});
