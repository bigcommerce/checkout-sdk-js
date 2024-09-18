import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import {
    Checkout,
    HostedForm,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    Order,
    OrderActionType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentActionType,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCheckout,
    getCustomer,
    getErrorPaymentResponseBody,
    getOrder,
    getResponse,
    getShippingAddress,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    StripeElement,
    StripeElements,
    StripeElementType,
    StripePaymentMethodType,
    StripeV3Client,
} from './stripev3';
import { getStripeV3 } from './stripev3-payment-method.mock';
import StripeV3PaymentStrategy from './stripev3-payment-strategy';
import StripeV3ScriptLoader from './stripev3-script-loader';
import {
    getConfirmPaymentResponse,
    getFailingStripeV3JsMock,
    getHostedFormInitializeOptions,
    getOrderRequestBodyVaultedCC,
    getPaymentMethodResponse,
    getStripeBillingAddress,
    getStripeBillingAddressWithoutPhone,
    getStripePaymentMethodOptionsWithGuestUserWithoutAddress,
    getStripeV3InitializeOptionsMock,
    getStripeV3InitializeOptionsMockSingleElements,
    getStripeV3JsMock,
    getStripeV3OrderRequestBodyMock,
    getStripeV3OrderRequestBodyVaultMock,
} from './stripev3.mock';

// TODO: CHECKOUT-7766
describe('StripeV3PaymentStrategy', () => {
    let checkoutMock: Checkout;
    let finalizeOrderAction: OrderActionType;
    let loadPaymentMethodAction: Promise<PaymentMethod>;
    let paymentMethodMock: PaymentMethod;
    let strategy: StripeV3PaymentStrategy;
    let stripeScriptLoader: StripeV3ScriptLoader;
    let submitOrderAction: OrderActionType;
    let submitPaymentAction: PaymentActionType;

    let scriptLoader: ScriptLoader;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        scriptLoader = createScriptLoader();

        paymentMethodMock = { ...getStripeV3(), clientToken: 'myToken' };

        stripeScriptLoader = new StripeV3ScriptLoader(scriptLoader);
        finalizeOrderAction = OrderActionType.FinalizeOrderRequested;
        submitOrderAction = OrderActionType.SubmitOrderRequested;
        submitPaymentAction = PaymentActionType.SubmitPaymentRequested;
        loadPaymentMethodAction = Promise.resolve(paymentMethodMock);
        checkoutMock = getCheckout();

        jest.useFakeTimers();

        jest.spyOn(paymentIntegrationService, 'submitOrder').mockReturnValue(submitOrderAction);

        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(submitPaymentAction);

        jest.spyOn(paymentIntegrationService, 'finalizeOrder').mockReturnValue(finalizeOrderAction);

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockReturnValue(
            loadPaymentMethodAction,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow').mockReturnValue(
            checkoutMock,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );

        strategy = new StripeV3PaymentStrategy(paymentIntegrationService, stripeScriptLoader);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        let options: PaymentInitializeOptions;
        let stripeV3JsMock: StripeV3Client;

        beforeEach(() => {
            options = getStripeV3InitializeOptionsMock();
            stripeV3JsMock = getStripeV3JsMock();
        });

        it('loads stripe v3 script', async () => {
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(options);

            expect(stripeScriptLoader.load).toHaveBeenCalled();
        });

        it('loads a single instance of StripeV3Client and StripeElements', async () => {
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(options);

            await strategy.initialize(options);

            expect(stripeScriptLoader.load).toHaveBeenCalledTimes(1);
            expect(stripeV3JsMock.elements).toHaveBeenCalledTimes(1);
        });

        it('does not load stripe V3 if initialization options are not provided', async () => {
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            delete options.stripev3;

            const promise = strategy.initialize(options);

            await expect(promise).rejects.toThrow(NotInitializedError);
        });

        it('fails to load stripe V3', async () => {
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(undefined);

            const promise = strategy.initialize(options);

            await expect(promise).rejects.toThrow(NotInitializedError);
        });

        it('does not load stripe V3 if gatewayId is not provided', async () => {
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            delete options.gatewayId;

            const promise = strategy.initialize(options);

            await expect(promise).rejects.toThrow(InvalidArgumentError);
        });

        describe('mounts single payment element', () => {
            beforeEach(() => {
                options = getStripeV3InitializeOptionsMock();

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(getStripeV3());
            });

            it('does not mount a stripe alipay element', async () => {
                const { create, getElement } = stripeV3JsMock.elements();

                stripeV3JsMock.elements = jest.fn().mockReturnValue({ create, getElement });

                jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(
                    Promise.resolve(stripeV3JsMock),
                );

                await strategy.initialize(
                    getStripeV3InitializeOptionsMock(StripeElementType.Alipay),
                );

                expect(create).not.toHaveBeenCalledWith('alipay');
            });

            it('mounts a previously created stripe element', async () => {
                const { create: getElement, getElement: create } = stripeV3JsMock.elements();

                stripeV3JsMock.elements = jest.fn().mockReturnValue({ create, getElement });

                jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(
                    Promise.resolve(stripeV3JsMock),
                );

                await strategy.initialize(options);

                expect(getElement).toHaveBeenCalledWith('card');
                expect(create).not.toHaveBeenCalled();
            });

            it('fails mounting a stripe card element', async () => {
                stripeV3JsMock = getFailingStripeV3JsMock();

                const { create, getElement } = stripeV3JsMock.elements();

                stripeV3JsMock.elements = jest.fn().mockReturnValue({ create, getElement });

                jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(
                    Promise.resolve(stripeV3JsMock),
                );

                await expect(strategy.initialize(options)).rejects.toThrow(InvalidArgumentError);
            });

            it('fails mounting a stripe sepa element', async () => {
                stripeV3JsMock = getFailingStripeV3JsMock();

                const { create, getElement } = stripeV3JsMock.elements();

                stripeV3JsMock.elements = jest.fn().mockReturnValue({ create, getElement });

                jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(
                    Promise.resolve(stripeV3JsMock),
                );

                options = getStripeV3InitializeOptionsMock(StripeElementType.Sepa);

                await expect(strategy.initialize(options)).rejects.toThrow(InvalidArgumentError);
            });
        });

        it('fails mounting individual payment elements', async () => {
            options = getStripeV3InitializeOptionsMockSingleElements();
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(getStripeV3('card', true));

            stripeV3JsMock = getFailingStripeV3JsMock();

            const { create, getElement } = stripeV3JsMock.elements();

            stripeV3JsMock.elements = jest.fn().mockReturnValue({ create, getElement });

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await expect(strategy.initialize(options)).rejects.toThrow(InvalidArgumentError);
        });
    });

    describe('#execute()', () => {
        let options: PaymentInitializeOptions;
        let stripeV3JsMock: StripeV3Client;

        beforeEach(() => {
            options = getStripeV3InitializeOptionsMock();
            stripeV3JsMock = getStripeV3JsMock();

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);
        });

        describe('creates the order and submit payment', () => {
            beforeEach(() => {
                jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(
                    Promise.resolve(stripeV3JsMock),
                );
            });

            it('with a stored instrument passing on the "make default" flag', async () => {
                await strategy.initialize(options);

                stripeV3JsMock.confirmCardPayment = jest.fn(() =>
                    Promise.resolve(getConfirmPaymentResponse()),
                );

                await strategy.execute(
                    getStripeV3OrderRequestBodyVaultMock(StripeElementType.CreditCard, true),
                );

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                    methodId: 'card',
                    paymentData: {
                        formattedPayload: {
                            bigpay_token: {
                                token: 'token',
                            },
                            client_token: 'myToken',
                            confirm: true,
                            set_as_default_stored_instrument: true,
                        },
                    },
                });
            });

            describe('with card', () => {
                let elements: StripeElements;
                let cardElement: StripeElement;

                beforeEach(() => {
                    elements = stripeV3JsMock.elements();
                    cardElement = elements.create(StripeElementType.CreditCard, {});

                    stripeV3JsMock.confirmCardPayment = jest.fn(() =>
                        Promise.resolve(getConfirmPaymentResponse()),
                    );

                    stripeV3JsMock.createPaymentMethod = jest.fn(() =>
                        Promise.resolve(getPaymentMethodResponse()),
                    );

                    jest.spyOn(
                        paymentIntegrationService.getState(),
                        'getBillingAddress',
                    ).mockReturnValue({
                        ...getBillingAddress(),
                    });

                    jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
                    jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
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

                    it('with a signed user', async () => {
                        const startV3OrderRequestGatewayId: OrderRequestBody = {
                            payment: {
                                methodId: StripeElementType.CreditCard,
                                paymentData: {
                                    shouldSaveInstrument: false,
                                },
                                gatewayId: 'stripev3',
                            },
                        };

                        await strategy.initialize(options);

                        await strategy.execute(startV3OrderRequestGatewayId);

                        expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith({
                            type: StripePaymentMethodType.CreditCard,
                            card: cardElement,
                            billing_details: getStripeBillingAddress(),
                        });
                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                    });

                    it('with a guest user', async () => {
                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getCustomer',
                        ).mockReturnValue(undefined);

                        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockReturnValue(
                            loadPaymentMethodAction,
                        );

                        await strategy.initialize(options);

                        await strategy.execute(getStripeV3OrderRequestBodyMock());

                        expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith({
                            type: StripePaymentMethodType.CreditCard,
                            card: cardElement,
                            billing_details: getStripeBillingAddress(),
                        });
                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                    });
                });

                it('with store credit', async () => {
                    checkoutMock.isStoreCreditApplied = true;

                    await strategy.initialize(options);

                    await strategy.execute(getStripeV3OrderRequestBodyMock());

                    expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                    expect(paymentIntegrationService.applyStoreCredit).toHaveBeenCalledWith(true);
                    expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                });

                it('passing on the "save card" flag', async () => {
                    await strategy.initialize(options);

                    await strategy.execute(
                        getStripeV3OrderRequestBodyMock(StripeElementType.CreditCard, true),
                    );

                    expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith({
                        type: StripePaymentMethodType.CreditCard,
                        card: cardElement,
                        billing_details: getStripeBillingAddress(),
                    });
                    expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                });

                it('submit payment with credit card and passes back the client token', async () => {
                    jest.spyOn(
                        paymentIntegrationService.getState(),
                        'getPaymentMethodOrThrow',
                    ).mockReturnValue(getStripeV3('card', false, false));

                    await strategy.initialize(options);

                    await strategy.execute(getStripeV3OrderRequestBodyMock());

                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                        expect.objectContaining({
                            methodId: 'card',
                            paymentData: expect.objectContaining({
                                formattedPayload: {
                                    credit_card_token: {
                                        token: 'pm_1234',
                                    },
                                    confirm: false,
                                    client_token: 'clientToken',
                                    vault_payment_instrument: false,
                                },
                            }),
                        }),
                    );
                });

                it('with a signed user without phone number', async () => {
                    const customer = getCustomer();

                    customer.addresses[0].phone = '';

                    jest.spyOn(paymentIntegrationService.getState(), 'getCustomer').mockReturnValue(
                        customer,
                    );
                    jest.spyOn(
                        paymentIntegrationService.getState(),
                        'getBillingAddress',
                    ).mockReturnValue({
                        ...getBillingAddress(),
                        phone: '',
                    });

                    await strategy.initialize(options);

                    await strategy.execute(getStripeV3OrderRequestBodyMock());

                    expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith({
                        type: StripePaymentMethodType.CreditCard,
                        card: cardElement,
                        billing_details: getStripeBillingAddressWithoutPhone(),
                    });
                    expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                });

                it('with a guest user without phone number', async () => {
                    jest.spyOn(paymentIntegrationService.getState(), 'getCustomer').mockReturnValue(
                        undefined,
                    );
                    jest.spyOn(
                        paymentIntegrationService.getState(),
                        'getBillingAddress',
                    ).mockReturnValue({
                        ...getBillingAddress(),
                        phone: '',
                    });
                    jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockReturnValue(
                        loadPaymentMethodAction,
                    );

                    await strategy.initialize(options);

                    await strategy.execute(getStripeV3OrderRequestBodyMock());

                    expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith({
                        type: StripePaymentMethodType.CreditCard,
                        card: cardElement,
                        billing_details: getStripeBillingAddressWithoutPhone(),
                    });
                    expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                });

                it('without shipping address if there is not physical items in cart', async () => {
                    jest.spyOn(paymentIntegrationService.getState(), 'getCart').mockReturnValue({
                        ...paymentIntegrationService.getState().getCart(),
                        lineItems: { physicalItems: [] },
                    });

                    await strategy.initialize(options);

                    await strategy.execute(getStripeV3OrderRequestBodyMock());

                    expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith({
                        type: StripePaymentMethodType.CreditCard,
                        card: cardElement,
                        billing_details: getStripeBillingAddress(),
                    });
                    expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                });

                it('with a guest user and without shipping and billing address', async () => {
                    jest.spyOn(paymentIntegrationService.getState(), 'getCustomer').mockReturnValue(
                        undefined,
                    );
                    jest.spyOn(
                        paymentIntegrationService.getState(),
                        'getShippingAddress',
                    ).mockReturnValue(undefined);
                    jest.spyOn(
                        paymentIntegrationService.getState(),
                        'getBillingAddress',
                    ).mockReturnValue(undefined);

                    await strategy.initialize(options);

                    await strategy.execute(getStripeV3OrderRequestBodyMock());

                    expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith({
                        type: StripePaymentMethodType.CreditCard,
                        card: cardElement,
                        ...getStripePaymentMethodOptionsWithGuestUserWithoutAddress(),
                    });
                    expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
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

                    Object.defineProperty(window, 'location', {
                        value: {
                            replace: jest.fn(),
                        },
                    });

                    jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                        Promise.reject(errorResponse),
                    );

                    await strategy.initialize(options);

                    strategy.execute(getStripeV3OrderRequestBodyMock());
                    await new Promise((resolve) => process.nextTick(resolve));

                    expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                    expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
                    expect(window.location.replace).toHaveBeenCalledWith(
                        'https://redirect-url.com',
                    );
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
                        Promise.resolve(errorResponse),
                    );

                    await strategy.initialize(options);

                    await strategy.execute(getStripeV3OrderRequestBodyMock());
                    await new Promise((resolve) => process.nextTick(resolve));

                    expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                    expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
                    expect(window.location.replace).not.toHaveBeenCalled();
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

                    jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue(
                        errorResponse,
                    );

                    await strategy.initialize(options);

                    try {
                        await strategy.execute(getStripeV3OrderRequestBodyMock());
                    } catch (error) {
                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                        expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
                    }
                });

                it('throws stripe error if empty payment intent is sent', async () => {
                    const requiredFieldErrorResponse = new RequestError(
                        getResponse({
                            ...getErrorPaymentResponseBody(),
                            errors: [{ code: 'required_field' }],
                        }),
                    );
                    const stripeErrorMessage = 'Stripe error message.';

                    jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                        Promise.reject(requiredFieldErrorResponse),
                    );

                    stripeV3JsMock.createPaymentMethod = jest.fn(() =>
                        Promise.resolve({ error: { message: stripeErrorMessage } }),
                    );

                    await strategy.initialize(options);

                    await expect(
                        strategy.execute(getStripeV3OrderRequestBodyMock()),
                    ).rejects.toThrow(stripeErrorMessage);

                    expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                        expect.objectContaining({
                            paymentData: expect.objectContaining({
                                formattedPayload: expect.objectContaining({
                                    credit_card_token: { token: '' },
                                }),
                            }),
                        }),
                    );
                    expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
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

                    await strategy.initialize(options);

                    try {
                        await strategy.execute(getStripeV3OrderRequestBodyMock());
                    } catch (error) {
                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                        expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
                        expect(error.message).toEqual(unexpectedError && unexpectedError.message);
                    }
                });

                it('throws an error that is not a RequestError', async () => {
                    const errorResponse = new Error();

                    jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                        Promise.reject(errorResponse),
                    );

                    await strategy.initialize(options);

                    await expect(
                        strategy.execute(getStripeV3OrderRequestBodyMock()),
                    ).rejects.toThrow(Error);

                    expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                    expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
                });

                it('throws stripe error when auth fails', async () => {
                    const threeDSecureRequiredErrorResponse = new RequestError(
                        getResponse({
                            ...getErrorPaymentResponseBody(),
                            errors: [{ code: 'three_d_secure_required' }],
                            three_ds_result: {
                                token: 'token',
                            },
                        }),
                    );
                    const requiredFieldErrorResponse = new RequestError(
                        getResponse({
                            ...getErrorPaymentResponseBody(),
                            errors: [{ code: 'required_field' }],
                        }),
                    );
                    const stripeErrorMessage = 'Stripe error message.';

                    jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                        Promise.reject(threeDSecureRequiredErrorResponse),
                    );

                    stripeV3JsMock.confirmCardPayment = jest.fn(() =>
                        Promise.resolve({
                            error: {
                                payment_intent: {
                                    last_payment_error: { message: stripeErrorMessage },
                                },
                                message: stripeErrorMessage,
                            },
                        }),
                    );

                    await strategy.initialize(options);

                    await expect(
                        strategy.execute(getStripeV3OrderRequestBodyVaultMock()),
                    ).rejects.toThrow(stripeErrorMessage);

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

                    jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                        Promise.reject(requiredFieldErrorResponse),
                    );

                    expect(paymentIntegrationService.submitPayment).not.toHaveBeenNthCalledWith(
                        2,
                        expect.objectContaining({
                            paymentData: expect.objectContaining({
                                formattedPayload: expect.objectContaining({
                                    credit_card_token: { token: '' },
                                }),
                            }),
                        }),
                    );
                    expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalled();
                });

                it('throws stripe error when confirm fails but 3DS is accepted', async () => {
                    const threeDSecureRequiredErrorResponse = new RequestError(
                        getResponse({
                            ...getErrorPaymentResponseBody(),
                            errors: [{ code: 'three_d_secure_required' }],
                            three_ds_result: {
                                token: 'token',
                            },
                        }),
                    );

                    jest.spyOn(paymentIntegrationService, 'submitPayment')
                        .mockReturnValueOnce(Promise.reject(threeDSecureRequiredErrorResponse))
                        .mockReturnValueOnce(Promise.resolve());

                    stripeV3JsMock.confirmCardPayment = jest.fn(() =>
                        Promise.reject(new Error('Error with 3ds')),
                    );

                    await strategy.initialize(options);
                    await strategy.execute(getStripeV3OrderRequestBodyVaultMock());

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
                                    credit_card_token: { token: 'token' },
                                }),
                            }),
                        }),
                    );
                    expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalled();
                });

                it('throws stripe error when user closes the auth modal', async () => {
                    const threeDSecureRequiredErrorResponse = new RequestError(
                        getResponse({
                            ...getErrorPaymentResponseBody(),
                            errors: [{ code: 'three_d_secure_required' }],
                            three_ds_result: {
                                token: 'token',
                            },
                        }),
                    );

                    const requiredFieldErrorResponse = new RequestError(
                        getResponse({
                            ...getErrorPaymentResponseBody(),
                            errors: [{ code: 'required_field' }],
                        }),
                    );
                    const stripeErrorMessage = 'canceled';
                    const errorMessage = 'Payment process was cancelled.';

                    jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                        Promise.reject(threeDSecureRequiredErrorResponse),
                    );

                    stripeV3JsMock.confirmCardPayment = jest.fn(() =>
                        Promise.resolve({
                            error: {
                                payment_intent: {
                                    last_payment_error: { message: stripeErrorMessage },
                                },
                            },
                        }),
                    );

                    await strategy.initialize(options);

                    await expect(
                        strategy.execute(getStripeV3OrderRequestBodyVaultMock()),
                    ).rejects.toThrow(errorMessage);

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

                    jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                        Promise.reject(requiredFieldErrorResponse),
                    );

                    expect(paymentIntegrationService.submitPayment).not.toHaveBeenNthCalledWith(
                        2,
                        expect.objectContaining({
                            paymentData: expect.objectContaining({
                                formattedPayload: expect.objectContaining({
                                    credit_card_token: { token: '' },
                                }),
                            }),
                        }),
                    );
                    expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalled();
                });

                it('throws stripe error when 3d auth fails', async () => {
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

                    stripeV3JsMock.confirmCardPayment = jest.fn(() =>
                        Promise.resolve({
                            error: {
                                payment_intent: {
                                    last_payment_error: { message: 'Stripe error message.' },
                                },
                                code: 'payment_intent_authentication_failure',
                            },
                        }),
                    );

                    await strategy.initialize(options);

                    await expect(
                        strategy.execute(getStripeV3OrderRequestBodyVaultMock()),
                    ).rejects.toThrow('User did not authenticate');
                });

                it('throws unknown error when process additional action', async () => {
                    const unknownError = new Error('Unknown error');

                    jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                        Promise.reject(unknownError),
                    );

                    await strategy.initialize(options);

                    await expect(
                        strategy.execute(getStripeV3OrderRequestBodyVaultMock()),
                    ).rejects.toThrow('Unknown error');
                });

                it('throws unknown stripe error when user closes the auth modal', async () => {
                    const threeDSecureRequiredErrorResponse = new RequestError(
                        getResponse({
                            ...getErrorPaymentResponseBody(),
                            errors: [{ code: 'three_d_secure_required' }],
                            three_ds_result: {
                                token: 'token',
                            },
                        }),
                    );
                    const requiredFieldErrorResponse = new RequestError(
                        getResponse({
                            ...getErrorPaymentResponseBody(),
                            errors: [{ code: 'required_field' }],
                        }),
                    );

                    jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                        Promise.reject(threeDSecureRequiredErrorResponse),
                    );

                    stripeV3JsMock.confirmCardPayment = jest.fn(() =>
                        Promise.resolve({
                            error: { payment_intent: { last_payment_error: undefined } },
                        }),
                    );

                    await strategy.initialize(options);

                    await expect(
                        strategy.execute(getStripeV3OrderRequestBodyVaultMock()),
                    ).rejects.toThrow();

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

                    jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                        Promise.reject(requiredFieldErrorResponse),
                    );

                    expect(paymentIntegrationService.submitPayment).not.toHaveBeenNthCalledWith(
                        2,
                        expect.objectContaining({
                            paymentData: expect.objectContaining({
                                formattedPayload: expect.objectContaining({
                                    credit_card_token: { token: '' },
                                }),
                            }),
                        }),
                    );
                    expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalled();
                });

                it('throws request error when payment fails after auth modal succeed', async () => {
                    const threeDSecureRequiredErrorResponse = new RequestError(
                        getResponse({
                            ...getErrorPaymentResponseBody(),
                            errors: [{ code: 'three_d_secure_required' }],
                            three_ds_result: {
                                token: 'token',
                            },
                        }),
                    );
                    const serverSideErrorMessage = 'Something went wrong server side!';
                    const serverSideError = new RequestError(
                        getResponse({
                            ...getErrorPaymentResponseBody(),
                            errors: [{ code: 'unknown_error' }],
                        }),
                        { message: serverSideErrorMessage },
                    );

                    jest.spyOn(paymentIntegrationService, 'submitPayment')
                        .mockReturnValueOnce(Promise.reject(threeDSecureRequiredErrorResponse))
                        .mockReturnValueOnce(Promise.reject(serverSideError));

                    stripeV3JsMock.confirmCardPayment = jest.fn(() =>
                        Promise.resolve(getConfirmPaymentResponse()),
                    );

                    await strategy.initialize(options);

                    await expect(
                        strategy.execute(getStripeV3OrderRequestBodyVaultMock()),
                    ).rejects.toThrow(serverSideErrorMessage);

                    expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
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
                    expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalled();
                });

                it('throws when stored instrument requires SCA and then shopper successfully authenticates', async () => {
                    const errorResponse = new RequestError(
                        getResponse({
                            ...getErrorPaymentResponseBody(),
                            errors: [{ code: 'three_d_secure_required' }],
                            three_ds_result: {
                                token: 'token',
                            },
                            status: 'error',
                        }),
                    );

                    jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                        Promise.reject(errorResponse),
                    );

                    stripeV3JsMock.confirmCardPayment = jest.fn(() =>
                        Promise.resolve(getConfirmPaymentResponse()),
                    );

                    await strategy.initialize(options);
                    await strategy.execute(getStripeV3OrderRequestBodyVaultMock());

                    expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
                    expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalled();
                });

                it('call confirmCardPayment to shopper auth and complete the payment', async () => {
                    const errorResponse = new RequestError(
                        getResponse({
                            ...getErrorPaymentResponseBody(),
                            errors: [{ code: 'three_d_secure_required' }],
                            three_ds_result: {
                                token: 'token',
                            },
                            status: 'error',
                        }),
                    );

                    jest.spyOn(
                        paymentIntegrationService.getState(),
                        'getPaymentMethodOrThrow',
                    ).mockReturnValue(getStripeV3('card', false, false));

                    jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                        Promise.reject(errorResponse),
                    );

                    stripeV3JsMock.confirmCardPayment = jest.fn(() =>
                        Promise.resolve(getConfirmPaymentResponse()),
                    );

                    await strategy.initialize(options);
                    await strategy.execute(getStripeV3OrderRequestBodyMock());

                    expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
                    expect(paymentIntegrationService.submitPayment).toHaveBeenNthCalledWith(
                        2,

                        expect.objectContaining({
                            methodId: 'card',
                            paymentData: expect.objectContaining({
                                formattedPayload: expect.objectContaining({
                                    confirm: false,
                                }),
                            }),
                        }),
                    );
                    expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalled();
                });

                it('throws unknown error when using stored instrument', async () => {
                    const errorResponse = new RequestError(
                        getResponse(getErrorPaymentResponseBody()),
                    );

                    jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                        Promise.reject(errorResponse),
                    );

                    await strategy.initialize(options);

                    const promise = strategy.execute(getStripeV3OrderRequestBodyVaultMock());

                    await expect(promise).rejects.toThrow(errorResponse);

                    expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                    expect(stripeV3JsMock.confirmCardPayment).not.toHaveBeenCalled();
                });

                describe('with individual payment elements', () => {
                    beforeEach(() => {
                        options = getStripeV3InitializeOptionsMockSingleElements(true);
                        jest.spyOn(
                            paymentIntegrationService.getState(),
                            'getPaymentMethodOrThrow',
                        ).mockReturnValue(getStripeV3('card', true));
                        jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(
                            Promise.resolve(stripeV3JsMock),
                        );
                    });

                    it('test', () => {
                        expect(1).toBe(1);
                    });

                    it('without zipcode', async () => {
                        options = getStripeV3InitializeOptionsMockSingleElements();

                        await strategy.initialize(options);

                        await strategy.execute(getStripeV3OrderRequestBodyMock());

                        expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                        expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                    });

                    describe('with zipcode', () => {
                        beforeEach(() => {
                            options = getStripeV3InitializeOptionsMockSingleElements(true);
                            jest.spyOn(
                                paymentIntegrationService.getState(),
                                'getBillingAddress',
                            ).mockReturnValue(getBillingAddress());
                        });

                        it('with valid input field', async () => {
                            const container: HTMLDivElement = document.createElement('input');

                            container.setAttribute('id', 'stripe-postal-code-component-field');
                            container.setAttribute('value', '90210');
                            document.body.appendChild(container);

                            await strategy.initialize(options);

                            await strategy.execute(getStripeV3OrderRequestBodyMock());

                            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                            expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
                            expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();

                            document.body.removeChild(container);
                        });

                        it('with invalid container', async () => {
                            await strategy.initialize(options);

                            await strategy.execute(getStripeV3OrderRequestBodyMock());

                            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                            expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
                            expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                        });
                    });
                });
            });

            it('with alipay', async () => {
                paymentMethodMock = {
                    ...getStripeV3(StripeElementType.Alipay),
                    clientToken: 'myToken',
                };
                jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockReturnValue(
                    loadPaymentMethodAction,
                );

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(getStripeV3(StripeElementType.Alipay));

                options = getStripeV3InitializeOptionsMock(StripeElementType.Alipay);
                stripeV3JsMock.confirmAlipayPayment = jest.fn(() =>
                    Promise.resolve(getConfirmPaymentResponse()),
                );

                await strategy.initialize(options);

                await strategy.execute(getStripeV3OrderRequestBodyMock(StripeElementType.Alipay));

                expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();

                expect(stripeV3JsMock.confirmAlipayPayment).toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
            });

            it('with ideal', async () => {
                paymentMethodMock = {
                    ...getStripeV3(StripeElementType.IDEAL),
                    clientToken: 'myToken',
                };
                jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockReturnValue(
                    loadPaymentMethodAction,
                );

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(getStripeV3(StripeElementType.IDEAL));

                options = getStripeV3InitializeOptionsMock(StripeElementType.IDEAL);
                stripeV3JsMock.confirmIdealPayment = jest.fn(() =>
                    Promise.resolve(getConfirmPaymentResponse()),
                );

                await strategy.initialize(options);

                await strategy.execute(getStripeV3OrderRequestBodyMock(StripeElementType.IDEAL));

                expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                expect(stripeV3JsMock.confirmIdealPayment).toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
            });

            it('with SEPA', async () => {
                paymentMethodMock = {
                    ...getStripeV3(StripeElementType.Sepa),
                    clientToken: 'myToken',
                };
                jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockReturnValue(
                    loadPaymentMethodAction,
                );

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(getStripeV3(StripeElementType.Sepa));

                options = getStripeV3InitializeOptionsMock(StripeElementType.Sepa);
                stripeV3JsMock.confirmSepaDebitPayment = jest.fn(() =>
                    Promise.resolve(getConfirmPaymentResponse()),
                );

                await strategy.initialize(options);

                await strategy.execute(getStripeV3OrderRequestBodyMock(StripeElementType.Sepa));

                expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                expect(stripeV3JsMock.confirmSepaDebitPayment).toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
            });

            it('throws error when clientToken is undefined', async () => {
                paymentMethodMock.clientToken = undefined;

                await strategy.initialize(options);

                const promise = strategy.execute(getStripeV3OrderRequestBodyMock());

                await expect(promise).rejects.toThrow(
                    new MissingDataError(MissingDataErrorType.MissingPaymentMethod),
                );

                expect(stripeV3JsMock.confirmCardPayment).not.toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
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
                    methodId: 'stripev3',
                    paymentData: undefined,
                },
            };

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);
        });
    });

    describe('When Hosted Form is enabled', () => {
        let form: Pick<HostedForm, 'attach' | 'submit' | 'validate' | 'detach'>;
        let initializeOptions: PaymentInitializeOptions;
        let loadOrderAction: Promise<Order>;
        let state;
        const stripeV3JsMock = getStripeV3JsMock();

        beforeEach(() => {
            form = {
                attach: jest.fn(() => Promise.resolve()),
                submit: jest.fn(() => Promise.resolve()),
                validate: jest.fn(() => Promise.resolve()),
                detach: jest.fn(),
            };
            paymentMethodMock = { ...getStripeV3('card', false, true), clientToken: 'myToken' };
            initializeOptions = getHostedFormInitializeOptions();
            loadOrderAction = Promise.resolve(getOrder());
            state = paymentIntegrationService.getState();

            jest.spyOn(state, 'getPaymentMethodOrThrow').mockReturnValue(
                getStripeV3(StripePaymentMethodType.CreditCard, false, true),
            );

            jest.spyOn(paymentIntegrationService, 'loadCurrentOrder').mockReturnValue(
                loadOrderAction,
            );

            jest.spyOn(paymentIntegrationService, 'createHostedForm').mockReturnValue(form);

            jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockReturnValue(
                loadPaymentMethodAction,
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('creates hosted form', async () => {
            await strategy.initialize(initializeOptions);

            expect(paymentIntegrationService.createHostedForm).toHaveBeenCalledWith(
                'https://bigpay.integration.zone',
                initializeOptions.stripev3?.form,
            );
        });

        it('attaches hosted form to container', async () => {
            await strategy.initialize(initializeOptions);

            expect(form.attach).toHaveBeenCalled();
        });

        it('submits payment data with hosted form', async () => {
            const payload = getOrderRequestBodyVaultedCC();

            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(form.submit).toHaveBeenCalledWith(payload.payment);
        });

        it('submits payment data with hosted form and client_token', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...getStripeV3('card', false, true),
                clientToken: 'myToken',
            });

            const payload = getOrderRequestBodyVaultedCC();
            const expectedPayload = {
                shouldSaveInstrument: true,
                shouldSetAsDefaultInstrument: true,
                instrumentId: '{"token":"1234","client_token":"myToken"}',
            };

            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(form.submit).toHaveBeenCalledWith(payload.payment);
            expect(payload.payment?.paymentData).toEqual(expectedPayload);
        });

        it('validates user input before submitting data', async () => {
            await strategy.initialize(initializeOptions);
            await strategy.execute(getOrderRequestBodyVaultedCC());

            expect(form.validate).toHaveBeenCalled();
        });

        it('does not submit payment data with hosted form if validation fails', async () => {
            jest.spyOn(form, 'validate').mockRejectedValue(new Error());

            try {
                await strategy.initialize(initializeOptions);
                await strategy.execute(getOrderRequestBodyVaultedCC());
            } catch (error) {
                expect(form.submit).not.toHaveBeenCalled();
            }
        });

        it('should detach hostedForm on Deinitialize', async () => {
            await strategy.initialize(initializeOptions);
            await strategy.deinitialize();

            expect(form.detach).toHaveBeenCalled();
        });

        it('fails creating hosted form', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue(
                undefined,
            );

            await expect(strategy.initialize(initializeOptions)).rejects.toBeInstanceOf(
                MissingDataError,
            );
        });
    });

    describe('#finalize()', () => {
        it('throws an error to inform that order finalization is not required', async () => {
            const promise = strategy.finalize();

            await expect(promise).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        let cardElement: StripeElement;

        beforeEach(() => {
            const stripeV3JsMock = getStripeV3JsMock();
            const elements = stripeV3JsMock.elements();

            cardElement = elements.create(StripeElementType.CreditCard, {});

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(getStripeV3());
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
        });

        it('deinitializes stripe payment strategy', async () => {
            await strategy.initialize(getStripeV3InitializeOptionsMock());

            await strategy.deinitialize();

            expect(cardElement.unmount).toHaveBeenCalledTimes(1);
        });

        it('validates is stripe element still exists before trying to unmount it', async () => {
            await strategy.initialize(getStripeV3InitializeOptionsMock());
            await strategy.deinitialize();

            await strategy.deinitialize();

            expect(cardElement.unmount).toHaveBeenCalledTimes(1);
        });
    });
});
