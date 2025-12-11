import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';

import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationSelectors,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConfig,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayGateway from './gateways/google-pay-gateway';
import { WithGooglePayPaymentInitializeOptions } from './google-pay-payment-initialize-options';
import GooglePayPaymentProcessor from './google-pay-payment-processor';
import GooglePayPaymentStrategy from './google-pay-payment-strategy';
import GooglePayScriptLoader from './google-pay-script-loader';
import getCardDataResponse from './mocks/google-pay-card-data-response.mock';
import { getGeneric } from './mocks/google-pay-payment-method.mock';
import getGooglePaymentsClientMocks from './mocks/google-pay-payments-client.mock';
import { createInitializeImplementationMock } from './mocks/google-pay-processor-initialize.mock';
import {
    CallbackTriggerType,
    ErrorReasonType,
    GooglePayInitializationData,
    GooglePaymentsClient,
    NewTransactionInfo,
} from './types';

const LoadingShow = jest.fn();
const LoadingHide = jest.fn();

jest.mock('@bigcommerce/checkout-sdk/ui', () => ({
    LoadingIndicator: jest.fn().mockImplementation(() => ({
        show: LoadingShow,
        hide: LoadingHide,
    })),
}));

describe('GooglePayPaymentStrategy', () => {
    const BUTTON_ID = 'my_awesome_google_pay_button';

    let clientMocks: ReturnType<typeof getGooglePaymentsClientMocks>;
    let paymentsClient: GooglePaymentsClient;
    let scriptLoader: GooglePayScriptLoader;
    let paymentIntegrationService: PaymentIntegrationService;
    let processor: GooglePayPaymentProcessor;
    let strategy: GooglePayPaymentStrategy;
    let options: PaymentInitializeOptions & WithGooglePayPaymentInitializeOptions;
    let button: HTMLDivElement;
    let eventEmitter: EventEmitter;
    const storeConfig = getConfig().storeConfig;
    const storeConfigWithFeaturesOn = {
        ...storeConfig,
        checkoutSettings: {
            ...storeConfig.checkoutSettings,
            features: {
                ...storeConfig.checkoutSettings.features,
                'PI-2875.googlepay_coupons_handling': true,
            },
        },
    };

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        eventEmitter = new EventEmitter();

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            getGeneric(),
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfigOrThrow').mockReturnValue(
            storeConfigWithFeaturesOn,
        );

        clientMocks = getGooglePaymentsClientMocks();
        paymentsClient = clientMocks.paymentsClient;
        scriptLoader = new GooglePayScriptLoader(createScriptLoader());
        jest.spyOn(scriptLoader, 'getGooglePaymentsClient').mockResolvedValue(paymentsClient);

        processor = new GooglePayPaymentProcessor(
            scriptLoader,
            new GooglePayGateway('example', paymentIntegrationService),
            createRequestSender(),
            createFormPoster(),
        );
        jest.spyOn(processor, 'initialize').mockResolvedValue(undefined);
        jest.spyOn(processor, 'initializeWidget').mockResolvedValue(undefined);
        jest.spyOn(processor, 'processAdditionalAction').mockResolvedValue(undefined);
        jest.spyOn(processor, 'showPaymentSheet').mockResolvedValue(getCardDataResponse());
        jest.spyOn(processor, 'setExternalCheckoutXhr').mockResolvedValue(undefined);
        jest.spyOn(processor, 'getNonce').mockResolvedValue('abc.123.xyz');
        jest.spyOn(processor, 'handleCoupons').mockResolvedValue({
            newOfferInfo: {
                offers: [{ description: 'Coupon description', redemptionCode: 'code' }],
            },
        });
        strategy = new GooglePayPaymentStrategy(paymentIntegrationService, processor);

        options = {
            methodId: 'googlepayworldpayaccess',
            googlepayworldpayaccess: {
                loadingContainerId: 'id',
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
                jest.spyOn(processor, 'getNonce').mockRejectedValue(
                    new MissingDataError(MissingDataErrorType.MissingConsignments),
                );

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
        const internalError = new Error('internal error');

        const createInitializeWidgetMock = (error?: unknown) =>
            jest.spyOn(processor, 'initializeWidget').mockImplementation(
                error
                    ? () => {
                          throw error;
                      }
                    : undefined,
            );

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('triggers onError callback on wallet button click', async () => {
            const rejectedInitializeWidgetMock = createInitializeWidgetMock(internalError);

            await strategy.initialize(options);

            button.click();

            await new Promise((resolve) => process.nextTick(resolve));

            expect(LoadingHide).toHaveBeenCalled();
            expect(rejectedInitializeWidgetMock).toHaveBeenCalledTimes(1);
            expect(options.googlepayworldpayaccess?.onError).toHaveBeenCalled();
        });

        describe('#getGooglePayClientOptions', () => {
            let mockReturnedPaymentDataChangedValue: NewTransactionInfo;

            beforeEach(() => {
                const initializeMock = createInitializeImplementationMock(
                    eventEmitter,
                    CallbackTriggerType.INITIALIZE,
                    (res) => {
                        if (res) {
                            mockReturnedPaymentDataChangedValue = res;
                        }
                    },
                );

                jest.spyOn(processor, 'initialize').mockImplementation(initializeMock);

                jest.spyOn(processor, 'showPaymentSheet').mockImplementation(() => {
                    eventEmitter.emit('onPaymentDataChanged');

                    return Promise.resolve(getCardDataResponse());
                });
            });

            it('should load checkout via onPaymentDataChanged callback', async () => {
                const initializeWidgetMock = jest.spyOn(processor, 'initializeWidget');

                await strategy.initialize(options);

                button.click();

                await new Promise((resolve) => process.nextTick(resolve));

                expect(paymentIntegrationService.loadCheckout).toHaveBeenCalled();
                expect(initializeWidgetMock).toHaveBeenCalledTimes(1);
                expect(LoadingShow).toHaveBeenCalled();
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

            describe('Coupons', () => {
                it('should call handleCoupons on initialize', async () => {
                    const initializeMock = createInitializeImplementationMock(
                        eventEmitter,
                        CallbackTriggerType.OFFER,
                        (res) => {
                            if (res) {
                                mockReturnedPaymentDataChangedValue = res;
                            }
                        },
                    );

                    jest.spyOn(processor, 'initialize').mockImplementation(initializeMock);

                    jest.spyOn(processor, 'showPaymentSheet').mockImplementation(() => {
                        eventEmitter.emit('onPaymentDataChanged');

                        return Promise.resolve(getCardDataResponse());
                    });

                    await strategy.initialize(options);

                    button.click();

                    await new Promise((resolve) => process.nextTick(resolve));

                    expect(processor.handleCoupons).toHaveBeenCalledWith({
                        redemptionCodes: ['coupon_code'],
                    });
                });

                it('should update offers data', async () => {
                    const initializeMock = createInitializeImplementationMock(
                        eventEmitter,
                        CallbackTriggerType.OFFER,
                        (res) => {
                            if (res) {
                                mockReturnedPaymentDataChangedValue = res;
                            }
                        },
                    );

                    jest.spyOn(processor, 'initialize').mockImplementation(initializeMock);

                    jest.spyOn(processor, 'showPaymentSheet').mockImplementation(() => {
                        eventEmitter.emit('onPaymentDataChanged');

                        return Promise.resolve(getCardDataResponse());
                    });

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
                        newOfferInfo: {
                            offers: [
                                {
                                    description: 'Coupon description',
                                    redemptionCode: 'code',
                                },
                            ],
                        },
                    });
                });

                it('should return a Google Pay error', async () => {
                    jest.spyOn(processor, 'handleCoupons').mockResolvedValue({
                        error: {
                            message: 'Error message',
                            reason: ErrorReasonType.OFFER_INVALID,
                            intent: CallbackTriggerType.OFFER,
                        },
                        newOfferInfo: {
                            offers: [],
                        },
                    });

                    const initializeMock = createInitializeImplementationMock(
                        eventEmitter,
                        CallbackTriggerType.OFFER,
                        (res) => {
                            if (res) {
                                mockReturnedPaymentDataChangedValue = res;
                            }
                        },
                    );

                    jest.spyOn(processor, 'initialize').mockImplementation(initializeMock);

                    jest.spyOn(processor, 'showPaymentSheet').mockImplementation(() => {
                        eventEmitter.emit('onPaymentDataChanged');

                        return Promise.resolve(getCardDataResponse());
                    });

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
                        error: {
                            message: 'Error message',
                            reason: ErrorReasonType.OFFER_INVALID,
                            intent: CallbackTriggerType.OFFER,
                        },
                        newOfferInfo: {
                            offers: [],
                        },
                    });
                });

                it('should not call handleCoupons if user not signed it to google pay', async () => {
                    jest.spyOn(processor, 'getNonce').mockRejectedValue(
                        new MissingDataError(MissingDataErrorType.MissingConsignments),
                    );

                    const initializeMock = createInitializeImplementationMock(
                        eventEmitter,
                        CallbackTriggerType.OFFER,
                        (res) => {
                            if (res) {
                                mockReturnedPaymentDataChangedValue = res;
                            }
                        },
                    );

                    jest.spyOn(processor, 'initialize').mockImplementation(initializeMock);

                    jest.spyOn(processor, 'showPaymentSheet').mockImplementation(() => {
                        eventEmitter.emit('onPaymentDataChanged');

                        return Promise.resolve(getCardDataResponse());
                    });

                    await strategy.initialize(options);

                    button.click();

                    await new Promise((resolve) => process.nextTick(resolve));

                    expect(processor.handleCoupons).not.toHaveBeenCalled();
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

        it('should NOT deinitialize the strategy if deinitialization is blocked', async () => {
            const delayedPromise = new Promise((r) => {
                setTimeout(r, 100);
            });

            jest.spyOn(processor, 'showPaymentSheet').mockResolvedValue(
                Promise.resolve(getCardDataResponse()),
            );

            jest.spyOn(paymentIntegrationService, 'updateBillingAddress').mockReturnValue(
                delayedPromise as Promise<PaymentIntegrationSelectors>,
            );

            jest.spyOn(button, 'removeEventListener');

            await strategy.initialize(options);

            button.click();
            await new Promise((resolve) => process.nextTick(resolve));
            await strategy.deinitialize();

            expect(button.removeEventListener).not.toHaveBeenCalled();
        });

        it('should unbind payment button', async () => {
            await strategy.initialize(options);
            await strategy.deinitialize();

            expect(button.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });
    });
});
