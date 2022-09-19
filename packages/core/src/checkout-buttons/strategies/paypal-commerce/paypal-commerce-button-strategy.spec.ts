import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, getScriptLoader } from "@bigcommerce/script-loader";
import { EventEmitter } from 'events';

import { Cart } from '../../../cart';
import { getCart } from '../../../cart/carts.mock';
import { BillingAddressActionCreator, BillingAddressRequestSender } from '../../../billing';
import { ConsignmentActionCreator, ConsignmentRequestSender } from '../../../shipping';
import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
    createCheckoutStore
} from "../../../checkout";
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError } from "../../../common/error/errors";
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { PaymentActionCreator, PaymentMethod, PaymentRequestSender, PaymentRequestTransformer } from "../../../payment";
import { getPaypalCommerce } from '../../../payment/payment-methods.mock';
import { PaypalHostWindow } from '../../../payment/strategies/paypal';
import {
    ButtonsOptions,
    ButtonsOptions1, PayPalAddress,
    PaypalCommerceRequestSender,
    PaypalCommerceScriptLoader,
    PaypalCommerceSDK, PayPalSelectedShippingOption
} from "../../../payment/strategies/paypal-commerce";
import { getPaypalCommerceMock } from '../../../payment/strategies/paypal-commerce/paypal-commerce.mock';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonMethodType from '../checkout-button-method-type';
import { PaypalCommerceButtonInitializeOptions } from './paypal-commerce-button-options';
import PaypalCommerceButtonStrategy from './paypal-commerce-button-strategy';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from "../../../subscription";
import { createSpamProtection, PaymentHumanVerificationHandler } from "../../../spam-protection";
import { OrderActionCreator, OrderRequestSender } from "../../../order";

describe('PaypalCommerceButtonStrategy', () => {
    let cartMock: Cart;
    let checkoutActionCreator: CheckoutActionCreator;
    let checkoutValidator: CheckoutValidator;
    let billingAddressActionCreator: BillingAddressActionCreator;
    let consignmentActionCreator: ConsignmentActionCreator;
    let checkoutRequestSender: CheckoutRequestSender;
    let eventEmitter: EventEmitter;
    let formPoster: FormPoster;
    let requestSender: RequestSender;
    let paymentMethodMock: PaymentMethod;
    let paymentRequestSender: PaymentRequestSender;
    let paypalCommerceRequestSender: PaypalCommerceRequestSender;
    let paypalScriptLoader: PaypalCommerceScriptLoader;
    let store: CheckoutStore;
    let strategy: PaypalCommerceButtonStrategy;
    let paypalSdkMock: PaypalCommerceSDK;
    let paypalButtonElement: HTMLDivElement;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentHumanVerificationHandler: PaymentHumanVerificationHandler;
    let subscriptionsActionCreator: SubscriptionsActionCreator;

    const defaultButtonContainerId = 'paypal-commerce-button-mock-id';
    const approveDataOrderId = 'ORDER_ID';
    const paypalShippingAddressPayloadMock: PayPalAddress = {
        city: "San Jose",
        state: "CA",
        country_code: "US",
        postal_code: "95131",
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

    const paypalCommerceOptions: PaypalCommerceButtonInitializeOptions = {
        initializesOnCheckoutPage: false,
        style: {
            color: undefined,
            height: 45,
            label: undefined,
            layout: undefined,
            shape: undefined
        },
    };

    const initializationOptions: CheckoutButtonInitializeOptions = {
        methodId: CheckoutButtonMethodType.PAYPALCOMMERCE,
        containerId: defaultButtonContainerId,
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
        paypalCommerceRequestSender = new PaypalCommerceRequestSender(requestSender);
        paypalScriptLoader = new PaypalCommerceScriptLoader(getScriptLoader());

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender))
        );
        checkoutRequestSender = new CheckoutRequestSender(requestSender);
        consignmentActionCreator = new ConsignmentActionCreator(new ConsignmentRequestSender(requestSender), checkoutRequestSender);
        subscriptionsActionCreator = new SubscriptionsActionCreator(new SubscriptionsRequestSender(requestSender));
        billingAddressActionCreator = new BillingAddressActionCreator(new BillingAddressRequestSender(requestSender), subscriptionsActionCreator);
        paymentRequestSender = new PaymentRequestSender(requestSender);
        paymentHumanVerificationHandler = new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()));
        checkoutValidator = new CheckoutValidator(checkoutRequestSender);
        orderActionCreator = new OrderActionCreator(new OrderRequestSender(requestSender), checkoutValidator);
        paymentActionCreator = new PaymentActionCreator(paymentRequestSender, orderActionCreator, new PaymentRequestTransformer(), paymentHumanVerificationHandler);

        strategy = new PaypalCommerceButtonStrategy(
            store,
            checkoutActionCreator,
            formPoster,
            paypalScriptLoader,
            paypalCommerceRequestSender,
            consignmentActionCreator,
            billingAddressActionCreator,
            paymentActionCreator,
            orderActionCreator
        );

        paypalButtonElement = document.createElement('div');
        paypalButtonElement.id = defaultButtonContainerId;
        document.body.appendChild(paypalButtonElement);

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(paymentMethodMock);
        jest.spyOn(paypalScriptLoader, 'getPayPalSDK').mockReturnValue(paypalSdkMock);
        jest.spyOn(formPoster, 'postForm').mockImplementation(() => {});


        jest.spyOn(paypalSdkMock, 'Buttons')
            .mockImplementation((options: ButtonsOptions1) => {
                eventEmitter.on('createOrder', () => {
                    if (options.createOrder) {
                        options.createOrder().catch(() => {});
                    }
                });

                eventEmitter.on('onApprove', () => {
                    if (options.onApprove) {
                        options.onApprove({ orderID: approveDataOrderId },);
                    }
                });

                eventEmitter.on('onShippingAddressChange', () => {
                    if (options.onShippingAddressChange) {
                        options.onShippingAddressChange({
                            orderId: approveDataOrderId,
                            shippingAddress: paypalShippingAddressPayloadMock,
                        });
                    }
                });

                eventEmitter.on('onShippingOptionsChange', () => {
                    if (options.onShippingOptionsChange) {
                        options.onShippingOptionsChange({
                            orderId: approveDataOrderId,
                            selectedShippingOption: paypalSelectedShippingOptionPayloadMock,
                        });
                    }
                });

                return {
                    isEligible: jest.fn(() => true),
                    render: jest.fn(),
                };
            });
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as PaypalHostWindow).paypal;

        if (document.getElementById(defaultButtonContainerId)) {
            document.body.removeChild(paypalButtonElement);
        }
    });

    it('creates an instance of the PayPal Commerce checkout button strategy', () => {
        expect(strategy).toBeInstanceOf(PaypalCommerceButtonStrategy);
    });

    describe('#initialize()', () => {
        it('throws error if methodId is not provided', async () => {
            const options = { containerId: defaultButtonContainerId } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if containerId is not provided', async () => {
            const options = { methodId: CheckoutButtonMethodType.PAYPALCOMMERCE } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommerce is not provided', async () => {
            const options = {
                containerId: defaultButtonContainerId,
                methodId: CheckoutButtonMethodType.PAYPALCOMMERCE,
            } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('loads paypal commerce sdk script', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalScriptLoader.getPayPalSDK).toHaveBeenCalled();
        });

        // it('initializes PayPal button to render', async () => {
        //     await strategy.initialize(initializationOptions);
        //
        //     expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
        //         fundingSource: paypalSdkMock.FUNDING.PAYPAL,
        //         style: paypalCommerceOptions.style,
        //         createOrder: expect.any(Function),
        //         onApprove: expect.any(Function),
        //         onComplete: expect.any(Function),
        //         onShippingAddressChange: expect.any(Function),
        //         onShippingOptionsChange: expect.any(Function),
        //     });
        // });

        it('renders PayPal button if it is eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdkMock, 'Buttons')
                .mockImplementation(() => ({
                    isEligible: jest.fn(() => true),
                    render: paypalCommerceSdkRenderMock,
                }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).toHaveBeenCalled();
        });

        it('does not render PayPal button if it is not eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdkMock, 'Buttons')
                .mockImplementation(() => ({
                    isEligible: jest.fn(() => false),
                    render: paypalCommerceSdkRenderMock,
                }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).not.toHaveBeenCalled();
        });

        it('removes PayPal button container if the button has not rendered', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdkMock, 'Buttons')
                .mockImplementation(() => ({
                    isEligible: jest.fn(() => false),
                    render: paypalCommerceSdkRenderMock,
                }));

            await strategy.initialize(initializationOptions);

            expect(document.getElementById(defaultButtonContainerId)).toBeNull();
        });

        it('creates an order with paypalcommerce as provider id if its initializes outside checkout page', async () => {
            jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('');

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise(resolve => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(cartMock.id, 'paypalcommerce');
        });

        it('creates an order with paypalcommercecheckout as provider id if its initializes on checkout page', async () => {
            jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('');

            const updatedIntializationOptions = {
                ...initializationOptions,
                paypalcommerce: {
                    ...initializationOptions.paypalcommerce,
                    initializesOnCheckoutPage: true,
                },
            };

            await strategy.initialize(updatedIntializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise(resolve => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(cartMock.id, 'paypalcommercecheckout');
        });

        it('tokenizes payment on paypal approve', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');

            await new Promise(resolve => process.nextTick(resolve));

            expect(formPoster.postForm).toHaveBeenCalledWith('/checkout.php', expect.objectContaining({
                action: 'set_external_checkout',
                order_id: approveDataOrderId,
                payment_type: 'paypal',
                provider: paymentMethodMock.id,
            }));
        });
    });
});
