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
import { PaypalCommerceAlternativeMethodsButtonOptions } from './paypal-commerce-alternative-methods-button-options';
import PaypalCommerceAlternativeMethodsButtonStrategy from './paypal-commerce-alternative-methods-button-strategy';

describe('PaypalCommerceAlternativeMethodsButtonStrategy', () => {
    let cartMock: Cart;
    let checkoutActionCreator: CheckoutActionCreator;
    let eventEmitter: EventEmitter;
    let formPoster: FormPoster;
    let requestSender: RequestSender;
    let paymentMethodMock: PaymentMethod;
    let paypalCommerceRequestSender: PaypalCommerceRequestSender;
    let paypalScriptLoader: PaypalCommerceScriptLoader;
    let store: CheckoutStore;
    let strategy: PaypalCommerceAlternativeMethodsButtonStrategy;
    let paypalSdkMock: PaypalCommerceSDK;
    let paypalCommerceAlternativeMethodsButtonElement: HTMLDivElement;

    const defaultButtonContainerId = 'paypal-commerce-alternative-methods-button-mock-id';
    const approveDataOrderId = 'ORDER_ID';

    const paypalCommerceAlternativeMethodsOptions: PaypalCommerceAlternativeMethodsButtonOptions = {
        apm: 'sepa',
        initializesOnCheckoutPage: false,
        style: {
            height: 45,
        },
    };

    const initializationOptions: CheckoutButtonInitializeOptions = {
        methodId: CheckoutButtonMethodType.PAYPALCOMMERCE_APMS,
        containerId: defaultButtonContainerId,
        paypalcommercealternativemethods: paypalCommerceAlternativeMethodsOptions,
    };

    beforeEach(() => {
        cartMock = getCart();
        eventEmitter = new EventEmitter();
        paymentMethodMock = { ...getPaypalCommerce(), id: 'paypalcommercealternativemethods' };
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

        strategy = new PaypalCommerceAlternativeMethodsButtonStrategy(
            store,
            checkoutActionCreator,
            formPoster,
            paypalScriptLoader,
            paypalCommerceRequestSender,
        );

        paypalCommerceAlternativeMethodsButtonElement = document.createElement('div');
        paypalCommerceAlternativeMethodsButtonElement.id = defaultButtonContainerId;
        document.body.appendChild(paypalCommerceAlternativeMethodsButtonElement);

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(paymentMethodMock);
        jest.spyOn(paypalScriptLoader, 'getPayPalSDK').mockReturnValue(paypalSdkMock);
        jest.spyOn(formPoster, 'postForm').mockImplementation(() => {});

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
                    isEligible: jest.fn(() => true),
                    render: jest.fn(),
                };
            });
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as PaypalHostWindow).paypal;

        if (document.getElementById(defaultButtonContainerId)) {
            document.body.removeChild(paypalCommerceAlternativeMethodsButtonElement);
        }
    });

    it('creates an instance of the PayPal Commerce APM checkout button strategy', () => {
        expect(strategy).toBeInstanceOf(PaypalCommerceAlternativeMethodsButtonStrategy);
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
            const options = { methodId: CheckoutButtonMethodType.PAYPALCOMMERCE_APMS } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommercealternativemethods option is not provided', async () => {
            const options = {
                containerId: defaultButtonContainerId,
                methodId: CheckoutButtonMethodType.PAYPALCOMMERCE_APMS,
            } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommercealternativemethods.apm option is not provided or falsy', async () => {
            const options = {
                ...initializationOptions,
                paypalcommercealternativemethods: {
                    ...paypalCommerceAlternativeMethodsOptions,
                    apm: '',
                },
            };

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

        it('initializes APM button to render', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
                fundingSource: paypalCommerceAlternativeMethodsOptions.apm,
                style: paypalCommerceAlternativeMethodsOptions.style,
                createOrder: expect.any(Function),
                onApprove: expect.any(Function)
            });
        });

        it('throws an error if provided apm is not a valid funding source', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            const options = {
                ...initializationOptions,
                paypalcommercealternativemethods: {
                    ...paypalCommerceAlternativeMethodsOptions,
                    apm: 'not_valid_apm',
                },
            };

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
                expect(paypalCommerceSdkRenderMock).not.toHaveBeenCalled();
            }
        });

        it('renders APM button if it is eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdkMock, 'Buttons')
                .mockImplementation(() => ({
                    isEligible: jest.fn(() => true),
                    render: paypalCommerceSdkRenderMock,
                }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).toHaveBeenCalled();
        });

        it('does not render APM button if it is not eligible', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdkMock, 'Buttons')
                .mockImplementation(() => ({
                    isEligible: jest.fn(() => false),
                    render: paypalCommerceSdkRenderMock,
                }));

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdkRenderMock).not.toHaveBeenCalled();
        });

        it('removes APM button container if the button has not rendered', async () => {
            const paypalCommerceSdkRenderMock = jest.fn();

            jest.spyOn(paypalSdkMock, 'Buttons')
                .mockImplementation(() => ({
                    isEligible: jest.fn(() => false),
                    render: paypalCommerceSdkRenderMock,
                }));

            await strategy.initialize(initializationOptions);

            expect(document.getElementById(defaultButtonContainerId)).toBeNull();
        });

        it('creates an order with paypalcommercealternativemethod as provider id if its initializes outside checkout page', async () => {
            jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('');

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise(resolve => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(cartMock.id, 'paypalcommercealternativemethod');
        });

        it('creates an order with paypalcommercealternativemethodscheckout as provider id if its initializes on checkout page', async () => {
            jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue('');

            const updatedIntializationOptions = {
                ...initializationOptions,
                paypalcommercealternativemethods: {
                    ...paypalCommerceAlternativeMethodsOptions,
                    initializesOnCheckoutPage: true,
                },
            };

            await strategy.initialize(updatedIntializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise(resolve => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(cartMock.id, 'paypalcommercealternativemethodscheckout');
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
