import { createScriptLoader } from '@bigcommerce/script-loader';

import {
    Checkout,
    InvalidArgumentError,
    NotInitializedError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodFailedError,
    RequestError,
    StoreConfig,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCart,
    getCheckout,
    getConfig,
    getCustomer,
    getErrorPaymentResponseBody,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import {
    getConfirmPaymentResponse,
    getFailingStripeJsMock,
    getRetrievePaymentIntentResponseSucceeded,
    getRetrievePaymentIntentResponseWithError,
    getStripeIntegrationServiceMock,
    getStripeJsMock,
    STRIPE_UPE_CLIENT_API_VERSION,
    STRIPE_UPE_CLIENT_BETAS,
    StripeClient,
    StripeElementsOptions,
    StripeElementType,
    StripeElementUpdateOptions,
    StripeEventType,
    StripeIntegrationService,
    StripePaymentMethodType,
    StripeScriptLoader,
    StripeStringConstants,
} from '@bigcommerce/checkout-sdk/stripe-utils';

import { WithStripeUPEPaymentInitializeOptions } from './stripe-upe-initialize-options';
import StripeUPEPaymentStrategy from './stripe-upe-payment-strategy';
import {
    getStripeUPEInitializeOptionsMock,
    getStripeUPEMock,
    getStripeUPEOrderRequestBodyMock,
    getStripeUPEOrderRequestBodyVaultMock,
} from './stripe-upe.mock';

describe('StripeUPEPaymentStrategy', () => {
    let checkoutMock: Checkout;
    let strategy: StripeUPEPaymentStrategy;
    let stripeScriptLoader: StripeScriptLoader;
    let paymentIntegrationService: PaymentIntegrationService;
    let stripeUPEIntegrationService: StripeIntegrationService;
    const stripePaymentMethod = getStripeUPEMock();

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        const scriptLoader = createScriptLoader();

        stripeScriptLoader = new StripeScriptLoader(scriptLoader);
        checkoutMock = getCheckout();

        jest.useFakeTimers();

        jest.spyOn(paymentIntegrationService, 'submitOrder').mockImplementation(jest.fn());

        jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(jest.fn());

        jest.spyOn(paymentIntegrationService, 'finalizeOrder').mockImplementation(jest.fn());

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(
            paymentIntegrationService.getState(),
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow').mockReturnValue(
            checkoutMock,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getCartLocale').mockReturnValue('en');

        jest.spyOn(paymentIntegrationService, 'updateBillingAddress').mockImplementation(jest.fn());

        jest.spyOn(paymentIntegrationService, 'subscribe');

        jest.spyOn(paymentIntegrationService.getState(), 'getCart').mockReturnValue(getCart());

        stripeUPEIntegrationService = new StripeIntegrationService(
            paymentIntegrationService,
            stripeScriptLoader,
        );
        strategy = new StripeUPEPaymentStrategy(
            paymentIntegrationService,
            stripeScriptLoader,
            stripeUPEIntegrationService,
        );

        const mockElement = document.createElement('div');

        jest.spyOn(document, 'getElementById').mockReturnValue(mockElement);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        let options: PaymentInitializeOptions & WithStripeUPEPaymentInitializeOptions;
        const elementsOptions: StripeElementsOptions = { clientSecret: 'clientToken' };
        let stripeUPEJsMock: StripeClient;
        const testColor = '#123456';
        const style = {
            labelText: testColor,
            fieldText: testColor,
            fieldPlaceholderText: testColor,
            fieldErrorText: testColor,
            fieldBackground: testColor,
            fieldInnerShadow: testColor,
            fieldBorder: testColor,
        };

        const getPaymentElementActionsMock = (
            isElementCreated = true,
            onCallbackPayload = {} as StripeEventType,
        ) => {
            const updateMock = jest.fn();
            const stripePaymentElementMock = {
                mount: jest.fn(),
                collapse: jest.fn(),
                unmount: jest.fn(),
                on: (_: string, callback: (event: StripeEventType) => void) =>
                    callback(onCallbackPayload),
                update: updateMock,
                destroy: jest.fn(),
            };
            const createElementMock = jest.fn(() => stripePaymentElementMock);
            const getElementMock = jest.fn(() =>
                isElementCreated ? stripePaymentElementMock : null,
            );
            const stripeElementsMock = {
                create: createElementMock,
                getElement: getElementMock,
                update: jest.fn(),
                fetchUpdates: jest.fn(),
            };

            stripeUPEJsMock = {
                ...getStripeJsMock(),
                elements: jest.fn(() => stripeElementsMock),
            };

            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockReturnValue(
                Promise.resolve(stripeUPEJsMock),
            );
            jest.spyOn(stripeScriptLoader, 'getElements').mockReturnValue(
                Promise.resolve(stripeElementsMock),
            );

            return {
                updateMock,
                createElementMock,
            };
        };

        beforeEach(() => {
            stripeUPEJsMock = getStripeJsMock();
            options = getStripeUPEInitializeOptionsMock(StripePaymentMethodType.CreditCard, style);

            const { create, getElement, update, fetchUpdates } =
                stripeUPEJsMock.elements(elementsOptions);

            stripeUPEJsMock.elements = jest
                .fn()
                .mockReturnValue({ create, getElement, update, fetchUpdates });
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockReturnValueOnce(
                Promise.resolve(stripeUPEJsMock),
            );
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(getStripeUPEMock());
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('loads a single instance of StripeUPEClient and StripeElements including styles', async () => {
            await strategy.initialize(options);
            await strategy.initialize(options);

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledWith(
                getStripeUPEMock().initializationData,
                'en',
                STRIPE_UPE_CLIENT_BETAS,
                STRIPE_UPE_CLIENT_API_VERSION,
            );

            expect(stripeUPEJsMock.elements).toHaveBeenNthCalledWith(1, {
                locale: 'en',
                clientSecret: 'clientToken',
                appearance: {
                    rules: {
                        '.Input': {
                            borderColor: testColor,
                            boxShadow: testColor,
                            color: testColor,
                        },
                    },
                    variables: {
                        colorBackground: testColor,
                        colorDanger: testColor,
                        colorIcon: testColor,
                        colorPrimary: testColor,
                        colorText: testColor,
                        colorTextPlaceholder: testColor,
                        colorTextSecondary: testColor,
                    },
                },
            });
        });

        it('loads stripeUPE script', async () => {
            await strategy.initialize(options);

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalled();
        });

        it('loads subscribe once', async () => {
            await strategy.initialize(options);

            expect(paymentIntegrationService.subscribe).toHaveBeenCalledTimes(1);
        });

        it('does not load stripeUPE if initialization options are not provided', async () => {
            delete options.stripeupe;

            const promise = strategy.initialize(options);

            await expect(promise).rejects.toThrow(NotInitializedError);
        });

        it('fails to load stripeUPE', () => {
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockRejectedValue(undefined);

            expect(stripeUPEJsMock.elements).not.toHaveBeenCalled();
        });

        it('does not load stripeUPE if gatewayId is not provided', async () => {
            delete options.gatewayId;

            const promise = strategy.initialize(options);

            await expect(promise).rejects.toThrow(InvalidArgumentError);
        });

        it('should enable Link by initialization data option', async () => {
            const callbackPayload = {
                value: {
                    type: StripePaymentMethodType.CreditCard,
                },
            } as StripeEventType;

            const { createElementMock } = getPaymentElementActionsMock(false, callbackPayload);

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...stripePaymentMethod,
                initializationData: {
                    ...stripePaymentMethod.initializationData,
                    enableLink: true,
                },
            });

            await strategy.initialize(options);
            await new Promise((resolve) => process.nextTick(resolve));

            expect(createElementMock).toHaveBeenCalledWith(StripeElementType.PAYMENT, {
                fields: {
                    billingDetails: {
                        address: {
                            city: 'never',
                            country: 'never',
                            postalCode: 'never',
                        },
                        email: 'never',
                    },
                },
                terms: {
                    card: 'auto',
                },
                wallets: {
                    applePay: 'never',
                    googlePay: 'never',
                    link: 'auto',
                },
            });
        });

        it('should disable Link by initialization data option', async () => {
            const callbackPayload = {
                value: {
                    type: StripePaymentMethodType.CreditCard,
                },
            } as StripeEventType;

            const { createElementMock } = getPaymentElementActionsMock(false, callbackPayload);

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...stripePaymentMethod,
                initializationData: {
                    ...stripePaymentMethod.initializationData,
                    enableLink: false,
                },
            });

            await strategy.initialize(options);
            await new Promise((resolve) => process.nextTick(resolve));

            expect(createElementMock).toHaveBeenCalledWith(StripeElementType.PAYMENT, {
                fields: {
                    billingDetails: {
                        address: {
                            city: 'never',
                            country: 'never',
                            postalCode: 'never',
                        },
                        email: 'never',
                    },
                },
                terms: {
                    card: 'auto',
                },
                wallets: {
                    applePay: 'never',
                    googlePay: 'never',
                    link: 'never',
                },
            });
        });

        describe('mounts single payment element', () => {
            beforeEach(() => {
                const elements = stripeUPEJsMock.elements(elementsOptions);

                elements.create(StripeElementType.PAYMENT);
                jest.spyOn(stripeUPEJsMock, 'elements').mockReturnValue(elements);
            });

            afterEach(() => {
                jest.clearAllMocks();
            });

            it('mounts a previously created stripe element', async () => {
                const { create: getElement, getElement: create } =
                    stripeUPEJsMock.elements(elementsOptions);

                stripeUPEJsMock.elements = jest.fn().mockReturnValue({ create, getElement });

                jest.spyOn(stripeScriptLoader, 'getStripeClient').mockReturnValue(
                    Promise.resolve(stripeUPEJsMock),
                );

                await strategy.initialize(options);

                expect(getElement).toHaveBeenCalledWith('payment');
                expect(create).not.toHaveBeenCalled();
            });

            it('fails mounting a stripe payment element', () => {
                stripeUPEJsMock = getFailingStripeJsMock();

                const { create, getElement } = stripeUPEJsMock.elements(elementsOptions);

                stripeUPEJsMock.elements = jest.fn().mockReturnValue({ create, getElement });

                const { mount, unmount } = create(StripeElementType.PAYMENT);

                stripeUPEJsMock.elements(elementsOptions).create = jest
                    .fn()
                    .mockReturnValue({ mount, unmount });

                jest.spyOn(stripeScriptLoader, 'getStripeClient').mockReturnValue(
                    Promise.resolve(stripeUPEJsMock),
                );

                expect(mount).not.toHaveBeenCalled();
            });

            it('fails mounting a stripe payment element if container not exist', async () => {
                const mountMock = jest.fn();
                const { getElement } = stripeUPEJsMock.elements(elementsOptions);
                const createMock = jest.fn().mockReturnValue({ mount: mountMock });

                jest.spyOn(document, 'getElementById').mockReturnValue(null);

                stripeUPEJsMock.elements = jest
                    .fn()
                    .mockReturnValue({ create: createMock, getElement });

                jest.spyOn(stripeScriptLoader, 'getStripeClient').mockReturnValue(
                    Promise.resolve(stripeUPEJsMock),
                );

                await strategy.initialize(options);

                expect(mountMock).not.toHaveBeenCalled();
            });
        });

        describe('Stripe element events', () => {
            it('Should not update Stripe Link auth state if Link already has been authenticated', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentProviderCustomerOrThrow',
                ).mockReturnValue({ stripeLinkAuthenticationState: true });

                const updatePaymentProviderCustomerMock = jest.spyOn(
                    paymentIntegrationService,
                    'updatePaymentProviderCustomer',
                );
                const callbackPayload = {
                    value: {
                        type: StripePaymentMethodType.Link,
                    },
                } as StripeEventType;

                getPaymentElementActionsMock(true, callbackPayload);

                await strategy.initialize(options);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(updatePaymentProviderCustomerMock).not.toHaveBeenCalled();
            });

            it('Should not update Stripe Link auth state if not Link element was rendered', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentProviderCustomerOrThrow',
                ).mockReturnValue({});

                const updatePaymentProviderCustomerMock = jest.spyOn(
                    paymentIntegrationService,
                    'updatePaymentProviderCustomer',
                );
                const callbackPayload = {
                    value: {
                        type: StripePaymentMethodType.CreditCard,
                    },
                } as StripeEventType;

                getPaymentElementActionsMock(true, callbackPayload);

                await strategy.initialize(options);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(updatePaymentProviderCustomerMock).not.toHaveBeenCalled();
            });

            it('Should update Stripe Link auth state if Link element was rendered', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentProviderCustomerOrThrow',
                ).mockReturnValue({});

                const updatePaymentProviderCustomerMock = jest.spyOn(
                    paymentIntegrationService,
                    'updatePaymentProviderCustomer',
                );
                const callbackPayload = {
                    value: {
                        type: StripePaymentMethodType.Link,
                    },
                } as StripeEventType;

                getPaymentElementActionsMock(true, callbackPayload);

                await strategy.initialize(options);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(updatePaymentProviderCustomerMock).toHaveBeenCalledWith({
                    stripeLinkAuthenticationState: true,
                });
            });
        });

        describe('Update stripe payment element', () => {
            let updateTriggerFn: (payload: StripeElementUpdateOptions) => void = jest.fn();

            const setUpdateElementExperiment = (enabled?: boolean) => {
                const storeConfig: StoreConfig = {
                    ...getConfig().storeConfig,
                    checkoutSettings: {
                        ...getConfig().storeConfig.checkoutSettings,
                        features: {
                            'PI-1679.trigger_update_stripe_payment_element': !!enabled,
                        },
                    },
                };

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getStoreConfigOrThrow',
                ).mockReturnValue(storeConfig);
            };

            beforeEach(() => {
                setUpdateElementExperiment(true);

                options.stripeupe!.initStripeElementUpdateTrigger = (stripeElementUpdateFn) => {
                    updateTriggerFn = stripeElementUpdateFn;
                };
            });

            it('should show terms text by default if experiment disabled', async () => {
                setUpdateElementExperiment(false);

                const { createElementMock } = getPaymentElementActionsMock(false);

                await strategy.initialize(options);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(createElementMock).toHaveBeenCalledWith(
                    'payment',
                    expect.objectContaining({
                        terms: {
                            card: StripeStringConstants.AUTO,
                        },
                    }),
                );
            });

            it('should show terms text by default if update trigger does not set', async () => {
                setUpdateElementExperiment();
                options.stripeupe!.initStripeElementUpdateTrigger = undefined;

                const { createElementMock } = getPaymentElementActionsMock(false);

                await strategy.initialize(options);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(createElementMock).toHaveBeenCalledWith(
                    'payment',
                    expect.objectContaining({
                        terms: {
                            card: StripeStringConstants.AUTO,
                        },
                    }),
                );
            });

            it('should not show terms text by default if experiment enabled', async () => {
                const { createElementMock } = getPaymentElementActionsMock(false);

                await strategy.initialize(options);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(createElementMock).toHaveBeenCalledWith(
                    'payment',
                    expect.objectContaining({
                        terms: {
                            card: StripeStringConstants.NEVER,
                        },
                    }),
                );
            });

            it('should update stripe element and show terms text', async () => {
                const { updateMock } = getPaymentElementActionsMock();

                await strategy.initialize(options);
                await new Promise((resolve) => process.nextTick(resolve));
                updateTriggerFn({ shouldShowTerms: true });

                expect(updateMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        terms: {
                            card: StripeStringConstants.AUTO,
                        },
                    }),
                );
            });

            it('should update stripe element and should not show terms text', async () => {
                const { updateMock } = getPaymentElementActionsMock();

                await strategy.initialize(options);
                await new Promise((resolve) => process.nextTick(resolve));
                updateTriggerFn({ shouldShowTerms: false });

                expect(updateMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        terms: {
                            card: StripeStringConstants.NEVER,
                        },
                    }),
                );
            });

            it('should not update element when experiment disabled', async () => {
                setUpdateElementExperiment(false);

                const { updateMock } = getPaymentElementActionsMock();

                await strategy.initialize(options);
                await new Promise((resolve) => process.nextTick(resolve));
                updateTriggerFn({ shouldShowTerms: false });

                expect(updateMock).not.toHaveBeenCalled();
            });

            it('should not update element without trigger function initialization', async () => {
                options.stripeupe!.initStripeElementUpdateTrigger = undefined;

                const { updateMock } = getPaymentElementActionsMock();

                await strategy.initialize(options);
                await new Promise((resolve) => process.nextTick(resolve));
                updateTriggerFn({ shouldShowTerms: false });

                expect(updateMock).not.toHaveBeenCalled();
            });

            it('should not update if payment element not exist', async () => {
                const { updateMock } = getPaymentElementActionsMock(false);

                await strategy.initialize(options);
                await new Promise((resolve) => process.nextTick(resolve));
                updateTriggerFn({ shouldShowTerms: false });

                expect(updateMock).not.toHaveBeenCalled();
            });
        });
    });

    describe('#execute()', () => {
        let stripeUPEJsMock: StripeClient;
        let options: PaymentInitializeOptions;
        let strategy: StripeUPEPaymentStrategy;

        beforeEach(async () => {
            stripeUPEJsMock = getStripeJsMock();
            options = getStripeUPEInitializeOptionsMock();
            stripeUPEIntegrationService = getStripeIntegrationServiceMock();

            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockReturnValueOnce(
                Promise.resolve(stripeUPEJsMock),
            );
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(getStripeUPEMock());
            jest.spyOn(paymentIntegrationService.getState(), 'getCustomerOrThrow').mockReturnValue(
                getCustomer(),
            );
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getBillingAddressOrThrow',
            ).mockReturnValue(getBillingAddress());
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({});

            strategy = new StripeUPEPaymentStrategy(
                paymentIntegrationService,
                stripeScriptLoader,
                stripeUPEIntegrationService,
            );

            await strategy.initialize(options);
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('throws error when no payment payload', async () => {
            await expect(strategy.execute({ payment: undefined })).rejects.toThrow(
                PaymentArgumentInvalidError,
            );
        });

        it('throws error when no paymentData in payload', async () => {
            await expect(strategy.execute({ payment: { methodId: 'stripeupe' } })).rejects.toThrow(
                PaymentArgumentInvalidError,
            );
        });

        it('throws error if ctripe client not initialized', async () => {
            await strategy.deinitialize();

            await expect(strategy.execute(getStripeUPEOrderRequestBodyVaultMock())).rejects.toThrow(
                NotInitializedError,
            );
        });

        it('should use store credits', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getCheckoutOrThrow',
            ).mockReturnValueOnce({
                ...getCheckout(),
                isStoreCreditApplied: true,
            });

            await strategy.execute(getStripeUPEOrderRequestBodyMock());

            expect(paymentIntegrationService.applyStoreCredit).toHaveBeenCalledWith(true);
        });

        it('skip PI update if no gatewayId', async () => {
            const executePayloadMock = getStripeUPEOrderRequestBodyMock();

            await strategy.execute({
                ...executePayloadMock,
                payment: {
                    ...executePayloadMock.payment,
                    methodId: 'card',
                    gatewayId: undefined,
                },
            });

            expect(stripeUPEIntegrationService.updateStripePaymentIntent).not.toHaveBeenCalled();
        });

        it('should update PI', () => {
            strategy.execute(getStripeUPEOrderRequestBodyMock());

            expect(stripeUPEIntegrationService.updateStripePaymentIntent).toHaveBeenCalled();
        });

        it('should not update billing address if not Stripe Link', async () => {
            await strategy.execute(getStripeUPEOrderRequestBodyMock());

            expect(paymentIntegrationService.updateBillingAddress).not.toHaveBeenCalled();
        });

        it('should not update billing address if Stripe Link flow and email address provided', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({ stripeLinkAuthenticationState: false });

            await strategy.execute(getStripeUPEOrderRequestBodyMock());

            expect(paymentIntegrationService.updateBillingAddress).not.toHaveBeenCalled();
        });

        it('should update billing address if Stripe Link flow but email is not provided', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({ stripeLinkAuthenticationState: true });
            jest.spyOn(paymentIntegrationService.getState(), 'getCustomerOrThrow').mockReturnValue({
                ...getCustomer(),
                email: '',
            });

            await strategy.execute(getStripeUPEOrderRequestBodyMock());

            expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith(
                getBillingAddress(),
            );
        });

        describe('vaulted instrument', () => {
            const getThreeDSecureRequiredErrorResponse = (
                code = 'three_d_secure_required',
            ): RequestError =>
                new RequestError(
                    getResponse({
                        ...getErrorPaymentResponseBody(),
                        errors: [{ code }],
                        three_ds_result: {
                            token: 'token',
                        },
                    }),
                );

            afterEach(() => {
                jest.clearAllMocks();
            });

            it('should skip vaulted flow if it is not a vaulted instrument', async () => {
                await strategy.execute(getStripeUPEOrderRequestBodyMock());

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        methodId: 'card',
                        paymentData: {
                            formattedPayload: expect.not.objectContaining({
                                bigpay_token: {
                                    token: 'token',
                                },
                            }),
                        },
                    }),
                );
            });

            it('should execute vaulted flow', async () => {
                await strategy.execute(
                    getStripeUPEOrderRequestBodyVaultMock(StripePaymentMethodType.CreditCard, true),
                );

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        methodId: 'card',
                        paymentData: {
                            formattedPayload: {
                                cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                                bigpay_token: {
                                    token: 'token',
                                },
                                confirm: false,
                                client_token: 'clientToken',
                                set_as_default_stored_instrument: true,
                            },
                        },
                    }),
                );
            });

            it('should execute vaulted flow without cart data', async () => {
                jest.spyOn(paymentIntegrationService.getState(), 'getCart').mockReturnValue(
                    undefined,
                );
                await strategy.execute(
                    getStripeUPEOrderRequestBodyVaultMock(StripePaymentMethodType.CreditCard, true),
                );

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        methodId: 'card',
                        paymentData: {
                            formattedPayload: {
                                cart_id: undefined,
                                bigpay_token: {
                                    token: 'token',
                                },
                                confirm: false,
                                client_token: 'clientToken',
                                set_as_default_stored_instrument: true,
                            },
                        },
                    }),
                );
            });

            it('payment submit throw additional action error but no method id provided', async () => {
                const responseErrorMock = getThreeDSecureRequiredErrorResponse();

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(
                    responseErrorMock,
                );

                const defaultPayloadMock = getStripeUPEOrderRequestBodyVaultMock();
                const executePayloadMock = {
                    ...defaultPayloadMock,
                    payment: {
                        ...defaultPayloadMock.payment,
                        methodId: undefined,
                    },
                } as unknown as OrderRequestBody;

                await expect(strategy.execute(executePayloadMock)).rejects.toThrow(
                    responseErrorMock,
                );
            });

            it('payment submit throw non request error', async () => {
                const genericError = new Error('not request error');

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(
                    genericError,
                );

                await expect(
                    strategy.execute(getStripeUPEOrderRequestBodyVaultMock()),
                ).rejects.toThrow(genericError);
            });

            it('payment submit throw non additional action error', async () => {
                const responseErrorMock =
                    getThreeDSecureRequiredErrorResponse('any_other_error_code');

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(
                    responseErrorMock,
                );

                await expect(
                    strategy.execute(getStripeUPEOrderRequestBodyVaultMock()),
                ).rejects.toThrow(responseErrorMock);
            });

            it('throw error if stripe client was not initialized', async () => {
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementationOnce(
                    async () => {
                        await strategy.deinitialize();

                        return Promise.reject(getThreeDSecureRequiredErrorResponse());
                    },
                );

                await expect(
                    strategy.execute(getStripeUPEOrderRequestBodyVaultMock()),
                ).rejects.toThrow(NotInitializedError);
            });

            it('throw error if stripe element was not initialized', async () => {
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementationOnce(
                    async () => {
                        // eslint-disable-next-line @typescript-eslint/dot-notation, dot-notation
                        strategy['_stripeElements'] = undefined;

                        return Promise.reject(getThreeDSecureRequiredErrorResponse());
                    },
                );

                await expect(
                    strategy.execute(getStripeUPEOrderRequestBodyVaultMock()),
                ).rejects.toThrow(NotInitializedError);
            });

            it('successfully confirmed by stripe', async () => {
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(
                    getThreeDSecureRequiredErrorResponse(),
                );

                stripeUPEJsMock.confirmCardPayment = jest
                    .fn()
                    .mockResolvedValue(getConfirmPaymentResponse());

                await strategy.execute(getStripeUPEOrderRequestBodyVaultMock());

                expect(stripeUPEJsMock.confirmCardPayment).toHaveBeenCalled();
                expect(stripeUPEJsMock.retrievePaymentIntent).not.toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        methodId: 'card',
                        paymentData: {
                            formattedPayload: {
                                cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                                bigpay_token: {
                                    token: 'token',
                                },
                                confirm: false,
                                client_token: 'clientToken',
                                set_as_default_stored_instrument: false,
                            },
                        },
                    }),
                );
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        methodId: 'card',
                        paymentData: {
                            formattedPayload: {
                                cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                                confirm: false,
                                credit_card_token: { token: 'pi_1234' },
                                vault_payment_instrument: false,
                                set_as_default_stored_instrument: false,
                            },
                        },
                    }),
                );
            });

            it('stripe confirmation throws error', async () => {
                const throwStripeErrorMock = new Error('stripe error');

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(
                    getThreeDSecureRequiredErrorResponse(),
                );
                jest.spyOn(stripeUPEIntegrationService, 'throwStripeError').mockImplementation(
                    () => {
                        throw throwStripeErrorMock;
                    },
                );

                stripeUPEJsMock.confirmCardPayment = jest
                    .fn()
                    .mockRejectedValue(new Error('stripe confirmation error'));
                stripeUPEJsMock.retrievePaymentIntent = jest
                    .fn()
                    .mockResolvedValue(getRetrievePaymentIntentResponseWithError());

                await expect(
                    strategy.execute(getStripeUPEOrderRequestBodyVaultMock()),
                ).rejects.toThrow(throwStripeErrorMock);

                expect(stripeUPEJsMock.confirmCardPayment).toHaveBeenCalled();
                expect(stripeUPEJsMock.retrievePaymentIntent).toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
            });

            it('stripe confirmation returns undefined', async () => {
                const throwStripeErrorMock = new Error('stripe error');

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(
                    getThreeDSecureRequiredErrorResponse(),
                );
                jest.spyOn(stripeUPEIntegrationService, 'throwStripeError').mockImplementation(
                    () => {
                        throw throwStripeErrorMock;
                    },
                );

                stripeUPEJsMock.confirmCardPayment = jest.fn().mockResolvedValue(undefined);

                await expect(
                    strategy.execute(getStripeUPEOrderRequestBodyVaultMock()),
                ).rejects.toBeInstanceOf(RequestError);

                expect(stripeUPEJsMock.confirmCardPayment).toHaveBeenCalled();
                expect(stripeUPEJsMock.retrievePaymentIntent).not.toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
            });

            it('stripe confirmation returns response without PI id', async () => {
                const throwStripeErrorMock = new Error('stripe error');

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(
                    getThreeDSecureRequiredErrorResponse(),
                );
                jest.spyOn(stripeUPEIntegrationService, 'throwStripeError').mockImplementation(
                    () => {
                        throw throwStripeErrorMock;
                    },
                );

                const defaultPIMock = getRetrievePaymentIntentResponseWithError();
                const stripeResponseWithoutPIMock = {
                    ...defaultPIMock,
                    paymentIntent: undefined,
                };

                stripeUPEJsMock.confirmCardPayment = jest
                    .fn()
                    .mockResolvedValue(stripeResponseWithoutPIMock);

                await expect(
                    strategy.execute(getStripeUPEOrderRequestBodyVaultMock()),
                ).rejects.toThrow(throwStripeErrorMock);

                expect(stripeUPEJsMock.confirmCardPayment).toHaveBeenCalled();
                expect(stripeUPEJsMock.retrievePaymentIntent).not.toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
            });

            it('sends second payment submit request is stripe all stripe requests failed', async () => {
                const throwStripeErrorMock = new Error('stripe error');

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(
                    getThreeDSecureRequiredErrorResponse(),
                );
                jest.spyOn(stripeUPEIntegrationService, 'throwStripeError').mockImplementation(
                    () => {
                        throw throwStripeErrorMock;
                    },
                );

                stripeUPEJsMock.confirmCardPayment = jest
                    .fn()
                    .mockRejectedValue(new Error('stripe confirmation error'));
                stripeUPEJsMock.retrievePaymentIntent = jest
                    .fn()
                    .mockRejectedValue(new Error('stripe confirmation error'));

                await strategy.execute(getStripeUPEOrderRequestBodyVaultMock());

                expect(stripeUPEJsMock.confirmCardPayment).toHaveBeenCalled();
                expect(stripeUPEJsMock.retrievePaymentIntent).toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        methodId: 'card',
                        paymentData: {
                            formattedPayload: {
                                cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                                bigpay_token: {
                                    token: 'token',
                                },
                                confirm: false,
                                client_token: 'clientToken',
                                set_as_default_stored_instrument: false,
                            },
                        },
                    }),
                );
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        methodId: 'card',
                        paymentData: {
                            formattedPayload: {
                                cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                                confirm: false,
                                credit_card_token: { token: 'token' },
                                vault_payment_instrument: false,
                                set_as_default_stored_instrument: false,
                            },
                        },
                    }),
                );
            });
        });

        describe('stripe confirmation flow', () => {
            const getAdditionalActionErrorResponse = (
                token = 'additionalActionToken',
                redirect_url = 'redirect.url',
            ): RequestError =>
                new RequestError(
                    getResponse({
                        ...getErrorPaymentResponseBody(),
                        errors: [{ code: 'additional_action_required' }],
                        additional_action_required: {
                            data: {
                                token,
                                redirect_url,
                            },
                        },
                    }),
                );

            beforeEach(() => {
                jest.spyOn(stripeUPEIntegrationService, 'isAdditionalActionError').mockReturnValue(
                    true,
                );
            });

            it('successfully payed on first payments request', async () => {
                await strategy.execute(getStripeUPEOrderRequestBodyMock());

                expect(paymentIntegrationService.submitOrder).toHaveBeenCalledTimes(1);
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                    methodId: 'card',
                    paymentData: {
                        formattedPayload: {
                            cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                            confirm: false,
                            credit_card_token: { token: 'clientToken' },
                            vault_payment_instrument: false,
                            set_as_default_stored_instrument: false,
                        },
                    },
                });
            });

            it('successfully payed on first payments request without client token', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({
                    ...stripePaymentMethod,
                    clientToken: undefined,
                });

                await strategy.execute(getStripeUPEOrderRequestBodyMock());

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                    methodId: 'card',
                    paymentData: {
                        formattedPayload: {
                            cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                            confirm: false,
                            credit_card_token: { token: '' },
                            vault_payment_instrument: false,
                            set_as_default_stored_instrument: false,
                        },
                    },
                });
            });

            it('payment submit throw non request error', async () => {
                const genericError = new Error('not request error');

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(
                    genericError,
                );

                await expect(strategy.execute(getStripeUPEOrderRequestBodyMock())).rejects.toThrow(
                    genericError,
                );
            });

            it('payment submit throw non additional action error', async () => {
                jest.spyOn(stripeUPEIntegrationService, 'isAdditionalActionError').mockReturnValue(
                    false,
                );

                const responseErrorMock = new RequestError(
                    getResponse({
                        ...getErrorPaymentResponseBody(),
                        additional_action_required: {
                            errors: [{ code: 'any_other_error_code' }],
                            data: {
                                token: 'additionalActionToken',
                            },
                        },
                    }),
                );

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(
                    responseErrorMock,
                );

                await expect(strategy.execute(getStripeUPEOrderRequestBodyMock())).rejects.toThrow(
                    responseErrorMock,
                );
            });

            it('throw error if stripe client was not initialized', async () => {
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementationOnce(
                    async () => {
                        await strategy.deinitialize();

                        return Promise.reject(getAdditionalActionErrorResponse());
                    },
                );

                await expect(strategy.execute(getStripeUPEOrderRequestBodyMock())).rejects.toThrow(
                    NotInitializedError,
                );
            });

            it('throw error if stripe element was not initialized', async () => {
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementationOnce(
                    async () => {
                        // eslint-disable-next-line @typescript-eslint/dot-notation, dot-notation
                        strategy['_stripeElements'] = undefined;

                        return Promise.reject(getAdditionalActionErrorResponse());
                    },
                );

                await expect(strategy.execute(getStripeUPEOrderRequestBodyMock())).rejects.toThrow(
                    NotInitializedError,
                );
            });

            it('stripe confirmation throws error', async () => {
                stripeUPEJsMock.confirmPayment = jest
                    .fn()
                    .mockRejectedValue(new Error('stripe confirmation error'));

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(
                    getAdditionalActionErrorResponse(),
                );

                await expect(strategy.execute(getStripeUPEOrderRequestBodyMock())).rejects.toThrow(
                    'throw stripe error',
                );
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                expect(stripeUPEIntegrationService.throwStripeError).toHaveBeenCalled();
            });

            it('stripe confirms payment returns stripe error', async () => {
                stripeUPEJsMock.confirmPayment = jest
                    .fn()
                    .mockResolvedValue(getRetrievePaymentIntentResponseWithError());

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(
                    getAdditionalActionErrorResponse(),
                );

                await expect(strategy.execute(getStripeUPEOrderRequestBodyMock())).rejects.toThrow(
                    'throw stripe error',
                );
                expect(stripeUPEIntegrationService.throwStripeError).toHaveBeenCalled();
            });

            it('stripe confirms payment returns nothing', async () => {
                stripeUPEJsMock.confirmPayment = jest.fn().mockResolvedValue(undefined);

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(
                    getAdditionalActionErrorResponse(),
                );

                await expect(strategy.execute(getStripeUPEOrderRequestBodyMock())).rejects.toThrow(
                    'throw stripe error',
                );
                expect(stripeUPEIntegrationService.throwStripeError).toHaveBeenCalled();
            });

            it('stripe confirms payment returns no PI ID', async () => {
                stripeUPEJsMock.confirmPayment = jest.fn().mockResolvedValue({});

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(
                    getAdditionalActionErrorResponse(),
                );

                await expect(strategy.execute(getStripeUPEOrderRequestBodyMock())).rejects.toThrow(
                    'throw stripe error',
                );
                expect(stripeUPEIntegrationService.throwStripeError).toHaveBeenCalled();
            });

            it('stripe confirms payment successfully', async () => {
                stripeUPEJsMock.confirmPayment = jest
                    .fn()
                    .mockResolvedValue(getConfirmPaymentResponse());

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(
                    getAdditionalActionErrorResponse(),
                );

                await strategy.execute(getStripeUPEOrderRequestBodyMock());

                expect(stripeUPEIntegrationService.mapStripePaymentData).toHaveBeenCalledWith(
                    expect.any(Object),
                    'redirect.url',
                    true,
                );
                expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalledTimes(1);
                expect(stripeUPEJsMock.retrievePaymentIntent).not.toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
                expect(paymentIntegrationService.submitPayment).toHaveBeenNthCalledWith(1, {
                    methodId: 'card',
                    paymentData: {
                        formattedPayload: {
                            cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                            confirm: false,
                            credit_card_token: { token: 'clientToken' },
                            vault_payment_instrument: false,
                            set_as_default_stored_instrument: false,
                        },
                    },
                });
                expect(paymentIntegrationService.submitPayment).toHaveBeenNthCalledWith(2, {
                    methodId: 'card',
                    paymentData: {
                        formattedPayload: {
                            cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                            confirm: false,
                            credit_card_token: { token: 'pi_1234' },
                            vault_payment_instrument: false,
                            set_as_default_stored_instrument: false,
                        },
                    },
                });
            });

            it('stripe confirms payment successfully but no confirmation token exist', async () => {
                stripeUPEJsMock.confirmPayment = jest.fn().mockResolvedValue({
                    paymentIntent: {
                        id: undefined,
                    },
                });

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(
                    getAdditionalActionErrorResponse(),
                );

                await strategy.execute(getStripeUPEOrderRequestBodyMock());

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
                expect(paymentIntegrationService.submitPayment).toHaveBeenNthCalledWith(1, {
                    methodId: 'card',
                    paymentData: {
                        formattedPayload: {
                            cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                            confirm: false,
                            credit_card_token: { token: 'clientToken' },
                            vault_payment_instrument: false,
                            set_as_default_stored_instrument: false,
                        },
                    },
                });
                expect(paymentIntegrationService.submitPayment).toHaveBeenNthCalledWith(2, {
                    methodId: 'card',
                    paymentData: {
                        formattedPayload: {
                            cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                            confirm: false,
                            credit_card_token: { token: 'additionalActionToken' },
                            vault_payment_instrument: false,
                            set_as_default_stored_instrument: false,
                        },
                    },
                });
            });

            it('stripe payment already confirmed', async () => {
                stripeUPEJsMock.retrievePaymentIntent = jest
                    .fn()
                    .mockResolvedValue(getRetrievePaymentIntentResponseSucceeded());

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(
                    getAdditionalActionErrorResponse(),
                );
                jest.spyOn(stripeUPEIntegrationService, 'isPaymentCompleted').mockResolvedValue(
                    true,
                );

                await strategy.execute(getStripeUPEOrderRequestBodyMock());

                expect(stripeUPEIntegrationService.mapStripePaymentData).toHaveBeenCalledWith(
                    expect.any(Object),
                    'redirect.url',
                    true,
                );
                expect(stripeUPEJsMock.retrievePaymentIntent).toHaveBeenCalledTimes(1);
                expect(stripeUPEJsMock.retrievePaymentIntent).toHaveBeenCalledWith(
                    'additionalActionToken',
                );
                expect(stripeUPEJsMock.confirmPayment).not.toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
            });

            it('stripe payment already confirmed but no clientToken provided', async () => {
                stripeUPEJsMock.retrievePaymentIntent = jest
                    .fn()
                    .mockResolvedValue(getRetrievePaymentIntentResponseSucceeded());

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(
                    getAdditionalActionErrorResponse(''),
                );
                jest.spyOn(stripeUPEIntegrationService, 'isPaymentCompleted').mockResolvedValue(
                    true,
                );

                await strategy.execute(getStripeUPEOrderRequestBodyMock());

                expect(stripeUPEJsMock.retrievePaymentIntent).toHaveBeenCalledTimes(1);
                expect(stripeUPEJsMock.retrievePaymentIntent).toHaveBeenCalledWith('');
                expect(stripeUPEJsMock.confirmPayment).not.toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
            });

            it('stripe confirms payment successfully but second payment submit fails', async () => {
                stripeUPEJsMock.confirmPayment = jest
                    .fn()
                    .mockResolvedValue(getConfirmPaymentResponse());

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue(
                    getAdditionalActionErrorResponse(),
                );

                await expect(
                    strategy.execute(getStripeUPEOrderRequestBodyMock()),
                ).rejects.toBeInstanceOf(PaymentMethodFailedError);
                expect(
                    stripeUPEIntegrationService.throwPaymentConfirmationProceedMessage,
                ).toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe('#finalize()', () => {
        it('throws an error to inform that order finalization is not required', async () => {
            const promise = strategy.finalize();

            await expect(promise).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        const stripeUPEJsMock = getStripeJsMock();

        beforeEach(async () => {
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockReturnValue(
                Promise.resolve(stripeUPEJsMock),
            );

            await strategy.initialize(getStripeUPEInitializeOptionsMock());
        });

        it('deinitializes stripe payment strategy', async () => {
            await strategy.deinitialize();

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
            expect(stripeUPEJsMock.elements).toHaveBeenCalledTimes(0);
        });
    });
});
