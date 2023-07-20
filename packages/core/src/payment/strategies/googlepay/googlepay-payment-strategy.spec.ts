import { createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';
import { noop } from 'lodash';
import { of } from 'rxjs';

import { getCartState } from '../../../cart/carts.mock';
import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    RequestError,
} from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { OrderActionCreator } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrder } from '../../../order/orders.mock';
import {
    createPaymentClient,
    createPaymentStrategyRegistry,
    createPaymentStrategyRegistryV2,
    PaymentActionCreator,
    PaymentInitializeOptions,
    PaymentMethod,
    PaymentMethodActionCreator,
    PaymentMethodRequestSender,
    PaymentRequestSender,
    PaymentStrategyActionCreator,
} from '../../../payment';
import { createPaymentIntegrationService } from '../../../payment-integration';
import {
    createSpamProtection,
    PaymentHumanVerificationHandler,
    SpamProtectionActionCreator,
    SpamProtectionRequestSender,
} from '../../../spam-protection';
import { PaymentActionType } from '../../payment-actions';
import { getGooglePay, getPaymentMethodsState } from '../../payment-methods.mock';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { getErrorPaymentResponseBody } from '../../payments.mock';
import { AdyenV2ScriptLoader } from '../adyenv2';
import { BraintreeScriptLoader, BraintreeSDKCreator } from '../braintree';

import createGooglePayPaymentProcessor from './create-googlepay-payment-processor';
import GooglePayAdyenV2PaymentProcessor from './googlepay-adyenv2-payment-processor';
import GooglePayBraintreeInitializer from './googlepay-braintree-initializer';
import GooglePayCheckoutcomPaymentProcessor from './googlepay-checkoutcom-payment-processor';
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
    let googlePayCheckoutcomPaymentProcessor: GooglePayCheckoutcomPaymentProcessor;
    let braintreeSDKCreator: BraintreeSDKCreator;
    const verifyCard: jest.Mock = jest.fn(({ onLookupComplete }) => {
        onLookupComplete('nonce', noop);

        return { nonce: 'verificationNonce' };
    });
    const initializeBraintreeSDK: jest.Mock = jest.fn();
    const initializationData = {
        nonce: 'nonce',
        card_information: 'card_info',
        isThreeDSecureEnabled: true,
    };

    beforeEach(() => {
        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        const requestSender = createRequestSender();
        const paymentMethodRequestSender: PaymentMethodRequestSender =
            new PaymentMethodRequestSender(requestSender);
        const scriptLoader = createScriptLoader();
        const paymentClient = createPaymentClient(store);
        const spamProtection = createSpamProtection(scriptLoader);
        const registry = createPaymentStrategyRegistry(
            store,
            paymentClient,
            requestSender,
            spamProtection,
            'en_US',
        );
        const paymentIntegrationService = createPaymentIntegrationService(store);
        const registryV2 = createPaymentStrategyRegistryV2(paymentIntegrationService);

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
        );
        paymentMethodActionCreator = new PaymentMethodActionCreator(paymentMethodRequestSender);
        orderActionCreator = new OrderActionCreator(
            paymentClient,
            new CheckoutValidator(new CheckoutRequestSender(requestSender)),
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
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(paymentClient),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(scriptLoader)),
        );

        braintreeSDKCreator = new BraintreeSDKCreator(
            new BraintreeScriptLoader(createScriptLoader()),
        );

        googlePayPaymentProcessor = createGooglePayPaymentProcessor(
            store,
            new GooglePayBraintreeInitializer(braintreeSDKCreator),
        );
        googlePayAdyenV2PaymentProcessor = new GooglePayAdyenV2PaymentProcessor(
            store,
            paymentActionCreator,
            new AdyenV2ScriptLoader(scriptLoader, getStylesheetLoader()),
        );
        googlePayCheckoutcomPaymentProcessor = new GooglePayCheckoutcomPaymentProcessor();

        container = document.createElement('div');
        walletButton = document.createElement('a');
        container.setAttribute('id', 'login');
        walletButton.setAttribute('id', 'mockButton');
        document.body.appendChild(container);
        document.body.appendChild(walletButton);

        const googlePaymentMethodData = {
            initializationData,
        };
        const order = getOrder();

        jest.spyOn(store, 'dispatch');
        jest.spyOn(store.getState().order, 'getOrderOrThrow').mockReturnValue(order);
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
            googlePaymentMethodData,
        );
        jest.spyOn(walletButton, 'removeEventListener');
        jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve());
        jest.spyOn(checkoutActionCreator, 'loadCurrentCheckout').mockReturnValue(Promise.resolve());
        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(
            Promise.resolve(store.getState()),
        );
        jest.spyOn(googlePayAdyenV2PaymentProcessor, 'initialize').mockReturnValue(
            Promise.resolve(),
        );
        jest.spyOn(googlePayAdyenV2PaymentProcessor, 'processAdditionalAction').mockReturnValue(
            Promise.resolve(),
        );
        jest.spyOn(googlePayCheckoutcomPaymentProcessor, 'processAdditionalAction').mockReturnValue(
            Promise.resolve(),
        );
        jest.spyOn(googlePayPaymentProcessor, 'updatePaymentDataRequest').mockReturnValue(
            Promise.resolve(),
        );
        jest.spyOn(googlePayPaymentProcessor, 'initialize').mockReturnValue(Promise.resolve());
        jest.spyOn(googlePayPaymentProcessor, 'deinitialize').mockReturnValue(Promise.resolve());
        jest.spyOn(googlePayPaymentProcessor, 'displayWallet').mockReturnValue(
            Promise.resolve(getGooglePaymentDataMock()),
        );
        jest.spyOn(googlePayPaymentProcessor, 'handleSuccess').mockReturnValue(Promise.resolve());
        jest.spyOn(braintreeSDKCreator, 'initialize').mockImplementationOnce(
            initializeBraintreeSDK,
        );
        jest.spyOn(braintreeSDKCreator, 'get3DS').mockResolvedValue({ verifyCard });
        jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(
            Promise.resolve(store.getState()),
        );
        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(Promise.resolve());
        jest.spyOn(walletButton, 'addEventListener');
        jest.spyOn(paymentStrategyActionCreator, 'widgetInteraction').mockImplementation((cb) =>
            cb(),
        );

        paymentMethodMock = { ...getGooglePay() };
    });

    afterEach(() => {
        document.body.removeChild(container);
        document.body.removeChild(walletButton);
        jest.clearAllMocks();
    });

    describe('GooglePayPaymentStrategy Other Providers', () => {
        beforeEach(() => {
            jest.spyOn(store, 'dispatch')
                .mockReturnValue(Promise.resolve())
                .mockReturnValue(store.getState());

            strategy = new GooglePayPaymentStrategy(
                store,
                checkoutActionCreator,
                paymentMethodActionCreator,
                paymentStrategyActionCreator,
                paymentActionCreator,
                orderActionCreator,
                googlePayPaymentProcessor,
                undefined,
                braintreeSDKCreator,
            );
        });

        describe('#initialize()', () => {
            let googlePayOptions: PaymentInitializeOptions;

            beforeEach(() => {
                jest.spyOn(store, 'dispatch')
                    .mockReturnValue(Promise.resolve())
                    .mockReturnValue(store.getState());

                googlePayOptions = {
                    methodId: 'googlepaybraintree',
                    googlepaybraintree: {
                        walletButton: 'mockButton',
                    },
                };
            });

            it('loads googlepay script', async () => {
                paymentMethodMock.config.testMode = true;

                await strategy.initialize(googlePayOptions);

                expect(googlePayPaymentProcessor.initialize).toHaveBeenCalled();
            });

            it('throws an error when Adyen Processor not loaded', async () => {
                await expect(
                    strategy.initialize({
                        methodId: 'googlepayadyenv2',
                        googlepayadyenv2: {},
                    }),
                ).rejects.toThrow(
                    'Unable to proceed because the payment step of checkout has not been initialized.',
                );
            });

            it('does not load googlepay if initialization options are not provided', async () => {
                googlePayOptions = { methodId: 'googlepaycheckoutcom' };

                try {
                    await strategy.initialize(googlePayOptions);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidArgumentError);
                }
            });

            it('adds the event listener to the wallet button', async () => {
                await strategy.initialize({
                    methodId: 'googlepaycheckoutcom',
                    googlepaycheckoutcom: googlePayOptions.googlepaybraintree,
                });

                expect(walletButton.addEventListener).toHaveBeenCalled();
            });

            it('clicks on wallet button triggers widgetInteractionclear', async () => {
                await strategy.initialize(googlePayOptions);
                walletButton.click();

                expect(paymentStrategyActionCreator.widgetInteraction).toHaveBeenCalledWith(
                    expect.any(Function),
                    { methodId: 'googlepaybraintree' },
                );
            });

            it('does not add the event listener to the wallet button', async () => {
                googlePayOptions = {
                    methodId: 'googlepaycybersourcev2',
                    googlepaycybersourcev2: {},
                };

                await expect(strategy.initialize(googlePayOptions)).rejects.toThrow(
                    'walletButton argument is missing',
                );
            });

            it('checks if element exist in the DOM', async () => {
                jest.spyOn(document, 'getElementById').mockReturnValue(
                    document.getElementById(
                        googlePayOptions.googlepaybraintree?.walletButton || '',
                    ),
                );

                await strategy.initialize(googlePayOptions);

                expect(document.getElementById).toHaveBeenCalledWith(
                    googlePayOptions.googlepaybraintree?.walletButton,
                );
            });

            it('initialize brainTreeSDK on clientToken', async () => {
                const updatedPaymentMethod = {
                    initializationData: {
                        ...initializationData,
                        card_information: {
                            type: 'type',
                            number: 'number',
                        },
                        isThreeDSecureEnabled: false,
                    },
                    clientToken: 'clienttoken',
                };

                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(updatedPaymentMethod);

                await strategy.initialize(googlePayOptions);

                expect(initializeBraintreeSDK).toHaveBeenCalledWith(
                    'clienttoken',
                    updatedPaymentMethod.initializationData,
                );
            });

            it('throws error if element doesnt exist in the DOM', async () => {
                jest.spyOn(document, 'getElementById').mockReturnValueOnce(undefined);

                await expect(strategy.initialize(googlePayOptions)).rejects.toThrow(
                    'Unable to create wallet, walletButton ID could not be found',
                );
            });
        });

        describe('#deinitialize', () => {
            let googlePayOptions: PaymentInitializeOptions;

            beforeEach(() => {
                googlePayOptions = {
                    methodId: 'googlepayorbital',
                    googlepayorbital: { walletButton: 'mockButton' },
                };
            });

            it('deinitializes googlePayInitializer and GooglePayment Processor', async () => {
                await strategy.deinitialize();

                expect(googlePayPaymentProcessor.deinitialize).toHaveBeenCalled();
            });

            it('removes the eventListener', async () => {
                await strategy.initialize(googlePayOptions);
                await strategy.deinitialize();

                expect(googlePayPaymentProcessor.deinitialize).toHaveBeenCalled();
            });
        });

        describe('#execute', () => {
            let googlePayOptions: PaymentInitializeOptions;
            const googlePayPayload = {
                walletButton: 'mockButton',
                onError: jest.fn(),
                onPaymentSelect: jest.fn(),
            };

            beforeEach(() => {
                jest.spyOn(store, 'dispatch')
                    .mockReturnValue(Promise.resolve())
                    .mockReturnValue(store.getState());
                googlePayOptions = {
                    methodId: 'googlepaybraintree',
                    googlepaybraintree: googlePayPayload,
                };
            });

            it('creates the order and submit payment', async () => {
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
                        new InvalidArgumentError(
                            'Unable to initialize payment because "options.googlepay" argument is not provided.',
                        ),
                    );
                }
            });

            it('gets again the payment information and submit payment', async () => {
                const googleOptionsWallet = {
                    methodId: 'googlepaybraintree',
                    googlepaybraintree: {
                        walletButton: 'mockButton',
                    },
                };

                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({
                    initializationData: {
                        ...initializationData,
                        card_information: undefined,
                    },
                });

                await strategy.initialize(googleOptionsWallet);
                await strategy.execute(getGoogleOrderRequestBody());

                expect(googlePayPaymentProcessor.displayWallet).toHaveBeenCalled();
                expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            });

            it('gets again the payment information and gets an error', async () => {
                jest.spyOn(googlePayPaymentProcessor, 'displayWallet').mockReturnValue(
                    Promise.reject({ statusCode: 'ERROR' }),
                );
                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({
                    initializationData: {
                        ...initializationData,
                        card_information: undefined,
                    },
                });

                await strategy.initialize(googlePayOptions);
                await strategy.execute(getGoogleOrderRequestBody());

                expect(googlePayPaymentProcessor.displayWallet).toHaveBeenCalled();
            });

            it('gets again the payment information and get a new nonce', async () => {
                jest.spyOn(googlePayPaymentProcessor, 'displayWallet').mockReturnValue(
                    getGooglePaymentDataMock(),
                );
                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                    .mockReturnValue({
                        initializationData: {
                            nonce: '',
                            card_information: {
                                type: 'type',
                                number: 'number',
                            },
                            isThreeDSecureEnabled: false,
                        },
                    })
                    .mockReturnValue({
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

                expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                    methodId: 'googlepaybraintree',
                    paymentData: {
                        cardInformation: {
                            number: 'number',
                            type: 'type',
                        },
                        method: 'googlepaybraintree',
                        nonce: 'newNonce',
                    },
                });
            });

            it('gets again the payment information and user closes widget', async () => {
                jest.spyOn(googlePayPaymentProcessor, 'displayWallet').mockReturnValue(
                    Promise.reject({ statusCode: 'CANCELED' }),
                );
                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({
                    initializationData: {
                        ...initializationData,
                        card_information: undefined,
                    },
                });

                await strategy.initialize(googlePayOptions);

                await expect(strategy.execute(getGoogleOrderRequestBody())).rejects.toThrow(
                    'CANCELED',
                );
                expect(googlePayPaymentProcessor.displayWallet).toHaveBeenCalled();
            });

            it('gets again the payment information and in getPayment, nonce is missed', async () => {
                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({
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
                    expect(googlePayPaymentProcessor.displayWallet).toHaveBeenCalled();
                    expect(error).toBeInstanceOf(MissingDataError);
                    expect(error).toEqual(
                        new MissingDataError(MissingDataErrorType.MissingPayment),
                    );
                }
            });

            it('submits json encoded nonce for authorizenet', async () => {
                googlePayOptions = {
                    methodId: 'googlepayauthorizenet',
                    googlepayauthorizenet: googlePayPayload,
                };

                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({
                    initializationData: {
                        nonce: 'token',
                        card_information: 'ci',
                        isThreeDSecureEnabled: true,
                    },
                });

                await strategy.initialize(googlePayOptions);

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

            it('submits json encoded nonce for BNZ', async () => {
                googlePayOptions = {
                    methodId: 'googlepaybnz',
                    googlepaybnz: {
                        walletButton: 'mockButton',
                        onError: noop,
                        onPaymentSelect: noop,
                    },
                };

                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({
                    initializationData: {
                        nonce: 'token',
                        card_information: 'ci',
                        isThreeDSecureEnabled: true,
                    },
                });

                await strategy.initialize({
                    methodId: 'googlepaybnz',
                    googlepaybnz: googlePayOptions.googlepaybnz,
                });

                await strategy.execute({
                    ...getGoogleOrderRequestBody(),
                    payment: { methodId: 'googlepaybnz' },
                });

                expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                    methodId: 'googlepaybnz',
                    paymentData: {
                        nonce: 'token',
                        method: 'googlepaybnz',
                        cardInformation: 'ci',
                    },
                });
            });

            it('submits json encoded nonce for stripe', async () => {
                googlePayOptions = {
                    methodId: 'googlepaystripe',
                    googlepaystripe: {
                        walletButton: 'mockButton',
                        onError: noop,
                        onPaymentSelect: noop,
                    },
                };

                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({
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

            it('submits json encoded nonce for stripe UPE', async () => {
                googlePayOptions = {
                    methodId: 'googlepaystripeupe',
                    googlepaystripeupe: {
                        walletButton: 'mockButton',
                        onError: noop,
                        onPaymentSelect: noop,
                    },
                };

                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({
                    initializationData: {
                        nonce: 'token',
                        card_information: 'ci',
                        isThreeDSecureEnabled: true,
                    },
                });

                await strategy.initialize({
                    methodId: 'googlepaystripeupe',
                    googlepaystripeupe: googlePayOptions.googlepaystripeupe,
                });

                await strategy.execute({
                    ...getGoogleOrderRequestBody(),
                    payment: { methodId: 'googlepaystripeupe' },
                });

                expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                    methodId: 'googlepaystripeupe',
                    paymentData: {
                        nonce: 'token',
                        method: 'googlepaystripeupe',
                        cardInformation: 'ci',
                    },
                });
            });

            it('should verify card on 3DS', async () => {
                await strategy.initialize({
                    methodId: 'googlepaybraintree',
                    googlepaybraintree: googlePayPayload,
                });

                await strategy.execute({
                    ...getGoogleOrderRequestBody(),
                    payment: { methodId: 'googlepaybraintree' },
                });

                expect(verifyCard).toHaveBeenCalledWith(
                    expect.objectContaining({
                        amount: 190,
                        nonce: 'nonce',
                        onLookupComplete: expect.any(Function),
                    }),
                );

                expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                    methodId: 'googlepaybraintree',
                    paymentData: {
                        nonce: 'verificationNonce',
                        method: 'googlepaybraintree',
                        cardInformation: 'card_info',
                    },
                });
            });

            it('should throw error when verify card fails', async () => {
                jest.spyOn(braintreeSDKCreator, 'get3DS').mockResolvedValue(undefined);

                await strategy.initialize({
                    methodId: 'googlepaybraintree',
                    googlepaybraintree: googlePayPayload,
                });

                await expect(
                    strategy.execute({
                        ...getGoogleOrderRequestBody(),
                        payment: { methodId: 'googlepaybraintree' },
                    }),
                ).rejects.toThrow(
                    'Unable to proceed because the payment step of checkout has not been initialized.',
                );
            });

            it('throws error when no payment is in payload', async () => {
                googlePayOptions = {
                    methodId: 'googlepaystripe',
                    googlepaystripe: {
                        walletButton: 'mockButton',
                    },
                };

                await strategy.initialize(googlePayOptions);

                await expect(strategy.execute({})).rejects.toThrow(
                    'Unable to submit payment for the order because the payload is invalid. Make sure the following fields are provided correctly: payment.',
                );
            });

            it('throws error when no methodId is in payment', async () => {
                await strategy.initialize(googlePayOptions);

                await expect(strategy.execute({ payment: { methodId: '' } })).rejects.toThrow(
                    'Unable to proceed because the payment step of checkout has not been initialized',
                );
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

    describe('GooglePayPaymentStrategy for AdyenV2', () => {
        const googlePayOptions = {
            methodId: 'googlepayadyenv2',
            googlepayadyenv2: {
                walletButton: 'mockButton',
                onError: jest.fn(),
                onPaymentSelect: jest.fn(),
            },
        };

        beforeEach(() => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                initializationData,
                method: 'googlepay',
            });
            strategy = new GooglePayPaymentStrategy(
                store,
                checkoutActionCreator,
                paymentMethodActionCreator,
                paymentStrategyActionCreator,
                paymentActionCreator,
                orderActionCreator,
                googlePayPaymentProcessor,
                googlePayAdyenV2PaymentProcessor,
                braintreeSDKCreator,
            );
        });

        it('submits json encoded nonce for googlepayadyenv2', async () => {
            await strategy.initialize(googlePayOptions);
            await strategy.execute({
                ...getGoogleOrderRequestBody(),
                payment: { methodId: 'googlepayadyenv2' },
            });

            expect(googlePayAdyenV2PaymentProcessor.initialize).toHaveBeenCalled();
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                methodId: 'googlepayadyenv2',
                paymentData: {
                    nonce: `{"type":"googlepay","googlePayToken":"nonce","browser_info":{"color_depth":24,"java_enabled":false,"language":"en-US","screen_height":0,"screen_width":0,"time_zone_offset":"${new Date()
                        .getTimezoneOffset()
                        .toString()}"}}`,
                    method: 'googlepayadyenv2',
                    cardInformation: 'card_info',
                },
            });
        });

        it('uses the appropriate payment processor for googlepayadyenv2', async () => {
            const errorResponse = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    errors: [{ code: 'additional_action_required' }],
                    additional_action_required: {
                        type: 'unknown_action',
                    },
                    status: 'error',
                }),
            );

            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)),
            );

            await strategy.initialize(googlePayOptions);

            await strategy.execute({
                ...getGoogleOrderRequestBody(),
                payment: { methodId: 'googlepayadyenv2' },
            });

            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(googlePayAdyenV2PaymentProcessor.processAdditionalAction).toHaveBeenCalled();
            expect(
                googlePayCheckoutcomPaymentProcessor.processAdditionalAction,
            ).not.toHaveBeenCalled();
        });
    });

    describe('GooglePayPaymentStrategy for Checkoutcom', () => {
        const googlePayOptions = {
            methodId: 'googlepaycheckoutcom',
            googlepaycheckoutcom: {
                walletButton: 'mockButton',
                onError: jest.fn(),
                onPaymentSelect: jest.fn(),
            },
        };

        beforeEach(() => {
            strategy = new GooglePayPaymentStrategy(
                store,
                checkoutActionCreator,
                paymentMethodActionCreator,
                paymentStrategyActionCreator,
                paymentActionCreator,
                orderActionCreator,
                googlePayPaymentProcessor,
                googlePayCheckoutcomPaymentProcessor,
                braintreeSDKCreator,
            );
        });

        it('uses the appropriate payment processor for googlepaycheckoutcom', async () => {
            const errorResponse = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    errors: [{ code: 'additional_action_required' }],
                    additional_action_required: {
                        type: 'unknown_action',
                    },
                    status: 'error',
                }),
            );

            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)),
            );

            await strategy.initialize(googlePayOptions);

            await strategy.execute({
                ...getGoogleOrderRequestBody(),
                payment: { methodId: 'googlepaycheckoutcom' },
            });

            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(googlePayAdyenV2PaymentProcessor.processAdditionalAction).not.toHaveBeenCalled();
            expect(googlePayCheckoutcomPaymentProcessor.processAdditionalAction).toHaveBeenCalled();
        });
    });

    describe('GooglePayPaymentStrategy for Braintree', () => {
        const googlePayOptions = {
            methodId: 'googlepaycheckoutcom',
            googlepaycheckoutcom: {
                walletButton: 'mockButton',
                onError: jest.fn(),
                onPaymentSelect: jest.fn(),
            },
        };

        beforeEach(() => {
            strategy = new GooglePayPaymentStrategy(
                store,
                checkoutActionCreator,
                paymentMethodActionCreator,
                paymentStrategyActionCreator,
                paymentActionCreator,
                orderActionCreator,
                googlePayPaymentProcessor,
                undefined,
                braintreeSDKCreator,
            );
        });

        it('does not use any processor to handle additional action if none is available', async () => {
            const errorResponse = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    errors: [{ code: 'additional_action_required' }],
                    additional_action_required: {
                        type: 'unknown_action',
                    },
                    status: 'error',
                }),
            );

            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorResponse)),
            );

            await strategy.initialize(googlePayOptions);

            await expect(
                strategy.execute({
                    ...getGoogleOrderRequestBody(),
                }),
            ).rejects.toThrow(RequestError);

            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(googlePayAdyenV2PaymentProcessor.processAdditionalAction).not.toHaveBeenCalled();
            expect(
                googlePayCheckoutcomPaymentProcessor.processAdditionalAction,
            ).not.toHaveBeenCalled();
        });
    });
});
