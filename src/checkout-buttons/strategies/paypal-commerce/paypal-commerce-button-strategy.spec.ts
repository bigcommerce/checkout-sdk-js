import { createAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';
import { from, of } from 'rxjs';

import { createCheckoutStore, CheckoutActionCreator, CheckoutActionType, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckout, getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { PaymentMethod, PaymentMethodActionType } from '../../../payment';
import { getPaypalCommerce } from '../../../payment/payment-methods.mock';
import { ButtonsOptions, PaypalCommerceHostWindow, PaypalCommerceRequestSender, PaypalCommerceScriptLoader, PaypalCommerceScriptOptions, PaypalCommerceSDK, StyleButtonColor, StyleButtonLabel } from '../../../payment/strategies/paypal-commerce';
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
    let paypalCommerceRequestSender: PaypalCommerceRequestSender;
    let requestSender: RequestSender;
    let paymentMethod: PaymentMethod;
    let render: () => void;
    let orderID: string;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        requestSender = createRequestSender();
        paypalCommerceRequestSender = new PaypalCommerceRequestSender(requestSender);
        paymentMethod = { ...getPaypalCommerce() };

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(createRequestSender()))
        );
        formPoster = createFormPoster();
        paypalScriptLoader = new PaypalCommerceScriptLoader(getScriptLoader());

        paypalOptions = {
            style: {
                color: StyleButtonColor.white,
                label: StyleButtonLabel.buynow,
                height: 45,
            },
        };

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

        jest.spyOn(paypalScriptLoader, 'loadPaypalCommerce')
            .mockReturnValue(Promise.resolve(paypal));

        jest.spyOn(formPoster, 'postForm')
            .mockImplementation(() => {});

        jest.spyOn(paypalCommerceRequestSender, 'setupPayment')
            .mockImplementation(jest.fn().mockReturnValue(Promise.resolve({body: '123'})));

        strategy = new PaypalCommerceButtonStrategy(
            store,
            checkoutActionCreator,
            paypalScriptLoader,
            formPoster,
            paypalCommerceRequestSender
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
            style: paypalOptions.style,
        });
    });

    it('render PayPalCommerce checkout button', async () => {
        await strategy.initialize(options);

        expect(render).toHaveBeenCalled();
    });

    it('calls loadPaypalCommerce with expected arguments', async () => {
        jest.spyOn(paypalScriptLoader, 'loadPaypalCommerce')
            .mockImplementation((options: PaypalCommerceScriptOptions) => {
                (window as PaypalCommerceHostWindow).paypal = paypal;

                const obj = {
                    clientId: 'abc',
                    commit: false,
                    currency: 'USD',
                    intent: 'capture',
                    disableFunding: ['card', 'credit'],
                };

                expect(options).toMatchObject(obj);

                return Promise.resolve(paypal);
            });

        await strategy.initialize(options);
    });

    it('calls loadPaypalCommerce without disableFunding when isPayPalCreditAvailable = true', async () => {
        paymentMethod.initializationData.isPayPalCreditAvailable = true;

        await store.dispatch(of(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, [paymentMethod])));

        jest.spyOn(paypalScriptLoader, 'loadPaypalCommerce')
            .mockImplementation((options: PaypalCommerceScriptOptions) => {
                (window as PaypalCommerceHostWindow).paypal = paypal;

                const obj = { disableFunding: ['credit'] };

                expect(options).not.toMatchObject(obj);

                return Promise.resolve(paypal);
            });

        await strategy.initialize(options);
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

        expect(paypalCommerceRequestSender.setupPayment)
            .toHaveBeenCalledWith('b20deef40f9699e48671bbc3fef6ca44dc80e3c7');
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

    describe('validate style for PaypalCommerce checkout button', () => {
        it('invalid all data', async () => {
            const style: any = {
                layout: 'aaa',
                color: 'aaa',
                shape: 'aaa',
                height: 5,
                label: 'aaa',
                tagline: true,
            };

            await strategy.initialize({ ...options, paypalCommerce: { style } });

            expect(paypal.Buttons).toHaveBeenCalledWith({
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
                style: { height: 25 },
            });
        });

        it('invalid height and valid other', async () => {
            const style: any = {
                height: 100,
                tagline: true,
                layout: 'horizontal',
            };

            await strategy.initialize({ ...options, paypalCommerce: { style } });

            expect(paypal.Buttons).toHaveBeenCalledWith({
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
                style: { tagline: true, layout: 'horizontal', height: 55 },
            });
        });

        it('invalid height - not number', async () => {
            const style: any = { height: '' };

            await strategy.initialize({ ...options, paypalCommerce: { style } });

            expect(paypal.Buttons).toHaveBeenCalledWith({
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
                style: {},
            });
        });
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
                paypalCommerceRequestSender
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
                    paypalCommerceRequestSender
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
                paypalScriptLoader,
                formPoster,
                paypalCommerceRequestSender
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
