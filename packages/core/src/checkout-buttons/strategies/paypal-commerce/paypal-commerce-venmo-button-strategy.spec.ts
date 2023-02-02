import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';

import { CartSource } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BuyNowCartRequestBody, Cart, CartRequestSender } from '../../../cart';
import { getCart } from '../../../cart/carts.mock';
import { BuyNowCartCreationError } from '../../../cart/errors';
import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { PaymentMethod } from '../../../payment';
import { getPaypalCommerce } from '../../../payment/payment-methods.mock';
import { PaypalHostWindow } from '../../../payment/strategies/paypal';
import {
    ButtonsOptions,
    PaypalCommerceRequestSender,
    PaypalCommerceScriptLoader,
    PaypalCommerceSDK,
} from '../../../payment/strategies/paypal-commerce';
import { getPaypalCommerceMock } from '../../../payment/strategies/paypal-commerce/paypal-commerce.mock';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonMethodType from '../checkout-button-method-type';

import PaypalCommerceVenmoButtonStrategy from './paypal-commerce-venmo-button-strategy';

describe('PaypalCommerceVenmoButtonStrategy', () => {
    let cartMock: Cart;
    let cartRequestSender: CartRequestSender;
    let checkoutActionCreator: CheckoutActionCreator;
    let eventEmitter: EventEmitter;
    let formPoster: FormPoster;
    let requestSender: RequestSender;
    let paymentMethodMock: PaymentMethod;
    let paypalCommerceRequestSender: PaypalCommerceRequestSender;
    let paypalScriptLoader: PaypalCommerceScriptLoader;
    let store: CheckoutStore;
    let strategy: PaypalCommerceVenmoButtonStrategy;
    let paypalSdkMock: PaypalCommerceSDK;
    let paypalVenmoButtonElement: HTMLDivElement;

    const defaultButtonContainerId = 'paypal-commerce-venmo-button-mock-id';
    const approveDataOrderId = 'ORDER_ID';

    const paypalCommerceVenmoOptions = {
        initializesOnCheckoutPage: false,
        style: {
            height: 45,
        },
    };

    const initializationOptions: CheckoutButtonInitializeOptions = {
        methodId: CheckoutButtonMethodType.PAYPALCOMMERCE_VENMO,
        containerId: defaultButtonContainerId,
        paypalcommercevenmo: paypalCommerceVenmoOptions,
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
        methodId: CheckoutButtonMethodType.PAYPALCOMMERCE_VENMO,
        containerId: defaultButtonContainerId,
        paypalcommercevenmo: {
            ...paypalCommerceVenmoOptions,
            currencyCode: 'USD',
            buyNowInitializeOptions: {
                getBuyNowCartRequestBody: jest.fn().mockReturnValue(buyNowCartRequestBody),
            },
        },
    };

    beforeEach(() => {
        cartMock = { ...getCart() };
        eventEmitter = new EventEmitter();
        paymentMethodMock = { ...getPaypalCommerce(), id: 'paypalcommercevenmo' };
        paypalSdkMock = getPaypalCommerceMock();

        store = createCheckoutStore(getCheckoutStoreState());
        requestSender = createRequestSender();
        formPoster = createFormPoster();
        cartRequestSender = new CartRequestSender(requestSender);
        paypalCommerceRequestSender = new PaypalCommerceRequestSender(requestSender);
        paypalScriptLoader = new PaypalCommerceScriptLoader(getScriptLoader());

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
        );

        strategy = new PaypalCommerceVenmoButtonStrategy(
            store,
            checkoutActionCreator,
            cartRequestSender,
            formPoster,
            paypalScriptLoader,
            paypalCommerceRequestSender,
        );

        paypalVenmoButtonElement = document.createElement('div');
        paypalVenmoButtonElement.id = defaultButtonContainerId;
        document.body.appendChild(paypalVenmoButtonElement);

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout').mockImplementation(() => {});
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );
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
                                { fundingSource: 'venmo' },
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

            return {
                isEligible: jest.fn(() => true),
                render: jest.fn(),
            };
        });
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as PaypalHostWindow).paypal;

        if (document.getElementById(defaultButtonContainerId)) {
            document.body.removeChild(paypalVenmoButtonElement);
        }
    });

    it('creates an instance of the PayPal Commerce Venmo checkout button strategy', () => {
        expect(strategy).toBeInstanceOf(PaypalCommerceVenmoButtonStrategy);
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
                methodId: CheckoutButtonMethodType.PAYPALCOMMERCE_VENMO,
            } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommercevenmo is not provided', async () => {
            const options = {
                containerId: defaultButtonContainerId,
                methodId: CheckoutButtonMethodType.PAYPALCOMMERCE_VENMO,
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
                initializationOptions.paypalcommercevenmo?.initializesOnCheckoutPage,
            );
        });

        it('loads paypal commerce sdk script with provided currency code (Buy Now flow)', async () => {
            await strategy.initialize(buyNowInitializationOptions);

            expect(paypalScriptLoader.getPayPalSDK).toHaveBeenCalledWith(
                paymentMethodMock,
                buyNowInitializationOptions.paypalcommercevenmo?.currencyCode,
                buyNowInitializationOptions.paypalcommercevenmo?.initializesOnCheckoutPage,
            );
        });

        it('initializes Venmo button to render', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdkMock.FUNDING.VENMO,
                style: paypalCommerceVenmoOptions.style,
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
                onClick: expect.any(Function),
            });
        });

        it('renders Venmo button if it is eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => true),
                render: paypalCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).toHaveBeenCalled();
        });

        it('does not render Venmo button if it is not eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => false),
                render: paypalCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).not.toHaveBeenCalled();
        });

        it('removes Venmo button container if the button has not rendered', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => false),
                render: paypalCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(document.getElementById(defaultButtonContainerId)).toBeNull();
        });

        it('throws an error if buy now cart request body data is not provided on button click (Buy Now flow)', async () => {
            const buyNowInitializationOptionsMock = {
                ...buyNowInitializationOptions,
                paypalcommercevenmo: {
                    ...buyNowInitializationOptions.paypalcommercevenmo,
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

        it('creates an order with paypalcommercevenmo as provider id if its initializes outside checkout page', async () => {
            jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('');

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(
                'paypalcommercevenmo',
                {
                    cartId: cartMock.id,
                },
            );
        });

        it('creates an order with paypalcommercevenmocheckout as provider id if its initializes on checkout page', async () => {
            jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('');

            const updatedIntializationOptions = {
                ...initializationOptions,
                paypalcommercevenmo: {
                    ...initializationOptions.paypalcommercevenmo,
                    initializesOnCheckoutPage: true,
                },
            };

            await strategy.initialize(updatedIntializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(
                'paypalcommercevenmocheckout',
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
                'paypalcommercevenmo',
                {
                    cartId: buyNowCartMock.id,
                },
            );
        });

        it('throws an error if orderId is not provided by PayPal on approve', async () => {
            jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation((options: ButtonsOptions) => {
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
                    isEligible: jest.fn(() => true),
                    render: jest.fn(),
                };
            });

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
});
