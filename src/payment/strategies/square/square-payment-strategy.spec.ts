import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore, CheckoutValidator, InternalCheckoutSelectors } from '../../../checkout';
import { getCheckoutState, getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, NotInitializedError, TimeoutError, UnsupportedBrowserError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfigState } from '../../../config/configs.mock';
import { OrderActionCreator, OrderActionType, OrderRequestSender } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { createSpamProtection, SpamProtectionActionCreator } from '../../../order/spam-protection';
import { createPaymentStrategyRegistry, PaymentActionCreator, PaymentInitializeOptions, PaymentMethodActionCreator, PaymentMethodRequestSender, PaymentRequestSender, PaymentStrategyActionCreator } from '../../../payment';
import { getPaymentMethodsState, getSquare } from '../../../payment/payment-methods.mock';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentRequestTransformer from '../../payment-request-transformer';

import { SquarePaymentForm, SquarePaymentStrategy, SquareScriptLoader } from './';
import { DigitalWalletType, SquareFormCallbacks, SquareFormOptions } from './square-form';
import { getCardData, getNonceGenerationErrors, getPayloadVaulted, getSquarePaymentInitializeOptions } from './square-payment-strategy-mock';

describe('SquarePaymentStrategy', () => {
    let callbacks: SquareFormCallbacks;
    let checkoutActionCreator: CheckoutActionCreator;
    let initOptions: PaymentInitializeOptions;
    let orderActionCreator: OrderActionCreator;
    let orderRequestSender: OrderRequestSender;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethod: PaymentMethod;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentStrategyActionCreator: PaymentStrategyActionCreator;
    let scriptLoader: SquareScriptLoader;
    let store: CheckoutStore;
    let strategy: SquarePaymentStrategy;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;

    const formFactory = (options: SquareFormOptions) => {
        if (options.callbacks) {
            callbacks = options.callbacks;
        }

        return squareForm;
    };

    const squareForm = {
        build: () => {
            if (callbacks.paymentFormLoaded) {
                callbacks.paymentFormLoaded({} as SquarePaymentForm);
            }
        },
        requestCardNonce: () => {},
    };

    const squareOptions = {
        cardNumber: { elementId: 'cardNumber' },
        cvv: { elementId: 'cvv' },
        expirationDate: { elementId: 'expirationDate' },
        postalCode: { elementId: 'postalCode' },
    };

    beforeEach(() => {
        store = createCheckoutStore({
            paymentMethods: getPaymentMethodsState(),
            checkout: getCheckoutState(),
            config: getConfigState(),
            billingAddress: getCheckoutStoreState().billingAddress,
        });
        orderRequestSender = new OrderRequestSender(createRequestSender());
        paymentMethod = getSquare();

        const requestSender = createRequestSender();
        const paymentClient = createPaymentClient(store);
        const spamProtection = createSpamProtection(createScriptLoader());
        const registry = createPaymentStrategyRegistry(store, paymentClient, requestSender, spamProtection, 'en_US');
        const checkoutRequestSender = new CheckoutRequestSender(requestSender);
        const configRequestSender = new ConfigRequestSender(requestSender);
        const configActionCreator = new ConfigActionCreator(configRequestSender);

        orderActionCreator = new OrderActionCreator(
            orderRequestSender,
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender())),
            new SpamProtectionActionCreator(spamProtection)
        );
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer()
        );
        initOptions = getSquarePaymentInitializeOptions();
        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender));
        paymentStrategyActionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
        scriptLoader = new SquareScriptLoader(createScriptLoader());
        checkoutActionCreator = new CheckoutActionCreator(checkoutRequestSender, configActionCreator);
        strategy = new SquarePaymentStrategy(
            store,
            checkoutActionCreator,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            requestSender,
            scriptLoader
        );
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        jest.spyOn(store, 'dispatch');

        jest.spyOn(scriptLoader, 'load')
            .mockReturnValue(Promise.resolve(formFactory));

        jest.spyOn(squareForm, 'build');
        jest.spyOn(squareForm, 'requestCardNonce');

        (scriptLoader.load as jest.Mock).mockClear();
        (squareForm.build as jest.Mock).mockClear();
    });

    describe('#initialize()', () => {
        initOptions = {
            methodId: 'square',
            square: squareOptions,
        };

        describe('when form loads successfully', () => {
            it('loads script when initializing strategy with required params', async () => {
                await strategy.initialize(initOptions);

                expect(scriptLoader.load).toHaveBeenCalledTimes(1);
            });

            it('fails to initialize when widget config is missing', async () => {
                try {
                    await strategy.initialize({ methodId: paymentMethod.id });
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidArgumentError);
                }
            });

            it('Shows the masterpass button', async () => {
                await strategy.initialize(initOptions);

                let container: HTMLDivElement;
                container = document.createElement('div');
                container.id = 'sq-masterpass';
                document.body.appendChild(container);

                if (callbacks.methodsSupported) {
                    callbacks.methodsSupported({ masterpass: true });
                }

                expect(scriptLoader.load).toHaveBeenCalledTimes(1);
            });

            describe('Payment Request callback fired', () => {

                beforeEach(async () => {
                    await strategy.initialize(initOptions);
                });

                it('Creates Payload', () => {
                    jest.spyOn(store.getState().checkout, 'getCheckout')
                    .mockReturnValue(getSquarePaymentInitializeOptions());

                    if (callbacks.createPaymentRequest) {
                        callbacks.createPaymentRequest();
                    }

                    expect(scriptLoader.load).toHaveBeenCalledTimes(1);
                });

                it('Fails because no checkout information is present' , () => {
                    store = createCheckoutStore({});

                    if (callbacks.createPaymentRequest) {
                        try {
                            callbacks.createPaymentRequest();
                        } catch (error) {
                            expect(error).toBeInstanceOf(MissingDataError);
                        }
                    }
                });
            });
        });

        describe('when form fails to load', () => {
            beforeEach(() => {
                jest.spyOn(squareForm, 'build').mockImplementation(() => {
                    if (callbacks.unsupportedBrowserDetected) {
                        callbacks.unsupportedBrowserDetected();
                    }
                });
            });

            afterEach(() => (squareForm.build as any).mockRestore());

            it('rejects the promise', () => {
                const initOptions = {
                    methodId: paymentMethod.id,
                    square: squareOptions,
                };

                strategy.initialize(initOptions)
                    .catch(e => expect(e).toBeInstanceOf(UnsupportedBrowserError));

                expect(scriptLoader.load).toHaveBeenCalledTimes(1);
                expect(squareForm.build).toHaveBeenCalledTimes(0);
            });
        });
    });

    describe('#execute()', () => {
        const payload = {
            payment: {
                methodId: 'square',
            },
        };
        const cardData = getCardData();

        describe('when form has not been initialized', () => {
            it('rejects the promise', () => {
                strategy.execute(payload)
                    .catch(e => expect(e).toBeInstanceOf(NotInitializedError));

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
                    if (callbacks.cardNonceResponseReceived) {
                        callbacks.cardNonceResponseReceived(undefined, 'nonce');
                    }
                }, 0);

                await strategy.execute(payload);
            });

            describe('when the nonce is received', () => {
                let promise: Promise<InternalCheckoutSelectors>;

                beforeEach(() => {
                    promise = strategy.execute({ payment: { methodId: 'square' }, useStoreCredit: true });

                    if (callbacks.cardNonceResponseReceived) {
                        callbacks.cardNonceResponseReceived(undefined, 'nonce');
                    }
                });

                it('places the order with the right arguments', () => {
                    expect(orderActionCreator.submitOrder).toHaveBeenCalledWith({ useStoreCredit: true }, undefined);
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
                beforeEach(() => {
                    if (callbacks.cardNonceResponseReceived) {
                        callbacks.cardNonceResponseReceived(undefined, 'nonce', cardData, undefined, undefined);
                    }
                });

                it('does not place the order', () => {
                    expect(orderActionCreator.submitOrder).toHaveBeenCalledTimes(0);
                    expect(store.dispatch).not.toHaveBeenCalledWith(submitOrderAction);
                });

                it('does not submit payment', () => {
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(0);
                });
            });

            describe('when cardNonceResponseReceived returns errors and callback is passed', () => {
                const catchSpy = jest.fn();

                beforeEach(async () => {
                    await strategy.initialize(initOptions);

                    strategy.execute(payload).catch(catchSpy);

                    if (callbacks.cardNonceResponseReceived) {
                        callbacks.cardNonceResponseReceived(getNonceGenerationErrors(), undefined, undefined, undefined, undefined);
                    }
                });

                it('calls onError callback', () => {
                    // tslint:disable-next-line:no-non-null-assertion
                    expect(initOptions.square!.onError).toHaveBeenCalled();
                });

                it('rejects the promise', () => {
                    expect(catchSpy).toHaveBeenCalled();
                });
            });

            describe('when cardNonceResponseReceived returns errors and no callback is passed', () => {
                const catchSpy = jest.fn();

                beforeEach(async () => {
                    await strategy.initialize({
                        ...initOptions,
                        square: {
                            // tslint:disable-next-line:no-non-null-assertion
                            ...initOptions.square!,
                            onError: undefined,
                        },
                    });

                    strategy.execute(payload).catch(catchSpy);

                    if (callbacks.cardNonceResponseReceived) {
                        callbacks.cardNonceResponseReceived(getNonceGenerationErrors(), undefined, undefined, undefined, undefined);
                    }
                });

                it('rejects the promise', () => {
                    expect(catchSpy).toHaveBeenCalled();
                });
            });

            describe('when the nonce is received', () => {
                const payloadVaulted = getPayloadVaulted();

                beforeEach(async () => {
                    await strategy.initialize(initOptions);
                    if (callbacks.cardNonceResponseReceived) {
                        callbacks.cardNonceResponseReceived(undefined, 'nonce', cardData, undefined, undefined);
                    }
                });

                it('calls submit order with the order request information for masterpass', async () => {
                    cardData.digital_wallet_type = DigitalWalletType.none;

                    const promise: Promise<InternalCheckoutSelectors> = strategy.execute(payloadVaulted, initOptions);
                    if (callbacks.cardNonceResponseReceived) {
                        callbacks.cardNonceResponseReceived(undefined, 'nonce', cardData, undefined, undefined);
                    }
                    jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getSquarePaymentInitializeOptions());
                    await promise.then(() => {
                        expect(store.dispatch).toHaveBeenCalledTimes(3);
                        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith({ useStoreCredit: true }, initOptions);
                        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({ methodId: 'square', paymentData: { nonce: 'nonce' }});
                    });
                });
            });
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await strategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });
});
