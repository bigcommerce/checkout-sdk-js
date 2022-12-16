import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { Action, createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { Observable, of } from 'rxjs';

import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
    createCheckoutStore,
    InternalCheckoutSelectors,
} from '../../../checkout';
import { getCheckoutState, getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import {
    InvalidArgumentError,
    MissingDataError,
    NotInitializedError,
    TimeoutError,
    UnsupportedBrowserError,
} from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfig, getConfigState } from '../../../config/configs.mock';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { getFormFieldsState } from '../../../form/form.mock';
import { OrderActionCreator, OrderActionType, OrderRequestSender } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import {
    createPaymentStrategyRegistry,
    createPaymentStrategyRegistryV2,
    PaymentActionCreator,
    PaymentInitializeOptions,
    PaymentMethodActionCreator,
    PaymentMethodRequestSender,
    PaymentRequestSender,
    PaymentStrategyActionCreator,
} from '../../../payment';
import { createPaymentIntegrationService } from '../../../payment-integration';
import { getPaymentMethodsState, getSquare } from '../../../payment/payment-methods.mock';
import {
    createSpamProtection,
    PaymentHumanVerificationHandler,
    SpamProtectionActionCreator,
    SpamProtectionRequestSender,
} from '../../../spam-protection';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentRequestTransformer from '../../payment-request-transformer';

import { DigitalWalletType, SquareFormCallbacks, SquareFormOptions } from './square-form';
import {
    getCardData,
    getNonceGenerationErrors,
    getPayloadVaulted,
    getSquarePaymentInitializeOptions,
} from './square-payment-strategy-mock';

import { SquarePaymentForm, SquarePaymentStrategy, SquareScriptLoader } from './';

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

    const formFactory = jest.fn((options: SquareFormOptions) => {
        if (options.callbacks) {
            callbacks = options.callbacks;
        }

        return squareForm;
    });

    const squareForm = {
        build: jest.fn(() => {
            if (callbacks.paymentFormLoaded) {
                callbacks.paymentFormLoaded({} as SquarePaymentForm);
            }
        }),
        requestCardNonce: jest.fn(() => {
            if (callbacks.cardNonceResponseReceived) {
                callbacks.cardNonceResponseReceived(undefined, 'nonce');
            }
        }),
        setPostalCode: jest.fn(),
        verifyBuyer: jest.fn((_nonce, _verificationDetails, callback) => {
            callback({}, { token: '1234' });
        }),
    };

    const squareOptions = {
        cardNumber: { elementId: 'cardNumber' },
        cvv: { elementId: 'cvv' },
        expirationDate: { elementId: 'expirationDate' },
        postalCode: { elementId: 'postalCode' },
        onError: jest.fn(),
    };

    beforeEach(() => {
        store = createCheckoutStore({
            ...getCheckoutStoreState(),
            paymentMethods: getPaymentMethodsState(),
            checkout: getCheckoutState(),
            config: getConfigState(),
            formFields: getFormFieldsState(),
        });
        orderRequestSender = new OrderRequestSender(createRequestSender());
        paymentMethod = getSquare();

        const requestSender = createRequestSender();
        const paymentClient = createPaymentClient(store);
        const spamProtection = createSpamProtection(createScriptLoader());
        const registry = createPaymentStrategyRegistry(
            store,
            paymentClient,
            requestSender,
            spamProtection,
            'en_US',
        );
        const paymentIntegrationService = createPaymentIntegrationService(store);
        const registryV2 = createPaymentStrategyRegistryV2(paymentIntegrationService);
        const storeConfig = getConfig().storeConfig;

        orderActionCreator = new OrderActionCreator(
            orderRequestSender,
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender())),
        );
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())),
        );
        initOptions = getSquarePaymentInitializeOptions();
        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender),
        );
        paymentStrategyActionCreator = new PaymentStrategyActionCreator(
            registry,
            registryV2,
            orderActionCreator,
            new SpamProtectionActionCreator(
                spamProtection,
                new SpamProtectionRequestSender(requestSender),
            ),
        );
        scriptLoader = new SquareScriptLoader(createScriptLoader());
        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
        );
        strategy = new SquarePaymentStrategy(
            store,
            checkoutActionCreator,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            requestSender,
            scriptLoader,
        );
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(submitPaymentAction);

        jest.spyOn(store, 'dispatch');
        jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue(storeConfig);

        jest.spyOn(scriptLoader, 'load').mockReturnValue(formFactory);

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

            describe('Payment Request callback fired', () => {
                beforeEach(async () => {
                    await strategy.initialize(initOptions);
                });

                it('Creates Payload', () => {
                    if (callbacks.createPaymentRequest) {
                        callbacks.createPaymentRequest();
                    }

                    expect(scriptLoader.load).toHaveBeenCalledTimes(1);
                });

                it('Fails because no checkout information is present', () => {
                    jest.spyOn(store.getState().checkout, 'getCheckout').mockReturnValueOnce(
                        undefined,
                    );

                    if (callbacks.createPaymentRequest) {
                        return expect(callbacks.createPaymentRequest).toThrow(MissingDataError);
                    }
                });
            });
        });

        describe('when form fails to load', () => {
            it('rejects the promise', async () => {
                squareForm.build.mockImplementationOnce(() => {
                    if (callbacks.unsupportedBrowserDetected) {
                        callbacks.unsupportedBrowserDetected();
                    }
                });

                const initOptions = {
                    methodId: paymentMethod.id,
                    square: squareOptions,
                };

                await strategy
                    .initialize(initOptions)
                    .catch((e) => expect(e).toBeInstanceOf(UnsupportedBrowserError));
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

        describe('when the form has been initialized', () => {
            beforeEach(async () => {
                const initOptions = {
                    methodId: paymentMethod.id,
                    square: squareOptions,
                };

                await strategy.initialize(initOptions);
            });

            afterEach(() => {
                jest.restoreAllMocks();
            });

            it('fails if payment is not passed', () => {
                return expect(strategy.execute({})).rejects.toBeInstanceOf(InvalidArgumentError);
            });

            it('requests the nonce', async () => {
                await strategy.execute(payload);

                expect(squareForm.requestCardNonce).toHaveBeenCalledTimes(1);
            });

            it('cancels the first request when a newer is made', () => {
                squareForm.requestCardNonce.mockImplementationOnce(() => {
                    setTimeout(() => {
                        if (callbacks.cardNonceResponseReceived) {
                            callbacks.cardNonceResponseReceived(undefined, 'nonce');
                        }
                    }, 0);
                });

                return Promise.all([
                    expect(strategy.execute(payload)).rejects.toBeInstanceOf(TimeoutError),
                    strategy.execute(payload),
                ]);
            });

            describe('when the nonce is received', () => {
                let promise: Promise<InternalCheckoutSelectors>;

                beforeEach(() => {
                    promise = strategy.execute({
                        payment: { methodId: 'square' },
                        useStoreCredit: true,
                    });
                });

                it('places the order with the right arguments', async () => {
                    await promise;

                    expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(
                        { useStoreCredit: true },
                        undefined,
                    );
                    expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
                });

                it('resolves to what is returned by submitPayment', async () => {
                    const value = await promise;

                    expect(value).toEqual(store.getState());
                });

                it('submits the payment  with the right arguments', async () => {
                    await promise;

                    expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                        methodId: 'square',
                        paymentData: {
                            nonce: 'nonce',
                        },
                    });
                });
            });

            describe('when a failure happens receiving the nonce', () => {
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

                it('calls onError callback and throws', async () => {
                    squareForm.requestCardNonce.mockImplementationOnce(() => {
                        if (callbacks.cardNonceResponseReceived) {
                            callbacks.cardNonceResponseReceived(getNonceGenerationErrors());
                        }
                    });

                    await strategy.execute(payload).catch(catchSpy);

                    // tslint:disable-next-line:no-non-null-assertion
                    expect(squareOptions.onError).toHaveBeenCalled();
                    expect(catchSpy).toHaveBeenCalled();
                });
            });

            describe('when cardNonceResponseReceived returns errors and no callback is passed', () => {
                it('rejects the promise', async () => {
                    try {
                        squareForm.requestCardNonce.mockImplementationOnce(() => {
                            if (callbacks.cardNonceResponseReceived) {
                                callbacks.cardNonceResponseReceived(
                                    getNonceGenerationErrors(),
                                    '',
                                    undefined,
                                    undefined,
                                    undefined,
                                );
                            }
                        });

                        await strategy.initialize({
                            ...initOptions,
                            square: {
                                // tslint:disable-next-line:no-non-null-assertion
                                ...initOptions.square!,
                                onError: undefined,
                            },
                        });
                        await strategy.execute(payload);
                    } catch (e) {
                        expect(e).toEqual({
                            field: 'some-field',
                            message: 'some-message',
                            type: 'some-type',
                        });
                    }
                });
            });

            describe('calls sybmit after initilaize', () => {
                const payloadVaulted = getPayloadVaulted();

                it('calls submit order with the order request information for applepay', async () => {
                    await strategy.initialize(initOptions);
                    cardData.digital_wallet_type = DigitalWalletType.none;

                    await strategy.execute(payloadVaulted, initOptions);
                    jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(
                        getSquarePaymentInitializeOptions(),
                    );

                    expect(store.dispatch).toHaveBeenCalledTimes(2);
                    expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(
                        { useStoreCredit: true },
                        initOptions,
                    );
                    expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
                    expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                        methodId: 'square',
                        paymentData: { nonce: 'nonce' },
                    });
                });
            });

            describe('verifyBuyer', () => {
                beforeEach(() => {
                    jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue({
                        ...getConfig().storeConfig,
                        checkoutSettings: {
                            ...getConfig().storeConfig.checkoutSettings,
                            features: {
                                'PROJECT-3828.add_3ds_support_on_squarev2': true,
                            },
                        },
                    });
                });

                afterEach(() => {
                    jest.restoreAllMocks();
                });

                it('call verifyBuyer', async () => {
                    const response = await strategy.execute(payload);

                    expect(squareForm.verifyBuyer).toHaveBeenCalled();
                    expect(response).toEqual(store.getState());
                });

                it('rejects when veirfyBuyerFails', () => {
                    squareForm.verifyBuyer.mockImplementationOnce(
                        (_nonce, _verificationDetails, cb) => {
                            cb([{ message: 'an error', type: 'error' }]);
                        },
                    );

                    return expect(strategy.execute(payload)).rejects.toEqual({
                        message: 'an error',
                        type: 'error',
                    });
                });

                it('submits the payment  with the right arguments and experiment is on', async () => {
                    await strategy.initialize(initOptions);
                    await strategy.execute(payload);

                    expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                        methodId: 'square',
                        paymentData: {
                            nonce: '{"nonce":"nonce","token":"1234"}',
                        },
                    });
                });
            });
        });

        describe('when form has not been initialized', () => {
            afterEach(() => {
                jest.restoreAllMocks();
            });

            it('rejects the promise', () => {
                formFactory.mockImplementationOnce(() => undefined);

                return expect(strategy.execute(payload)).rejects.toBeInstanceOf(
                    NotInitializedError,
                );
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
