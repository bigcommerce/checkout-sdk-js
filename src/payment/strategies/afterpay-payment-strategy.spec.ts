import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { Observable } from 'rxjs';

import { CartActionCreator } from '../../cart';
import { VERIFY_CART_REQUESTED } from '../../cart/cart-action-types';
import { createCheckoutClient, createCheckoutStore, CheckoutClient, CheckoutStore } from '../../checkout';
import { MissingDataError, NotInitializedError } from '../../common/error/errors';
import { createPlaceOrderService, OrderActionCreator, OrderRequestBody, PlaceOrderService } from '../../order';
import { getIncompleteOrder, getOrderRequestBody } from '../../order/internal-orders.mock';
import { SUBMIT_ORDER_REQUESTED } from '../../order/order-action-types';
import { getAfterpay } from '../../payment/payment-methods.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../remote-checkout';
import AfterpayScriptLoader from '../../remote-checkout/methods/afterpay';
import { INITIALIZE_REMOTE_PAYMENT_FAILED, INITIALIZE_REMOTE_PAYMENT_REQUESTED } from '../../remote-checkout/remote-checkout-action-types';
import PaymentMethod from '../payment-method';
import PaymentMethodActionCreator from '../payment-method-action-creator';
import { LOAD_PAYMENT_METHOD_SUCCEEDED } from '../payment-method-action-types';

import AfterpayPaymentStrategy from './afterpay-payment-strategy';

describe('AfterpayPaymentStrategy', () => {
    let cartActionCreator: CartActionCreator;
    let client: CheckoutClient;
    let initializePaymentAction: Observable<Action>;
    let loadPaymentMethodAction: Observable<Action>;
    let orderActionCreator: OrderActionCreator;
    let payload: OrderRequestBody;
    let paymentMethod: PaymentMethod;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let placeOrderService: PlaceOrderService;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let scriptLoader: AfterpayScriptLoader;
    let submitOrderAction: Observable<Action>;
    let store: CheckoutStore;
    let strategy: AfterpayPaymentStrategy;
    let verifyCartAction: Observable<Action>;

    const afterpaySdk = {
        init: () => {},
        display: () => {},
    };

    beforeEach(() => {
        client = createCheckoutClient();
        store = createCheckoutStore();
        orderActionCreator = new OrderActionCreator(client);
        paymentMethodActionCreator = new PaymentMethodActionCreator(client);
        cartActionCreator = new CartActionCreator(client);
        placeOrderService = createPlaceOrderService(store, client, createPaymentClient());
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(createRequestSender())
        );
        scriptLoader = new AfterpayScriptLoader(createScriptLoader());
        strategy = new AfterpayPaymentStrategy(
            store,
            placeOrderService,
            cartActionCreator,
            orderActionCreator,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader
        );

        paymentMethod = { ...getAfterpay(), id: 'afterpay' };

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                name: paymentMethod.id,
                gateway: paymentMethod.gateway,
            },
        });

        initializePaymentAction = Observable.of(createAction(INITIALIZE_REMOTE_PAYMENT_REQUESTED));
        loadPaymentMethodAction = Observable.of(createAction(LOAD_PAYMENT_METHOD_SUCCEEDED, { paymentMethod }, { methodId: paymentMethod.gateway }));
        submitOrderAction = Observable.of(createAction(SUBMIT_ORDER_REQUESTED));
        verifyCartAction = Observable.of(createAction(VERIFY_CART_REQUESTED));

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                name: paymentMethod.id,
                gateway: paymentMethod.gateway,
            },
        });

        jest.spyOn(store, 'dispatch');

        jest.spyOn(cartActionCreator, 'verifyCart')
            .mockReturnValue(verifyCartAction);

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(loadPaymentMethodAction);

        jest.spyOn(remoteCheckoutActionCreator, 'initializePayment')
            .mockReturnValue(initializePaymentAction);

        jest.spyOn(placeOrderService, 'submitPayment').mockImplementation(() => {
            return Promise.resolve();
        });

        jest.spyOn(scriptLoader, 'load')
            .mockReturnValue(Promise.resolve(afterpaySdk));

        jest.spyOn(afterpaySdk, 'init').mockImplementation(() => {});
        jest.spyOn(afterpaySdk, 'display').mockImplementation(() => {});
    });

    describe('#initialize()', () => {
        it('loads script when initializing strategy', async () => {
            await strategy.initialize({ paymentMethod });

            expect(scriptLoader.load).toHaveBeenCalledWith(paymentMethod);
        });
    });

    describe('#execute()', () => {
        const successHandler = jest.fn();

        beforeEach(async () => {
            await strategy.initialize({ paymentMethod });

            strategy.execute(payload).then(successHandler);

            await new Promise(resolve => process.nextTick(resolve));
        });

        it('displays the afterpay modal', () => {
            expect(afterpaySdk.init).toHaveBeenCalled();
            expect(afterpaySdk.display).toHaveBeenCalledWith({ token: paymentMethod.clientToken });
        });

        it('notifies store credit usage to remote checkout service', () => {
            expect(remoteCheckoutActionCreator.initializePayment).toHaveBeenCalledWith( paymentMethod.gateway, { useStoreCredit: false, customerMessage: '' });
            expect(store.dispatch).toHaveBeenCalledWith(initializePaymentAction);
        });

        it('verifies the cart', () => {
            expect(cartActionCreator.verifyCart).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(verifyCartAction);
        });

        it('does not resolve if execution is successful', () => {
            expect(successHandler).not.toHaveBeenCalled();
        });

        it('rejects with error if execution is unsuccessful', async () => {
            jest.spyOn(remoteCheckoutActionCreator, 'initializePayment')
                .mockReturnValue(Observable.of(createErrorAction(INITIALIZE_REMOTE_PAYMENT_FAILED, new Error())));

            const errorHandler = jest.fn();

            strategy.execute(payload).catch(errorHandler);

            await new Promise(resolve => process.nextTick(resolve));

            expect(errorHandler).toHaveBeenCalled();
        });

        it('throws error if trying to execute before initialization', async () => {
            await strategy.deinitialize();

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('loads payment client token', () => {
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith(paymentMethod.gateway, undefined);
            expect(store.dispatch).toHaveBeenCalledWith(loadPaymentMethodAction);
        });
    });

    describe('#finalize()', () => {
        const nonce = 'bar';

        it('submits the order and the payment', async () => {
            await strategy.initialize({ paymentMethod });

            jest.spyOn(store.getState().checkout, 'getOrder')
                .mockReturnValue({
                    ...getIncompleteOrder(),
                    payment: {
                        id: paymentMethod.id,
                    },
                });

            jest.spyOn(store.getState().checkout, 'getCustomer')
                .mockReturnValue({
                    remote: { useStoreCredit: false, customerMessage: 'foo' },
                });

            await strategy.finalize({ nonce });

            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(
                { useStoreCredit: false, customerMessage: 'foo' },
                true,
                { nonce }
            );

            expect(placeOrderService.submitPayment).toHaveBeenCalledWith({
                name: paymentMethod.id,
                paymentData: { nonce },
            }, false, {});
        });

        it('throws error if unable to finalize order due to missing data', async () => {
            try {
                await strategy.finalize({ nonce });
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });
});
