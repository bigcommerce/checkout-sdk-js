import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';

import { CartSource } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../../../billing';
import { Cart, CartRequestSender } from '../../../cart';
import BuyNowCartRequestBody from '../../../cart/buy-now-cart-request-body';
import { getCart } from '../../../cart/carts.mock';
import { BuyNowCartCreationError } from '../../../cart/errors';
import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { OrderActionCreator, OrderRequestSender } from '../../../order';
import {
    PaymentActionCreator,
    PaymentMethod,
    PaymentRequestSender,
    PaymentRequestTransformer,
} from '../../../payment';
import { getPaypalCommerce } from '../../../payment/payment-methods.mock';
import { PaypalHostWindow } from '../../../payment/strategies/paypal';
import {
    ButtonsOptions,
    PaypalCheckoutButtonOptions,
    PaypalCommerceRequestSender,
    PaypalCommerceScriptLoader,
    PaypalCommerceSDK,
    PayPalOrderDetails,
} from '../../../payment/strategies/paypal-commerce';
import { getPaypalCommerceMock } from '../../../payment/strategies/paypal-commerce/paypal-commerce.mock';
import { ConsignmentActionCreator, ConsignmentRequestSender } from '../../../shipping';
import { getConsignment } from '../../../shipping/consignments.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../../../subscription';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonMethodType from '../checkout-button-method-type';

import { PaypalCommerceCreditButtonInitializeOptions } from './paypal-commerce-credit-button-options';
import PaypalCommerceCreditButtonStrategy from './paypal-commerce-credit-button-strategy';

describe('PaypalCommerceCreditButtonStrategy', () => {
    let billingAddressActionCreator: BillingAddressActionCreator;
    let cartMock: Cart;
    let cartRequestSender: CartRequestSender;
    let consignmentActionCreator: ConsignmentActionCreator;
    let checkoutActionCreator: CheckoutActionCreator;
    let checkoutRequestSender: CheckoutRequestSender;
    let checkoutValidator: CheckoutValidator;
    let eventEmitter: EventEmitter;
    let formPoster: FormPoster;
    let orderActionCreator: OrderActionCreator;
    let requestSender: RequestSender;
    let paymentActionCreator: PaymentActionCreator;
    let paymentHumanVerificationHandler: PaymentHumanVerificationHandler;
    let paymentRequestSender: PaymentRequestSender;
    let paymentMethodMock: PaymentMethod;
    let paypalCommerceRequestSender: PaypalCommerceRequestSender;
    let paypalScriptLoader: PaypalCommerceScriptLoader;
    let store: CheckoutStore;
    let strategy: PaypalCommerceCreditButtonStrategy;
    let paypalSdkMock: PaypalCommerceSDK;
    let paypalCommerceCreditButtonElement: HTMLDivElement;
    let paypalCommerceCreditMessageElement: HTMLDivElement;
    let subscriptionsActionCreator: SubscriptionsActionCreator;

    const defaultButtonContainerId = 'paypal-commerce-credit-button-mock-id';
    const defaultMessageContainerId = 'paypal-commerce-credit-message-mock-id';
    const approveDataOrderId = 'ORDER_ID';

    const paypalCommerceCreditOptions: PaypalCommerceCreditButtonInitializeOptions = {
        initializesOnCheckoutPage: false,
        messagingContainerId: defaultMessageContainerId,
        style: {
            height: 45,
        },
        onComplete: () => {},
    };

    const initializationOptions: CheckoutButtonInitializeOptions = {
        methodId: CheckoutButtonMethodType.PAYPALCOMMERCE_CREDIT,
        containerId: defaultButtonContainerId,
        paypalcommercecredit: paypalCommerceCreditOptions,
    };

    const buyNowCartMock = {
        ...getCart(),
        id: 999,
        source: CartSource.BuyNow,
    };

    const buyNowCartRequestBody: BuyNowCartRequestBody = {
        source: CartSource.BuyNow,
        lineItems: [
            {
                productId: 1,
                quantity: 2,
                optionSelections: {
                    optionId: 11,
                    optionValue: 11,
                },
            },
        ],
    };

    const buyNowInitializationOptions: CheckoutButtonInitializeOptions = {
        methodId: CheckoutButtonMethodType.PAYPALCOMMERCE_CREDIT,
        containerId: defaultButtonContainerId,
        paypalcommercecredit: {
            ...paypalCommerceCreditOptions,
            currencyCode: 'USD',
            buyNowInitializeOptions: {
                getBuyNowCartRequestBody: jest.fn().mockReturnValue(buyNowCartRequestBody),
            },
        },
    };

    beforeEach(() => {
        cartMock = getCart();
        eventEmitter = new EventEmitter();
        paymentMethodMock = { ...getPaypalCommerce(), id: 'paypalcommercecredit' };
        paypalSdkMock = getPaypalCommerceMock();

        store = createCheckoutStore(getCheckoutStoreState());
        requestSender = createRequestSender();
        formPoster = createFormPoster();
        cartRequestSender = new CartRequestSender(requestSender);
        paypalCommerceRequestSender = new PaypalCommerceRequestSender(requestSender);
        paypalScriptLoader = new PaypalCommerceScriptLoader(getScriptLoader());
        checkoutRequestSender = new CheckoutRequestSender(requestSender);
        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
        );
        checkoutValidator = new CheckoutValidator(checkoutRequestSender);
        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(requestSender),
            checkoutValidator,
        );
        consignmentActionCreator = new ConsignmentActionCreator(
            new ConsignmentRequestSender(requestSender),
            checkoutRequestSender,
        );
        subscriptionsActionCreator = new SubscriptionsActionCreator(
            new SubscriptionsRequestSender(requestSender),
        );
        billingAddressActionCreator = new BillingAddressActionCreator(
            new BillingAddressRequestSender(requestSender),
            subscriptionsActionCreator,
        );
        paymentRequestSender = new PaymentRequestSender(requestSender);
        paymentHumanVerificationHandler = new PaymentHumanVerificationHandler(
            createSpamProtection(createScriptLoader()),
        );
        paymentActionCreator = new PaymentActionCreator(
            paymentRequestSender,
            orderActionCreator,
            new PaymentRequestTransformer(),
            paymentHumanVerificationHandler,
        );

        strategy = new PaypalCommerceCreditButtonStrategy(
            store,
            checkoutActionCreator,
            cartRequestSender,
            formPoster,
            paypalScriptLoader,
            paypalCommerceRequestSender,
            orderActionCreator,
            consignmentActionCreator,
            billingAddressActionCreator,
            paymentActionCreator,
        );

        paypalCommerceCreditButtonElement = document.createElement('div');
        paypalCommerceCreditButtonElement.id = defaultButtonContainerId;
        document.body.appendChild(paypalCommerceCreditButtonElement);

        paypalCommerceCreditMessageElement = document.createElement('div');
        paypalCommerceCreditMessageElement.id = defaultMessageContainerId;
        document.body.appendChild(paypalCommerceCreditMessageElement);

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout').mockImplementation(() => {});
        jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(cartMock);
        jest.spyOn(store.getState().consignments, 'getConsignmentsOrThrow').mockReturnValue([
            getConsignment(),
        ]);
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );

        jest.spyOn(billingAddressActionCreator, 'updateAddress').mockReturnValue(true);
        jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout').mockReturnValue(true);
        jest.spyOn(consignmentActionCreator, 'loadShippingOptions').mockReturnValue(true);
        jest.spyOn(consignmentActionCreator, 'selectShippingOption').mockReturnValue(true);
        jest.spyOn(consignmentActionCreator, 'updateAddress').mockReturnValue(true);
        jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(true);
        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(true);
        jest.spyOn(paypalCommerceRequestSender, 'updateOrder').mockReturnValue(true);

        jest.spyOn(paypalScriptLoader, 'getPayPalSDK').mockReturnValue(paypalSdkMock);
        jest.spyOn(formPoster, 'postForm').mockImplementation(() => {});
        jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation((options: ButtonsOptions) => {
            eventEmitter.on('createOrder', () => {
                if (options.createOrder) {
                    options.createOrder().catch(() => {});
                }
            });

            eventEmitter.on(
                'onClick',
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
                    options.onApprove({ orderID: approveDataOrderId });
                }
            });

            eventEmitter.on('onShippingAddressChange', () => {
                if (options.onShippingAddressChange) {
                    options.onShippingAddressChange({
                        orderId: approveDataOrderId,
                        shippingAddress: {
                            city: 'New York',
                            country_code: 'US',
                            postal_code: '07564',
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
                render: jest.fn(),
                isEligible: jest.fn(() => true),
            };
        });

        jest.spyOn(paypalSdkMock, 'Messages').mockImplementation(() => ({
            render: jest.fn(),
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as PaypalHostWindow).paypal;

        if (document.getElementById(defaultButtonContainerId)) {
            document.body.removeChild(paypalCommerceCreditButtonElement);
        }

        if (document.getElementById(defaultMessageContainerId)) {
            document.body.removeChild(paypalCommerceCreditMessageElement);
        }
    });

    it('creates an instance of the PayPal Commerce Credit checkout button strategy', () => {
        expect(strategy).toBeInstanceOf(PaypalCommerceCreditButtonStrategy);
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
                methodId: CheckoutButtonMethodType.PAYPALCOMMERCE_CREDIT,
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
                methodId: CheckoutButtonMethodType.PAYPALCOMMERCE_CREDIT,
            } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('loads default checkout', async () => {
            await strategy.initialize(initializationOptions);

            expect(checkoutActionCreator.loadDefaultCheckout).toHaveBeenCalled();
        });

        it('does not load default checkout for Buy Now flow', async () => {
            await strategy.initialize(buyNowInitializationOptions);

            expect(checkoutActionCreator.loadDefaultCheckout).not.toHaveBeenCalled();
        });

        it('loads paypal commerce sdk script', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalScriptLoader.getPayPalSDK).toHaveBeenCalledWith(
                paymentMethodMock,
                cartMock.currency.code,
                initializationOptions.paypalcommercecredit?.initializesOnCheckoutPage,
            );
        });

        it('loads paypal commerce sdk script with provided currency code (Buy Now flow)', async () => {
            await strategy.initialize(buyNowInitializationOptions);

            expect(paypalScriptLoader.getPayPalSDK).toHaveBeenCalledWith(
                paymentMethodMock,
                buyNowInitializationOptions.paypalcommercecredit?.currencyCode,
                buyNowInitializationOptions.paypalcommercecredit?.initializesOnCheckoutPage,
            );
        });

        describe('PayPal Commerce Credit buttons logic', () => {
            it('initializes PayPal PayLater button to render', async () => {
                await strategy.initialize(initializationOptions);

                expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
                    fundingSource: paypalSdkMock.FUNDING.PAYLATER,
                    style: paypalCommerceCreditOptions.style,
                    createOrder: expect.any(Function),
                    onApprove: expect.any(Function),
                    onClick: expect.any(Function),
                });
            });

            it('does not throw an error if onComplete method is not provided for default flow', async () => {
                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({
                    ...paymentMethodMock,
                    initializationData: {
                        ...paymentMethodMock.initializationData,
                        isHostedCheckoutEnabled: false,
                    },
                });

                const options = {
                    ...initializationOptions,
                    paypalcommercecredit: {
                        ...initializationOptions.paypalcommercecredit,
                        onComplete: undefined,
                    },
                };

                await strategy.initialize(options);

                expect(paypalSdkMock.Buttons).toHaveBeenCalled();
            });

            it('throws an error if onComplete method is not provided for shippingOptions flow', async () => {
                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({
                    ...paymentMethodMock,
                    initializationData: {
                        ...paymentMethodMock.initializationData,
                        isHostedCheckoutEnabled: true,
                    },
                });

                const options = {
                    ...initializationOptions,
                    paypalcommercecredit: {
                        ...initializationOptions.paypalcommercecredit,
                        onComplete: undefined,
                    },
                };

                try {
                    await strategy.initialize(options);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidArgumentError);
                }
            });

            it('initializes PayPal Credit button to render if PayPal PayLater is not eligible', async () => {
                jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(
                    (options: ButtonsOptions) => {
                        return {
                            render: jest.fn(),
                            isEligible: jest.fn(() => {
                                return options.fundingSource === paypalSdkMock.FUNDING.CREDIT;
                            }),
                        };
                    },
                );

                await strategy.initialize(initializationOptions);

                expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
                    fundingSource: paypalSdkMock.FUNDING.CREDIT,
                    style: paypalCommerceCreditOptions.style,
                    createOrder: expect.any(Function),
                    onApprove: expect.any(Function),
                    onClick: expect.any(Function),
                });
            });

            it('renders PayPal button', async () => {
                const paypalCommerceSdkRenderMock = jest.fn();

                jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(() => ({
                    render: paypalCommerceSdkRenderMock,
                    isEligible: jest.fn(() => true),
                }));

                await strategy.initialize(initializationOptions);

                expect(paypalCommerceSdkRenderMock).toHaveBeenCalledWith(
                    `#${defaultButtonContainerId}`,
                );
            });

            it('removes PayPal Commerce Credit button container if the funding sources are not eligible', async () => {
                const paypalCommerceSdkRenderMock = jest.fn();

                jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(() => ({
                    render: paypalCommerceSdkRenderMock,
                    isEligible: jest.fn(() => false),
                }));

                await strategy.initialize(initializationOptions);

                expect(document.getElementById(defaultButtonContainerId)).toBeNull();
            });

            it('throws an error if buy now cart request body data is not provided on button click (Buy Now flow)', async () => {
                const buyNowInitializationOptionsMock = {
                    ...buyNowInitializationOptions,
                    paypalcommercecredit: {
                        ...buyNowInitializationOptions.paypalcommercecredit,
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
                jest.spyOn(cartRequestSender, 'createBuyNowCart').mockReturnValue({
                    body: buyNowCartMock,
                });

                await strategy.initialize(buyNowInitializationOptions);

                eventEmitter.emit('onClick', () => {
                    expect(cartRequestSender.createBuyNowCart).toHaveBeenCalledWith(
                        buyNowCartRequestBody,
                    );
                });
            });

            it('throws an error if failed to create buy now cart (Buy Now Flow)', async () => {
                jest.spyOn(cartRequestSender, 'createBuyNowCart').mockImplementation(() =>
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
                        cartId: cartMock.id,
                    },
                );
            });

            it('creates an order with paypalcommercecreditcheckout as provider id if its initializes on checkout page', async () => {
                jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('');

                const updatedIntializationOptions = {
                    ...initializationOptions,
                    paypalcommercecredit: {
                        ...initializationOptions.paypalcommercecredit,
                        initializesOnCheckoutPage: true,
                    },
                };

                await strategy.initialize(updatedIntializationOptions);

                eventEmitter.emit('createOrder');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(
                    'paypalcommercecreditcheckout',
                    {
                        cartId: cartMock.id,
                    },
                );
            });

            it('creates order with Buy Now cart id (Buy Now flow)', async () => {
                jest.spyOn(cartRequestSender, 'createBuyNowCart').mockReturnValue({
                    body: buyNowCartMock,
                });
                jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('');

                await strategy.initialize(buyNowInitializationOptions);

                eventEmitter.emit('onClick');

                await new Promise((resolve) => process.nextTick(resolve));

                eventEmitter.emit('createOrder');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(
                    'paypalcommercecredit',
                    {
                        cartId: buyNowCartMock.id,
                    },
                );
            });

            it('throws an error if orderId is not provided by PayPal on approve', async () => {
                jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(
                    (options: ButtonsOptions) => {
                        eventEmitter.on('createOrder', () => {
                            if (options.createOrder) {
                                options.createOrder().catch(() => {});
                            }
                        });

                        eventEmitter.on('onApprove', () => {
                            if (options.onApprove) {
                                options.onApprove({ orderID: '' });
                            }
                        });

                        return {
                            render: jest.fn(),
                            isEligible: jest.fn(() => true),
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
                        order_id: approveDataOrderId,
                        payment_type: 'paypal',
                        provider: paymentMethodMock.id,
                    }),
                );
            });

            it('provides buy now cart_id on payment tokenization on paypal approve', async () => {
                jest.spyOn(cartRequestSender, 'createBuyNowCart').mockReturnValue({
                    body: buyNowCartMock,
                });
                jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('111');

                await strategy.initialize(buyNowInitializationOptions);

                eventEmitter.emit('onClick');

                await new Promise((resolve) => process.nextTick(resolve));

                eventEmitter.emit('createOrder');

                await new Promise((resolve) => process.nextTick(resolve));

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(formPoster.postForm).toHaveBeenCalledWith(
                    '/checkout.php',
                    expect.objectContaining({
                        cart_id: buyNowCartMock.id,
                    }),
                );
            });
        });

        describe('PayPal Commerce Credit messages logic', () => {
            it('initializes PayPal Messages component', async () => {
                await strategy.initialize(initializationOptions);

                expect(paypalSdkMock.Messages).toHaveBeenCalledWith({
                    amount: cartMock.cartAmount,
                    placement: 'cart',
                    style: {
                        layout: 'text',
                    },
                });
            });

            it('renders PayPal message', async () => {
                const paypalCommerceSdkRenderMock = jest.fn();

                jest.spyOn(paypalSdkMock, 'Messages').mockImplementation(() => ({
                    render: paypalCommerceSdkRenderMock,
                }));

                await strategy.initialize(initializationOptions);

                expect(paypalCommerceSdkRenderMock).toHaveBeenCalledWith(
                    `#${defaultMessageContainerId}`,
                );
            });
        });

        describe('#_onApprove button callback', () => {
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
                jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(
                    (options: PaypalCheckoutButtonOptions) => {
                        eventEmitter.on('onApprove', () => {
                            if (options.onApprove) {
                                options.onApprove(
                                    { orderID: approveDataOrderId },
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

                const paymentMethod = {
                    ...paymentMethodMock,
                    initializationData: {
                        ...paymentMethodMock.initializationData,
                        isHostedCheckoutEnabled: true,
                    },
                };

                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(paymentMethod);
            });

            it('takes order details data from paypal', async () => {
                const getOrderActionMock = jest.fn(() => paypalOrderDetails);

                jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(
                    (options: PaypalCheckoutButtonOptions) => {
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

                jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(
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

                expect(billingAddressActionCreator.updateAddress).toHaveBeenCalledWith(address);
            });

            it('skips consignment address update with valid customer data from order details if there are no items what should be shipped', async () => {
                const defaultCart = getCart();
                const cartWithoutShipping = {
                    ...defaultCart,
                    lineItems: {
                        ...defaultCart.lineItems,
                        physicalItems: [],
                    },
                };

                jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(
                    cartWithoutShipping,
                );

                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(consignmentActionCreator.updateAddress).not.toHaveBeenCalled();
                expect(paypalCommerceRequestSender.updateOrder).not.toHaveBeenCalled();
            });

            it('updates order and updates address with valid customer data from order details', async () => {
                const address = {
                    firstName: paypalOrderDetails.payer.name.given_name,
                    lastName: paypalOrderDetails.payer.name.surname,
                    email: paypalOrderDetails.payer.email_address,
                    phone: '',
                    company: '',
                    address1: paypalOrderDetails.purchase_units[0].shipping.address.address_line_1,
                    address2: '',
                    city: paypalOrderDetails.purchase_units[0].shipping.address.admin_area_2,
                    countryCode: paypalOrderDetails.purchase_units[0].shipping.address.country_code,
                    postalCode: paypalOrderDetails.purchase_units[0].shipping.address.postal_code,
                    stateOrProvince: '',
                    stateOrProvinceCode:
                        paypalOrderDetails.purchase_units[0].shipping.address.admin_area_1,
                    customFields: [],
                };

                const consignment = getConsignment();

                // INFO: lets imagine that it is a state that we get after consignmentActionCreator.updateAddress call
                jest.spyOn(store.getState().consignments, 'getConsignmentsOrThrow').mockReturnValue(
                    [consignment],
                );

                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(billingAddressActionCreator.updateAddress).toHaveBeenCalledWith(address);
                expect(consignmentActionCreator.updateAddress).toHaveBeenCalledWith(address);
                expect(paypalCommerceRequestSender.updateOrder).toHaveBeenCalledWith({
                    availableShippingOptions: consignment.availableShippingOptions,
                    cartId: cartMock.id,
                    selectedShippingOption: consignment.selectedShippingOption,
                });
            });

            it('submits BC order with provided methodId', async () => {
                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(
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
                            order_id: approveDataOrderId,
                        },
                    },
                };

                await strategy.initialize(initializationOptions);

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                    methodId,
                    paymentData,
                });
            });
        });

        describe('#_onShippingAddressChange button callback', () => {
            beforeEach(() => {
                const paymentMethod = {
                    ...paymentMethodMock,
                    initializationData: {
                        ...paymentMethodMock.initializationData,
                        isHostedCheckoutEnabled: true,
                    },
                };

                jest.spyOn(consignmentActionCreator, 'updateAddress').mockReturnValue(
                    Promise.resolve(),
                );
                jest.spyOn(consignmentActionCreator, 'selectShippingOption').mockReturnValue(
                    Promise.resolve(),
                );
                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(paymentMethod);
            });

            it('calls billingAddressActionCreator.updateAddress', async () => {
                await strategy.initialize(initializationOptions);
                eventEmitter.emit('onClick');
                await new Promise((resolve) => process.nextTick(resolve));
                eventEmitter.emit('onShippingAddressChange');
                await new Promise((resolve) => process.nextTick(resolve));

                expect(billingAddressActionCreator.updateAddress).toHaveBeenCalled();
            });

            it('calls consignmentActionCreator.updateAddress', async () => {
                await strategy.initialize(initializationOptions);
                eventEmitter.emit('onClick');
                await new Promise((resolve) => process.nextTick(resolve));
                eventEmitter.emit('onShippingAddressChange');
                await new Promise((resolve) => process.nextTick(resolve));

                expect(consignmentActionCreator.updateAddress).toHaveBeenCalled();
            });

            it('calls consignmentActionCreator.selectShippingOption', async () => {
                await strategy.initialize(initializationOptions);
                eventEmitter.emit('onClick');
                await new Promise((resolve) => process.nextTick(resolve));
                eventEmitter.emit('onShippingAddressChange');
                await new Promise((resolve) => process.nextTick(resolve));

                expect(consignmentActionCreator.selectShippingOption).toHaveBeenCalled();
            });

            it('calls updateOrder', async () => {
                await strategy.initialize(initializationOptions);
                eventEmitter.emit('onClick');
                await new Promise((resolve) => process.nextTick(resolve));
                eventEmitter.emit('onShippingAddressChange');
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalCommerceRequestSender.updateOrder).toHaveBeenCalled();
            });
        });

        describe('#_onShippingOptionsChange button callback', () => {
            beforeEach(() => {
                const paymentMethod = {
                    ...paymentMethodMock,
                    initializationData: {
                        ...paymentMethodMock.initializationData,
                        isHostedCheckoutEnabled: true,
                    },
                };

                jest.spyOn(consignmentActionCreator, 'updateAddress').mockReturnValue(
                    Promise.resolve(),
                );
                jest.spyOn(consignmentActionCreator, 'selectShippingOption').mockReturnValue(
                    Promise.resolve(),
                );
                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(paymentMethod);
            });

            it('calls consignmentActionCreator.selectShippingOption', async () => {
                await strategy.initialize(initializationOptions);
                eventEmitter.emit('onClick');
                await new Promise((resolve) => process.nextTick(resolve));
                eventEmitter.emit('onShippingOptionsChange');
                await new Promise((resolve) => process.nextTick(resolve));

                expect(consignmentActionCreator.selectShippingOption).toHaveBeenCalled();
            });

            it('calls updateOrder', async () => {
                await strategy.initialize(initializationOptions);
                eventEmitter.emit('onClick');
                await new Promise((resolve) => process.nextTick(resolve));
                eventEmitter.emit('onShippingOptionsChange');
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalCommerceRequestSender.updateOrder).toHaveBeenCalled();
            });
        });

        describe('#_handleClick', () => {
            beforeEach(() => {
                jest.spyOn(cartRequestSender, 'createBuyNowCart').mockReturnValue(
                    new Promise((resolve) => resolve({ body: { ...buyNowCartMock } })),
                );
                jest.spyOn(checkoutActionCreator, 'loadCheckout').mockReturnValue(true);
            });

            it('calls _cartRequestSender.createBuyNowCart on button click', async () => {
                const options = {
                    ...initializationOptions,
                    ...buyNowInitializationOptions,
                };

                await strategy.initialize(options);
                eventEmitter.emit('onClick');
                await new Promise((resolve) => process.nextTick(resolve));

                expect(cartRequestSender.createBuyNowCart).toHaveBeenCalled();
            });

            it('calls loadCheckout with proper cartId on button click', async () => {
                const options = {
                    ...initializationOptions,
                    ...buyNowInitializationOptions,
                };
                const cartId = buyNowCartMock.id;

                await strategy.initialize(options);
                eventEmitter.emit('onClick');
                await new Promise((resolve) => process.nextTick(resolve));

                expect(checkoutActionCreator.loadCheckout).toHaveBeenCalledWith(cartId);
            });
        });
    });
});
