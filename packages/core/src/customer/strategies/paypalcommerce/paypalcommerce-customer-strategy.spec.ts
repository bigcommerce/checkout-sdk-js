import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';
import { BillingAddressActionCreator, BillingAddressRequestSender } from '../../../billing';
import { getCart } from '../../../cart/carts.mock';

import { Cart } from '../../../cart';
import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MutationObserverFactory } from '../../../common/dom';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { OrderActionCreator, OrderRequestSender } from '../../../order';
import {
    PaymentActionCreator,
    PaymentMethod,
    PaymentMethodActionCreator,
    PaymentMethodRequestSender,
    PaymentRequestSender,
    PaymentRequestTransformer,
} from '../../../payment';
import { getPaypalCommerce } from '../../../payment/payment-methods.mock';
import {
    ButtonsOptions,
    PaypalCheckoutButtonOptions,
    PaypalCommerceRequestSender,
    PaypalCommerceScriptLoader,
    PaypalCommerceSDK,
    PayPalOrderDetails,
} from '../../../payment/strategies/paypal-commerce';
import { getPaypalCommerceMock } from '../../../payment/strategies/paypal-commerce/paypal-commerce.mock';
import { ConsignmentActionCreator, ConsignmentRequestSender } from '../../../shipping';
import {
    createSpamProtection,
    GoogleRecaptcha,
    GoogleRecaptchaScriptLoader,
    GoogleRecaptchaWindow,
    PaymentHumanVerificationHandler,
    SpamProtectionActionCreator,
    SpamProtectionRequestSender,
} from '../../../spam-protection';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../../../subscription';
import CustomerActionCreator from '../../customer-action-creator';
import { CustomerInitializeOptions } from '../../customer-request-options';
import CustomerRequestSender from '../../customer-request-sender';
import PaypalCommerceCustomerInitializeOptions from './paypalcommerce-customer-initialize-options';
import PaypalCommerceCustomerStrategy from './paypalcommerce-customer-strategy';

describe('PaypalCommerceCustomerStrategy', () => {
    let billingAddressActionCreator: BillingAddressActionCreator;
    let cartMock: Cart;
    let checkoutRequestSender: CheckoutRequestSender;
    let consignmentActionCreator: ConsignmentActionCreator;
    let customerActionCreator: CustomerActionCreator;
    let eventEmitter: EventEmitter;
    let formPoster: FormPoster;
    let googleRecaptcha: GoogleRecaptcha;
    let googleRecaptchaMockWindow: GoogleRecaptchaWindow;
    let googleRecaptchaScriptLoader: GoogleRecaptchaScriptLoader;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let paypalCommerceRequestSender: PaypalCommerceRequestSender;
    let paypalScriptLoader: PaypalCommerceScriptLoader;
    let paypalSdkMock: PaypalCommerceSDK;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: PaypalCommerceCustomerStrategy;
    let subscriptionsActionCreator: SubscriptionsActionCreator;

    const defaultContainerId = 'paypal-commerce-container-mock-id';
    const approveDataOrderId = 'ORDER_ID';

    const paypalCommerceOptions: PaypalCommerceCustomerInitializeOptions = {
        container: defaultContainerId,
        onComplete: () => {},
    };

    const methodId = 'paypalcommerce';
    const initializationOptions: CustomerInitializeOptions = {
        methodId,
        paypalcommerce: paypalCommerceOptions,
    };

    beforeEach(() => {
        cartMock = getCart();
        eventEmitter = new EventEmitter();
        paymentMethodMock = getPaypalCommerce();
        paypalSdkMock = getPaypalCommerceMock();

        store = createCheckoutStore(getCheckoutStoreState());
        requestSender = createRequestSender();
        formPoster = createFormPoster();

        googleRecaptchaMockWindow = { grecaptcha: {} } as GoogleRecaptchaWindow;
        googleRecaptchaScriptLoader = new GoogleRecaptchaScriptLoader(
            createScriptLoader(),
            googleRecaptchaMockWindow,
        );
        googleRecaptcha = new GoogleRecaptcha(
            googleRecaptchaScriptLoader,
            new MutationObserverFactory(),
        );

        customerActionCreator = new CustomerActionCreator(
            new CustomerRequestSender(createRequestSender()),
            new CheckoutActionCreator(
                new CheckoutRequestSender(createRequestSender()),
                new ConfigActionCreator(new ConfigRequestSender(createRequestSender())),
                new FormFieldsActionCreator(new FormFieldsRequestSender(createRequestSender())),
            ),
            new SpamProtectionActionCreator(
                googleRecaptcha,
                new SpamProtectionRequestSender(createRequestSender()),
            ),
        );
        paypalCommerceRequestSender = new PaypalCommerceRequestSender(requestSender);
        paypalScriptLoader = new PaypalCommerceScriptLoader(getScriptLoader());
        checkoutRequestSender = new CheckoutRequestSender(requestSender);
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
        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(requestSender),
            new CheckoutValidator(checkoutRequestSender),
        );
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(requestSender),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())),
        );
        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(createRequestSender()),
        );

        strategy = new PaypalCommerceCustomerStrategy(
            store,
            customerActionCreator,
            formPoster,
            paypalScriptLoader,
            paypalCommerceRequestSender,
            consignmentActionCreator,
            billingAddressActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            orderActionCreator,
        );

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockResolvedValue(
            store.getState(),
        );
        jest.spyOn(paypalScriptLoader, 'getPayPalSDK').mockReturnValue(paypalSdkMock);
        jest.spyOn(formPoster, 'postForm').mockImplementation(() => {});
        jest.spyOn(billingAddressActionCreator, 'updateAddress').mockReturnValue(true);
        jest.spyOn(consignmentActionCreator, 'loadShippingOptions').mockReturnValue(true);
        jest.spyOn(consignmentActionCreator, 'selectShippingOption').mockReturnValue(true);
        jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(true);
        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(true);
        jest.spyOn(paypalCommerceRequestSender, 'updateOrder').mockReturnValue(true);

        jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation((options: ButtonsOptions) => {
            eventEmitter.on('createOrder', () => {
                if (options.createOrder) {
                    options.createOrder().catch(() => {});
                }
            });

            eventEmitter.on('onApprove', () => {
                if (options.onApprove) {
                    options.onApprove({ orderID: approveDataOrderId });
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
        });
    });

    it('creates an interface of the PayPal Commerce customer strategy', () => {
        expect(strategy).toBeInstanceOf(PaypalCommerceCustomerStrategy);
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

        it('throws an error if paypalcommerce.container is not provided', async () => {
            const options = {
                methodId,
                paypalcommerce: {},
            } as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('loads paypalcommerce payment method', async () => {
            await strategy.initialize(initializationOptions);

            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith(methodId);
        });

        it('loads paypal sdk with provided params', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalScriptLoader.getPayPalSDK).toHaveBeenCalledWith(
                paymentMethodMock,
                cartMock.currency.code,
            );
        });

        it('throws an error if onComplete method is not provided for hosted checkout feature', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                ...paymentMethodMock,
                initializationData: {
                    ...paymentMethodMock.initializationData,
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

            expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdkMock.FUNDING.PAYPAL,
                style: { height: 40 },
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
            });
        });

        it('initializes paypal commerce sdk buttons for hosted checkout feature', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                ...paymentMethodMock,
                initializationData: {
                    ...paymentMethodMock.initializationData,
                    isHostedCheckoutEnabled: true,
                },
            });

            await strategy.initialize(initializationOptions);

            expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalSdkMock.FUNDING.PAYPAL,
                style: { height: 40 },
                createOrder: expect.any(Function),
                onShippingAddressChange: expect.any(Function),
                onShippingOptionsChange: expect.any(Function),
                onApprove: expect.any(Function),
            });
        });

        it('renders PayPal button if it is eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(() => ({
                isEligible: jest.fn(() => true),
                render: paypalCommerceSdkRenderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).toHaveBeenCalled();
        });

        it('does not render PayPal button if it is not eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(() => ({
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
                cartId: cartMock.id,
            });
        });
    });

    describe('#_onApprove button callback for default flow', () => {
        it('throws an error if orderId is not provided by PayPal', async () => {
            jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation((options: ButtonsOptions) => {
                eventEmitter.on('createOrder', () => {
                    if (options.createOrder) {
                        options.createOrder().catch(() => {});
                    }
                });

                eventEmitter.on('onApprove', () => {
                    if (options.onApprove) {
                        options.onApprove({ orderID: '' });
                    }
                });

                return {
                    isEligible: jest.fn(() => true),
                    render: jest.fn(),
                };
            });

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
                    provider: paymentMethodMock.id,
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
            jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(
                (options: PaypalCheckoutButtonOptions) => {
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

            const paymentMethod = {
                ...paymentMethodMock,
                initializationData: {
                    ...paymentMethodMock.initializationData,
                    isHostedCheckoutEnabled: true,
                },
            };

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                paymentMethod,
            );
        });

        it('takes order details data from paypal', async () => {
            const getOrderActionMock = jest.fn(() => paypalOrderDetails);

            jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(
                (options: PaypalCheckoutButtonOptions) => {
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
                        order_id: approveDataOrderId,
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

    describe('#_onShippingAddressChange button callback (hosted checkout flow)', () => {
        beforeEach(() => {
            const paymentMethod = {
                ...paymentMethodMock,
                initializationData: {
                    ...paymentMethodMock.initializationData,
                    isHostedCheckoutEnabled: true,
                },
            };

            jest.spyOn(consignmentActionCreator, 'updateAddress').mockReturnValue(
                Promise.resolve(),
            );
            jest.spyOn(consignmentActionCreator, 'selectShippingOption').mockReturnValue(
                Promise.resolve(),
            );
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                paymentMethod,
            );
        });

        it('calls billingAddressActionCreator.updateAddress', async () => {
            await strategy.initialize(initializationOptions);
            eventEmitter.emit('onClick');
            await new Promise((resolve) => process.nextTick(resolve));
            eventEmitter.emit('onShippingAddressChange');
            await new Promise((resolve) => process.nextTick(resolve));

            expect(billingAddressActionCreator.updateAddress).toHaveBeenCalled();
        });

        it('calls consignmentActionCreator.updateAddress', async () => {
            await strategy.initialize(initializationOptions);
            eventEmitter.emit('onClick');
            await new Promise((resolve) => process.nextTick(resolve));
            eventEmitter.emit('onShippingAddressChange');
            await new Promise((resolve) => process.nextTick(resolve));

            expect(consignmentActionCreator.updateAddress).toHaveBeenCalled();
        });

        it('calls consignmentActionCreator.selectShippingOption', async () => {
            await strategy.initialize(initializationOptions);
            eventEmitter.emit('onClick');
            await new Promise((resolve) => process.nextTick(resolve));
            eventEmitter.emit('onShippingAddressChange');
            await new Promise((resolve) => process.nextTick(resolve));

            expect(consignmentActionCreator.selectShippingOption).toHaveBeenCalled();
        });

        it('calls updateOrder', async () => {
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
            const paymentMethod = {
                ...paymentMethodMock,
                initializationData: {
                    ...paymentMethodMock.initializationData,
                    isHostedCheckoutEnabled: true,
                },
            };

            jest.spyOn(consignmentActionCreator, 'updateAddress').mockReturnValue(
                Promise.resolve(),
            );
            jest.spyOn(consignmentActionCreator, 'selectShippingOption').mockReturnValue(
                Promise.resolve(),
            );
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                paymentMethod,
            );
        });

        it('calls consignmentActionCreator.selectShippingOption', async () => {
            await strategy.initialize(initializationOptions);
            eventEmitter.emit('onClick');
            await new Promise((resolve) => process.nextTick(resolve));
            eventEmitter.emit('onShippingOptionsChange');
            await new Promise((resolve) => process.nextTick(resolve));

            expect(consignmentActionCreator.selectShippingOption).toHaveBeenCalled();
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
});
