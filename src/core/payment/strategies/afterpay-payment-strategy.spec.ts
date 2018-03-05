import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { createClient as createPaymentClient } from 'bigpay-client';
import { CartActionCreator } from '../../cart';
import { CheckoutStore } from '../../checkout';
import { createPlaceOrderService, OrderRequestBody, PlaceOrderService } from '../../order';
import { RemoteCheckoutPaymentError, RemoteCheckoutSessionError } from '../../remote-checkout/errors';
import { createRemoteCheckoutService, RemoteCheckoutService } from '../../remote-checkout';
import { getAfterpay } from '../../payment/payment-methods.mock';
import { getIncompleteOrder, getOrderRequestBody } from '../../order/orders.mock';
import { getResponse } from '../../common/http-request/responses.mock';
import AfterpayPaymentStrategy from './afterpay-payment-strategy';
import AfterpayScriptLoader from '../../remote-checkout/methods/afterpay';
import CheckoutClient from '../../checkout/checkout-client';
import PaymentMethod from '../payment-method';
import createCheckoutClient from '../../create-checkout-client';
import createCheckoutStore from '../../create-checkout-store';

describe('AfterpayPaymentStrategy', () => {
    let client: CheckoutClient;
    let scriptLoader: AfterpayScriptLoader;
    let store: CheckoutStore;
    let strategy: AfterpayPaymentStrategy;
    let remoteCheckoutService: RemoteCheckoutService;
    let paymentMethod: PaymentMethod;
    let placeOrderService: PlaceOrderService;
    let payload: OrderRequestBody;

    const clientToken: string = 'foo';
    const afterpaySdk = {
        init: () => {},
        display: () => {},
    };

    beforeEach(() => {
        client = createCheckoutClient();
        store = createCheckoutStore();
        placeOrderService = createPlaceOrderService(store, client, createPaymentClient());
        remoteCheckoutService = createRemoteCheckoutService(store, client);
        paymentMethod = getAfterpay();
        scriptLoader = new AfterpayScriptLoader(createScriptLoader());
        strategy = new AfterpayPaymentStrategy(
            store,
            placeOrderService,
            remoteCheckoutService,
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

        jest.spyOn(remoteCheckoutService, 'initializePayment').mockImplementation(() => {
            return Promise.resolve({});
        });

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

        it('toggles the initialization flag', async () => {
            const results = [];

            store.subscribe(
                ({ statuses }) => results.push(statuses.isInitializingPaymentMethod(paymentMethod.id)),
                ({ statuses }) => statuses.isInitializingPaymentMethod(paymentMethod.id)
            );

            await strategy.initialize({ paymentMethod });

            expect(results).toEqual([false, true, false]);
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
            expect(remoteCheckoutService.initializePayment).toHaveBeenCalledWith( paymentMethod.gateway, { useStoreCredit: false, customerMessage: '' });
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
