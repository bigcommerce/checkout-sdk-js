import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';

import {
    BuyNowCartCreationError,
    Cart,
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
    MissingDataError,
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

import { getPayPalCommercePaymentMethod } from '../mocks/paypal-commerce-payment-method.mock';
import { getPayPalSDKMock } from '../mocks/paypal-sdk.mock';
import PayPalCommerceRequestSender from '../paypal-commerce-request-sender';
import PayPalCommerceScriptLoader from '../paypal-commerce-script-loader';
import {
    PayPalCommerceButtonsOptions,
    PayPalCommerceHostWindow,
    PayPalOrderDetails,
    PayPalSDK,
} from '../paypal-commerce-types';

import PayPalCommerceCreditButtonInitializeOptions from './paypal-commerce-credit-button-initialize-options';
import PayPalCommerceCreditButtonStrategy from './paypal-commerce-credit-button-strategy';

describe('PayPalCommerceButtonStrategy', () => {
    let buyNowCart: Cart;
    let cart: Cart;
    let eventEmitter: EventEmitter;
    let formPoster: FormPoster;
    let requestSender: RequestSender;
    let strategy: PayPalCommerceCreditButtonStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalButtonElement: HTMLDivElement;
    let paypalMessageElement: HTMLDivElement;
    let paypalCommerceRequestSender: PayPalCommerceRequestSender;
    let paypalCommerceScriptLoader: PayPalCommerceScriptLoader;
    let paypalSdk: PayPalSDK;

    const defaultMethodId = 'paypalcommercecredit';
    const defaultButtonContainerId = 'paypal-commerce-credit-button-mock-id';
    const defaultMessageContainerId = 'paypal-commerce-credit-message-mock-id';
    const paypalOrderId = 'ORDER_ID';

    const buyNowCartRequestBody = getBuyNowCartRequestBody();

    const buyNowPayPalCommerceCreditOptions: PayPalCommerceCreditButtonInitializeOptions = {
        buyNowInitializeOptions: {
            getBuyNowCartRequestBody: jest.fn().mockReturnValue(buyNowCartRequestBody),
        },
        currencyCode: 'USD',
        initializesOnCheckoutPage: false,
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
        initializesOnCheckoutPage: false,
        messagingContainerId: defaultMessageContainerId,
        style: {
            height: 45,
        },
        onComplete: jest.fn(),
    };

    const initializationOptions: CheckoutButtonInitializeOptions = {
        methodId: defaultMethodId,
        containerId: defaultButtonContainerId,
        paypalcommercecredit: paypalCommerceCreditOptions,
    };

    const paypalShippingAddressPayloadMock = {
        city: 'New York',
        country_code: 'US',
        postal_code: '07564',
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

        paymentMethod = { ...getPayPalCommercePaymentMethod(), id: defaultMethodId };
        paypalSdk = getPayPalSDKMock();

        formPoster = createFormPoster();
        requestSender = createRequestSender();
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
        paypalCommerceRequestSender = new PayPalCommerceRequestSender(requestSender);
        paypalCommerceScriptLoader = new PayPalCommerceScriptLoader(getScriptLoader());

        strategy = new PayPalCommerceCreditButtonStrategy(
            formPoster,
            paymentIntegrationService,
            paypalCommerceRequestSender,
            paypalCommerceScriptLoader,
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
        jest.spyOn(paymentIntegrationService, 'selectShippingOption').mockImplementation(jest.fn());
        jest.spyOn(paymentIntegrationService, 'submitOrder').mockImplementation(jest.fn());
        jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(jest.fn());
        jest.spyOn(paymentIntegrationService, 'updateBillingAddress').mockImplementation(jest.fn());
        jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockImplementation(
            jest.fn(),
        );

        jest.spyOn(formPoster, 'postForm').mockImplementation(jest.fn());
        jest.spyOn(paypalCommerceScriptLoader, 'getPayPalSDK').mockReturnValue(paypalSdk);
        jest.spyOn(paypalCommerceRequestSender, 'updateOrder').mockReturnValue(true);

        jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
            (options: PayPalCommerceButtonsOptions) => {
                eventEmitter.on('createOrder', () => {
                    if (options.createOrder) {
                        options.createOrder().catch(jest.fn());
                    }
                });

                eventEmitter.on(
                    'onClick',
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    async (jestSuccessExpectationsCallback, jestFailureExpectationsCallback) => {
                        try {
                            if (options.onClick) {
                                await options.onClick(
                                    { fundingSource: 'paylater' },
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
                };
            },
        );

        jest.spyOn(paypalSdk, 'Messages').mockImplementation(() => ({
            render: jest.fn(),
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as PayPalCommerceHostWindow).paypal;

        if (document.getElementById(defaultButtonContainerId)) {
            document.body.removeChild(paypalButtonElement);
        }

        if (document.getElementById(defaultMessageContainerId)) {
            document.body.removeChild(paypalMessageElement);
        }
    });

    it('creates an instance of the PayPal Commerce Credit (PayLater) checkout button strategy', () => {
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

        it('loads default checkout', async () => {
            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadDefaultCheckout).toHaveBeenCalled();
        });

        it('does not load default checkout for Buy Now flow', async () => {
            await strategy.initialize(buyNowInitializationOptions);

            expect(paymentIntegrationService.loadDefaultCheckout).not.toHaveBeenCalled();
        });

        it('loads paypal commerce sdk script', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalCommerceScriptLoader.getPayPalSDK).toHaveBeenCalledWith(
                paymentMethod,
                cart.currency.code,
                paypalCommerceCreditOptions.initializesOnCheckoutPage,
            );
        });

        it('loads paypal commerce sdk script with provided currency code (Buy Now flow)', async () => {
            await strategy.initialize(buyNowInitializationOptions);

            expect(paypalCommerceScriptLoader.getPayPalSDK).toHaveBeenCalledWith(
                paymentMethod,
                buyNowPayPalCommerceCreditOptions.currencyCode,
                buyNowPayPalCommerceCreditOptions.initializesOnCheckoutPage,
            );
        });

        describe('PayPal Commerce Credit buttons logic', () => {
            it('initializes PayPal Paylater button to render', async () => {
                await strategy.initialize(initializationOptions);

                expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                    fundingSource: paypalSdk.FUNDING.PAYLATER,
                    style: paypalCommerceCreditOptions.style,
                    createOrder: expect.any(Function),
                    onApprove: expect.any(Function),
                    onClick: expect.any(Function),
                });
            });

            it('does not throw an error if onComplete method is not provided for default flow', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({
                    ...paymentMethod,
                    initializationData: {
                        ...paymentMethod.initializationData,
                        isHostedCheckoutEnabled: false,
                    },
                });

                const { onComplete, ...rest } = paypalCommerceCreditOptions;

                const options = {
                    ...initializationOptions,
                    paypalcommercecredit: rest,
                };

                await strategy.initialize(options);

                expect(paypalSdk.Buttons).toHaveBeenCalled();
            });

            it('throws an error if onComplete method is not provided for shippingOptions flow', async () => {
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

                const { onComplete, ...rest } = paypalCommerceCreditOptions;

                const options = {
                    ...initializationOptions,
                    paypalcommercecredit: rest,
                };

                try {
                    await strategy.initialize(options);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidArgumentError);
                }
            });

            it('initializes PayPal Credit button to render if PayPal PayLater is not eligible', async () => {
                jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
                    (options: PayPalCommerceButtonsOptions) => {
                        return {
                            render: jest.fn(),
                            isEligible: jest.fn(() => {
                                return options.fundingSource === paypalSdk.FUNDING.CREDIT;
                            }),
                        };
                    },
                );

                await strategy.initialize(initializationOptions);

                expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                    fundingSource: paypalSdk.FUNDING.CREDIT,
                    style: paypalCommerceCreditOptions.style,
                    createOrder: expect.any(Function),
                    onApprove: expect.any(Function),
                    onClick: expect.any(Function),
                });
            });

            it('renders PayPal button', async () => {
                const paypalCommerceSdkRenderMock = jest.fn();

                jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                    isEligible: jest.fn(() => true),
                    render: paypalCommerceSdkRenderMock,
                }));

                await strategy.initialize(initializationOptions);

                expect(paypalCommerceSdkRenderMock).toHaveBeenCalled();
            });

            it('does not render PayPal button if it is not eligible', async () => {
                const paypalCommerceSdkRenderMock = jest.fn();

                jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                    isEligible: jest.fn(() => false),
                    render: paypalCommerceSdkRenderMock,
                }));

                await strategy.initialize(initializationOptions);

                expect(paypalCommerceSdkRenderMock).not.toHaveBeenCalled();
            });

            it('removes PayPal button container if the button has not rendered', async () => {
                const paypalCommerceSdkRenderMock = jest.fn();

                jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                    isEligible: jest.fn(() => false),
                    render: paypalCommerceSdkRenderMock,
                }));

                await strategy.initialize(initializationOptions);

                expect(document.getElementById(defaultButtonContainerId)).toBeNull();
            });

            it('throws an error if buy now cart request body data is not provided on button click (Buy Now flow)', async () => {
                const buyNowInitializationOptionsMock = {
                    ...buyNowInitializationOptions,
                    paypalcommercecredit: {
                        ...buyNowPayPalCommerceCreditOptions,
                        buyNowInitializeOptions: {
                            getBuyNowCartRequestBody: jest.fn().mockReturnValue(undefined),
                        },
                    },
                };

                await strategy.initialize(buyNowInitializationOptionsMock);
                eventEmitter.emit('onClick', undefined, (error: Error) => {
                    expect(error).toBeInstanceOf(MissingDataError);
                });
            });

            it('creates buy now cart (Buy Now Flow)', async () => {
                jest.spyOn(paymentIntegrationService, 'createBuyNowCart').mockReturnValue(
                    buyNowCart,
                );

                await strategy.initialize(buyNowInitializationOptions);

                eventEmitter.emit('onClick', () => {
                    expect(paymentIntegrationService.createBuyNowCart).toHaveBeenCalledWith(
                        buyNowCartRequestBody,
                    );
                });
            });

            it('throws an error if failed to create buy now cart (Buy Now Flow)', async () => {
                jest.spyOn(paymentIntegrationService, 'createBuyNowCart').mockImplementation(() =>
                    Promise.reject(),
                );

                await strategy.initialize(buyNowInitializationOptions);
                eventEmitter.emit('onClick', undefined, (error: Error) => {
                    expect(error).toBeInstanceOf(BuyNowCartCreationError);
                });
            });

            it('creates an order with paypalcommercecredit as provider id if its initializes outside checkout page', async () => {
                jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('');

                await strategy.initialize(initializationOptions);

                eventEmitter.emit('createOrder');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(
                    'paypalcommercecredit',
                    {
                        cartId: cart.id,
                    },
                );
            });

            it('creates an order with paypalcommercecreditcheckout as provider id if its initializes on checkout page', async () => {
                jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('');

                const updatedIntializationOptions = {
                    ...initializationOptions,
                    paypalcommercecredit: {
                        ...paypalCommerceCreditOptions,
                        initializesOnCheckoutPage: true,
                    },
                };

                await strategy.initialize(updatedIntializationOptions);

                eventEmitter.emit('createOrder');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(
                    'paypalcommercecreditcheckout',
                    {
                        cartId: cart.id,
                    },
                );
            });

            it('creates order with Buy Now cart id (Buy Now flow)', async () => {
                jest.spyOn(paymentIntegrationService, 'createBuyNowCart').mockReturnValue(
                    buyNowCart,
                );
                jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('');

                await strategy.initialize(buyNowInitializationOptions);

                eventEmitter.emit('onClick');

                await new Promise((resolve) => process.nextTick(resolve));

                eventEmitter.emit('createOrder');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(
                    'paypalcommercecredit',
                    {
                        cartId: buyNowCart.id,
                    },
                );
            });

            it('throws an error if orderId is not provided by PayPal on approve', async () => {
                jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
                    (options: PayPalCommerceButtonsOptions) => {
                        eventEmitter.on('createOrder', () => {
                            if (options.createOrder) {
                                options.createOrder().catch(jest.fn());
                            }
                        });

                        eventEmitter.on('onApprove', () => {
                            if (options.onApprove) {
                                options.onApprove(
                                    { orderID: undefined },
                                    {
                                        order: {
                                            get: jest.fn(),
                                        },
                                    },
                                );
                            }
                        });

                        return {
                            isEligible: jest.fn(() => true),
                            render: jest.fn(),
                        };
                    },
                );

                try {
                    await strategy.initialize(initializationOptions);
                    eventEmitter.emit('onApprove');
                } catch (error) {
                    expect(error).toBeInstanceOf(MissingDataError);
                }
            });

            it('tokenizes payment on paypal approve', async () => {
                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(formPoster.postForm).toHaveBeenCalledWith(
                    '/checkout.php',
                    expect.objectContaining({
                        action: 'set_external_checkout',
                        order_id: paypalOrderId,
                        payment_type: 'paypal',
                        provider: paymentMethod.id,
                    }),
                );
            });

            it('provides buy now cart_id on payment tokenization on paypal approve', async () => {
                jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(
                    buyNowCart,
                );
                jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('111');

                await strategy.initialize(buyNowInitializationOptions);

                eventEmitter.emit('onClick');

                await new Promise((resolve) => process.nextTick(resolve));

                eventEmitter.emit('createOrder');

                await new Promise((resolve) => process.nextTick(resolve));

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(formPoster.postForm).toHaveBeenCalledWith('/checkout.php', {
                    action: 'set_external_checkout',
                    cart_id: buyNowCart.id,
                    order_id: paypalOrderId,
                    payment_type: 'paypal',
                    provider: defaultMethodId,
                });
            });
        });

        describe('PayPal Commerce Credit messages logic', () => {
            it('initializes PayPal Messages component', async () => {
                await strategy.initialize(initializationOptions);

                expect(paypalSdk.Messages).toHaveBeenCalledWith({
                    amount: cart.cartAmount,
                    placement: 'cart',
                    style: {
                        layout: 'text',
                    },
                });
            });

            it('renders PayPal message', async () => {
                const paypalCommerceSdkRenderMock = jest.fn();

                jest.spyOn(paypalSdk, 'Messages').mockImplementation(() => ({
                    render: paypalCommerceSdkRenderMock,
                }));

                await strategy.initialize(initializationOptions);

                expect(paypalCommerceSdkRenderMock).toHaveBeenCalledWith(
                    `#${defaultMessageContainerId}`,
                );
            });
        });
    });

    describe('#onApprove button callback', () => {
        const paypalOrderDetails: PayPalOrderDetails = {
            purchase_units: [
                {
                    shipping: {
                        address: {
                            address_line_1: '2 E 61st St',
                            admin_area_2: 'New York',
                            admin_area_1: 'NY',
                            postal_code: '10065',
                            country_code: 'US',
                        },
                    },
                },
            ],
            payer: {
                name: {
                    given_name: 'John',
                    surname: 'Doe',
                },
                email_address: 'john@doe.com',
                address: {
                    address_line_1: '1 Main St',
                    admin_area_2: 'San Jose',
                    admin_area_1: 'CA',
                    postal_code: '95131',
                    country_code: 'US',
                },
            },
        };

        beforeEach(() => {
            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
                (options: PayPalCommerceButtonsOptions) => {
                    eventEmitter.on('onApprove', () => {
                        if (options.onApprove) {
                            options.onApprove(
                                { orderID: paypalOrderId },
                                {
                                    order: {
                                        get: jest.fn(() => paypalOrderDetails),
                                    },
                                },
                            );
                        }
                    });

                    return {
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

        it('takes order details data from paypal', async () => {
            const getOrderActionMock = jest.fn(() => paypalOrderDetails);

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
                    };
                },
            );

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(getOrderActionMock).toHaveBeenCalled();
            expect(getOrderActionMock).toHaveReturnedWith(paypalOrderDetails);
        });

        it('updates only billing address with valid customers data from order details if there is no shipping needed', async () => {
            const defaultCart = getCart();
            const cartWithoutShipping = {
                ...defaultCart,
                lineItems: {
                    ...defaultCart.lineItems,
                    physicalItems: [],
                },
            };

            jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(
                cartWithoutShipping,
            );

            const address = {
                firstName: paypalOrderDetails.payer.name.given_name,
                lastName: paypalOrderDetails.payer.name.surname,
                email: paypalOrderDetails.payer.email_address,
                phone: '',
                company: '',
                address1: paypalOrderDetails.payer.address.address_line_1,
                address2: '',
                city: paypalOrderDetails.payer.address.admin_area_2,
                countryCode: paypalOrderDetails.payer.address.country_code,
                postalCode: paypalOrderDetails.payer.address.postal_code,
                stateOrProvince: '',
                stateOrProvinceCode: paypalOrderDetails.payer.address.admin_area_1,
                customFields: [],
            };

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith(address);
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
            const methodId = initializationOptions.methodId;
            const paymentData = {
                formattedPayload: {
                    vault_payment_instrument: null,
                    set_as_default_stored_instrument: null,
                    device_info: null,
                    method_id: methodId,
                    paypal_account: {
                        order_id: paypalOrderId,
                    },
                },
            };

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData,
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
            const providedAddress = {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                company: '',
                address1: '',
                address2: '',
                city: paypalShippingAddressPayloadMock.city,
                countryCode: paypalShippingAddressPayloadMock.country_code,
                postalCode: paypalShippingAddressPayloadMock.postal_code,
                stateOrProvince: '',
                stateOrProvinceCode: paypalShippingAddressPayloadMock.state,
                customFields: [],
            };

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingAddressChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith(
                providedAddress,
            );
            expect(paymentIntegrationService.updateShippingAddress).toHaveBeenCalledWith(
                providedAddress,
            );
        });

        it('selects recommended shipping option if it was not selected earlier', async () => {
            const recommendedShippingOption = {
                ...getShippingOption(),
                isRecommended: true,
            };

            const consignment = {
                ...getConsignment(),
                availableShippingOptions: [recommendedShippingOption],
                selectedShippingOption: null,
            };

            const updatedConsignment = {
                ...consignment,
                selectedShippingOption: recommendedShippingOption,
            };

            jest.spyOn(paymentIntegrationService.getState(), 'getConsignmentsOrThrow')
                .mockReturnValueOnce([consignment])
                .mockReturnValue([updatedConsignment]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingAddressChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalledWith(
                recommendedShippingOption.id,
            );
        });

        it('selects first available shipping option if there is no recommended option', async () => {
            const firstShippingOption = {
                ...getShippingOption(),
                id: 1,
            };

            const secondShippingOption = {
                ...getShippingOption(),
                id: 2,
            };

            const consignment = {
                ...getConsignment(),
                availableShippingOptions: [firstShippingOption, secondShippingOption],
                selectedShippingOption: null,
            };

            const updatedConsignment = {
                ...consignment,
                selectedShippingOption: firstShippingOption,
            };

            jest.spyOn(paymentIntegrationService.getState(), 'getConsignmentsOrThrow')
                .mockReturnValueOnce([consignment])
                .mockReturnValue([updatedConsignment]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingAddressChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalledWith(
                firstShippingOption.id,
            );
        });

        it('updates PayPal order', async () => {
            const consignment = getConsignment();

            // INFO: lets imagine that it is a state that we get after consignmentActionCreator.selectShippingOption call
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getConsignmentsOrThrow',
            ).mockReturnValue([consignment]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingAddressChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.updateOrder).toHaveBeenCalledWith({
                availableShippingOptions: consignment.availableShippingOptions,
                cartId: cart.id,
                selectedShippingOption: consignment.selectedShippingOption,
            });
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
            const recommendedShippingOption = getShippingOption();
            const shippingOptionThatShouldBeSelected = {
                ...getShippingOption(),
                id: paypalSelectedShippingOptionPayloadMock.id,
                isRecommended: false,
            };

            const consignment = {
                ...getConsignment(),
                availableShippingOptions: [
                    recommendedShippingOption,
                    shippingOptionThatShouldBeSelected,
                ],
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getConsignmentsOrThrow',
            ).mockReturnValue([consignment]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingOptionsChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalledWith(
                shippingOptionThatShouldBeSelected.id,
            );
        });

        it('selects recommended shipping option if there is no match with payload from paypal', async () => {
            const recommendedShippingOption = getShippingOption();
            const anotherShippingOption = {
                ...getShippingOption(),
                id: 'asdag123',
                isRecommended: false,
            };

            const consignment = {
                ...getConsignment(),
                availableShippingOptions: [recommendedShippingOption, anotherShippingOption],
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getConsignmentsOrThrow',
            ).mockReturnValue([consignment]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingOptionsChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.selectShippingOption).not.toHaveBeenCalledWith(
                paypalSelectedShippingOptionPayloadMock.id,
            );
            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalledWith(
                recommendedShippingOption.id,
            );
        });

        it('updates PayPal order', async () => {
            const consignment = getConsignment();

            // INFO: lets imagine that it is a state that we get after consignmentActionCreator.selectShippingOption call
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getConsignmentsOrThrow',
            ).mockReturnValue([consignment]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingOptionsChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.updateOrder).toHaveBeenCalledWith({
                availableShippingOptions: consignment.availableShippingOptions,
                cartId: cart.id,
                selectedShippingOption: consignment.selectedShippingOption,
            });
        });
    });

    describe('#handleClick', () => {
        beforeEach(() => {
            jest.spyOn(paymentIntegrationService, 'createBuyNowCart').mockReturnValue(buyNowCart);
            jest.spyOn(paymentIntegrationService, 'loadCheckout').mockReturnValue(true);
        });

        it('creates buy now cart on button click', async () => {
            await strategy.initialize(buyNowInitializationOptions);
            eventEmitter.emit('onClick');
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.createBuyNowCart).toHaveBeenCalled();
        });

        it('loads checkout related to buy now cart on button click', async () => {
            await strategy.initialize(buyNowInitializationOptions);
            eventEmitter.emit('onClick');
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.loadCheckout).toHaveBeenCalledWith(buyNowCart.id);
        });
    });
});
