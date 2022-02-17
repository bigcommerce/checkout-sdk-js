import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of, Observable } from 'rxjs';

import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { createCheckoutStore, Checkout, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckout, getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { getCustomer } from '../../../customer/customers.mock';
import { FinalizeOrderAction, OrderActionCreator, OrderActionType, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { LoadPaymentMethodAction, PaymentInitializeOptions, PaymentMethodActionType, PaymentMethodRequestSender, PaymentRequestSender } from '../../../payment';
import { getShippingAddress } from '../../../shipping/shipping-addresses.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { StoreCreditActionCreator, StoreCreditActionType, StoreCreditRequestSender } from '../../../store-credit';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { getStripeUPE } from '../../payment-methods.mock';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { getErrorPaymentResponseBody } from '../../payments.mock';

import { StripeElement, StripeElements, StripeElementsOptions, StripePaymentMethodType, StripeUPEClient } from './stripe-upe';
import StripeUPEPaymentStrategy from './stripe-upe-payment-strategy';
import StripeUPEScriptLoader from './stripe-upe-script-loader';
import { getConfirmPaymentResponse, getFailingStripeUPEJsMock, getStripeUPEInitializeOptionsMock, getStripeUPEJsMock, getStripeUPEOrderRequestBodyMock, getStripeUPEOrderRequestBodyVaultMock } from './stripe-upe.mock';

describe('StripeUPEPaymentStrategy', () => {
    let checkoutMock: Checkout;
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let loadPaymentMethodAction: Observable<LoadPaymentMethodAction>;
    let orderActionCreator: OrderActionCreator;
    let orderRequestSender: OrderRequestSender;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let store: CheckoutStore;
    let storeCreditActionCreator: StoreCreditActionCreator;
    let strategy: StripeUPEPaymentStrategy;
    let stripeScriptLoader: StripeUPEScriptLoader;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        const requestSender = createRequestSender();
        const paymentMethodRequestSender: PaymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
        const scriptLoader = createScriptLoader();

        paymentMethodActionCreator = new PaymentMethodActionCreator(paymentMethodRequestSender);

        orderRequestSender = new OrderRequestSender(requestSender);
        orderActionCreator = new OrderActionCreator(
            orderRequestSender,
            new CheckoutValidator(new CheckoutRequestSender(requestSender))
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(scriptLoader))
        );

        storeCreditActionCreator = new StoreCreditActionCreator(
            new StoreCreditRequestSender(requestSender)
        );
        paymentMethodMock = { ...getStripeUPE(), clientToken: 'myToken' };

        stripeScriptLoader = new StripeUPEScriptLoader(scriptLoader);
        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
        loadPaymentMethodAction = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, { methodId: `stripeupe?method=${paymentMethodMock.id }`}));
        checkoutMock = getCheckout();

        jest.useFakeTimers();

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        jest.spyOn(orderActionCreator, 'finalizeOrder')
            .mockReturnValue(finalizeOrderAction);

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(loadPaymentMethodAction);

        jest.spyOn(storeCreditActionCreator, 'applyStoreCredit')
            .mockReturnValue(of(createAction(StoreCreditActionType.ApplyStoreCreditSucceeded)));

        jest.spyOn(store.getState().checkout, 'getCheckoutOrThrow')
            .mockReturnValue(checkoutMock);

        strategy = new StripeUPEPaymentStrategy(
            store,
            paymentMethodActionCreator,
            paymentActionCreator,
            orderActionCreator,
            stripeScriptLoader,
            storeCreditActionCreator
        );
    });

    describe('#initialize()', () => {
        let options: PaymentInitializeOptions;
        let elementsOptions: StripeElementsOptions;
        let stripeUPEJsMock: StripeUPEClient;

        beforeEach(() => {
            options = getStripeUPEInitializeOptionsMock();
            stripeUPEJsMock = getStripeUPEJsMock();
        });

        it('loads stripeUPE script', async () => {
            jest.spyOn(stripeScriptLoader, 'load')
                .mockReturnValue(Promise.resolve(stripeUPEJsMock));

            await expect(strategy.initialize(options)).resolves.toBe(store.getState());

            expect(stripeScriptLoader.load).toHaveBeenCalled();
        });

        it('loads a single instance of StripeUPEClient and StripeElements', async () => {
            jest.spyOn(stripeScriptLoader, 'load')
                .mockReturnValue(Promise.resolve(stripeUPEJsMock));

            await expect(strategy.initialize(options)).resolves.toBe(store.getState());
            await expect(strategy.initialize(options)).resolves.toBe(store.getState());

            expect(stripeScriptLoader.load).toHaveBeenCalledTimes(1);
            expect(stripeUPEJsMock.elements).toHaveBeenCalledTimes(1);
        });

        it('does not load stripeUPE if initialization options are not provided', () => {
            jest.spyOn(stripeScriptLoader, 'load')
                .mockReturnValue(Promise.resolve(stripeUPEJsMock));

            delete options.stripeupe;

            const promise = strategy.initialize(options);

            return expect(promise).rejects.toThrow(NotInitializedError);
        });

        it('fails to load stripeUPE', () => {
            jest.spyOn(stripeScriptLoader, 'load')
                .mockReturnValue(undefined);

            const promise = strategy.initialize(options);

            return expect(promise).rejects.toThrow(TypeError);
        });

        it('does not load stripeUPE if gatewayId is not provided', () => {
            jest.spyOn(stripeScriptLoader, 'load')
                .mockReturnValue(Promise.resolve(stripeUPEJsMock));

            delete options.gatewayId;

            const promise = strategy.initialize(options);

            return expect(promise).rejects.toThrow(InvalidArgumentError);
        });

        describe('mounts single payment element', () => {
            beforeEach(() => {
                options = getStripeUPEInitializeOptionsMock();
                elementsOptions = {clientSecret: 'myToken'};

                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                    .mockReturnValue(getStripeUPE());
            });

            it('mounts a previously created stripe element', async () => {
                const { create: getElement, getElement: create } = stripeUPEJsMock.elements(elementsOptions);
                stripeUPEJsMock.elements = jest.fn()
                    .mockReturnValue({ create, getElement });

                jest.spyOn(stripeScriptLoader, 'load')
                    .mockReturnValue(Promise.resolve(stripeUPEJsMock));

                await strategy.initialize(options);

                expect(getElement).toHaveBeenCalledWith('payment');
                expect(create).not.toHaveBeenCalled();
            });

            it('fails mounting a stripe payment element', async () => {
                stripeUPEJsMock = getFailingStripeUPEJsMock();
                const { create, getElement } = stripeUPEJsMock.elements(elementsOptions);
                stripeUPEJsMock.elements = jest.fn()
                    .mockReturnValue({ create, getElement });

                jest.spyOn(stripeScriptLoader, 'load')
                    .mockReturnValue(Promise.resolve(stripeUPEJsMock));

                await expect(strategy.initialize(options))
                    .rejects.toThrow(InvalidArgumentError);
            });
        });
    });

    describe('#execute()', () => {
        let options: PaymentInitializeOptions;
        let stripeUPEJsMock: StripeUPEClient;

        beforeEach(() => {
            options = getStripeUPEInitializeOptionsMock();
            stripeUPEJsMock = getStripeUPEJsMock();

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(getStripeUPE());
        });

        describe('creates the order and submit payment', () => {
            beforeEach(() => {
                jest.spyOn(stripeScriptLoader, 'load')
                    .mockReturnValue(Promise.resolve(stripeUPEJsMock));
            });

            it('with a stored instrument passing on the "make default" flag', async () => {
                await strategy.initialize(options);

                stripeUPEJsMock.confirmPayment = jest.fn(
                    () => Promise.resolve(getConfirmPaymentResponse())
                );

                await strategy.execute(getStripeUPEOrderRequestBodyVaultMock(StripePaymentMethodType.CreditCard, true));

                expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({methodId: 'card',
                    paymentData: {
                        formattedPayload: {
                            credit_card_token: {
                                token: 'pi_1234',
                            },
                            confirm: false,
                            vault_payment_instrument: false,
                        },
                        shouldSetAsDefaultInstrument: true,
                    }}
                );
            });

            describe('with card', () => {
                let elements: StripeElements;
                let cardElement: StripeElement;
                const elementsOptions: StripeElementsOptions = {clientSecret: 'myToken'};

                beforeEach(() => {
                    elements = stripeUPEJsMock.elements(elementsOptions);
                    cardElement = elements.create('payment');

                    stripeUPEJsMock.confirmPayment = jest.fn(
                        () => Promise.resolve(getConfirmPaymentResponse())
                    );

                    jest.spyOn(stripeUPEJsMock, 'elements')
                        .mockReturnValue(elements);
                    jest.spyOn(stripeUPEJsMock.elements(elementsOptions), 'create')
                        .mockReturnValue(cardElement);
                });

                describe('with both shipping and billing address', () => {
                    beforeEach(() => {
                        jest.spyOn(store.getState().shippingAddress, 'getShippingAddress')
                            .mockReturnValue(getShippingAddress());
                        jest.spyOn(store.getState().billingAddress, 'getBillingAddress')
                            .mockReturnValue(getBillingAddress());
                    });

                    it('with a signed user', async () => {
                        await strategy.initialize(options);
                        const response = await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                        expect(response).toBe(store.getState());
                    });

                    it('with a guest user', async () => {
                        jest.spyOn(store.getState().customer, 'getCustomer')
                            .mockReturnValue(undefined);

                        await strategy.initialize(options);
                        const response = await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                        expect(response).toBe(store.getState());
                    });
                });

                it('with store credit', async () => {
                    checkoutMock.isStoreCreditApplied = true;

                    await strategy.initialize(options);
                    const promise = await strategy.execute(getStripeUPEOrderRequestBodyMock());

                    expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                    expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                    expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(true);
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                    expect(promise).toBe(store.getState());
                });

                it('passing on the "save card" flag', async () => {
                    await strategy.initialize(options);
                    const response = await strategy.execute(getStripeUPEOrderRequestBodyMock(StripePaymentMethodType.CreditCard, true));

                    expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                    expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                    expect(response).toBe(store.getState());
                });

                it('submit payment with credit card and passes back the client token', async () => {
                    await strategy.initialize(options);
                    const response = await strategy.execute(getStripeUPEOrderRequestBodyMock());

                    expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(
                        expect.objectContaining({
                            methodId: 'card',
                            paymentData: expect.objectContaining({
                                formattedPayload: expect.objectContaining({
                                    confirm: false,
                                    credit_card_token: {
                                        token: 'pi_1234',
                                    },
                                    vault_payment_instrument: false,
                                }),
                            }),
                        })
                    );
                    expect(response).toBe(store.getState());
                });

                it('with a signed user without phone number', async () => {
                    const customer = getCustomer();
                    customer.addresses[0].phone = '';

                    jest.spyOn(store.getState().customer, 'getCustomer')
                        .mockReturnValue(customer);
                    jest.spyOn(store.getState().billingAddress, 'getBillingAddress')
                        .mockReturnValue({
                        ...getBillingAddress(),
                        phone: '',
                    });

                    await strategy.initialize(options);
                    const response = await strategy.execute(getStripeUPEOrderRequestBodyMock());

                    expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                    expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                    expect(response).toBe(store.getState());
                });

                it('with a guest user without phone number', async () => {
                    jest.spyOn(store.getState().customer, 'getCustomer')
                        .mockReturnValue(undefined);
                    jest.spyOn(store.getState().billingAddress, 'getBillingAddress')
                        .mockReturnValue({
                        ...getBillingAddress(),
                        phone: '',
                    });

                    await strategy.initialize(options);
                    const response = await strategy.execute(getStripeUPEOrderRequestBodyMock());

                    expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                    expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                    expect(response).toBe(store.getState());
                });

                it('without shipping address if there is not physical items in cart', async () => {
                    jest.spyOn(store.getState().cart, 'getCart')
                        .mockReturnValue({
                        ...store.getState().cart.getCart(),
                        lineItems: {physicalItems: []},
                    });

                    await strategy.initialize(options);
                    const response = await strategy.execute(getStripeUPEOrderRequestBodyMock());

                    expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                    expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                    expect(response).toBe(store.getState());
                });

                it('with a guest user and without shipping and billing address', async () => {
                    jest.spyOn(store.getState().customer, 'getCustomer')
                        .mockReturnValue(undefined);
                    jest.spyOn(store.getState().shippingAddress, 'getShippingAddress')
                        .mockReturnValue(undefined);
                    jest.spyOn(store.getState().billingAddress, 'getBillingAddress')
                        .mockReturnValue(undefined);

                    await strategy.initialize(options);
                    const response = await strategy.execute(getStripeUPEOrderRequestBodyMock());

                    expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                    expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                    expect(response).toBe(store.getState());
                });

                it('fires additional action outside of bigcommerce', async () => {
                    const errorResponse = new RequestError(getResponse({
                        ...getErrorPaymentResponseBody(),
                        errors: [
                            { code: 'additional_action_required' },
                        ],
                        additional_action_required: {
                            type: 'redirect_to_url',
                            data: {
                                redirect_url: 'https://redirect-url.com',
                            },
                        },
                        status: 'error',
                    }));

                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

                    await strategy.initialize(options);

                    try {
                        await strategy.execute(getStripeUPEOrderRequestBodyMock());
                    } catch (error) {
                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                        expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalledTimes(2);
                        expect(stripeUPEJsMock.confirmPayment).not.toHaveBeenNthCalledWith(1,
                            expect.objectContaining({
                                confirmParams: {
                                    return_url: 'https://redirect-url.com',
                                },
                            })
                        );
                        expect(stripeUPEJsMock.confirmPayment).toHaveBeenNthCalledWith(2,
                            expect.objectContaining({
                                confirmParams: {
                                    return_url: 'https://redirect-url.com',
                                },
                            })
                        );
                    }
                });

                it('do not fire additional action because of missing url', async () => {
                    const errorResponse = new RequestError(getResponse({
                        ...getErrorPaymentResponseBody(),
                        errors: [
                            { code: 'additional_action_required' },
                        ],
                        additional_action_required: {
                            type: 'redirect_to_url',
                            data: {},
                        },
                        status: 'error',
                    }));

                    window.location.replace = jest.fn();

                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

                    await strategy.initialize(options);

                    try {
                        await strategy.execute(getStripeUPEOrderRequestBodyMock());
                    } catch (error) {
                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                        expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalledTimes(1);
                    }
                });

                it('fires unknown additional action', async () => {
                    const errorResponse = new RequestError(getResponse({
                        ...getErrorPaymentResponseBody(),
                        errors: [
                            { code: 'additional_action_required' },
                        ],
                        additional_action_required: {
                            type: 'unknown_action',
                        },
                        status: 'error',
                    }));

                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

                    await strategy.initialize(options);

                    try {
                        await strategy.execute(getStripeUPEOrderRequestBodyMock());
                    } catch (error) {
                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                    }
                });

                it('throws stripe error if empty payment intent is sent', async () => {
                    const requiredFieldErrorResponse = new RequestError(getResponse({
                        ...getErrorPaymentResponseBody(),
                        errors: [
                            { code: 'required_field' },
                        ],
                    }));
                    const stripeErrorMessage = 'Stripe error message.';

                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, requiredFieldErrorResponse)));

                    stripeUPEJsMock.confirmPayment = jest.fn(() => Promise.resolve({ error: { type: 'invalid_request_error', message: stripeErrorMessage }}));

                    await strategy.initialize(options);

                    await expect(strategy.execute(getStripeUPEOrderRequestBodyMock())).rejects.toThrow(stripeErrorMessage);

                    expect(orderActionCreator.submitOrder).not.toHaveBeenCalled();
                    expect(paymentActionCreator.submitPayment).not.toHaveBeenCalledTimes(1);
                    expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalled();
                });

                it('throws unknown error', async () => {
                    const unexpectedError = {
                        message: 'An unexpected error has occurred.',
                    };

                    const errorResponse = new RequestError(getResponse({
                        ...getErrorPaymentResponseBody(),
                        errors: [
                            { code: 'unknown_error' },
                        ],
                        status: 'error',
                    }));

                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

                    await strategy.initialize(options);

                    try {
                        await strategy.execute(getStripeUPEOrderRequestBodyMock());
                    } catch (error) {
                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                        expect(error.message).toEqual(unexpectedError && unexpectedError.message);
                    }
                });

                it('throws an error that is not a RequestError', async () => {
                    const errorResponse = new Error();

                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

                    await strategy.initialize(options);

                    await expect(strategy.execute(getStripeUPEOrderRequestBodyMock())).rejects.toThrow(Error);

                    expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                });

                it('throws stripe error when auth fails', async () => {
                    const threeDSecureRequiredErrorResponse = new RequestError(getResponse({
                        ...getErrorPaymentResponseBody(),
                        errors: [
                            { code: 'three_d_secure_required' },
                        ],
                        three_ds_result: {
                            token: 'token',
                        },
                    }));
                    const requiredFieldErrorResponse = new RequestError(getResponse({
                        ...getErrorPaymentResponseBody(),
                        errors: [
                            { code: 'required_field' },
                        ],
                    }));
                    const stripeErrorMessage = 'Stripe error message.';

                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, threeDSecureRequiredErrorResponse)))
                        .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, requiredFieldErrorResponse)));

                    stripeUPEJsMock.confirmPayment = jest.fn(() => Promise.resolve({ error: { type: 'card_error', payment_intent: { last_payment_error: { message : stripeErrorMessage } }, message: stripeErrorMessage } }));

                    await strategy.initialize(options);

                    await expect(strategy.execute(getStripeUPEOrderRequestBodyVaultMock())).rejects.toThrow(stripeErrorMessage);

                    expect(orderActionCreator.submitOrder).not.toHaveBeenCalled();
                    expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalled();
                });

                it('throws unknown error when using stored instrument', async () => {
                    const errorResponse = new RequestError(getResponse(getErrorPaymentResponseBody()));

                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

                    await strategy.initialize(options);
                    const promise = strategy.execute(getStripeUPEOrderRequestBodyVaultMock());

                    await expect(promise).rejects.toThrow(errorResponse);

                    expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                    expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalled();
                });
            });

            describe('with SOFORT', () => {
                let elements: StripeElements;
                let element: StripeElement;
                const elementsOptions: StripeElementsOptions = {clientSecret: 'myToken'};
                const method = StripePaymentMethodType.SOFORT;

                beforeEach(() => {
                    elements = stripeUPEJsMock.elements(elementsOptions);
                    element = elements.create('payment');
                    options = getStripeUPEInitializeOptionsMock(method);
                    paymentMethodMock = { ...getStripeUPE(method), clientToken: 'myToken' };
                    loadPaymentMethodAction = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, { methodId: `stripeupe?method=${paymentMethodMock.id }`}));

                    stripeUPEJsMock.confirmPayment = jest.fn(
                        () => Promise.resolve(getConfirmPaymentResponse())
                    );

                    jest.spyOn(stripeUPEJsMock, 'elements')
                        .mockReturnValue(elements);
                    jest.spyOn(stripeUPEJsMock.elements(elementsOptions), 'create')
                        .mockReturnValue(element);
                    jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
                        .mockReturnValue(loadPaymentMethodAction);
                    jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                        .mockReturnValue(getStripeUPE(method));
                });

                it('fires additional action outside of bigcommerce', async () => {
                    const errorResponse = new RequestError(getResponse({
                        ...getErrorPaymentResponseBody(),
                        errors: [
                            { code: 'additional_action_required' },
                        ],
                        additional_action_required: {
                            type: 'redirect_to_url',
                            data: {
                                redirect_url: 'https://redirect-url.com',
                            },
                        },
                        status: 'error',
                    }));

                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

                    await strategy.initialize(options);

                    try {
                        await strategy.execute(getStripeUPEOrderRequestBodyMock(method));
                    } catch (error) {
                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                        expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalledTimes(1);
                        expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalledWith(
                            expect.objectContaining({
                                confirmParams: {
                                    return_url: 'https://redirect-url.com',
                                },
                            })
                        );
                    }
                });

                it('do not fire additional action because of missing url', async () => {
                    const errorResponse = new RequestError(getResponse({
                        ...getErrorPaymentResponseBody(),
                        errors: [
                            { code: 'additional_action_required' },
                        ],
                        additional_action_required: {
                            type: 'redirect_to_url',
                            data: {},
                        },
                        status: 'error',
                    }));

                    window.location.replace = jest.fn();

                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

                    await strategy.initialize(options);

                    try {
                        await strategy.execute(getStripeUPEOrderRequestBodyMock(method));
                    } catch (error) {
                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                        expect(stripeUPEJsMock.confirmPayment).not.toHaveBeenCalled();
                    }
                });
            });

            it('throws error when clientToken is undefined', async () => {
                paymentMethodMock.clientToken = undefined;

                const promise =  strategy.initialize(options);

                await expect(promise).rejects.toThrow(new MissingDataError(MissingDataErrorType.MissingPaymentMethod));

                expect(stripeUPEJsMock.confirmPayment).not.toHaveBeenCalled();
                expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
            });
        });

        it('throws an error when payment is not set properly into payload', () => {
            const payload = {
                payment: undefined,
            };

            return expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);
        });

        it('throws an error when payment.paymentData is not set properly into payload', () => {
            const payload = {
                payment: {
                    methodId: 'stripeupe',
                    paymentData: undefined,
                },
            };

            return expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);
        });
    });

    describe('#finalize()', () => {
        it('throws an error to inform that order finalization is not required', async () => {
            const promise = strategy.finalize();

            return expect(promise).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        let cardElement: StripeElement;
        const elementsOptions: StripeElementsOptions = {clientSecret: 'myToken'};
        const stripeUPEJsMock = getStripeUPEJsMock();

        beforeEach(() => {
            const elements = stripeUPEJsMock.elements(elementsOptions);
            cardElement = elements.create('payment');

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(getStripeUPE());
            jest.spyOn(stripeScriptLoader, 'load')
                .mockReturnValue(Promise.resolve(stripeUPEJsMock));
            jest.spyOn(stripeUPEJsMock, 'elements')
                .mockReturnValue(elements);
            jest.spyOn(stripeUPEJsMock.elements(elementsOptions), 'create')
                .mockReturnValue(cardElement);

        });

        it('deinitializes stripe payment strategy', async () => {
            jest.spyOn(stripeUPEJsMock.elements(elementsOptions), 'getElement')
                .mockReturnValue(cardElement);
            await strategy.initialize(getStripeUPEInitializeOptionsMock());
            const promise = strategy.deinitialize();

            await expect(promise).resolves.toBe(store.getState());

            expect(cardElement.unmount).toHaveBeenCalledTimes(1);
        });

        it('validates if stripe element still exists before trying to unmount it', async () => {
            jest.spyOn(stripeUPEJsMock.elements(elementsOptions), 'getElement')
                .mockReturnValue(undefined)
                .mockReturnValueOnce(cardElement);
            await strategy.initialize(getStripeUPEInitializeOptionsMock());
            await strategy.deinitialize();
            const promise = strategy.deinitialize();

            await expect(promise).resolves.toBe(store.getState());

            expect(cardElement.unmount).toHaveBeenCalledTimes(1);
        });
    });
});
