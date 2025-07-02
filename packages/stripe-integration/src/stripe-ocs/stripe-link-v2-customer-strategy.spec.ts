import { EventEmitter } from 'events';

import {
    InvalidArgumentError,
    NotInitializedError,
    PaymentIntegrationService,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCart,
    getErrorPaymentResponseBody,
    getResponse,
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
    let confirmPaymentMock: jest.Mock;
    const mockStripeAddress = {
        billingDetails: {
            name: 'John Doe',
            email: 'test@mail.com',
            phone: '1234',
            address: {
                line1: 'line',
                city: 'Miami',
                country: 'United States',
                state: 'FL',
                postal_code: '091-22',
            },
        },
        shippingAddress: {
            name: 'John Doe',
            address: {
                line1: 'line',
                city: 'Miami',
                country: 'United States',
                state: 'FL',
                postal_code: '091-22',
            },
        },
    };
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
        stripeIntegrationService = getStripeIntegrationServiceMock();
        stripeEventEmitter = new EventEmitter();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        confirmPaymentMock = jest.fn();

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
            confirmPayment: confirmPaymentMock,
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
        jest.spyOn(stripeIntegrationService, 'isPaymentCompleted').mockReturnValue(
            Promise.resolve(false),
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
                getStripeOCSMock().initializationData,
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

        describe('#onConfirm', () => {
            let errorResponse: RequestError;
            let confirmPaymentMock: jest.Mock;
            let retrievePaymentIntentMock: jest.Mock;

            beforeEach(() => {
                delete (window as any).location;
                (window as any).location = {
                    ...window.location,
                    replace: jest.fn(),
                };
                jest.spyOn(stripeIntegrationService, 'isAdditionalActionError').mockReturnValue(
                    true,
                );
                jest.spyOn(stripeIntegrationService, 'isPaymentCompleted').mockReturnValue(
                    Promise.resolve(false),
                );
                errorResponse = new RequestError(
                    getResponse({
                        ...getErrorPaymentResponseBody(),
                        errors: [{ code: 'additional_action_required' }],
                        additional_action_required: {
                            type: 'additional_action_requires_payment_method',
                            data: {
                                redirect_url: 'https://redirect-url.com',
                                token: 'token',
                            },
                        },
                        status: 'error',
                    }),
                );
                confirmPaymentMock = jest.fn().mockResolvedValue({
                    paymentIntent: {
                        id: 'paymentIntentId',
                    },
                });
                retrievePaymentIntentMock = jest.fn();
                stripeClient = {
                    ...stripeClient,
                    confirmPayment: confirmPaymentMock,
                    retrievePaymentIntent: retrievePaymentIntentMock,
                } as any;

                jest.spyOn(scriptLoader, 'getStripeClient').mockImplementation(
                    jest.fn(() => Promise.resolve(stripeClient)),
                );
                jest.spyOn(paymentIntegrationService, 'getState').mockReturnValue({
                    ...paymentIntegrationService.getState(),
                    getCartOrThrow: jest.fn().mockReturnValue(getCart()),
                });
            });

            it('updates addresses when onConfirm callback event triggered', async () => {
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

                stripeEventEmitter.emit(StripeElementEvent.CONFIRM, mockStripeAddress);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith({
                    address1: 'line',
                    address2: '',
                    city: 'Miami',
                    company: '',
                    countryCode: 'United States',
                    customFields: [],
                    email: 'test@mail.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '1234',
                    postalCode: '091-22',
                    stateOrProvince: 'FL',
                    stateOrProvinceCode: 'FL',
                });
                expect(paymentIntegrationService.updateShippingAddress).toHaveBeenCalledWith({
                    address1: 'line',
                    address2: '',
                    city: 'Miami',
                    company: '',
                    countryCode: 'United States',
                    customFields: [],
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '1234',
                    postalCode: '091-22',
                    stateOrProvince: 'FL',
                    stateOrProvinceCode: 'FL',
                });
            });

            it('submit second payment request after stripe confirmation', async () => {
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                    Promise.reject(errorResponse),
                );

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

                stripeEventEmitter.emit(StripeElementEvent.CONFIRM, mockStripeAddress);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                    methodId: 'optimized_checkout',
                    paymentData: {
                        formattedPayload: {
                            cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                            confirm: false,
                            payment_method_id: 'link',
                        },
                    },
                });
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                    methodId: 'optimized_checkout',
                    paymentData: {
                        formattedPayload: {
                            cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                            credit_card_token: {
                                token: 'paymentIntentId',
                            },
                            confirm: false,
                            payment_method_id: 'link',
                        },
                    },
                });
            });
        });
    });
});
