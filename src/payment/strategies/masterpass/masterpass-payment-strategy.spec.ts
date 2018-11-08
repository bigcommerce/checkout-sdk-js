import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { Observable } from 'rxjs';

import {
    PaymentActionCreator, PaymentInitializeOptions,
    PaymentMethod,
    PaymentMethodActionCreator, PaymentMethodActionType,
    PaymentMethodRequestSender, PaymentRequestSender
} from '../../';
import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { MissingDataError } from '../../../common/error/errors';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender } from '../../../order';
import { PaymentActionType } from '../../payment-actions';
import { getMasterpass, getPaymentMethodsState, getStripe } from '../../payment-methods.mock';

import { MasterpassCheckoutOptions, MasterpassPaymentStrategy, MasterpassScriptLoader } from './';
import { Masterpass } from './masterpass';
import { getMasterpassScriptMock } from './masterpass.mock';

describe('MasterpassPaymentStragegy', () => {
    let strategy: MasterpassPaymentStrategy;

    let orderRequestSender: OrderRequestSender;
    let requestSender: RequestSender;

    let store: CheckoutStore;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let scriptLoader: MasterpassScriptLoader;

    let initOptions: PaymentInitializeOptions;
    let paymentMethodMock: PaymentMethod;
    let stripePaymentMethodMock: PaymentMethod;
    let masterpassScript: Masterpass;

    beforeEach(() => {
        initOptions = {
            methodId: 'masterpass',
            masterpass: {
                walletButton: 'masterpassWalletButton',
            },
        };

        requestSender = createRequestSender();
        orderRequestSender = new OrderRequestSender(createRequestSender());

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            config: getConfigState(),
            customer: getCustomerState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));

        paymentMethodMock = getMasterpass();
        stripePaymentMethodMock = getStripe();

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(paymentMethodMock);

        const checkoutValidator = new CheckoutValidator(new CheckoutRequestSender(createRequestSender()));
        orderActionCreator = new OrderActionCreator(orderRequestSender, checkoutValidator);
        const paymentRequestSender = new PaymentRequestSender(createPaymentClient());
        paymentActionCreator = new PaymentActionCreator(paymentRequestSender, orderActionCreator);
        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender));

        scriptLoader = new MasterpassScriptLoader(createScriptLoader());
        masterpassScript = getMasterpassScriptMock();
        jest.spyOn(scriptLoader, 'load').mockReturnValue(Promise.resolve(masterpassScript));
        jest.spyOn(masterpassScript, 'checkout').mockReturnValue(true);

        // Strategy
        strategy = new MasterpassPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            scriptLoader
        );
    });

    describe('#initialize()', () => {
        it('throws an exception if payment method cannot be found', () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(undefined);
            const error = 'Unable to proceed because payment method data is unavailable or not properly configured.';
            expect(() => strategy.initialize(initOptions)).toThrowError(error);
        });

        it('throws an exception if masterpass options is not passed', () => {
            initOptions.masterpass = undefined;
            const error = 'Unable to initialize payment because "options.masterpass" argument is not provided.';
            return expect(strategy.initialize(initOptions)).rejects.toThrow(error);
        });

        describe('on click button handler', () => {
            let payload: MasterpassCheckoutOptions;
            let walletButton: HTMLElement;

            beforeEach(() => {
                paymentMethodMock.initializationData = {
                    allowedCardTypes: ['visa', 'amex', 'mastercard'],
                    checkoutId: 'checkout-id',
                };

                payload = {
                    allowedCardTypes: [
                        'visa',
                        'amex',
                        'mastercard',
                    ],
                    amount: '190.00',
                    cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                    checkoutId: 'checkout-id',
                    currency: 'USD',
                    suppressShippingAddress: false,
                };

                walletButton = document.createElement('a');
                jest.spyOn(document, 'getElementById').mockReturnValue(walletButton);
            });

            it('loads the script and calls the checkout when the wallet button is clicked', async () => {
                await strategy.initialize(initOptions);
                expect(scriptLoader.load).toHaveBeenLastCalledWith(false);
                walletButton.click();
                expect(masterpassScript.checkout).toHaveBeenCalledWith(payload);
            });

            it('loads the script in test mode, and calls the checkout when the wallet button is clicked', async () => {
                paymentMethodMock.config.testMode = true;
                await strategy.initialize(initOptions);
                expect(scriptLoader.load).toHaveBeenLastCalledWith(true);
                walletButton.click();
                expect(masterpassScript.checkout).toHaveBeenCalled();
            });

            it('does not call the checkout method when wallet button is not set on the init options', async () => {
                paymentMethodMock.config.testMode = true;
                initOptions.masterpass = {};
                await strategy.initialize(initOptions);
                expect(scriptLoader.load).toHaveBeenLastCalledWith(true);
                walletButton.click();
                expect(masterpassScript.checkout).not.toHaveBeenCalled();
            });
        });

        describe('with payment data', () => {
            beforeEach(() => {
                paymentMethodMock.initializationData = {
                    cardData: { expMonth: '10', expYear: '20', accountMask: '4444', cardType: 'MasterCard' },
                    gateway: 'stripe',
                    paymentData: { nonce: 'src_foobar1234567' },
                };
            });

            it('does not load the masterpass script', async () => {
                await strategy.initialize(initOptions);
                expect(scriptLoader.load).not.toHaveBeenLastCalledWith(true);
                expect(masterpassScript.checkout).not.toHaveBeenCalled();
            });
        });
    });

    describe('#execute', () => {
        let payload: OrderRequestBody;
        let submitOrderAction: Observable<Action>;
        let submitPaymentAction: Observable<Action>;
        let loadPaymentMethodAction: Observable<Action>;

        beforeEach(() => {
                paymentMethodMock.initializationData = {
                    cardData: { expMonth: '10', expYear: '20', accountMask: '4444', cardType: 'MasterCard' },
                    gateway: 'stripe',
                    paymentData: { nonce: 'src_foobar1234567' },
                };

                payload = {
                    useStoreCredit: true,
                };

                submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderRequested));
                orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);

                loadPaymentMethodAction = Observable.of(
                    createAction(
                        PaymentMethodActionType.LoadPaymentMethodSucceeded,
                        stripePaymentMethodMock,
                        { methodId: stripePaymentMethodMock.id }
                    )
                );
                jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(loadPaymentMethodAction);

                submitPaymentAction = Observable.of(createAction(PaymentActionType.SubmitPaymentRequested));
                paymentActionCreator.submitPayment = jest.fn(() => submitPaymentAction);
            }
        );

        it('fails to submit order when payment is not provided', async () => {
            expect(() => strategy.execute(payload)).toThrowError(MissingDataError);
        });

        it('throws an exception if payment data is missing', () => {
            paymentMethodMock.initializationData.paymentData = undefined;
            const error = 'Unable to proceed because payment method data is unavailable or not properly configured.';
            expect(() => strategy.execute(payload)).toThrowError(error);
        });

        it('throws an exception when the gateway is not provided', async () => {
            paymentMethodMock.initializationData.gateway = undefined;
            const error = 'Unable to proceed because "paymentMethod.initializationData.gateway" argument is not provided.';
            await strategy.initialize(initOptions);
            expect(() => strategy.execute(payload)).toThrowError(error);
        });

        it('throws an exception when the paymentData is not provided', async () => {
            paymentMethodMock.initializationData.paymentData = undefined;
            const error = 'Unable to proceed because "paymentMethod.initializationData.paymentData" argument is not provided.';
            await strategy.initialize(initOptions);
            expect(() => strategy.execute(payload)).toThrowError(error);
        });

        it('creates the order and execute the payment', async () => {
            await strategy.initialize(initOptions);
            await strategy.execute(payload);

            const submitPaymentArgs = { methodId: 'stripe', paymentData: { nonce: 'src_foobar1234567' } };
            const order = { useStoreCredit: payload.useStoreCredit };

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, undefined);
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith('stripe');
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(submitPaymentArgs);
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });
    });

    describe('#deinitialize()', () => {
        let walletButton: HTMLElement;

        beforeEach(() => {
            walletButton = document.createElement('a');
            jest.spyOn(walletButton, 'removeEventListener');
            jest.spyOn(document, 'getElementById').mockReturnValue(walletButton);

            paymentMethodMock.initializationData = {
                allowedCardTypes: ['visa', 'amex', 'mastercard'],
                checkoutId: 'checkout-id',
            };

            const submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderRequested));
            orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);
        });

        it('remove event listeners on wallet button', async () => {
            await strategy.initialize(initOptions);
            await strategy.deinitialize();
            expect(walletButton.removeEventListener).toHaveBeenCalled();
        });

        it('does not remove event listeners on wallet button if the id of the button was not passed on initialize options', async () => {
            initOptions.masterpass = {};
            await strategy.initialize(initOptions);
            await strategy.deinitialize();
            expect(walletButton.removeEventListener).not.toHaveBeenCalled();
        });
    });
});
