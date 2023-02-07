import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';

import {
    Cart,
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
    MissingDataError,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
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

import PayPalCommerceVenmoCustomerInitializeOptions from './paypal-commerce-venmo-customer-initialize-options';
import PayPalCommerceVenmoCustomerStrategy from './paypal-commerce-venmo-customer-strategy';

describe('PayPalCommerceVenmoCustomerStrategy', () => {
    let cart: Cart;
    let eventEmitter: EventEmitter;
    let formPoster: FormPoster;
    let requestSender: RequestSender;
    let strategy: PayPalCommerceVenmoCustomerStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalButtonElement: HTMLDivElement;
    let paypalCommerceRequestSender: PayPalCommerceRequestSender;
    let paypalCommerceScriptLoader: PayPalCommerceScriptLoader;
    let paypalSdk: PayPalSDK;

    const defaultMethodId = 'paypalcommercevenmo';
    const defaultButtonContainerId = 'paypal-commerce-venmo-customer-mock-id';
    const paypalOrderId = 'ORDER_ID';

    const paypalCommerceVenmoOptions: PayPalCommerceVenmoCustomerInitializeOptions = {
        container: defaultButtonContainerId,
        onError: jest.fn(),
    };

    const initializationOptions: CheckoutButtonInitializeOptions = {
        methodId: defaultMethodId,
        containerId: defaultButtonContainerId,
        paypalcommercevenmo: paypalCommerceVenmoOptions,
    };

    beforeEach(() => {
        cart = getCart();

        eventEmitter = new EventEmitter();

        paymentMethod = { ...getPayPalCommercePaymentMethod(), id: 'paypalcommercevenmo' };
        paypalSdk = getPayPalSDKMock();

        formPoster = createFormPoster();
        requestSender = createRequestSender();
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
        paypalCommerceRequestSender = new PayPalCommerceRequestSender(requestSender);
        paypalCommerceScriptLoader = new PayPalCommerceScriptLoader(getScriptLoader());

        strategy = new PayPalCommerceVenmoCustomerStrategy(
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

    it('creates an instance of the PayPal Commerce Venmo checkout button strategy', () => {
        expect(strategy).toBeInstanceOf(PayPalCommerceVenmoCustomerStrategy);
    });

    describe('#initialize()', () => {
        it('throws error if methodId is not provided', async () => {
            const options = {} as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommercevenmo is not provided', async () => {
            const options = {
                methodId: defaultMethodId,
            } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if containerId is not provided', async () => {
            const options = {
                ...initializationOptions,
                paypalcommercevenmo: {},
            } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('loads paypalcommerce venmo payment method', async () => {
            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(
                defaultMethodId,
            );
        });

        it('loads paypal commerce sdk script', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalCommerceScriptLoader.getPayPalSDK).toHaveBeenCalledWith(
                paymentMethod,
                cart.currency.code,
            );
        });

        it('initializes PayPal Venmo button to render', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdk.FUNDING.VENMO,
                style: {
                    height: 40,
                },
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
            });
        });

        it('renders PayPal Venmo button if it is eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => true),
                render: paypalCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).toHaveBeenCalled();
        });

        it('does not render PayPal Venmo button if it is not eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => false),
                render: paypalCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).not.toHaveBeenCalled();
        });

        it('removes Venmo PayPal button container if the button has not rendered', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => false),
                render: paypalCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(document.getElementById(defaultButtonContainerId)).toBeNull();
        });

        it('creates an order with paypalcommercevenmocheckout as provider id if its initializes on checkout page', async () => {
            jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('');

            const updatedIntializationOptions = {
                ...initializationOptions,
                paypalcommercevenmo: {
                    ...paypalCommerceVenmoOptions,
                },
            };

            await strategy.initialize(updatedIntializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(
                'paypalcommercevenmo',
                {
                    cartId: cart.id,
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

        it('throws an error if no paypalSdk exists', async () => {
            jest.spyOn(paypalCommerceScriptLoader, 'getPayPalSDK').mockReturnValue(undefined);

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
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
