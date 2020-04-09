import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of, Observable } from 'rxjs';

import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, NotInitializedError, RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { getCustomer } from '../../../customer/customers.mock';
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

import StripeV3PaymentStrategy from './stripev3-payment-strategy';
import StripeV3ScriptLoader from './stripev3-script-loader';
import { getStripeCardPaymentOptionsWithGuestUser, getStripeCardPaymentOptionsWithGuestUserWithoutAddress, getStripeCardPaymentOptionsWithSignedUser, getStripePaymentMethodOptionsWithGuestUser, getStripePaymentMethodOptionsWithGuestUserWithoutAddress, getStripePaymentMethodOptionsWithSignedUser, getStripeV3HandleCardResponse, getStripeV3InitializeOptionsMock, getStripeV3JsMock, getStripeV3OrderRequestBodyMock } from './stripev3.mock';

describe('StripeV3PaymentStrategy', () => {
    let errorResponse: RequestError;
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

        errorResponse = new RequestError(getResponse({
            ...getErrorPaymentResponseBody(),
            errors: [
                { code: 'three_d_secure_required' },
            ],
            three_ds_result: {
                token: 'token',
            },
            status: 'error',
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
        const stripeV3JsMock = getStripeV3JsMock();
        let stripeV3Options: PaymentInitializeOptions;

        beforeEach(() => {
            stripeV3Options = getStripeV3InitializeOptionsMock();

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getStripeV3());
        });

        it('loads stripe v3 script', async () => {
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            const promise =  strategy.initialize(stripeV3Options);

            expect(stripeScriptLoader.load).toHaveBeenCalled();

            return expect(promise).resolves.toBe(store.getState());
        });

        it('does not load stripe V3 if initialization options are not provided', async () => {
            stripeV3Options.stripev3 = undefined;

            const response = strategy.initialize(stripeV3Options);

            return expect(response).rejects.toThrow(InvalidArgumentError);
        });

        it('does not load stripe V3 if paymentMethod is not provided', () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(undefined);

            const response = strategy.initialize(stripeV3Options);

            return expect(response).rejects.toThrow(MissingDataError);
        });
    });

    describe('#execute', () => {
        let stripeV3Options: PaymentInitializeOptions;
        const stripeV3JsMock = getStripeV3JsMock();

        beforeEach(() => {
            stripeV3Options = getStripeV3InitializeOptionsMock();
        });

        it('creates the order and submit payment', async () => {
            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(getStripeV3HandleCardResponse())
            );

            stripeV3JsMock.createPaymentMethod = jest.fn(
                () => Promise.resolve({
                    paymentMethod: {
                        id: 'paymentMethod',
                    },
                })
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(stripeV3Options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(stripeV3JsMock.handleCardPayment).toHaveBeenCalled();
            expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('throws an error when payment is not set properly into payload', () => {
            const payload = {
                payment: undefined,
            };

            expect(() => strategy.execute(payload))
                .toThrow(PaymentArgumentInvalidError);
        });

        it('creates a payment when an instrument is being used', async () => {
            const payload = {
                payment: {
                    methodId: 'stripev3',
                    paymentData: {
                        instrumentId: 'token',
                    },
                },
            };

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(stripeV3Options);
            const response = await strategy.execute(payload);

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('throws an error when stripe card element has not been initialized', async () => {
            const payload = {
                payment: {
                    methodId: 'stripev3',
                },
            };

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            const response = strategy.execute(payload);

            return expect(response).rejects.toThrow(NotInitializedError);
        });

        it('throws an error when trying to create stripe payment method', async () => {
            const stripeError = {
                error: {
                    message: 'stripe error',
                },
            };

            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(getStripeV3HandleCardResponse())
            );

            stripeV3JsMock.createPaymentMethod = jest.fn(
                () => Promise.resolve(stripeError)
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(stripeV3Options);
            const response = strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(response).rejects.toThrowError(stripeError.error.message);

            return expect(response).rejects.toThrow(PaymentMethodFailedError);
        });

        it('throws an error when handle card payment to stripe', async () => {
            const stripeError = {
                error: {
                    message: 'stripe error',
                },
            };

            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(stripeError)
            );

            stripeV3JsMock.createPaymentMethod = jest.fn(
                () => Promise.resolve({
                    paymentMethod: {
                        id: 'paymentMethod',
                    },
                })
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(stripeV3Options);
            const response = strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(response).rejects.toThrowError(stripeError.error.message);

            return expect(response).rejects.toThrow(PaymentMethodFailedError);
        });

        it('throws an error when ClientToken is undefined', async () => {
            paymentMethodMock.clientToken = undefined;
            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(getStripeV3HandleCardResponse())
            );

            stripeV3JsMock.createPaymentMethod = jest.fn(
                () => Promise.resolve({
                    paymentMethod: {
                        id: 'paymentMethod',
                    },
                })
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(stripeV3Options);
            const response = strategy.execute(getStripeV3OrderRequestBodyMock());

            return expect(response).rejects.toThrow(MissingDataError);
        });

        it('creates the order and submit payment with a signed user', async () => {
            const elements = stripeV3JsMock.elements();
            const cardElement = elements.create('card', {});

            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(getStripeV3HandleCardResponse())
            );

            stripeV3JsMock.createPaymentMethod = jest.fn(
                () => Promise.resolve({
                    paymentMethod: {
                        id: 'paymentMethod',
                    },
                })
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(getShippingAddress());
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(getBillingAddress());

            await strategy.initialize(stripeV3Options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith(
                'card',
                cardElement,
                getStripePaymentMethodOptionsWithSignedUser()
            );
            expect(stripeV3JsMock.handleCardPayment).toHaveBeenCalledWith(
                'myToken',
                {
                    ...getStripeCardPaymentOptionsWithSignedUser(),
                    payment_method: 'paymentMethod',
                }
            );
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('creates the order and submit payment with a guest user', async () => {
            const elements = stripeV3JsMock.elements();
            const cardElement = elements.create('card', {});

            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(getStripeV3HandleCardResponse())
            );

            stripeV3JsMock.createPaymentMethod = jest.fn(
                () => Promise.resolve({
                    paymentMethod: {
                        id: 'paymentMethod',
                    },
                })
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(undefined);
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(getShippingAddress());
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(getBillingAddress());

            await strategy.initialize(stripeV3Options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith(
                'card',
                cardElement,
                getStripePaymentMethodOptionsWithGuestUser()
            );
            expect(stripeV3JsMock.handleCardPayment).toHaveBeenCalledWith(
                'myToken',
                {
                    ...getStripeCardPaymentOptionsWithGuestUser(),
                    payment_method: 'paymentMethod',
                }
            );
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('creates the order and submit payment with a guest user and without shipping and billing address', async () => {
            const elements = stripeV3JsMock.elements();
            const cardElement = elements.create('card', {});

            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(getStripeV3HandleCardResponse())
            );

            stripeV3JsMock.createPaymentMethod = jest.fn(
                () => Promise.resolve({
                    paymentMethod: {
                        id: 'paymentMethod',
                    },
                })
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(undefined);
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(undefined);
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(undefined);

            await strategy.initialize(stripeV3Options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith(
                'card',
                cardElement,
                getStripePaymentMethodOptionsWithGuestUserWithoutAddress()
            );
            expect(stripeV3JsMock.handleCardPayment).toHaveBeenCalledWith(
                'myToken',
                {
                    ...getStripeCardPaymentOptionsWithGuestUserWithoutAddress(),
                    payment_method: 'paymentMethod',
                }
            );
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('creates the order and submit payment with a signed user but without email', async () => {
            const elements = stripeV3JsMock.elements();
            const cardElement = elements.create('card', {});
            const customer = getCustomer();

            customer.email = '';
            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(getStripeV3HandleCardResponse())
            );

            stripeV3JsMock.createPaymentMethod = jest.fn(
                () => Promise.resolve({
                    paymentMethod: {
                        id: 'paymentMethod',
                    },
                })
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(customer);
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(getShippingAddress());
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(getBillingAddress());

            await strategy.initialize(stripeV3Options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith(
                'card',
                cardElement,
                getStripePaymentMethodOptionsWithGuestUser()
            );
            expect(stripeV3JsMock.handleCardPayment).toHaveBeenCalledWith(
                'myToken',
                {
                    ...getStripeCardPaymentOptionsWithGuestUser(),
                    payment_method: 'paymentMethod',
                }
            );
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('creates a payment when an instrument is being used and 3ds is required by card', async () => {
            const payload = {
                payment: {
                    methodId: 'stripev3',
                    paymentData: {
                        instrumentId: 'token',
                    },
                },
            };
            const successHandler = jest.fn();

            stripeV3Options = getStripeV3InitializeOptionsMock();
            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(getStripeV3HandleCardResponse())
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

            await strategy.initialize(stripeV3Options);
            try {
                await strategy.execute(payload).then(successHandler);
            } catch {
                expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(2);
                expect(stripeV3JsMock.handleCardPayment).toHaveBeenCalled();
            }
        });

        it('throws an error when submit payment with an instrument', async () => {
            errorResponse = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'error' },
                ],
                three_ds_result: {
                    token: 'token',
                },
                status: 'error',
            }));

            const payload = {
                payment: {
                    methodId: 'stripev3',
                    paymentData: {
                        instrumentId: 'token',
                    },
                },
            };

            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(getStripeV3HandleCardResponse())
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

            await strategy.initialize(stripeV3Options);
            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                expect(stripeV3JsMock.handleCardPayment).not.toHaveBeenCalled();
                expect(error).toEqual(errorResponse);
            }
        });

        it('throws an error when handleCardPayment in 3ds instrument flow', async () => {
            errorResponse = new RequestError(getResponse({
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
                    methodId: 'stripev3',
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

            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(stripeError));

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)));

            await strategy.initialize(stripeV3Options);
            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                expect(stripeV3JsMock.handleCardPayment).toHaveBeenCalled();
                expect(error.message).toEqual(stripeError.error && stripeError.error.message);
            }
        });
    });

    describe('#finalize()', () => {
        it('throws an error to inform that order finalization is not required', async () => {
            const promise = strategy.finalize();

            return expect(promise).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize', () => {
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

            expect(cardElement.unmount).toHaveBeenCalled();

            return expect(promise).resolves.toBe(store.getState());
        });

        it('does not unmount when stripe card element is not available', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getStripeV3());

            const promise = strategy.deinitialize();

            return expect(promise).resolves.toBe(store.getState());
        });
    });
});
