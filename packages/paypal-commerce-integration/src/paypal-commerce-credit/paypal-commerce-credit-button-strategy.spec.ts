import { EventEmitter } from 'events';

import {
    Cart,
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBuyNowCart,
    getBuyNowCartRequestBody,
    getCart,
    getConfig,
    getConsignment,
    getShippingOption,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import {
    createPayPalCommerceSdk,
    PayPalCommerceSdk,
    PayPalMessagesSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import {
    getBillingAddressFromOrderDetails,
    getPayPalCommerceIntegrationServiceMock,
    getPayPalCommerceOrderDetails,
    getPayPalCommercePaymentMethod,
    getPayPalSDKMock,
    getShippingAddressFromOrderDetails,
} from '../mocks';
import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import {
    PayPalCommerceButtonsOptions,
    PayPalCommerceHostWindow,
    PayPalSDK,
} from '../paypal-commerce-types';

import PayPalCommerceCreditButtonInitializeOptions from './paypal-commerce-credit-button-initialize-options';
import PayPalCommerceCreditButtonStrategy from './paypal-commerce-credit-button-strategy';

describe('PayPalCommerceCreditButtonStrategy', () => {
    let buyNowCart: Cart;
    let cart: Cart;
    let eventEmitter: EventEmitter;
    let strategy: PayPalCommerceCreditButtonStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalButtonElement: HTMLDivElement;
    let paypalMessageElement: HTMLDivElement;
    let paypalCommerceIntegrationService: PayPalCommerceIntegrationService;
    let paypalSdk: PayPalSDK;
    let paypalCommerceSdk: PayPalCommerceSdk;
    let payPalMessagesSdk: PayPalMessagesSdk;

    const defaultMethodId = 'paypalcommercecredit';
    const defaultButtonContainerId = 'paypal-commerce-credit-button-mock-id';
    const defaultMessageContainerId = 'paypal-commerce-credit-message-mock-id';
    const paypalOrderId = 'ORDER_ID';

    const paypalCommerceSdkRenderMock = jest.fn();

    const buyNowCartRequestBody = getBuyNowCartRequestBody();

    const buyNowPayPalCommerceCreditOptions: PayPalCommerceCreditButtonInitializeOptions = {
        buyNowInitializeOptions: {
            getBuyNowCartRequestBody: jest.fn().mockReturnValue(buyNowCartRequestBody),
        },
        currencyCode: 'USD',
        messagingContainerId: defaultMessageContainerId,
        style: {
            height: 45,
        },
        onComplete: jest.fn(),
    };

    const buyNowInitializationOptions: CheckoutButtonInitializeOptions = {
        methodId: defaultMethodId,
        containerId: defaultButtonContainerId,
        paypalcommercecredit: buyNowPayPalCommerceCreditOptions,
    };

    const paypalCommerceCreditOptions: PayPalCommerceCreditButtonInitializeOptions = {
        messagingContainerId: defaultMessageContainerId,
        style: {
            height: 45,
        },
        onComplete: jest.fn(),
        onEligibilityFailure: jest.fn(),
    };

    const initializationOptions: CheckoutButtonInitializeOptions = {
        methodId: defaultMethodId,
        containerId: defaultButtonContainerId,
        paypalcommercecredit: paypalCommerceCreditOptions,
    };

    const paypalShippingAddressPayloadMock = {
        city: 'New York',
        countryCode: 'US',
        postalCode: '07564',
        state: 'New York',
    };

    const paypalSelectedShippingOptionPayloadMock = {
        amount: {
            currency_code: 'USD',
            value: '100',
        },
        id: '1',
        label: 'Free shipping',
        selected: true,
        type: 'type_shipping',
    };

    beforeEach(() => {
        buyNowCart = getBuyNowCart();
        cart = getCart();

        eventEmitter = new EventEmitter();

        payPalMessagesSdk = {
            Messages: jest.fn(),
        };

        paypalCommerceIntegrationService = getPayPalCommerceIntegrationServiceMock();
        paymentMethod = getPayPalCommercePaymentMethod();
        paypalSdk = getPayPalSDKMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paypalCommerceSdk = createPayPalCommerceSdk();

        strategy = new PayPalCommerceCreditButtonStrategy(
            paymentIntegrationService,
            paypalCommerceIntegrationService,
            paypalCommerceSdk,
        );

        paypalButtonElement = document.createElement('div');
        paypalButtonElement.id = defaultButtonContainerId;
        document.body.appendChild(paypalButtonElement);

        paypalMessageElement = document.createElement('div');
        paypalMessageElement.id = defaultMessageContainerId;
        document.body.appendChild(paypalMessageElement);

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(paymentIntegrationService, 'loadDefaultCheckout').mockImplementation(jest.fn());
        jest.spyOn(paymentIntegrationService, 'updateBillingAddress').mockImplementation(jest.fn());
        jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockImplementation(
            jest.fn(),
        );
        jest.spyOn(paymentIntegrationService, 'selectShippingOption').mockImplementation(jest.fn());

        jest.spyOn(paypalCommerceIntegrationService, 'loadPayPalSdk').mockReturnValue(
            Promise.resolve(paypalSdk),
        );
        jest.spyOn(paypalCommerceIntegrationService, 'getPayPalSdkOrThrow').mockReturnValue(
            paypalSdk,
        );
        jest.spyOn(paypalCommerceIntegrationService, 'createBuyNowCartOrThrow').mockReturnValue(
            Promise.resolve(buyNowCart),
        );
        jest.spyOn(paypalCommerceIntegrationService, 'createOrder').mockImplementation(jest.fn());
        jest.spyOn(paypalCommerceIntegrationService, 'updateOrder').mockImplementation(jest.fn());
        jest.spyOn(paypalCommerceIntegrationService, 'tokenizePayment').mockImplementation(
            jest.fn(),
        );
        jest.spyOn(paypalCommerceIntegrationService, 'submitPayment').mockImplementation(jest.fn());
        jest.spyOn(paypalCommerceIntegrationService, 'removeElement').mockImplementation(jest.fn());
        jest.spyOn(
            paypalCommerceIntegrationService,
            'getBillingAddressFromOrderDetails',
        ).mockReturnValue(getBillingAddressFromOrderDetails());
        jest.spyOn(
            paypalCommerceIntegrationService,
            'getShippingAddressFromOrderDetails',
        ).mockReturnValue(getShippingAddressFromOrderDetails());
        jest.spyOn(paypalCommerceIntegrationService, 'getShippingOptionOrThrow').mockReturnValue(
            getShippingOption(),
        );
        jest.spyOn(paypalCommerceSdk, 'getPayPalMessages').mockImplementation(() =>
            Promise.resolve(payPalMessagesSdk),
        );
        jest.spyOn(payPalMessagesSdk, 'Messages').mockImplementation(() => ({
            render: paypalCommerceSdkRenderMock,
        }));

        jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
            (options: PayPalCommerceButtonsOptions) => {
                eventEmitter.on('createOrder', () => {
                    if (options.createOrder) {
                        options.createOrder();
                    }
                });

                eventEmitter.on(
                    'onClick',
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    async (jestSuccessExpectationsCallback, jestFailureExpectationsCallback) => {
                        try {
                            if (options.onClick) {
                                await options.onClick(
                                    { fundingSource: 'paypal' },
                                    {
                                        reject: jest.fn(),
                                        resolve: jest.fn(),
                                    },
                                );

                                if (
                                    jestSuccessExpectationsCallback &&
                                    typeof jestSuccessExpectationsCallback === 'function'
                                ) {
                                    jestSuccessExpectationsCallback();
                                }
                            }
                        } catch (error) {
                            if (
                                jestFailureExpectationsCallback &&
                                typeof jestFailureExpectationsCallback === 'function'
                            ) {
                                jestFailureExpectationsCallback(error);
                            }
                        }
                    },
                );

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

                eventEmitter.on('onShippingAddressChange', () => {
                    if (options.onShippingAddressChange) {
                        options.onShippingAddressChange({
                            orderId: paypalOrderId,
                            shippingAddress: paypalShippingAddressPayloadMock,
                        });
                    }
                });

                eventEmitter.on('onShippingOptionsChange', () => {
                    if (options.onShippingOptionsChange) {
                        options.onShippingOptionsChange({
                            orderId: paypalOrderId,
                            selectedShippingOption: paypalSelectedShippingOptionPayloadMock,
                        });
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

        if (document.getElementById(defaultButtonContainerId)) {
            document.body.removeChild(paypalButtonElement);
        }
    });

    it('creates an instance of the PayPal Commerce Credit checkout button strategy', () => {
        expect(strategy).toBeInstanceOf(PayPalCommerceCreditButtonStrategy);
    });

    describe('#initialize()', () => {
        it('throws error if methodId is not provided', async () => {
            const options = {
                containerId: defaultButtonContainerId,
            } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if containerId is not provided', async () => {
            const options = {
                methodId: defaultMethodId,
            } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommercecredit is not provided', async () => {
            const options = {
                containerId: defaultButtonContainerId,
                methodId: defaultMethodId,
            } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommercecredit.currencyCode is not provided (for buyNowFlow only)', async () => {
            const { currencyCode, ...rest } = buyNowPayPalCommerceCreditOptions;

            const newInitializationOptions = {
                ...buyNowInitializationOptions,
                paypalcommercecredit: rest,
            };

            try {
                await strategy.initialize(newInitializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if provided buyNow callback is not a function is not provided (for buyNowFlow only)', async () => {
            const { buyNowInitializeOptions, ...rest } = buyNowPayPalCommerceCreditOptions;

            const newInitializationOptions = {
                ...buyNowInitializationOptions,
                paypalcommercecredit: {
                    ...rest,
                    buyNowInitializeOptions: {
                        getBuyNowCartRequestBody: 'string',
                    },
                },
            } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(newInitializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('loads default checkout', async () => {
            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadDefaultCheckout).toHaveBeenCalled();
        });

        it('does not load default checkout for Buy Now flow', async () => {
            await strategy.initialize(buyNowInitializationOptions);

            expect(paymentIntegrationService.loadDefaultCheckout).not.toHaveBeenCalled();
        });

        it('loads paypal sdk script', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalCommerceIntegrationService.loadPayPalSdk).toHaveBeenCalledWith(
                defaultMethodId,
                cart.currency.code,
                false,
            );
        });

        it('loads paypal sdk script with provided currency code (Buy Now flow)', async () => {
            await strategy.initialize(buyNowInitializationOptions);

            expect(paypalCommerceIntegrationService.loadPayPalSdk).toHaveBeenCalledWith(
                defaultMethodId,
                buyNowPayPalCommerceCreditOptions.currencyCode,
                false,
            );
        });
    });

    describe('#renderButton', () => {
        it('initializes PayPal button to render (default flow)', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdk.FUNDING.PAYLATER,
                style: paypalCommerceCreditOptions.style,
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
            });
        });

        it('initializes PayPal Credit button to render if PayPal PayLater is not eligible', async () => {
            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
                (options: PayPalCommerceButtonsOptions) => {
                    return {
                        render: jest.fn(),
                        isEligible: jest.fn(() => {
                            return options.fundingSource === paypalSdk.FUNDING.CREDIT;
                        }),
                        close: jest.fn(),
                    };
                },
            );

            await strategy.initialize(initializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdk.FUNDING.CREDIT,
                style: paypalCommerceCreditOptions.style,
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
            });
        });

        it('initializes PayPal button to render (buy now flow)', async () => {
            await strategy.initialize(buyNowInitializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdk.FUNDING.PAYLATER,
                style: paypalCommerceCreditOptions.style,
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
                onClick: expect.any(Function),
                onCancel: expect.any(Function),
            });
        });

        it('initializes PayPal button to render (with shipping options feature enabled)', async () => {
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

            await strategy.initialize(initializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdk.FUNDING.PAYLATER,
                style: paypalCommerceCreditOptions.style,
                createOrder: expect.any(Function),
                onShippingAddressChange: expect.any(Function),
                onShippingOptionsChange: expect.any(Function),
                onApprove: expect.any(Function),
            });
        });

        it('renders PayPal button if it is eligible', async () => {
            const renderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => true),
                render: renderMock,
                close: jest.fn(),
            }));

            await strategy.initialize(initializationOptions);

            expect(renderMock).toHaveBeenCalled();
        });

        it('calls onEligibilityFailure callback when PayPal button is not eligible', async () => {
            const renderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => false),
                render: renderMock,
                close: jest.fn(),
            }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceCreditOptions.onEligibilityFailure).toHaveBeenCalled();
            expect(renderMock).not.toHaveBeenCalled();
        });

        it('removes PayPal button container if the button is not eligible', async () => {
            const renderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => false),
                render: renderMock,
                close: jest.fn(),
            }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceIntegrationService.removeElement).toHaveBeenCalledWith(
                defaultButtonContainerId,
            );
        });
    });

    describe('#createOrder', () => {
        it('creates paypal order', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceIntegrationService.createOrder).toHaveBeenCalledWith(
                'paypalcommercecredit',
            );
        });
    });

    describe('#handleClick', () => {
        beforeEach(() => {
            jest.spyOn(paymentIntegrationService, 'createBuyNowCart').mockReturnValue(
                Promise.resolve(buyNowCart),
            );
            jest.spyOn(paymentIntegrationService, 'loadCheckout');
        });

        it('creates buy now cart on button click', async () => {
            await strategy.initialize(buyNowInitializationOptions);
            eventEmitter.emit('onClick');
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceIntegrationService.createBuyNowCartOrThrow).toHaveBeenCalled();
        });

        it('loads checkout related to buy now cart on button click', async () => {
            await strategy.initialize(buyNowInitializationOptions);
            eventEmitter.emit('onClick');
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.loadCheckout).toHaveBeenCalledWith(buyNowCart.id);
        });
    });

    describe('#onApprove button callback', () => {
        describe('default flow', () => {
            it('tokenizes payment on paypal approve', async () => {
                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalCommerceIntegrationService.tokenizePayment).toHaveBeenCalledWith(
                    defaultMethodId,
                    paypalOrderId,
                );
            });
        });

        describe('shipping options feature flow', () => {
            const paypalOrderDetails = getPayPalCommerceOrderDetails();

            beforeEach(() => {
                jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
                    (options: PayPalCommerceButtonsOptions) => {
                        eventEmitter.on('onApprove', () => {
                            if (options.onApprove) {
                                options.onApprove(
                                    { orderID: paypalOrderId },
                                    {
                                        order: {
                                            get: () => Promise.resolve(paypalOrderDetails),
                                        },
                                    },
                                );
                            }
                        });

                        return {
                            render: jest.fn(),
                            isEligible: jest.fn(() => true),
                            close: jest.fn(),
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

            it('takes order details data from paypal', async () => {
                const getOrderActionMock = jest.fn();

                jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
                    (options: PayPalCommerceButtonsOptions) => {
                        eventEmitter.on('onApprove', () => {
                            if (options.onApprove) {
                                options.onApprove(
                                    { orderID: paypalOrderId },
                                    {
                                        order: {
                                            get: getOrderActionMock,
                                        },
                                    },
                                );
                            }
                        });

                        return {
                            render: jest.fn(),
                            isEligible: jest.fn(() => true),
                            close: jest.fn(),
                        };
                    },
                );

                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(getOrderActionMock).toHaveBeenCalled();
            });

            it('updates billing address with valid customers data', async () => {
                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(
                    paypalCommerceIntegrationService.getBillingAddressFromOrderDetails,
                ).toHaveBeenCalledWith(getPayPalCommerceOrderDetails());
                expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith(
                    getBillingAddressFromOrderDetails(),
                );
            });

            it('updates shipping address with valid customers data if physical items are available in the cart', async () => {
                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(
                    paypalCommerceIntegrationService.getShippingAddressFromOrderDetails,
                ).toHaveBeenCalledWith(getPayPalCommerceOrderDetails());
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

                expect(paypalCommerceIntegrationService.submitPayment).toHaveBeenCalledWith(
                    defaultMethodId,
                    paypalOrderId,
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
                city: paypalShippingAddressPayloadMock.city,
                countryCode: paypalShippingAddressPayloadMock.countryCode,
                postalCode: paypalShippingAddressPayloadMock.postalCode,
                stateOrProvince: '',
                stateOrProvinceCode: paypalShippingAddressPayloadMock.state,
                customFields: [],
            };

            jest.spyOn(paypalCommerceIntegrationService, 'getAddress').mockReturnValue(address);

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

            expect(paypalCommerceIntegrationService.getShippingOptionOrThrow).toHaveBeenCalled();
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

            expect(paypalCommerceIntegrationService.updateOrder).toHaveBeenCalled();
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

            expect(paypalCommerceIntegrationService.getShippingOptionOrThrow).toHaveBeenCalled();
            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalledWith(
                getShippingOption().id,
            );
        });

        it('updates PayPal order', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingOptionsChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceIntegrationService.updateOrder).toHaveBeenCalled();
        });
    });

    describe('PayPal Commerce Credit messages logic', () => {
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

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).not.toHaveBeenCalled();
        });

        it('does not render PayPal message if paypalBNPLConfiguration is not provided', async () => {
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

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).not.toHaveBeenCalled();
        });

        it('initializes PayPal Messages component', async () => {
            await strategy.initialize(initializationOptions);

            expect(payPalMessagesSdk.Messages).toHaveBeenCalledWith({
                amount: cart.cartAmount,
                placement: 'cart',
                style: {
                    layout: 'text',
                    logo: {
                        position: 'right',
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
            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).toHaveBeenCalledWith(
                `#${defaultMessageContainerId}`,
            );
        });

        it('do not render PayPal message if experiment is enabled', async () => {
            const storeConfig = getConfig().storeConfig;
            const storeConfigWithFeaturesOn = {
                ...storeConfig,
                checkoutSettings: {
                    ...storeConfig.checkoutSettings,
                    features: {
                        ...storeConfig.checkoutSettings.features,
                        'PAYPAL-5557.Hide_ppc_banner_implementation': true,
                    },
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfigWithFeaturesOn);

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).not.toHaveBeenCalledWith(
                `#${defaultMessageContainerId}`,
            );
        });
    });

    describe('#onCancel button callback', () => {
        it('loads default checkout onCancel callback (buy now flow)', async () => {
            await strategy.initialize(buyNowInitializationOptions);
            eventEmitter.emit('onClick');
            await new Promise((resolve) => process.nextTick(resolve));
            eventEmitter.emit('onCancel');
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.loadDefaultCheckout).toHaveBeenCalled();
        });
    });
});
