import { createAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';
import { from, of } from 'rxjs';

import { Cart } from '../../../cart';
import { getCart } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutActionCreator, CheckoutActionType, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckout, getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { PaymentMethod, PaymentMethodActionType } from '../../../payment';
import { getPaypalCommerce } from '../../../payment/payment-methods.mock';
import { PaypalCommercePaymentProcessor, PaypalCommerceRequestSender, PaypalCommerceScriptLoader, StyleButtonColor, StyleButtonLabel } from '../../../payment/strategies/paypal-commerce';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonMethodType from '../checkout-button-method-type';

import { PaypalCommerceButtonInitializeOptions } from './paypal-commerce-button-options';
import PaypalCommerceButtonStrategy from './paypal-commerce-button-strategy';

describe('PaypalCommerceButtonStrategy', () => {
    let store: CheckoutStore;
    let checkoutActionCreator: CheckoutActionCreator;
    let formPoster: FormPoster;
    let paypalOptions: PaypalCommerceButtonInitializeOptions;
    let options: CheckoutButtonInitializeOptions;
    let eventEmitter: EventEmitter;
    let strategy: PaypalCommerceButtonStrategy;
    let requestSender: RequestSender;
    let paymentMethod: PaymentMethod;
    let orderID: string;
    let paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor;
    let cart: Cart;
    let fundingSource: string;
    let messageContainer: HTMLDivElement;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        requestSender = createRequestSender();
        paymentMethod = { ...getPaypalCommerce() };
        cart = { ...getCart() };
        formPoster = createFormPoster();

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender))
        );
        paypalCommercePaymentProcessor = new PaypalCommercePaymentProcessor(new PaypalCommerceScriptLoader(getScriptLoader()), new PaypalCommerceRequestSender(requestSender));
        eventEmitter = new EventEmitter();

        paypalOptions = {
            style: {
                color: StyleButtonColor.white,
                label: StyleButtonLabel.buynow,
                height: 45,
            },
            messagingContainer: 'paypal-commerce-cart-messaging-banner',
        };

        options = {
            containerId: 'paypalcommerce-container',
            methodId: CheckoutButtonMethodType.PAYPALCOMMERCE,
            paypalCommerce: paypalOptions,
        };

        orderID = 'ORDER_ID';
        fundingSource = 'paypal';

        jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout')
            .mockReturnValue(() => {
                return from([
                    createAction(CheckoutActionType.LoadCheckoutRequested),
                    createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckout()),
                ]);
            });

        jest.spyOn(paypalCommercePaymentProcessor, 'initialize')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(paypalCommercePaymentProcessor, 'renderButtons')
            .mockImplementation((...arg) => {
                const [, , options] = arg;

                eventEmitter.on('onClick', () => {
                    if (options.onClick) {
                        options.onClick({ fundingSource });
                    }
                });

                eventEmitter.on('onApprove', () => {
                    if (options.onApprove) {
                        options.onApprove({ orderID });
                    }
                });
            });

        jest.spyOn(paypalCommercePaymentProcessor, 'renderMessages')
            .mockImplementation(() => {} );

        jest.spyOn(formPoster, 'postForm')
            .mockImplementation(() => {});

        strategy = new PaypalCommerceButtonStrategy(
            store,
            checkoutActionCreator,
            formPoster,
            paypalCommercePaymentProcessor
        );

        if (paypalOptions.messagingContainer != null) {
            messageContainer = document.createElement('div');
            messageContainer.setAttribute('id', paypalOptions.messagingContainer);
            document.body.appendChild(messageContainer);
        }
    });

    afterEach(() => {
        if (paypalOptions.messagingContainer != null && document.getElementById(paypalOptions.messagingContainer)) {
                document.body.removeChild(messageContainer);
        }
    });

    it('initializes PaypalCommerce and PayPal credit disabled & messaging enabled', async () => {
        await strategy.initialize(options);

        const obj = {
            'client-id': 'abc',
            commit: false,
            currency: 'USD',
            intent: 'capture',
            components: ['buttons', 'messages'],
            'disable-funding': ['card', 'credit'],
        };

        expect(paypalCommercePaymentProcessor.initialize).toHaveBeenCalledWith(obj);
    });

    it('initializes PaypalCommerce and PayPal credit enabled & messaging enabled', async () => {
        paymentMethod.initializationData.isPayPalCreditAvailable = true;
        await store.dispatch(of(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, [paymentMethod])));

        await strategy.initialize(options);

        const obj = {
                'client-id': 'abc',
                commit: false,
                currency: 'USD',
                intent: 'capture',
                components: ['buttons', 'messages'],
                'disable-funding': ['card'],
        };

        expect(paypalCommercePaymentProcessor.initialize).toHaveBeenCalledWith(obj);
    });

    it('render PayPal buttons', async () => {
        await strategy.initialize(options);

        const buttonOption = {
            onApprove: expect.any(Function),
            onClick: expect.any(Function),
            style: paypalOptions.style,
        };

        expect(paypalCommercePaymentProcessor.renderButtons).toHaveBeenCalledWith(cart.id, `#${options.containerId}`, buttonOption);
    });

    it('do not render PayPal messaging without banner element', async () => {
        document.body.removeChild(messageContainer);

        await strategy.initialize(options);

        expect(paypalCommercePaymentProcessor.renderMessages).not.toHaveBeenCalled();
    });

    it('render PayPal messaging with banner element', async () => {
        await store.dispatch(of(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, [paymentMethod])));

        await strategy.initialize(options);

        expect(paypalCommercePaymentProcessor.renderMessages).toHaveBeenCalledWith(cart.cartAmount, `#${paypalOptions.messagingContainer}`);
    });

    it('post payment details to server to set checkout data when PayPalCommerce payment details are tokenized', async () => {
        await strategy.initialize(options);

        eventEmitter.emit('onApprove');

        await new Promise(resolve => process.nextTick(resolve));

        expect(formPoster.postForm).toHaveBeenCalledWith('/checkout.php', expect.objectContaining({
            payment_type: 'paypal',
            action: 'set_external_checkout',
            provider: 'paypalcommerce',
            order_id: orderID,
        }));
    });

    it('post payment details with credit to server to set checkout data when PayPalCommerce payment details are tokenized', async () => {
        fundingSource = 'credit';

        await strategy.initialize(options);

        eventEmitter.emit('onClick');
        eventEmitter.emit('onApprove');

        await new Promise(resolve => process.nextTick(resolve));

        expect(formPoster.postForm).toHaveBeenCalledWith('/checkout.php', expect.objectContaining({
            payment_type: 'paypal',
            action: 'set_external_checkout',
            provider: 'paypalcommercecredit',
            order_id: orderID,
        }));
    });

    describe('throws error during initialize', () => {
        it('without clientId', async () => {
            paymentMethod.initializationData.clientId = null;

            await store.dispatch(of(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, [paymentMethod])));

            strategy = new PaypalCommerceButtonStrategy(
                store,
                checkoutActionCreator,
                formPoster,
                paypalCommercePaymentProcessor
            );

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if payment method is not loaded', async () => {
            try {
                store = createCheckoutStore();
                strategy = new PaypalCommerceButtonStrategy(
                    store,
                    checkoutActionCreator,
                    formPoster,
                    paypalCommercePaymentProcessor
                );

                options = {
                    containerId: 'paypalcommerce-container1',
                    paypalCommerce: paypalOptions,
                } as CheckoutButtonInitializeOptions;

                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throw error without cart', async () => {
            const state = getCheckoutStoreState();
            delete state.cart.data;

            store = createCheckoutStore(state);

            strategy = new PaypalCommerceButtonStrategy(
                store,
                checkoutActionCreator,
                formPoster,
                paypalCommercePaymentProcessor
            );
            const checkout = getCheckout();
            delete checkout.cart;

            jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout')
                .mockReturnValue(() => {
                    return from([
                        createAction(CheckoutActionType.LoadCheckoutRequested),
                        createAction(CheckoutActionType.LoadCheckoutSucceeded, checkout),
                    ]);
                });

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toEqual(new MissingDataError(MissingDataErrorType.MissingCart));
            }
        });
    });
});
