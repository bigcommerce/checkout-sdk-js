import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of, Observable } from 'rxjs';

import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { FinalizeOrderAction, OrderActionCreator, OrderActionType, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { LoadPaymentMethodAction, PaymentInitializeOptions, PaymentMethodActionType, PaymentMethodRequestSender, PaymentRequestSender } from '../../../payment';
import { getShippingAddress } from '../../../shipping/shipping-addresses.mock';
import { PaymentArgumentInvalidError, PaymentMethodFailedError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { getStripeV3 } from '../../payment-methods.mock';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { getErrorPaymentResponseBody } from '../../payments.mock';

import { StripeV3Client } from './stripev3';
import StripeV3PaymentStrategy from './stripev3-payment-strategy';
import StripeV3ScriptLoader from './stripev3-script-loader';
import { getConfirmCardPaymentResponse, getStripeCardPaymentOptionsWithGuestUser, getStripeCardPaymentOptionsWithGuestUserWithoutAddress, getStripeCardPaymentOptionsWithSignedUser, getStripePaymentMethodOptionsWithGuestUser, getStripePaymentMethodOptionsWithGuestUserWithoutAddress, getStripePaymentMethodOptionsWithSignedUser, getStripeV3InitializeOptionsMock, getStripeV3JsMock, getStripeV3OrderRequestBodyMock, getStripeV3OrderRequestBodySIMock, getStripeV3OrderRequestBodyVIMock } from './stripev3.mock';

describe('StripeV3PaymentStrategy', () => {
    let errorResponse3DS: RequestError;
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
            new PaymentRequestTransformer()
        );

        errorResponse3DS = new RequestError(getResponse({
            ...getErrorPaymentResponseBody(),
            errors: [
                { code: 'three_d_secure_required' },
            ],
            three_ds_result: {
                token: 'token',
            },
        }));

        paymentMethodMock = { ...getStripeV3(), clientToken: 'myToken' };

        stripeScriptLoader = new StripeV3ScriptLoader(scriptLoader);
        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
        loadPaymentMethodAction = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, { methodId: paymentMethodMock.id }));

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
            stripeScriptLoader
        );
    });

    describe('#initialize()', () => {
        let stripeV3Options: PaymentInitializeOptions;
        let stripeV3JsMock: StripeV3Client;

        beforeEach(() => {
            stripeV3Options = getStripeV3InitializeOptionsMock();
            stripeV3JsMock = getStripeV3JsMock();

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getStripeV3());
        });

        it('loads stripe v3 script', async () => {
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await expect(strategy.initialize(stripeV3Options)).resolves.toBe(store.getState());

            expect(stripeScriptLoader.load).toHaveBeenCalled();
        });

        it('loads a single instance of stripe v3 script', async () => {
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await expect(strategy.initialize(stripeV3Options)).resolves.toBe(store.getState());
            await expect(strategy.initialize(stripeV3Options)).resolves.toBe(store.getState());

            expect(stripeScriptLoader.load).toHaveBeenCalledTimes(1);
        });

        it('does not load stripe V3 if initialization options are not provided', () => {
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            stripeV3Options.stripev3 = undefined;

            const promise = strategy.initialize(stripeV3Options);

            return expect(promise).rejects.toThrow(InvalidArgumentError);
        });

        it('does not load stripe V3 if paymentMethod is not provided', () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(undefined);

            const promise = strategy.initialize(stripeV3Options);

            return expect(promise).rejects.toThrow(MissingDataError);
        });
    });

    describe('#execute()', () => {
        let stripeV3Options: PaymentInitializeOptions;
        let stripeV3JsMock: StripeV3Client;

        beforeEach(() => {
            stripeV3Options = getStripeV3InitializeOptionsMock();
            stripeV3JsMock = getStripeV3JsMock();
        });

        it('creates the order and submit payment', async () => {
            stripeV3JsMock.confirmCardPayment = jest.fn(
                () => Promise.resolve(getConfirmCardPaymentResponse())
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(stripeV3Options);
            const promise = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(promise).toBe(store.getState());
        });

        it('creates the order, submit payment and save the instrument', async () => {
            stripeV3JsMock.confirmCardPayment = jest.fn(
                () => Promise.resolve(getConfirmCardPaymentResponse())
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(stripeV3Options);
            const promise = await strategy.execute(getStripeV3OrderRequestBodySIMock());

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalledWith(
                'myToken',
                expect.objectContaining({ setup_future_usage: 'off_session' })
            );
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    paymentData: expect.objectContaining({ shouldSaveInstrument: true }),
                })
            );
            expect(promise).toBe(store.getState());
        });

        it('creates the order and submit payment when an instrument is being used', async () => {
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(stripeV3Options);
            const promise = await strategy.execute(getStripeV3OrderRequestBodyVIMock());

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(stripeV3JsMock.confirmCardPayment).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(promise).toBe(store.getState());
        });

        it('creates the order and submit payment when an instrument is being used and 3DS is required', async () => {
            stripeV3JsMock.confirmCardPayment = jest.fn(
                () => Promise.resolve(getConfirmCardPaymentResponse())
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse3DS)));

            await strategy.initialize(stripeV3Options);
            const promise = await strategy.execute(getStripeV3OrderRequestBodyVIMock());

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(2);
            expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalled();
            expect(promise).toBe(store.getState());
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

            await strategy.initialize(stripeV3Options);
            const promise = strategy.execute(getStripeV3OrderRequestBodyMock());

            await expect(promise).rejects.toThrow(new MissingDataError(MissingDataErrorType.MissingPaymentMethod));

            expect(stripeV3JsMock.confirmCardPayment).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('throws an error when the payment step of checkout has not been initialized', async () => {
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            const promise = strategy.execute(getStripeV3OrderRequestBodyMock());

            await expect(promise).rejects.toThrow(new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized));

            expect(stripeV3JsMock.confirmCardPayment).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('throws an error when confirmCardPayment fails', async () => {
            const stripeError = {
                error: {
                    message: 'stripe error',
                },
            };

            stripeV3JsMock.confirmCardPayment = jest.fn(
                () => Promise.resolve(stripeError)
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(stripeV3Options);
            const promise = strategy.execute(getStripeV3OrderRequestBodyMock());

            return expect(promise).rejects.toThrow(new PaymentMethodFailedError(stripeError.error.message));
        });

        it('throws an error when confirmCardPayment fails in 3DS instrument flow', async () => {
            const stripeError = {
                error: {
                    message: 'stripe error',
                },
            };

            stripeV3JsMock.confirmCardPayment = jest.fn(
                () => Promise.resolve(stripeError)
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse3DS)));

            await strategy.initialize(stripeV3Options);
            const promise = strategy.execute(getStripeV3OrderRequestBodyVIMock());

            await expect(promise).rejects.toThrow(new PaymentMethodFailedError(stripeError.error.message));

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
            expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalled();
        });

        it('throws an error when submit payment fails in 3DS instrument flow', async () => {
            const errorResponse = new RequestError(getResponse(getErrorPaymentResponseBody()));

            stripeV3JsMock.confirmCardPayment = jest.fn(
                () => Promise.resolve(getConfirmCardPaymentResponse())
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

            await strategy.initialize(stripeV3Options);
            const promise = strategy.execute(getStripeV3OrderRequestBodyVIMock());

            await expect(promise).rejects.toThrow(errorResponse);

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
            expect(stripeV3JsMock.confirmCardPayment).not.toHaveBeenCalled();
        });

        it('creates the order and submit payment with a signed user', async () => {
            const elements = stripeV3JsMock.elements();
            const cardElement = elements.create('card', {});

            stripeV3JsMock.confirmCardPayment = jest.fn(
                () => Promise.resolve(getConfirmCardPaymentResponse())
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(getShippingAddress());
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(getBillingAddress());

            await strategy.initialize(stripeV3Options);
            const promise = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalledWith(
                'myToken',
                {
                    ...getStripeCardPaymentOptionsWithSignedUser(),
                    payment_method: {
                        card: cardElement,
                        ...getStripePaymentMethodOptionsWithSignedUser(),
                    },
                }
            );
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(promise).toBe(store.getState());
        });

        it('creates the order and submit payment with a guest user', async () => {
            const elements = stripeV3JsMock.elements();
            const cardElement = elements.create('card', {});

            stripeV3JsMock.confirmCardPayment = jest.fn(
                () => Promise.resolve(getConfirmCardPaymentResponse())
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(undefined);
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(getShippingAddress());
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(getBillingAddress());

            await strategy.initialize(stripeV3Options);
            const promise = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalledWith(
                'myToken',
                {
                    ...getStripeCardPaymentOptionsWithGuestUser(),
                    payment_method: {
                        card: cardElement,
                        ...getStripePaymentMethodOptionsWithGuestUser(),
                    },
                }
            );
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(promise).toBe(store.getState());
        });

        it('creates the order and submit payment with a guest user and without shipping and billing address', async () => {
            const elements = stripeV3JsMock.elements();
            const cardElement = elements.create('card', {});

            stripeV3JsMock.confirmCardPayment = jest.fn(
                () => Promise.resolve(getConfirmCardPaymentResponse())
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(undefined);
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(undefined);
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(undefined);

            await strategy.initialize(stripeV3Options);
            const promise = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(stripeV3JsMock.confirmCardPayment).toHaveBeenCalledWith(
                'myToken',
                {
                    ...getStripeCardPaymentOptionsWithGuestUserWithoutAddress(),
                    payment_method: {
                        card: cardElement,
                        ...getStripePaymentMethodOptionsWithGuestUserWithoutAddress(),
                    },
                }
            );
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(promise).toBe(store.getState());
        });
    });

    describe('#finalize()', () => {
        it('throws an error to inform that order finalization is not required', async () => {
            const promise = strategy.finalize();

            return expect(promise).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes stripe payment strategy', async () => {
            const stripeV3JsMock = getStripeV3JsMock();
            const elements = stripeV3JsMock.elements();
            const cardElement = elements.create('card', {});

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getStripeV3());
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);

            await strategy.initialize(getStripeV3InitializeOptionsMock());
            const promise = strategy.deinitialize();

            await expect(promise).resolves.toBe(store.getState());

            expect(cardElement.unmount).toHaveBeenCalled();
        });
    });
});
