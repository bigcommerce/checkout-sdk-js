import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { Observable } from 'rxjs';

import { createCheckoutClient, createCheckoutStore, CheckoutStore } from '../../checkout';
import CheckoutClient from '../../checkout/checkout-client';
import { MissingDataError, NotInitializedError } from '../../common/error/errors';
import { createPlaceOrderService, OrderRequestBody, PlaceOrderService } from '../../order';
import { getIncompleteOrder, getOrderRequestBody } from '../../order/internal-orders.mock';
import { getAfterpay } from '../../payment/payment-methods.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../remote-checkout';
import AfterpayScriptLoader from '../../remote-checkout/methods/afterpay';
import { INITIALIZE_REMOTE_PAYMENT_FAILED, INITIALIZE_REMOTE_PAYMENT_REQUESTED } from '../../remote-checkout/remote-checkout-action-types';
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
        const successHandler = jest.fn();

        beforeEach(async () => {
            await strategy.initialize({ paymentMethod });

            strategy.execute(payload).then(successHandler);

            await new Promise(resolve => process.nextTick(resolve));
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

        it('throws error if unable to finalize order due to missing data', async () => {
            try {
                await strategy.finalize({ nonce });
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });
});
