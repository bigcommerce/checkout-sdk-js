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
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import {
    createPayPalCommerceSdk,
    PayPalCommerceSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';
import { getPayPalCommerceIntegrationServiceMock } from 'packages/paypal-commerce-integration/src/mocks';
import PayPalCommerceIntegrationService from 'packages/paypal-commerce-integration/src/paypal-commerce-integration-service'; // TODO: remove this import after implementing bigcommerce-utils

import BigCommerceIntegrationService from '../big-commerce-integration-service';
import {
    BigCommerceButtonsOptions,
    BigCommerceHostWindow,
    BigCommerceOrderStatus,
    BigCommerceSDK,
    NonInstantAlternativePaymentMethods,
} from '../big-commerce-types';
import {
    getBigCommerceIntegrationServiceMock,
    getBigCommercePaymentMethod,
    getBigCommerceSDKMock,
} from '../mocks';

import BigCommerceAlternativeMethodsPaymentOptions from './big-commerce-alternative-methods-payment-initialize-options';
import BigCommerceAlternativeMethodsPaymentStrategy from './big-commerce-alternative-methods-payment-strategy';

// TODO: CHECKOUT-7766
describe('BigCommerceAlternativeMethodsPaymentStrategy', () => {
    let billingAddress: BillingAddress;
    let eventEmitter: EventEmitter;
    let loadingIndicator: LoadingIndicator;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let bigCommerceIntegrationService: BigCommerceIntegrationService;
    let paypalCommerceIntegrationService: PayPalCommerceIntegrationService; // TODO: remove this import after implementing bigcommerce-utils
    let bigCommerceSdk: BigCommerceSDK;
    let strategy: BigCommerceAlternativeMethodsPaymentStrategy;
    let paypalCommerceSdk: PayPalCommerceSdk; // TODO: remove this import after implementing bigcommerce-utils

    const bigCommerceOrderId = 'paypal123';

    const defaultMethodId = 'sepa';
    const defaultGatewayId = 'paypalcommercealternativemethods';
    const defaultContainerId = '#container';
    const defaultApmFieldsContainerId = '#container';

    const bigCommerceAlternativeMethodsOptions: BigCommerceAlternativeMethodsPaymentOptions = {
        container: defaultContainerId,
        apmFieldsContainer: defaultApmFieldsContainerId,
        onInitButton: jest.fn(),
        onValidate: jest.fn(),
        submitForm: jest.fn(),
    };

    const initializationOptions: PaymentInitializeOptions = {
        methodId: defaultMethodId,
        gatewayId: defaultGatewayId,
        paypalcommercealternativemethods: bigCommerceAlternativeMethodsOptions,
    };

    beforeEach(() => {
        eventEmitter = new EventEmitter();

        billingAddress = getBillingAddress();
        bigCommerceSdk = getBigCommerceSDKMock();
        paymentMethod = getBigCommercePaymentMethod();
        paymentMethod.id = defaultGatewayId;
        paymentMethod.initializationData.orderId = undefined;

        loadingIndicator = new LoadingIndicator();
        bigCommerceIntegrationService = getBigCommerceIntegrationServiceMock();
        paypalCommerceIntegrationService = getPayPalCommerceIntegrationServiceMock(); // TODO: remove this import after implementing bigcommerce-utils
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paypalCommerceSdk = createPayPalCommerceSdk();

        strategy = new BigCommerceAlternativeMethodsPaymentStrategy(
            paymentIntegrationService,
            bigCommerceIntegrationService,
            paypalCommerceIntegrationService, // TODO: remove this import after implementing bigcommerce-utils
            paypalCommerceSdk,
            loadingIndicator,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(
            paymentIntegrationService.getState(),
            'getBillingAddressOrThrow',
        ).mockReturnValue(billingAddress);

        // jest.spyOn(paypalCommerceSdk, 'getPayPalApmsSdk').mockResolvedValue(bigCommerceSdk); // TODO: uncomement this line after implementing bigcommerce-utils
        jest.spyOn(bigCommerceIntegrationService, 'createOrder').mockResolvedValue(
            bigCommerceOrderId,
        );
        jest.spyOn(bigCommerceIntegrationService, 'submitPayment').mockResolvedValue();
        jest.spyOn(bigCommerceIntegrationService, 'getOrderStatus').mockResolvedValue(
            BigCommerceOrderStatus.Approved,
        );

        jest.spyOn(loadingIndicator, 'show').mockReturnValue(undefined);
        jest.spyOn(loadingIndicator, 'hide').mockReturnValue(undefined);

        jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(
            (options: BigCommerceButtonsOptions) => {
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

    it('creates an instance of the PayPal Commerce Alternative Methods payment strategy', () => {
        expect(strategy).toBeInstanceOf(BigCommerceAlternativeMethodsPaymentStrategy);
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

        it('throws error if options.bigcommerce_payments_apms or options.paypalcommerce is not provided', async () => {
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

            expect(paypalCommerceSdk.getPayPalApmsSdk).not.toHaveBeenCalled();
        });

        it('loads bigcommerce sdk', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdk.getPayPalApmsSdk).toHaveBeenCalledWith(paymentMethod, 'USD');
        });
    });

    describe('#renderButton()', () => {
        it('initializes bigcommerce button', async () => {
            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdk.Buttons).toHaveBeenCalledWith({
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

        it('does not render bigcommerce button if it is not eligible', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: bigCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdkRenderMock).not.toHaveBeenCalled();
        });

        it('renders bigcommerce button if it is eligible', async () => {
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
        it('creates bigcommerce order', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommerceIntegrationService.createOrder).toHaveBeenCalledWith(
                'paypalcommercealternativemethodscheckout', // TODO: Double check this value
            );
        });

        it('calls validation callback with provided params', async () => {
            const onValidateMock = jest.fn();

            await strategy.initialize({
                ...initializationOptions,
                methodId: NonInstantAlternativePaymentMethods.OXXO,
                bigcommerce_payments_apms: {
                    ...bigCommerceAlternativeMethodsOptions,
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

            expect(bigCommerceIntegrationService.createOrder).toHaveBeenCalledWith(
                'paypalcommercealternativemethodscheckout', // TODO: Double check this value
            );

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(bigCommerceIntegrationService.submitPayment).toHaveBeenCalledWith(
                nonInstantMethodId,
                bigCommerceOrderId,
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
                    ...bigCommerceAlternativeMethodsOptions,
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
                    ...bigCommerceAlternativeMethodsOptions,
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
                    ...bigCommerceAlternativeMethodsOptions,
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
                    ...bigCommerceAlternativeMethodsOptions,
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
                    ...bigCommerceAlternativeMethodsOptions,
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
                    ...bigCommerceAlternativeMethodsOptions,
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

            jest.spyOn(bigCommerceSdk, 'PaymentFields').mockImplementation(() => ({
                render: paymentFieldsRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdk.PaymentFields).toHaveBeenCalledWith({
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

            expect(bigCommerceIntegrationService.submitPayment).toHaveBeenCalledWith(
                payload.payment.methodId,
                bigCommerceOrderId,
                defaultGatewayId,
            );
        });
    });

    describe('#deinitialize()', () => {
        it('closes bigcommerce button component on deinitialize strategy', async () => {
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
