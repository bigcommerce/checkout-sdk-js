import { EventEmitter } from 'events';

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
import {
    createPayPalSdkScriptLoader,
    getPayPalIntegrationServiceMock,
    getPayPalPaymentMethod,
    getPayPalSDKMock,
    NonInstantAlternativePaymentMethods,
    PayPalButtonsOptions,
    PayPalHostWindow,
    PayPalIntegrationService,
    PayPalOrderStatus,
    PayPalSDK,
    PayPalSdkScriptLoader,
} from '@bigcommerce/checkout-sdk/paypal-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import PayPalCommerceAlternativeMethodsPaymentOptions from './paypal-commerce-alternative-methods-payment-initialize-options';
import PayPalCommerceAlternativeMethodsPaymentStrategy from './paypal-commerce-alternative-methods-payment-strategy';

// TODO: CHECKOUT-7766
describe('PayPalCommerceAlternativeMethodsPaymentStrategy', () => {
    let billingAddress: BillingAddress;
    let eventEmitter: EventEmitter;
    let loadingIndicator: LoadingIndicator;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalIntegrationService: PayPalIntegrationService;
    let paypalSdk: PayPalSDK;
    let strategy: PayPalCommerceAlternativeMethodsPaymentStrategy;
    let paypalSdkScriptLoader: PayPalSdkScriptLoader;

    const paypalOrderId = 'paypal123';

    const defaultMethodId = 'sepa';
    const defaultGatewayId = 'paypalcommercealternativemethods';
    const defaultContainerId = '#container';
    const defaultApmFieldsContainerId = '#container';

    const paypalCommerceAlternativeMethodsOptions: PayPalCommerceAlternativeMethodsPaymentOptions =
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
        paypalcommercealternativemethods: paypalCommerceAlternativeMethodsOptions,
    };

    beforeEach(() => {
        eventEmitter = new EventEmitter();

        billingAddress = getBillingAddress();
        paypalSdk = getPayPalSDKMock();
        paymentMethod = getPayPalPaymentMethod();
        paymentMethod.id = defaultGatewayId;
        paymentMethod.initializationData.orderId = undefined;

        loadingIndicator = new LoadingIndicator();
        paypalIntegrationService = getPayPalIntegrationServiceMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paypalSdkScriptLoader = createPayPalSdkScriptLoader();

        strategy = new PayPalCommerceAlternativeMethodsPaymentStrategy(
            paymentIntegrationService,
            paypalIntegrationService,
            paypalSdkScriptLoader,
            loadingIndicator,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(
            paymentIntegrationService.getState(),
            'getBillingAddressOrThrow',
        ).mockReturnValue(billingAddress);

        jest.spyOn(paypalSdkScriptLoader, 'getPayPalApmsSdk').mockResolvedValue(paypalSdk);
        jest.spyOn(paypalIntegrationService, 'createOrder').mockResolvedValue(paypalOrderId);
        jest.spyOn(paypalIntegrationService, 'submitPayment').mockResolvedValue();
        jest.spyOn(paypalIntegrationService, 'getOrderStatus').mockResolvedValue(
            PayPalOrderStatus.Approved,
        );

        jest.spyOn(loadingIndicator, 'show').mockReturnValue(undefined);
        jest.spyOn(loadingIndicator, 'hide').mockReturnValue(undefined);

        jest.spyOn(paypalSdk, 'Buttons').mockImplementation((options: PayPalButtonsOptions) => {
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
        });
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as PayPalHostWindow).paypal;
    });

    it('creates an instance of the PayPal Commerce Alternative Methods payment strategy', () => {
        expect(strategy).toBeInstanceOf(PayPalCommerceAlternativeMethodsPaymentStrategy);
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

        it('throws error if options.paypalcommercealternativemethods or options.paypalcommerce is not provided', async () => {
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

            expect(paypalSdkScriptLoader.getPayPalApmsSdk).not.toHaveBeenCalled();
        });

        it('loads paypal sdk', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdkScriptLoader.getPayPalApmsSdk).toHaveBeenCalledWith(
                paymentMethod,
                'USD',
            );
        });
    });

    describe('#renderButton()', () => {
        it('initializes paypal button', async () => {
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
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: paypalCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).not.toHaveBeenCalled();
        });

        it('renders paypal button if it is eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

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

            expect(paypalIntegrationService.createOrder).toHaveBeenCalledWith(
                'paypalcommercealternativemethodscheckout',
            );
        });

        it('calls validation callback with provided params', async () => {
            const onValidateMock = jest.fn();

            await strategy.initialize({
                ...initializationOptions,
                methodId: NonInstantAlternativePaymentMethods.OXXO,
                paypalcommercealternativemethods: {
                    ...paypalCommerceAlternativeMethodsOptions,
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

            expect(paypalIntegrationService.createOrder).toHaveBeenCalledWith(
                'paypalcommercealternativemethodscheckout',
            );

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(paypalIntegrationService.submitPayment).toHaveBeenCalledWith(
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
                paypalcommercealternativemethods: {
                    ...paypalCommerceAlternativeMethodsOptions,
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
                paypalcommercealternativemethods: {
                    ...paypalCommerceAlternativeMethodsOptions,
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
                paypalcommercealternativemethods: {
                    ...paypalCommerceAlternativeMethodsOptions,
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
                paypalcommercealternativemethods: {
                    ...paypalCommerceAlternativeMethodsOptions,
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
                paypalcommercealternativemethods: {
                    ...paypalCommerceAlternativeMethodsOptions,
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
                paypalcommercealternativemethods: {
                    ...paypalCommerceAlternativeMethodsOptions,
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

            expect(paypalIntegrationService.submitPayment).toHaveBeenCalledWith(
                payload.payment.methodId,
                paypalOrderId,
                defaultGatewayId,
            );
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
                        'PAYPAL-5192.paypal_commerce_ideal_polling': true,
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
            jest.spyOn(paypalIntegrationService, 'getOrderStatus').mockResolvedValue(
                PayPalOrderStatus.Approved,
            );

            const payload = {
                payment: {
                    methodId: 'ideal',
                    gatewayId: 'paypalcommercealternativemethods',
                },
            };

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await strategy.execute(payload);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalIntegrationService.getOrderStatus).toHaveBeenCalled();
        });

        it('request order status with proper payload', async () => {
            jest.spyOn(paypalIntegrationService, 'getOrderStatus').mockResolvedValue(
                PayPalOrderStatus.Approved,
            );

            const payload = {
                payment: {
                    methodId: 'ideal',
                    gatewayId: 'paypalcommercealternativemethods',
                },
            };

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await strategy.execute(payload);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalIntegrationService.getOrderStatus).toHaveBeenCalledWith(
                'paypalcommercealternativemethods',
            );
        });

        it('deinitialize polling mechanism', async () => {
            jest.spyOn(paypalIntegrationService, 'getOrderStatus').mockResolvedValue(
                PayPalOrderStatus.Approved,
            );

            const payload = {
                payment: {
                    methodId: 'ideal',
                    gatewayId: 'paypalcommercealternativemethods',
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
