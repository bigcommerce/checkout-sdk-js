/// <reference path="./square-form.d.ts" />

import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { createCheckoutClient, createCheckoutStore, CheckoutClient, CheckoutStore } from '../../../checkout';
import { createPlaceOrderService } from '../../../order';
import { getSquare } from '../../../payment/payment-methods.mock';
import SquarePaymentStrategy from './square-payment-strategy';
import SquareScriptLoader from './square-script-loader';
import PaymentMethod from '../../payment-method';

describe('SquarePaymentStrategy', () => {
    let client: CheckoutClient;
    let scriptLoader: SquareScriptLoader;
    let store: CheckoutStore;
    let strategy: SquarePaymentStrategy;
    let paymentMethod: PaymentMethod;
    let placeOrderService: PlaceOrderService;
    let callbacks: Square.FormCallbacks;

    const formFactory = (options) => {
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
        scriptLoader = new SquareScriptLoader(createScriptLoader());
        strategy = new SquarePaymentStrategy(store, placeOrderService, scriptLoader);

        jest.spyOn(placeOrderService, 'submitOrder')
            .mockImplementation(() => Promise.resolve({ foo: 'bar' }));

        jest.spyOn(store, 'getState')
            .mockImplementation(() => {
                return {
                    getBillingAddress: () => {},
                };
            });

        jest.spyOn(scriptLoader, 'load')
            .mockImplementation(() => Promise.resolve(formFactory));

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

            it('fails to initialize when widget config is missing', () => {
                const initOptions = {
                    paymentMethod: { ...paymentMethod,
                        initializationData: { locationId: 'foo', env: 'bar', applicationId: 'test' },
                    },
                };

                strategy.initialize({ paymentMethod })
                    .catch(error => expect(error.type).toEqual('payment_method_missing_data'));
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
                    .catch(e => expect(e.type).toEqual('payment_method_uninitialized'));

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
                    promise = strategy.execute({});
                    callbacks.cardNonceResponseReceived(null, 'nonce');
                });

                it('places the order', () => {
                    expect(placeOrderService.submitOrder).toHaveBeenCalledTimes(1);
                });

                it('resolves to what is returned by submitOrder', async () => {
                    await promise.then(response => expect(response).toMatchObject({ foo: 'bar' }));
                });
            });

            describe('when a failure happens receiving the nonce', () => {
                let promise;

                beforeEach(() => {
                    promise = strategy.execute({});
                    callbacks.cardNonceResponseReceived({}, 'nonce');
                });

                it('does not place the order', () => {
                    expect(placeOrderService.submitOrder).toHaveBeenCalledTimes(0);
                });

                it('rejects the promise', async () => {
                    await promise.catch(error => expect(error).toBeTruthy());
                });
            });
        });
    });
});
