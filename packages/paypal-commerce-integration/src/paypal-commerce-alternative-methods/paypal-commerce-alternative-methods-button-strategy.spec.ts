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
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { getPayPalCommercePaymentMethod } from '../mocks/paypal-commerce-payment-method.mock';
import { getPayPalSDKMock } from '../mocks/paypal-sdk.mock';
import PayPalCommerceRequestSender from '../paypal-commerce-request-sender';
import PayPalCommerceScriptLoader from '../paypal-commerce-script-loader';
import {
    PayPalCommerceButtonsOptions,
    PayPalCommerceHostWindow,
    PayPalSDK,
} from '../paypal-commerce-types';

import PayPalCommerceAlternativeMethodsButtonOptions from './paypal-commerce-alternative-methods-button-initialize-options';
import PayPalCommerceAlternativeMethodsButtonStrategy from './paypal-commerce-alternative-methods-button-strategy';

describe('PayPalCommerceAlternativeMethodsButtonStrategy', () => {
    let buyNowCart: Cart;
    let cart: Cart;
    let eventEmitter: EventEmitter;
    let formPoster: FormPoster;
    let requestSender: RequestSender;
    let strategy: PayPalCommerceAlternativeMethodsButtonStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalButtonElement: HTMLDivElement;
    let paypalCommerceRequestSender: PayPalCommerceRequestSender;
    let paypalCommerceScriptLoader: PayPalCommerceScriptLoader;
    let paypalSdk: PayPalSDK;

    const defaultMethodId = 'paypalcommercealternativemethods';
    const defaultButtonContainerId = 'paypal-commerce-alternative-methods-button-mock-id';
    const paypalOrderId = 'ORDER_ID';

    const buyNowCartRequestBody = getBuyNowCartRequestBody();

    const buyNowPayPalCommerceAlternativeMethodsOptions: PayPalCommerceAlternativeMethodsButtonOptions =
        {
            apm: 'sepa',
            buyNowInitializeOptions: {
                getBuyNowCartRequestBody: jest.fn().mockReturnValue(buyNowCartRequestBody),
            },
            currencyCode: 'USD',
            initializesOnCheckoutPage: false,
            style: {
                height: 45,
            },
        };

    const buyNowInitializationOptions: CheckoutButtonInitializeOptions = {
        methodId: defaultMethodId,
        containerId: defaultButtonContainerId,
        paypalcommercealternativemethods: buyNowPayPalCommerceAlternativeMethodsOptions,
    };

    const paypalCommerceAlternativeMethodsOptions: PayPalCommerceAlternativeMethodsButtonOptions = {
        apm: 'sepa',
        initializesOnCheckoutPage: false,
        style: {
            height: 45,
        },
    };

    const initializationOptions: CheckoutButtonInitializeOptions = {
        methodId: defaultMethodId,
        containerId: defaultButtonContainerId,
        paypalcommercealternativemethods: paypalCommerceAlternativeMethodsOptions,
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

        strategy = new PayPalCommerceAlternativeMethodsButtonStrategy(
            formPoster,
            paymentIntegrationService,
            paypalCommerceRequestSender,
            paypalCommerceScriptLoader,
        );

        paypalButtonElement = document.createElement('div');
        paypalButtonElement.id = defaultButtonContainerId;
        document.body.appendChild(paypalButtonElement);

        const state = paymentIntegrationService.getState();

        jest.spyOn(state, 'getPaymentMethodOrThrow').mockReturnValue(paymentMethod);
        jest.spyOn(paymentIntegrationService, 'loadDefaultCheckout').mockImplementation(jest.fn());
        jest.spyOn(formPoster, 'postForm').mockImplementation(jest.fn());
        jest.spyOn(paypalCommerceScriptLoader, 'getPayPalSDK').mockReturnValue(paypalSdk);

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
                                    { fundingSource: 'sepa' },
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

                return {
                    isEligible: jest.fn(() => true),
                    render: jest.fn(),
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

    it('creates an instance of the PayPal Commerce Alternative Methods checkout button strategy', () => {
        expect(strategy).toBeInstanceOf(PayPalCommerceAlternativeMethodsButtonStrategy);
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

        it('throws an error if paypalcommercealternativemethods option is not provided', async () => {
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

        it('throws an error if paypalcommercealternativemethods.apm option is not provided', async () => {
            const options = {
                containerId: defaultButtonContainerId,
                methodId: defaultMethodId,
                paypalcommercealternativemethods: {
                    ...paypalCommerceAlternativeMethodsOptions,
                    apm: '',
                },
            };

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
                paypalCommerceAlternativeMethodsOptions.initializesOnCheckoutPage,
            );
        });

        it('loads paypal commerce sdk script with provided currency code (Buy Now flow)', async () => {
            await strategy.initialize(buyNowInitializationOptions);

            expect(paypalCommerceScriptLoader.getPayPalSDK).toHaveBeenCalledWith(
                paymentMethod,
                buyNowPayPalCommerceAlternativeMethodsOptions.currencyCode,
                buyNowPayPalCommerceAlternativeMethodsOptions.initializesOnCheckoutPage,
            );
        });

        it('initializes PayPal APM button to render', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: 'sepa',
                style: paypalCommerceAlternativeMethodsOptions.style,
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
                onClick: expect.any(Function),
            });
        });

        it('throws an error if provided apm is not a valid funding source', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            const options = {
                ...initializationOptions,
                paypalcommercealternativemethods: {
                    ...paypalCommerceAlternativeMethodsOptions,
                    apm: 'not_valid_apm',
                },
            };

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
                expect(paypalCommerceSdkRenderMock).not.toHaveBeenCalled();
            }
        });

        it('renders PayPal APM button if it is eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => true),
                render: paypalCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).toHaveBeenCalled();
        });

        it('does not render PayPal APM button if it is not eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => false),
                render: paypalCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).not.toHaveBeenCalled();
        });

        it('removes PayPal APM button container if the button has not rendered', async () => {
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
                paypalcommercealternativemethods: {
                    ...buyNowPayPalCommerceAlternativeMethodsOptions,
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
            jest.spyOn(paymentIntegrationService, 'createBuyNowCart').mockReturnValue(buyNowCart);

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

        it('creates an order with paypalcommercealternativemethod as provider id if its initializes outside checkout page', async () => {
            jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('');

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(
                'paypalcommercealternativemethod',
                {
                    cartId: cart.id,
                },
            );
        });

        it('creates an order with paypalcommercealternativemethodscheckout as provider id if its initializes on checkout page', async () => {
            jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('');

            const updatedIntializationOptions = {
                ...initializationOptions,
                paypalcommercealternativemethods: {
                    ...paypalCommerceAlternativeMethodsOptions,
                    initializesOnCheckoutPage: true,
                },
            };

            await strategy.initialize(updatedIntializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(
                'paypalcommercealternativemethodscheckout',
                {
                    cartId: cart.id,
                },
            );
        });

        it('creates order with Buy Now cart id (Buy Now flow)', async () => {
            jest.spyOn(paymentIntegrationService, 'createBuyNowCart').mockReturnValue(buyNowCart);
            jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('');

            await strategy.initialize(buyNowInitializationOptions);

            eventEmitter.emit('onClick');

            await new Promise((resolve) => process.nextTick(resolve));

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(
                'paypalcommercealternativemethod',
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
                                { orderID: '' },
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

    describe('#handleClick', () => {
        it('creates buy now cart on button click', async () => {
            jest.spyOn(paymentIntegrationService, 'createBuyNowCart').mockReturnValue(buyNowCart);
            jest.spyOn(paymentIntegrationService, 'loadCheckout').mockReturnValue(true);

            await strategy.initialize(buyNowInitializationOptions);
            eventEmitter.emit('onClick');
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.createBuyNowCart).toHaveBeenCalled();
        });
    });
});
