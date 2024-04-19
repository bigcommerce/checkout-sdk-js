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

import PayPalCommerceVenmoPaymentInitializeOptions from './paypal-commerce-venmo-payment-initialize-options';
import PayPalCommerceVenmoPaymentStrategy from './paypal-commerce-venmo-payment-strategy';

describe('PayPalCommerceVenmoPaymentStrategy', () => {
    let eventEmitter: EventEmitter;
    let loadingIndicator: LoadingIndicator;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalCommerceIntegrationService: PayPalCommerceIntegrationService;
    let paypalSdk: PayPalSDK;
    let strategy: PayPalCommerceVenmoPaymentStrategy;

    const paypalOrderId = 'paypal123';

    const fundingSource = 'venmo';
    const defaultMethodId = 'paypalcommercevenmo';
    const defaultContainerId = '#container';

    const paypalCommerceVenmoOptions: PayPalCommerceVenmoPaymentInitializeOptions = {
        container: defaultContainerId,
        onValidate: jest.fn(),
        submitForm: jest.fn(),
    };

    const initializationOptions: PaymentInitializeOptions = {
        methodId: defaultMethodId,
        paypalcommercevenmo: paypalCommerceVenmoOptions,
    };

    beforeEach(() => {
        eventEmitter = new EventEmitter();

        paypalSdk = getPayPalSDKMock();
        paymentMethod = getPayPalCommercePaymentMethod();
        paymentMethod.id = defaultMethodId;
        paymentMethod.initializationData.orderId = undefined;

        loadingIndicator = new LoadingIndicator();
        paypalCommerceIntegrationService = getPayPalCommerceIntegrationServiceMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new PayPalCommerceVenmoPaymentStrategy(
            paymentIntegrationService,
            paypalCommerceIntegrationService,
            loadingIndicator,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        jest.spyOn(paypalCommerceIntegrationService, 'loadPayPalSdk').mockReturnValue(paypalSdk);
        jest.spyOn(paypalCommerceIntegrationService, 'getPayPalSdkOrThrow').mockReturnValue(
            paypalSdk,
        );
        jest.spyOn(paypalCommerceIntegrationService, 'createOrder').mockReturnValue(undefined);
        jest.spyOn(paypalCommerceIntegrationService, 'submitPayment').mockReturnValue(undefined);

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

    it('creates an instance of the PayPal Commerce Venmo payment strategy', () => {
        expect(strategy).toBeInstanceOf(PayPalCommerceVenmoPaymentStrategy);
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

        it('throws error if options.paypalcommercevenmo is not provided', async () => {
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

        it('throws an error if paypal button is not eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => false),
                render: paypalCommerceSdkRenderMock,
            }));

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(NotImplementedError);
            }
        });

        it('renders paypal button if it is eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
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
                'paypalcommercevenmocheckout',
            );
        });
    });

    describe('#onClick button callback', () => {
        it('calls validation callback with provided params', async () => {
            const onValidateMock = jest.fn();

            await strategy.initialize({
                ...initializationOptions,
                paypalcommercevenmo: {
                    ...paypalCommerceVenmoOptions,
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
                paypalcommercevenmo: {
                    ...paypalCommerceVenmoOptions,
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
                paypalcommercevenmo: {
                    ...paypalCommerceVenmoOptions,
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
                paypalcommercevenmo: {
                    ...paypalCommerceVenmoOptions,
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

            expect(paypalCommerceIntegrationService.submitPayment).toHaveBeenCalledWith(
                payload.payment.methodId,
                paypalOrderId,
            );
        });
    });

    describe('#deinitialize()', () => {
        it('closes paypal button component on deinitialize strategy', async () => {
            const paypalCommerceSdkCloseMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => true),
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
});
