import { EventEmitter } from 'events';

import {
    InvalidArgumentError,
    MissingDataError,
    NotInitializedError,
    PaymentIntegrationService,
    PaymentMethodCancelledError,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCart,
    getErrorPaymentResponseBody,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import {
    getStripeIntegrationServiceMock,
    StripeClient,
    StripeElement,
    StripeElementEvent,
    StripeElements,
    StripeIntegrationService,
    StripeScriptLoader,
    StripeStringConstants,
} from '@bigcommerce/checkout-sdk/stripe-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import StripeLinkV2CustomerStrategy from './stripe-link-v2-customer-strategy';
import { getStripeOCSMock } from './stripe-ocs.mock';

import clearAllMocks = jest.clearAllMocks;

describe('StripeLinkV2CustomerStrategy', () => {
    let strategy: StripeLinkV2CustomerStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let scriptLoader: jest.Mocked<StripeScriptLoader>;
    let stripeClient: jest.Mocked<StripeClient>;
    let elements: jest.Mocked<StripeElements>;
    let element: jest.Mocked<StripeElement>;
    let stripeEventEmitter: EventEmitter;
    let stripeIntegrationService: StripeIntegrationService;
    let loadingIndicator: LoadingIndicator;
    const stripePaymentMethod = getStripeOCSMock();

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
            klarna: StripeStringConstants.NEVER,
        },
        buttonHeight: 40,
    };
    const initialiseOptions = {
        methodId: 'stripeocs',
        stripeocs: {
            container: 'checkout-button',
            methodId: 'optimized_checkout',
            gatewayId: 'stripeocs',
            loadingContainerId: 'loadingContainerId',
            isLoading,
        },
    };

    beforeEach(() => {
        stripeIntegrationService = getStripeIntegrationServiceMock();
        stripeEventEmitter = new EventEmitter();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        confirmPaymentMock = jest.fn();
        loadingIndicator = new LoadingIndicator();

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
            stripePaymentMethod,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getCartLocale').mockReturnValue('en');
        jest.spyOn(stripeIntegrationService, 'isPaymentCompleted').mockReturnValue(
            Promise.resolve(false),
        );

        jest.spyOn(loadingIndicator, 'show').mockReturnValue();

        strategy = new StripeLinkV2CustomerStrategy(
            paymentIntegrationService,
            scriptLoader,
            stripeIntegrationService,
            loadingIndicator,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        beforeEach(async () => {
            await strategy.initialize(initialiseOptions);
        });

        it('throws if no options are provided', async () => {
            await expect(strategy.initialize(undefined as any)).rejects.toThrow(
                InvalidArgumentError,
            );
        });

        it('throws if stripeocs option is missing', async () => {
            await expect(
                strategy.initialize({ methodId: 'card', stripeocs: undefined } as any),
            ).rejects.toThrow(InvalidArgumentError);
        });

        it('throws if stripePublishableKey option is missing', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValueOnce({
                ...getStripeOCSMock(),
                initializationData: {
                    ...getStripeOCSMock().initializationData,
                    stripePublishableKey: undefined,
                },
            });

            await expect(strategy.initialize(initialiseOptions)).rejects.toThrow(MissingDataError);
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

        it('loads Stripe client and mounts element successfully with captureMethod: automatic', async () => {
            stripePaymentMethod.initializationData.captureMethod = 'automatic';
            await strategy.initialize(initialiseOptions);

            expect(scriptLoader.getStripeClient).toHaveBeenCalledWith(
                {
                    ...stripePaymentMethod.initializationData,
                    captureMethod: 'automatic',
                },
                'en',
            );
            expect(elements.create).toHaveBeenCalledWith(
                'expressCheckout',
                expressCheckoutOptionsMock,
            );
            expect(stripeClient.elements).toHaveBeenCalledWith({
                amount: 19000,
                currency: 'usd',
                captureMethod: 'automatic',
                mode: 'payment',
            });
            expect(element.mount).toHaveBeenCalledWith('#checkout-button');
        });

        it('loads Stripe client and mounts element successfully with captureMethod: manual', async () => {
            stripePaymentMethod.initializationData.captureMethod = 'manual';
            await strategy.initialize(initialiseOptions);

            expect(scriptLoader.getStripeClient).toHaveBeenCalledWith(
                {
                    ...stripePaymentMethod.initializationData,
                    captureMethod: 'manual',
                },
                'en',
            );
            expect(elements.create).toHaveBeenCalledWith(
                'expressCheckout',
                expressCheckoutOptionsMock,
            );
            expect(stripeClient.elements).toHaveBeenCalledWith({
                amount: 19000,
                currency: 'usd',
                captureMethod: 'manual',
                mode: 'payment',
            });
            expect(element.mount).toHaveBeenCalledWith('#checkout-button');
        });
    });

    describe('Stripe Link V2 Element mounting', () => {
        beforeEach(async () => {
            await strategy.initialize(initialiseOptions);
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
        const stripeEvent = jest.fn();

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('initialise all events', async () => {
            await strategy.initialize(initialiseOptions);

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
            expect(element.on).toHaveBeenCalledWith(
                StripeElementEvent.CANCEL,
                expect.any(Function),
            );
        });

        it('calls onShippingAddressChange callback if event was triggered', async () => {
            await strategy.initialize(initialiseOptions);

            stripeEventEmitter.emit(StripeElementEvent.SHIPPING_ADDRESS_CHANGE, {
                address: {
                    city: 'London',
                    country: 'UK',
                    postal_code: '091-22',
                    state: 'CA',
                },
                resolve: stripeEvent,
            });
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.updateShippingAddress).toHaveBeenCalled();
            expect(paymentIntegrationService.loadShippingCountries).toHaveBeenCalled();
            expect(stripeEvent).toHaveBeenCalledWith({
                shippingRates: [
                    {
                        amount: 0,
                        displayName: 'Flat Rate',
                        id: '0:61d4bb52f746477e1d4fb411221318c3',
                    },
                ],
            });
        });

        it('calls onShippingAddressChange callback with empty address', async () => {
            await strategy.initialize(initialiseOptions);

            stripeEventEmitter.emit(StripeElementEvent.SHIPPING_ADDRESS_CHANGE, {
                address: {
                    city: '',
                    country: '',
                    postal_code: '',
                    state: '',
                },
                resolve: stripeEvent,
            });
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.updateShippingAddress).toHaveBeenCalled();
            expect(paymentIntegrationService.loadShippingCountries).toHaveBeenCalled();
        });

        it('calls onShippingAddressChange callback with no address', async () => {
            await strategy.initialize(initialiseOptions);

            stripeEventEmitter.emit(StripeElementEvent.SHIPPING_ADDRESS_CHANGE, {
                address: undefined,
                resolve: stripeEvent,
            });
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.updateShippingAddress).toHaveBeenCalled();
        });

        it('reject onShippingAddressChange with empty shippingRates', async () => {
            const stripeEventRejectMock = jest.fn();

            jest.spyOn(paymentIntegrationService, 'getState').mockReturnValue({
                ...paymentIntegrationService.getState(),
                getConsignments: jest.fn().mockReturnValue(undefined),
            });

            await strategy.initialize(initialiseOptions);

            stripeEventEmitter.emit(StripeElementEvent.SHIPPING_ADDRESS_CHANGE, {
                address: {
                    city: 'London',
                    country: 'UK',
                    postal_code: '091-22',
                    state: 'CA',
                },
                resolve: stripeEvent,
                reject: stripeEventRejectMock,
            });
            await new Promise((resolve) => process.nextTick(resolve));

            expect(stripeEvent).not.toHaveBeenCalled();
            expect(stripeEventRejectMock).toHaveBeenCalled();
        });

        it('reject onShippingAddressChange with empty shippingRates if there is no availableShippingOptions', async () => {
            const stripeEventRejectMock = jest.fn();

            jest.spyOn(paymentIntegrationService, 'getState').mockReturnValue({
                ...paymentIntegrationService.getState(),
                getConsignments: jest
                    .fn()
                    .mockReturnValue([{ availableShippingOptions: undefined }]),
            });

            await strategy.initialize(initialiseOptions);

            stripeEventEmitter.emit(StripeElementEvent.SHIPPING_ADDRESS_CHANGE, {
                address: {
                    city: 'London',
                    country: 'UK',
                    postal_code: '091-22',
                    state: 'CA',
                },
                resolve: stripeEvent,
                reject: stripeEventRejectMock,
            });
            await new Promise((resolve) => process.nextTick(resolve));

            expect(stripeEvent).not.toHaveBeenCalled();
            expect(stripeEventRejectMock).toHaveBeenCalled();
        });

        it('resolve onShippingAddressChange with selectedId', async () => {
            jest.spyOn(paymentIntegrationService, 'getState').mockReturnValue({
                ...paymentIntegrationService.getState(),
                getConsignments: jest.fn().mockReturnValue([
                    {
                        availableShippingOptions: [
                            {
                                id: 1,
                                description: 'description',
                                cost: 1000,
                            },
                            {
                                id: 2,
                                description: 'description2',
                                cost: 2000,
                            },
                        ],
                        selectedShippingOption: {
                            id: 2,
                            description: 'description2',
                            cost: 2000,
                        },
                    },
                ]),
            });

            await strategy.initialize(initialiseOptions);

            stripeEventEmitter.emit(StripeElementEvent.SHIPPING_ADDRESS_CHANGE, {
                address: {
                    city: 'London',
                    country: 'UK',
                    postal_code: '091-22',
                    state: 'CA',
                },
                resolve: stripeEvent,
            });
            await new Promise((resolve) => process.nextTick(resolve));

            expect(stripeEvent).toHaveBeenCalledWith({
                shippingRates: [
                    {
                        amount: 200000,
                        displayName: 'description2',
                        id: 2,
                    },
                    {
                        amount: 100000,
                        displayName: 'description',
                        id: 1,
                    },
                ],
            });
        });

        it('calls onShippingRateChange callback if event was triggered', async () => {
            await strategy.initialize(initialiseOptions);

            stripeEventEmitter.emit(StripeElementEvent.SHIPPING_RATE_CHANGE, {
                shippingRate: {
                    id: '123',
                },
                resolve: stripeEvent,
            });
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalled();
            expect(stripeEvent).toHaveBeenCalledWith({});
        });

        it('calls onCancel callback if event was triggered', async () => {
            await strategy.initialize(initialiseOptions);

            try {
                stripeEventEmitter.emit(StripeElementEvent.CANCEL, {
                    resolve: stripeEvent,
                });
                await new Promise((resolve) => process.nextTick(resolve));
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodCancelledError);
            }
        });

        it('initialise all events correctly if there is no physical items', async () => {
            const cartMock = getCart();

            cartMock.lineItems.physicalItems = [];
            jest.spyOn(paymentIntegrationService, 'getState').mockReturnValue({
                ...paymentIntegrationService.getState(),
                getCartOrThrow: jest.fn().mockReturnValue(cartMock),
            });

            await strategy.initialize(initialiseOptions);

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
            expect(element.on).toHaveBeenCalledWith(
                StripeElementEvent.CANCEL,
                expect.any(Function),
            );
        });

        describe('#onConfirm', () => {
            let errorResponse: RequestError;
            let confirmPaymentMock: jest.Mock;
            let retrievePaymentIntentMock: jest.Mock;

            const mockFirstPaymentRequest = (payload: unknown) => {
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                    Promise.reject(payload),
                );
            };

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

            afterEach(() => {
                clearAllMocks();
            });

            it('updates addresses when onConfirm callback event triggered', async () => {
                await strategy.initialize(initialiseOptions);

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

            it('updates addresses with empty obejct when onConfirm callback event triggered', async () => {
                await strategy.initialize(initialiseOptions);

                stripeEventEmitter.emit(StripeElementEvent.CONFIRM, {
                    billingDetails: {
                        // name: '',
                        email: '',
                        phone: '',
                        address: {
                            // line1: '',
                            // city: '',
                            // country: '',
                            // state: '',
                            // postal_code: '',
                        },
                    },
                    shippingAddress: {
                        // name: '',
                        address: {
                            // line1: '',
                            // city: '',
                            // country: '',
                            // state: '',
                            // postal_code: '',
                        },
                    },
                });
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith({
                    address1: '',
                    address2: '',
                    city: '',
                    company: '',
                    countryCode: '',
                    customFields: [],
                    email: '',
                    firstName: '',
                    lastName: '',
                    phone: '',
                    postalCode: '',
                    stateOrProvince: '',
                    stateOrProvinceCode: '',
                });
                expect(paymentIntegrationService.updateShippingAddress).toHaveBeenCalledWith({
                    address1: '',
                    address2: '',
                    city: '',
                    company: '',
                    countryCode: '',
                    customFields: [],
                    firstName: '',
                    lastName: '',
                    phone: '',
                    postalCode: '',
                    stateOrProvince: '',
                    stateOrProvinceCode: '',
                });
            });

            it('submit second payment request after stripe confirmation', async () => {
                mockFirstPaymentRequest(errorResponse);
                await strategy.initialize(initialiseOptions);

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

            it('doesn"t submit an order if there is empty event object', async () => {
                await strategy.initialize(initialiseOptions);

                stripeEventEmitter.emit(StripeElementEvent.CONFIRM, {});
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(0);
            });

            it('throws not request error', async () => {
                mockFirstPaymentRequest(new Error('Not request'));
                await strategy.initialize(initialiseOptions);

                stripeEventEmitter.emit(StripeElementEvent.CONFIRM, mockStripeAddress);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
            });

            it('throws not additional action error', async () => {
                mockFirstPaymentRequest(errorResponse);
                jest.spyOn(stripeIntegrationService, 'isAdditionalActionError').mockReturnValue(
                    false,
                );

                await strategy.initialize(initialiseOptions);

                stripeEventEmitter.emit(StripeElementEvent.CONFIRM, mockStripeAddress);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
            });

            describe('#toggleLoadingIndicator', () => {
                beforeEach(() => {
                    jest.spyOn(loadingIndicator, 'show').mockReturnValue(undefined);
                    jest.spyOn(loadingIndicator, 'hide').mockReturnValue(undefined);
                    jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                        Promise.reject(errorResponse),
                    );
                });

                it('shows loading indicator on confirm callback', async () => {
                    await strategy.initialize(initialiseOptions);

                    stripeEventEmitter.emit(StripeElementEvent.CONFIRM, mockStripeAddress);
                    await new Promise((resolve) => process.nextTick(resolve));

                    expect(loadingIndicator.show).toHaveBeenCalled();
                });

                it('hides loading indicator when error occurs', async () => {
                    await strategy.initialize(initialiseOptions);

                    try {
                        stripeEventEmitter.emit(StripeElementEvent.CONFIRM, mockStripeAddress);
                        await new Promise((_resolve, reject) => process.nextTick(reject));
                    } catch (error: unknown) {
                        expect(loadingIndicator.hide).toHaveBeenCalled();
                    }
                });
            });
        });
    });

    it('#signIn', async () => {
        await expect(strategy.signIn()).resolves.toBeUndefined();
    });

    it('#signOut', async () => {
        await expect(strategy.signOut()).resolves.toBeUndefined();
    });

    it('#executePaymentMethodCheckout', async () => {
        await expect(strategy.executePaymentMethodCheckout()).resolves.toBeUndefined();
    });

    it('#deinitialize', async () => {
        await expect(strategy.deinitialize()).resolves.toBeUndefined();
    });
});
