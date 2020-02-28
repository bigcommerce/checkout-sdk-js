import { createAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';
import { from, of } from 'rxjs';

import { createCheckoutStore, CheckoutActionCreator, CheckoutActionType, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckout, getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { INTERNAL_USE_ONLY } from '../../../common/http-request';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { PaymentMethod, PaymentMethodActionType } from '../../../payment';
import { getPaypalCommerce } from '../../../payment/payment-methods.mock';
import { ButtonsOptions, PaypalCommerceScriptLoader, PaypalCommerceSDK } from '../../../payment/strategies/paypal-commerce';
import { getPaypalCommerceMock } from '../../../payment/strategies/paypal-commerce/paypal-commerce.mock';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonMethodType from '../checkout-button-method-type';

import { PaypalCommerceButtonInitializeOptions } from './paypal-commerce-button-options';
import PaypalCommerceButtonStrategy from './paypal-commerce-button-strategy';

describe('PaypalCommerceButtonStrategy', () => {
    let store: CheckoutStore;
    let checkoutActionCreator: CheckoutActionCreator;
    let formPoster: FormPoster;
    let paypal: PaypalCommerceSDK;
    let paypalScriptLoader: PaypalCommerceScriptLoader;
    let paypalOptions: PaypalCommerceButtonInitializeOptions;
    let options: CheckoutButtonInitializeOptions;
    let eventEmitter: EventEmitter;
    let strategy: PaypalCommerceButtonStrategy;
    let requestSender: RequestSender;
    let paymentMethod: PaymentMethod;
    let render: () => void;
    let orderID: string;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        requestSender = createRequestSender();
        paymentMethod = { ...getPaypalCommerce() };

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(createRequestSender()))
        );
        formPoster = createFormPoster();
        paypalScriptLoader = new PaypalCommerceScriptLoader(getScriptLoader());

        paypalOptions = {};

        options = {
            containerId: 'paypalcommerce-container1',
            methodId: CheckoutButtonMethodType.PAYPALCOMMERCE,
            paypalCommerce: paypalOptions,
        };

        orderID = 'ORDER_ID';
        eventEmitter = new EventEmitter();
        paypal = getPaypalCommerceMock();

        render = jest.spyOn(paypal, 'Buttons')
            .mockImplementation((options: ButtonsOptions) => {
                eventEmitter.on('createOrder', () => {
                    options.createOrder();
                });

                eventEmitter.on('approve', () => {
                    options.onApprove( { orderID });
                });

                return {
                    render: () => {},
                };
            });

        jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout')
            .mockReturnValue(() => {
                return from([
                    createAction(CheckoutActionType.LoadCheckoutRequested),
                    createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckout()),
                ]);
            });

        jest.spyOn(paypalScriptLoader, 'loadPaypalCommerce')
            .mockReturnValue(Promise.resolve(paypal));

        jest.spyOn(formPoster, 'postForm')
            .mockImplementation(() => {});

        jest.spyOn(requestSender, 'post')
            .mockImplementation(jest.fn().mockReturnValue(Promise.resolve({body: '123'})));

        strategy = new PaypalCommerceButtonStrategy(
            store,
            checkoutActionCreator,
            paypalScriptLoader,
            formPoster,
            requestSender
        );

    });

    it('initializes PaypalCommerce and PayPal JS clients', async () => {
        await strategy.initialize(options);

        expect(paypalScriptLoader.loadPaypalCommerce).toHaveBeenCalled();
    });

    it('throws error if unable to initialize PaypalCommerce or PayPal JS client', async () => {
        const expectedError = new Error('Unable to load JS client');

        jest.spyOn(paypalScriptLoader, 'loadPaypalCommerce')
            .mockReturnValue(Promise.reject(expectedError));

        try {
            await strategy.initialize(options);
        } catch (error) {
            expect(error).toEqual(expectedError);
        }
    });

    it('setting PaypalCommerce checkout button', async () => {
        await strategy.initialize(options);

        expect(paypal.Buttons).toHaveBeenCalledWith({
            createOrder: expect.any(Function),
            onApprove: expect.any(Function),
        });
    });

    it('render PayPalCommerce checkout button', async () => {
        await strategy.initialize(options);

        expect(render).toHaveBeenCalled();
    });

    it('throws error if unable to setting PayPalCommerce button', async () => {
        const expectedError = new Error('Unable to setting PayPal button');

        jest.spyOn(paypal, 'Buttons')
            .mockImplementation(() => {
                throw expectedError;
            });

        try {
            await strategy.initialize(options);
        } catch (error) {
            expect(error).toEqual(expectedError);
        }
    });

    it('create order (post request to server) when PayPalCommerce payment details are setup payment', async () => {
        await strategy.initialize(options);

        eventEmitter.emit('createOrder');

        await new Promise(resolve => process.nextTick(resolve));

        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': 'application/x-www-form-urlencoded',
        };

        expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/payment/paypalcommerce', expect.objectContaining({
            body: {cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7'},
            headers,
        }));
    });

    it('post payment details to server to set checkout data when PayPalCommerce payment details are tokenized', async () => {
        await strategy.initialize(options);

        eventEmitter.emit('approve');

        await new Promise(resolve => process.nextTick(resolve));

        expect(formPoster.postForm).toHaveBeenCalledWith('/checkout.php', expect.objectContaining({
            payment_type: 'paypal',
            action: 'set_external_checkout',
            provider: CheckoutButtonMethodType.PAYPALCOMMERCE,
            order_id: orderID,
        }));
    });

    it('throws error in tokenize payment without order id', async () => {
        orderID = '';
        await strategy.initialize(options);

        try {
            eventEmitter.emit('approve');

            await new Promise(resolve => process.nextTick(resolve));
        } catch (error) {
            expect(error).toBeInstanceOf(MissingDataError);
        }
    });

    it('throws error in setup payment', async () => {
        const expectedError = new Error('Error in creating order');

        await strategy.initialize(options);

        try {
            eventEmitter.emit('createOrder');

            await new Promise((_, reject) => process.nextTick(() => reject(expectedError)));
        } catch (error) {
            expect(error).toEqual(expectedError);
        }
    });

    describe('throws error during initialize', () => {
        it('without clientId', async () => {
            paymentMethod.initializationData.clientId = null;

            await store.dispatch(of(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, [paymentMethod])));

            strategy = new PaypalCommerceButtonStrategy(
                store,
                checkoutActionCreator,
                paypalScriptLoader,
                formPoster,
                requestSender
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
                    paypalScriptLoader,
                    formPoster,
                    requestSender
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

        it('throw error without config', async () => {
            const state = getCheckoutStoreState();
            const config = state.config;
            delete config.data;

            store = createCheckoutStore({ ...state, config });

            strategy = new PaypalCommerceButtonStrategy(
                store,
                checkoutActionCreator,
                paypalScriptLoader,
                formPoster,
                requestSender
            );

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toEqual(new MissingDataError(MissingDataErrorType.MissingCheckoutConfig));
            }
        });

        it('throw error without cart', async () => {
            const state = getCheckoutStoreState();
            delete state.cart.data;

            store = createCheckoutStore(state);

            strategy = new PaypalCommerceButtonStrategy(
                store,
                checkoutActionCreator,
                paypalScriptLoader,
                formPoster,
                requestSender
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
