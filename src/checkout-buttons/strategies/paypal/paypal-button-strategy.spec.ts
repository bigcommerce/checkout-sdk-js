import { createAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';
import { merge } from 'lodash';
import { from } from 'rxjs';

import { createCheckoutStore, CheckoutActionCreator, CheckoutActionType, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckout, getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getPaypalExpress } from '../../../payment/payment-methods.mock';
import { PaypalActions, PaypalButtonOptions, PaypalScriptLoader, PaypalSDK } from '../../../payment/strategies/paypal';
import { getPaypalMock } from '../../../payment/strategies/paypal/paypal.mock';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonMethodType from '../checkout-button-method-type';

import { PaypalButtonInitializeOptions } from './paypal-button-options';
import PaypalButtonStrategy from './paypal-button-strategy';

describe('PaypalButtonStrategy', () => {
    let actionsMock: PaypalActions;
    let checkoutActionCreator: CheckoutActionCreator;
    let eventEmitter: EventEmitter;
    let formPoster: FormPoster;
    let options: CheckoutButtonInitializeOptions;
    let paypalOptions: PaypalButtonInitializeOptions;
    let paypal: PaypalSDK;
    let paypalScriptLoader: PaypalScriptLoader;
    let store: CheckoutStore;
    let strategy: PaypalButtonStrategy;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(createRequestSender()),
            new ConfigActionCreator(new ConfigRequestSender(createRequestSender()))
        );
        formPoster = createFormPoster();
        paypalScriptLoader = new PaypalScriptLoader(getScriptLoader());

        paypalOptions = {
            shouldProcessPayment: false,
            clientId: 'abc',
            onAuthorizeError: jest.fn(),
            onPaymentError: jest.fn(),
        };

        options = {
            containerId: 'checkout-button',
            methodId: CheckoutButtonMethodType.PAYPALEXPRESS,
            paypal: paypalOptions,
        };

        eventEmitter = new EventEmitter();
        paypal = getPaypalMock();

        actionsMock = {
            payment: {
                get: jest.fn().mockReturnValue(Promise.resolve({
                    payer: {
                        payer_info: 'PAYER_INFO',
                    },
                })),
            },
            request: {
                post: jest.fn().mockReturnValue(Promise.resolve()),
            },
        };

        jest.spyOn(paypal.Button, 'render')
            .mockImplementation((options: PaypalButtonOptions) => {
                eventEmitter.on('payment', () => {
                    options.payment({
                        payerId: 'PAYER_ID',
                        paymentID: 'PAYMENT_ID',
                        payerID: 'PAYER_ID',
                    }, actionsMock).catch(() => {});
                });

                eventEmitter.on('authorize', () => {
                    options.onAuthorize({
                        payerId: 'PAYER_ID',
                        paymentID: 'PAYMENT_ID',
                        payerID: 'PAYER_ID',
                    }, actionsMock).catch(() => {});
                });
            });

        jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout')
            .mockReturnValue(() => from([
                createAction(CheckoutActionType.LoadCheckoutRequested),
                createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckout()),
            ]));

        jest.spyOn(paypalScriptLoader, 'loadPaypal')
            .mockReturnValue(Promise.resolve(paypal));

        jest.spyOn(formPoster, 'postForm')
            .mockImplementation(() => {});

        strategy = new PaypalButtonStrategy(
            store,
            checkoutActionCreator,
            paypalScriptLoader,
            formPoster
        );
    });

    it('throws error if required data is not loaded', async () => {
        try {
            store = createCheckoutStore();
            strategy = new PaypalButtonStrategy(
                store,
                checkoutActionCreator,
                paypalScriptLoader,
                formPoster
            );

            await strategy.initialize(options);
        } catch (error) {
            expect(error).toBeInstanceOf(MissingDataError);
        }
    });

    it('initializes Paypal and PayPal JS clients', async () => {
        await strategy.initialize(options);

        expect(paypalScriptLoader.loadPaypal).toHaveBeenCalled();
    });

    it('throws error if unable to initialize Paypal or PayPal JS client', async () => {
        const expectedError = new Error('Unable to load JS client');

        jest.spyOn(paypalScriptLoader, 'loadPaypal')
            .mockReturnValue(Promise.reject(expectedError));

        try {
            await strategy.initialize(options);
        } catch (error) {
            expect(error).toEqual(expectedError);
        }
    });

    it('renders PayPal checkout button', async () => {
        await strategy.initialize(options);

        expect(paypal.Button.render).toHaveBeenCalledWith({
            env: 'production',
            client: {
                production: 'abc',
            },
            commit: false,
            onAuthorize: expect.any(Function),
            payment: expect.any(Function),
            style: {
                shape: 'rect',
            },
            funding: {
                allowed: [],
                disallowed: [paypal.FUNDING.CREDIT],
            },
        }, 'checkout-button');
    });

    it('customizes style of PayPal checkout button', async () => {
        options = {
            ...options,
            paypal: {
                ...paypalOptions,
                style: {
                    color: 'blue',
                    shape: 'pill',
                    size: 'responsive',
                },
            },
        };

        await strategy.initialize(options);

        expect(paypal.Button.render).toHaveBeenCalledWith(expect.objectContaining({
            style: {
                color: 'blue',
                shape: 'pill',
                size: 'responsive',
            },
        }), 'checkout-button');
    });

    it('throws error if unable to render PayPal button', async () => {
        const expectedError = new Error('Unable to render PayPal button');

        jest.spyOn(paypal.Button, 'render')
            .mockImplementation(() => {
                throw expectedError;
            });

        try {
            await strategy.initialize(options);
        } catch (error) {
            expect(error).toEqual(expectedError);
        }
    });

    it('renders PayPal checkout button in sandbox environment if payment method is in test mode', async () => {
        store = createCheckoutStore(merge({}, getCheckoutStoreState(), {
            paymentMethods: {
                data: [
                    merge({}, getPaypalExpress(), { config: { testMode: true } }),
                ],
            },
        }));

        strategy = new PaypalButtonStrategy(
            store,
            checkoutActionCreator,
            paypalScriptLoader,
            formPoster
        );

        await strategy.initialize(options);

        expect(paypal.Button.render)
            .toHaveBeenCalledWith(expect.objectContaining({ env: 'sandbox' }), 'checkout-button');
    });

    it('posts payment details to server to set checkout data when PayPal payment details are tokenized', async () => {
        await strategy.initialize(options);

        eventEmitter.emit('authorize');

        await new Promise(resolve => process.nextTick(resolve));

        expect(formPoster.postForm).toHaveBeenCalledWith('/checkout.php', expect.objectContaining({
            payment_type: 'paypal',
            provider: 'paypalexpress',
            action: 'set_external_checkout',
            paymentId: 'PAYMENT_ID',
            payerId: 'PAYER_ID',
            payerInfo: JSON.stringify('PAYER_INFO'),
        }));
    });
    describe('if PayPal Credit is offered', () => {
        beforeEach(() => {
            options = {
                ...options,
                paypal: {
                    ...paypalOptions,
                    allowCredit: true,
                },
            };
        });

        it('renders PayPal Credit checkout button', async () => {
            await strategy.initialize(options);

            expect(paypal.Button.render).toHaveBeenCalledWith({
                client: {
                    production: 'abc',
                },
                commit: false,
                env: 'production',
                onAuthorize: expect.any(Function),
                payment: expect.any(Function),
                style: {
                    shape: 'rect',
                },
                funding: {
                    allowed: [paypal.FUNDING.CREDIT],
                    disallowed: [],
                },
            }, 'checkout-button');
        });
    });

    it('sends create payment requests to the relative url by default', async () => {
        await strategy.initialize(options);

        eventEmitter.emit('payment');

        await new Promise(resolve => process.nextTick(resolve));

        const expectedBody = { cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7', merchantId: 'h3hxn44tdd8wxkzd' };

        expect(actionsMock.request.post)
            .toHaveBeenCalledWith('/api/storefront/payment/paypalexpress', expectedBody, expect.any(Object));
    });

    describe('with a supplied host', () => {
        beforeEach(() => {
            strategy = new PaypalButtonStrategy(
                store,
                checkoutActionCreator,
                paypalScriptLoader,
                formPoster,
                'https://example.com'
            );
        });

        it('sends create payment requests to the supplied host', async () => {
            await strategy.initialize(options);

            eventEmitter.emit('payment');

            await new Promise(resolve => process.nextTick(resolve));

            const expectedBody = { cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7', merchantId: 'h3hxn44tdd8wxkzd' };

            expect(actionsMock.request.post)
                .toHaveBeenCalledWith('https://example.com/api/storefront/payment/paypalexpress', expectedBody, expect.any(Object));
        });
    });
});
