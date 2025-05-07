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

import BigCommerceIntegrationService from '../big-commerce-integration-service';
import {
    BigCommerceButtonsOptions,
    BigCommerceHostWindow,
    BigCommerceSDK,
    StyleButtonColor,
} from '../big-commerce-types';
import {
    getBigCommerceIntegrationServiceMock,
    getBigCommerceOrderDetails,
    getBigCommercePaymentMethod,
    getBigCommerceSDKMock,
    getBillingAddressFromOrderDetails,
    getShippingAddressFromOrderDetails,
} from '../mocks';

import BigCommerceCreditCustomerInitializeOptions, {
    WithBigCommerceCreditCustomerInitializeOptions,
} from './big-commerce-credit-customer-initialize-options';
import BigCommerceCreditCustomerStrategy from './big-commerce-credit-customer-strategy';

describe('BigCommerceCreditCustomerStrategy', () => {
    let eventEmitter: EventEmitter;
    let strategy: BigCommerceCreditCustomerStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let bigCommerceIntegrationService: BigCommerceIntegrationService;
    let bigCommerceSdk: BigCommerceSDK;

    const methodId = 'bigcommerce_payments_paylater';
    const defaultContainerId = 'bigcommerce-commerce-credit-container-mock-id';
    const approveDataOrderId = 'ORDER_ID';

    const bigCommerceCreditOptions: BigCommerceCreditCustomerInitializeOptions = {
        container: defaultContainerId,
        onClick: jest.fn(),
        onComplete: jest.fn(),
    };

    const initializationOptions: CustomerInitializeOptions &
        WithBigCommerceCreditCustomerInitializeOptions = {
        methodId,
        bigcommerce_payments_paylater: bigCommerceCreditOptions,
    };

    beforeEach(() => {
        eventEmitter = new EventEmitter();

        paymentMethod = { ...getBigCommercePaymentMethod(), id: methodId };
        bigCommerceSdk = getBigCommerceSDKMock();
        bigCommerceIntegrationService = getBigCommerceIntegrationServiceMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new BigCommerceCreditCustomerStrategy(
            paymentIntegrationService,
            bigCommerceIntegrationService,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(paymentIntegrationService, 'updateBillingAddress').mockImplementation(jest.fn());
        jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockImplementation(
            jest.fn(),
        );
        jest.spyOn(paymentIntegrationService, 'selectShippingOption').mockImplementation(jest.fn());

        jest.spyOn(bigCommerceIntegrationService, 'loadBigCommerceSdk').mockResolvedValue(
            bigCommerceSdk,
        );
        jest.spyOn(bigCommerceIntegrationService, 'getBigCommerceSdkOrThrow').mockReturnValue(
            bigCommerceSdk,
        );
        jest.spyOn(bigCommerceIntegrationService, 'createOrder').mockImplementation(jest.fn());
        jest.spyOn(bigCommerceIntegrationService, 'updateOrder').mockImplementation(jest.fn());
        jest.spyOn(bigCommerceIntegrationService, 'tokenizePayment').mockImplementation(jest.fn());
        jest.spyOn(bigCommerceIntegrationService, 'submitPayment').mockImplementation(jest.fn());
        jest.spyOn(bigCommerceIntegrationService, 'removeElement').mockImplementation(jest.fn());
        jest.spyOn(
            bigCommerceIntegrationService,
            'getBillingAddressFromOrderDetails',
        ).mockReturnValue(getBillingAddressFromOrderDetails());
        jest.spyOn(
            bigCommerceIntegrationService,
            'getShippingAddressFromOrderDetails',
        ).mockReturnValue(getShippingAddressFromOrderDetails());
        jest.spyOn(bigCommerceIntegrationService, 'getShippingOptionOrThrow').mockReturnValue(
            getShippingOption(),
        );

        jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(
            (options: BigCommerceButtonsOptions) => {
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
                            { fundingSource: 'credit' },
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
                    close: jest.fn(),
                    isEligible: jest.fn(() => true),
                    render: jest.fn(),
                };
            },
        );
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as BigCommerceHostWindow).bigcommerce;
    });

    it('creates an interface of the BigCommerce Commerce Credit (PayLater) customer strategy', () => {
        expect(strategy).toBeInstanceOf(BigCommerceCreditCustomerStrategy);
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

        it('throws an error if bigcommerce_payments_paylater is not provided', async () => {
            const options = { methodId } as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if bigcommerce_payments_paylater.container is not provided', async () => {
            const options = {
                methodId,
                bigcommerce_payments_paylater: {
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

        it('throws an error if bigcommerce_payments_paylater.onClick is provided but it is not a function', async () => {
            const options = {
                methodId,
                bigcommerce_payments_paylater: {
                    ...initializationOptions.bigcommerce_payments_paylater,
                    onClick: 'test',
                },
            } as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('loads bigcommerce_payments_paylater payment method', async () => {
            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
        });

        it('does not load bigcommerce_payments_paylater payment method if payment method is already exists', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethod').mockReturnValue(
                paymentMethod,
            );

            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).not.toHaveBeenCalled();
        });

        it('loads bigcommerce sdk with provided method id', async () => {
            await strategy.initialize(initializationOptions);

            expect(bigCommerceIntegrationService.loadBigCommerceSdk).toHaveBeenCalledWith(methodId);
        });
    });

    describe('#renderButton', () => {
        it('initializes bigcommerce button with default configuration', async () => {
            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: bigCommerceSdk.FUNDING.PAYLATER,
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

        it('initializes bigcommerce buttons with config related to hosted checkout feature', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    isHostedCheckoutEnabled: true,
                },
            });

            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: bigCommerceSdk.FUNDING.PAYLATER,
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

        it('renders BigCommerce PayLater button if it is eligible', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => true),
                render: bigCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdkRenderMock).toHaveBeenCalled();
        });

        it('renders BigCommerce Credit button if BigCommerce PayLater button is not eligible', async () => {
            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(
                (options: BigCommerceButtonsOptions) => {
                    return {
                        close: jest.fn(),
                        render: jest.fn(),
                        isEligible: jest.fn(() => {
                            return options.fundingSource === bigCommerceSdk.FUNDING.CREDIT;
                        }),
                    };
                },
            );

            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: bigCommerceSdk.FUNDING.CREDIT,
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

        it('does not render BigCommerce button if it is not eligible', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: bigCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdkRenderMock).not.toHaveBeenCalled();
            expect(bigCommerceIntegrationService.removeElement).toHaveBeenCalledWith(
                defaultContainerId,
            );
        });

        it('logs an error when BigCommerceSDK Buttons implementation is not available for some reasons', async () => {
            jest.spyOn(bigCommerceIntegrationService, 'loadBigCommerceSdk').mockReturnValue(
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
            jest.spyOn(bigCommerceIntegrationService, 'createOrder').mockResolvedValue('');

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommerceIntegrationService.createOrder).toHaveBeenCalledWith(
                'bigcommerce_payments_paylater',
            );
        });
    });

    describe('#onApprove button callback', () => {
        describe('default flow', () => {
            it('tokenizes payment on bigcommerce approve', async () => {
                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(bigCommerceIntegrationService.tokenizePayment).toHaveBeenCalledWith(
                    methodId,
                    approveDataOrderId,
                );
            });
        });

        describe('shipping options feature flow', () => {
            const bigCommerceOrderDetails = getBigCommerceOrderDetails();

            beforeEach(() => {
                jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(
                    (options: BigCommerceButtonsOptions) => {
                        eventEmitter.on('onApprove', () => {
                            if (options.onApprove) {
                                options.onApprove(
                                    { orderID: approveDataOrderId },
                                    {
                                        order: {
                                            get: jest.fn(() =>
                                                Promise.resolve(bigCommerceOrderDetails),
                                            ),
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

            it('takes order details data from bigcommerce', async () => {
                const getOrderActionMock = jest.fn(() => Promise.resolve(bigCommerceOrderDetails));

                jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(
                    (options: BigCommerceButtonsOptions) => {
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
                expect(getOrderActionMock).toHaveReturnedWith(
                    Promise.resolve(bigCommerceOrderDetails),
                );
            });

            it('updates billing address with valid customers data', async () => {
                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(
                    bigCommerceIntegrationService.getBillingAddressFromOrderDetails,
                ).toHaveBeenCalledWith(getBigCommerceOrderDetails());
                expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith(
                    getBillingAddressFromOrderDetails(),
                );
            });

            it('updates shipping address with valid customers data if physical items are available in the cart', async () => {
                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(
                    bigCommerceIntegrationService.getShippingAddressFromOrderDetails,
                ).toHaveBeenCalledWith(getBigCommerceOrderDetails());
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

                expect(bigCommerceIntegrationService.submitPayment).toHaveBeenCalledWith(
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

        it('updates billing and shipping address with data returned from BigCommerce', async () => {
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

            jest.spyOn(bigCommerceIntegrationService, 'getAddress').mockReturnValue(address);

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

            expect(bigCommerceIntegrationService.getShippingOptionOrThrow).toHaveBeenCalled();
            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalledWith(
                getShippingOption().id,
            );
        });

        it('updates BigCommerce order after shipping option selection', async () => {
            const consignment = getConsignment();

            // INFO: lets imagine that it is a state that we get after consignmentActionCreator.selectShippingOption call
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getConsignmentsOrThrow',
            ).mockReturnValue([consignment]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingAddressChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommerceIntegrationService.updateOrder).toHaveBeenCalled();
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

            expect(bigCommerceIntegrationService.getShippingOptionOrThrow).toHaveBeenCalled();
            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalledWith(
                getShippingOption().id,
            );
        });

        it('updates BigCommerce order', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingOptionsChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommerceIntegrationService.updateOrder).toHaveBeenCalled();
        });
    });

    describe('#onClick button callback', () => {
        it('triggers onClick option by clicking on the button', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onClick');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommerceCreditOptions.onClick).toHaveBeenCalled();
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
