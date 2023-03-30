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

import {
    getPayPalCommerceIntegrationServiceMock,
    getPayPalCommercePaymentMethod,
    getPayPalSDKMock,
} from '../mocks';
import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
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
    let strategy: PayPalCommerceAlternativeMethodsButtonStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalButtonElement: HTMLDivElement;
    let paypalCommerceIntegrationService: PayPalCommerceIntegrationService;
    let paypalSdk: PayPalSDK;

    const defaultMethodId = 'paypalcommercealternativemethods';
    const defaultButtonContainerId = 'paypal-commerce-alternative-methods-button-mock-id';
    const paypalOrderId = 'ORDER_ID';
    const apmProviderId = 'sepa';

    const buyNowCartRequestBody = getBuyNowCartRequestBody();

    const buyNowPayPalCommerceAlternativeMethodsOptions: PayPalCommerceAlternativeMethodsButtonOptions =
        {
            apm: apmProviderId,
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
        paypalcommercealternativemethods: buyNowPayPalCommerceAlternativeMethodsOptions,
    };

    const paypalCommerceAlternativeMethodsOptions: PayPalCommerceAlternativeMethodsButtonOptions = {
        apm: apmProviderId,
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

        paypalCommerceIntegrationService = getPayPalCommerceIntegrationServiceMock();
        paymentMethod = { ...getPayPalCommercePaymentMethod(), id: defaultMethodId };
        paypalSdk = getPayPalSDKMock();

        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();

        strategy = new PayPalCommerceAlternativeMethodsButtonStrategy(
            paymentIntegrationService,
            paypalCommerceIntegrationService,
        );

        paypalButtonElement = document.createElement('div');
        paypalButtonElement.id = defaultButtonContainerId;
        document.body.appendChild(paypalButtonElement);

        jest.spyOn(paymentIntegrationService, 'loadDefaultCheckout').mockImplementation(jest.fn());
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        jest.spyOn(paypalCommerceIntegrationService, 'loadPayPalSdk').mockReturnValue(paypalSdk);
        jest.spyOn(paypalCommerceIntegrationService, 'getPayPalSdkOrThrow').mockReturnValue(
            paypalSdk,
        );
        jest.spyOn(paypalCommerceIntegrationService, 'createBuyNowCartOrThrow').mockReturnValue(
            buyNowCart,
        );
        jest.spyOn(paypalCommerceIntegrationService, 'createOrder').mockReturnValue(undefined);
        jest.spyOn(paypalCommerceIntegrationService, 'tokenizePayment').mockImplementation(
            jest.fn(),
        );
        jest.spyOn(paypalCommerceIntegrationService, 'removeElement').mockImplementation(jest.fn());

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
                                    { fundingSource: apmProviderId },
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

        it('throws an error if paypalcommercealternativemethods.currencyCode is not provided (for buyNowFlow only)', async () => {
            const { currencyCode, ...rest } = buyNowPayPalCommerceAlternativeMethodsOptions;

            const newInitializationOptions = {
                ...buyNowInitializationOptions,
                paypalcommercealternativemethods: rest,
            };

            try {
                await strategy.initialize(newInitializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if provided buyNow callback is not a function is not provided (for buyNowFlow only)', async () => {
            const { buyNowInitializeOptions, ...rest } =
                buyNowPayPalCommerceAlternativeMethodsOptions;

            const newInitializationOptions = {
                ...buyNowInitializationOptions,
                paypalcommercealternativemethods: {
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

        it('loads paypal commerce sdk script', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalCommerceIntegrationService.loadPayPalSdk).toHaveBeenCalledWith(
                defaultMethodId,
                cart.currency.code,
                false,
            );
        });

        it('loads paypal commerce sdk script with provided currency code (Buy Now flow)', async () => {
            await strategy.initialize(buyNowInitializationOptions);

            expect(paypalCommerceIntegrationService.loadPayPalSdk).toHaveBeenCalledWith(
                defaultMethodId,
                buyNowPayPalCommerceAlternativeMethodsOptions.currencyCode,
                false,
            );
        });
    });

    describe('#renderButton', () => {
        it('initializes PayPal APM button to render (default flow)', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: apmProviderId,
                style: paypalCommerceAlternativeMethodsOptions.style,
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
            });
        });

        it('initializes PayPal APM button to render (BuyNow flow)', async () => {
            await strategy.initialize(buyNowInitializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: apmProviderId,
                style: paypalCommerceAlternativeMethodsOptions.style,
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
                onClick: expect.any(Function),
                onCancel: expect.any(Function),
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
                'paypalcommercealternativemethod',
            );
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
