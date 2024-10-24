import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';

import {
    InvalidArgumentError,
    MissingDataError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayGateway from './gateways/google-pay-gateway';
import { WithGooglePayPaymentInitializeOptions } from './google-pay-payment-initialize-options';
import GooglePayPaymentProcessor from './google-pay-payment-processor';
import GooglePayPaymentStrategy from './google-pay-payment-strategy';
import GooglePayScriptLoader from './google-pay-script-loader';
import getCardDataResponse from './mocks/google-pay-card-data-response.mock';
import { getGeneric } from './mocks/google-pay-payment-method.mock';
import {
    CallbackTriggerType,
    GooglePayButtonOptions,
    GooglePayInitializationData,
    NewTransactionInfo,
} from './types';

describe('GooglePayPaymentStrategy', () => {
    const BUTTON_ID = 'my_awesome_google_pay_button';

    let paymentIntegrationService: PaymentIntegrationService;
    let processor: GooglePayPaymentProcessor;
    let strategy: GooglePayPaymentStrategy;
    let options: PaymentInitializeOptions & WithGooglePayPaymentInitializeOptions;
    let button: HTMLDivElement;
    let eventEmitter: EventEmitter;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        eventEmitter = new EventEmitter();

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            getGeneric(),
        );

        processor = new GooglePayPaymentProcessor(
            new GooglePayScriptLoader(createScriptLoader()),
            new GooglePayGateway('example', paymentIntegrationService),
            createRequestSender(),
            createFormPoster(),
        );
        jest.spyOn(processor, 'initialize').mockResolvedValue(undefined);
        jest.spyOn(processor, 'initializeWidget').mockResolvedValue(undefined);
        jest.spyOn(processor, 'processAdditionalAction').mockResolvedValue(undefined);

        strategy = new GooglePayPaymentStrategy(paymentIntegrationService, processor);

        options = {
            methodId: 'googlepayworldpayaccess',
            googlepayworldpayaccess: {
                walletButton: BUTTON_ID,
                onError: jest.fn(),
                onPaymentSelect: jest.fn(),
            },
        };
    });

    beforeAll(() => {
        button = document.createElement('div');

        button.id = BUTTON_ID;

        document.body.appendChild(button);

        jest.spyOn(button, 'addEventListener');
        jest.spyOn(button, 'removeEventListener');
    });

    afterEach(() => {
        (button.addEventListener as jest.Mock).mockClear();
        (button.removeEventListener as jest.Mock).mockClear();
    });

    describe('#initialize', () => {
        it('should initialize the strategy', async () => {
            const initialize = strategy.initialize(options);
            const initializeWidgetMock = jest.spyOn(processor, 'initializeWidget');

            await expect(initialize).resolves.toBeUndefined();
            expect(initializeWidgetMock).not.toHaveBeenCalled();
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

            await strategy.initialize(options);

            expect(getPaymentMethod()).toBe(paymentMethod);
        });

        it('should bind payment button', async () => {
            await strategy.initialize(options);

            expect(button.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        it('should bind payment button once', async () => {
            await strategy.initialize(options);
            await strategy.initialize(options);

            expect(button.addEventListener).toHaveBeenCalledTimes(1);
        });

        describe('should fail if:', () => {
            test('options is missing', async () => {
                const initialize = strategy.initialize();

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });

            test('methodId is empty', async () => {
                options.methodId = '';

                const initialize = strategy.initialize(options);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });

            test('methodId is not a google pay key', async () => {
                options.methodId = 'foo';

                const initialize = strategy.initialize(options);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });

            test('googlePayOptions is missing', async () => {
                delete options.googlepayworldpayaccess;

                const initialize = strategy.initialize(options);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });

            test('walletButton is missing', async () => {
                options.googlepayworldpayaccess = {};

                const initialize = strategy.initialize(options);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });

            test('walletButton is empty', async () => {
                options.googlepayworldpayaccess = {
                    walletButton: '',
                };

                const initialize = strategy.initialize(options);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });
        });
    });

    describe('#execute', () => {
        let payload: OrderRequestBody;

        beforeEach(async () => {
            payload = {
                payment: {
                    methodId: 'example',
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...getGeneric(),
                initializationData: {
                    ...getGeneric().initializationData,
                    nonce: 'abc.123.xyz',
                },
            });

            await strategy.initialize(options);
        });

        it('should execute the strategy', async () => {
            const execute = strategy.execute(payload);

            await expect(execute).resolves.toBeUndefined();
        });

        it('should call getPaymentMethodOrThrow', async () => {
            await strategy.execute(payload);

            expect(paymentIntegrationService.getState().getPaymentMethodOrThrow).toHaveBeenCalled();
        });

        it('should submit the order', async () => {
            await strategy.execute(payload);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
        });

        it('should submit the payment', async () => {
            await strategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'example',
                paymentData: {
                    nonce: 'abc.123.xyz',
                },
            });
        });

        it('should process additional action', async () => {
            jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue('error');

            await strategy.execute(payload);

            expect(processor.processAdditionalAction).toHaveBeenCalledWith('error', 'example');
        });

        describe('should fail if:', () => {
            test('payment is missing', async () => {
                const execute = strategy.execute({});

                await expect(execute).rejects.toThrow(PaymentArgumentInvalidError);
            });

            test('methodId is empty', async () => {
                const execute = strategy.execute({
                    payment: {
                        methodId: '',
                    },
                });

                await expect(execute).rejects.toThrow(PaymentArgumentInvalidError);
            });

            test('nonce is missing', async () => {
                const execute = () => strategy.execute(payload);

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(getGeneric());

                await expect(execute()).rejects.toThrow(MissingDataError);
            });
        });
    });

    describe('#handleClick', () => {
        beforeEach(() => {
            jest.spyOn(processor, 'addPaymentButton').mockImplementation(
                (
                    _: string,
                    buttonOptions: Omit<GooglePayButtonOptions, 'allowedPaymentMethods'>,
                ) => {
                    button.onclick = buttonOptions.onClick;

                    return button;
                },
            );
        });

        describe('#getGooglePayClientOptions', () => {
            let mockReturnedPaymentDataChangedValue: NewTransactionInfo;

            beforeEach(() => {
                jest.spyOn(processor, 'initialize').mockImplementation(
                    (_, googlePayClientOptions) => {
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        eventEmitter.on('onPaymentDataChanged', async () => {
                            mockReturnedPaymentDataChangedValue =
                                await googlePayClientOptions.paymentDataCallbacks.onPaymentDataChanged(
                                    {
                                        callbackTrigger: CallbackTriggerType.INITIALIZE,
                                    },
                                );
                        });
                    },
                );

                jest.spyOn(processor, 'showPaymentSheet').mockImplementation(() => {
                    eventEmitter.emit('onPaymentDataChanged');

                    return getCardDataResponse();
                });
            });

            it('should load checkout via onPaymentDataChanged callback', async () => {
                const initializeWidgetMock = jest.spyOn(processor, 'initializeWidget');

                await strategy.initialize(options);

                button.click();

                await new Promise((resolve) => process.nextTick(resolve));

                expect(paymentIntegrationService.loadCheckout).toHaveBeenCalled();
                expect(initializeWidgetMock).toHaveBeenCalledTimes(1);
            });

            it('should return updated transactionInfo', async () => {
                await strategy.initialize(options);

                button.click();

                await new Promise((resolve) => process.nextTick(resolve));

                expect(mockReturnedPaymentDataChangedValue).toStrictEqual({
                    newTransactionInfo: {
                        countryCode: 'US',
                        currencyCode: 'USD',
                        totalPriceStatus: 'FINAL',
                        totalPrice: '190.00',
                    },
                });
            });
        });
    });

    describe('#finalize', () => {
        it('should finalize the strategy', async () => {
            const finalize = strategy.finalize();

            await expect(finalize).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize', () => {
        it('should deinitialize the strategy', async () => {
            const deinitialize = strategy.deinitialize();

            await expect(deinitialize).resolves.toBeUndefined();
        });

        it('should unbind payment button', async () => {
            await strategy.initialize(options);
            await strategy.deinitialize();

            expect(button.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });
    });
});
