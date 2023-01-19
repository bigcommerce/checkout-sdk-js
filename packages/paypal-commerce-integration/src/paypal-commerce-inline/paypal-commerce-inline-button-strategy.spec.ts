import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';

import {
    Cart,
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCart,
    getConsignment,
    getShippingOption,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { getPayPalCommercePaymentMethod } from '../mocks/paypal-commerce-payment-method.mock';
import { getPayPalSDKMock } from '../mocks/paypal-sdk.mock';
import PayPalCommerceRequestSender from '../paypal-commerce-request-sender';
import PayPalCommerceScriptLoader from '../paypal-commerce-script-loader';
import {
    PayPalAddress,
    PayPalCommerceButtonsOptions,
    PayPalCommerceHostWindow,
    PayPalOrderDetails,
    PayPalSDK,
    PayPalSelectedShippingOption,
} from '../paypal-commerce-types';

import PayPalCommerceInlineButtonInitializeOptions from './paypal-commerce-inline-button-initialize-options';
import PayPalCommerceInlineButtonStrategy from './paypal-commerce-inline-button-strategy';

describe('PayPalCommerceInlineButtonStrategy', () => {
    let cart: Cart;
    let eventEmitter: EventEmitter;
    let requestSender: RequestSender;
    let strategy: PayPalCommerceInlineButtonStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalCommerceRequestSender: PayPalCommerceRequestSender;
    let paypalCommerceScriptLoader: PayPalCommerceScriptLoader;
    let paypalSdk: PayPalSDK;

    const containerId = 'paypalAcceleratedCheckoutContainerIdMock';
    const buttonContainerId = `${containerId}-paypal-accelerated-checkout-button`;

    const paypalCommerceInlineMethodId = 'paypalcommerceinline';
    const paypalOrderId = 'ORDER_ID';

    const paypalCommerceButtonStyle = {
        custom: {
            label: 'Checkout',
            css: {
                color: 'white',
            },
        },
    };

    const paypalCommerceInlineOptions: PayPalCommerceInlineButtonInitializeOptions = {
        onComplete: jest.fn(),
        onError: jest.fn(),
        style: paypalCommerceButtonStyle,
    };

    const initializationOptions: CheckoutButtonInitializeOptions = {
        methodId: paypalCommerceInlineMethodId,
        containerId,
        paypalcommerceinline: paypalCommerceInlineOptions,
    };

    const paypalShippingAddressPayloadMock: PayPalAddress = {
        city: 'San Jose',
        state: 'CA',
        country_code: 'US',
        postal_code: '95131',
    };

    const paypalSelectedShippingOptionPayloadMock: PayPalSelectedShippingOption = {
        id: '1',
        type: 'SHIPPING',
        label: 'FREE SHIPPING',
        selected: false,
        amount: {
            currency_code: 'USD',
            value: '0.00',
        },
    };

    beforeEach(() => {
        cart = getCart();

        eventEmitter = new EventEmitter();

        paymentMethod = { ...getPayPalCommercePaymentMethod(), id: paypalCommerceInlineMethodId };
        paypalSdk = getPayPalSDKMock();

        requestSender = createRequestSender();
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
        paypalCommerceRequestSender = new PayPalCommerceRequestSender(requestSender);
        paypalCommerceScriptLoader = new PayPalCommerceScriptLoader(getScriptLoader());

        strategy = new PayPalCommerceInlineButtonStrategy(
            paymentIntegrationService,
            paypalCommerceRequestSender,
            paypalCommerceScriptLoader,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(paypalCommerceScriptLoader, 'getPayPalSDK').mockReturnValue(paypalSdk);
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
                            { orderID: paypalOrderId },
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
                            orderId: paypalOrderId,
                            shippingAddress: paypalShippingAddressPayloadMock,
                        });
                    }
                });

                eventEmitter.on('onShippingOptionsChange', () => {
                    if (options.onShippingOptionsChange) {
                        options.onShippingOptionsChange({
                            orderId: paypalOrderId,
                            selectedShippingOption: paypalSelectedShippingOptionPayloadMock,
                        });
                    }
                });

                eventEmitter.on('onComplete', () => {
                    if (options.onComplete) {
                        options.onComplete({ intent: 'CAPTURE', orderID: paypalOrderId });
                    }
                });

                eventEmitter.on('onError', () => {
                    if (options.onError) {
                        options.onError(new Error('Error message'));
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
    });

    it('creates an instance of the PayPalCommerceInlineButtonStrategy', () => {
        expect(strategy).toBeInstanceOf(PayPalCommerceInlineButtonStrategy);
    });

    describe('#initialize', () => {
        it('throws an error if methodId is not provided', async () => {
            const options = {
                containerId: initializationOptions.containerId,
            } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if containerId is not provided', async () => {
            const options = {
                methodId: paypalCommerceInlineMethodId,
            } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommerceinline option is not provided', async () => {
            const options = {
                methodId: paypalCommerceInlineMethodId,
                containerId: initializationOptions.containerId,
            } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('calls checkout action creator to load default checkout', async () => {
            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadDefaultCheckout).toHaveBeenCalled();
        });

        it('loads paypal commerce sdk script', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalCommerceScriptLoader.getPayPalSDK).toHaveBeenCalled();
        });

        it('throws an error if paypal sdk is not loaded', async () => {
            jest.spyOn(paypalCommerceScriptLoader, 'getPayPalSDK').mockReturnValue(undefined);

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });

    describe('#_renderButton', () => {
        it('initializes PayPal button to render with provided options', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdk.Buttons).toHaveBeenCalledWith({
                experience: 'accelerated',
                fundingSource: paypalSdk.FUNDING.CARD,
                style: paypalCommerceButtonStyle,
                createOrder: expect.any(Function),
                onShippingAddressChange: expect.any(Function),
                onShippingOptionsChange: expect.any(Function),
                onApprove: expect.any(Function),
                onComplete: expect.any(Function),
                onError: expect.any(Function),
            });
        });

        it('renders PayPal button if it is eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                render: paypalCommerceSdkRenderMock,
                isEligible: jest.fn(() => true),
            }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).toHaveBeenCalledWith(`#${buttonContainerId}`);
        });

        it('does not render PayPal button container if PayPal button is not eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(() => ({
                render: paypalCommerceSdkRenderMock,
                isEligible: jest.fn(() => false),
            }));

            await strategy.initialize(initializationOptions);

            expect(document.querySelector(`#${buttonContainerId}`)).toBeNull();
        });
    });

    describe('#_createOrder button callback', () => {
        it('creates PayPal order', async () => {
            jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue({
                orderID: paypalOrderId,
            });

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(
                initializationOptions.methodId,
                {
                    cartId: cart.id,
                },
            );
        });
    });

    describe('#_onShippingAddressChange button callback', () => {
        it('updates billing and consignment address with data returned from PayPal', async () => {
            const providedAddress = {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                company: '',
                address1: '',
                address2: '',
                city: paypalShippingAddressPayloadMock.city,
                countryCode: paypalShippingAddressPayloadMock.country_code,
                postalCode: paypalShippingAddressPayloadMock.postal_code,
                stateOrProvince: '',
                stateOrProvinceCode: paypalShippingAddressPayloadMock.state,
                customFields: [],
            };

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingAddressChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith(
                providedAddress,
            );
            expect(paymentIntegrationService.updateShippingAddress).toHaveBeenCalledWith(
                providedAddress,
            );
        });

        it('selects recommended shipping option if it was not selected earlier', async () => {
            const recommendedShippingOption = {
                ...getShippingOption(),
                isRecommended: true,
            };

            const consignment = {
                ...getConsignment(),
                availableShippingOptions: [recommendedShippingOption],
                selectedShippingOption: null,
            };

            const updatedConsignment = {
                ...consignment,
                selectedShippingOption: recommendedShippingOption,
            };

            jest.spyOn(paymentIntegrationService.getState(), 'getConsignmentsOrThrow')
                .mockReturnValueOnce([consignment])
                .mockReturnValue([updatedConsignment]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingAddressChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalledWith(
                recommendedShippingOption.id,
            );
        });

        it('updates PayPal order', async () => {
            const consignment = getConsignment();

            // INFO: lets imagine that it is a state that we get after consignmentActionCreator.selectShippingOption call
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getConsignmentsOrThrow',
            ).mockReturnValue([consignment]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingAddressChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.updateOrder).toHaveBeenCalledWith({
                availableShippingOptions: consignment.availableShippingOptions,
                cartId: cart.id,
                selectedShippingOption: consignment.selectedShippingOption,
            });
        });
    });

    describe('#_onShippingOptionsChange button callback', () => {
        it('selects shipping option', async () => {
            const recommendedShippingOption = getShippingOption();
            const shippingOptionThatShouldBeSelected = {
                ...getShippingOption(),
                id: paypalSelectedShippingOptionPayloadMock.id,
                isRecommended: false,
            };

            const consignment = {
                ...getConsignment(),
                availableShippingOptions: [
                    recommendedShippingOption,
                    shippingOptionThatShouldBeSelected,
                ],
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getConsignmentsOrThrow',
            ).mockReturnValue([consignment]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingOptionsChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalledWith(
                shippingOptionThatShouldBeSelected.id,
            );
        });

        it('selects recommended shipping option if there is no match with payload from paypal', async () => {
            const recommendedShippingOption = getShippingOption();
            const anotherShippingOption = {
                ...getShippingOption(),
                id: 'asdag123',
                isRecommended: false,
            };

            const consignment = {
                ...getConsignment(),
                availableShippingOptions: [recommendedShippingOption, anotherShippingOption],
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getConsignmentsOrThrow',
            ).mockReturnValue([consignment]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingOptionsChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.selectShippingOption).not.toHaveBeenCalledWith(
                paypalSelectedShippingOptionPayloadMock.id,
            );
            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalledWith(
                recommendedShippingOption.id,
            );
        });

        it('updates PayPal order', async () => {
            const consignment = getConsignment();

            // INFO: lets imagine that it is a state that we get after consignmentActionCreator.selectShippingOption call
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getConsignmentsOrThrow',
            ).mockReturnValue([consignment]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingOptionsChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.updateOrder).toHaveBeenCalledWith({
                availableShippingOptions: consignment.availableShippingOptions,
                cartId: cart.id,
                selectedShippingOption: consignment.selectedShippingOption,
            });
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
            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
                (options: PayPalCommerceButtonsOptions) => {
                    eventEmitter.on('onApprove', () => {
                        if (options.onApprove) {
                            options.onApprove(
                                { orderID: paypalOrderId },
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
        });

        it('takes order details data from paypal', async () => {
            const getOrderActionMock = jest.fn(() => paypalOrderDetails);

            jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
                (options: PayPalCommerceButtonsOptions) => {
                    eventEmitter.on('onApprove', () => {
                        if (options.onApprove) {
                            options.onApprove(
                                { orderID: paypalOrderId },
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

        it('skips consignment address update with valid customer data from order details if there are no items what should be shipped', async () => {
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

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.updateShippingAddress).not.toHaveBeenCalled();
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

            const defaultCart = getCart();
            const consignment = getConsignment();

            jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(
                defaultCart,
            );

            // INFO: lets imagine that it is a state that we get after consignmentActionCreator.updateAddress call
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getConsignmentsOrThrow',
            ).mockReturnValue([consignment]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith(address);
            expect(paymentIntegrationService.updateShippingAddress).toHaveBeenCalledWith(address);
            expect(paypalCommerceRequestSender.updateOrder).toHaveBeenCalledWith({
                availableShippingOptions: consignment.availableShippingOptions,
                cartId: cart.id,
                selectedShippingOption: consignment.selectedShippingOption,
            });
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
            const methodId = initializationOptions.methodId;
            const paymentData = {
                formattedPayload: {
                    vault_payment_instrument: null,
                    set_as_default_stored_instrument: null,
                    device_info: null,
                    method_id: methodId,
                    paypal_account: {
                        order_id: paypalOrderId,
                    },
                },
            };

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData,
            });
        });
    });

    describe('#_onComplete button callback', () => {
        it('submits payment for authorize & capture transactions', async () => {
            const updatedPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    intent: 'capture',
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(updatedPaymentMethod);

            const methodId = initializationOptions.methodId;
            const paymentData = {
                formattedPayload: {
                    vault_payment_instrument: null,
                    set_as_default_stored_instrument: null,
                    device_info: null,
                    method_id: methodId,
                    paypal_account: {
                        order_id: paypalOrderId,
                    },
                },
            };

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onComplete');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData,
            });
        });

        it('do not call submit payment for authorize only transactions', async () => {
            const updatedPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    intent: 'authorize',
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(updatedPaymentMethod);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onComplete');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
        });

        it('calls callback if its provided', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onComplete');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceInlineOptions.onComplete).toHaveBeenCalled();
        });
    });

    describe('#_onError button callback', () => {
        it('calls onError callback if its provided', async () => {
            try {
                await strategy.initialize(initializationOptions);
                eventEmitter.emit('onError');
            } catch (_) {
                expect(paypalCommerceInlineOptions.onError).toHaveBeenCalled();
            }
        });

        it('throws an error with message', async () => {
            try {
                await strategy.initialize(initializationOptions);
                eventEmitter.emit('onError');
            } catch (error) {
                expect(error.message).toBe('Error message');
            }
        });
    });
});
