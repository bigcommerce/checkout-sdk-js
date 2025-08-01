import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';
import { omit } from 'lodash';

import {
    BraintreeClient,
    BraintreeError,
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreeMessages,
    BraintreeModuleCreator,
    BraintreePaypal,
    BraintreePaypalCheckout,
    BraintreeScriptLoader,
    BraintreeSDKVersionManager,
    getBraintreePaypal,
    getBraintreePaypalMock,
    getClientMock,
    getModuleCreatorMock,
    getPayPalCheckoutCreatorMock,
    getPaypalCheckoutMock,
    getPaypalMock,
    getTokenizePayload,
    PaypalButtonOptions,
    PaypalSDK,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    InvalidArgumentError,
    MissingDataError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodCancelledError,
    PaymentMethodFailedError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConfig,
    getOrderRequestBody,
    getShippingAddress,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import mapToBraintreeShippingAddressOverride from '../map-to-braintree-shipping-address-override';

import BraintreePaypalPaymentStrategy from './braintree-paypal-payment-strategy';

describe('BraintreePaypalPaymentStrategy', () => {
    let eventEmitter: EventEmitter;
    let strategy: BraintreePaypalPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let braintreeMessages: BraintreeMessages;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let paymentMethodMock: PaymentMethod;
    let clientCreatorMock: BraintreeModuleCreator<BraintreeClient>;
    let braintreePaypalCreatorMock: BraintreeModuleCreator<BraintreePaypal>;
    let paypalCheckoutCreatorMock: BraintreeModuleCreator<BraintreePaypalCheckout>;
    let paypalSdkMock: PaypalSDK;
    let braintreePaypalCheckoutMock: BraintreePaypalCheckout;
    let braintreeSDKVersionManager: BraintreeSDKVersionManager;

    const storeConfig = getConfig().storeConfig;

    const storeConfigWithFeaturesOn = {
        ...storeConfig,
        checkoutSettings: {
            ...storeConfig.checkoutSettings,
            features: {
                ...storeConfig.checkoutSettings.features,
                'PAYPAL-3521.handling_declined_error_braintree': true,
            },
        },
    };

    const providerError = {
        errors: [
            {
                code: 'transaction_declined',
                message: 'Payment was declined. Please try again.',
                provider_error: {
                    code: '2046',
                },
            },
        ],
    };

    beforeEach(() => {
        eventEmitter = new EventEmitter();

        paypalSdkMock = getPaypalMock();
        paymentMethodMock = getBraintreePaypal();
        clientCreatorMock = getModuleCreatorMock(getClientMock());
        braintreePaypalCreatorMock = getModuleCreatorMock(getBraintreePaypalMock());
        braintreePaypalCheckoutMock = getPaypalCheckoutMock();
        paypalCheckoutCreatorMock = getPayPalCheckoutCreatorMock(
            braintreePaypalCheckoutMock,
            false,
        );

        (window as BraintreeHostWindow).paypal = paypalSdkMock;

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
        braintreeScriptLoader = new BraintreeScriptLoader(
            getScriptLoader(),
            window,
            braintreeSDKVersionManager,
        );
        braintreeMessages = new BraintreeMessages(paymentIntegrationService);
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );
        strategy = new BraintreePaypalPaymentStrategy(
            paymentIntegrationService,
            braintreeIntegrationService,
            braintreeMessages,
            new LoadingIndicator(),
        );

        const state = paymentIntegrationService.getState();

        jest.spyOn(state, 'getPaymentMethodOrThrow').mockImplementation(() => paymentMethodMock);
        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(state);
        jest.spyOn(
            paymentIntegrationService.getState(),
            'getOutstandingBalance',
        ).mockImplementation((useStoreCredit) => (useStoreCredit ? 150 : 190));
        jest.spyOn(paymentIntegrationService, 'submitPayment').mockResolvedValue(state);

        jest.spyOn(braintreeScriptLoader, 'loadClient').mockResolvedValue(clientCreatorMock);
        jest.spyOn(braintreeScriptLoader, 'loadPaypal').mockResolvedValue(
            braintreePaypalCreatorMock,
        );
        jest.spyOn(braintreeScriptLoader, 'loadPaypalCheckout').mockResolvedValue(
            paypalCheckoutCreatorMock,
        );

        const getSDKPaypalCheckoutMock = (
            braintreePaypalCheckoutPayloadMock?: BraintreePaypalCheckout,
        ) => {
            if (!braintreePaypalCheckoutPayloadMock) {
                return jest.fn(
                    (
                        _options: unknown,
                        _successCallback: unknown,
                        errorCallback: (err: BraintreeError) => void,
                    ) => {
                        errorCallback({ type: 'UNKNOWN', code: '234' } as BraintreeError);

                        return Promise.resolve(braintreePaypalCheckoutMock);
                    },
                );
            }

            return jest.fn(
                (
                    _options: unknown,
                    successCallback: (braintreePaypalCheckout: BraintreePaypalCheckout) => void,
                ) => {
                    successCallback(braintreePaypalCheckoutPayloadMock);

                    return Promise.resolve(braintreePaypalCheckoutMock);
                },
            );
        };

        jest.spyOn(braintreeIntegrationService, 'initialize');
        jest.spyOn(braintreeIntegrationService, 'getPaypal');
        jest.spyOn(braintreeIntegrationService, 'getPaypalCheckout').mockImplementation(
            getSDKPaypalCheckoutMock(braintreePaypalCheckoutMock),
        );
        jest.spyOn(braintreeIntegrationService, 'getSessionId').mockResolvedValue('my_session_id');
        jest.spyOn(braintreeIntegrationService, 'teardown');
        jest.spyOn(braintreeIntegrationService, 'paypal').mockResolvedValue({
            type: 'PaypalAccount',
            nonce: 'my_tokenized_card',
            details: { email: 'random@email.com' },
        });

        jest.spyOn(braintreeMessages, 'render');

        jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation((options: PaypalButtonOptions) => {
            eventEmitter.on('approve', () => {
                if (typeof options.onApprove === 'function') {
                    options.onApprove();
                }
            });

            eventEmitter.on('createOrder', () => {
                if (typeof options.createOrder === 'function') {
                    options.createOrder();
                }
            });

            return {
                isEligible: jest.fn(() => true),
                render: jest.fn(),
                close: jest.fn(),
            };
        });
    });

    it('creates an instance of the braintree payment strategy', () => {
        expect(strategy).toBeInstanceOf(BraintreePaypalPaymentStrategy);
    });

    describe('#initialize()', () => {
        it('initializes the braintree integration service with the client token and the set of options', async () => {
            const options = { methodId: paymentMethodMock.id, braintree: {} };

            await strategy.initialize(options);

            expect(braintreeIntegrationService.initialize).toHaveBeenCalledWith(
                paymentMethodMock.clientToken,
            );
        });

        it('preloads paypal', async () => {
            await strategy.initialize({ methodId: paymentMethodMock.id });

            expect(braintreeIntegrationService.getPaypal).toHaveBeenCalled();
        });

        it('paypal checkout is initialized successfully', async () => {
            paymentMethodMock.initializationData.enableCheckoutPaywallBanner = true;

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            const options = {
                methodId: paymentMethodMock.id,
                braintree: { bannerContainerId: 'banner-container-id' },
            };

            await strategy.initialize(options);

            expect(braintreeIntegrationService.getPaypalCheckout).toHaveBeenCalledWith(
                {
                    currency: 'USD',
                    isCreditEnabled: undefined,
                    intent: undefined,
                },
                expect.any(Function),
                expect.any(Function),
            );
        });

        it('renders Braintree PayPal message', async () => {
            const options = {
                methodId: paymentMethodMock.id,
                braintree: { bannerContainerId: 'banner-container-id' },
            };

            await strategy.initialize(options);

            expect(braintreeMessages.render).toHaveBeenCalledWith(
                paymentMethodMock.id,
                'banner-container-id',
                'payment',
            );
        });

        it('throws error if unable to initialize', async () => {
            paymentMethodMock.clientToken = undefined;

            try {
                await strategy.initialize({ methodId: paymentMethodMock.id });
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });

    describe('#execute()', () => {
        let orderRequestBody: OrderRequestBody;
        let options: PaymentInitializeOptions;

        const shippingAddressOverride = mapToBraintreeShippingAddressOverride(getShippingAddress());

        beforeEach(() => {
            orderRequestBody = getOrderRequestBody();
            options = { methodId: getBraintreePaypal().id };

            jest.clearAllMocks();
        });

        it('calls submit order with the order request information', async () => {
            await strategy.initialize(options);
            await strategy.execute(orderRequestBody, options);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                omit(orderRequestBody, 'payment'),
                expect.any(Object),
            );
        });

        it('refresh the state if paymentMethod has nonce value', async () => {
            paymentMethodMock.nonce = 'some-nonce';
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            await strategy.initialize(options);
            await strategy.execute(orderRequestBody, options);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledTimes(1);
            expect(braintreeIntegrationService.getPaypal).toHaveBeenCalledTimes(1);
            expect(braintreeIntegrationService.initialize).toHaveBeenCalledTimes(1);
        });

        it('pass the options to submitOrder', async () => {
            await strategy.initialize(options);
            await strategy.execute(orderRequestBody, options);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                expect.any(Object),
                options,
            );
        });

        it('submitPayment with the right information', async () => {
            const expected = {
                ...orderRequestBody.payment,
                paymentData: {
                    formattedPayload: {
                        vault_payment_instrument: null,
                        set_as_default_stored_instrument: null,
                        device_info: 'my_session_id',
                        paypal_account: {
                            token: 'my_tokenized_card',
                            email: 'random@email.com',
                        },
                    },
                },
            };

            await strategy.initialize(options);
            await strategy.execute(orderRequestBody, options);

            expect(braintreeIntegrationService.paypal).toHaveBeenCalledWith({
                amount: 190,
                locale: 'en_US',
                currency: 'USD',
                shouldSaveInstrument: false,
                offerCredit: false,
                shippingAddressEditable: false,
                shippingAddressOverride,
            });

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expected);
        });

        it('passes grand total with store credit to PayPal if it is applied', async () => {
            await strategy.initialize(options);

            const state = paymentIntegrationService.getState();

            jest.spyOn(state, 'getOutstandingBalance').mockImplementation((useStoreCredit) =>
                useStoreCredit ? 150 : 190,
            );

            await strategy.execute({ ...orderRequestBody, useStoreCredit: true }, options);

            expect(state.getOutstandingBalance).toHaveBeenCalledWith(true);
            expect(braintreeIntegrationService.paypal).toHaveBeenCalledWith({
                amount: 150,
                locale: 'en_US',
                currency: 'USD',
                shouldSaveInstrument: false,
                offerCredit: false,
                shippingAddressEditable: false,
                shippingAddressOverride,
            });

            await strategy.execute(orderRequestBody, options);

            expect(state.getOutstandingBalance).toHaveBeenCalledWith(false);
            expect(braintreeIntegrationService.paypal).toHaveBeenCalledWith({
                amount: 190,
                locale: 'en_US',
                currency: 'USD',
                shouldSaveInstrument: false,
                shippingAddressEditable: false,
                offerCredit: false,
                shippingAddressOverride,
            });
        });

        it('does not call paypal if a nonce is present', async () => {
            paymentMethodMock.nonce = 'some-nonce';

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            const expected = expect.objectContaining({
                paymentData: {
                    formattedPayload: {
                        vault_payment_instrument: null,
                        set_as_default_stored_instrument: null,
                        device_info: null,
                        paypal_account: {
                            token: 'some-nonce',
                            email: null,
                        },
                    },
                },
            });

            await strategy.initialize({ methodId: paymentMethodMock.id });
            await strategy.execute(orderRequestBody, options);

            expect(braintreeIntegrationService.paypal).not.toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expected);
        });

        it('converts any error returned by braintree in a StandardError', async () => {
            braintreeIntegrationService.paypal = () =>
                Promise.reject({ name: 'BraintreeError', message: 'my_message' });

            await strategy.initialize(options);

            await expect(strategy.execute(orderRequestBody, options)).rejects.toEqual(
                expect.any(PaymentMethodFailedError),
            );
        });

        it('does not submit order when paypal fails', async () => {
            paymentIntegrationService = new PaymentIntegrationServiceMock();

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);
            jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(
                paymentIntegrationService.getState(),
            );

            braintreeIntegrationService.paypal = () =>
                Promise.reject({ name: 'BraintreeError', message: 'my_message' });

            await strategy.initialize(options);

            try {
                await strategy.execute(orderRequestBody, options);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodFailedError);
                expect(paymentIntegrationService.submitOrder).not.toHaveBeenCalledWith();
            }
        });

        it('throws cancellation error if shopper dismisses PayPal modal before completing authorization flow', async () => {
            jest.spyOn(braintreeIntegrationService, 'paypal').mockRejectedValue({
                code: 'PAYPAL_POPUP_CLOSED',
                message: 'Customer closed PayPal popup before authorizing.',
                name: 'BraintreeError',
            });

            await strategy.initialize(options);

            try {
                await strategy.execute(orderRequestBody, options);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodCancelledError);
            }
        });

        it('throws specific error if receive INSTRUMENT_DECLINED error and experiment is on', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfigWithFeaturesOn);

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(() => {
                throw providerError;
            });

            const braintreeOptions = {
                ...options,
                braintree: {
                    onError: jest.fn(),
                },
            };

            await strategy.initialize(braintreeOptions);

            try {
                await strategy.execute(orderRequestBody, options);
            } catch (error) {
                expect(braintreeOptions.braintree.onError).toHaveBeenCalledWith(
                    new Error('INSTRUMENT_DECLINED'),
                );
            }
        });

        it('rendering the paypal button when a specific INSTRUMENT_DECLINED error occurs', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfigWithFeaturesOn);

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(() => {
                throw providerError;
            });

            const braintreeOptions = {
                ...options,
                braintree: {
                    onError: jest.fn(),
                    containerId: '#checkout-button-container',
                },
            };

            await strategy.initialize(braintreeOptions);

            try {
                await strategy.execute(orderRequestBody, options);
            } catch (error) {
                expect(braintreeOptions.braintree.onError).toHaveBeenCalledWith(
                    new Error('INSTRUMENT_DECLINED'),
                );

                expect(paypalSdkMock.Buttons).toHaveBeenCalled();
            }
        });

        it('execute submitPayment with re-authorised NONCE value when a specific INSTRUMENT_DECLINED error occurs', async () => {
            const token = getTokenizePayload().nonce;

            const expected = {
                ...orderRequestBody.payment,
                paymentData: {
                    formattedPayload: {
                        vault_payment_instrument: null,
                        set_as_default_stored_instrument: null,
                        device_info: null,
                        paypal_account: { token, email: null },
                    },
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfigWithFeaturesOn);

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(() => {
                throw providerError;
            });

            const braintreeOptions = {
                ...options,
                braintree: {
                    onError: jest.fn(),
                    containerId: '#checkout-button-container',
                },
            };

            await strategy.initialize(braintreeOptions);

            try {
                await strategy.execute(orderRequestBody, options);
            } catch (error) {
                expect(braintreeOptions.braintree.onError).toHaveBeenCalledWith(
                    new Error('INSTRUMENT_DECLINED'),
                );
            }

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(jest.fn());

            eventEmitter.emit('approve');

            await new Promise((resolve) => process.nextTick(resolve));

            await strategy.execute(orderRequestBody, options);

            expect(paymentIntegrationService.submitPayment).toHaveBeenLastCalledWith(expected);
        });

        it('#createOrder button callback', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfigWithFeaturesOn);

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(() => {
                throw providerError;
            });

            const braintreeOptions = {
                ...options,
                braintree: {
                    onError: jest.fn(),
                    containerId: '#checkout-button-container',
                },
            };

            await strategy.initialize(braintreeOptions);

            try {
                await strategy.execute(orderRequestBody, options);
            } catch (error) {
                expect(braintreeOptions.braintree.onError).toHaveBeenCalledWith(
                    new Error('INSTRUMENT_DECLINED'),
                );
            }

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(jest.fn());

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            await strategy.execute(orderRequestBody, options);

            expect(braintreePaypalCheckoutMock.createPayment).toHaveBeenCalledWith({
                amount: 190,
                currency: 'USD',
                enableShippingAddress: true,
                flow: 'checkout',
                offerCredit: false,
                shippingAddressEditable: false,
                shippingAddressOverride: {
                    city: 'Some City',
                    countryCode: 'US',
                    line1: '12345 Testing Way',
                    line2: '',
                    phone: '555-555-5555',
                    postalCode: '95555',
                    recipientName: 'Test Tester',
                    state: 'CA',
                },
            });
        });

        describe('when paying with a vaulted instrument', () => {
            beforeEach(() => {
                orderRequestBody = {
                    payment: {
                        methodId: 'braintreepaypal',
                        paymentData: {
                            instrumentId: 'fake-instrument-id',
                        },
                    },
                };
            });

            it('calls submit payment with the right payload', async () => {
                paymentMethodMock.config.isVaultingEnabled = true;

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(paymentMethodMock);

                await strategy.initialize({ methodId: paymentMethodMock.id });
                await strategy.execute(orderRequestBody, options);

                expect(braintreeIntegrationService.paypal).not.toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                    methodId: 'braintreepaypal',
                    paymentData: {
                        instrumentId: 'fake-instrument-id',
                    },
                });
            });

            it('throws if vaulting is disabled and trying to pay with a vaulted instrument', async () => {
                await strategy.initialize({ methodId: paymentMethodMock.id });

                try {
                    await strategy.execute(orderRequestBody, options);
                } catch (error) {
                    expect(braintreeIntegrationService.paypal).not.toHaveBeenCalledWith();
                    expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalledWith();
                    expect(paymentIntegrationService.submitOrder).not.toHaveBeenCalledWith();

                    if (error instanceof InvalidArgumentError) {
                        expect(error).toBeInstanceOf(InvalidArgumentError);
                        expect(error.message).toBe(
                            'Vaulting is disabled but a vaulted instrument was being used for this transaction',
                        );
                    }
                }
            });
        });

        describe('if paypal credit', () => {
            beforeEach(() => {
                const state = paymentIntegrationService.getState();

                jest.spyOn(state, 'getPaymentMethodOrThrow').mockImplementation(() => ({
                    ...paymentMethodMock,
                    id: 'braintreepaypalcredit',
                }));
            });

            it('submitPayment with the right information and sets credit to true', async () => {
                const expected = {
                    ...orderRequestBody.payment,
                    paymentData: {
                        formattedPayload: {
                            vault_payment_instrument: null,
                            set_as_default_stored_instrument: null,
                            device_info: 'my_session_id',
                            paypal_account: {
                                token: 'my_tokenized_card',
                                email: 'random@email.com',
                            },
                        },
                    },
                };

                await strategy.initialize(options);
                await strategy.execute(orderRequestBody, options);

                expect(braintreeIntegrationService.paypal).toHaveBeenCalledWith({
                    amount: 190,
                    locale: 'en_US',
                    currency: 'USD',
                    shouldSaveInstrument: false,
                    offerCredit: true,
                    shippingAddressEditable: false,
                    shippingAddressOverride,
                });
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expected);
            });
        });

        describe('when vaulting is selected', () => {
            beforeEach(() => {
                orderRequestBody = {
                    payment: {
                        methodId: 'braintreepaypal',
                        paymentData: {
                            shouldSaveInstrument: true,
                        },
                    },
                };

                paymentMethodMock.config.isVaultingEnabled = true;
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(paymentMethodMock);
            });

            it('initializes paypal in vault mode', async () => {
                const expected = {
                    ...orderRequestBody.payment,
                    paymentData: {
                        formattedPayload: {
                            vault_payment_instrument: true,
                            set_as_default_stored_instrument: null,
                            device_info: 'my_session_id',
                            paypal_account: {
                                token: 'my_tokenized_card',
                                email: 'random@email.com',
                            },
                        },
                    },
                };

                await strategy.initialize(options);
                await strategy.execute(orderRequestBody, options);

                expect(braintreeIntegrationService.paypal).toHaveBeenCalledWith(
                    expect.objectContaining({
                        shouldSaveInstrument: true,
                    }),
                );

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expected);
            });

            it('sends vault_payment_instrument set to true', async () => {
                paymentMethodMock.config.isVaultingEnabled = true;

                const expected = {
                    ...orderRequestBody.payment,
                    paymentData: {
                        formattedPayload: expect.objectContaining({
                            vault_payment_instrument: true,
                        }),
                    },
                };

                await strategy.initialize(options);
                await strategy.execute(orderRequestBody, options);

                expect(braintreeIntegrationService.paypal).toHaveBeenCalledWith(
                    expect.objectContaining({
                        shouldSaveInstrument: true,
                    }),
                );

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expected);
            });

            it('sends set_as_default_stored_instrument set to null when vaulting and NOT making default', async () => {
                await strategy.initialize(options);
                await strategy.execute(
                    {
                        payment: {
                            methodId: 'braintreepaypal',
                            paymentData: {
                                shouldSaveInstrument: true,
                            },
                        },
                    },
                    options,
                );

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        paymentData: {
                            formattedPayload: expect.objectContaining({
                                set_as_default_stored_instrument: null,
                            }),
                        },
                    }),
                );
            });

            it('sends set_as_default_stored_instrument set to true when vaulting and making default', async () => {
                await strategy.initialize(options);
                await strategy.execute(
                    {
                        payment: {
                            methodId: 'braintreepaypal',
                            paymentData: {
                                shouldSaveInstrument: true,
                                shouldSetAsDefaultInstrument: true,
                            },
                        },
                    },
                    options,
                );

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        paymentData: {
                            formattedPayload: expect.objectContaining({
                                set_as_default_stored_instrument: true,
                            }),
                        },
                    }),
                );
            });

            it('throws if vaulting is enabled and trying to save an instrument', async () => {
                paymentMethodMock.config.isVaultingEnabled = false;
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(paymentMethodMock);
                await strategy.initialize(options);

                try {
                    await strategy.execute(orderRequestBody, options);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidArgumentError);
                }
            });
        });
    });

    describe('#deinitialize()', () => {
        it('calls deinitialize in the braintree payment processor', async () => {
            await strategy.deinitialize();

            expect(braintreeIntegrationService.teardown).toHaveBeenCalled();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await strategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });
});
