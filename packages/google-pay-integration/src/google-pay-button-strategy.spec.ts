import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';

import {
    BuyNowCartRequestBody,
    CartSource,
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayGateway from './gateways/google-pay-gateway';
import { WithGooglePayButtonInitializeOptions } from './google-pay-button-initialize-option';
import GooglePayButtonStrategy from './google-pay-button-strategy';
import GooglePayPaymentProcessor from './google-pay-payment-processor';
import GooglePayScriptLoader from './google-pay-script-loader';
import getCardDataResponse from './mocks/google-pay-card-data-response.mock';
import { getGeneric } from './mocks/google-pay-payment-method.mock';
import { CallbackTriggerType, GooglePayInitializationData } from './types';

describe('GooglePayButtonStrategy', () => {
    const CONTAINER_ID = 'my_awesome_google_pay_button_container';

    let buttonStrategy: GooglePayButtonStrategy;
    let button: HTMLButtonElement;
    let paymentIntegrationService: PaymentIntegrationService;
    let processor: GooglePayPaymentProcessor;
    let options: CheckoutButtonInitializeOptions & WithGooglePayButtonInitializeOptions;
    let withBuyNowOptions: CheckoutButtonInitializeOptions & WithGooglePayButtonInitializeOptions;
    let eventEmitter: EventEmitter;
    let scriptLoader: GooglePayScriptLoader;
    let formPoster: FormPoster;

    let buyNowCartRequestBody: BuyNowCartRequestBody;
    let buyNowRequiredOptions: {
        buyNowInitializeOptions: {
            getBuyNowCartRequestBody: () => BuyNowCartRequestBody;
        };
    };

    beforeEach(() => {
        jest.clearAllMocks();

        eventEmitter = new EventEmitter();

        paymentIntegrationService = new PaymentIntegrationServiceMock();

        buyNowCartRequestBody = {
            source: CartSource.BuyNow,
            lineItems: [
                {
                    productId: 1,
                    quantity: 2,
                    optionSelections: {
                        optionId: 11,
                        optionValue: 11,
                    },
                },
            ],
        };

        buyNowRequiredOptions = {
            buyNowInitializeOptions: {
                getBuyNowCartRequestBody: jest.fn().mockReturnValue(buyNowCartRequestBody),
            },
        };

        options = {
            methodId: 'googlepaybraintree',
            containerId: CONTAINER_ID,
            googlepaybraintree: {},
        };

        withBuyNowOptions = {
            ...options,
            googlepaybraintree: {
                buyNowInitializeOptions: buyNowRequiredOptions.buyNowInitializeOptions,
                currencyCode: 'USD',
            },
        };

        formPoster = createFormPoster();
        jest.spyOn(formPoster, 'postForm').mockImplementation((_url, _data, callback) =>
            callback(),
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            getGeneric(),
        );

        button = document.createElement('button');
        jest.spyOn(button, 'remove');

        scriptLoader = new GooglePayScriptLoader(createScriptLoader());

        processor = new GooglePayPaymentProcessor(
            scriptLoader,
            new GooglePayGateway('example', paymentIntegrationService),
            createRequestSender(),
            formPoster,
        );

        jest.spyOn(processor, 'initialize').mockResolvedValue(undefined);
        jest.spyOn(processor, 'addPaymentButton').mockImplementation((_, { onClick }) => {
            button.onclick = onClick;

            return button;
        });
        jest.spyOn(processor, 'signOut').mockResolvedValue(undefined);

        buttonStrategy = new GooglePayButtonStrategy(paymentIntegrationService, processor);
    });

    describe('#initialize', () => {
        describe('initialization of strategy with buy now required options', () => {
            it('should initialize the strategy', async () => {
                expect(await buttonStrategy.initialize(withBuyNowOptions)).toBeUndefined();
                expect(paymentIntegrationService.loadDefaultCheckout).not.toHaveBeenCalled();
            });

            it('should initialize processor', async () => {
                const getPaymentMethod = () =>
                    (
                        (processor.initialize as jest.Mock).mock
                            .calls[0][0] as () => PaymentMethod<GooglePayInitializationData>
                    )();
                const paymentMethod = getGeneric();

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(paymentMethod);

                await buttonStrategy.initialize(withBuyNowOptions);

                expect(getPaymentMethod()).toBe(paymentMethod);
            });

            it('should create Buy Now cart on google pay button click', async () => {
                jest.spyOn(processor, 'initialize').mockImplementation(
                    (_, googlePayClientOptions) => {
                        eventEmitter.on('onPaymentDataChanged', () => {
                            // TODO: remove this rule and update test with related type (PAYPAL-4383)
                            // eslint-disable-next-line @typescript-eslint/no-floating-promises
                            googlePayClientOptions.paymentDataCallbacks.onPaymentDataChanged({
                                callbackTrigger: CallbackTriggerType.INITIALIZE,
                            });
                        });
                    },
                );

                jest.spyOn(processor, 'showPaymentSheet').mockImplementation(() => {
                    eventEmitter.emit('onPaymentDataChanged');

                    return getCardDataResponse();
                });

                await buttonStrategy.initialize(withBuyNowOptions);

                button.click();

                expect(paymentIntegrationService.loadCheckout).not.toHaveBeenCalled();
                expect(paymentIntegrationService.createBuyNowCart).toHaveBeenCalled();
                expect(paymentIntegrationService.updateShippingAddress).not.toHaveBeenCalled();
            });
        });

        describe('initialization of strategy without buy now required options', () => {
            it('should initialize the strategy', async () => {
                const paymentDataCallbacks = () =>
                    (processor.initialize as jest.Mock).mock.calls[0][1];

                expect(await buttonStrategy.initialize(options)).toBeUndefined();
                expect(paymentIntegrationService.loadDefaultCheckout).toHaveBeenCalled();
                expect(paymentDataCallbacks()).toBeDefined();
            });

            it('should load checkout via onPaymentDataChanged callback on clicking the google pay button', async () => {
                jest.spyOn(processor, 'initialize').mockImplementation(
                    (_, googlePayClientOptions) => {
                        eventEmitter.on('onPaymentDataChanged', () => {
                            // TODO: remove this rule and update test with related type (PAYPAL-4383)
                            // eslint-disable-next-line @typescript-eslint/no-floating-promises
                            googlePayClientOptions.paymentDataCallbacks.onPaymentDataChanged({
                                callbackTrigger: CallbackTriggerType.INITIALIZE,
                            });
                        });
                    },
                );

                jest.spyOn(processor, 'showPaymentSheet').mockImplementation(() => {
                    eventEmitter.emit('onPaymentDataChanged');

                    return getCardDataResponse();
                });

                await buttonStrategy.initialize(options);

                button.click();

                expect(paymentIntegrationService.loadCheckout).toHaveBeenCalled();
                expect(paymentIntegrationService.createBuyNowCart).not.toHaveBeenCalled();
            });

            it('should initialize processor', async () => {
                const getPaymentMethod = () =>
                    (
                        (processor.initialize as jest.Mock).mock
                            .calls[0][0] as () => PaymentMethod<GooglePayInitializationData>
                    )();
                const paymentMethod = getGeneric();

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(paymentMethod);

                await buttonStrategy.initialize(options);

                expect(getPaymentMethod()).toBe(paymentMethod);
            });
        });

        it('should fail silently if Google Pay is not supported', async () => {
            jest.spyOn(processor, 'initialize').mockRejectedValue(
                new Error('Google Pay is not supported'),
            );

            try {
                await buttonStrategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(processor.addPaymentButton).not.toHaveBeenCalled();
            }
        });

        it('should add payment button', async () => {
            await buttonStrategy.initialize(options);

            expect(processor.addPaymentButton).toHaveBeenCalledWith(CONTAINER_ID, {
                buttonColor: 'default',
                buttonType: 'plain',
                onClick: expect.any(Function),
            });
        });

        describe('should fail if:', () => {
            test('options is missing', async () => {
                const initialize = buttonStrategy.initialize();

                await expect(initialize).rejects.toThrow(TypeError);
            });

            test('methodId is empty', async () => {
                options.methodId = '';

                const initialize = buttonStrategy.initialize(options);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });

            test('methodId is not a google pay key', async () => {
                options.methodId = 'foo';

                const initialize = buttonStrategy.initialize(options);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });

            test('googlePayOptions is missing', async () => {
                delete options.googlepaybraintree;

                const initialize = buttonStrategy.initialize(options);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });

            test('currencyCode is missing (Buy Now Flow)', async () => {
                const initialize = buttonStrategy.initialize({
                    ...withBuyNowOptions,
                    googlepaybraintree: {
                        ...withBuyNowOptions.googlepaybraintree,
                        currencyCode: undefined,
                    },
                });

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });
        });
    });

    describe('#deinitialize', () => {
        it('should deinitialize the strategy', async () => {
            const deinitialize = buttonStrategy.deinitialize();

            await expect(deinitialize).resolves.toBeUndefined();
        });

        it('should remove payment button', async () => {
            await buttonStrategy.initialize(options);
            await buttonStrategy.deinitialize();

            expect(button.remove).toHaveBeenCalled();
        });
    });
});
