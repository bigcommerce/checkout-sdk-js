import { EventEmitter } from 'events';

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
import {
    createPayPalCommerceSdk,
    PayPalCommerceSdk,
    PayPalMessagesSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
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

import BigCommerceCreditPaymentInitializeOptions from './big-commerce-credit-payment-initialize-options';
import BigCommerceCreditPaymentStrategy from './big-commerce-credit-payment-strategy';

describe('BigCommerceCreditPaymentStrategy', () => {
    let eventEmitter: EventEmitter;
    let loadingIndicator: LoadingIndicator;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let bigCommerceIntegrationService: BigCommerceIntegrationService;
    let bigCommerceSdk: BigCommerceSDK;
    let strategy: BigCommerceCreditPaymentStrategy;
    let paypalCommerceSdk: PayPalCommerceSdk;
    let payPalMessagesSdk: PayPalMessagesSdk;

    const bigCommerceOrderId = 'bigcommerce123';

    const defaultMethodId = 'bigcommerce_payments_paylater';
    const defaultContainerId = '#container';
    const defaultMessageContainerId = 'big-commerce-credit-message-mock-id';

    const bigCommerceCreditOptions: BigCommerceCreditPaymentInitializeOptions = {
        container: defaultContainerId,
        onValidate: jest.fn(),
        submitForm: jest.fn(),
    };

    const initializationOptions: PaymentInitializeOptions = {
        methodId: defaultMethodId,
        bigcommerce_payments_paylater: bigCommerceCreditOptions,
    };

    beforeEach(() => {
        eventEmitter = new EventEmitter();

        payPalMessagesSdk = {
            Messages: jest.fn(),
        };

        bigCommerceSdk = getBigCommerceSDKMock();
        paymentMethod = getBigCommercePaymentMethod();
        paymentMethod.id = defaultMethodId;
        paymentMethod.initializationData.orderId = undefined;

        loadingIndicator = new LoadingIndicator();
        bigCommerceIntegrationService = getBigCommerceIntegrationServiceMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paypalCommerceSdk = createPayPalCommerceSdk();

        strategy = new BigCommerceCreditPaymentStrategy(
            paymentIntegrationService,
            bigCommerceIntegrationService,
            loadingIndicator,
            paypalCommerceSdk,
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

    it('creates an instance of the PayPal Commerce payment strategy', () => {
        expect(strategy).toBeInstanceOf(BigCommerceCreditPaymentStrategy);
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

        it('loads bigcommerce sdk', async () => {
            await strategy.initialize(initializationOptions);

            expect(bigCommerceIntegrationService.loadBigCommerceSdk).toHaveBeenCalledWith(
                defaultMethodId,
            );
        });
    });

    describe('#renderButton()', () => {
        it('renders PayPal PayLater button if it is eligible', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => true),
                render: bigCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: bigCommerceSdk.FUNDING.PAYLATER,
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

            expect(bigCommerceSdkRenderMock).toHaveBeenCalled();
        });

        it('renders PayPal Credit button if PayPal PayLater button is not eligible', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(
                (options: BigCommerceButtonsOptions) => {
                    return {
                        close: jest.fn(),
                        render: bigCommerceSdkRenderMock,
                        isEligible: jest.fn(() => {
                            return options.fundingSource === bigCommerceSdk.FUNDING.CREDIT;
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

            expect(bigCommerceSdk.Buttons).toHaveBeenCalledTimes(2);
            expect(bigCommerceSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: bigCommerceSdk.FUNDING.PAYLATER,
                ...defaultButtonOptions,
            });
            expect(bigCommerceSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: bigCommerceSdk.FUNDING.CREDIT,
                ...defaultButtonOptions,
            });
            expect(bigCommerceSdkRenderMock).toHaveBeenCalledTimes(1);
        });

        it('throws an error if both PayPal PayLater and Credit buttons are not eligible', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: bigCommerceSdkRenderMock,
            }));

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(bigCommerceSdkRenderMock).not.toHaveBeenCalled();
                expect(error).toBeInstanceOf(NotImplementedError);
            }
        });

        it('throws an error if container is not passed', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: bigCommerceSdkRenderMock,
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
        it('creates bigcommerce order', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommerceIntegrationService.createOrder).toHaveBeenCalledWith(
                'bigcommercecreditcheckout',
            );
        });
    });

    describe('#onClick button callback', () => {
        it('calls validation callback with provided params', async () => {
            const onValidateMock = jest.fn();

            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_paylater: {
                    ...bigCommerceCreditOptions,
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
                    ...bigCommerceCreditOptions,
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
                    ...bigCommerceCreditOptions,
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
                    ...bigCommerceCreditOptions,
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

            expect(bigCommerceIntegrationService.submitPayment).toHaveBeenCalledWith(
                payload.payment.methodId,
                bigCommerceOrderId,
            );
        });
    });

    describe('#deinitialize()', () => {
        it('closes bigcommerce button component on deinitialize strategy', async () => {
            const bigCommerceSdkCloseMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => true),
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

    describe('PayPal Commerce Credit messages logic', () => {
        const bigCommerceSdkRenderMock = jest.fn();

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

            jest.spyOn(paypalCommerceSdk, 'getPayPalMessages').mockImplementation(() =>
                Promise.resolve(payPalMessagesSdk),
            );
            jest.spyOn(payPalMessagesSdk, 'Messages').mockImplementation(() => ({
                render: bigCommerceSdkRenderMock,
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

            expect(bigCommerceSdkRenderMock).not.toHaveBeenCalled();
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

            expect(bigCommerceSdkRenderMock).toHaveBeenCalledWith(`#${defaultMessageContainerId}`);
        });
    });
});
