import { EventEmitter } from 'events';

import {
    CustomerInitializeOptions,
    DefaultCheckoutButtonHeight,
    InvalidArgumentError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommerceIntegrationService from '../big-commerce-integration-service';
import {
    BigCommerceButtonsOptions,
    BigCommerceHostWindow,
    BigCommerceSDK,
} from '../big-commerce-types';
import {
    getBigCommerceIntegrationServiceMock,
    getBigCommercePaymentMethod,
    getBigCommerceSDKMock,
} from '../mocks';

import BigCommerceVenmoCustomerInitializeOptions from './big-commerce-venmo-customer-initialize-options';
import BigCommerceVenmoCustomerStrategy from './big-commerce-venmo-customer-strategy';

describe('BigCommerceVenmoCustomerStrategy', () => {
    let eventEmitter: EventEmitter;
    let strategy: BigCommerceVenmoCustomerStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let bigCommerceButtonElement: HTMLDivElement;
    let bigCommerceIntegrationService: BigCommerceIntegrationService;
    let bigCommerceSdk: BigCommerceSDK;

    const defaultMethodId = 'bigcommerce_payments_venmo';
    const defaultButtonContainerId = 'big-commerce-venmo-customer-mock-id';
    const bigCommerceOrderId = 'ORDER_ID';

    const bigCommerceVenmoOptions: BigCommerceVenmoCustomerInitializeOptions = {
        container: defaultButtonContainerId,
        onClick: jest.fn(),
        onError: jest.fn(),
    };

    const initializationOptions: CustomerInitializeOptions = {
        methodId: defaultMethodId,
        bigcommerce_payments_venmo: bigCommerceVenmoOptions,
    };

    beforeEach(() => {
        eventEmitter = new EventEmitter();
        paymentMethod = { ...getBigCommercePaymentMethod(), id: 'bigcommerce_payments_venmo' };
        bigCommerceSdk = getBigCommerceSDKMock();
        bigCommerceIntegrationService = getBigCommerceIntegrationServiceMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new BigCommerceVenmoCustomerStrategy(
            paymentIntegrationService,
            bigCommerceIntegrationService,
        );

        bigCommerceButtonElement = document.createElement('div');
        bigCommerceButtonElement.id = defaultButtonContainerId;
        document.body.appendChild(bigCommerceButtonElement);

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(
            paymentIntegrationService.getState(),
        );
        jest.spyOn(bigCommerceIntegrationService, 'loadBigCommerceSdk').mockResolvedValue(
            bigCommerceSdk,
        );
        jest.spyOn(bigCommerceIntegrationService, 'getBigCommerceSdkOrThrow').mockReturnValue(
            bigCommerceSdk,
        );
        jest.spyOn(bigCommerceIntegrationService, 'createOrder').mockImplementation(jest.fn());
        jest.spyOn(bigCommerceIntegrationService, 'tokenizePayment').mockImplementation(jest.fn());
        jest.spyOn(bigCommerceIntegrationService, 'removeElement').mockImplementation(jest.fn());

        jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(
            (options: BigCommerceButtonsOptions) => {
                eventEmitter.on('createOrder', () => {
                    if (options.createOrder) {
                        options.createOrder();
                    }
                });

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

        delete (window as BigCommerceHostWindow).bigcommerce;

        if (document.getElementById(defaultButtonContainerId)) {
            document.body.removeChild(bigCommerceButtonElement);
        }
    });

    it('creates an instance of the BigCommerce Venmo checkout button strategy', () => {
        expect(strategy).toBeInstanceOf(BigCommerceVenmoCustomerStrategy);
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

        it('loads bigcommerce sdk with provided method id', async () => {
            await strategy.initialize(initializationOptions);

            expect(bigCommerceIntegrationService.loadBigCommerceSdk).toHaveBeenCalledWith(
                defaultMethodId,
            );
        });

        it('logs an error when BigCommerceSDK Buttons implementation is not available for some reasons', async () => {
            jest.spyOn(bigCommerceIntegrationService, 'loadBigCommerceSdk').mockReturnValue(
                Promise.resolve(undefined),
            );

            const log = jest.fn();

            jest.spyOn(console, 'error').mockImplementation(log);

            await strategy.initialize(initializationOptions);

            expect(log).toHaveBeenCalled();
        });
    });

    describe('#renderButton', () => {
        it('initializes BigCommerce Venmo button to render', async () => {
            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: bigCommerceSdk.FUNDING.VENMO,
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

        it('renders BigCommerce Venmo button if it is eligible', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => true),
                render: bigCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdkRenderMock).toHaveBeenCalled();
        });

        it('does not render BigCommerce Venmo button if it is not eligible', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: bigCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommerceSdkRenderMock).not.toHaveBeenCalled();
        });

        it('removes Venmo BigCommerce button container if the button has not rendered', async () => {
            const bigCommerceSdkRenderMock = jest.fn();

            jest.spyOn(bigCommerceSdk, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: bigCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(bigCommerceIntegrationService.removeElement).toHaveBeenCalledWith(
                defaultButtonContainerId,
            );
        });
    });

    describe('#createOrder button callback', () => {
        it('creates an order', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommerceIntegrationService.createOrder).toHaveBeenCalledWith(
                'bigcommerce_payments_venmo',
            );
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

    describe('#onClick button callback', () => {
        it('triggers onClick option by clicking on the button', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onClick');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(bigCommerceVenmoOptions.onClick).toHaveBeenCalled();
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
