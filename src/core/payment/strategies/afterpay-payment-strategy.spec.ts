import { merge } from 'lodash';
import { createClient as createPaymentClient } from 'bigpay-client';
import AfterpayScriptLoader from '../../remote-checkout/methods/afterpay';
import { CartActionCreator } from '../../cart';
import { CheckoutStore } from '../../checkout';
import { PlaceOrderService } from '../../order';
import { RemoteCheckoutPaymentError, RemoteCheckoutSessionError } from '../../remote-checkout/errors';
import { RemoteCheckoutService } from '../../remote-checkout';
import { createScriptLoader } from '../../../script-loader';
import { getAfterpay } from '../../payment/payment-methods.mock';
import { getOrderRequestBody } from '../../order/orders.mock';
import { getResponse } from '../../common/http-request/responses.mock';
import AfterpayPaymentStrategy from './afterpay-payment-strategy';
import CheckoutClient from '../../checkout/checkout-client';
import PaymentMethod from '../payment-method';
import createCheckoutClient from '../../create-checkout-client';
import createCheckoutStore from '../../create-checkout-store';
import createPlaceOrderService from '../../create-place-order-service';
import createRemoteCheckoutService from '../../create-remote-checkout-service';
import { OrderRequestBody, PlaceOrderService } from '../../order';

describe('AfterpayPaymentStrategy', () => {
    let client: CheckoutClient;
    let scriptLoader: AfterpayScriptLoader;
    let store: CheckoutStore;
    let strategy: AfterpayPaymentStrategy;
    let remoteCheckoutService: RemoteCheckoutService;
    let paymentMethod: PaymentMethod;
    let placeOrderService: PlaceOrderService;
    let payload: OrderRequestBody;
    let clientToken: string = 'foo';
    let afterpaySdk = {
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
        strategy = new AfterpayPaymentStrategy(paymentMethod,
            store,
            placeOrderService,
            remoteCheckoutService,
            scriptLoader
        );

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
            await strategy.initialize();
            expect(scriptLoader.load).toHaveBeenCalledWith(paymentMethod);
        });
    });

    describe('#execute()', () => {
        beforeEach(async () => {
            await strategy.initialize();
            strategy.execute(payload);

            setTimeout(() => {
                const event = document.createEvent('Event');
                event.initEvent('unload', true, false);
                document.body.dispatchEvent(event);
            });
        });

        it('notifies store credit usage to remote checkout service', () => {
            expect(afterpaySdk.init).toHaveBeenCalled();
            expect(afterpaySdk.display).toHaveBeenCalledWith({ token: clientToken });
        });

        it('notifies displays the afterpay modal', () => {
            expect(remoteCheckoutService.initializePayment).toHaveBeenCalledWith( paymentMethod.gateway, { useStoreCredit: false });
        });
    });

    describe('#finalize()', () => {
        const nonce = 'bar';

        it('submits the order and the payment', async () => {
            await strategy.finalize({ nonce });
            expect(placeOrderService.submitOrder).toHaveBeenCalled();
            expect(placeOrderService.submitPayment).toHaveBeenCalledWith({
                name: paymentMethod.id,
                paymentData: { nonce },
            }, false, {});
        });
    });
});
