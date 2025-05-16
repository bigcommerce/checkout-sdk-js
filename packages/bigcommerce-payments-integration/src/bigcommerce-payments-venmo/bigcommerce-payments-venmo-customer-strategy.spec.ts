import { EventEmitter } from 'events';

import {
    CustomerInitializeOptions,
    DefaultCheckoutButtonHeight,
    InvalidArgumentError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsIntegrationService from '../bigcommerce-payments-integration-service';
import {
    BigCommercePaymentsButtonsOptions,
    BigCommercePaymentsHostWindow,
    PayPalSDK,
} from '../bigcommerce-payments-types';
import {
    getBigCommercePaymentsIntegrationServiceMock,
    getBigCommercePaymentsPaymentMethod,
    getPayPalSDKMock,
} from '../mocks';

import BigCommercePaymentsVenmoCustomerInitializeOptions from './bigcommerce-payments-venmo-customer-initialize-options';
import BigCommercePaymentsVenmoCustomerStrategy from './bigcommerce-payments-venmo-customer-strategy';

describe('BigCommercePaymentsVenmoCustomerStrategy', () => {
    let eventEmitter: EventEmitter;
    let strategy: BigCommercePaymentsVenmoCustomerStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalButtonElement: HTMLDivElement;
    let bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService;
    let paypalSdk: PayPalSDK;

    const defaultMethodId = 'bigcommerce_payments_venmo';
    const defaultButtonContainerId = 'bigcommerce-payments-venmo-customer-mock-id';
    const paypalOrderId = 'ORDER_ID';

    const bigCommercePaymentsVenmoOptions: BigCommercePaymentsVenmoCustomerInitializeOptions = {
        container: defaultButtonContainerId,
        onClick: jest.fn(),
        onError: jest.fn(),
    };

    const initializationOptions: CustomerInitializeOptions = {
        methodId: defaultMethodId,
        bigcommerce_payments_venmo: bigCommercePaymentsVenmoOptions,
    };

    beforeEach(() => {
        eventEmitter = new EventEmitter();
        paymentMethod = {
            ...getBigCommercePaymentsPaymentMethod(),
            id: 'bigcommerce_payments_venmo',
        };
        paypalSdk = getPayPalSDKMock();
        bigCommercePaymentsIntegrationService = getBigCommercePaymentsIntegrationServiceMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new BigCommercePaymentsVenmoCustomerStrategy(
            paymentIntegrationService,
            bigCommercePaymentsIntegrationService,
        );

        paypalButtonElement = document.createElement('div');
        paypalButtonElement.id = defaultButtonContainerId;
        document.body.appendChild(paypalButtonElement);

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(
            paymentIntegrationService.getState(),
        );
        jest.spyOn(bigCommercePaymentsIntegrationService, 'loadPayPalSdk').mockResolvedValue(
            paypalSdk,
        );
        jest.spyOn(bigCommercePaymentsIntegrationService, 'getPayPalSdkOrThrow').mockReturnValue(
            paypalSdk,
        );
        jest.spyOn(bigCommercePaymentsIntegrationService, 'createOrder').mockImplementation(
            jest.fn(),
        );
        jest.spyOn(bigCommercePaymentsIntegrationService, 'tokenizePayment').mockImplementation(
            jest.fn(),
        );
        jest.spyOn(bigCommercePaymentsIntegrationService, 'removeElement').mockImplementation(
            jest.fn(),
        );

        jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
            (options: BigCommercePaymentsButtonsOptions) => {
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

                eventEmitter.on('onClick', () => {
                    if (options.onClick) {
                        options.onClick(
                            { fundingSource: 'venmo' },
                            {
                                resolve: jest.fn(),
                                reject: jest.fn(),
                            },
                        );
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

    it('creates an instance of the BigCommercePayments Venmo checkout button strategy', () => {
        expect(strategy).toBeInstanceOf(BigCommercePaymentsVenmoCustomerStrategy);
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

        it('throws an error if bigcommerce_payments_venmo is not provided', async () => {
            const options = {
                methodId: defaultMethodId,
            } as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if bigcommerce_payments_venmo.container is not provided', async () => {
            const options = {
                methodId: defaultMethodId,
                bigcommerce_payments_venmo: {
                    container: undefined,
                },
            } as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if bigcommerce_payments_venmo.onClick is provided but it is not a function', async () => {
            const options = {
                methodId: defaultMethodId,
                bigcommerce_payments_venmo: {
                    container: 'container',
                    onClick: 'test',
                },
            } as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('loads bigcommerce_payments_venmo payment method', async () => {
            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(
                defaultMethodId,
            );
        });

        it('does not load bigcommerce_payments_venmo payment method if payment method is already exists', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethod').mockReturnValue(
                paymentMethod,
            );

            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).not.toHaveBeenCalled();
        });

        it('loads paypal sdk with provided method id', async () => {
            await strategy.initialize(initializationOptions);

            expect(bigCommercePaymentsIntegrationService.loadPayPalSdk).toHaveBeenCalledWith(
                defaultMethodId,
            );
        });

        it('logs an error when PayPalSDK Buttons implementation is not available for some reasons', async () => {
            jest.spyOn(bigCommercePaymentsIntegrationService, 'loadPayPalSdk').mockReturnValue(
                Promise.resolve(undefined),
            );

            const log = jest.fn();

            jest.spyOn(console, 'error').mockImplementation(log);

            await strategy.initialize(initializationOptions);

            expect(log).toHaveBeenCalled();
        });
    });

    describe('#renderButton', () => {
        it('initializes PayPal Venmo button to render', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdk.FUNDING.VENMO,
                style: {
                    color: 'silver',
                    height: DefaultCheckoutButtonHeight,
                    label: 'checkout',
                },
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
                onClick: expect.any(Function),
            });
        });

        it('renders PayPal Venmo button if it is eligible', async () => {
            const bigCommercePaymentsSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => true),
                render: bigCommercePaymentsSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommercePaymentsSdkRenderMock).toHaveBeenCalled();
        });

        it('does not render PayPal Venmo button if it is not eligible', async () => {
            const bigCommercePaymentsSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: bigCommercePaymentsSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommercePaymentsSdkRenderMock).not.toHaveBeenCalled();
        });

        it('removes Venmo PayPal button container if the button has not rendered', async () => {
            const bigCommercePaymentsSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: bigCommercePaymentsSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommercePaymentsIntegrationService.removeElement).toHaveBeenCalledWith(
                defaultButtonContainerId,
            );
        });
    });

    describe('#createOrder button callback', () => {
        it('creates an order', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommercePaymentsIntegrationService.createOrder).toHaveBeenCalledWith(
                'bigcommerce_payments_venmo',
            );
        });
    });

    describe('#onApprove button callback', () => {
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

    describe('#onClick button callback', () => {
        it('triggers onClick option by clicking on the button', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onClick');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommercePaymentsVenmoOptions.onClick).toHaveBeenCalled();
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
