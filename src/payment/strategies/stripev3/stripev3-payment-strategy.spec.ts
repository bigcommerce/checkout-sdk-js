import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of, Observable } from 'rxjs';

import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { getCustomer } from '../../../customer/customers.mock';
import { FinalizeOrderAction, OrderActionCreator, OrderActionType, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { LoadPaymentMethodAction, PaymentInitializeOptions, PaymentMethodActionType, PaymentMethodRequestSender, PaymentRequestSender } from '../../../payment';
import { getShippingAddress } from '../../../shipping/shipping-addresses.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { getStripeV3 } from '../../payment-methods.mock';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { getErrorPaymentResponseBody } from '../../payments.mock';

import { StripeElement, StripeElementType, StripeV3Client } from './stripev3';
import StripeV3PaymentStrategy from './stripev3-payment-strategy';
import StripeV3ScriptLoader from './stripev3-script-loader';
import { getConfirmPaymentResponse, getFailingStripeV3JsMock, getStripeBillingAddress, getStripeBillingAddressWithoutPhone, getStripePaymentMethodOptionsWithGuestUserWithoutAddress, getStripeShippingAddress, getStripeShippingAddressGuestUserWithoutAddress, getStripeV3InitializeOptionsMock, getStripeV3JsMock, getStripeV3OrderRequestBodyMock, getStripeV3OrderRequestBodyVIMock } from './stripev3.mock';

describe('StripeV3PaymentStrategy', () => {
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let loadPaymentMethodAction: Observable<LoadPaymentMethodAction>;
    let orderActionCreator: OrderActionCreator;
    let orderRequestSender: OrderRequestSender;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let store: CheckoutStore;
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

        paymentMethodMock = { ...getStripeV3(), clientToken: 'myToken' };

        stripeScriptLoader = new StripeV3ScriptLoader(scriptLoader);
        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
        loadPaymentMethodAction = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, { methodId: `stripev3?method=${paymentMethodMock.id }`}));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        jest.spyOn(orderActionCreator, 'finalizeOrder')
            .mockReturnValue(finalizeOrderAction);

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(loadPaymentMethodAction);

        strategy = new StripeV3PaymentStrategy(
            store,
            paymentMethodActionCreator,
            paymentActionCreator,
            orderActionCreator,
            stripeScriptLoader,
            'en_US'
        );
    });

    describe('#initialize()', () => {
        let options: PaymentInitializeOptions;
        let stripeV3JsMock: StripeV3Client;

        beforeEach(() => {
            options = getStripeV3InitializeOptionsMock();
            stripeV3JsMock = getStripeV3JsMock();

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(getStripeV3());
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

        it('does not mount a stripe alipay element', async () => {
            const { create, getElement } = stripeV3JsMock.elements();
            stripeV3JsMock.elements = jest.fn().mockReturnValue({ create, getElement });

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(getStripeV3InitializeOptionsMock((StripeElementType.Alipay)));

            expect(create).not.toHaveBeenCalledWith('alipay');
        });

        it('mounts a stripe card element', async () => {
            const { create, getElement } = stripeV3JsMock.elements();
            stripeV3JsMock.elements = jest.fn().mockReturnValue({ create, getElement });

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(options);

            expect(create).toHaveBeenCalledWith('card', expect.anything());
        });

        it('mounts a stripe ideal element', async () => {
            const { create, getElement } = stripeV3JsMock.elements();
            stripeV3JsMock.elements = jest.fn().mockReturnValue({ create, getElement });

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(getStripeV3InitializeOptionsMock(StripeElementType.iDEAL));

            expect(create).toHaveBeenCalledWith('idealBank', expect.anything());
        });

        it('mounts a stripe Sepa element', async () => {
            const { create, getElement } = stripeV3JsMock.elements();
            stripeV3JsMock.elements = jest.fn().mockReturnValue({ create, getElement });

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(getStripeV3InitializeOptionsMock(StripeElementType.Sepa));

            expect(create).toHaveBeenCalledWith('iban', expect.anything());
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

        it('throws an error when handleCardPayment in 3ds instrument flow', async () => {
            const errorResponse = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    token: 'token',
                },
                status: 'error',
            }));

            const payload = {
                payment: {
                    methodId: 'card',
                    paymentData: {
                        instrumentId: 'token',
                    },
                },
            };

            const stripeError = {
                error: {
                    message: 'stripe error',
                },
            };

            stripeV3JsMock.confirmCardPayment = jest.fn(
                () => Promise.resolve(stripeError));

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

            await strategy.initialize(options);
            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalled();
                expect(error.message).toEqual(stripeError.error && stripeError.error.message);
            }
        });

        it('passes on the "make default" flag when submitting payment with a stored instrument', async () => {
            const payload = {
                payment: {
                    methodId: 'stripev3',
                    paymentData: {
                        instrumentId: 'token',
                        shouldSetAsDefaultInstrument: true,
                    },
                },
            };

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(options);
            await strategy.execute(payload);

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    paymentData: expect.objectContaining({
                        shouldSetAsDefaultInstrument: true,
                    }),
                })
            );
        });

        it('creates the order and submit payment with alipay', async () => {
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

            jest.spyOn(stripeScriptLoader, 'load')
                .mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock(StripeElementType.Alipay));

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(stripeV3JsMock.confirmAlipayPayment).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('creates the order and submit payment with card', async () => {
            paymentMethodMock = { ...getStripeV3('card'), clientToken: 'myToken' };
            loadPaymentMethodAction = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, { methodId: `stripev3?method=${paymentMethodMock.id }`}));
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
                .mockReturnValue(loadPaymentMethodAction);
            stripeV3JsMock.confirmCardPayment = jest.fn(
                () => Promise.resolve(getConfirmPaymentResponse())
            );

            jest.spyOn(stripeScriptLoader, 'load')
                .mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(options);
            const promise = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(promise).toBe(store.getState());
        });

        it('creates the order and submit payment with ideal', async () => {
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

            jest.spyOn(stripeScriptLoader, 'load')
                .mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock(StripeElementType.iDEAL));

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(stripeV3JsMock.confirmIdealPayment).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('creates the order and submit payment with SEPA', async () => {
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

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock(StripeElementType.Sepa));

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(stripeV3JsMock.confirmSepaDebitPayment).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('creates the order and submit payment when an instrument is being used', async () => {
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyVIMock());

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(stripeV3JsMock.confirmCardPayment).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
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

        it('throws an error when clientToken is undefined', async () => {
            paymentMethodMock.clientToken = undefined;

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(options);
            const promise = strategy.execute(getStripeV3OrderRequestBodyMock());

            await expect(promise).rejects.toThrow(new MissingDataError(MissingDataErrorType.MissingPaymentMethod));

            expect(stripeV3JsMock.confirmCardPayment).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('throws an error when submit payment fails in 3DS instrument flow', async () => {
            const errorResponse = new RequestError(getResponse(getErrorPaymentResponseBody()));

            stripeV3JsMock.confirmCardPayment = jest.fn(
                () => Promise.resolve(getConfirmPaymentResponse())
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

            await strategy.initialize(options);
            const promise = strategy.execute(getStripeV3OrderRequestBodyVIMock());

            await expect(promise).rejects.toThrow(errorResponse);

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
            expect(stripeV3JsMock.confirmCardPayment).not.toHaveBeenCalled();
        });

        it('creates the order and submit payment with a signed user', async () => {
            const elements = stripeV3JsMock.elements();
            const cardElement = elements.create(StripeElementType.CreditCard, {});

            stripeV3JsMock.confirmCardPayment = jest.fn(
                () => Promise.resolve(getConfirmPaymentResponse())
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(getShippingAddress());
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(getBillingAddress());

            await strategy.initialize(options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalledWith(
                'myToken',
                {
                    shipping: getStripeShippingAddress(),
                    payment_method: {
                        card: cardElement,
                        billing_details: getStripeBillingAddress(),
                    },
                }
            );
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('creates the order and submit payment with a signed user without a phone number provided', async () => {
            const elements = stripeV3JsMock.elements();
            const cardElement = elements.create(StripeElementType.CreditCard, {});

            const customer = getCustomer();
            customer.addresses[0].phone = '';

            stripeV3JsMock.confirmCardPayment = jest.fn(
                () => Promise.resolve(getConfirmPaymentResponse())
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(customer);
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue({ ...getBillingAddress(), phone: '' });

            await strategy.initialize(options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalledWith(
                'myToken',
                {
                    shipping: { ...getStripeShippingAddress(), phone: '' },
                    payment_method: {
                        card: cardElement,
                        billing_details: getStripeBillingAddressWithoutPhone(),
                    },
                }
            );
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('creates the order and submit payment with a guest user', async () => {
            const elements = stripeV3JsMock.elements();
            const cardElement = elements.create(StripeElementType.CreditCard, {});

            stripeV3JsMock.confirmCardPayment = jest.fn(
                () => Promise.resolve(getConfirmPaymentResponse())
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(undefined);
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(getShippingAddress());
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(getBillingAddress());

            await strategy.initialize(options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalledWith(
                'myToken',
                {
                    shipping: getStripeShippingAddress(),
                    payment_method: {
                        card: cardElement,
                        billing_details: getStripeBillingAddress(),
                    },
                }
            );
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('creates the order and submit payment with a guest user without a phone number provided', async () => {
            const elements = stripeV3JsMock.elements();
            const cardElement = elements.create(StripeElementType.CreditCard, {});

            stripeV3JsMock.confirmCardPayment = jest.fn(
                () => Promise.resolve(getConfirmPaymentResponse())
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(undefined);
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue({ ...getBillingAddress(), phone: '' });

            await strategy.initialize(options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalledWith(
                'myToken',
                {
                    shipping: getStripeShippingAddress(),
                    payment_method: {
                        card: cardElement,
                        billing_details: getStripeBillingAddressWithoutPhone(),
                    },
                }
            );
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('creates the order and submit payment without shipping address if there is not physical items in cart', async () => {
            const elements = stripeV3JsMock.elements();
            const cardElement = elements.create(StripeElementType.CreditCard, {});

            stripeV3JsMock.confirmCardPayment = jest.fn(
                () => Promise.resolve(getConfirmPaymentResponse())
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
            jest.spyOn(store.getState().cart, 'getCart').mockReturnValue({...store.getState().cart.getCart(), lineItems: {physicalItems: []}});

            await strategy.initialize(options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalledWith(
                'myToken',
                {
                    payment_method: {
                        card: cardElement,
                        billing_details: getStripeBillingAddress(),
                    },
                }
            );
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('creates the order and submit payment with a guest user and without shipping and billing address', async () => {
            const elements = stripeV3JsMock.elements();
            const cardElement = elements.create(StripeElementType.CreditCard, {});

            stripeV3JsMock.confirmCardPayment = jest.fn(
                () => Promise.resolve(getConfirmPaymentResponse())
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(undefined);
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(undefined);
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(undefined);

            await strategy.initialize(options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalledWith(
                'myToken',
                {
                    ...getStripeShippingAddressGuestUserWithoutAddress(),
                    payment_method: {
                        card: cardElement,
                        ...getStripePaymentMethodOptionsWithGuestUserWithoutAddress(),
                    },
                }
            );
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
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
