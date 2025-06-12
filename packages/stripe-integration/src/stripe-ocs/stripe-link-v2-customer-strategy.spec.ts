import { EventEmitter } from 'events';

import {
    InvalidArgumentError,
    NotInitializedError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCart,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { getStripeIntegrationServiceMock, StripeIntegrationService } from '../stripe-utils';
import {
    StripeClient,
    StripeElement,
    StripeElementEvent,
    StripeElements,
    StripeStringConstants,
} from '../stripe-utils/stripe';
import StripeScriptLoader from '../stripe-utils/stripe-script-loader';

import StripeLinkV2CustomerStrategy from './stripe-link-v2-customer-strategy';
import { getStripeOCSMock } from './stripe-ocs.mock';

describe('StripeLinkV2CustomerStrategy', () => {
    let strategy: StripeLinkV2CustomerStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let scriptLoader: jest.Mocked<StripeScriptLoader>;
    let stripeClient: jest.Mocked<StripeClient>;
    let elements: jest.Mocked<StripeElements>;
    let element: jest.Mocked<StripeElement>;
    let stripeEventEmitter: EventEmitter;
    let stripeIntegrationService: StripeIntegrationService;
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

    beforeEach(() => {
        stripeEventEmitter = new EventEmitter();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        stripeIntegrationService = getStripeIntegrationServiceMock();

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
            ...getStripeOCSMock(),
            elements: jest.fn().mockReturnValue(elements),
            confirmPayment: jest.fn(),
        } as any;

        scriptLoader = {
            getStripeClient: jest.fn().mockResolvedValue(stripeClient),
        } as any;

        jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockReturnValue(
            Promise.resolve(paymentIntegrationService.getState()),
        );

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(
            paymentIntegrationService.getState(),
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            getStripeOCSMock(),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        beforeEach(async () => {
            strategy = new StripeLinkV2CustomerStrategy(
                paymentIntegrationService,
                scriptLoader,
                stripeIntegrationService,
            );
            await strategy.initialize({
                methodId: 'card',
                stripeocs: {
                    container: 'checkout-button',
                    isLoading,
                },
            } as any);
        });

        it('throws if stripeocs option is missing', async () => {
            await expect(
                strategy.initialize({ methodId: 'card', stripeocs: undefined } as any),
            ).rejects.toThrow(InvalidArgumentError);
        });

        it('throws if required stripeocs fields are missing', async () => {
            await expect(
                strategy.initialize({
                    methodId: 'card',
                    stripeocs: {
                        container: '',
                    },
                } as any),
            ).rejects.toThrow(NotInitializedError);
        });

        it('loads Stripe client and mounts element successfully', () => {
            // TODO remove mock id below
            expect(scriptLoader.getStripeClient).toHaveBeenCalledWith(
                'key',
                undefined,
                undefined,
                {},
            );
            expect(elements.create).toHaveBeenCalledWith(
                'expressCheckout',
                expressCheckoutOptionsMock,
            );
            expect(stripeClient.elements).toHaveBeenCalledWith({
                amount: 19000,
                currency: 'usd',
                mode: 'payment',
            });
            expect(element.mount).toHaveBeenCalledWith('#checkout-button');
        });
    });

    describe('Stripe Link V2 Element mounting', () => {
        beforeEach(async () => {
            strategy = new StripeLinkV2CustomerStrategy(
                paymentIntegrationService,
                scriptLoader,
                stripeIntegrationService,
            );
            await strategy.initialize({
                methodId: 'card',
                stripeocs: {
                    container: 'checkout-button',
                    isLoading,
                },
            } as any);
        });

        it('calls mountExpressCheckoutElement during initialize()', () => {
            expect(elements.create).toHaveBeenCalledWith(
                'expressCheckout',
                expressCheckoutOptionsMock,
            );
            expect(element.mount).toHaveBeenCalledWith('#checkout-button');
        });
    });

    describe('Stripe Events', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('initialise all events', async () => {
            strategy = new StripeLinkV2CustomerStrategy(
                paymentIntegrationService,
                scriptLoader,
                stripeIntegrationService,
            );
            await strategy.initialize({
                methodId: 'card',
                stripeocs: {
                    container: 'checkout-button',
                    isLoading,
                },
            } as any);

            expect(element.on).toHaveBeenCalledWith(
                StripeElementEvent.SHIPPING_ADDRESS_CHANGE,
                expect.any(Function),
            );
            expect(element.on).toHaveBeenCalledWith(
                StripeElementEvent.SHIPPING_RATE_CHANGE,
                expect.any(Function),
            );
            expect(element.on).toHaveBeenCalledWith(
                StripeElementEvent.CONFIRM,
                expect.any(Function),
            );
        });

        it('calls onShippingAddressChange callback if event was triggered', async () => {
            strategy = new StripeLinkV2CustomerStrategy(
                paymentIntegrationService,
                scriptLoader,
                stripeIntegrationService,
            );
            await strategy.initialize({
                methodId: 'card',
                stripeocs: {
                    container: 'checkout-button',
                    isLoading,
                },
            } as any);

            stripeEventEmitter.emit(StripeElementEvent.SHIPPING_ADDRESS_CHANGE, {
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
        });

        it('calls onShippingRateChange callback if event was triggered', async () => {
            strategy = new StripeLinkV2CustomerStrategy(
                paymentIntegrationService,
                scriptLoader,
                stripeIntegrationService,
            );
            await strategy.initialize({
                methodId: 'card',
                stripeocs: {
                    container: 'checkout-button',
                    isLoading,
                },
            } as any);

            stripeEventEmitter.emit(StripeElementEvent.SHIPPING_RATE_CHANGE, {
                shippingRate: {
                    id: '123',
                },
            });
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalled();
        });

        it('initialise all events correctly if there is no physical items', async () => {
            const cartMock = getCart();

            cartMock.lineItems.physicalItems = [];
            jest.spyOn(paymentIntegrationService, 'getState').mockReturnValue({
                ...paymentIntegrationService.getState(),
                getCartOrThrow: jest.fn().mockReturnValue(cartMock),
            });

            strategy = new StripeLinkV2CustomerStrategy(
                paymentIntegrationService,
                scriptLoader,
                stripeIntegrationService,
            );
            await strategy.initialize({
                methodId: 'card',
                stripeocs: {
                    container: 'checkout-button',
                    isLoading,
                },
            } as any);

            expect(element.on).not.toHaveBeenCalledWith(
                StripeElementEvent.SHIPPING_ADDRESS_CHANGE,
                expect.any(Function),
            );
            expect(element.on).not.toHaveBeenCalledWith(
                StripeElementEvent.SHIPPING_RATE_CHANGE,
                expect.any(Function),
            );
            expect(element.on).toHaveBeenCalledWith(
                StripeElementEvent.CONFIRM,
                expect.any(Function),
            );
        });
        // TODO add onConfirm tests coverage after it will be implemented
    });
});
