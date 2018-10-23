import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { PaymentInitializeOptions, PaymentMethod, PaymentMethodRequestSender, PaymentRequestSender } from '../..';
import { BillingAddressActionCreator, BillingAddressRequestSender } from '../../../billing';
import { getCartState } from '../../../cart/carts.mock';
import {
    createCheckoutStore,
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator
} from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import {
    InvalidArgumentError, MissingDataError, MissingDataErrorType,
    NotInitializedError, NotInitializedErrorType
} from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { OrderActionCreator } from '../../../order';
import {
    createPaymentClient,
    createPaymentStrategyRegistry,
    PaymentActionCreator,
    PaymentMethodActionCreator,
    PaymentStrategyActionCreator
} from '../../../payment';
import { getGooglePay, getPaymentMethodsState } from '../../payment-methods.mock';
import { BraintreeScriptLoader, BraintreeSDKCreator } from '../braintree';

import {
    GooglePayBraintreeInitializer,
    GooglePayPaymentProcessor,
    GooglePayPaymentStrategy,
    GooglePayScriptLoader
} from './';
import { GooglePaymentData, GooglePayInitializer } from './googlepay';
import { getGoogleOrderRequestBody, getGooglePaymentDataPayload } from './googlepay.mock';

describe('GooglePayPaymentStrategy', () => {
    let store: CheckoutStore;
    let googlePayScriptLoader: GooglePayScriptLoader;
    let strategy: GooglePayPaymentStrategy;
    let checkoutActionCreator: CheckoutActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentStrategyActionCreator: PaymentStrategyActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let orderActionCreator: OrderActionCreator;
    let googlePayInitializer: GooglePayInitializer;
    let requestSender: RequestSender;
    let googlePayPaymentProcessor: GooglePayPaymentProcessor;
    let container: HTMLDivElement;
    let walletButton: HTMLAnchorElement;
    let paymentMethodMock: PaymentMethod;

    beforeEach(() => {
        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        const checkoutRequestSender = new CheckoutRequestSender(createRequestSender());
        const configRequestSender = new ConfigRequestSender(createRequestSender());
        const configActionCreator = new ConfigActionCreator(configRequestSender);
        const paymentMethodRequestSender: PaymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
        const paymentClient = createPaymentClient(store);
        const registry = createPaymentStrategyRegistry(store, paymentClient, requestSender);
        const scriptLoader = createScriptLoader();
        const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader);
        const braintreeSdkCreator = new BraintreeSDKCreator(braintreeScriptLoader);
        const billingAddressActionCreator = new BillingAddressActionCreator(new BillingAddressRequestSender(requestSender));

        googlePayScriptLoader = new GooglePayScriptLoader(createScriptLoader());
        requestSender = createRequestSender();
        checkoutActionCreator = new CheckoutActionCreator(checkoutRequestSender, configActionCreator);
        paymentMethodActionCreator = new PaymentMethodActionCreator(paymentMethodRequestSender);
        paymentStrategyActionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
        paymentActionCreator = new PaymentActionCreator(new PaymentRequestSender(paymentClient), orderActionCreator);
        orderActionCreator = new OrderActionCreator(
            paymentClient,
            new CheckoutValidator(
                new CheckoutRequestSender(createRequestSender())
            )
        );
        googlePayInitializer = new GooglePayBraintreeInitializer(braintreeSdkCreator);
        googlePayPaymentProcessor = new GooglePayPaymentProcessor(
            store,
            paymentMethodActionCreator,
            googlePayScriptLoader,
            googlePayInitializer,
            requestSender,
            billingAddressActionCreator
        );

        strategy = new GooglePayPaymentStrategy(
            store,
            checkoutActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            paymentActionCreator,
            orderActionCreator,
            googlePayPaymentProcessor
        );

        container = document.createElement('div');
        walletButton = document.createElement('a');
        container.setAttribute('id', 'login');
        walletButton.setAttribute('id', 'mockButton');
        document.body.appendChild(container);
        document.body.appendChild(walletButton);

        jest.spyOn(walletButton, 'removeEventListener');
        jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve());
        jest.spyOn(googlePayInitializer, 'initialize').mockReturnValue(getGooglePaymentDataPayload());
        jest.spyOn(checkoutActionCreator, 'loadCurrentCheckout').mockReturnValue(Promise.resolve());
        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(googlePayPaymentProcessor, 'initialize').mockReturnValue(Promise.resolve());

        paymentMethodMock = { ...getGooglePay() };
    });

    afterEach(() => {
        document.body.removeChild(container);
        document.body.removeChild(walletButton);
    });

    it('creates an instance of GooglePayPaymentStrategy', () => {
        expect(strategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });

    describe('#initialize()', () => {
        let googlePayOptions: PaymentInitializeOptions;

        beforeEach(() => {
            jest.spyOn(walletButton, 'addEventListener');
            googlePayOptions = { methodId: 'googlepay', googlepay: { walletButton: 'mockButton' } };
        });

        it('loads googlepay script', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(googlePayOptions);

            expect(googlePayPaymentProcessor.initialize).toHaveBeenCalled();
        });

        it('does not load googlepay if initialization options are not provided', async () => {
            googlePayOptions = { methodId: 'googlepay'};

            try {
                await strategy.initialize(googlePayOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('adds the event listener to the wallet button', async () => {
            await strategy.initialize(googlePayOptions);

            expect(walletButton.addEventListener).toHaveBeenCalled();
        });

        it('does not add the event listener to the wallet button', async () => {
            googlePayOptions = { methodId: 'googlepay', googlepay: { } };

            await strategy.initialize(googlePayOptions);

            expect(walletButton.addEventListener).toHaveBeenCalledTimes(0);
        });

        it('checks if element exist in the DOM', async () => {
            if (googlePayOptions.googlepay && googlePayOptions.googlepay.walletButton) {
                jest.spyOn(document, 'getElementById').mockReturnValue(document.getElementById(googlePayOptions.googlepay.walletButton));

                await strategy.initialize(googlePayOptions);

                expect(document.getElementById).toHaveBeenCalledWith(googlePayOptions.googlepay.walletButton);
            }
        });
    });

    describe('#deinitialize', () => {
        let googlePayOptions: PaymentInitializeOptions;

        beforeEach(() => {
            jest.spyOn(walletButton, 'addEventListener');
            googlePayOptions = { methodId: 'googlepay', googlepay: { walletButton: 'mockButton' } };
        });

        it('deinitializes googlePayInitializer and GooglePayment Processor', async () => {
            jest.spyOn(googlePayPaymentProcessor, 'deinitialize').mockReturnValue(Promise.resolve());

            await strategy.deinitialize();

            expect(googlePayPaymentProcessor.deinitialize).toHaveBeenCalled();
        });

        it('removes the eventListener', async () => {
            jest.spyOn(googlePayPaymentProcessor, 'deinitialize').mockReturnValue(Promise.resolve());

            await strategy.initialize(googlePayOptions);
            await strategy.deinitialize();

            expect(googlePayPaymentProcessor.deinitialize).toHaveBeenCalled();
        });
    });

    describe('#execute', () => {
        let googlePayOptions: PaymentInitializeOptions;

        beforeEach(() => {
            jest.spyOn(walletButton, 'addEventListener');
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve());
            googlePayOptions = {
                methodId: 'googlepay',
                googlepay: {
                    walletButton: 'mockButton',
                    onError: () => {},
                    onPaymentSelect: () => {},
                },
            };
        });

        it('creates the order and submit payment', async () => {
            const googlePaymentMethodData = {
                initializationData: {
                    nonce: 'nonce',
                    card_information: 'card_info',
                },
            };
            jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(Promise.resolve());
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(googlePaymentMethodData);

            await strategy.initialize(googlePayOptions);
            await strategy.execute(getGoogleOrderRequestBody());

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
        });

        it('throws and error when GooglePaymentOptions are not available', async () => {
            try {
                await strategy.execute(getGoogleOrderRequestBody());
            } catch (exception) {
                expect(exception).toBeInstanceOf(InvalidArgumentError);
                expect(exception).toEqual(
                    new InvalidArgumentError('Unable to initialize payment because "options.googlepay" argument is not provided.')
                );
            }
        });

        it('gets again the payment information and submit payment', async () => {
            const googlePaymentMethodData = {
                initializationData: {
                    nonce: 'nonce',
                    card_information: undefined,
                },
            };

            const paymentData = {
                cardInfo: {
                    billingAddress: {},
                },
                paymentMethodToken: {},
                shippingAddress: {},
                email: 'email',
            } as GooglePaymentData;

            jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(Promise.resolve());
            jest.spyOn(googlePayPaymentProcessor, 'handleSuccess').mockReturnValue(Promise.resolve());
            jest.spyOn(googlePayPaymentProcessor, 'displayWallet').mockReturnValue(Promise.resolve(paymentData));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(googlePaymentMethodData);

            await strategy.initialize(googlePayOptions);
            await strategy.execute(getGoogleOrderRequestBody());

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
        });

        it('gets again the payment information and gets an error', async () => {
            const googlePaymentMethodData = {
                initializationData: {
                    nonce: 'nonce',
                    card_information: undefined,
                },
            };

            jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(Promise.resolve());
            jest.spyOn(googlePayPaymentProcessor, 'handleSuccess').mockReturnValue(Promise.resolve());
            jest.spyOn(googlePayPaymentProcessor, 'displayWallet').mockReturnValue(
                Promise.reject({statusCode: 'ERROR'})
            );
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(googlePaymentMethodData);

            await strategy.initialize(googlePayOptions);
            await strategy.execute(getGoogleOrderRequestBody());

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
        });

        it('gets again the payment information and user closes widget', async () => {
            const googlePaymentMethodData = {
                initializationData: {
                    nonce: 'nonce',
                    card_information: undefined,
                },
            };

            jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(Promise.resolve());
            jest.spyOn(googlePayPaymentProcessor, 'handleSuccess').mockReturnValue(Promise.resolve());
            jest.spyOn(googlePayPaymentProcessor, 'displayWallet').mockReturnValue(
                Promise.reject({statusCode: 'CANCELED'})
            );
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(googlePaymentMethodData);

            await strategy.initialize(googlePayOptions);
            await strategy.execute(getGoogleOrderRequestBody());

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
        });

        it('gets again the payment information and methodId is not defined', async () => {
            const googlePaymentMethodData = {
                initializationData: {
                    nonce: 'nonce',
                    card_information: undefined,
                },
            };

            const googlePayOptionsWithOutMethodId: any = {
                googlepay: {
                    walletButton: 'mockButton',
                    onError: () => {},
                    onPaymentSelect: () => {},
                },
            };

            const paymentData = {
                cardInfo: {
                    billingAddress: {},
                },
                paymentMethodToken: {},
                shippingAddress: {},
                email: 'email',
            } as GooglePaymentData;

            jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(Promise.resolve());
            jest.spyOn(googlePayPaymentProcessor, 'handleSuccess').mockReturnValue(Promise.resolve());
            jest.spyOn(googlePayPaymentProcessor, 'displayWallet').mockReturnValue(Promise.resolve(paymentData));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(googlePaymentMethodData);

            await strategy.initialize(googlePayOptionsWithOutMethodId);
            try {
                await strategy.execute(getGoogleOrderRequestBody());
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
                expect(error).toEqual(new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized));
            }
        });

        it('gets again the payment information and in getPayment, paymentMethod is missed', async () => {
            const paymentData = {
                cardInfo: {
                    billingAddress: {},
                },
                paymentMethodToken: {},
                shippingAddress: {},
                email: 'email',
            } as GooglePaymentData;

            jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(Promise.resolve());
            jest.spyOn(googlePayPaymentProcessor, 'handleSuccess').mockReturnValue(Promise.resolve());
            jest.spyOn(googlePayPaymentProcessor, 'displayWallet').mockReturnValue(Promise.resolve(paymentData));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(undefined);

            await strategy.initialize(googlePayOptions);
            try {
                await strategy.execute(getGoogleOrderRequestBody());
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
                expect(error).toEqual(new MissingDataError(MissingDataErrorType.MissingPaymentMethod));
            }
        });

        it('gets again the payment information and in getPayment, nonce is missed', async () => {
            const paymentData = {
                cardInfo: {
                    billingAddress: {},
                },
                paymentMethodToken: {},
                shippingAddress: {},
                email: 'email',
            } as GooglePaymentData;

            const googlePaymentMethodData = {
                initializationData: {
                    nonce: undefined,
                    card_information: undefined,
                },
            };

            jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(Promise.resolve());
            jest.spyOn(googlePayPaymentProcessor, 'handleSuccess').mockReturnValue(Promise.resolve());
            jest.spyOn(googlePayPaymentProcessor, 'displayWallet').mockReturnValue(Promise.resolve(paymentData));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(googlePaymentMethodData);

            await strategy.initialize(googlePayOptions);
            try {
                await strategy.execute(getGoogleOrderRequestBody());
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
                expect(error).toEqual(new MissingDataError(MissingDataErrorType.MissingPayment));
            }
        });
    });
});
