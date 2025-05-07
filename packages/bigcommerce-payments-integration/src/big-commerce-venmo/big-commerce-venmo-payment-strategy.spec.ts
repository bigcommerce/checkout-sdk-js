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

import BigCommerceVenmoPaymentInitializeOptions from './big-commerce-venmo-payment-initialize-options';
import BigCommerceVenmoPaymentStrategy from './big-commerce-venmo-payment-strategy';

describe('BigCommerceVenmoPaymentStrategy', () => {
    let eventEmitter: EventEmitter;
    let loadingIndicator: LoadingIndicator;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let bigCommerceIntegrationService: BigCommerceIntegrationService;
    let bigCommerceSdk: BigCommerceSDK;
    let strategy: BigCommerceVenmoPaymentStrategy;

    const bigCommerceOrderId = 'bigcommerce123';

    const fundingSource = 'venmo';
    const defaultMethodId = 'bigcommerce_payments_venmo';
    const defaultContainerId = '#container';

    const bigCommerceVenmoOptions: BigCommerceVenmoPaymentInitializeOptions = {
        container: defaultContainerId,
        onValidate: jest.fn(),
        submitForm: jest.fn(),
    };

    const initializationOptions: PaymentInitializeOptions = {
        methodId: defaultMethodId,
        bigcommerce_payments_venmo: bigCommerceVenmoOptions,
    };

    beforeEach(() => {
        eventEmitter = new EventEmitter();

        bigCommerceSdk = getBigCommerceSDKMock();
        paymentMethod = getBigCommercePaymentMethod();
        paymentMethod.id = defaultMethodId;
        paymentMethod.initializationData.orderId = undefined;

        loadingIndicator = new LoadingIndicator();
        bigCommerceIntegrationService = getBigCommerceIntegrationServiceMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new BigCommerceVenmoPaymentStrategy(
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
        jest.spyOn(bigCommerceIntegrationService, 'submitPayment').mockResolvedValue(undefined);

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
                            { fundingSource: 'venmo' },
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

    it('creates an instance of the BigCommerce Venmo payment strategy', () => {
        expect(strategy).toBeInstanceOf(BigCommerceVenmoPaymentStrategy);
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

        it('throws error if options.bigcommerce_payments_venmo is not provided', async () => {
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
        it('initializes bigcommerce button', async () => {
            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdk.Buttons).toHaveBeenCalledWith({
                fundingSource,
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

        it('throws an error if bigcommerce button is not eligible', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: bigCommerceSdkRenderMock,
            }));

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(NotImplementedError);
            }
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
                'bigcommerce_payments_venmocheckout',
            );
        });
    });

    describe('#onClick button callback', () => {
        it('calls validation callback with provided params', async () => {
            const onValidateMock = jest.fn();

            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_venmo: {
                    ...bigCommerceVenmoOptions,
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
                bigcommerce_payments_venmo: {
                    ...bigCommerceVenmoOptions,
                    submitForm: submitFormMock,
                },
            });

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(submitFormMock).toHaveBeenCalled();
        });

        it('hides loading indicator after form submit', async () => {
            const submitFormMock = jest.fn();

            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_venmo: {
                    ...bigCommerceVenmoOptions,
                    submitForm: submitFormMock,
                },
            });

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(submitFormMock).toHaveBeenCalled();
            expect(loadingIndicator.hide).toHaveBeenCalled();
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
                bigcommerce_payments_venmo: {
                    ...bigCommerceVenmoOptions,
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
});
