import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { Observable } from 'rxjs';

import { CheckoutStore, createCheckoutClient, createCheckoutStore } from '../../checkout';
import CheckoutClient from '../../checkout/checkout-client';
import { createPlaceOrderService, OrderRequestBody, PlaceOrderService } from '../../order';
import { getIncompleteOrder, getOrderRequestBody } from '../../order/internal-orders.mock';
import { getAfterpay } from '../../payment/payment-methods.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../remote-checkout';
import AfterpayScriptLoader from '../../remote-checkout/methods/afterpay';
import { INITIALIZE_REMOTE_PAYMENT_REQUESTED } from '../../remote-checkout/remote-checkout-action-types';
import PaymentMethod from '../payment-method';
import AfterpayPaymentStrategy from './afterpay-payment-strategy';

describe('AfterpayPaymentStrategy', () => {
    let client: CheckoutClient;
    let payload: OrderRequestBody;
    let paymentMethod: PaymentMethod;
    let placeOrderService: PlaceOrderService;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let scriptLoader: AfterpayScriptLoader;
    let store: CheckoutStore;
    let strategy: AfterpayPaymentStrategy;

    const clientToken: string = 'foo';
    const afterpaySdk = {
        init: () => {},
        display: () => {},
    };

    beforeEach(() => {
        client = createCheckoutClient();
        store = createCheckoutStore();
        placeOrderService = createPlaceOrderService(store, client, createPaymentClient());
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(createRequestSender())
        );
        scriptLoader = new AfterpayScriptLoader(createScriptLoader());
        strategy = new AfterpayPaymentStrategy(
            store,
            placeOrderService,
            remoteCheckoutActionCreator,
            scriptLoader
        );

        jest.spyOn(placeOrderService, 'verifyCart').mockImplementation(() => {});
        jest.spyOn(placeOrderService, 'loadPaymentMethod').mockImplementation(() => {
            return Promise.resolve({
                checkout: {
                    getPaymentMethod: () => {
                        return { clientToken };
                    },
                },
            });
        });

        jest.spyOn(placeOrderService, 'submitOrder').mockImplementation(() => {
            return Promise.resolve();
        });

        jest.spyOn(placeOrderService, 'submitPayment').mockImplementation(() => {
            return Promise.resolve();
        });

        jest.spyOn(scriptLoader, 'load').mockImplementation(() => {
            return Promise.resolve(afterpaySdk);
        });

        jest.spyOn(afterpaySdk, 'init').mockImplementation(() => {});
        jest.spyOn(afterpaySdk, 'display').mockImplementation(() => {});

        jest.spyOn(remoteCheckoutActionCreator, 'initializePayment').mockImplementation(() => {
            return Observable.of(createAction(INITIALIZE_REMOTE_PAYMENT_REQUESTED));
        });

        paymentMethod = getAfterpay();

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                name: paymentMethod.id,
                gateway: paymentMethod.gateway,
            },
        });
    });

    describe('#initialize()', () => {
        it('loads script when initializing strategy', async () => {
            await strategy.initialize({ paymentMethod });

            expect(scriptLoader.load).toHaveBeenCalledWith(paymentMethod);
        });
    });

    describe('#execute()', () => {
        beforeEach(async () => {
            await strategy.initialize({ paymentMethod });

            strategy.execute(payload);

            setTimeout(() => {
                const event = document.createEvent('Event');
                event.initEvent('unload', true, false);
                document.body.dispatchEvent(event);
            });
        });

        it('displays the afterpay modal', () => {
            expect(afterpaySdk.init).toHaveBeenCalled();
            expect(afterpaySdk.display).toHaveBeenCalledWith({ token: clientToken });
        });

        it('notifies store credit usage to remote checkout service', () => {
            expect(remoteCheckoutActionCreator.initializePayment).toHaveBeenCalledWith( paymentMethod.gateway, { useStoreCredit: false, customerMessage: '' });
        });

        it('verifies the cart', () => {
            expect(placeOrderService.verifyCart).toHaveBeenCalled();
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

            expect(placeOrderService.submitOrder).toHaveBeenCalledWith(
                { useStoreCredit: false, customerMessage: 'foo' },
                true,
                { nonce }
            );

            expect(placeOrderService.submitPayment).toHaveBeenCalledWith({
                name: paymentMethod.id,
                paymentData: { nonce },
            }, false, {});
        });
    });
});
