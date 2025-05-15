import { EventEmitter } from 'events';

import {
    createBigCommercePaymentsSdk,
    PayPalMessagesSdk,
    PayPalSdkHelper,
} from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
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

import BigCommercePaymentsIntegrationService from '../bigcommerce-payments-integration-service';
import {
    BigCommercePaymentsButtonsOptions,
    BigCommercePaymentsHostWindow,
    PayPalSDK,
} from '../bigcommerce-payments-types';
import {
    getBigCommercePaymentsIntegrationServiceMock,
    getBigCommercePaymentsOrderDetails,
    getBigCommercePaymentsPaymentMethod,
    getBillingAddressFromOrderDetails,
    getPayPalSDKMock,
    getShippingAddressFromOrderDetails,
} from '../mocks';

import BigCommercePaymentsPayLaterButtonInitializeOptions from './bigcommerce-payments-paylater-button-initialize-options';
import BigCommercePaymentsPayLaterButtonStrategy from './bigcommerce-payments-paylater-button-strategy';

describe('BigCommercePaymentsPayLaterButtonStrategy', () => {
    let buyNowCart: Cart;
    let cart: Cart;
    let eventEmitter: EventEmitter;
    let strategy: BigCommercePaymentsPayLaterButtonStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalButtonElement: HTMLDivElement;
    let paypalMessageElement: HTMLDivElement;
    let bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService;
    let paypalSdk: PayPalSDK;
    let paypalSdkHelper: PayPalSdkHelper;
    let payPalMessagesSdk: PayPalMessagesSdk;

    const defaultMethodId = 'bigcommerce_payments_paylater';
    const defaultButtonContainerId = 'bigcommerce-payments-paylater-button-mock-id';
    const defaultMessageContainerId = 'bigcommerce-payments-paylater-message-mock-id';
    const paypalOrderId = 'ORDER_ID';

    const bigCommercePaymentsSdkRenderMock = jest.fn();

    const buyNowCartRequestBody = getBuyNowCartRequestBody();

    const buyNowBigCommercePaymentsPayLaterOptions: BigCommercePaymentsPayLaterButtonInitializeOptions =
        {
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
        bigcommerce_payments_paylater: buyNowBigCommercePaymentsPayLaterOptions,
    };

    const bigCommercePaymentsPayLaterOptions: BigCommercePaymentsPayLaterButtonInitializeOptions = {
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
        bigcommerce_payments_paylater: bigCommercePaymentsPayLaterOptions,
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

        bigCommercePaymentsIntegrationService = getBigCommercePaymentsIntegrationServiceMock();
        paymentMethod = getBigCommercePaymentsPaymentMethod();
        paypalSdk = getPayPalSDKMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paypalSdkHelper = createBigCommercePaymentsSdk();

        strategy = new BigCommercePaymentsPayLaterButtonStrategy(
            paymentIntegrationService,
            bigCommercePaymentsIntegrationService,
            paypalSdkHelper,
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

        jest.spyOn(bigCommercePaymentsIntegrationService, 'loadPayPalSdk').mockReturnValue(
            Promise.resolve(paypalSdk),
        );
        jest.spyOn(bigCommercePaymentsIntegrationService, 'getPayPalSdkOrThrow').mockReturnValue(
            paypalSdk,
        );
        jest.spyOn(
            bigCommercePaymentsIntegrationService,
            'createBuyNowCartOrThrow',
        ).mockReturnValue(Promise.resolve(buyNowCart));
        jest.spyOn(bigCommercePaymentsIntegrationService, 'createOrder').mockImplementation(
            jest.fn(),
        );
        jest.spyOn(bigCommercePaymentsIntegrationService, 'updateOrder').mockImplementation(
            jest.fn(),
        );
        jest.spyOn(bigCommercePaymentsIntegrationService, 'tokenizePayment').mockImplementation(
            jest.fn(),
        );
        jest.spyOn(bigCommercePaymentsIntegrationService, 'submitPayment').mockImplementation(
            jest.fn(),
        );
        jest.spyOn(bigCommercePaymentsIntegrationService, 'removeElement').mockImplementation(
            jest.fn(),
        );
        jest.spyOn(
            bigCommercePaymentsIntegrationService,
            'getBillingAddressFromOrderDetails',
        ).mockReturnValue(getBillingAddressFromOrderDetails());
        jest.spyOn(
            bigCommercePaymentsIntegrationService,
            'getShippingAddressFromOrderDetails',
        ).mockReturnValue(getShippingAddressFromOrderDetails());
        jest.spyOn(
            bigCommercePaymentsIntegrationService,
            'getShippingOptionOrThrow',
        ).mockReturnValue(getShippingOption());
        jest.spyOn(paypalSdkHelper, 'getPayPalMessages').mockImplementation(() =>
            Promise.resolve(payPalMessagesSdk),
        );
        jest.spyOn(payPalMessagesSdk, 'Messages').mockImplementation(() => ({
            render: bigCommercePaymentsSdkRenderMock,
        }));

        jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
            (options: BigCommercePaymentsButtonsOptions) => {
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

        delete (window as BigCommercePaymentsHostWindow).paypal;

        if (document.getElementById(defaultButtonContainerId)) {
            document.body.removeChild(paypalButtonElement);
        }
    });

    it('creates an instance of the BigCommercePayments PayLater checkout button strategy', () => {
        expect(strategy).toBeInstanceOf(BigCommercePaymentsPayLaterButtonStrategy);
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

        it('throws an error if bigcommerce_payments_paylater is not provided', async () => {
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

        it('throws an error if bigcommerce_payments_paylater.currencyCode is not provided (for buyNowFlow only)', async () => {
            const { currencyCode, ...rest } = buyNowBigCommercePaymentsPayLaterOptions;

            const newInitializationOptions = {
                ...buyNowInitializationOptions,
                bigcommerce_payments_paylater: rest,
            };

            try {
                await strategy.initialize(newInitializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if provided buyNow callback is not a function is not provided (for buyNowFlow only)', async () => {
            const { buyNowInitializeOptions, ...rest } = buyNowBigCommercePaymentsPayLaterOptions;

            const newInitializationOptions = {
                ...buyNowInitializationOptions,
                bigcommerce_payments_paylater: {
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

            expect(bigCommercePaymentsIntegrationService.loadPayPalSdk).toHaveBeenCalledWith(
                defaultMethodId,
                cart.currency.code,
                false,
            );
        });

        it('loads paypal sdk script with provided currency code (Buy Now flow)', async () => {
            await strategy.initialize(buyNowInitializationOptions);

            expect(bigCommercePaymentsIntegrationService.loadPayPalSdk).toHaveBeenCalledWith(
                defaultMethodId,
                buyNowBigCommercePaymentsPayLaterOptions.currencyCode,
                false,
            );
        });
    });

    describe('#renderButton', () => {
        it('initializes PayPal button to render (default flow)', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdk.FUNDING.PAYLATER,
                style: bigCommercePaymentsPayLaterOptions.style,
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
            });
        });

        it('initializes PayPal Credit button to render if PayPal PayLater is not eligible', async () => {
            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
                (options: BigCommercePaymentsButtonsOptions) => {
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
                style: bigCommercePaymentsPayLaterOptions.style,
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
            });
        });

        it('initializes PayPal button to render (buy now flow)', async () => {
            await strategy.initialize(buyNowInitializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdk.FUNDING.PAYLATER,
                style: bigCommercePaymentsPayLaterOptions.style,
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
                style: bigCommercePaymentsPayLaterOptions.style,
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

            expect(bigCommercePaymentsPayLaterOptions.onEligibilityFailure).toHaveBeenCalled();
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

            expect(bigCommercePaymentsIntegrationService.removeElement).toHaveBeenCalledWith(
                defaultButtonContainerId,
            );
        });
    });

    describe('#createOrder', () => {
        it('creates paypal order', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommercePaymentsIntegrationService.createOrder).toHaveBeenCalledWith(
                'bigcommerce_payments_paylater',
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

            expect(
                bigCommercePaymentsIntegrationService.createBuyNowCartOrThrow,
            ).toHaveBeenCalled();
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

                expect(bigCommercePaymentsIntegrationService.tokenizePayment).toHaveBeenCalledWith(
                    defaultMethodId,
                    paypalOrderId,
                );
            });
        });

        describe('shipping options feature flow', () => {
            const paypalOrderDetails = getBigCommercePaymentsOrderDetails();

            beforeEach(() => {
                jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
                    (options: BigCommercePaymentsButtonsOptions) => {
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
                    (options: BigCommercePaymentsButtonsOptions) => {
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
                    bigCommercePaymentsIntegrationService.getBillingAddressFromOrderDetails,
                ).toHaveBeenCalledWith(getBigCommercePaymentsOrderDetails());
                expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith(
                    getBillingAddressFromOrderDetails(),
                );
            });

            it('updates shipping address with valid customers data if physical items are available in the cart', async () => {
                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(
                    bigCommercePaymentsIntegrationService.getShippingAddressFromOrderDetails,
                ).toHaveBeenCalledWith(getBigCommercePaymentsOrderDetails());
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

                expect(bigCommercePaymentsIntegrationService.submitPayment).toHaveBeenCalledWith(
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

            jest.spyOn(bigCommercePaymentsIntegrationService, 'getAddress').mockReturnValue(
                address,
            );

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

            expect(
                bigCommercePaymentsIntegrationService.getShippingOptionOrThrow,
            ).toHaveBeenCalled();
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

            expect(bigCommercePaymentsIntegrationService.updateOrder).toHaveBeenCalled();
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

            expect(
                bigCommercePaymentsIntegrationService.getShippingOptionOrThrow,
            ).toHaveBeenCalled();
            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalledWith(
                getShippingOption().id,
            );
        });

        it('updates PayPal order', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingOptionsChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommercePaymentsIntegrationService.updateOrder).toHaveBeenCalled();
        });
    });

    describe('BigCommercePayments PayLater messages logic', () => {
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

            expect(bigCommercePaymentsSdkRenderMock).not.toHaveBeenCalled();
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

            expect(bigCommercePaymentsSdkRenderMock).toHaveBeenCalledWith(
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
