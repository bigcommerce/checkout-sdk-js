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
    getBigCommercePaymentMethod,
    getBigCommerceSDKMock,
} from '../mocks';

import BigCommerceVenmoButtonInitializeOptions from './big-commerce-venmo-button-initialize-options';
import BigCommerceVenmoButtonStrategy from './big-commerce-venmo-button-strategy';

describe('BigCommerceVenmoButtonStrategy', () => {
    let buyNowCart: Cart;
    let cart: Cart;
    let eventEmitter: EventEmitter;
    let strategy: BigCommerceVenmoButtonStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let bigCommerceButtonElement: HTMLDivElement;
    let bigCommerceIntegrationService: BigCommerceIntegrationService;
    let bigCommerceSdk: BigCommerceSDK;

    const defaultMethodId = 'bigcommerce_payments_venmo';
    const defaultButtonContainerId = 'big-commerce-venmo-button-mock-id';
    const bigCommerceOrderId = 'ORDER_ID';

    const buyNowCartRequestBody = getBuyNowCartRequestBody();

    const buyNowBigCommerceVenmoOptions: BigCommerceVenmoButtonInitializeOptions = {
        buyNowInitializeOptions: {
            getBuyNowCartRequestBody: jest.fn().mockReturnValue(buyNowCartRequestBody),
        },
        currencyCode: 'USD',
        style: {
            height: 45,
        },
    };

    const buyNowInitializationOptions: CheckoutButtonInitializeOptions = {
        methodId: defaultMethodId,
        containerId: defaultButtonContainerId,
        bigcommerce_payments_venmo: buyNowBigCommerceVenmoOptions,
    };

    const bigCommerceVenmoOptions: BigCommerceVenmoButtonInitializeOptions = {
        style: {
            height: 45,
        },
        onEligibilityFailure: jest.fn(),
    };

    const initializationOptions: CheckoutButtonInitializeOptions = {
        methodId: defaultMethodId,
        containerId: defaultButtonContainerId,
        bigcommerce_payments_venmo: bigCommerceVenmoOptions,
    };

    beforeEach(() => {
        buyNowCart = getBuyNowCart();
        cart = getCart();

        eventEmitter = new EventEmitter();

        paymentMethod = { ...getBigCommercePaymentMethod(), id: 'bigcommerce_payments_venmo' };
        bigCommerceSdk = getBigCommerceSDKMock();
        bigCommerceIntegrationService = getBigCommerceIntegrationServiceMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new BigCommerceVenmoButtonStrategy(
            paymentIntegrationService,
            bigCommerceIntegrationService,
        );

        bigCommerceButtonElement = document.createElement('div');
        bigCommerceButtonElement.id = defaultButtonContainerId;
        document.body.appendChild(bigCommerceButtonElement);

        jest.spyOn(paymentIntegrationService, 'loadDefaultCheckout').mockImplementation(jest.fn());
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        jest.spyOn(bigCommerceIntegrationService, 'loadBigCommerceSdk').mockReturnValue(
            Promise.resolve(bigCommerceSdk),
        );
        jest.spyOn(bigCommerceIntegrationService, 'getBigCommerceSdkOrThrow').mockReturnValue(
            bigCommerceSdk,
        );
        jest.spyOn(bigCommerceIntegrationService, 'createBuyNowCartOrThrow').mockReturnValue(
            Promise.resolve(buyNowCart),
        );
        jest.spyOn(bigCommerceIntegrationService, 'createOrder');
        jest.spyOn(bigCommerceIntegrationService, 'tokenizePayment').mockImplementation(jest.fn());
        jest.spyOn(bigCommerceIntegrationService, 'removeElement').mockImplementation(jest.fn());

        jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(
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
                        options.onApprove(
                            { orderID: bigCommerceOrderId },
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
            document.body.removeChild(bigCommerceButtonElement);
        }
    });

    it('creates an instance of the BigCommerce Venmo checkout button strategy', () => {
        expect(strategy).toBeInstanceOf(BigCommerceVenmoButtonStrategy);
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

        it('throws an error if bigcommerce_payments_venmo is not provided', async () => {
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

        it('throws an error if bigcommerce_payments_venmo.currencyCode is not provided (for buyNowFlow only)', async () => {
            const { currencyCode, ...rest } = buyNowBigCommerceVenmoOptions;

            const newInitializationOptions = {
                ...buyNowInitializationOptions,
                bigcommerce_payments_venmo: rest,
            };

            try {
                await strategy.initialize(newInitializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if provided buyNow callback is not a function is not provided (for buyNowFlow only)', async () => {
            const { buyNowInitializeOptions, ...rest } = buyNowBigCommerceVenmoOptions;

            const newInitializationOptions = {
                ...buyNowInitializationOptions,
                bigcommerce_payments_venmo: {
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

        it('loads bigcommerce sdk script', async () => {
            await strategy.initialize(initializationOptions);

            expect(bigCommerceIntegrationService.loadBigCommerceSdk).toHaveBeenCalledWith(
                defaultMethodId,
                cart.currency.code,
                false,
            );
        });

        it('loads bigcommerce sdk script with provided currency code (Buy Now flow)', async () => {
            await strategy.initialize(buyNowInitializationOptions);

            expect(bigCommerceIntegrationService.loadBigCommerceSdk).toHaveBeenCalledWith(
                defaultMethodId,
                buyNowBigCommerceVenmoOptions.currencyCode,
                false,
            );
        });
    });

    describe('#renderButton', () => {
        it('initializes BigCommerce Venmo button to render', async () => {
            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: bigCommerceSdk.FUNDING.VENMO,
                style: bigCommerceVenmoOptions.style,
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
            });
        });

        it('render button with undefined color (uses default blue) when it receives gold color setting', async () => {
            const initializationVenmoOptions = {
                ...initializationOptions,
                bigcommerce_payments_venmo: {
                    style: {
                        height: 45,
                        color: StyleButtonColor.gold,
                    },
                },
            };

            const expectedStyles = {
                height: 45,
                color: undefined,
            };

            await strategy.initialize(initializationVenmoOptions);

            expect(bigCommerceSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: bigCommerceSdk.FUNDING.VENMO,
                style: expectedStyles,
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
            });
        });

        it('initializes BigCommerce Venmo button to render (BuyNow flow)', async () => {
            await strategy.initialize(buyNowInitializationOptions);

            expect(bigCommerceSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: bigCommerceSdk.FUNDING.VENMO,
                style: bigCommerceVenmoOptions.style,
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
                onClick: expect.any(Function),
                onCancel: expect.any(Function),
            });
        });

        it('renders BigCommerce Venmo button if it is eligible', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => true),
                render: bigCommerceSdkRenderMock,
                close: jest.fn(),
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdkRenderMock).toHaveBeenCalled();
        });

        it('calls onEligibilityFailure when BigCommerce Venmo button if it is not eligible', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => false),
                render: bigCommerceSdkRenderMock,
                close: jest.fn(),
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommerceVenmoOptions.onEligibilityFailure).toHaveBeenCalled();
            expect(bigCommerceSdkRenderMock).not.toHaveBeenCalled();
        });

        it('removes Venmo BigCommerce button container if the button has not rendered', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => false),
                render: bigCommerceSdkRenderMock,
                close: jest.fn(),
            }));

            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_venmo: {
                    ...bigCommerceVenmoOptions,
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
                'bigcommerce_payments_venmo',
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
        it('tokenizes payment on bigcommerce approve', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommerceIntegrationService.tokenizePayment).toHaveBeenCalledWith(
                defaultMethodId,
                bigCommerceOrderId,
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
