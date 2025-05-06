import { EventEmitter } from 'events';

import {
    AccountInstrument,
    InvalidArgumentError,
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodInvalidError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConfig,
    getInstruments,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import BigCommerceIntegrationService from '../big-commerce-integration-service';
import {
    BigCommerceButtonsOptions,
    BigCommerceHostWindow,
    BigCommerceSDK,
} from '../big-commerce-types';
import {
    getBigCommerceIntegrationServiceMock,
    getBigCommercePaymentMethod,
    getBigCommerceSDKMock,
} from '../mocks';

import BigCommercePaymentInitializeOptions, {
    WithBigCommercePaymentInitializeOptions,
} from './big-commerce-payment-initialize-options';
import BigCommercePaymentStrategy from './big-commerce-payment-strategy';

describe('BigCommercePaymentStrategy', () => {
    let eventEmitter: EventEmitter;
    let loadingIndicator: LoadingIndicator;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let bigCommerceIntegrationService: BigCommerceIntegrationService;
    let bigCommerceSdk: BigCommerceSDK;
    let strategy: BigCommercePaymentStrategy;

    const bigCommerceOrderId = 'paypal123';
    const storeConfig = getConfig().storeConfig;
    const storeConfigWithFeaturesOn = {
        ...storeConfig,
        checkoutSettings: {
            ...storeConfig.checkoutSettings,
            features: {
                ...storeConfig.checkoutSettings.features,
                'BIGCOMMERCE-3438.handling_instrument_declined_error_ppc': true,
            },
        },
    };

    const defaultMethodId = 'paypalcommerce';
    const defaultContainerId = '#container';

    const bigCommerceOptions: BigCommercePaymentInitializeOptions = {
        container: defaultContainerId,
        onValidate: jest.fn(),
        submitForm: jest.fn(),
    };

    const initializationOptions: PaymentInitializeOptions &
        WithBigCommercePaymentInitializeOptions = {
        methodId: defaultMethodId,
        bigcommerce_payments_paypal: bigCommerceOptions,
    };

    const paymentInstruments = getInstruments();
    const accountInstrument = paymentInstruments.find(
        (instrument) => instrument.provider === 'paypalcommerce',
    );

    beforeEach(() => {
        eventEmitter = new EventEmitter();

        bigCommerceSdk = getBigCommerceSDKMock();
        paymentMethod = getBigCommercePaymentMethod();
        paymentMethod.id = defaultMethodId;
        paymentMethod.initializationData.orderId = undefined;

        loadingIndicator = new LoadingIndicator();
        bigCommerceIntegrationService = getBigCommerceIntegrationServiceMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new BigCommercePaymentStrategy(
            paymentIntegrationService,
            bigCommerceIntegrationService,
            loadingIndicator,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        jest.spyOn(bigCommerceIntegrationService, 'loadBigCommerceSdk').mockResolvedValue(
            bigCommerceSdk,
        );
        jest.spyOn(bigCommerceIntegrationService, 'getBigCommerceSdkOrThrow').mockReturnValue(
            bigCommerceSdk,
        );
        jest.spyOn(bigCommerceIntegrationService, 'createOrder').mockResolvedValue('');
        jest.spyOn(bigCommerceIntegrationService, 'submitPayment').mockResolvedValue();

        jest.spyOn(loadingIndicator, 'show').mockReturnValue(undefined);
        jest.spyOn(loadingIndicator, 'hide').mockReturnValue(undefined);

        jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(
            (options: BigCommerceButtonsOptions) => {
                eventEmitter.on('createOrder', () => {
                    if (options.createOrder) {
                        options.createOrder();
                    }
                });

                eventEmitter.on('onClick', () => {
                    if (options.onClick) {
                        options.onClick(
                            { fundingSource: bigCommerceSdk.FUNDING.BIGCOMMERCE },
                            {
                                reject: jest.fn(),
                                resolve: jest.fn(),
                            },
                        );
                    }
                });

                eventEmitter.on('onApprove', () => {
                    if (options.onApprove) {
                        options.onApprove(
                            { orderID: bigCommerceOrderId },
                            {
                                order: {
                                    get: jest.fn(),
                                },
                            },
                        );
                    }
                });

                eventEmitter.on('onCancel', () => {
                    if (options.onCancel) {
                        options.onCancel();
                    }
                });

                eventEmitter.on('onError', () => {
                    if (options.onError) {
                        options.onError(new Error());
                    }
                });

                return {
                    isEligible: jest.fn(() => true),
                    render: jest.fn(),
                    close: jest.fn(),
                };
            },
        );
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as BigCommerceHostWindow).bigcommerce;
    });

    it('creates an instance of the BigCommerce  payment strategy', () => {
        expect(strategy).toBeInstanceOf(BigCommercePaymentStrategy);
    });

    describe('#initialize()', () => {
        it('throws error if methodId is not provided', async () => {
            const options = {} as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if options.bigcommerce is not provided', async () => {
            const options = {
                methodId: defaultMethodId,
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('does not continues strategy initialization if order id is available in initializationData', async () => {
            paymentMethod.initializationData.orderId = '1';

            await strategy.initialize(initializationOptions);

            expect(bigCommerceIntegrationService.loadBigCommerceSdk).not.toHaveBeenCalled();
        });

        it('loads bigCommerce sdk', async () => {
            await strategy.initialize(initializationOptions);

            expect(bigCommerceIntegrationService.loadBigCommerceSdk).toHaveBeenCalledWith(
                defaultMethodId,
            );
        });
    });

    describe('#renderButton()', () => {
        it('initializes bigCommerce button', async () => {
            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: bigCommerceSdk.FUNDING.BIGCOMMERCE,
                style: {
                    color: 'black',
                    height: 55,
                    label: 'pay',
                },
                createOrder: expect.any(Function),
                onClick: expect.any(Function),
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
            });
        });

        it('does not render bigCommerce button if it is not eligible', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: bigCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdkRenderMock).not.toHaveBeenCalled();
        });

        it('does not render bigCommerce button if shouldNotRenderOnInitialization option is true', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: bigCommerceSdkRenderMock,
            }));

            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_paypal: {
                    ...bigCommerceOptions,
                },
            });

            expect(bigCommerceSdkRenderMock).not.toHaveBeenCalled();
        });

        it('renders bigCommerce button if onInit callback is passed', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            const options = {
                ...initializationOptions,
                bigcommerce_payments_paypal: {
                    ...bigCommerceOptions,
                    onInit: jest.fn().mockImplementation((renderButtonCallback) => {
                        eventEmitter.on('onInit', () => {
                            renderButtonCallback();
                        });
                    }),
                },
            };

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => true),
                render: bigCommerceSdkRenderMock,
            }));

            await strategy.initialize(options);

            eventEmitter.emit('onInit');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommerceSdkRenderMock).toHaveBeenCalled();
        });

        it('calls the onRenderButton callback if it is provided', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            const options = {
                ...initializationOptions,
                bigcommerce_payments_paypal: {
                    ...bigCommerceOptions,
                    onRenderButton: jest.fn(),
                },
            };

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => true),
                render: bigCommerceSdkRenderMock,
            }));

            await strategy.initialize(options);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(options.bigcommerce_payments_paypal.onRenderButton).toHaveBeenCalled();
        });

        it('renders bigCommerce button if it is eligible', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => true),
                render: bigCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdkRenderMock).toHaveBeenCalled();
        });
    });

    describe('#createOrder button callback', () => {
        it('creates bigCommerce order', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommerceIntegrationService.createOrder).toHaveBeenCalledWith(
                'bigcommerce_payments_paypal',
                { shouldSaveInstrument: false },
            );
        });

        it('creates bigCommerce order with the shouldSaveInstrument gotten from getFieldsValues callback', async () => {
            const options = {
                ...initializationOptions,
                bigcommerce_payments_paypal: {
                    ...bigCommerceOptions,
                    getFieldsValues: jest.fn().mockReturnValue({
                        shouldSaveInstrument: true,
                    }),
                },
            };

            await strategy.initialize(options);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommerceIntegrationService.createOrder).toHaveBeenCalledWith(
                'bigcommerce_payments_paypal',
                { shouldSaveInstrument: true },
            );
        });
    });

    describe('#onClick button callback', () => {
        it('calls validation callback with provided params', async () => {
            const onValidateMock = jest.fn();

            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_paypal: {
                    ...bigCommerceOptions,
                    onValidate: onValidateMock,
                },
            });

            eventEmitter.emit('onClick');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(onValidateMock).toHaveBeenCalled();
        });

        it('triggers the indicator through the validation callback call with provided params', async () => {
            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_paypal: {
                    ...bigCommerceOptions,
                    onValidate: jest.fn().mockImplementation((onValidationPassed) => {
                        onValidationPassed();
                    }),
                },
            });

            eventEmitter.emit('onClick');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(loadingIndicator.show).toHaveBeenCalled();
        });
    });

    describe('#onApprove button callback', () => {
        it('submits form', async () => {
            const submitFormMock = jest.fn();

            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_paypal: {
                    ...bigCommerceOptions,
                    submitForm: submitFormMock,
                },
            });

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(submitFormMock).toHaveBeenCalled();
        });

        it("doesn't hide loading indicator after form submit", async () => {
            const submitFormMock = jest.fn();

            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_paypal: {
                    ...bigCommerceOptions,
                    submitForm: submitFormMock,
                },
            });

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(submitFormMock).toHaveBeenCalled();
            expect(loadingIndicator.hide).not.toHaveBeenCalled();
        });
    });

    describe('#onCancel button callback', () => {
        it('hides loading indicator', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onCancel');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(loadingIndicator.hide).toHaveBeenCalled();
        });
    });

    describe('#onError button callback', () => {
        it('hides loading indicator', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onError');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(loadingIndicator.hide).toHaveBeenCalled();
        });

        it('calls onError callback if it is provided', async () => {
            const onErrorMock = jest.fn();

            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_paypal: {
                    ...bigCommerceOptions,
                    onError: onErrorMock,
                },
            });

            eventEmitter.emit('onError');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(loadingIndicator.hide).toHaveBeenCalled();
        });
    });

    describe('#execute()', () => {
        it('throws an error if payload.payment is not provided', async () => {
            try {
                await strategy.execute({});
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('throws an error if orderId is not defined', async () => {
            const payload = {
                payment: {
                    methodId: defaultMethodId,
                },
            };

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodInvalidError);
            }
        });

        it('submits order', async () => {
            const payload = {
                payment: {
                    methodId: defaultMethodId,
                },
            };

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            await strategy.execute(payload);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
        });

        it('submits payment with provided data', async () => {
            const payload = {
                payment: {
                    methodId: defaultMethodId,
                },
            };

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            await strategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: payload.payment.methodId,
                paymentData: {
                    formattedPayload: {
                        bigcommerce_account: { order_id: bigCommerceOrderId },
                    },
                    shouldSaveInstrument: false,
                    shouldSetAsDefaultInstrument: false,
                },
            });
        });

        it('submits payment with provided vaulting data', async () => {
            const { bigpayToken } = accountInstrument as AccountInstrument;

            jest.spyOn(bigCommerceIntegrationService, 'createOrder').mockResolvedValue(
                bigCommerceOrderId,
            );

            const payload = {
                payment: {
                    methodId: defaultMethodId,
                    paymentData: {
                        instrumentId: bigpayToken,
                        shouldSetAsDefaultInstrument: true,
                    },
                },
            };

            await strategy.initialize(initializationOptions);

            await new Promise((resolve) => process.nextTick(resolve));

            await strategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: payload.payment.methodId,
                paymentData: {
                    instrumentId: '45312',
                    shouldSetAsDefaultInstrument: true,
                    formattedPayload: {
                        bigcommerce_account: { order_id: bigCommerceOrderId },
                        bigpay_token: { token: bigpayToken },
                    },
                },
            });
        });

        it('loads bigCommerceSdk script if receive INSTRUMENT_DECLINED error and experiment is on', async () => {
            paymentMethod.initializationData.orderId = '1';

            const payload = {
                payment: {
                    methodId: defaultMethodId,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfigWithFeaturesOn);

            const providerError = {
                status: 'error',
                three_ds_result: {
                    acs_url: null,
                    payer_auth_request: null,
                    merchant_data: null,
                    callback_url: null,
                },
                errors: [
                    {
                        code: 'invalid_request_error',
                        message:
                            'Were experiencing difficulty processing your transaction. Please contact us or try again later.',
                    },
                    {
                        code: 'transaction_rejected',
                        message: 'Payment was declined. Please try again.',
                        provider_error: {
                            code: 'INSTRUMENT_DECLINED',
                        },
                    },
                ],
            };

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(() => {
                throw providerError;
            });

            await strategy.initialize(initializationOptions);

            try {
                await strategy.execute(payload);
            } catch (_error: unknown) {
                expect(bigCommerceIntegrationService.loadBigCommerceSdk).toHaveBeenCalled();
            }
        });

        it('bigCommerceSdk script should not be loaded if the INSTRUMENT_DECLINED error is not received and the experiment is enabled', async () => {
            paymentMethod.initializationData.orderId = '1';

            const payload = {
                payment: {
                    methodId: defaultMethodId,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfigWithFeaturesOn);

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(() => {
                throw new Error();
            });

            await strategy.initialize(initializationOptions);

            try {
                await strategy.execute(payload);
            } catch (_error: unknown) {
                expect(bigCommerceIntegrationService.loadBigCommerceSdk).not.toHaveBeenCalled();
            }
        });

        it('renders bigCommerce spb if receive INSTRUMENT_DECLINED error and experiment is on', async () => {
            paymentMethod.initializationData.orderId = '1';

            const payload = {
                payment: {
                    methodId: defaultMethodId,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfigWithFeaturesOn);

            const providerError = {
                status: 'error',
                three_ds_result: {
                    acs_url: null,
                    payer_auth_request: null,
                    merchant_data: null,
                    callback_url: null,
                },
                errors: [
                    {
                        code: 'invalid_request_error',
                        message:
                            'Were experiencing difficulty processing your transaction. Please contact us or try again later.',
                    },
                    {
                        code: 'transaction_rejected',
                        message: 'Payment was declined. Please try again.',
                        provider_error: {
                            code: 'INSTRUMENT_DECLINED',
                        },
                    },
                ],
            };

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(() => {
                throw providerError;
            });

            await strategy.initialize(initializationOptions);

            try {
                await strategy.execute(payload);
            } catch (_error: unknown) {
                expect(bigCommerceSdk.Buttons).toHaveBeenCalled();
            }
        });

        it('close bigCommerce buttons before render new buttons after getting INSTRUMENT_DECLINED error', async () => {
            const bigCommerceSdkCloseMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(
                (options: BigCommerceButtonsOptions) => {
                    eventEmitter.on('onApprove', () => {
                        if (options.onApprove) {
                            options.onApprove(
                                { orderID: bigCommerceOrderId },
                                {
                                    order: {
                                        get: jest.fn(),
                                    },
                                },
                            );
                        }
                    });

                    return {
                        isEligible: jest.fn(() => true),
                        render: jest.fn(),
                        close: bigCommerceSdkCloseMock,
                    };
                },
            );

            const payload = {
                payment: {
                    methodId: defaultMethodId,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfigWithFeaturesOn);

            const providerError = {
                status: 'error',
                three_ds_result: {
                    acs_url: null,
                    payer_auth_request: null,
                    merchant_data: null,
                    callback_url: null,
                },
                errors: [
                    {
                        code: 'invalid_request_error',
                        message:
                            'Were experiencing difficulty processing your transaction. Please contact us or try again later.',
                    },
                    {
                        code: 'transaction_rejected',
                        message: 'Payment was declined. Please try again.',
                        provider_error: {
                            code: 'INSTRUMENT_DECLINED',
                        },
                    },
                ],
            };

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(() => {
                throw providerError;
            });

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');
            await new Promise((resolve) => process.nextTick(resolve));

            try {
                await strategy.execute(payload);
            } catch (_error: unknown) {
                expect(bigCommerceSdkCloseMock).toHaveBeenCalled();
            }
        });

        it('throws specific error if receive INSTRUMENT_DECLINED error and experiment is on', async () => {
            paymentMethod.initializationData.orderId = '1';

            const payload = {
                payment: {
                    methodId: defaultMethodId,
                },
            };

            bigCommerceOptions.onError = jest.fn();
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfigWithFeaturesOn);

            const providerError = {
                status: 'error',
                three_ds_result: {
                    acs_url: null,
                    payer_auth_request: null,
                    merchant_data: null,
                    callback_url: null,
                },
                errors: [
                    {
                        code: 'invalid_request_error',
                        message:
                            'Were experiencing difficulty processing your transaction. Please contact us or try again later.',
                    },
                    {
                        code: 'transaction_rejected',
                        message: 'Payment was declined. Please try again.',
                        provider_error: {
                            code: 'INSTRUMENT_DECLINED',
                        },
                    },
                ],
            };

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(() => {
                throw providerError;
            });

            await strategy.initialize(initializationOptions);

            try {
                await strategy.execute(payload);
            } catch (_error: unknown) {
                expect(bigCommerceOptions.onError).toHaveBeenCalledWith(
                    new Error('INSTRUMENT_DECLINED'),
                );
            }
        });
    });

    describe('#deinitialize()', () => {
        it('closes bigCommerce button component on deinitialize strategy', async () => {
            const bigCommerceSdkCloseMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => false),
                render: jest.fn(),
                close: bigCommerceSdkCloseMock,
            }));

            await strategy.initialize(initializationOptions);
            await strategy.deinitialize();

            expect(bigCommerceSdkCloseMock).toHaveBeenCalled();
        });

        it('deinitializes strategy', async () => {
            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
