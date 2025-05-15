import { EventEmitter } from 'events';

import {
    createBigCommercePaymentsSdk,
    PayPalMessagesSdk,
    PayPalSdkHelper,
} from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import {
    InvalidArgumentError,
    NotImplementedError,
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodInvalidError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import BigCommercePaymentsIntegrationService from '../bigcommerce-payments-integration-service';
import {
    BigCommercePaymentsButtonsOptions,
    BigCommercePaymentsHostWindow,
    PayPalSDK,
} from '../bigcommerce-payments-types';
import {
    getBigCommercePaymentsIntegrationServiceMock,
    getBigCommercePaymentsPaymentMethod,
    getPayPalSDKMock,
} from '../mocks';

import BigCommercePaymentsPayLaterPaymentInitializeOptions from './bigcommerce-payments-paylater-payment-initialize-options';
import BigCommercePaymentsPayLaterPaymentStrategy from './bigcommerce-payments-paylater-payment-strategy';

describe('BigCommercePaymentsPayLaterPaymentStrategy', () => {
    let eventEmitter: EventEmitter;
    let loadingIndicator: LoadingIndicator;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService;
    let paypalSdk: PayPalSDK;
    let strategy: BigCommercePaymentsPayLaterPaymentStrategy;
    let paypalSdkHelper: PayPalSdkHelper;
    let payPalMessagesSdk: PayPalMessagesSdk;

    const paypalOrderId = 'paypal123';

    const defaultMethodId = 'bigcommerce_payments_paylater';
    const defaultContainerId = '#container';
    const defaultMessageContainerId = 'bigcommerce-payments-paylater-message-mock-id';

    const bigCommercePaymentsPayLaterOptions: BigCommercePaymentsPayLaterPaymentInitializeOptions =
        {
            container: defaultContainerId,
            onValidate: jest.fn(),
            submitForm: jest.fn(),
        };

    const initializationOptions: PaymentInitializeOptions = {
        methodId: defaultMethodId,
        bigcommerce_payments_paylater: bigCommercePaymentsPayLaterOptions,
    };

    beforeEach(() => {
        eventEmitter = new EventEmitter();

        payPalMessagesSdk = {
            Messages: jest.fn(),
        };

        paypalSdk = getPayPalSDKMock();
        paymentMethod = getBigCommercePaymentsPaymentMethod();
        paymentMethod.id = defaultMethodId;
        paymentMethod.initializationData.orderId = undefined;

        loadingIndicator = new LoadingIndicator();
        bigCommercePaymentsIntegrationService = getBigCommercePaymentsIntegrationServiceMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paypalSdkHelper = createBigCommercePaymentsSdk();

        strategy = new BigCommercePaymentsPayLaterPaymentStrategy(
            paymentIntegrationService,
            bigCommercePaymentsIntegrationService,
            loadingIndicator,
            paypalSdkHelper,
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

    it('creates an instance of the BigCommercePayments  payment strategy', () => {
        expect(strategy).toBeInstanceOf(BigCommercePaymentsPayLaterPaymentStrategy);
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
        it('renders PayPal PayLater button if it is eligible', async () => {
            const bigCommercePaymentsSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => true),
                render: bigCommercePaymentsSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdk.FUNDING.PAYLATER,
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

            expect(bigCommercePaymentsSdkRenderMock).toHaveBeenCalled();
        });

        it('renders PayPal Credit button if PayPal PayLater button is not eligible', async () => {
            const bigCommercePaymentsSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
                (options: BigCommercePaymentsButtonsOptions) => {
                    return {
                        close: jest.fn(),
                        render: bigCommercePaymentsSdkRenderMock,
                        isEligible: jest.fn(() => {
                            return options.fundingSource === paypalSdk.FUNDING.CREDIT;
                        }),
                    };
                },
            );

            await strategy.initialize(initializationOptions);

            const defaultButtonOptions = {
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
            };

            expect(paypalSdk.Buttons).toHaveBeenCalledTimes(2);
            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdk.FUNDING.PAYLATER,
                ...defaultButtonOptions,
            });
            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdk.FUNDING.CREDIT,
                ...defaultButtonOptions,
            });
            expect(bigCommercePaymentsSdkRenderMock).toHaveBeenCalledTimes(1);
        });

        it('throws an error if both PayPal PayLater and Credit buttons are not eligible', async () => {
            const bigCommercePaymentsSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: bigCommercePaymentsSdkRenderMock,
            }));

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(bigCommercePaymentsSdkRenderMock).not.toHaveBeenCalled();
                expect(error).toBeInstanceOf(NotImplementedError);
            }
        });

        it('throws an error if container is not passed', async () => {
            const bigCommercePaymentsSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: bigCommercePaymentsSdkRenderMock,
            }));

            try {
                await strategy.initialize({
                    ...initializationOptions,
                    bigcommerce_payments_paylater: {},
                });
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });
    });

    describe('#createOrder button callback', () => {
        it('creates paypal order', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommercePaymentsIntegrationService.createOrder).toHaveBeenCalledWith(
                'bigcommerce_payments_paylater',
            );
        });
    });

    describe('#onClick button callback', () => {
        it('calls validation callback with provided params', async () => {
            const onValidateMock = jest.fn();

            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_paylater: {
                    ...bigCommercePaymentsPayLaterOptions,
                    onValidate: onValidateMock,
                },
            });

            eventEmitter.emit('onClick');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(onValidateMock).toHaveBeenCalled();
        });
    });

    describe('#onApprove button callback', () => {
        it('submits form', async () => {
            const submitFormMock = jest.fn();

            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_paylater: {
                    ...bigCommercePaymentsPayLaterOptions,
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
                bigcommerce_payments_paylater: {
                    ...bigCommercePaymentsPayLaterOptions,
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
                bigcommerce_payments_paylater: {
                    ...bigCommercePaymentsPayLaterOptions,
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

            expect(bigCommercePaymentsIntegrationService.submitPayment).toHaveBeenCalledWith(
                payload.payment.methodId,
                paypalOrderId,
            );
        });
    });

    describe('#deinitialize()', () => {
        it('closes paypal button component on deinitialize strategy', async () => {
            const bigCommercePaymentsSdkCloseMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => true),
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

    describe('BigCommercePayments PayLater messages logic', () => {
        const bigCommercePaymentsSdkRenderMock = jest.fn();

        const options = {
            methodId: defaultMethodId,
            bigcommerce_payments_paylater: {
                bannerContainerId: defaultMessageContainerId,
            },
        };

        beforeEach(() => {
            const div = document.createElement('div');

            div.setAttribute('id', defaultMessageContainerId);
            document.body.appendChild(div);

            jest.spyOn(paypalSdkHelper, 'getPayPalMessages').mockImplementation(() =>
                Promise.resolve(payPalMessagesSdk),
            );
            jest.spyOn(payPalMessagesSdk, 'Messages').mockImplementation(() => ({
                render: bigCommercePaymentsSdkRenderMock,
            }));
        });

        afterEach(() => {
            document.getElementById(defaultMessageContainerId)?.remove();
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

            expect(bigCommercePaymentsSdkRenderMock).not.toHaveBeenCalled();
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

        it('renders PayPal message', async () => {
            await strategy.initialize(options);

            expect(bigCommercePaymentsSdkRenderMock).toHaveBeenCalledWith(
                `#${defaultMessageContainerId}`,
            );
        });
    });
});
