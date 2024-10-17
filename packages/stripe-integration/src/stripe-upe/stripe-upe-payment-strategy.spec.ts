import { createScriptLoader } from '@bigcommerce/script-loader';

import {
    Address,
    Checkout,
    InvalidArgumentError,
    MissingDataError,
    NotInitializedError,
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodCancelledError,
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
    getDigitalItem,
    getErrorPaymentResponseBody,
    getResponse,
    getShippingAddress,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    StripeElementsOptions,
    StripeElementType,
    StripeElementUpdateOptions,
    StripeEventType,
    StripePaymentMethodType,
    StripeStringConstants,
    StripeUPEClient,
} from './stripe-upe';
import { WithStripeUPEPaymentInitializeOptions } from './stripe-upe-initialize-options';
import StripeUPEIntegrationService from './stripe-upe-integration-service';
import StripeUPEPaymentStrategy from './stripe-upe-payment-strategy';
import StripeUPEScriptLoader from './stripe-upe-script-loader';
import {
    getConfirmPaymentResponse,
    getFailingStripeUPEJsMock,
    getRetrievePaymentIntentResponse,
    getRetrievePaymentIntentResponseSucceeded,
    getStripeUPE,
    getStripeUPEInitializeOptionsMock,
    getStripeUPEJsMock,
    getStripeUPEOrderRequestBodyMock,
    getStripeUPEOrderRequestBodyVaultMock,
    getStripeUPEWithLinkOrderRequestBodyMock,
} from './stripe-upe.mock';

describe('StripeUPEPaymentStrategy', () => {
    let checkoutMock: Checkout;
    let paymentMethodMock: PaymentMethod;
    let strategy: StripeUPEPaymentStrategy;
    let stripeScriptLoader: StripeUPEScriptLoader;
    let paymentIntegrationService: PaymentIntegrationService;
    let stripeUPEIntegrationService: StripeUPEIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        const scriptLoader = createScriptLoader();

        paymentMethodMock = { ...getStripeUPE(), clientToken: 'myToken' };

        stripeScriptLoader = new StripeUPEScriptLoader(scriptLoader);
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

        jest.spyOn(paymentIntegrationService, 'updateBillingAddress').mockImplementation(jest.fn());

        jest.spyOn(paymentIntegrationService, 'subscribe');

        stripeUPEIntegrationService = new StripeUPEIntegrationService(paymentIntegrationService);
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
        let stripeUPEJsMock: StripeUPEClient;
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
                ...getStripeUPEJsMock(),
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
            stripeUPEJsMock = getStripeUPEJsMock();
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
            ).mockReturnValue(getStripeUPE());
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('loads a single instance of StripeUPEClient and StripeElements including styles', async () => {
            await strategy.initialize(options);
            await strategy.initialize(options);

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);

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
                stripeUPEJsMock = getFailingStripeUPEJsMock();

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
        let options: PaymentInitializeOptions;
        const elementsOptions: StripeElementsOptions = { clientSecret: 'myToken', locale: 'en' };
        let stripeUPEJsMock: StripeUPEClient;

        beforeEach(() => {
            options = getStripeUPEInitializeOptionsMock();
            stripeUPEJsMock = getStripeUPEJsMock();

            const { create, getElement, update } = stripeUPEJsMock.elements(elementsOptions);

            stripeUPEJsMock.elements = jest.fn().mockReturnValue({ create, getElement, update });
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockReturnValue(
                Promise.resolve(stripeUPEJsMock),
            );
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(getStripeUPE());
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getBillingAddressOrThrow',
            ).mockReturnValue(getBillingAddress());
            jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue(
                getBillingAddress(),
            );
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        describe('creates the order and submit payment', () => {
            it('throws error when clientToken is undefined', () => {
                paymentMethodMock.clientToken = undefined;

                expect(stripeScriptLoader.getStripeClient).not.toHaveBeenCalled();
                expect(stripeUPEJsMock.elements).not.toHaveBeenCalled();
            });

            describe('with normal initialization', () => {
                beforeEach(async () => {
                    await strategy.initialize(options);
                });

                afterEach(() => {
                    jest.clearAllMocks();
                });

                it('with a stored instrument passing on the "make default" flag', async () => {
                    stripeUPEJsMock.confirmPayment = jest
                        .fn()
                        .mockResolvedValue(getConfirmPaymentResponse());

                    await strategy.execute(
                        getStripeUPEOrderRequestBodyVaultMock(
                            StripePaymentMethodType.CreditCard,
                            true,
                        ),
                    );

                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
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
                    });
                });

                describe('with card', () => {
                    beforeEach(() => {
                        stripeUPEJsMock.confirmPayment = jest
                            .fn()
                            .mockResolvedValue(getConfirmPaymentResponse());
                    });

                    afterEach(() => {
                        jest.clearAllMocks();
                    });

                    describe('with both shipping and billing address', () => {
                        beforeEach(() => {
                            jest.spyOn(
                                paymentIntegrationService.getState(),
                                'getShippingAddress',
                            ).mockReturnValue(getShippingAddress());
                            jest.spyOn(
                                paymentIntegrationService.getState(),
                                'getBillingAddress',
                            ).mockReturnValue(getBillingAddress());
                        });

                        afterEach(() => {
                            jest.clearAllMocks();
                        });

                        it('with a signed user', async () => {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock());

                            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
                            expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                        });

                        it('with a signed user and using stripeLink', async () => {
                            jest.spyOn(
                                paymentIntegrationService.getState(),
                                'getCustomerOrThrow',
                            ).mockReturnValue({
                                ...getCustomer(),
                            });
                            jest.spyOn(
                                paymentIntegrationService.getState(),
                                'getBillingAddressOrThrow',
                            ).mockReturnValue(getBillingAddress());
                            jest.spyOn(
                                paymentIntegrationService.getState(),
                                'getPaymentProviderCustomerOrThrow',
                            ).mockReturnValue({ stripeLinkAuthenticationState: true });

                            await strategy.execute(getStripeUPEWithLinkOrderRequestBodyMock());

                            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
                            expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                            expect(
                                paymentIntegrationService.updateBillingAddress,
                            ).not.toHaveBeenCalled();
                        });

                        it('with a guest user', async () => {
                            jest.spyOn(
                                paymentIntegrationService.getState(),
                                'getCustomer',
                            ).mockReturnValue(undefined);

                            await strategy.execute(getStripeUPEOrderRequestBodyMock());

                            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
                            expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                        });

                        it('with a guest user and using stripeLink', async () => {
                            jest.spyOn(
                                paymentIntegrationService.getState(),
                                'getCustomer',
                            ).mockReturnValue(undefined);
                            jest.spyOn(
                                paymentIntegrationService.getState(),
                                'getCustomerOrThrow',
                            ).mockReturnValue({
                                ...getCustomer(),
                                email: '',
                            });
                            jest.spyOn(
                                paymentIntegrationService.getState(),
                                'getPaymentProviderCustomerOrThrow',
                            ).mockReturnValue({ stripeLinkAuthenticationState: false });
                            jest.spyOn(
                                paymentIntegrationService.getState(),
                                'getBillingAddressOrThrow',
                            ).mockReturnValue(getBillingAddress());

                            await strategy.execute(getStripeUPEWithLinkOrderRequestBodyMock());

                            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
                            expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                            expect(
                                paymentIntegrationService.updateBillingAddress,
                            ).toHaveBeenCalled();
                        });
                    });

                    describe('without shipping and billing address', () => {
                        beforeEach(() => {
                            const errorResponse = new RequestError(
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

                            jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                                Promise.reject(errorResponse),
                            );

                            jest.spyOn(
                                paymentIntegrationService.getState(),
                                'getShippingAddress',
                            ).mockReturnValue(undefined);
                            jest.spyOn(
                                paymentIntegrationService.getState(),
                                'getBillingAddress',
                            ).mockReturnValue(undefined);

                            stripeUPEJsMock.retrievePaymentIntent = jest
                                .fn()
                                .mockResolvedValue(getRetrievePaymentIntentResponse());
                        });

                        afterEach(() => {
                            jest.clearAllMocks();
                        });

                        it('with a signed user', async () => {
                            await expect(
                                strategy.execute(getStripeUPEOrderRequestBodyMock()),
                            ).rejects.toThrow(MissingDataError);

                            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledTimes(1);
                            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(
                                1,
                            );
                            expect(stripeUPEJsMock.confirmPayment).not.toHaveBeenCalled();
                        });

                        it('with a guest user', async () => {
                            jest.spyOn(
                                paymentIntegrationService.getState(),
                                'getCustomer',
                            ).mockReturnValue(undefined);

                            await expect(
                                strategy.execute(getStripeUPEOrderRequestBodyMock()),
                            ).rejects.toBeInstanceOf(MissingDataError);

                            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledTimes(1);
                            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(
                                1,
                            );
                            expect(stripeUPEJsMock.confirmPayment).not.toHaveBeenCalled();
                        });
                    });

                    it('with store credit', async () => {
                        checkoutMock.isStoreCreditApplied = true;

                        await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentIntegrationService.applyStoreCredit).toHaveBeenCalledWith(
                            true,
                        );
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                    });

                    it('passing on the "save card" flag', async () => {
                        await strategy.execute(
                            getStripeUPEOrderRequestBodyMock(
                                StripePaymentMethodType.CreditCard,
                                true,
                            ),
                        );

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                    });

                    it('submit payment with credit card and passes back the client token', async () => {
                        await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                            expect.objectContaining({
                                methodId: 'card',
                                paymentData: expect.objectContaining({
                                    formattedPayload: expect.objectContaining({
                                        cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                                        confirm: false,
                                        credit_card_token: {
                                            token: 'clientToken',
                                        },
                                        vault_payment_instrument: false,
                                    }),
                                }),
                            }),
                        );
                    });

                    it('with a signed user without phone number', async () => {
                        const customer = getCustomer();

                        customer.addresses[0].phone = '';

                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getCustomer',
                        ).mockReturnValue(customer);

                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getBillingAddress',
                        ).mockReturnValue({
                            ...getBillingAddress(),
                            phone: '',
                        });

                        await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                    });

                    it('with a guest user without phone number', async () => {
                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getCustomer',
                        ).mockReturnValue(undefined);
                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getBillingAddress',
                        ).mockReturnValue({
                            ...getBillingAddress(),
                            phone: '',
                        });

                        await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                    });

                    it('with a guest user without postal code', async () => {
                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getCustomer',
                        ).mockReturnValue(undefined);
                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getShippingAddress',
                        ).mockReturnValue({
                            ...getShippingAddress(),
                            postalCode: '',
                        });

                        await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                    });

                    it('with a guest user with postal code', async () => {
                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getCustomer',
                        ).mockReturnValue(undefined);
                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getShippingAddress',
                        ).mockReturnValue({
                            ...getShippingAddress(),
                            postalCode: '12345',
                        });

                        await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                    });

                    it('with a guest user with address line1', async () => {
                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getCustomer',
                        ).mockReturnValue(undefined);

                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getShippingAddress',
                        ).mockReturnValue({
                            ...getShippingAddress(),
                            line1: '12345',
                        } as Address);

                        await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                    });

                    it('with a guest user with address line2', async () => {
                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getCustomer',
                        ).mockReturnValue(undefined);
                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getShippingAddress',
                        ).mockReturnValue({
                            ...getShippingAddress(),
                            line2: '123456',
                        } as Address);

                        await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                    });

                    it('without shipping address if there is not physical items in cart', async () => {
                        jest.spyOn(paymentIntegrationService.getState(), 'getCart').mockReturnValue(
                            {
                                ...getCart(),
                                lineItems: {
                                    physicalItems: [],
                                    giftCertificates: [],
                                    digitalItems: [getDigitalItem()],
                                },
                            },
                        );

                        await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                    });

                    it('with a guest user and without shipping and billing address', async () => {
                        const errorResponse = new RequestError(
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

                        stripeUPEJsMock.retrievePaymentIntent = jest
                            .fn()
                            .mockResolvedValue(getRetrievePaymentIntentResponse());

                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getCustomer',
                        ).mockReturnValue(undefined);
                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getShippingAddress',
                        ).mockReturnValue(undefined);
                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getBillingAddress',
                        ).mockReturnValue(undefined);
                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                            Promise.reject(errorResponse),
                        );

                        await expect(
                            strategy.execute(getStripeUPEOrderRequestBodyMock()),
                        ).rejects.toBeInstanceOf(MissingDataError);

                        expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalledTimes(1);
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                        expect(stripeUPEJsMock.confirmPayment).not.toHaveBeenCalled();
                    });

                    it('fires unknown additional action', async () => {
                        const errorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'additional_action_required' }],
                                additional_action_required: {
                                    type: 'unknown_action',
                                },
                                status: 'error',
                            }),
                        );

                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                            Promise.reject(errorResponse),
                        );

                        try {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock());
                        } catch (error) {
                            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(
                                1,
                            );
                        }
                    });

                    it('fires additional action requires payment method', async () => {
                        const errorResponse = new RequestError(
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

                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                            Promise.reject(errorResponse),
                        );

                        stripeUPEJsMock.retrievePaymentIntent = jest
                            .fn()
                            .mockResolvedValue(getRetrievePaymentIntentResponse());

                        try {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock());
                        } catch (error) {
                            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(
                                2,
                            );
                            expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalledTimes(1);
                        }
                    });

                    it('throws stripe error if empty payment intent is sent', async () => {
                        const requiredFieldErrorResponse = new RequestError(
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
                        const stripeErrorMessage = 'Stripe error message.';

                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                            Promise.reject(requiredFieldErrorResponse),
                        );

                        stripeUPEJsMock.retrievePaymentIntent = jest
                            .fn()
                            .mockResolvedValue(getRetrievePaymentIntentResponse());

                        stripeUPEJsMock.confirmPayment = jest.fn().mockResolvedValue({
                            error: {
                                type: 'invalid_request_error',
                                message: stripeErrorMessage,
                            },
                        });

                        await expect(
                            strategy.execute(getStripeUPEOrderRequestBodyMock()),
                        ).rejects.toThrow(stripeErrorMessage);

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalledTimes(1);
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                        expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalledTimes(1);
                    });

                    it('throws unknown error', async () => {
                        const unexpectedError = {
                            message: 'An unexpected error has occurred.',
                        };
                        const errorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'unknown_error' }],
                                status: 'error',
                            }),
                        );

                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                            Promise.reject(errorResponse),
                        );

                        try {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock());
                        } catch (error) {
                            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(
                                1,
                            );

                            if (error instanceof Error) {
                                expect(error.message).toEqual(
                                    unexpectedError && unexpectedError.message,
                                );
                            }
                        }
                    });

                    it('throws an error that is not a RequestError', async () => {
                        const errorResponse = new Error();

                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                            Promise.reject(errorResponse),
                        );

                        await expect(
                            strategy.execute(getStripeUPEOrderRequestBodyMock()),
                        ).rejects.toThrow(Error);

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                    });

                    it('throws stripe error when confirm fails but 3DS is accepted', async () => {
                        stripeUPEJsMock.confirmCardPayment = jest.fn(() =>
                            Promise.reject(new Error('Error with 3ds')),
                        );

                        stripeUPEJsMock.retrievePaymentIntent = jest
                            .fn()
                            .mockResolvedValue(getRetrievePaymentIntentResponse());

                        await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                    });

                    it('call confirmCardPayment to shopper auth with stored card and complete the payment', async () => {
                        const threeDSecureRequiredErrorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'three_d_secure_required' }],
                                three_ds_result: {
                                    token: 'token',
                                },
                            }),
                        );

                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                            Promise.reject(threeDSecureRequiredErrorResponse),
                        );

                        stripeUPEJsMock.confirmCardPayment = jest
                            .fn()
                            .mockResolvedValue(getConfirmPaymentResponse());

                        await strategy.execute(getStripeUPEOrderRequestBodyVaultMock());

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(stripeUPEJsMock.confirmCardPayment).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
                    });

                    it('call confirmCardPayment to shopper auth with stored card fails with stripeError containing canceled payment intent message and throws request error', async () => {
                        const threeDSecureRequiredErrorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'three_d_secure_required' }],
                                three_ds_result: {
                                    token: 'token',
                                },
                            }),
                        );

                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                            Promise.reject(threeDSecureRequiredErrorResponse),
                        );

                        stripeUPEJsMock.confirmCardPayment = jest.fn().mockResolvedValue({
                            error: {
                                payment_intent: {
                                    last_payment_error: {
                                        message: 'canceled',
                                    },
                                },
                            },
                        });

                        await expect(
                            strategy.execute(getStripeUPEOrderRequestBodyVaultMock()),
                        ).rejects.toBeInstanceOf(PaymentMethodCancelledError);

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(stripeUPEJsMock.confirmCardPayment).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                    });

                    it('call confirmCardPayment to shopper auth with stored card fails with stripeError containing unknown error and throws request error', async () => {
                        const threeDSecureRequiredErrorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'three_d_secure_required' }],
                                three_ds_result: {
                                    token: 'token',
                                },
                            }),
                        );

                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                            Promise.reject(threeDSecureRequiredErrorResponse),
                        );

                        stripeUPEJsMock.confirmCardPayment = jest.fn().mockResolvedValue({
                            error: {
                                payment_intent: {
                                    last_payment_error: {
                                        message: 'error',
                                    },
                                },
                                type: 'unknown_error',
                            },
                        });

                        await expect(
                            strategy.execute(getStripeUPEOrderRequestBodyVaultMock()),
                        ).rejects.toBeInstanceOf(PaymentMethodFailedError);

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(stripeUPEJsMock.confirmCardPayment).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                    });

                    it('call confirmCardPayment to shopper auth with stored card fails with no body and throws request error', async () => {
                        const threeDSecureRequiredErrorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'three_d_secure_required' }],
                                three_ds_result: {
                                    token: 'token',
                                },
                            }),
                        );

                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                            Promise.reject(threeDSecureRequiredErrorResponse),
                        );

                        stripeUPEJsMock.confirmCardPayment = jest.fn(() => Promise.resolve({}));

                        await expect(
                            strategy.execute(getStripeUPEOrderRequestBodyVaultMock()),
                        ).rejects.toBeInstanceOf(RequestError);

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(stripeUPEJsMock.confirmCardPayment).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                    });

                    it('throws stripe error when auth fails with stored card', async () => {
                        const threeDSecureRequiredErrorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'three_d_secure_required' }],
                                three_ds_result: {
                                    token: 'token',
                                },
                            }),
                        );
                        const stripeErrorMessage = 'Stripe error message.';

                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                            Promise.reject(threeDSecureRequiredErrorResponse),
                        );

                        stripeUPEJsMock.confirmCardPayment = jest.fn().mockResolvedValue({
                            error: {
                                type: 'card_error',
                                payment_intent: {
                                    last_payment_error: { message: stripeErrorMessage },
                                },
                                message: stripeErrorMessage,
                            },
                        });

                        await expect(
                            strategy.execute(getStripeUPEOrderRequestBodyVaultMock()),
                        ).rejects.toThrow(stripeErrorMessage);

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(stripeUPEJsMock.confirmCardPayment).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                    });

                    it('throws unknown error when using stored instrument', async () => {
                        const errorResponse = new RequestError(
                            getResponse(getErrorPaymentResponseBody()),
                        );

                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                            Promise.reject(errorResponse),
                        );

                        const promise = strategy.execute(getStripeUPEOrderRequestBodyVaultMock());

                        await expect(promise).rejects.toThrow(errorResponse);

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                        expect(stripeUPEJsMock.confirmCardPayment).not.toHaveBeenCalled();
                    });

                    it('throws stripe error when confirmCardPayment fails using stored card but 3DS is accepted', async () => {
                        const threeDSecureRequiredErrorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'three_d_secure_required' }],
                                three_ds_result: {
                                    token: 'token',
                                },
                            }),
                        );

                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                            Promise.reject(threeDSecureRequiredErrorResponse),
                        );

                        stripeUPEJsMock.confirmCardPayment = jest.fn(() =>
                            Promise.reject(new Error('Error with 3ds')),
                        );

                        stripeUPEJsMock.retrievePaymentIntent = jest
                            .fn()
                            .mockResolvedValue(getRetrievePaymentIntentResponse());

                        await strategy.execute(getStripeUPEOrderRequestBodyVaultMock());

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenNthCalledWith(
                            1,
                            expect.objectContaining({
                                paymentData: expect.objectContaining({
                                    formattedPayload: expect.objectContaining({
                                        bigpay_token: { token: 'token' },
                                    }),
                                }),
                            }),
                        );
                        expect(paymentIntegrationService.submitPayment).toHaveBeenNthCalledWith(
                            2,
                            expect.objectContaining({
                                paymentData: expect.objectContaining({
                                    formattedPayload: expect.objectContaining({
                                        credit_card_token: { token: 'pi_1234' },
                                    }),
                                }),
                            }),
                        );
                        expect(stripeUPEJsMock.confirmCardPayment).toHaveBeenCalled();
                        expect(stripeUPEJsMock.retrievePaymentIntent).toHaveBeenCalled();
                    });

                    it('not calling confirmPayment method when Payment Intent status is already „succeeded", case with additional_action_requires_payment_method and PI-626 Experiment on', async () => {
                        const storeConfig: StoreConfig = {
                            ...getConfig().storeConfig,
                            checkoutSettings: {
                                ...getConfig().storeConfig.checkoutSettings,
                                features: {
                                    'PI-626.Block_unnecessary_payment_confirmation_for_StripeUPE':
                                        true,
                                },
                            },
                        };

                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getStoreConfigOrThrow',
                        ).mockReturnValue(storeConfig);

                        const errorResponse = new RequestError(
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

                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                            Promise.reject(errorResponse),
                        );

                        stripeUPEJsMock.retrievePaymentIntent = jest
                            .fn()
                            .mockResolvedValue(getRetrievePaymentIntentResponseSucceeded());

                        try {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock());
                        } catch {
                            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(
                                2,
                            );
                            expect(stripeUPEJsMock.confirmPayment).not.toHaveBeenCalled();
                        }
                    });

                    it('not calling confirmPayment method when Payment Intent status is already „succeeded", case with redirect_to_url and PI-626 Experiment on', async () => {
                        const storeConfig = {
                            ...getConfig().storeConfig,
                            checkoutSettings: {
                                ...getConfig().storeConfig.checkoutSettings,
                                features: {
                                    'PI-626.Block_unnecessary_payment_confirmation_for_StripeUPE':
                                        true,
                                },
                            },
                        };

                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getStoreConfigOrThrow',
                        ).mockReturnValue(storeConfig);

                        const errorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'additional_action_required' }],
                                additional_action_required: {
                                    type: 'redirect_to_url',
                                    data: {
                                        redirect_url: 'https://redirect-url.com',
                                    },
                                },
                                status: 'error',
                            }),
                        );

                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                            Promise.reject(errorResponse),
                        );

                        stripeUPEJsMock.retrievePaymentIntent = jest
                            .fn()
                            .mockResolvedValue(getRetrievePaymentIntentResponseSucceeded());

                        try {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock());
                        } catch {
                            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(
                                1,
                            );
                            expect(stripeUPEJsMock.confirmPayment).not.toHaveBeenCalled();
                        }
                    });

                    it('not calling confirmPayment method when Payment Intent status is already „succeeded", case with additional_action_requires_payment_method and PI-626 Experiment off', async () => {
                        const storeConfig: StoreConfig = {
                            ...getConfig().storeConfig,
                            checkoutSettings: {
                                ...getConfig().storeConfig.checkoutSettings,
                                features: {
                                    'PI-626.Block_unnecessary_payment_confirmation_for_StripeUPE':
                                        false,
                                },
                            },
                        };

                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getStoreConfigOrThrow',
                        ).mockReturnValue(storeConfig);

                        const errorResponse = new RequestError(
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

                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                            Promise.reject(errorResponse),
                        );

                        stripeUPEJsMock.retrievePaymentIntent = jest
                            .fn()
                            .mockResolvedValue(getRetrievePaymentIntentResponseSucceeded());

                        try {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock());
                        } catch {
                            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(
                                2,
                            );
                            expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalled();
                        }
                    });

                    it('not calling confirmPayment method when Payment Intent status is already „succeeded", case with redirect_to_url and PI-626 Experiment off', async () => {
                        const storeConfig = {
                            ...getConfig().storeConfig,
                            checkoutSettings: {
                                ...getConfig().storeConfig.checkoutSettings,
                                features: {
                                    'PI-626.Block_unnecessary_payment_confirmation_for_StripeUPE':
                                        false,
                                },
                            },
                        };

                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getStoreConfigOrThrow',
                        ).mockReturnValue(storeConfig);

                        const errorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'additional_action_required' }],
                                additional_action_required: {
                                    type: 'redirect_to_url',
                                    data: {
                                        redirect_url: 'https://redirect-url.com',
                                    },
                                },
                                status: 'error',
                            }),
                        );

                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                            Promise.reject(errorResponse),
                        );

                        stripeUPEJsMock.retrievePaymentIntent = jest
                            .fn()
                            .mockResolvedValue(getRetrievePaymentIntentResponseSucceeded());

                        try {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock());
                        } catch {
                            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(
                                1,
                            );
                            expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalled();
                        }
                    });

                    it('shows error message if stripe successfully submitted order but additional BC payment request failed', async () => {
                        const errorResponse = new RequestError(
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

                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                            Promise.reject(errorResponse),
                        );

                        stripeUPEJsMock.confirmPayment = jest
                            .fn()
                            .mockResolvedValue(getConfirmPaymentResponse());

                        await strategy.initialize(getStripeUPEInitializeOptionsMock());

                        try {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock());
                        } catch (error) {
                            expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalledTimes(1);
                            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(
                                2,
                            );
                            expect(error).toBeInstanceOf(PaymentMethodFailedError);
                        }
                    });
                });

                describe('with SOFORT', () => {
                    const method = StripePaymentMethodType.SOFORT;

                    beforeEach(() => {
                        options = getStripeUPEInitializeOptionsMock(method);
                        paymentMethodMock = { ...getStripeUPE(method), clientToken: 'myToken' };

                        jest.spyOn(
                            paymentIntegrationService,
                            'loadPaymentMethod',
                        ).mockResolvedValue({
                            ...paymentIntegrationService.getState(),
                            ...paymentMethodMock,
                        });
                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getPaymentMethodOrThrow',
                        ).mockReturnValue(getStripeUPE(method));
                    });

                    it('fires additional action outside of bigcommerce', async () => {
                        const errorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'additional_action_required' }],
                                additional_action_required: {
                                    type: 'redirect_to_url',
                                    data: {
                                        redirect_url: 'https://redirect-url.com',
                                    },
                                },
                                status: 'error',
                            }),
                        );

                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                            Promise.reject(errorResponse),
                        );

                        stripeUPEJsMock.retrievePaymentIntent = jest
                            .fn()
                            .mockResolvedValue(getRetrievePaymentIntentResponse());

                        try {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock(method));
                        } catch (error) {
                            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(
                                1,
                            );
                            expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalledTimes(1);
                            expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalledWith(
                                expect.objectContaining({
                                    confirmParams: {
                                        payment_method_data: {
                                            billing_details: expect.objectContaining({
                                                email: 'test@bigcommerce.com',
                                            }),
                                        },
                                        return_url: 'https://redirect-url.com',
                                    },
                                }),
                            );
                        }
                    });

                    it('do not fire additional action because of missing url', async () => {
                        const errorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'additional_action_required' }],
                                additional_action_required: {
                                    type: 'redirect_to_url',
                                    data: {},
                                },
                                status: 'error',
                            }),
                        );

                        Object.defineProperty(window, 'location', {
                            value: {
                                replace: jest.fn(),
                            },
                        });

                        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                            Promise.reject(errorResponse),
                        );

                        try {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock(method));
                        } catch (error) {
                            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(
                                1,
                            );
                            expect(stripeUPEJsMock.confirmPayment).not.toHaveBeenCalled();
                        }
                    });
                });
            });
        });

        it('throws an error when payment is not set properly into payload', async () => {
            const payload = {
                payment: undefined,
            };

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);
        });

        it('throws an error when payment.paymentData is not set properly into payload', async () => {
            const payload = {
                payment: {
                    methodId: 'stripeupe',
                    paymentData: undefined,
                },
            };

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);
        });
    });

    describe('#finalize()', () => {
        it('throws an error to inform that order finalization is not required', async () => {
            const promise = strategy.finalize();

            await expect(promise).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        const stripeUPEJsMock = getStripeUPEJsMock();

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
