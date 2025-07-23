import { EventEmitter } from 'events';

import {
    createBigCommercePaymentsSdk,
    PayPalSdkHelper,
} from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import {
    BillingAddress,
    InvalidArgumentError,
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodInvalidError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getConfig,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import BigCommercePaymentsIntegrationService from '../bigcommerce-payments-integration-service';
import {
    BigCommercePaymentsButtonsOptions,
    BigCommercePaymentsHostWindow,
    NonInstantAlternativePaymentMethods,
    PayPalOrderStatus,
    PayPalSDK,
} from '../bigcommerce-payments-types';
import {
    getBigCommercePaymentsIntegrationServiceMock,
    getBigCommercePaymentsPaymentMethod,
    getPayPalSDKMock,
} from '../mocks';

import BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions from './bigcommerce-payments-alternative-methods-payment-initialize-options';
import BigCommercePaymentsAlternativeMethodsPaymentStrategy from './bigcommerce-payments-alternative-methods-payment-strategy';

// TODO: CHECKOUT-7766
describe('BigCommercePaymentsAlternativeMethodsPaymentStrategy', () => {
    let billingAddress: BillingAddress;
    let eventEmitter: EventEmitter;
    let loadingIndicator: LoadingIndicator;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService;
    let paypalSdk: PayPalSDK;
    let strategy: BigCommercePaymentsAlternativeMethodsPaymentStrategy;
    let bigCommercePaymentsSdkHelper: PayPalSdkHelper;

    const paypalOrderId = 'paypal123';

    const defaultMethodId = 'sepa';
    const defaultGatewayId = 'bigcommerce_payments_apms';
    const defaultContainerId = '#container';
    const defaultApmFieldsContainerId = '#container';

    const bigCommercePaymentsAlternativeMethodsOptions: BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions =
        {
            container: defaultContainerId,
            apmFieldsContainer: defaultApmFieldsContainerId,
            onInitButton: jest.fn(),
            onValidate: jest.fn(),
            submitForm: jest.fn(),
        };

    const initializationOptions: PaymentInitializeOptions = {
        methodId: defaultMethodId,
        gatewayId: defaultGatewayId,
        bigcommerce_payments_apms: bigCommercePaymentsAlternativeMethodsOptions,
    };

    beforeEach(() => {
        eventEmitter = new EventEmitter();

        billingAddress = getBillingAddress();
        paypalSdk = getPayPalSDKMock();
        paymentMethod = getBigCommercePaymentsPaymentMethod();
        paymentMethod.id = defaultGatewayId;
        paymentMethod.initializationData.orderId = undefined;

        loadingIndicator = new LoadingIndicator();
        bigCommercePaymentsIntegrationService = getBigCommercePaymentsIntegrationServiceMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        bigCommercePaymentsSdkHelper = createBigCommercePaymentsSdk();

        strategy = new BigCommercePaymentsAlternativeMethodsPaymentStrategy(
            paymentIntegrationService,
            bigCommercePaymentsIntegrationService,
            bigCommercePaymentsSdkHelper,
            loadingIndicator,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(
            paymentIntegrationService.getState(),
            'getBillingAddressOrThrow',
        ).mockReturnValue(billingAddress);

        jest.spyOn(bigCommercePaymentsSdkHelper, 'getPayPalApmsSdk').mockResolvedValue(paypalSdk);
        jest.spyOn(bigCommercePaymentsIntegrationService, 'createOrder').mockResolvedValue(
            paypalOrderId,
        );
        jest.spyOn(bigCommercePaymentsIntegrationService, 'submitPayment').mockResolvedValue();
        jest.spyOn(bigCommercePaymentsIntegrationService, 'getOrderStatus').mockResolvedValue(
            PayPalOrderStatus.Approved,
        );

        jest.spyOn(loadingIndicator, 'show').mockReturnValue(undefined);
        jest.spyOn(loadingIndicator, 'hide').mockReturnValue(undefined);

        jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
            (options: BigCommercePaymentsButtonsOptions) => {
                eventEmitter.on('createOrder', () => {
                    if (options.createOrder) {
                        options.createOrder();
                    }
                });

                eventEmitter.on('onInit', () => {
                    if (options.onInit) {
                        options.onInit(
                            { correlationID: defaultMethodId },
                            {
                                disable: jest.fn(),
                                enable: jest.fn(),
                            },
                        );
                    }
                });

                eventEmitter.on('onClick', () => {
                    if (options.onClick) {
                        options.onClick(
                            { fundingSource: defaultMethodId },
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

    it('creates an instance of the BigCommercePayments Alternative Methods payment strategy', () => {
        expect(strategy).toBeInstanceOf(BigCommercePaymentsAlternativeMethodsPaymentStrategy);
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

        it('throws error if gatewayId is not provided', async () => {
            const options = {
                methodId: defaultMethodId,
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if options.bigcommerce_payments_apms or options.bigcommerce_payments is not provided', async () => {
            const options = {
                methodId: defaultMethodId,
                gatewayId: defaultGatewayId,
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

            expect(bigCommercePaymentsSdkHelper.getPayPalApmsSdk).not.toHaveBeenCalled();
        });

        it('loads paypal sdk', async () => {
            await strategy.initialize(initializationOptions);

            expect(bigCommercePaymentsSdkHelper.getPayPalApmsSdk).toHaveBeenCalledWith(
                paymentMethod,
                'USD',
            );
        });
    });

    describe('#renderButton()', () => {
        it('initializes APM button', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: defaultMethodId,
                style: {
                    color: 'black',
                    height: 55,
                    label: 'pay',
                },
                onInit: expect.any(Function),
                onClick: expect.any(Function),
                createOrder: expect.any(Function),
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

        it('renders APM button if it is eligible', async () => {
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
        it('creates order', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommercePaymentsIntegrationService.createOrder).toHaveBeenCalledWith(
                'bigcommerce_payments_apms',
            );
        });

        it('calls validation callback with provided params', async () => {
            const onValidateMock = jest.fn();

            await strategy.initialize({
                ...initializationOptions,
                methodId: NonInstantAlternativePaymentMethods.OXXO,
                bigcommerce_payments_apms: {
                    ...bigCommercePaymentsAlternativeMethodsOptions,
                    onValidate: onValidateMock,
                },
            });

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(onValidateMock).toHaveBeenCalled();
        });

        it('patches the order for non instant payment methods', async () => {
            const nonInstantMethodId = 'oxxo';

            await strategy.initialize({
                ...initializationOptions,
                methodId: nonInstantMethodId,
            });

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommercePaymentsIntegrationService.createOrder).toHaveBeenCalledWith(
                'bigcommerce_payments_apms',
            );

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(bigCommercePaymentsIntegrationService.submitPayment).toHaveBeenCalledWith(
                nonInstantMethodId,
                paypalOrderId,
                defaultGatewayId,
            );
        });
    });

    describe('#onClick button callback', () => {
        it('calls validation callback with provided params', async () => {
            const onValidateMock = jest.fn();

            await strategy.initialize({
                ...initializationOptions,
                methodId: NonInstantAlternativePaymentMethods.OXXO,
                bigcommerce_payments_apms: {
                    ...bigCommercePaymentsAlternativeMethodsOptions,
                    onValidate: onValidateMock,
                },
            });

            eventEmitter.emit('onClick');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(onValidateMock).toHaveBeenCalled();
        });
    });

    describe('#onInit button callback', () => {
        it('calls validation callback with provided params', async () => {
            const onInitButtonMock = jest.fn();

            await strategy.initialize({
                ...initializationOptions,
                methodId: NonInstantAlternativePaymentMethods.OXXO,
                bigcommerce_payments_apms: {
                    ...bigCommercePaymentsAlternativeMethodsOptions,
                    onInitButton: onInitButtonMock,
                },
            });

            eventEmitter.emit('onInit');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(onInitButtonMock).toHaveBeenCalled();
        });
    });

    describe('#onApprove button callback', () => {
        it('submits form', async () => {
            const submitFormMock = jest.fn();

            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_apms: {
                    ...bigCommercePaymentsAlternativeMethodsOptions,
                    submitForm: submitFormMock,
                },
            });

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(submitFormMock).toHaveBeenCalled();
        });

        it('does not hide loading indicator after form submit', async () => {
            const submitFormMock = jest.fn();

            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_apms: {
                    ...bigCommercePaymentsAlternativeMethodsOptions,
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
                bigcommerce_payments_apms: {
                    ...bigCommercePaymentsAlternativeMethodsOptions,
                    onError: onErrorMock,
                },
            });

            eventEmitter.emit('onError');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(loadingIndicator.hide).toHaveBeenCalled();
        });
    });

    describe('#renderFields()', () => {
        it('throws an error if apmFieldsContainer is not provided', async () => {
            paymentMethod.initializationData.shouldRenderFields = true;

            const options = {
                methodId: defaultMethodId,
                gatewayId: defaultGatewayId,
                bigcommerce_payments_apms: {
                    ...bigCommercePaymentsAlternativeMethodsOptions,
                    apmFieldsContainer: undefined,
                },
            };

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('renders apm payment fields', async () => {
            const paymentFieldsRenderMock = jest.fn();
            const fieldContainer = document.createElement('div');

            fieldContainer.id = defaultApmFieldsContainerId.split('#')[1];
            document.body.appendChild(fieldContainer);

            jest.spyOn(paypalSdk, 'PaymentFields').mockImplementation(() => ({
                render: paymentFieldsRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(paypalSdk.PaymentFields).toHaveBeenCalledWith({
                fundingSource: defaultMethodId,
                style: {},
                fields: {
                    name: {
                        value: `${billingAddress.firstName} ${billingAddress.lastName}`,
                    },
                    email: {
                        value: billingAddress.email,
                    },
                },
            });
            expect(paymentFieldsRenderMock).toHaveBeenCalled();
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
                    gatewayId: defaultGatewayId,
                },
            };

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodInvalidError);
            }
        });

        it('does not submit order for non instant payment methods', async () => {
            const payload = {
                payment: {
                    methodId: NonInstantAlternativePaymentMethods.OXXO,
                    gatewayId: defaultGatewayId,
                },
            };

            await strategy.initialize({
                ...initializationOptions,
                methodId: NonInstantAlternativePaymentMethods.OXXO,
            });

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            await strategy.execute(payload);

            expect(paymentIntegrationService.submitOrder).not.toHaveBeenCalled();
        });

        it('submits order for instant payment methods', async () => {
            const payload = {
                payment: {
                    methodId: defaultMethodId,
                    gatewayId: defaultGatewayId,
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
                    gatewayId: defaultGatewayId,
                },
            };

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            await strategy.execute(payload);

            expect(bigCommercePaymentsIntegrationService.submitPayment).toHaveBeenCalledWith(
                payload.payment.methodId,
                paypalOrderId,
                defaultGatewayId,
            );
        });
    });

    describe('#deinitialize()', () => {
        it('closes button component on deinitialize strategy', async () => {
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

    describe('#polling mechanism', () => {
        beforeEach(() => {
            const storeConfigMock = {
                ...getConfig().storeConfig,
                checkoutSettings: {
                    ...getConfig().storeConfig.checkoutSettings,
                    features: {
                        'PAYPAL-5624.bcp_ideal_polling': true,
                    },
                },
            };

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                Promise.resolve(paymentIntegrationService.getState()),
            );
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfigMock);
        });

        it('initialize polling mechanism', async () => {
            jest.spyOn(bigCommercePaymentsIntegrationService, 'getOrderStatus').mockResolvedValue(
                PayPalOrderStatus.Approved,
            );

            const payload = {
                payment: {
                    methodId: 'ideal',
                    gatewayId: 'bigcommerce_payments_apms',
                },
            };

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await strategy.execute(payload);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommercePaymentsIntegrationService.getOrderStatus).toHaveBeenCalled();
        });

        it('request order status with proper payload', async () => {
            jest.spyOn(bigCommercePaymentsIntegrationService, 'getOrderStatus').mockResolvedValue(
                PayPalOrderStatus.Approved,
            );

            const payload = {
                payment: {
                    methodId: 'ideal',
                    gatewayId: 'bigcommerce_payments_apms',
                },
            };

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await strategy.execute(payload);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommercePaymentsIntegrationService.getOrderStatus).toHaveBeenCalledWith(
                'bigcommerce_payments_apms',
            );
        });

        it('deinitialize polling mechanism', async () => {
            jest.spyOn(bigCommercePaymentsIntegrationService, 'getOrderStatus').mockResolvedValue(
                PayPalOrderStatus.Approved,
            );

            const payload = {
                payment: {
                    methodId: 'ideal',
                    gatewayId: 'bigcommerce_payments_apms',
                },
            };

            jest.spyOn(global, 'clearTimeout');

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await strategy.execute(payload);

            await new Promise((resolve) => process.nextTick(resolve));

            await strategy.deinitialize();

            expect(clearTimeout).toHaveBeenCalled();
        });
    });
});
