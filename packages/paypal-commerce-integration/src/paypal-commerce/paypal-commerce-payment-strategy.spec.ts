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
import {
    createPayPalCommerceSdk,
    PayPalCommerceSdk,
    PayPalMessagesSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import {
    getPayPalCommerceIntegrationServiceMock,
    getPayPalCommercePaymentMethod,
    getPayPalSDKMock,
} from '../mocks';
import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import {
    PayPalCommerceButtonsOptions,
    PayPalCommerceHostWindow,
    PayPalSDK,
} from '../paypal-commerce-types';

import PayPalCommercePaymentInitializeOptions, {
    WithPayPalCommercePaymentInitializeOptions,
} from './paypal-commerce-payment-initialize-options';
import PayPalCommercePaymentStrategy from './paypal-commerce-payment-strategy';

describe('PayPalCommercePaymentStrategy', () => {
    let eventEmitter: EventEmitter;
    let loadingIndicator: LoadingIndicator;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalCommerceIntegrationService: PayPalCommerceIntegrationService;
    let paypalSdk: PayPalSDK;
    let strategy: PayPalCommercePaymentStrategy;
    let paypalCommerceSdk: PayPalCommerceSdk;
    let payPalMessagesSdk: PayPalMessagesSdk;

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

    const defaultMethodId = 'paypalcommerce';
    const defaultContainerId = '#container';

    const paypalCommerceOptions: PayPalCommercePaymentInitializeOptions = {
        container: defaultContainerId,
        onValidate: jest.fn(),
        submitForm: jest.fn(),
    };

    const initializationOptions: PaymentInitializeOptions &
        WithPayPalCommercePaymentInitializeOptions = {
        methodId: defaultMethodId,
        paypalcommerce: paypalCommerceOptions,
    };

    const paymentInstruments = getInstruments();
    const accountInstrument = paymentInstruments.find(
        (instrument) => instrument.provider === 'paypalcommerce',
    );
    const paypalCommerceSdkRenderMock = jest.fn();

    const defaultMessageContainerId = 'paypal-commerce-credit-message-mock-id';

    beforeEach(() => {
        eventEmitter = new EventEmitter();

        paypalSdk = getPayPalSDKMock();
        paymentMethod = getPayPalCommercePaymentMethod();
        paymentMethod.id = defaultMethodId;
        paymentMethod.initializationData.orderId = undefined;
        paypalCommerceSdk = createPayPalCommerceSdk();

        loadingIndicator = new LoadingIndicator();
        paypalCommerceIntegrationService = getPayPalCommerceIntegrationServiceMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new PayPalCommercePaymentStrategy(
            paymentIntegrationService,
            paypalCommerceIntegrationService,
            paypalCommerceSdk,
            loadingIndicator,
        );

        payPalMessagesSdk = {
            Messages: jest.fn(),
        };

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        jest.spyOn(paypalCommerceIntegrationService, 'loadPayPalSdk').mockResolvedValue(paypalSdk);
        jest.spyOn(paypalCommerceIntegrationService, 'getPayPalSdkOrThrow').mockReturnValue(
            paypalSdk,
        );
        jest.spyOn(paypalCommerceSdk, 'getPayPalMessages').mockImplementation(() =>
            Promise.resolve(payPalMessagesSdk),
        );
        jest.spyOn(payPalMessagesSdk, 'Messages').mockImplementation(() => ({
            render: paypalCommerceSdkRenderMock,
        }));
        jest.spyOn(paypalCommerceIntegrationService, 'createOrder').mockResolvedValue('');
        jest.spyOn(paypalCommerceIntegrationService, 'submitPayment').mockResolvedValue();

        jest.spyOn(loadingIndicator, 'show').mockReturnValue(undefined);
        jest.spyOn(loadingIndicator, 'hide').mockReturnValue(undefined);

        jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
            (options: PayPalCommerceButtonsOptions) => {
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

        delete (window as PayPalCommerceHostWindow).paypal;
    });

    it('creates an instance of the PayPal Commerce payment strategy', () => {
        expect(strategy).toBeInstanceOf(PayPalCommercePaymentStrategy);
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

        it('throws error if options.paypalcommerce is not provided', async () => {
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

            expect(paypalCommerceIntegrationService.loadPayPalSdk).not.toHaveBeenCalled();
        });

        it('loads paypal sdk', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalCommerceIntegrationService.loadPayPalSdk).toHaveBeenCalledWith(
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
            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: paypalCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).not.toHaveBeenCalled();
        });

        it('does not render paypal button if shouldNotRenderOnInitialization option is true', async () => {
            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: paypalCommerceSdkRenderMock,
            }));

            await strategy.initialize({
                ...initializationOptions,
                paypalcommerce: {
                    ...paypalCommerceOptions,
                },
            });

            expect(paypalCommerceSdkRenderMock).not.toHaveBeenCalled();
        });

        it('renders paypal button if onInit callback is passed', async () => {
            const options = {
                ...initializationOptions,
                paypalcommerce: {
                    ...paypalCommerceOptions,
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
                render: paypalCommerceSdkRenderMock,
            }));

            await strategy.initialize(options);

            eventEmitter.emit('onInit');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceSdkRenderMock).toHaveBeenCalled();
        });

        it('calls the onRenderButton callback if it is provided', async () => {
            const options = {
                ...initializationOptions,
                paypalcommerce: {
                    ...paypalCommerceOptions,
                    onRenderButton: jest.fn(),
                },
            };

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => true),
                render: paypalCommerceSdkRenderMock,
            }));

            await strategy.initialize(options);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(options.paypalcommerce.onRenderButton).toHaveBeenCalled();
        });

        it('renders paypal button if it is eligible', async () => {
            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => true),
                render: paypalCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).toHaveBeenCalled();
        });
    });

    describe('#createOrder button callback', () => {
        it('creates paypal order', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceIntegrationService.createOrder).toHaveBeenCalledWith(
                'paypalcommercecheckout',
                { shouldSaveInstrument: false },
            );
        });

        it('creates paypal order with the shouldSaveInstrument gotten from getFieldsValues callback', async () => {
            const options = {
                ...initializationOptions,
                paypalcommerce: {
                    ...paypalCommerceOptions,
                    getFieldsValues: jest.fn().mockReturnValue({
                        shouldSaveInstrument: true,
                    }),
                },
            };

            await strategy.initialize(options);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceIntegrationService.createOrder).toHaveBeenCalledWith(
                'paypalcommercecheckout',
                { shouldSaveInstrument: true },
            );
        });
    });

    describe('#onClick button callback', () => {
        it('calls validation callback with provided params', async () => {
            const onValidateMock = jest.fn();

            await strategy.initialize({
                ...initializationOptions,
                paypalcommerce: {
                    ...paypalCommerceOptions,
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
                paypalcommerce: {
                    ...paypalCommerceOptions,
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
                paypalcommerce: {
                    ...paypalCommerceOptions,
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
                paypalcommerce: {
                    ...paypalCommerceOptions,
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
                paypalcommerce: {
                    ...paypalCommerceOptions,
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

            jest.spyOn(paypalCommerceIntegrationService, 'createOrder').mockResolvedValue(
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
                expect(paypalCommerceIntegrationService.loadPayPalSdk).toHaveBeenCalled();
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
                expect(paypalCommerceIntegrationService.loadPayPalSdk).not.toHaveBeenCalled();
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
            const paypalCommerceSdkCloseMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
                (options: PayPalCommerceButtonsOptions) => {
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
                        close: paypalCommerceSdkCloseMock,
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
                expect(paypalCommerceSdkCloseMock).toHaveBeenCalled();
            }
        });

        it('throws specific error if receive INSTRUMENT_DECLINED error and experiment is on', async () => {
            paymentMethod.initializationData.orderId = '1';

            const payload = {
                payment: {
                    methodId: defaultMethodId,
                },
            };

            paypalCommerceOptions.onError = jest.fn();
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
                expect(paypalCommerceOptions.onError).toHaveBeenCalledWith(
                    new Error('INSTRUMENT_DECLINED'),
                );
            }
        });

        it('throws specific error if receive additional_action_required error', async () => {
            Object.defineProperty(window, 'location', {
                value: {
                    replace: jest.fn(),
                },
            });

            paymentMethod.initializationData.orderId = '1';

            const payload = {
                payment: {
                    methodId: defaultMethodId,
                },
            };

            const redirectActionError = {
                status: 'error',
                three_ds_result: {
                    acs_url: null,
                    payer_auth_request: null,
                    merchant_data: null,
                    callback_url: null,
                },
                body: {
                    additional_action_required: {
                        type: 'offsite_redirect',
                        data: {
                            redirect_url: 'https://example.redirect.com',
                        },
                    },
                },
                errors: [
                    {
                        code: 'invalid_request_error',
                        message:
                            "We're experiencing difficulty processing your transaction. Please contact us or try again later.",
                    },
                ],
            };

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(() => {
                throw redirectActionError;
            });

            await strategy.initialize(initializationOptions);

            void strategy.execute(payload);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(window.location.replace).toHaveBeenCalledWith('https://example.redirect.com');
        });
    });

    describe('#deinitialize()', () => {
        it('closes paypal button component on deinitialize strategy', async () => {
            const paypalCommerceSdkCloseMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => false),
                render: jest.fn(),
                close: paypalCommerceSdkCloseMock,
            }));

            await strategy.initialize(initializationOptions);
            await strategy.deinitialize();

            expect(paypalCommerceSdkCloseMock).toHaveBeenCalled();
        });

        it('deinitializes strategy', async () => {
            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
        });
    });

    describe('PayPal Commerce Credit messages logic', () => {
        const options: PaymentInitializeOptions & WithPayPalCommercePaymentInitializeOptions = {
            methodId: defaultMethodId,
            paypalcommerce: {
                bannerContainerId: defaultMessageContainerId,
            },
        };

        beforeEach(() => {
            const div = document.createElement('div');

            div.setAttribute('id', defaultMessageContainerId);
            document.body.appendChild(div);

            jest.spyOn(paypalSdk, 'Messages').mockImplementation(() => ({
                render: paypalCommerceSdkRenderMock,
            }));
        });

        afterEach(() => {
            document.getElementById(defaultMessageContainerId)?.remove();
        });

        it('does not render PayPal message when paypalBNPLConfiguration is not provided', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    paypalBNPLConfiguration: undefined,
                },
            });

            await strategy.initialize(options);

            expect(paypalCommerceSdkRenderMock).not.toHaveBeenCalled();
        });

        it('does not render PayPal message when isPayPalCreditAvailable is true', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    isPayPalCreditAvailable: true,
                },
            });

            await strategy.initialize(options);

            expect(paypalCommerceSdkRenderMock).not.toHaveBeenCalled();
        });

        it('does not render PayPal message if banner is disabled in paypalBNPLConfiguration', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    paypalBNPLConfiguration: [
                        {
                            id: 'checkout',
                            status: false,
                        },
                    ],
                },
            });

            await strategy.initialize(options);

            expect(paypalCommerceSdkRenderMock).not.toHaveBeenCalled();
        });

        it('initializes PayPal Messages component', async () => {
            await strategy.initialize(options);

            expect(payPalMessagesSdk.Messages).toHaveBeenCalledWith({
                amount: 190,
                placement: 'payment',
                style: {
                    layout: 'text',
                    logo: {
                        type: 'alternative',
                    },
                    text: {
                        color: 'white',
                        size: 10,
                    },
                },
            });
        });

        it('does not execute PayPal button initialization logic if bannerContainerId is provided', async () => {
            await strategy.initialize(options);

            expect(paypalCommerceIntegrationService.loadPayPalSdk).not.toHaveBeenCalledWith(
                defaultMethodId,
            );
        });

        it('show an error if bannerContainerId is provided but does not exist as DOM element', async () => {
            Object.defineProperty(window, 'console', {
                value: {
                    error: jest.fn(),
                },
            });

            await strategy.initialize({
                ...options,
                paypalcommerce: {
                    ...options.paypalcommerce,
                    bannerContainerId: '',
                },
            });

            expect(payPalMessagesSdk.Messages).not.toHaveBeenCalled();
            expect(window.console.error).toHaveBeenCalledWith(
                'Unable to create banner without valid banner container ID.',
            );
        });

        it('renders PayPal message', async () => {
            await strategy.initialize(options);

            expect(paypalCommerceSdkRenderMock).toHaveBeenCalledWith(
                `#${defaultMessageContainerId}`,
            );
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
