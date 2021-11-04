import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { OrderActionCreator } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrder } from '../../../order/orders.mock';
import { createPaymentClient, createPaymentStrategyRegistry, PaymentActionCreator, PaymentInitializeOptions, PaymentMethod, PaymentMethodActionCreator, PaymentMethodRequestSender, PaymentRequestSender, PaymentStrategyActionCreator } from '../../../payment';
import { createSpamProtection, PaymentHumanVerificationHandler, SpamProtectionActionCreator, SpamProtectionRequestSender } from '../../../spam-protection';
import { getGooglePay, getPaymentMethodsState } from '../../payment-methods.mock';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { AdyenV2ScriptLoader } from '../adyenv2';
import { BraintreeScriptLoader, BraintreeSDKCreator } from '../braintree';

import createGooglePayPaymentProcessor from './create-googlepay-payment-processor';
import GooglePayAdyenV2PaymentProcessor from './googlepay-adyenv2-payment-processor';
import GooglePayBraintreeInitializer from './googlepay-braintree-initializer';
import GooglePayPaymentProcessor from './googlepay-payment-processor';
import GooglePayPaymentStrategy from './googlepay-payment-strategy';
import { getGoogleOrderRequestBody, getGooglePaymentDataMock } from './googlepay.mock';

describe('GooglePayPaymentStrategy', () => {
    let store: CheckoutStore;
    let strategy: GooglePayPaymentStrategy;
    let checkoutActionCreator: CheckoutActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentStrategyActionCreator: PaymentStrategyActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let orderActionCreator: OrderActionCreator;
    let googlePayPaymentProcessor: GooglePayPaymentProcessor;
    let container: HTMLDivElement;
    let walletButton: HTMLAnchorElement;
    let paymentMethodMock: PaymentMethod;
    let googlePayAdyenV2PaymentProcessor: GooglePayAdyenV2PaymentProcessor;
    let braintreeSDKCreator: BraintreeSDKCreator;

    beforeEach(() => {
        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        const requestSender = createRequestSender();
        const paymentMethodRequestSender: PaymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
        const scriptLoader = createScriptLoader();
        const paymentClient = createPaymentClient(store);
        const spamProtection = createSpamProtection(scriptLoader);
        const registry = createPaymentStrategyRegistry(store, paymentClient, requestSender, spamProtection, 'en_US');

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender))
        );
        paymentMethodActionCreator = new PaymentMethodActionCreator(store, paymentMethodRequestSender);
        paymentStrategyActionCreator = new PaymentStrategyActionCreator(
            registry,
            orderActionCreator,
            new SpamProtectionActionCreator(spamProtection, new SpamProtectionRequestSender(requestSender))
        );
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(paymentClient),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(scriptLoader))
        );
        orderActionCreator = new OrderActionCreator(
            paymentClient,
            new CheckoutValidator(
                new CheckoutRequestSender(requestSender)
            )
        );

        googlePayPaymentProcessor = createGooglePayPaymentProcessor(
            store,
            new GooglePayBraintreeInitializer(
                new BraintreeSDKCreator(
                    new BraintreeScriptLoader(createScriptLoader())
                )
            )
        );

        googlePayAdyenV2PaymentProcessor = new GooglePayAdyenV2PaymentProcessor(store, paymentActionCreator, new AdyenV2ScriptLoader(scriptLoader, getStylesheetLoader()));
        braintreeSDKCreator = new BraintreeSDKCreator(new BraintreeScriptLoader(createScriptLoader()));

        strategy = new GooglePayPaymentStrategy(
            store,
            checkoutActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            paymentActionCreator,
            orderActionCreator,
            googlePayPaymentProcessor,
            googlePayAdyenV2PaymentProcessor,
            braintreeSDKCreator
        );

        container = document.createElement('div');
        walletButton = document.createElement('a');
        container.setAttribute('id', 'login');
        walletButton.setAttribute('id', 'mockButton');
        document.body.appendChild(container);
        document.body.appendChild(walletButton);

        const googlePaymentMethodData = {
            initializationData: {
                nonce: '',
                card_information: 'card_info',
                isThreeDSecureEnabled: true,
            },
        };

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(googlePaymentMethodData);
        jest.spyOn(walletButton, 'removeEventListener');
        jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve());
        jest.spyOn(checkoutActionCreator, 'loadCurrentCheckout').mockReturnValue(Promise.resolve());
        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(googlePayPaymentProcessor, 'initialize').mockReturnValue(Promise.resolve());
        jest.spyOn(googlePayAdyenV2PaymentProcessor, 'initialize').mockReturnValue(Promise.resolve());
        jest.spyOn(googlePayAdyenV2PaymentProcessor, 'processAdditionalAction').mockReturnValue(Promise.resolve());

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
            googlePayOptions = { methodId: 'googlepaybraintree', googlepaybraintree: { walletButton: 'mockButton' } };
        });

        it('loads googlepay script', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(googlePayOptions);

            expect(googlePayPaymentProcessor.initialize).toHaveBeenCalled();
        });

        it('does not load googlepay if initialization options are not provided', async () => {
            googlePayOptions = { methodId: 'googlepaybraintree'};

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
            googlePayOptions = { methodId: 'googlepaybraintree', googlepaybraintree: { } };

            await expect(strategy.initialize(googlePayOptions)).rejects.toThrow('walletButton argument is missing');
        });

        it('checks if element exist in the DOM', async () => {
            if (googlePayOptions.googlepaybraintree && googlePayOptions.googlepaybraintree.walletButton) {
                jest.spyOn(document, 'getElementById').mockReturnValue(document.getElementById(googlePayOptions.googlepaybraintree.walletButton));

                await strategy.initialize(googlePayOptions);

                expect(document.getElementById).toHaveBeenCalledWith(googlePayOptions.googlepaybraintree.walletButton);
            }
        });
    });

    describe('#deinitialize', () => {
        let googlePayOptions: PaymentInitializeOptions;

        beforeEach(() => {
            jest.spyOn(walletButton, 'addEventListener');
            googlePayOptions = { methodId: 'googlepaybraintree', googlepaybraintree: { walletButton: 'mockButton' } };
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
        const order = getOrder();

        beforeEach(() => {
            jest.spyOn(walletButton, 'addEventListener');
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve()).mockReturnValue(store.getState());
            jest.spyOn(store.getState().order, 'getOrderOrThrow').mockReturnValue(order);
            googlePayOptions = {
                methodId: 'googlepaybraintree',
                googlepaybraintree: {
                    walletButton: 'mockButton',
                    onError: () => {},
                    onPaymentSelect: () => {},
                },
            };
        });

        it('creates the order and submit payment', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                initializationData: {
                    nonce: 'nonce',
                    card_information: {
                        type: 'type',
                        number: 'number',
                    },
                    isThreeDSecureEnabled: false,
                },
            });

            await strategy.initialize(googlePayOptions);

            jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(Promise.resolve());

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
            jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(Promise.resolve());
            jest.spyOn(googlePayPaymentProcessor, 'handleSuccess').mockReturnValue(Promise.resolve());
            jest.spyOn(googlePayPaymentProcessor, 'displayWallet').mockReturnValue(Promise.resolve(getGooglePaymentDataMock()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                initializationData: {
                    nonce: 'nonce',
                    card_information: undefined,
                    isThreeDSecureEnabled: false,
                },
            });

            await strategy.initialize(googlePayOptions);
            await strategy.execute(getGoogleOrderRequestBody());

            expect(googlePayPaymentProcessor.displayWallet).toBeCalled();
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
        });

        it('gets again the payment information and gets an error', async () => {
            jest.spyOn(googlePayPaymentProcessor, 'handleSuccess').mockReturnValue(Promise.resolve());
            jest.spyOn(googlePayPaymentProcessor, 'displayWallet').mockReturnValue(
                Promise.reject({statusCode: 'ERROR'})
            );
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                initializationData: {
                    nonce: 'nonce',
                    card_information: undefined,
                    isThreeDSecureEnabled: false,
                },
            });

            await strategy.initialize(googlePayOptions);
            await strategy.execute(getGoogleOrderRequestBody());

            expect(googlePayPaymentProcessor.displayWallet).toBeCalled();
        });

        it('gets again the payment information and get a new nonce', async () => {
            jest.spyOn(googlePayPaymentProcessor, 'handleSuccess').mockReturnValue(Promise.resolve());
            jest.spyOn(googlePayPaymentProcessor, 'displayWallet').mockReturnValue(getGooglePaymentDataMock());
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValueOnce({
                initializationData: {
                    nonce: '',
                    card_information: {
                        type: 'type',
                        number: 'number',
                    },
                    isThreeDSecureEnabled: false,
                },
            }).mockReturnValue({
                initializationData: {
                    nonce: 'newNonce',
                    card_information: {
                        type: 'type',
                        number: 'number',
                    },
                    isThreeDSecureEnabled: false,
                },
            });

            await strategy.initialize(googlePayOptions);
            await strategy.execute(getGoogleOrderRequestBody());

            expect(store.getState().paymentMethods.getPaymentMethodOrThrow).toHaveBeenCalledTimes(4);
            expect(googlePayPaymentProcessor.displayWallet).toBeCalled();
        });

        it('gets again the payment information and user closes widget', async () => {
            jest.spyOn(googlePayPaymentProcessor, 'handleSuccess').mockReturnValue(Promise.resolve());
            jest.spyOn(googlePayPaymentProcessor, 'displayWallet').mockReturnValue(
                Promise.reject({statusCode: 'CANCELED'})
            );
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                initializationData: {
                    nonce: 'nonce',
                    card_information: undefined,
                    isThreeDSecureEnabled: true,
                },
            });

            await strategy.initialize(googlePayOptions);

            await expect(strategy.execute(getGoogleOrderRequestBody())).rejects.toThrow('CANCELED');
            expect(googlePayPaymentProcessor.displayWallet).toBeCalled();
        });

        it('gets again the payment information and in getPayment, nonce is missed', async () => {
            jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(Promise.resolve());
            jest.spyOn(googlePayPaymentProcessor, 'handleSuccess').mockReturnValue(Promise.resolve());
            jest.spyOn(googlePayPaymentProcessor, 'displayWallet').mockReturnValue(Promise.resolve(getGooglePaymentDataMock()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                initializationData: {
                    nonce: undefined,
                    card_information: undefined,
                    isThreeDSecureEnabled: true,
                },
            });

            await strategy.initialize(googlePayOptions);
            try {
                await strategy.execute(getGoogleOrderRequestBody());
            } catch (error) {
                expect(googlePayPaymentProcessor.displayWallet).toBeCalled();
                expect(error).toBeInstanceOf(MissingDataError);
                expect(error).toEqual(new MissingDataError(MissingDataErrorType.MissingPayment));
            }
        });

        it('submits json encoded nonce for googlepayadyenv2', async () => {
            googlePayOptions = {
                methodId: 'googlepayadyenv2',
                googlepayadyenv2: {
                    walletButton: 'mockButton',
                    onError: () => {},
                    onPaymentSelect: () => {},
                },
            };

            jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(Promise.resolve());
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                initializationData: {
                    nonce: 'token',
                    card_information: 'ci',
                    isThreeDSecureEnabled: true,
                },
            });

            await strategy.initialize({
                methodId: 'googlepayadyenv2',
                googlepayadyenv2: googlePayOptions.googlepayadyenv2,
            });

            await strategy.execute({
                ...getGoogleOrderRequestBody(),
                payment: { methodId: 'googlepayadyenv2' },
            });

            expect(googlePayAdyenV2PaymentProcessor.initialize).toHaveBeenCalled();
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                methodId: 'googlepayadyenv2',
                paymentData: {
                    nonce: '{"type":"paywithgoogle","googlePayToken":"token","browser_info":{"color_depth":24,"java_enabled":false,"language":"en-US","screen_height":0,"screen_width":0,"time_zone_offset":"' + new Date().getTimezoneOffset().toString() + '"}}',
                    method: 'googlepayadyenv2',
                    cardInformation: 'ci',
                },
            });
        });

        it('submits json encoded nonce for authorizenet', async () => {
            googlePayOptions = {
                methodId: 'googlepayauthorizenet',
                googlepayauthorizenet: {
                    walletButton: 'mockButton',
                    onError: () => {},
                    onPaymentSelect: () => {},
                },
            };

            jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(Promise.resolve());
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                initializationData: {
                    nonce: 'token',
                    card_information: 'ci',
                    isThreeDSecureEnabled: true,
                },
            });

            await strategy.initialize({
                methodId: 'googlepayauthorizenet',
                googlepayauthorizenet: googlePayOptions.googlepayauthorizenet,
            });

            await strategy.execute({
                ...getGoogleOrderRequestBody(),
                payment: { methodId: 'googlepayauthorizenet' },
            });

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                methodId: 'googlepayauthorizenet',
                paymentData: {
                    nonce: 'token',
                    method: 'googlepayauthorizenet',
                    cardInformation: 'ci',
                },
            });
        });

        it('submits json encoded nonce for stripe', async () => {
            googlePayOptions = {
                methodId: 'googlepaystripe',
                googlepaystripe: {
                    walletButton: 'mockButton',
                    onError: () => {},
                    onPaymentSelect: () => {},
                },
            };

            jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(Promise.resolve());
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                initializationData: {
                    nonce: 'token',
                    card_information: 'ci',
                    isThreeDSecureEnabled: true,
                },
            });

            await strategy.initialize({
                methodId: 'googlepaystripe',
                googlepaystripe: googlePayOptions.googlepaystripe,
            });

            await strategy.execute({
                ...getGoogleOrderRequestBody(),
                payment: { methodId: 'googlepaystripe' },
            });

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                methodId: 'googlepaystripe',
                paymentData: {
                    nonce: 'token',
                    method: 'googlepaystripe',
                    cardInformation: 'ci',
                },
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
