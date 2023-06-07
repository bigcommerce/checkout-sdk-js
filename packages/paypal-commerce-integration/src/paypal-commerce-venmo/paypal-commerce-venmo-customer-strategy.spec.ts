import { EventEmitter } from 'events';

import {
    CustomerInitializeOptions,
    InvalidArgumentError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

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

import PayPalCommerceVenmoCustomerInitializeOptions from './paypal-commerce-venmo-customer-initialize-options';
import PayPalCommerceVenmoCustomerStrategy from './paypal-commerce-venmo-customer-strategy';

describe('PayPalCommerceVenmoCustomerStrategy', () => {
    let eventEmitter: EventEmitter;
    let strategy: PayPalCommerceVenmoCustomerStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalButtonElement: HTMLDivElement;
    let paypalCommerceIntegrationService: PayPalCommerceIntegrationService;
    let paypalSdk: PayPalSDK;

    const defaultMethodId = 'paypalcommercevenmo';
    const defaultButtonContainerId = 'paypal-commerce-venmo-customer-mock-id';
    const paypalOrderId = 'ORDER_ID';

    const paypalCommerceVenmoOptions: PayPalCommerceVenmoCustomerInitializeOptions = {
        container: defaultButtonContainerId,
        onError: jest.fn(),
    };

    const initializationOptions: CustomerInitializeOptions = {
        methodId: defaultMethodId,
        paypalcommercevenmo: paypalCommerceVenmoOptions,
    };

    beforeEach(() => {
        eventEmitter = new EventEmitter();
        paymentMethod = { ...getPayPalCommercePaymentMethod(), id: 'paypalcommercevenmo' };
        paypalSdk = getPayPalSDKMock();
        paypalCommerceIntegrationService = getPayPalCommerceIntegrationServiceMock();
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();

        strategy = new PayPalCommerceVenmoCustomerStrategy(
            paymentIntegrationService,
            paypalCommerceIntegrationService,
        );

        paypalButtonElement = document.createElement('div');
        paypalButtonElement.id = defaultButtonContainerId;
        document.body.appendChild(paypalButtonElement);

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockReturnValue(undefined);
        jest.spyOn(paypalCommerceIntegrationService, 'loadPayPalSdk').mockReturnValue(paypalSdk);
        jest.spyOn(paypalCommerceIntegrationService, 'getPayPalSdkOrThrow').mockReturnValue(
            paypalSdk,
        );
        jest.spyOn(paypalCommerceIntegrationService, 'createOrder').mockImplementation(jest.fn());
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
            const options = {} as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommercevenmo is not provided', async () => {
            const options = {
                methodId: defaultMethodId,
            } as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommercevenmo.container is not provided', async () => {
            const options = {
                methodId: defaultMethodId,
                paypalcommercevenmo: {
                    container: undefined,
                },
            } as CustomerInitializeOptions;

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

        it('loads paypal sdk with provided method id', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalCommerceIntegrationService.loadPayPalSdk).toHaveBeenCalledWith(
                defaultMethodId,
            );
        });
    });

    describe('#renderButton', () => {
        it('initializes PayPal Venmo button to render', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdk.FUNDING.VENMO,
                style: {
                    color: 'silver',
                    height: 36,
                    label: 'checkout',
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

            expect(paypalCommerceIntegrationService.removeElement).toHaveBeenCalledWith(
                defaultButtonContainerId,
            );
        });
    });

    describe('#createOrder button callback', () => {
        it('creates an order', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceIntegrationService.createOrder).toHaveBeenCalledWith(
                'paypalcommercevenmo',
            );
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
