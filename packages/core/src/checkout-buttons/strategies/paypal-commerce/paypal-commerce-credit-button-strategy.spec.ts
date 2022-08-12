import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';

import { Cart } from '../../../cart';
import { getCart } from '../../../cart/carts.mock';
import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore, createCheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { PaymentMethod } from '../../../payment';
import { getPaypalCommerce } from '../../../payment/payment-methods.mock';
import { PaypalHostWindow } from '../../../payment/strategies/paypal';
import { ButtonsOptions, PaypalCommerceRequestSender, PaypalCommerceScriptLoader, PaypalCommerceSDK } from '../../../payment/strategies/paypal-commerce';
import { getPaypalCommerceMock } from '../../../payment/strategies/paypal-commerce/paypal-commerce.mock';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonMethodType from '../checkout-button-method-type';
import { PaypalCommerceCreditButtonInitializeOptions } from './paypal-commerce-credit-button-options';
import PaypalCommerceCreditButtonStrategy from './paypal-commerce-credit-button-strategy';

describe('PaypalCommerceCreditButtonStrategy', () => {
    let cartMock: Cart;
    let checkoutActionCreator: CheckoutActionCreator;
    let eventEmitter: EventEmitter;
    let formPoster: FormPoster;
    let requestSender: RequestSender;
    let paymentMethodMock: PaymentMethod;
    let paypalCommerceRequestSender: PaypalCommerceRequestSender;
    let paypalScriptLoader: PaypalCommerceScriptLoader;
    let store: CheckoutStore;
    let strategy: PaypalCommerceCreditButtonStrategy;
    let paypalSdkMock: PaypalCommerceSDK;
    let paypalCommerceCreditButtonElement: HTMLDivElement;
    let paypalCommerceCreditMessageElement: HTMLDivElement;

    const defaultButtonContainerId = 'paypal-commerce-credit-button-mock-id';
    const defaultMessageContainerId = 'paypal-commerce-credit-message-mock-id';
    const approveDataOrderId = 'ORDER_ID';

    const paypalCommerceCreditOptions: PaypalCommerceCreditButtonInitializeOptions = {
        initializesOnCheckoutPage: false,
        messagingContainerId: defaultMessageContainerId,
        style: {
            height: 45,
        },
    };

    const initializationOptions: CheckoutButtonInitializeOptions = {
        methodId: CheckoutButtonMethodType.PAYPALCOMMERCE_CREDIT,
        containerId: defaultButtonContainerId,
        paypalcommercecredit: paypalCommerceCreditOptions,
    };

    beforeEach(() => {
        cartMock = getCart();
        eventEmitter = new EventEmitter();
        paymentMethodMock = { ...getPaypalCommerce(), id: 'paypalcommercecredit' };
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

        strategy = new PaypalCommerceCreditButtonStrategy(
            store,
            checkoutActionCreator,
            formPoster,
            paypalScriptLoader,
            paypalCommerceRequestSender,
        );

        paypalCommerceCreditButtonElement = document.createElement('div');
        paypalCommerceCreditButtonElement.id = defaultButtonContainerId;
        document.body.appendChild(paypalCommerceCreditButtonElement);

        paypalCommerceCreditMessageElement = document.createElement('div');
        paypalCommerceCreditMessageElement.id = defaultMessageContainerId;
        document.body.appendChild(paypalCommerceCreditMessageElement);

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(paymentMethodMock);
        jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(cartMock);

        jest.spyOn(paypalScriptLoader, 'loadPaypalCommerce').mockReturnValue(paypalSdkMock);
        jest.spyOn(formPoster, 'postForm').mockImplementation(() => {});

        jest.spyOn(paypalSdkMock, 'isFundingEligible').mockImplementation(() => true);
        jest.spyOn(paypalSdkMock, 'Buttons')
            .mockImplementation((options: ButtonsOptions) => {
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

                return {
                    render: jest.fn(),
                };
            });

        jest.spyOn(paypalSdkMock, 'Messages')
            .mockImplementation(() => ({
                render: jest.fn(),
            }));
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as PaypalHostWindow).paypal;

        if (document.getElementById(defaultButtonContainerId)) {
            document.body.removeChild(paypalCommerceCreditButtonElement);
        }

        if (document.getElementById(defaultMessageContainerId)) {
            document.body.removeChild(paypalCommerceCreditMessageElement);
        }
    });

    it('creates an instance of the PayPal Commerce Credit checkout button strategy', () => {
        expect(strategy).toBeInstanceOf(PaypalCommerceCreditButtonStrategy);
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
            const options = { methodId: CheckoutButtonMethodType.PAYPALCOMMERCE_CREDIT } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommercecredit is not provided', async () => {
            const options = {
                containerId: defaultButtonContainerId,
                methodId: CheckoutButtonMethodType.PAYPALCOMMERCE_CREDIT,
            } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('loads paypal commerce sdk script', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalScriptLoader.loadPaypalCommerce).toHaveBeenCalled();
        });

        describe('PayPal Commerce Credit buttons logic', () => {
            it('initializes PayPal PayLater button to render', async () => {
                await strategy.initialize(initializationOptions);

                expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
                    fundingSource: paypalSdkMock.FUNDING.PAYLATER,
                    style: paypalCommerceCreditOptions.style,
                    createOrder: expect.any(Function),
                    onApprove: expect.any(Function)
                });
            });

            it('initializes PayPal Credit button to render', async () => {
                jest.spyOn(paypalSdkMock, 'isFundingEligible')
                    .mockImplementation((fundingSource: string) => {
                        return fundingSource === 'credit';
                    })

                await strategy.initialize(initializationOptions);

                expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
                    fundingSource: paypalSdkMock.FUNDING.CREDIT,
                    style: paypalCommerceCreditOptions.style,
                    createOrder: expect.any(Function),
                    onApprove: expect.any(Function)
                });
            });

            it('renders PayPal button', async () => {
                const paypalCommerceSdkRenderMock = jest.fn();

                jest.spyOn(paypalSdkMock, 'Buttons')
                    .mockImplementation(() => ({
                        render: paypalCommerceSdkRenderMock,
                    }));

                await strategy.initialize(initializationOptions);

                expect(paypalCommerceSdkRenderMock).toHaveBeenCalledWith(`#${defaultButtonContainerId}`);
            });

            it('removes PayPal Commerce Credit button container if the funding sources are not eligible', async () => {
                const paypalCommerceSdkRenderMock = jest.fn();

                jest.spyOn(paypalSdkMock, 'isFundingEligible')
                    .mockImplementation(() => false);

                jest.spyOn(paypalSdkMock, 'Buttons')
                    .mockImplementation(() => ({
                        render: paypalCommerceSdkRenderMock,
                    }));

                await strategy.initialize(initializationOptions);

                expect(document.getElementById(defaultButtonContainerId)).toBeNull();
            });

            it('creates an order with paypalcommercecredit as provider id if its initializes outside checkout page', async () => {
                jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('');

                await strategy.initialize(initializationOptions);

                eventEmitter.emit('createOrder');

                await new Promise(resolve => process.nextTick(resolve));

                expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(cartMock.id, 'paypalcommercecredit');
            });

            it('creates an order with paypalcommercecreditcheckout as provider id if its initializes on checkout page', async () => {
                jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('');

                const updatedIntializationOptions = {
                    ...initializationOptions,
                    paypalcommercecredit: {
                        ...initializationOptions.paypalcommercecredit,
                        initializesOnCheckoutPage: true,
                    },
                };

                await strategy.initialize(updatedIntializationOptions);

                eventEmitter.emit('createOrder');

                await new Promise(resolve => process.nextTick(resolve));

                expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(cartMock.id, 'paypalcommercecreditcheckout');
            });

            it('throws an error if orderId is not provided by PayPal on approve', async () => {
                jest.spyOn(paypalSdkMock, 'Buttons')
                    .mockImplementation((options: ButtonsOptions) => {
                        eventEmitter.on('createOrder', () => {
                            if (options.createOrder) {
                                options.createOrder().catch(() => {});
                            }
                        });

                        eventEmitter.on('onApprove', () => {
                            if (options.onApprove) {
                                options.onApprove({ orderID: undefined });
                            }
                        });

                        return {
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

        describe('PayPal Commerce Credit messages logic', () => {
            it('initializes PayPal Messages component', async () => {
                await strategy.initialize(initializationOptions);

                expect(paypalSdkMock.Messages).toHaveBeenCalledWith({
                    amount: cartMock.cartAmount,
                    placement: 'cart',
                    style: {
                        layout: 'text',
                    },
                });
            });

            it('renders PayPal message', async () => {
                const paypalCommerceSdkRenderMock = jest.fn();

                jest.spyOn(paypalSdkMock, 'Messages')
                    .mockImplementation(() => ({
                        render: paypalCommerceSdkRenderMock,
                    }));

                await strategy.initialize(initializationOptions);

                expect(paypalCommerceSdkRenderMock).toHaveBeenCalledWith(`#${defaultMessageContainerId}`);
            });
        });
    });
});
