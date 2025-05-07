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
    getConsignment,
    getShippingOption,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommerceIntegrationService from '../big-commerce-integration-service';
import {
    BigCommerceButtonsOptions,
    BigCommerceHostWindow,
    BigCommerceSDK,
} from '../big-commerce-types';
import {
    getBigCommerceIntegrationServiceMock,
    getBigCommerceOrderDetails,
    getBigCommercePaymentMethod,
    getBigCommerceSDKMock,
    getBillingAddressFromOrderDetails,
    getShippingAddressFromOrderDetails,
} from '../mocks';

import BigCommerceButtonInitializeOptions from './big-commerce-button-initialize-options';
import BigCommerceButtonStrategy from './big-commerce-button-strategy';

describe('BigCommerceButtonStrategy', () => {
    let buyNowCart: Cart;
    let cart: Cart;
    let eventEmitter: EventEmitter;
    let strategy: BigCommerceButtonStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let bigcommerceButtonElement: HTMLDivElement;
    let bigCommerceIntegrationService: BigCommerceIntegrationService;
    let bigcommerceSdk: BigCommerceSDK;

    const defaultMethodId = 'bigcommerce';
    const defaultButtonContainerId = 'bigcommerce-commerce-button-mock-id';
    const bigcommerceOrderId = 'ORDER_ID';

    const buyNowCartRequestBody = getBuyNowCartRequestBody();

    const buyNowBigCommerceOptions: BigCommerceButtonInitializeOptions = {
        buyNowInitializeOptions: {
            getBuyNowCartRequestBody: jest.fn().mockReturnValue(buyNowCartRequestBody),
        },
        currencyCode: 'USD',
        style: {
            height: 45,
        },
        onComplete: jest.fn(),
        onEligibilityFailure: jest.fn(),
    };

    const buyNowInitializationOptions: CheckoutButtonInitializeOptions = {
        methodId: defaultMethodId,
        containerId: defaultButtonContainerId,
        bigcommerce_payments_paypal: buyNowBigCommerceOptions,
    };

    const bigCommerceOptions: BigCommerceButtonInitializeOptions = {
        style: {
            height: 45,
        },
        onComplete: jest.fn(),
        onEligibilityFailure: jest.fn(),
    };

    const initializationOptions: CheckoutButtonInitializeOptions = {
        methodId: defaultMethodId,
        containerId: defaultButtonContainerId,
        bigcommerce_payments_paypal: bigCommerceOptions,
    };

    const bigcommerceShippingAddressPayloadMock = {
        city: 'New York',
        countryCode: 'US',
        postalCode: '07564',
        state: 'New York',
    };

    const bigcommerceSelectedShippingOptionPayloadMock = {
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

        bigCommerceIntegrationService = getBigCommerceIntegrationServiceMock();
        paymentMethod = getBigCommercePaymentMethod();
        bigcommerceSdk = getBigCommerceSDKMock();

        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new BigCommerceButtonStrategy(
            paymentIntegrationService,
            bigCommerceIntegrationService,
        );

        bigcommerceButtonElement = document.createElement('div');
        bigcommerceButtonElement.id = defaultButtonContainerId;
        document.body.appendChild(bigcommerceButtonElement);

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(paymentIntegrationService, 'loadDefaultCheckout').mockImplementation(jest.fn());
        jest.spyOn(paymentIntegrationService, 'updateBillingAddress').mockImplementation(jest.fn());
        jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockImplementation(
            jest.fn(),
        );
        jest.spyOn(paymentIntegrationService, 'selectShippingOption').mockImplementation(jest.fn());

        jest.spyOn(bigCommerceIntegrationService, 'loadBigCommerceSdk').mockReturnValue(
            Promise.resolve(bigcommerceSdk),
        );
        jest.spyOn(bigCommerceIntegrationService, 'getBigCommerceSdkOrThrow').mockReturnValue(
            bigcommerceSdk,
        );
        jest.spyOn(bigCommerceIntegrationService, 'createBuyNowCartOrThrow').mockReturnValue(
            Promise.resolve(buyNowCart),
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

        jest.spyOn(bigcommerceSdk, 'Buttons').mockImplementation(
            (options: BigCommerceButtonsOptions) => {
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
                                    { fundingSource: 'bigcommerce' },
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
                            { orderID: bigcommerceOrderId },
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
                            orderId: bigcommerceOrderId,
                            shippingAddress: bigcommerceShippingAddressPayloadMock,
                        });
                    }
                });

                eventEmitter.on('onShippingOptionsChange', () => {
                    if (options.onShippingOptionsChange) {
                        options.onShippingOptionsChange({
                            orderId: bigcommerceOrderId,
                            selectedShippingOption: bigcommerceSelectedShippingOptionPayloadMock,
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

        delete (window as BigCommerceHostWindow).bigcommerce;

        if (document.getElementById(defaultButtonContainerId)) {
            document.body.removeChild(bigcommerceButtonElement);
        }
    });

    it('creates an instance of the BigCommerce  checkout button strategy', () => {
        expect(strategy).toBeInstanceOf(BigCommerceButtonStrategy);
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

        it('throws an error if bigcommerce is not provided', async () => {
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

        it('throws an error if bigcommerce.currencyCode is not provided (for buyNowFlow only)', async () => {
            const { currencyCode, ...rest } = buyNowBigCommerceOptions;

            const newInitializationOptions = {
                ...buyNowInitializationOptions,
                bigcommerce_payments_paypal: rest,
            };

            try {
                await strategy.initialize(newInitializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if provided buyNow callback is not a function is not provided (for buyNowFlow only)', async () => {
            const { buyNowInitializeOptions, ...rest } = buyNowBigCommerceOptions;

            const newInitializationOptions = {
                ...buyNowInitializationOptions,
                bigcommerce_payments_paypal: {
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

        it('loads bigcommerce commerce sdk script', async () => {
            await strategy.initialize(initializationOptions);

            expect(bigCommerceIntegrationService.loadBigCommerceSdk).toHaveBeenCalledWith(
                defaultMethodId,
                cart.currency.code,
                false,
            );
        });

        it('loads bigcommerce commerce sdk script with provided currency code (Buy Now flow)', async () => {
            await strategy.initialize(buyNowInitializationOptions);

            expect(bigCommerceIntegrationService.loadBigCommerceSdk).toHaveBeenCalledWith(
                defaultMethodId,
                buyNowBigCommerceOptions.currencyCode,
                false,
            );
        });
    });

    describe('#renderButton', () => {
        it('initializes BigCommerce button to render (default flow)', async () => {
            await strategy.initialize(initializationOptions);

            expect(bigcommerceSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: bigcommerceSdk.FUNDING.BIGCOMMERCE,
                style: bigCommerceOptions.style,
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
            });
        });

        it('initializes BigCommerce button to render (buy now flow)', async () => {
            await strategy.initialize(buyNowInitializationOptions);

            expect(bigcommerceSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: bigcommerceSdk.FUNDING.BIGCOMMERCE,
                style: bigCommerceOptions.style,
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
                onClick: expect.any(Function),
                onCancel: expect.any(Function),
            });
        });

        it('initializes BigCommerce button to render (with shipping options feature enabled)', async () => {
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

            expect(bigcommerceSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: bigcommerceSdk.FUNDING.BIGCOMMERCE,
                style: bigCommerceOptions.style,
                createOrder: expect.any(Function),
                onShippingAddressChange: expect.any(Function),
                onShippingOptionsChange: expect.any(Function),
                onApprove: expect.any(Function),
            });
        });

        it('renders BigCommerce button if it is eligible', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigcommerceSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => true),
                render: bigCommerceSdkRenderMock,
                close: jest.fn(),
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdkRenderMock).toHaveBeenCalled();
        });

        it('does not render BigCommerce button if it is not eligible', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigcommerceSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => false),
                render: bigCommerceSdkRenderMock,
                close: jest.fn(),
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdkRenderMock).not.toHaveBeenCalled();
        });

        it('calls onEligibilityFailure callback when the BigCommerce button is not eligible', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigcommerceSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => false),
                render: bigCommerceSdkRenderMock,
                close: jest.fn(),
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommerceOptions.onEligibilityFailure).toHaveBeenCalled();
        });

        it('removes BigCommerce button container if the button is not eligible and onEligibilityFailure callback is not provided', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigcommerceSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => false),
                render: bigCommerceSdkRenderMock,
                close: jest.fn(),
            }));

            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_paypal: {
                    ...bigCommerceOptions,
                    onEligibilityFailure: undefined,
                },
            });

            expect(bigCommerceIntegrationService.removeElement).toHaveBeenCalledWith(
                defaultButtonContainerId,
            );
        });
    });

    describe('#createOrder', () => {
        it('creates bigcommerce order', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommerceIntegrationService.createOrder).toHaveBeenCalledWith(
                'bigcommerce_payments_paypal',
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

            expect(bigCommerceIntegrationService.createBuyNowCartOrThrow).toHaveBeenCalled();
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
            it('tokenizes payment on bigcommerce approve', async () => {
                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(bigCommerceIntegrationService.tokenizePayment).toHaveBeenCalledWith(
                    defaultMethodId,
                    bigcommerceOrderId,
                );
            });
        });

        describe('shipping options feature flow', () => {
            const bigCommerceOrderDetails = getBigCommerceOrderDetails();

            beforeEach(() => {
                jest.spyOn(bigcommerceSdk, 'Buttons').mockImplementation(
                    (options: BigCommerceButtonsOptions) => {
                        eventEmitter.on('onApprove', () => {
                            if (options.onApprove) {
                                options.onApprove(
                                    { orderID: bigcommerceOrderId },
                                    {
                                        order: {
                                            get: () => Promise.resolve(bigCommerceOrderDetails),
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

            it('takes order details data from bigcommerce', async () => {
                const getOrderActionMock = jest.fn();

                jest.spyOn(bigcommerceSdk, 'Buttons').mockImplementation(
                    (options: BigCommerceButtonsOptions) => {
                        eventEmitter.on('onApprove', () => {
                            if (options.onApprove) {
                                options.onApprove(
                                    { orderID: bigcommerceOrderId },
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
                    defaultMethodId,
                    bigcommerceOrderId,
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
                city: bigcommerceShippingAddressPayloadMock.city,
                countryCode: bigcommerceShippingAddressPayloadMock.countryCode,
                postalCode: bigcommerceShippingAddressPayloadMock.postalCode,
                stateOrProvince: '',
                stateOrProvinceCode: bigcommerceShippingAddressPayloadMock.state,
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
