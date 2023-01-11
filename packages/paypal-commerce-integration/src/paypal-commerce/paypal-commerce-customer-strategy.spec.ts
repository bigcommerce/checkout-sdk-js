import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';

import {
    Cart,
    CustomerInitializeOptions,
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
    PayPalOrderDetails,
    PayPalSDK,
} from '../paypal-commerce-types';

import PayPalCommerceCustomerInitializeOptions from './paypal-commerce-customer-initialize-options';
import PayPalCommerceCustomerStrategy from './paypal-commerce-customer-strategy';

describe('PayPalCommerceCustomerStrategy', () => {
    let cart: Cart;
    let eventEmitter: EventEmitter;
    let formPoster: FormPoster;
    let requestSender: RequestSender;
    let strategy: PayPalCommerceCustomerStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalCommerceRequestSender: PayPalCommerceRequestSender;
    let paypalCommerceScriptLoader: PayPalCommerceScriptLoader;
    let paypalSdk: PayPalSDK;

    const defaultContainerId = 'paypal-commerce-container-mock-id';
    const approveDataOrderId = 'ORDER_ID';

    const paypalCommerceOptions: PayPalCommerceCustomerInitializeOptions = {
        container: defaultContainerId,
        onComplete: jest.fn(),
    };

    const methodId = 'paypalcommerce';

    const initializationOptions: CustomerInitializeOptions = {
        methodId,
        paypalcommerce: paypalCommerceOptions,
    };

    beforeEach(() => {
        cart = getCart();

        eventEmitter = new EventEmitter();

        paymentMethod = getPayPalCommercePaymentMethod();
        paypalSdk = getPayPalSDKMock();

        formPoster = createFormPoster();
        requestSender = createRequestSender();
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
        paypalCommerceRequestSender = new PayPalCommerceRequestSender(requestSender);
        paypalCommerceScriptLoader = new PayPalCommerceScriptLoader(getScriptLoader());

        strategy = new PayPalCommerceCustomerStrategy(
            formPoster,
            paymentIntegrationService,
            paypalCommerceRequestSender,
            paypalCommerceScriptLoader,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(paypalCommerceScriptLoader, 'getPayPalSDK').mockReturnValue(paypalSdk);
        jest.spyOn(formPoster, 'postForm').mockImplementation(jest.fn());
        jest.spyOn(paypalCommerceRequestSender, 'updateOrder').mockReturnValue(true);

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
                            { orderID: approveDataOrderId },
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
                    isEligible: jest.fn(() => true),
                    render: jest.fn(),
                };
            },
        );
    });

    it('creates an interface of the PayPalCommerce customer strategy', () => {
        expect(strategy).toBeInstanceOf(PayPalCommerceCustomerStrategy);
    });

    describe('#initialize()', () => {
        it('throws an error if methodId is not provided', async () => {
            const options = {} as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommerce is not provided', async () => {
            const options = { methodId } as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('loads paypalcommerce payment method', async () => {
            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
        });

        it('loads paypal sdk with provided params', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalCommerceScriptLoader.getPayPalSDK).toHaveBeenCalledWith(
                paymentMethod,
                cart.currency.code,
            );
        });

        it('throws an error if paypal sdk is not properly loaded', async () => {
            jest.spyOn(paypalCommerceScriptLoader, 'getPayPalSDK').mockReturnValue(undefined);

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('throws an error if paypalcommerce.container is not provided', async () => {
            const options = {
                methodId,
                paypalcommerce: {
                    container: undefined,
                },
            } as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if onComplete method is not provided for hosted checkout feature', async () => {
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

            try {
                await strategy.initialize({
                    methodId,
                    paypalcommerce: {
                        container: defaultContainerId,
                    },
                });
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('initializes paypal commerce sdk buttons for default flow', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdk.FUNDING.PAYPAL,
                style: { height: 40 },
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
            });
        });

        it('initializes paypal commerce sdk buttons for hosted checkout feature', async () => {
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

            await strategy.initialize(initializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdk.FUNDING.PAYPAL,
                style: { height: 40 },
                createOrder: expect.any(Function),
                onShippingAddressChange: expect.any(Function),
                onShippingOptionsChange: expect.any(Function),
                onApprove: expect.any(Function),
            });
        });

        it('renders PayPal button if it is eligible', async () => {
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

        it('creates an order with paypalcommerce as provider id if its initializes on checkout page', async () => {
            jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('');

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith('paypalcommerce', {
                cartId: cart.id,
            });
        });
    });

    describe('#_onApprove button callback for default flow', () => {
        it('throws an error if orderId is not provided by PayPal', async () => {
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

        it('tokenizes payment', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(formPoster.postForm).toHaveBeenCalledWith(
                '/checkout.php',
                expect.objectContaining({
                    action: 'set_external_checkout',
                    order_id: approveDataOrderId,
                    payment_type: 'paypal',
                    provider: paymentMethod.id,
                }),
            );
        });
    });

    describe('#_onApprove button callback (hosted checkout flow)', () => {
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
            jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(
                getCart(),
            );

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
                (options: PayPalCommerceButtonsOptions) => {
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

            const updatedPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    isHostedCheckoutEnabled: true,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(updatedPaymentMethod);
        });

        it('takes order details data from paypal', async () => {
            const getOrderActionMock = jest.fn(() => paypalOrderDetails);

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
                (options: PayPalCommerceButtonsOptions) => {
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

        it('updates billing and shipping address with valid customers data from order details if shipping needed', async () => {
            const address = {
                firstName: paypalOrderDetails.payer.name.given_name,
                lastName: paypalOrderDetails.payer.name.surname,
                email: paypalOrderDetails.payer.email_address,
                phone: '',
                company: '',
                address1: paypalOrderDetails.purchase_units[0].shipping.address.address_line_1,
                address2: '',
                city: paypalOrderDetails.purchase_units[0].shipping.address.admin_area_2,
                countryCode: paypalOrderDetails.payer.address.country_code,
                postalCode: paypalOrderDetails.purchase_units[0].shipping.address.postal_code,
                stateOrProvince: '',
                stateOrProvinceCode:
                    paypalOrderDetails.purchase_units[0].shipping.address.admin_area_1,
                customFields: [],
            };

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith(address);
            expect(paymentIntegrationService.updateShippingAddress).toHaveBeenCalledWith(address);
        });

        it('updates paypal order if shipping needed (to make some price recalculation)', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.updateOrder).toHaveBeenCalled();
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
            const paymentData = {
                formattedPayload: {
                    vault_payment_instrument: null,
                    set_as_default_stored_instrument: null,
                    device_info: null,
                    method_id: initializationOptions.methodId,
                    paypal_account: {
                        order_id: approveDataOrderId,
                    },
                },
            };

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: initializationOptions.methodId,
                paymentData,
            });
        });

        it('calls onComplete method after submitting payment', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceOptions.onComplete).toHaveBeenCalled();
        });
    });

    describe('#_onShippingAddressChange button callback (hosted checkout flow)', () => {
        beforeEach(() => {
            const updatedPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    isHostedCheckoutEnabled: true,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(updatedPaymentMethod);
        });

        it('updates billing address on shipping address change callback call', async () => {
            await strategy.initialize(initializationOptions);
            eventEmitter.emit('onClick');
            await new Promise((resolve) => process.nextTick(resolve));
            eventEmitter.emit('onShippingAddressChange');
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalled();
        });

        it('updates shipping address on shipping address change callback call', async () => {
            await strategy.initialize(initializationOptions);
            eventEmitter.emit('onClick');
            await new Promise((resolve) => process.nextTick(resolve));
            eventEmitter.emit('onShippingAddressChange');
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.updateShippingAddress).toHaveBeenCalled();
        });

        it('selects shipping option on shipping address change callback call', async () => {
            await strategy.initialize(initializationOptions);
            eventEmitter.emit('onClick');
            await new Promise((resolve) => process.nextTick(resolve));
            eventEmitter.emit('onShippingAddressChange');
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalled();
        });

        it('updates paypal order on shipping address change callback call', async () => {
            await strategy.initialize(initializationOptions);
            eventEmitter.emit('onClick');
            await new Promise((resolve) => process.nextTick(resolve));
            eventEmitter.emit('onShippingAddressChange');
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.updateOrder).toHaveBeenCalled();
        });
    });

    describe('#_onShippingOptionsChange button callback (hosted checkout flow)', () => {
        beforeEach(() => {
            const updatedPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    isHostedCheckoutEnabled: true,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(updatedPaymentMethod);
        });

        it('calls consignmentActionCreator.selectShippingOption', async () => {
            await strategy.initialize(initializationOptions);
            eventEmitter.emit('onClick');
            await new Promise((resolve) => process.nextTick(resolve));
            eventEmitter.emit('onShippingOptionsChange');
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalled();
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
