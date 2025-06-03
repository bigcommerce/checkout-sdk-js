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

import BigCommercePaymentsIntegrationService from '../bigcommerce-payments-integration-service';
import {
    BigCommercePaymentsButtonsOptions,
    BigCommercePaymentsHostWindow,
    PayPalSDK,
} from '../bigcommerce-payments-types';
import {
    getBigCommercePaymentsIntegrationServiceMock,
    getBigCommercePaymentsPayPalPaymentMethod,
    getPayPalSDKMock,
} from '../mocks';

import BigCommercePaymentsPayPalPaymentInitializeOptions, {
    WithBigCommercePaymentsPayPalPaymentInitializeOptions,
} from './bigcommerce-payments-paypal-payment-initialize-options';
import BigCommercePaymentsPayPalPaymentStrategy from './bigcommerce-payments-paypal-payment-strategy';

describe('BigCommercePaymentsPayPalPaymentStrategy', () => {
    let eventEmitter: EventEmitter;
    let loadingIndicator: LoadingIndicator;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService;
    let paypalSdk: PayPalSDK;
    let strategy: BigCommercePaymentsPayPalPaymentStrategy;

    const paypalOrderId = 'paypal123';
    const storeConfig = getConfig().storeConfig;
    const storeConfigWithFeaturesOn = {
        ...storeConfig,
        checkoutSettings: {
            ...storeConfig.checkoutSettings,
            features: {
                ...storeConfig.checkoutSettings.features,
                'PAYPAL-3438.handling_instrument_declined_error_ppc': true,
            },
        },
    };

    const defaultMethodId = 'bigcommerce_payments_paypal';
    const defaultContainerId = '#container';

    const bigCommercePaymentsOptions: BigCommercePaymentsPayPalPaymentInitializeOptions = {
        container: defaultContainerId,
        onValidate: jest.fn(),
        submitForm: jest.fn(),
    };

    const initializationOptions: PaymentInitializeOptions &
        WithBigCommercePaymentsPayPalPaymentInitializeOptions = {
        methodId: defaultMethodId,
        bigcommerce_payments_paypal: bigCommercePaymentsOptions,
    };

    const paymentInstruments = getInstruments();
    const accountInstrument = paymentInstruments.find(
        (instrument) => instrument.provider === 'paypalcommerce', // TODO: refactor packages/payment-integrations-test-utils/src/test-utils/payments.mock.ts
    );

    beforeEach(() => {
        eventEmitter = new EventEmitter();

        paypalSdk = getPayPalSDKMock();
        paymentMethod = getBigCommercePaymentsPayPalPaymentMethod();
        paymentMethod.id = defaultMethodId;
        paymentMethod.initializationData.orderId = undefined;

        loadingIndicator = new LoadingIndicator();
        bigCommercePaymentsIntegrationService = getBigCommercePaymentsIntegrationServiceMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new BigCommercePaymentsPayPalPaymentStrategy(
            paymentIntegrationService,
            bigCommercePaymentsIntegrationService,
            loadingIndicator,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        jest.spyOn(bigCommercePaymentsIntegrationService, 'loadPayPalSdk').mockResolvedValue(
            paypalSdk,
        );
        jest.spyOn(bigCommercePaymentsIntegrationService, 'getPayPalSdkOrThrow').mockReturnValue(
            paypalSdk,
        );
        jest.spyOn(bigCommercePaymentsIntegrationService, 'createOrder').mockResolvedValue('');
        jest.spyOn(bigCommercePaymentsIntegrationService, 'submitPayment').mockResolvedValue();

        jest.spyOn(loadingIndicator, 'show').mockReturnValue(undefined);
        jest.spyOn(loadingIndicator, 'hide').mockReturnValue(undefined);

        jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
            (options: BigCommercePaymentsButtonsOptions) => {
                eventEmitter.on('createOrder', () => {
                    if (options.createOrder) {
                        options.createOrder();
                    }
                });

                eventEmitter.on('onClick', () => {
                    if (options.onClick) {
                        options.onClick(
                            { fundingSource: paypalSdk.FUNDING.PAYPAL },
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
                            { orderID: paypalOrderId },
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

        delete (window as BigCommercePaymentsHostWindow).paypal;
    });

    it('creates an instance of the BigCommercePaymentsPayPalPaymentStrategy payment strategy', () => {
        expect(strategy).toBeInstanceOf(BigCommercePaymentsPayPalPaymentStrategy);
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

        it('throws error if options.bigcommerce_payments_paypal is not provided', async () => {
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

            expect(bigCommercePaymentsIntegrationService.loadPayPalSdk).not.toHaveBeenCalled();
        });

        it('loads paypal sdk', async () => {
            await strategy.initialize(initializationOptions);

            expect(bigCommercePaymentsIntegrationService.loadPayPalSdk).toHaveBeenCalledWith(
                defaultMethodId,
            );
        });
    });

    describe('#renderButton()', () => {
        it('initializes paypal button', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdk.FUNDING.PAYPAL,
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

        it('does not render paypal button if it is not eligible', async () => {
            const bigCommercePaymentsSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: bigCommercePaymentsSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommercePaymentsSdkRenderMock).not.toHaveBeenCalled();
        });

        it('does not render paypal button if shouldNotRenderOnInitialization option is true', async () => {
            const bigCommercePaymentsSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: bigCommercePaymentsSdkRenderMock,
            }));

            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_paypal: {
                    ...bigCommercePaymentsOptions,
                },
            });

            expect(bigCommercePaymentsSdkRenderMock).not.toHaveBeenCalled();
        });

        it('renders paypal button if onInit callback is passed', async () => {
            const bigCommercePaymentsSdkRenderMock = jest.fn();

            const options = {
                ...initializationOptions,
                bigcommerce_payments_paypal: {
                    ...bigCommercePaymentsOptions,
                    onInit: jest.fn().mockImplementation((renderButtonCallback) => {
                        eventEmitter.on('onInit', () => {
                            renderButtonCallback();
                        });
                    }),
                },
            };

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => true),
                render: bigCommercePaymentsSdkRenderMock,
            }));

            await strategy.initialize(options);

            eventEmitter.emit('onInit');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommercePaymentsSdkRenderMock).toHaveBeenCalled();
        });

        it('calls the onRenderButton callback if it is provided', async () => {
            const bigCommercePaymentsSdkRenderMock = jest.fn();

            const options = {
                ...initializationOptions,
                bigcommerce_payments_paypal: {
                    ...bigCommercePaymentsOptions,
                    onRenderButton: jest.fn(),
                },
            };

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => true),
                render: bigCommercePaymentsSdkRenderMock,
            }));

            await strategy.initialize(options);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(options.bigcommerce_payments_paypal.onRenderButton).toHaveBeenCalled();
        });

        it('renders paypal button if it is eligible', async () => {
            const bigCommercePaymentsSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => true),
                render: bigCommercePaymentsSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommercePaymentsSdkRenderMock).toHaveBeenCalled();
        });
    });

    describe('#createOrder button callback', () => {
        it('creates paypal order', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommercePaymentsIntegrationService.createOrder).toHaveBeenCalledWith(
                'bigcommerce_payments_paypalcheckout',
                { shouldSaveInstrument: false },
            );
        });

        it('creates paypal order with the shouldSaveInstrument gotten from getFieldsValues callback', async () => {
            const options = {
                ...initializationOptions,
                bigcommerce_payments_paypal: {
                    ...bigCommercePaymentsOptions,
                    getFieldsValues: jest.fn().mockReturnValue({
                        shouldSaveInstrument: true,
                    }),
                },
            };

            await strategy.initialize(options);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommercePaymentsIntegrationService.createOrder).toHaveBeenCalledWith(
                'bigcommerce_payments_paypalcheckout',
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
                    ...bigCommercePaymentsOptions,
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
                    ...bigCommercePaymentsOptions,
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
                    ...bigCommercePaymentsOptions,
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
                    ...bigCommercePaymentsOptions,
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
                    ...bigCommercePaymentsOptions,
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
                        paypal_account: { order_id: paypalOrderId },
                    },
                    shouldSaveInstrument: false,
                    shouldSetAsDefaultInstrument: false,
                },
            });
        });

        it('submits payment with provided vaulting data', async () => {
            const { bigpayToken } = accountInstrument as AccountInstrument;

            jest.spyOn(bigCommercePaymentsIntegrationService, 'createOrder').mockResolvedValue(
                paypalOrderId,
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
                        paypal_account: { order_id: paypalOrderId },
                        bigpay_token: { token: bigpayToken },
                    },
                },
            });
        });

        it('loads paypalsdk script if receive INSTRUMENT_DECLINED error and experiment is on', async () => {
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
                expect(bigCommercePaymentsIntegrationService.loadPayPalSdk).toHaveBeenCalled();
            }
        });

        it('paypalsdk script should not be loaded if the INSTRUMENT_DECLINED error is not received and the experiment is enabled', async () => {
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
                expect(bigCommercePaymentsIntegrationService.loadPayPalSdk).not.toHaveBeenCalled();
            }
        });

        it('renders paypal spb if receive INSTRUMENT_DECLINED error and experiment is on', async () => {
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
                expect(paypalSdk.Buttons).toHaveBeenCalled();
            }
        });

        it('close paypal buttons before render new buttons after getting INSTRUMENT_DECLINED error', async () => {
            const bigCommercePaymentsSdkCloseMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
                (options: BigCommercePaymentsButtonsOptions) => {
                    eventEmitter.on('onApprove', () => {
                        if (options.onApprove) {
                            options.onApprove(
                                { orderID: paypalOrderId },
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
                        close: bigCommercePaymentsSdkCloseMock,
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
                expect(bigCommercePaymentsSdkCloseMock).toHaveBeenCalled();
            }
        });

        it('throws specific error if receive INSTRUMENT_DECLINED error and experiment is on', async () => {
            paymentMethod.initializationData.orderId = '1';

            const payload = {
                payment: {
                    methodId: defaultMethodId,
                },
            };

            bigCommercePaymentsOptions.onError = jest.fn();
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
                expect(bigCommercePaymentsOptions.onError).toHaveBeenCalledWith(
                    new Error('INSTRUMENT_DECLINED'),
                );
            }
        });
    });

    describe('#deinitialize()', () => {
        it('closes paypal button component on deinitialize strategy', async () => {
            const bigCommercePaymentsSdkCloseMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => false),
                render: jest.fn(),
                close: bigCommercePaymentsSdkCloseMock,
            }));

            await strategy.initialize(initializationOptions);
            await strategy.deinitialize();

            expect(bigCommercePaymentsSdkCloseMock).toHaveBeenCalled();
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
