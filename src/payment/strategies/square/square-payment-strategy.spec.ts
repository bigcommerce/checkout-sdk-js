/// <reference path="./square-form.d.ts" />

import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { Observable } from 'rxjs';

import { createCheckoutClient, createCheckoutStore, CheckoutClient, CheckoutStore } from '../../../checkout';
import { createPlaceOrderService, OrderActionCreator, PlaceOrderService } from '../../../order';
import { SUBMIT_ORDER_REQUESTED } from '../../../order/order-action-types';
import { getSquare } from '../../../payment/payment-methods.mock';
import PaymentMethod from '../../payment-method';

import SquarePaymentStrategy from './square-payment-strategy';
import SquareScriptLoader from './square-script-loader';

describe('SquarePaymentStrategy', () => {
    let client: CheckoutClient;
    let scriptLoader: SquareScriptLoader;
    let store: CheckoutStore;
    let strategy: SquarePaymentStrategy;
    let orderActionCreator: OrderActionCreator;
    let paymentMethod: PaymentMethod;
    let placeOrderService: PlaceOrderService;
    let callbacks: Square.FormCallbacks;
    let submitOrderAction: Observable<Action>;

    const formFactory = options => {
        callbacks = options.callbacks;
        return squareForm;
    };

    const squareForm = {
        build: () => callbacks.paymentFormLoaded(),
        requestCardNonce: () => {},
    };

    beforeEach(() => {
        client = createCheckoutClient();
        store = createCheckoutStore();
        placeOrderService = createPlaceOrderService(store, client, createPaymentClient());
        paymentMethod = getSquare();
        orderActionCreator = new OrderActionCreator(createCheckoutClient());
        scriptLoader = new SquareScriptLoader(createScriptLoader());
        strategy = new SquarePaymentStrategy(store, placeOrderService, orderActionCreator, scriptLoader);
        submitOrderAction = Observable.of(createAction(SUBMIT_ORDER_REQUESTED);

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(store, 'dispatch');
        jest.spyOn(store, 'getState')
            .mockReturnValue({
                getBillingAddress: () => {},
            });

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
                    paymentMethod: { ...paymentMethod,
                        initializationData: { locationId: 'foo', env: 'bar', applicationId: 'test' },
                    },
                    widgetConfig: {},
                };

                await strategy.initialize(initOptions);

                expect(scriptLoader.load).toHaveBeenCalledTimes(1);
            });

            it('fails to initialize when widget config is missing', async () => {
                const initOptions = {
                    paymentMethod: { ...paymentMethod,
                        initializationData: { locationId: 'foo', env: 'bar', applicationId: 'test' },
                    },
                };

                try {
                    await strategy.initialize({ paymentMethod });
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
                    paymentMethod: { ...paymentMethod,
                        initializationData: { locationId: 'foo', env: 'bar', applicationId: 'test' },
                    },
                    widgetConfig: {},
                };

                strategy.initialize(initOptions)
                    .catch(e => expect(e.type).toEqual('unsupported_browser'));

                expect(scriptLoader.load).toHaveBeenCalledTimes(1);
                expect(squareForm.build).toHaveBeenCalledTimes(0);
            });
        });
    });

    describe('#execute()', () => {
        describe('when form has not been initialized', () => {
            it('rejects the promise', () => {
                strategy.execute()
                    .catch(e => expect(e.type).toEqual('not_initialized'));

                expect(squareForm.requestCardNonce).toHaveBeenCalledTimes(0);
            });
        });

        describe('when the form has been initialized', () => {
            beforeEach(async () => {
                const initOptions = {
                    paymentMethod: { ...paymentMethod,
                        initializationData: { locationId: 'foo', env: 'bar', applicationId: 'test' },
                    },
                    widgetConfig: {},
                };

                await strategy.initialize(initOptions);
            });

            it('requests the nonce', () => {
                strategy.execute({});
                expect(squareForm.requestCardNonce).toHaveBeenCalledTimes(1);
            });

            it('cancels the first request', async () => {
                strategy.execute({})
                    .catch(e => expect(e.type).toEqual('timeout'));

                setTimeout(() => {
                    callbacks.cardNonceResponseReceived(null, 'nonce');
                }, 0);

                await strategy.execute({});
            });

            describe('when the nonce is received', () => {
                let promise;

                beforeEach(() => {
                    promise = strategy.execute({ payment: '', x: 'y' }, { b: 'f' });
                    callbacks.cardNonceResponseReceived(null, 'nonce');
                });

                it('places the order with the right arguments', () => {
                    expect(orderActionCreator.submitOrder).toHaveBeenCalledWith({ x: 'y' }, true, { b: 'f' });
                    expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
                });

                it('resolves to what is returned by submitOrder', async () => {
                    const value = await promise;

                    expect(value).toEqual(store.getState());
                });
            });

            describe('when a failure happens receiving the nonce', () => {
                let promise;

                beforeEach(() => {
                    promise = strategy.execute({});
                    callbacks.cardNonceResponseReceived({}, 'nonce');
                });

                it('does not place the order', () => {
                    expect(orderActionCreator.submitOrder).toHaveBeenCalledTimes(0);
                    expect(store.dispatch).not.toHaveBeenCalledWith(submitOrderAction);
                });

                it('rejects the promise', async () => {
                    await promise.catch(error => expect(error).toBeTruthy());
                });
            });
        });
    });
});
