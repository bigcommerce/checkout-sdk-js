import { getScriptLoader } from '@bigcommerce/script-loader';
import { omit } from 'lodash';

import {
    BraintreeClient,
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreeModuleCreator,
    BraintreePaypal,
    BraintreePaypalCheckout,
    BraintreeScriptLoader,
    getBraintreePaypal,
    getBraintreePaypalMock,
    getClientMock,
    getModuleCreatorMock,
    getPayPalCheckoutCreatorMock,
    getPaypalCheckoutMock,
    getPaypalMock,
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
    getCart,
    getOrderRequestBody,
    getShippingAddress,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import mapToBraintreeShippingAddressOverride from '../map-to-braintree-shipping-address-override';

import BraintreePaypalPaymentStrategy from './braintree-paypal-payment-strategy';

describe('BraintreePaypalPaymentStrategy', () => {
    let strategy: BraintreePaypalPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let paymentMethodMock: PaymentMethod;
    let clientCreatorMock: BraintreeModuleCreator<BraintreeClient>;
    let braintreePaypalCreatorMock: BraintreeModuleCreator<BraintreePaypal>;
    let paypalCheckoutMock: BraintreePaypalCheckout;
    let paypalCheckoutCreatorMock: BraintreeModuleCreator<BraintreePaypalCheckout>;
    let paypalSdkMock: PaypalSDK;
    let paypalMessageElement: HTMLDivElement;

    beforeEach(() => {
        paypalMessageElement = document.createElement('div');
        paypalMessageElement.id = 'banner-container-id';
        document.body.appendChild(paypalMessageElement);

        paypalSdkMock = getPaypalMock();

        paymentMethodMock = getBraintreePaypal();

        clientCreatorMock = getModuleCreatorMock(getClientMock());
        braintreePaypalCreatorMock = getModuleCreatorMock(getBraintreePaypalMock());
        paypalCheckoutMock = getPaypalCheckoutMock();
        paypalCheckoutCreatorMock = getPayPalCheckoutCreatorMock(paypalCheckoutMock, false);

        paymentIntegrationService = new PaymentIntegrationServiceMock();

        const state = paymentIntegrationService.getState();

        jest.spyOn(state, 'getPaymentMethodOrThrow').mockImplementation(() => paymentMethodMock);
        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockReturnValue(state);
        jest.spyOn(
            paymentIntegrationService.getState(),
            'getOutstandingBalance',
        ).mockImplementation((useStoreCredit) => (useStoreCredit ? 150 : 190));

        braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader(), window);
        jest.spyOn(braintreeScriptLoader, 'initialize').mockReturnValue(undefined);
        jest.spyOn(braintreeScriptLoader, 'loadClient').mockReturnValue(clientCreatorMock);
        jest.spyOn(braintreeScriptLoader, 'loadPaypal').mockReturnValue(braintreePaypalCreatorMock);
        jest.spyOn(braintreeScriptLoader, 'loadPaypalCheckout').mockReturnValue(
            paypalCheckoutCreatorMock,
        );

        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );

        jest.spyOn(braintreeIntegrationService, 'initialize');
        jest.spyOn(braintreeIntegrationService, 'getPaypal');
        jest.spyOn(braintreeIntegrationService, 'getPaypalCheckout');
        jest.spyOn(braintreeIntegrationService, 'getSessionId').mockReturnValue('my_session_id');
        jest.spyOn(braintreeIntegrationService, 'teardown');
        jest.spyOn(braintreeIntegrationService, 'paypal').mockResolvedValue({
            nonce: 'my_tokenized_card',
            details: { email: 'random@email.com' },
        });

        strategy = new BraintreePaypalPaymentStrategy(
            paymentIntegrationService,
            braintreeIntegrationService,
        );

        (window as BraintreeHostWindow).paypal = paypalSdkMock;

        jest.spyOn(paypalSdkMock, 'Messages').mockImplementation(() => ({
            render: jest.fn(),
        }));
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
                paymentIntegrationService.getState().getStoreConfig(),
            );
        });

        it('preloads paypal', async () => {
            await strategy.initialize({ methodId: paymentMethodMock.id });

            expect(braintreeIntegrationService.getPaypal).toHaveBeenCalled();
        });

        it('paypal checkout is not initialized', async () => {
            const options = {
                methodId: paymentMethodMock.id,
                braintree: { bannerContainerId: 'banner-container-id' },
            };

            await strategy.initialize(options);

            expect(braintreeIntegrationService.getPaypalCheckout).not.toHaveBeenCalled();
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

        it('renders PayPal checkout message', async () => {
            paymentMethodMock.initializationData.enableCheckoutPaywallBanner = true;

            const cartMock = getCart();

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(
                cartMock,
            );

            const options = {
                methodId: paymentMethodMock.id,
                braintree: { bannerContainerId: 'banner-container-id' },
            };

            await strategy.initialize(options);

            expect(paypalSdkMock.Messages).toHaveBeenCalledWith({
                amount: 190,
                placement: 'payment',
                style: {
                    layout: 'text',
                    logo: {
                        type: 'inline',
                    },
                },
            });
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

        it('if paypal fails we do not submit an order', async () => {
            paymentIntegrationService = new PaymentIntegrationServiceMock();

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);
            jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockReturnValue(
                paymentIntegrationService.getState(),
            );

            strategy = new BraintreePaypalPaymentStrategy(
                paymentIntegrationService,
                braintreeIntegrationService,
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

                    expect(error).toBeInstanceOf(InvalidArgumentError);
                    expect(error.message).toBe(
                        'Vaulting is disabled but a vaulted instrument was being used for this transaction',
                    );
                }
            });
        });

        describe('if paypal credit', () => {
            beforeEach(() => {
                strategy = new BraintreePaypalPaymentStrategy(
                    paymentIntegrationService,
                    braintreeIntegrationService,
                    true,
                );
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
