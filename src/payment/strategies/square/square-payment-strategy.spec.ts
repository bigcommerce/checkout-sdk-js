import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { Observable } from 'rxjs';

import { PaymentActionCreator, PaymentRequestSender } from '../..';
import { createCheckoutClient, createCheckoutStore, CheckoutClient, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, TimeoutError } from '../../../common/error/errors';
import { OrderActionCreator, OrderActionType } from '../../../order';
import { getPaymentMethodsState, getSquare } from '../../../payment/payment-methods.mock';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethod from '../../payment-method';

import { SquareFormCallbacks } from './square-form';
import SquarePaymentStrategy from './square-payment-strategy';
import SquareScriptLoader from './square-script-loader';

describe('SquarePaymentStrategy', () => {
    let client: CheckoutClient;
    let scriptLoader: SquareScriptLoader;
    let store: CheckoutStore;
    let strategy: SquarePaymentStrategy;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethod: PaymentMethod;
    let callbacks: SquareFormCallbacks;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;

    const formFactory = options => {
        callbacks = options.callbacks;
        return squareForm;
    };

    const squareForm = {
        build: () => callbacks.paymentFormLoaded(),
        requestCardNonce: () => {},
    };

    const squareOptions = {
        cardNumber: { elementId: 'cardNumber' },
        cvv: { elementId: 'cvv' },
        expirationDate: { elementId: 'expirationDate' },
        postalCode: { elementId: 'postalCode' },
    };

    beforeEach(() => {
        client = createCheckoutClient();
        store = createCheckoutStore({
            paymentMethods: getPaymentMethodsState(),
        });
        paymentMethod = getSquare();
        orderActionCreator = new OrderActionCreator(createCheckoutClient());
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator
        );
        scriptLoader = new SquareScriptLoader(createScriptLoader());
        strategy = new SquarePaymentStrategy(store, orderActionCreator, paymentActionCreator, scriptLoader);
        submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = Observable.of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        jest.spyOn(store, 'dispatch');

        jest.spyOn(scriptLoader, 'load')
            .mockReturnValue(Promise.resolve(formFactory));

        jest.spyOn(squareForm, 'build');
        jest.spyOn(squareForm, 'requestCardNonce');

        scriptLoader.load.mockClear();
        squareForm.build.mockClear();
    });

    describe('#initialize()', () => {
        describe('when form loads successfully', () => {
            it('loads script when initializing strategy with required params', async () => {
                const initOptions = {
                    methodId: paymentMethod.id,
                    square: squareOptions,
                };

                await strategy.initialize(initOptions);

                expect(scriptLoader.load).toHaveBeenCalledTimes(1);
            });

            it('fails to initialize when widget config is missing', async () => {
                const initOptions = {
                    methodId: paymentMethod.id,
                    square: squareOptions,
                };

                try {
                    await strategy.initialize({ methodId: paymentMethod.id });
                } catch (error) {
                    expect(error.type).toEqual('invalid_argument');
                }
            });
        });

        describe('when form fails to load', () => {
            beforeEach(() => {
                jest.spyOn(squareForm, 'build').mockImplementation(() => {
                    callbacks.unsupportedBrowserDetected();
                });
            });

            afterEach(() => squareForm.build.mockRestore());

            it('rejects the promise', () => {
                const initOptions = {
                    methodId: paymentMethod.id,
                    square: squareOptions,
                };

                strategy.initialize(initOptions)
                    .catch(e => expect(e.type).toEqual('unsupported_browser'));

                expect(scriptLoader.load).toHaveBeenCalledTimes(1);
                expect(squareForm.build).toHaveBeenCalledTimes(0);
            });
        });
    });

    describe('#execute()', () => {
        const payload = {
            payment: {
                methodId: 'foo',
            },
        };

        describe('when form has not been initialized', () => {
            it('rejects the promise', () => {
                strategy.execute(payload)
                    .catch(e => expect(e.type).toEqual('not_initialized'));

                expect(squareForm.requestCardNonce).toHaveBeenCalledTimes(0);
            });
        });

        describe('when the form has been initialized', () => {
            beforeEach(async () => {
                const initOptions = {
                    methodId: paymentMethod.id,
                    square: squareOptions,
                };

                await strategy.initialize(initOptions);
            });

            it('fails if payment name is not passed', () => {
                try {
                    strategy.execute({});
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidArgumentError);
                    expect(squareForm.requestCardNonce).toHaveBeenCalledTimes(0);
                }
            });

            it('requests the nonce', () => {
                strategy.execute(payload);
                expect(squareForm.requestCardNonce).toHaveBeenCalledTimes(1);
            });

            it('cancels the first request when a newer is made', async () => {
                strategy.execute(payload).catch(e => expect(e).toBeInstanceOf(TimeoutError));

                setTimeout(() => {
                    callbacks.cardNonceResponseReceived(null, 'nonce');
                }, 0);

                await strategy.execute(payload);
            });

            describe('when the nonce is received', () => {
                let promise;

                beforeEach(() => {
                    promise = strategy.execute({ payment: { methodId: 'square' }, useStoreCredit: true, x: 'y' }, { b: 'f' });
                    callbacks.cardNonceResponseReceived(null, 'nonce');
                });

                it('places the order with the right arguments', () => {
                    expect(orderActionCreator.submitOrder).toHaveBeenCalledWith({ x: 'y', useStoreCredit: true }, { b: 'f' });
                    expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
                });

                it('resolves to what is returned by submitPayment', async () => {
                    const value = await promise;

                    expect(value).toEqual(store.getState());
                });

                it('submits the payment  with the right arguments', () => {
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                        methodId: 'square',
                        paymentData: {
                            nonce: 'nonce',
                        },
                    });
                });
            });

            describe('when a failure happens receiving the nonce', () => {
                let promise;

                beforeEach(() => {
                    promise = strategy.execute(payload);
                    callbacks.cardNonceResponseReceived({}, 'nonce');
                });

                it('does not place the order', () => {
                    expect(orderActionCreator.submitOrder).toHaveBeenCalledTimes(0);
                    expect(store.dispatch).not.toHaveBeenCalledWith(submitOrderAction);
                });

                it('does not submit payment', () => {
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(0);
                });

                it('rejects the promise', async () => {
                    await promise.catch(error => expect(error).toBeTruthy());
                });
            });
        });
    });
});
