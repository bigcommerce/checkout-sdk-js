import { EventEmitter } from 'events';

import {
    CustomerInitializeOptions,
    DefaultCheckoutButtonHeight,
    InvalidArgumentError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConsignment,
    getShippingOption,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import {
    getBillingAddressFromOrderDetails,
    getPayPalIntegrationServiceMock,
    getPayPalOrderDetails,
    getPayPalPaymentMethod,
    getPayPalSDKMock,
    getShippingAddressFromOrderDetails,
    PaypalButtonCreationService,
    PayPalButtonsOptions,
    PayPalHostWindow,
    PayPalIntegrationService,
    PayPalSDK,
    StyleButtonColor,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceCustomerInitializeOptions from './paypal-commerce-customer-initialize-options';
import PayPalCommerceCustomerStrategy from './paypal-commerce-customer-strategy';

describe('PayPalCommerceCustomerStrategy', () => {
    let eventEmitter: EventEmitter;
    let strategy: PayPalCommerceCustomerStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalIntegrationService: PayPalIntegrationService;
    let paypalSdk: PayPalSDK;
    let paypalButtonCreationService: PaypalButtonCreationService;

    const methodId = 'paypalcommerce';
    const defaultContainerId = 'paypal-commerce-container-mock-id';
    const approveDataOrderId = 'ORDER_ID';

    const paypalCommerceOptions: PayPalCommerceCustomerInitializeOptions = {
        container: defaultContainerId,
        onClick: jest.fn(),
        onComplete: jest.fn(),
    };

    const initializationOptions: CustomerInitializeOptions = {
        methodId,
        paypalcommerce: paypalCommerceOptions,
    };

    const resumeMock = jest.fn();

    beforeEach(() => {
        eventEmitter = new EventEmitter();
        paymentMethod = getPayPalPaymentMethod();
        paypalSdk = getPayPalSDKMock();
        paypalIntegrationService = getPayPalIntegrationServiceMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paypalButtonCreationService = new PaypalButtonCreationService(
            paymentIntegrationService,
            paypalIntegrationService,
        );

        strategy = new PayPalCommerceCustomerStrategy(
            paymentIntegrationService,
            paypalIntegrationService,
            paypalButtonCreationService,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(paymentIntegrationService, 'updateBillingAddress').mockImplementation(jest.fn());
        jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockImplementation(
            jest.fn(),
        );
        jest.spyOn(paymentIntegrationService, 'selectShippingOption').mockImplementation(jest.fn());

        jest.spyOn(paypalIntegrationService, 'loadPayPalSdk').mockResolvedValue(paypalSdk);
        jest.spyOn(paypalIntegrationService, 'getPayPalSdkOrThrow').mockReturnValue(paypalSdk);
        jest.spyOn(paypalIntegrationService, 'createOrder').mockImplementation(jest.fn());
        jest.spyOn(paypalIntegrationService, 'updateOrder').mockImplementation(jest.fn());
        jest.spyOn(paypalIntegrationService, 'tokenizePayment').mockImplementation(jest.fn());
        jest.spyOn(paypalIntegrationService, 'submitPayment').mockImplementation(jest.fn());
        jest.spyOn(paypalIntegrationService, 'removeElement').mockImplementation(jest.fn());
        jest.spyOn(paypalIntegrationService, 'getBillingAddressFromOrderDetails').mockReturnValue(
            getBillingAddressFromOrderDetails(),
        );
        jest.spyOn(paypalIntegrationService, 'getShippingAddressFromOrderDetails').mockReturnValue(
            getShippingAddressFromOrderDetails(),
        );
        jest.spyOn(paypalIntegrationService, 'getShippingOptionOrThrow').mockReturnValue(
            getShippingOption(),
        );

        jest.spyOn(paypalSdk, 'Buttons').mockImplementation((options: PayPalButtonsOptions) => {
            eventEmitter.on('createOrder', () => {
                if (options.createOrder) {
                    options.createOrder();
                }
            });

            eventEmitter.on('onApprove', () => {
                if (options.onApprove) {
                    options.onApprove(
                        { orderID: approveDataOrderId },
                        {
                            order: {
                                get: jest.fn(),
                            },
                        },
                    );
                }
            });

            eventEmitter.on('onClick', () => {
                if (options.onClick) {
                    options.onClick(
                        { fundingSource: 'paypal' },
                        {
                            resolve: jest.fn(),
                            reject: jest.fn(),
                        },
                    );
                }
            });

            eventEmitter.on('onShippingAddressChange', () => {
                if (options.onShippingAddressChange) {
                    options.onShippingAddressChange({
                        orderId: approveDataOrderId,
                        shippingAddress: {
                            city: 'New York',
                            countryCode: 'US',
                            postalCode: '07564',
                            state: 'New York',
                        },
                    });
                }
            });

            eventEmitter.on('onShippingOptionsChange', () => {
                if (options.onShippingOptionsChange) {
                    options.onShippingOptionsChange({
                        orderId: approveDataOrderId,
                        selectedShippingOption: {
                            amount: {
                                currency_code: 'USD',
                                value: '100',
                            },
                            id: '1',
                            label: 'Free shipping',
                            selected: true,
                            type: 'type_shipping',
                        },
                    });
                }
            });

            return {
                isEligible: jest.fn(() => true),
                render: jest.fn(),
                close: jest.fn(),
                hasReturned: jest.fn().mockReturnValue(true),
                resume: resumeMock,
            };
        });
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as PayPalHostWindow).paypal;
    });

    it('creates an interface of the PayPalCommerce customer strategy', () => {
        expect(strategy).toBeInstanceOf(PayPalCommerceCustomerStrategy);
    });

    describe('#initialize()', () => {
        it('throws an error if methodId is not provided', async () => {
            const options = {} as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommerce is not provided', async () => {
            const options = { methodId } as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommerce.container is not provided', async () => {
            const options = {
                methodId,
                paypalcommerce: {
                    onComplete: jest.fn(),
                    container: undefined,
                },
            } as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommerce.onClick is provided but it is not a function', async () => {
            const options = {
                methodId,
                paypalcommerce: {
                    container: 'container',
                    onClick: 'test',
                    onComplete: jest.fn(),
                },
            } as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('loads paypalcommerce payment method', async () => {
            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
        });

        it('does not load paypalcommerce payment method if payment method is already exists', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethod').mockReturnValue(
                paymentMethod,
            );

            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).not.toHaveBeenCalled();
        });

        it('loads paypal sdk with provided method id', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalIntegrationService.loadPayPalSdk).toHaveBeenCalledWith(methodId);
        });
    });

    describe('#renderButton', () => {
        it('initializes paypal buttons with default configuration', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdk.FUNDING.PAYPAL,
                style: {
                    height: DefaultCheckoutButtonHeight,
                    color: StyleButtonColor.silver,
                    label: 'checkout',
                },
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
                onClick: expect.any(Function),
            });
        });

        it('calls PayPal button resume', async () => {
            const paymentMethodWithServerSideCallbacks = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    isServerSideShippingCallbacksEnabled: true,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodWithServerSideCallbacks);
            await strategy.initialize(initializationOptions);

            expect(resumeMock).toHaveBeenCalled();
        });

        it('initializes paypal buttons with config related to hosted checkout feature', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    isHostedCheckoutEnabled: true,
                    isServerSideShippingCallbacksEnabled: false,
                },
            });

            await strategy.initialize(initializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdk.FUNDING.PAYPAL,
                style: {
                    height: DefaultCheckoutButtonHeight,
                    color: StyleButtonColor.silver,
                    label: 'checkout',
                },
                createOrder: expect.any(Function),
                onShippingAddressChange: expect.any(Function),
                onShippingOptionsChange: expect.any(Function),
                onApprove: expect.any(Function),
                onClick: expect.any(Function),
            });
        });

        it('initializes paypal buttons without shipping callbacks what server side shipping callbacks enabled', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    isHostedCheckoutEnabled: true,
                    isServerSideShippingCallbacksEnabled: true,
                },
            });

            await strategy.initialize(initializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                createOrder: expect.any(Function),
                fundingSource: paypalSdk.FUNDING.PAYPAL,
                style: {
                    height: DefaultCheckoutButtonHeight,
                    color: StyleButtonColor.silver,
                    label: 'checkout',
                },
                onApprove: expect.any(Function),
                onClick: expect.any(Function),
            });
        });

        it('renders PayPal button if it is eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => true),
                render: paypalCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).toHaveBeenCalled();
        });

        it('does not render PayPal button if it is not eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: paypalCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).not.toHaveBeenCalled();
            expect(paypalIntegrationService.removeElement).toHaveBeenCalledWith(defaultContainerId);
        });

        it('logs an error when PayPalSDK Buttons implementation is not available for some reasons', async () => {
            jest.spyOn(paypalIntegrationService, 'loadPayPalSdk').mockReturnValue(
                Promise.resolve(undefined),
            );

            const log = jest.fn();

            jest.spyOn(console, 'error').mockImplementation(log);

            await strategy.initialize(initializationOptions);

            expect(log).toHaveBeenCalled();
        });
    });

    describe('#createOrder button callback', () => {
        it('creates an order', async () => {
            jest.spyOn(paypalIntegrationService, 'createOrder').mockResolvedValue('');

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalIntegrationService.createOrder).toHaveBeenCalledWith('paypalcommerce');
        });
    });

    describe('#onApprove button callback', () => {
        describe('default flow', () => {
            it('tokenizes payment on paypal approve', async () => {
                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalIntegrationService.tokenizePayment).toHaveBeenCalledWith(
                    methodId,
                    approveDataOrderId,
                );
            });
        });

        describe('shipping options feature flow', () => {
            const paypalOrderDetails = getPayPalOrderDetails();

            beforeEach(() => {
                jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
                    (options: PayPalButtonsOptions) => {
                        eventEmitter.on('onApprove', () => {
                            if (options.onApprove) {
                                options.onApprove(
                                    { orderID: approveDataOrderId },
                                    {
                                        order: {
                                            get: jest.fn(() => Promise.resolve(paypalOrderDetails)),
                                        },
                                    },
                                );
                            }
                        });

                        return {
                            close: jest.fn(),
                            render: jest.fn(),
                            isEligible: jest.fn(() => true),
                        };
                    },
                );

                const paymentMethodWithShippingOptionsFeature = {
                    ...paymentMethod,
                    initializationData: {
                        ...paymentMethod.initializationData,
                        isHostedCheckoutEnabled: true,
                    },
                };

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(paymentMethodWithShippingOptionsFeature);
            });

            it('trigger the onError callback if the payment approval fails', async () => {
                jest.spyOn(paypalIntegrationService, 'submitPayment').mockRejectedValue(
                    'Request failed',
                );

                const options = {
                    ...initializationOptions,
                    paypalcommerce: {
                        ...paypalCommerceOptions,
                        onError: jest.fn(),
                    },
                };

                await strategy.initialize(options);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(options.paypalcommerce.onError).toHaveBeenCalled();
            });

            it('takes order details data from paypal', async () => {
                const getOrderActionMock = jest.fn(() => Promise.resolve(paypalOrderDetails));

                jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
                    (options: PayPalButtonsOptions) => {
                        eventEmitter.on('onApprove', () => {
                            if (options.onApprove) {
                                options.onApprove(
                                    { orderID: approveDataOrderId },
                                    {
                                        order: {
                                            get: getOrderActionMock,
                                        },
                                    },
                                );
                            }
                        });

                        return {
                            close: jest.fn(),
                            render: jest.fn(),
                            isEligible: jest.fn(() => true),
                        };
                    },
                );

                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(getOrderActionMock).toHaveBeenCalled();
                expect(getOrderActionMock).toHaveReturnedWith(Promise.resolve(paypalOrderDetails));
            });

            it('updates billing address with valid customers data', async () => {
                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(
                    paypalIntegrationService.getBillingAddressFromOrderDetails,
                ).toHaveBeenCalledWith(getPayPalOrderDetails());
                expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith(
                    getBillingAddressFromOrderDetails(),
                );
            });

            it('updates shipping address with valid customers data if physical items are available in the cart', async () => {
                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(
                    paypalIntegrationService.getShippingAddressFromOrderDetails,
                ).toHaveBeenCalledWith(getPayPalOrderDetails());
                expect(paymentIntegrationService.updateShippingAddress).toHaveBeenCalledWith(
                    getShippingAddressFromOrderDetails(),
                );
            });

            it('submits BC order with provided methodId', async () => {
                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                    {},
                    {
                        params: {
                            methodId: initializationOptions.methodId,
                        },
                    },
                );
            });

            it('submits BC payment to update BC order data', async () => {
                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalIntegrationService.submitPayment).toHaveBeenCalledWith(
                    methodId,
                    approveDataOrderId,
                );
            });
        });
    });

    describe('#onShippingAddressChange button callback', () => {
        beforeEach(() => {
            const paymentMethodWithShippingOptionsFeature = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    isHostedCheckoutEnabled: true,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodWithShippingOptionsFeature);
        });

        it('updates billing and shipping address with data returned from PayPal', async () => {
            const address = {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                company: '',
                address1: '',
                address2: '',
                city: 'New York',
                countryCode: 'US',
                postalCode: '07564',
                stateOrProvince: '',
                stateOrProvinceCode: 'New York',
                customFields: [],
            };

            jest.spyOn(paypalIntegrationService, 'getAddress').mockReturnValue(address);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingAddressChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith(address);
            expect(paymentIntegrationService.updateShippingAddress).toHaveBeenCalledWith(address);
        });

        it('selects shipping option after address update', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingAddressChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalIntegrationService.getShippingOptionOrThrow).toHaveBeenCalled();
            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalledWith(
                getShippingOption().id,
            );
        });

        it('updates PayPal order after shipping option selection', async () => {
            const consignment = getConsignment();

            // INFO: lets imagine that it is a state that we get after consignmentActionCreator.selectShippingOption call
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getConsignmentsOrThrow',
            ).mockReturnValue([consignment]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingAddressChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalIntegrationService.updateOrder).toHaveBeenCalled();
        });
    });

    describe('#onShippingOptionsChange button callback', () => {
        beforeEach(() => {
            const paymentMethodWithShippingOptionsFeature = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    isHostedCheckoutEnabled: true,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodWithShippingOptionsFeature);
        });

        it('selects shipping option', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingOptionsChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalIntegrationService.getShippingOptionOrThrow).toHaveBeenCalled();
            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalledWith(
                getShippingOption().id,
            );
        });

        it('updates PayPal order', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingOptionsChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalIntegrationService.updateOrder).toHaveBeenCalled();
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
        });
    });

    describe('#signIn()', () => {
        it('calls default sign in method', async () => {
            const credentials = {
                email: 'test@test.com',
                password: '123',
            };

            await strategy.signIn(credentials);

            expect(paymentIntegrationService.signInCustomer).toHaveBeenCalledWith(
                credentials,
                undefined,
            );
        });
    });

    describe('#signOut()', () => {
        it('calls default sign out method', async () => {
            await strategy.signOut();

            expect(paymentIntegrationService.signOutCustomer).toHaveBeenCalled();
        });
    });

    describe('#executePaymentMethodCheckout()', () => {
        it('calls default continue with checkout callback', async () => {
            const continueWithCheckoutCallback = jest.fn();

            await strategy.executePaymentMethodCheckout({ continueWithCheckoutCallback });

            expect(continueWithCheckoutCallback).toHaveBeenCalled();
        });

        it('makes nothing if continue with checkout callback is not provided', async () => {
            const result = await strategy.executePaymentMethodCheckout();

            expect(result).toBeUndefined();
        });
    });
});
