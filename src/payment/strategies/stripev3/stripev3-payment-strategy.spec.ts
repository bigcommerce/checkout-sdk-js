import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of, Observable } from 'rxjs';

import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { createCheckoutStore, Checkout, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckout, getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, RequestError } from '../../../common/error/errors';
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
import { getStripeV3 } from '../../payment-methods.mock';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { getErrorPaymentResponseBody } from '../../payments.mock';

import { StripeElement, StripeElements, StripeElementType, StripePaymentMethodType, StripeV3Client } from './stripev3';
import StripeV3PaymentStrategy from './stripev3-payment-strategy';
import StripeV3ScriptLoader from './stripev3-script-loader';
import { getConfirmPaymentResponse, getFailingStripeV3JsMock, getPaymentMethodResponse, getStripeBillingAddress, getStripeBillingAddressWithoutPhone, getStripePaymentMethodOptionsWithGuestUserWithoutAddress, getStripeV3InitializeOptionsMock, getStripeV3InitializeOptionsMockSingleElements, getStripeV3JsMock, getStripeV3OrderRequestBodyMock, getStripeV3OrderRequestBodyVaultMock, getWrongPaymentMethodResponse, getWrongPaymentResponse } from './stripev3.mock';

describe('StripeV3PaymentStrategy', () => {
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
    let strategy: StripeV3PaymentStrategy;
    let stripeScriptLoader: StripeV3ScriptLoader;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        const requestSender = createRequestSender();
        const paymentMethodRequestSender: PaymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
        const scriptLoader = createScriptLoader();

        paymentMethodActionCreator = new PaymentMethodActionCreator(paymentMethodRequestSender);

        orderRequestSender = new OrderRequestSender(createRequestSender());
        orderActionCreator = new OrderActionCreator(
            orderRequestSender,
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
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
        paymentMethodMock = { ...getStripeV3(), clientToken: 'myToken' };

        stripeScriptLoader = new StripeV3ScriptLoader(scriptLoader);
        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
        loadPaymentMethodAction = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, { methodId: `stripev3?method=${paymentMethodMock.id }`}));
        checkoutMock = getCheckout();

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

        strategy = new StripeV3PaymentStrategy(
            store,
            paymentMethodActionCreator,
            paymentActionCreator,
            orderActionCreator,
            stripeScriptLoader,
            storeCreditActionCreator,
            'en_US'
        );
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

            await expect(strategy.initialize(options)).resolves.toBe(store.getState());

            expect(stripeScriptLoader.load).toHaveBeenCalled();
        });

        it('loads a single instance of StripeV3Client and StripeElements', async () => {
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await expect(strategy.initialize(options)).resolves.toBe(store.getState());
            await expect(strategy.initialize(options)).resolves.toBe(store.getState());

            expect(stripeScriptLoader.load).toHaveBeenCalledTimes(1);
            expect(stripeV3JsMock.elements).toHaveBeenCalledTimes(1);
        });

        it('does not load stripe V3 if initialization options are not provided', () => {
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            options.stripev3 = undefined;

            const promise = strategy.initialize(options);

            return expect(promise).rejects.toThrow(InvalidArgumentError);
        });

        describe('mounts single payment element', () => {
            beforeEach(() => {
                options = getStripeV3InitializeOptionsMock();

                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                    .mockReturnValue(getStripeV3());
            });

            it('does not mount a stripe alipay element', async () => {
                const { create, getElement } = stripeV3JsMock.elements();
                stripeV3JsMock.elements = jest.fn().mockReturnValue({ create, getElement });

                jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

                await strategy.initialize(getStripeV3InitializeOptionsMock((StripeElementType.Alipay)));

                expect(create).not.toHaveBeenCalledWith('alipay');
            });

            it('mounts a previously created stripe element', async () => {
                const { create: getElement, getElement: create } = stripeV3JsMock.elements();
                stripeV3JsMock.elements = jest.fn().mockReturnValue({ create, getElement });

                jest.spyOn(stripeScriptLoader, 'load')
                    .mockReturnValue(Promise.resolve(stripeV3JsMock));

                await strategy.initialize(options);

                expect(getElement).toHaveBeenCalledWith('card');
                expect(create).not.toHaveBeenCalled();
            });

            it('fails mounting a stripe card element', async () => {
                stripeV3JsMock = getFailingStripeV3JsMock();
                const { create, getElement } = stripeV3JsMock.elements();
                stripeV3JsMock.elements = jest.fn().mockReturnValue({ create, getElement });

                jest.spyOn(stripeScriptLoader, 'load')
                    .mockReturnValue(Promise.resolve(stripeV3JsMock));

                await expect(strategy.initialize(options))
                    .rejects.toThrow(InvalidArgumentError);
            });

            it('fails mounting a stripe sepa element', async () => {
                stripeV3JsMock = getFailingStripeV3JsMock();
                const { create, getElement } = stripeV3JsMock.elements();
                stripeV3JsMock.elements = jest.fn().mockReturnValue({ create, getElement });

                jest.spyOn(stripeScriptLoader, 'load')
                    .mockReturnValue(Promise.resolve(stripeV3JsMock));

                options = getStripeV3InitializeOptionsMock(StripeElementType.Sepa);
                await expect(strategy.initialize(options))
                    .rejects.toThrow(InvalidArgumentError);
            });
        });

        it('fails mounting individual payment elements', async () => {
            options = getStripeV3InitializeOptionsMockSingleElements();
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(getStripeV3('card', true));

            stripeV3JsMock = getFailingStripeV3JsMock();
            const { create, getElement } = stripeV3JsMock.elements();
            stripeV3JsMock.elements = jest.fn().mockReturnValue({ create, getElement });

            jest.spyOn(stripeScriptLoader, 'load')
                .mockReturnValue(Promise.resolve(stripeV3JsMock));

            await expect(strategy.initialize(options))
                .rejects.toThrow(InvalidArgumentError);
        });
    });

    describe('#execute()', () => {
        let options: PaymentInitializeOptions;
        let stripeV3JsMock: StripeV3Client;

        beforeEach(() => {
            options = getStripeV3InitializeOptionsMock();
            stripeV3JsMock = getStripeV3JsMock();

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(getStripeV3());
        });

        describe('creates the order and submit payment', () => {
            beforeEach(() => {
                jest.spyOn(stripeScriptLoader, 'load')
                     .mockReturnValue(Promise.resolve(stripeV3JsMock));
            });

            it('with a stored instrument passing on the "make default" flag', async () => {
                await strategy.initialize(options);

                stripeV3JsMock.confirmCardPayment = jest.fn(
                    () => Promise.resolve(getConfirmPaymentResponse())
                );

                await strategy.execute(getStripeV3OrderRequestBodyVaultMock(StripeElementType.CreditCard, true));

                expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        paymentData: expect.objectContaining({
                            formattedPayload: {
                                bigpay_token: {
                                    token: 'token',
                                },
                                confirm: false,
                                credit_card_number_confirmation: undefined,
                                verification_value: undefined,
                            },
                            shouldSetAsDefaultInstrument: true,
                        }),
                    })
                );
            });

            describe('with card', () => {
                let elements: StripeElements;
                let cardElement: StripeElement;

                beforeEach(() => {
                    elements = stripeV3JsMock.elements();
                    cardElement = elements.create(StripeElementType.CreditCard, {});

                    stripeV3JsMock.confirmCardPayment = jest.fn(
                        () => Promise.resolve(getConfirmPaymentResponse())
                    );

                    stripeV3JsMock.createPaymentMethod = jest.fn(
                        () => Promise.resolve(getPaymentMethodResponse())
                    );

                    jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
                    jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
                });

                describe('with both shipping and billing address', () => {
                    beforeEach(() => {
                        jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(getShippingAddress());
                        jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(getBillingAddress());
                    });

                    it('with a signed user', async () => {
                        await strategy.initialize(options);
                        const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

                        expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith(
                            {
                                type: StripePaymentMethodType.CreditCard,
                                card: cardElement,
                                billing_details: getStripeBillingAddress(),
                            }
                        );
                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                        expect(response).toBe(store.getState());
                    });

                    it('with a guest user', async () => {
                        jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(undefined);

                        await strategy.initialize(options);
                        const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

                        expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith(
                            {
                                type: StripePaymentMethodType.CreditCard,
                                card: cardElement,
                                billing_details: getStripeBillingAddress(),
                            }
                        );
                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                        expect(response).toBe(store.getState());
                    });
                });

                it('with store credit', async () => {
                    checkoutMock.isStoreCreditApplied = true;

                    await strategy.initialize(options);
                    const promise = await strategy.execute(getStripeV3OrderRequestBodyMock());

                    expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                    expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                    expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(true);
                    expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                    expect(promise).toBe(store.getState());
                });

                it('passing on the "save card" flag', async () => {
                    await strategy.initialize(options);
                    const response = await strategy.execute(getStripeV3OrderRequestBodyMock(StripeElementType.CreditCard, true));

                    expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith(
                        {
                            type: StripePaymentMethodType.CreditCard,
                            card: cardElement,
                            billing_details: getStripeBillingAddress(),
                        }
                    );
                    expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                    expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                    expect(response).toBe(store.getState());
                });

                it('with a signed user without phone number', async () => {
                    const customer = getCustomer();
                    customer.addresses[0].phone = '';

                    jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(customer);
                    jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue({
                        ...getBillingAddress(),
                        phone: '',
                    });

                    await strategy.initialize(options);
                    const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

                    expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith(
                        {
                            type: StripePaymentMethodType.CreditCard,
                            card: cardElement,
                            billing_details: getStripeBillingAddressWithoutPhone(),
                        }
                    );
                    expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                    expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                    expect(response).toBe(store.getState());
                });

                it('with a guest user without phone number', async () => {
                    jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(undefined);
                    jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue({
                        ...getBillingAddress(),
                        phone: '',
                    });

                    await strategy.initialize(options);
                    const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

                    expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith(
                        {
                            type: StripePaymentMethodType.CreditCard,
                            card: cardElement,
                            billing_details: getStripeBillingAddressWithoutPhone(),
                        }
                    );
                    expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                    expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                    expect(response).toBe(store.getState());
                });

                it('without shipping address if there is not physical items in cart', async () => {
                    jest.spyOn(store.getState().cart, 'getCart').mockReturnValue({
                        ...store.getState().cart.getCart(),
                        lineItems: {physicalItems: []},
                    });

                    await strategy.initialize(options);
                    const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

                    expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith(
                        {
                            type: StripePaymentMethodType.CreditCard,
                            card: cardElement,
                            billing_details: getStripeBillingAddress(),
                        }
                    );
                    expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                    expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                    expect(response).toBe(store.getState());
                });

                it('with a guest user and without shipping and billing address', async () => {
                    jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(undefined);
                    jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(undefined);
                    jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(undefined);

                    await strategy.initialize(options);
                    const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

                    expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith(
                        {
                            type: StripePaymentMethodType.CreditCard,
                            card: cardElement,
                            ...getStripePaymentMethodOptionsWithGuestUserWithoutAddress(),
                        }
                    );
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
                        },
                        status: 'error',
                    }));

                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

                    await strategy.initialize(options);

                    try {
                        await strategy.execute(getStripeV3OrderRequestBodyMock());
                    } catch (error) {
                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                        expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
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
                        await strategy.execute(getStripeV3OrderRequestBodyMock());
                    } catch (error) {
                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                        expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
                    }
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
                        await strategy.execute(getStripeV3OrderRequestBodyMock());
                    } catch (error) {
                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                        expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
                        expect(error.message).toEqual(unexpectedError && unexpectedError.message);
                    }
                });

                it('throws when stored instrument requires SCA and then shopper successfully authenticates', async () => {
                    const errorResponse = new RequestError(getResponse({
                        ...getErrorPaymentResponseBody(),
                        errors: [
                            {code: 'three_d_secure_required'},
                        ],
                        three_ds_result: {
                            token: 'token',
                        },
                        status: 'error',
                    }));

                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

                    stripeV3JsMock.handleCardAction = jest.fn(
                        () => Promise.resolve(getConfirmPaymentResponse())
                    );

                    await strategy.initialize(options);
                    await strategy.execute(getStripeV3OrderRequestBodyVaultMock());

                    expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(2);
                    expect(stripeV3JsMock.handleCardAction).toHaveBeenCalled();
                });

                it('throws unknown error when using stored instrument', async () => {
                    const errorResponse = new RequestError(getResponse(getErrorPaymentResponseBody()));

                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

                    await strategy.initialize(options);
                    const promise = strategy.execute(getStripeV3OrderRequestBodyVaultMock());

                    await expect(promise).rejects.toThrow(errorResponse);

                    expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                    expect(stripeV3JsMock.confirmCardPayment).not.toHaveBeenCalled();
                });

                it('throws an error when paymentIntent.id is not set properly into payload and is Vaulted', async () => {
                    const errorResponse = new MissingDataError(MissingDataErrorType.MissingPaymentToken);

                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

                    stripeV3JsMock.confirmCardPayment = jest.fn(
                        () => Promise.resolve(getWrongPaymentResponse())
                    );

                    await strategy.initialize(options);

                    const promise = strategy.execute(getStripeV3OrderRequestBodyVaultMock());

                    await expect(promise).rejects.toThrow(errorResponse);

                    expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                    expect(stripeV3JsMock.confirmCardPayment).not.toHaveBeenCalled();
                });

                it('throws an error when paymentIntent.id is not set properly into payload and is CreditCard', async () => {
                    const errorResponse = new MissingDataError(MissingDataErrorType.MissingPaymentToken);

                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

                    stripeV3JsMock.createPaymentMethod = jest.fn(
                        () => Promise.resolve(getWrongPaymentMethodResponse())
                    );

                    await strategy.initialize(options);

                    const promise = strategy.execute(getStripeV3OrderRequestBodyMock());

                    await expect(promise).rejects.toThrow(errorResponse);

                    expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                    expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
                    expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledTimes(1);
                });

                describe('with individual payment elements', () => {
                    beforeEach(() => {
                        options = getStripeV3InitializeOptionsMockSingleElements(true);
                        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                            .mockReturnValue(getStripeV3('card', true));
                        jest.spyOn(stripeScriptLoader, 'load')
                            .mockReturnValue(Promise.resolve(stripeV3JsMock));
                    });

                    it('without zipcode', async () => {
                        options = getStripeV3InitializeOptionsMockSingleElements();

                        await strategy.initialize(options);
                        const promise = await strategy.execute(getStripeV3OrderRequestBodyMock());

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                        expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                        expect(promise).toBe(store.getState());
                    });

                    describe('with zipcode', () => {
                        beforeEach(() => {
                            options = getStripeV3InitializeOptionsMockSingleElements(true);
                            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(getBillingAddress());
                        });

                        it('with valid input field', async () => {
                            let container: HTMLDivElement;
                            container = document.createElement('input');
                            container.setAttribute('id', 'stripe-postal-code-component-field');
                            container.setAttribute('value', '90210');
                            document.body.appendChild(container);

                            await strategy.initialize(options);
                            const promise = await strategy.execute(getStripeV3OrderRequestBodyMock());

                            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                            expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
                            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                            expect(promise).toBe(store.getState());
                            document.body.removeChild(container);
                        });

                        it('with invalid container', async () => {
                            await strategy.initialize(options);
                            const promise = await strategy.execute(getStripeV3OrderRequestBodyMock());

                            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                            expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
                            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                            expect(promise).toBe(store.getState());
                        });
                    });
                });
            });

            it('with alipay', async () => {
                paymentMethodMock = { ...getStripeV3(StripeElementType.Alipay), clientToken: 'myToken' };
                loadPaymentMethodAction = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, { methodId: `stripev3?method=${paymentMethodMock.id }`}));
                jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
                    .mockReturnValue(loadPaymentMethodAction);

                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                    .mockReturnValue(getStripeV3(StripeElementType.Alipay));

                options = getStripeV3InitializeOptionsMock(StripeElementType.Alipay);
                stripeV3JsMock.confirmAlipayPayment = jest.fn(
                    () => Promise.resolve(getConfirmPaymentResponse())
                );

                await strategy.initialize(options);
                const response = await strategy.execute(getStripeV3OrderRequestBodyMock(StripeElementType.Alipay));

                expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                expect(stripeV3JsMock.confirmAlipayPayment).toHaveBeenCalled();
                expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                expect(response).toBe(store.getState());
            });

            it('with ideal', async () => {
                paymentMethodMock = { ...getStripeV3(StripeElementType.iDEAL), clientToken: 'myToken' };
                loadPaymentMethodAction = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, { methodId: `stripev3?method=${paymentMethodMock.id }`}));
                jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
                    .mockReturnValue(loadPaymentMethodAction);

                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                    .mockReturnValue(getStripeV3(StripeElementType.iDEAL));

                options = getStripeV3InitializeOptionsMock(StripeElementType.iDEAL);
                stripeV3JsMock.confirmIdealPayment = jest.fn(
                    () => Promise.resolve(getConfirmPaymentResponse())
                );

                await strategy.initialize(options);
                const response = await strategy.execute(getStripeV3OrderRequestBodyMock(StripeElementType.iDEAL));

                expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                expect(stripeV3JsMock.confirmIdealPayment).toHaveBeenCalled();
                expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                expect(response).toBe(store.getState());
            });

            it('with SEPA', async () => {
                paymentMethodMock = { ...getStripeV3(StripeElementType.Sepa), clientToken: 'myToken' };
                loadPaymentMethodAction = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, { methodId: `stripev3?method=${paymentMethodMock.id }`}));
                jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
                    .mockReturnValue(loadPaymentMethodAction);

                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                    .mockReturnValue(getStripeV3(StripeElementType.iDEAL));

                options = getStripeV3InitializeOptionsMock(StripeElementType.Sepa);
                stripeV3JsMock.confirmSepaDebitPayment = jest.fn(
                    () => Promise.resolve(getConfirmPaymentResponse())
                );

                await strategy.initialize(options);
                const response = await strategy.execute(getStripeV3OrderRequestBodyMock(StripeElementType.Sepa));

                expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                expect(stripeV3JsMock.confirmSepaDebitPayment).toHaveBeenCalled();
                expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                expect(response).toBe(store.getState());
            });

            it('throws error when clientToken is undefined', async () => {
                paymentMethodMock.clientToken = undefined;

                await strategy.initialize(options);
                const promise = strategy.execute(getStripeV3OrderRequestBodyMock());

                await expect(promise).rejects.toThrow(new MissingDataError(MissingDataErrorType.MissingPaymentMethod));

                expect(stripeV3JsMock.confirmCardPayment).not.toHaveBeenCalled();
                expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
            });

            describe('throws error while calling handleCardPayment', () => {
                const stripeError = {
                    error: {
                        message: 'stripe error',
                    },
                };

                beforeEach(() => {
                    stripeV3JsMock.createPaymentMethod = jest.fn(
                        () => Promise.resolve(stripeError));

                    stripeV3JsMock.handleCardAction = jest.fn(
                        () => Promise.resolve(stripeError));
                });

                it('when stored instrument requires SCA and then an error occurs', async () => {
                    const errorResponse = new RequestError(getResponse({
                        ...getErrorPaymentResponseBody(),
                        errors: [
                            {code: 'three_d_secure_required'},
                        ],
                        three_ds_result: {
                            token: 'token',
                        },
                        status: 'error',
                    }));

                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

                    await strategy.initialize(options);

                    try {
                        await strategy.execute(getStripeV3OrderRequestBodyVaultMock());
                    } catch (error) {
                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                        expect(stripeV3JsMock.handleCardAction).toHaveBeenCalled();
                        expect(error.message).toEqual(stripeError.error && stripeError.error.message);
                    }
                });

                it('throws an error handleCardPayment', async () => {
                    await strategy.initialize(options);

                    try {
                        await strategy.execute(getStripeV3OrderRequestBodyMock());
                    } catch (error) {
                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).not.toBeCalled();
                        expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
                        expect(error.message).toEqual(stripeError.error && stripeError.error.message);
                    }
                });
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
                    methodId: 'stripev3',
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

        beforeEach(() => {
            const stripeV3JsMock = getStripeV3JsMock();
            const elements = stripeV3JsMock.elements();
            cardElement = elements.create(StripeElementType.CreditCard, {});

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(getStripeV3());
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);

        });

        it('deinitializes stripe payment strategy', async () => {
            await strategy.initialize(getStripeV3InitializeOptionsMock());
            const promise = strategy.deinitialize();

            await expect(promise).resolves.toBe(store.getState());

            expect(cardElement.unmount).toHaveBeenCalledTimes(1);
        });

        it('validates is stripe element still exists before trying to unmount it', async () => {
            await strategy.initialize(getStripeV3InitializeOptionsMock());
            await strategy.deinitialize();
            const promise = strategy.deinitialize();

            await expect(promise).resolves.toBe(store.getState());

            expect(cardElement.unmount).toHaveBeenCalledTimes(1);
        });
    });
});
