import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../../../billing';
import { Cart } from '../../../cart';
import { getCart } from '../../../cart/carts.mock';
import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { OrderActionCreator, OrderRequestSender } from '../../../order';
import {
    PaymentActionCreator,
    PaymentMethod,
    PaymentRequestSender,
    PaymentRequestTransformer,
} from '../../../payment';
import { PaymentMethodClientUnavailableError } from '../../../payment/errors';
import { getPaypalCommerce } from '../../../payment/payment-methods.mock';
import { PaypalHostWindow } from '../../../payment/strategies/paypal';
import {
    PayPalAddress,
    PaypalCheckoutButtonOptions,
    PaypalCommerceRequestSender,
    PaypalCommerceScriptLoader,
    PaypalCommerceSDK,
    PayPalOrderDetails,
    PayPalSelectedShippingOption,
} from '../../../payment/strategies/paypal-commerce';
import { getPaypalCommerceMock } from '../../../payment/strategies/paypal-commerce/paypal-commerce.mock';
import { ConsignmentActionCreator, ConsignmentRequestSender } from '../../../shipping';
import { getConsignment } from '../../../shipping/consignments.mock';
import { getShippingOption } from '../../../shipping/shipping-options.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../../../subscription';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonMethodType from '../checkout-button-method-type';

import { PaypalCommerceInlineCheckoutButtonInitializeOptions } from './paypal-commerce-inline-checkout-button-options';
import PaypalCommerceInlineCheckoutButtonStrategy from './paypal-commerce-inline-checkout-button-strategy';

describe('PaypalCommerceInlineCheckoutButtonStrategy', () => {
    let billingAddressActionCreator: BillingAddressActionCreator;
    let cartMock: Cart;
    let checkoutActionCreator: CheckoutActionCreator;
    let checkoutRequestSender: CheckoutRequestSender;
    let checkoutValidator: CheckoutValidator;
    let consignmentActionCreator: ConsignmentActionCreator;
    let eventEmitter: EventEmitter;
    let formPoster: FormPoster;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentHumanVerificationHandler: PaymentHumanVerificationHandler;
    let paymentMethodMock: PaymentMethod;
    let paymentRequestSender: PaymentRequestSender;
    let paypalCommerceRequestSender: PaypalCommerceRequestSender;
    let paypalScriptLoader: PaypalCommerceScriptLoader;
    let paypalSdkMock: PaypalCommerceSDK;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: PaypalCommerceInlineCheckoutButtonStrategy;
    let subscriptionsActionCreator: SubscriptionsActionCreator;

    const containerId = 'paypalAcceleratedCheckoutContainerIdMock';
    const buttonContainerId = `${containerId}-paypal-accelerated-checkout-button`;

    const paypalOrderId = 'ORDER_ID';

    const paypalCommerceButtonStyle = {
        custom: {
            label: 'Checkout',
            css: {
                color: 'white',
            },
        },
    };

    const paypalCommerceInlineOptions: PaypalCommerceInlineCheckoutButtonInitializeOptions = {
        onComplete: jest.fn(),
        onError: jest.fn(),
        style: paypalCommerceButtonStyle,
    };

    const initializationOptions: CheckoutButtonInitializeOptions = {
        methodId: CheckoutButtonMethodType.PAYPALCOMMERCE_INLINE,
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
        cartMock = getCart();
        eventEmitter = new EventEmitter();
        paymentMethodMock = { ...getPaypalCommerce(), id: 'paypalcommerceinline' };
        paypalSdkMock = getPaypalCommerceMock();
        store = createCheckoutStore(getCheckoutStoreState());
        requestSender = createRequestSender();
        formPoster = createFormPoster();

        paypalCommerceRequestSender = new PaypalCommerceRequestSender(requestSender);
        paypalScriptLoader = new PaypalCommerceScriptLoader(getScriptLoader());
        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
        );
        checkoutRequestSender = new CheckoutRequestSender(requestSender);
        checkoutValidator = new CheckoutValidator(checkoutRequestSender);
        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(requestSender),
            checkoutValidator,
        );
        consignmentActionCreator = new ConsignmentActionCreator(
            new ConsignmentRequestSender(requestSender),
            checkoutRequestSender,
        );
        subscriptionsActionCreator = new SubscriptionsActionCreator(
            new SubscriptionsRequestSender(requestSender),
        );
        billingAddressActionCreator = new BillingAddressActionCreator(
            new BillingAddressRequestSender(requestSender),
            subscriptionsActionCreator,
        );
        paymentRequestSender = new PaymentRequestSender(requestSender);
        paymentHumanVerificationHandler = new PaymentHumanVerificationHandler(
            createSpamProtection(createScriptLoader()),
        );
        paymentActionCreator = new PaymentActionCreator(
            paymentRequestSender,
            orderActionCreator,
            new PaymentRequestTransformer(),
            paymentHumanVerificationHandler,
        );

        strategy = new PaypalCommerceInlineCheckoutButtonStrategy(
            store,
            checkoutActionCreator,
            paypalScriptLoader,
            paypalCommerceRequestSender,
            orderActionCreator,
            consignmentActionCreator,
            billingAddressActionCreator,
            paymentActionCreator,
        );

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(cartMock);
        jest.spyOn(store.getState().consignments, 'getConsignmentsOrThrow').mockReturnValue([
            getConsignment(),
        ]);
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );

        jest.spyOn(billingAddressActionCreator, 'updateAddress').mockReturnValue(true);
        jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout').mockReturnValue(true);
        jest.spyOn(consignmentActionCreator, 'loadShippingOptions').mockReturnValue(true);
        jest.spyOn(consignmentActionCreator, 'selectShippingOption').mockReturnValue(true);
        jest.spyOn(consignmentActionCreator, 'updateAddress').mockReturnValue(true);
        jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(true);
        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(true);
        jest.spyOn(paypalCommerceRequestSender, 'updateOrder').mockReturnValue(true);

        jest.spyOn(paypalScriptLoader, 'getPayPalSDK').mockReturnValue(paypalSdkMock);
        jest.spyOn(formPoster, 'postForm').mockImplementation(() => {});

        jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(
            (options: PaypalCheckoutButtonOptions) => {
                eventEmitter.on('createOrder', () => {
                    if (options.createOrder) {
                        options.createOrder().catch(() => {});
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
                    render: jest.fn(),
                    isEligible: jest.fn(() => true),
                };
            },
        );
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as PaypalHostWindow).paypal;
    });

    it('creates an instance of the PaypalCommerceInlineCheckoutButtonStrategy', () => {
        expect(strategy).toBeInstanceOf(PaypalCommerceInlineCheckoutButtonStrategy);
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
                methodId: CheckoutButtonMethodType.PAYPALCOMMERCE_INLINE,
            } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommerceinline option is not provided', async () => {
            const options = {
                methodId: CheckoutButtonMethodType.PAYPALCOMMERCE_INLINE,
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

            expect(checkoutActionCreator.loadDefaultCheckout).toHaveBeenCalled();
        });

        it('loads paypal commerce sdk script', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalScriptLoader.getPayPalSDK).toHaveBeenCalled();
        });

        it('throws an error if paypal sdk is not loaded', async () => {
            jest.spyOn(paypalScriptLoader, 'getPayPalSDK').mockReturnValue(undefined);

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

            expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
                experience: 'accelerated',
                fundingSource: paypalSdkMock.FUNDING.CARD,
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

            jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(() => ({
                render: paypalCommerceSdkRenderMock,
                isEligible: jest.fn(() => true),
            }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).toHaveBeenCalledWith(`#${buttonContainerId}`);
        });

        it('does not render PayPal button container if PayPal button is not eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(() => ({
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
                    cartId: cartMock.id,
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

            expect(billingAddressActionCreator.updateAddress).toHaveBeenCalledWith(providedAddress);
            expect(consignmentActionCreator.updateAddress).toHaveBeenCalledWith(providedAddress);
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

            jest.spyOn(store.getState().consignments, 'getConsignmentsOrThrow')
                .mockReturnValueOnce([consignment])
                .mockReturnValue([updatedConsignment]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingAddressChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(consignmentActionCreator.selectShippingOption).toHaveBeenCalledWith(
                recommendedShippingOption.id,
            );
        });

        it('updates PayPal order', async () => {
            const consignment = getConsignment();

            // INFO: lets imagine that it is a state that we get after consignmentActionCreator.selectShippingOption call
            jest.spyOn(store.getState().consignments, 'getConsignmentsOrThrow').mockReturnValue([
                consignment,
            ]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingAddressChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.updateOrder).toHaveBeenCalledWith({
                availableShippingOptions: consignment.availableShippingOptions,
                cartId: cartMock.id,
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

            jest.spyOn(store.getState().consignments, 'getConsignmentsOrThrow').mockReturnValue([
                consignment,
            ]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingOptionsChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(consignmentActionCreator.selectShippingOption).toHaveBeenCalledWith(
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

            jest.spyOn(store.getState().consignments, 'getConsignmentsOrThrow').mockReturnValue([
                consignment,
            ]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingOptionsChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(consignmentActionCreator.selectShippingOption).not.toHaveBeenCalledWith(
                paypalSelectedShippingOptionPayloadMock.id,
            );
            expect(consignmentActionCreator.selectShippingOption).toHaveBeenCalledWith(
                recommendedShippingOption.id,
            );
        });

        it('updates PayPal order', async () => {
            const consignment = getConsignment();

            // INFO: lets imagine that it is a state that we get after consignmentActionCreator.selectShippingOption call
            jest.spyOn(store.getState().consignments, 'getConsignmentsOrThrow').mockReturnValue([
                consignment,
            ]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onShippingOptionsChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.updateOrder).toHaveBeenCalledWith({
                availableShippingOptions: consignment.availableShippingOptions,
                cartId: cartMock.id,
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
            jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(
                (options: PaypalCheckoutButtonOptions) => {
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

            jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(
                (options: PaypalCheckoutButtonOptions) => {
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

            jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(
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

            expect(billingAddressActionCreator.updateAddress).toHaveBeenCalledWith(address);
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

            jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(
                cartWithoutShipping,
            );

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(consignmentActionCreator.updateAddress).not.toHaveBeenCalled();
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

            const consignment = getConsignment();

            // INFO: lets imagine that it is a state that we get after consignmentActionCreator.updateAddress call
            jest.spyOn(store.getState().consignments, 'getConsignmentsOrThrow').mockReturnValue([
                consignment,
            ]);

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(billingAddressActionCreator.updateAddress).toHaveBeenCalledWith(address);
            expect(consignmentActionCreator.updateAddress).toHaveBeenCalledWith(address);
            expect(paypalCommerceRequestSender.updateOrder).toHaveBeenCalledWith({
                availableShippingOptions: consignment.availableShippingOptions,
                cartId: cartMock.id,
                selectedShippingOption: consignment.selectedShippingOption,
            });
        });

        it('submits BC order with provided methodId', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(
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

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData,
            });
        });
    });

    describe('#_onComplete button callback', () => {
        it('submits payment for authorize & capture transactions', async () => {
            const paymentMethod = {
                ...paymentMethodMock,
                initializationData: {
                    ...paymentMethodMock.initializationData,
                    intent: 'capture',
                },
            };

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                paymentMethod,
            );

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

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData,
            });
        });

        it('do not call submit payment for authorize only transactions', async () => {
            const paymentMethod = {
                ...paymentMethodMock,
                initializationData: {
                    ...paymentMethodMock.initializationData,
                    intent: 'authorize',
                },
            };

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                paymentMethod,
            );

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onComplete');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
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
