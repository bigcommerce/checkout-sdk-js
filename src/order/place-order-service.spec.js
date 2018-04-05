import { createAction } from '@bigcommerce/data-store';
import { createTimeout } from '@bigcommerce/request-sender';
import { merge } from 'lodash';
import { createCheckoutStore } from '../checkout';
import { getCartState } from '../cart/internal-carts.mock';
import { getConfigState } from '../config/configs.mock';
import { getCustomerState } from '../customer/internal-customers.mock';
import { getCompleteOrder, getOrderRequestBody } from './internal-orders.mock';
import { getPayment, getPaymentRequestBody } from '../payment/payments.mock';
import { getInstrumentsState, getInstrumentsMeta } from '../payment/instrument/instrument.mock';
import { getPaymentMethodsState } from '../payment/payment-methods.mock';
import { getQuoteState } from '../quote/internal-quotes.mock';
import { getShippingOptionsState } from '../shipping/internal-shipping-options.mock';
import { getSubmittedOrderState } from '../order/internal-orders.mock';
import PlaceOrderService from './place-order-service';

describe('PlaceOrderService', () => {
    let cartActionCreator;
    let orderActionCreator;
    let paymentActionCreator;
    let paymentMethodActionCreator;
    let placeOrderService;
    let store;

    beforeEach(() => {
        orderActionCreator = {
            finalizeOrder: jest.fn(() => createAction('FINALIZE_ORDER')),
            loadOrder: jest.fn(() => createAction('LOAD_ORDER')),
            submitOrder: jest.fn(() => createAction('SUBMIT_ORDER')),
        };

        paymentActionCreator = {
            initializeOffsitePayment: jest.fn(() => createAction('INITALIZE_OFFSITE_PAYMENT')),
            submitPayment: jest.fn(() => createAction('SUBMIT_PAYMENT')),
        };

        paymentMethodActionCreator = {
            initializePaymentMethod: jest.fn(() => createAction('INITALIZE_PAYMENT_METHOD')),
        };

        cartActionCreator = {
            verifyCart: jest.fn(() => createAction('VERIFY_CART_SUCCEEDED')),
        };

        store = createCheckoutStore({
            cart: getCartState(),
            config: getConfigState(),
            customer: getCustomerState(),
            instruments: getInstrumentsState(),
            order: getSubmittedOrderState(),
            quote: getQuoteState(),
            paymentMethods: getPaymentMethodsState(),
            shippingOptions: getShippingOptionsState(),
        });

        placeOrderService = new PlaceOrderService(store, cartActionCreator, orderActionCreator, paymentActionCreator, paymentMethodActionCreator);
    });

    describe('#submitOrder()', () => {
        it('dispatches submit order action', async () => {
            jest.spyOn(store, 'dispatch');

            await placeOrderService.submitOrder(getOrderRequestBody(), false);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(getOrderRequestBody(), undefined, undefined);
            expect(store.dispatch).toHaveBeenCalledWith(createAction('SUBMIT_ORDER'));
        });

        it('dispatches submit order action with timeout', async () => {
            jest.spyOn(store, 'dispatch');

            const options = { timeout: createTimeout() };

            await placeOrderService.submitOrder(getOrderRequestBody(), false, options);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(getOrderRequestBody(), undefined, options);
            expect(store.dispatch).toHaveBeenCalledWith(createAction('SUBMIT_ORDER'));
        });

        it('dispatches submit order action with cart if should verify cart', async () => {
            jest.spyOn(store, 'dispatch');

            const { checkout } = store.getState();

            await placeOrderService.submitOrder(getOrderRequestBody(), true);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(getOrderRequestBody(), checkout.getCart(), undefined);
            expect(store.dispatch).toHaveBeenCalledWith(createAction('SUBMIT_ORDER'));
        });

        it('returns checkout state', async () => {
            const output = await placeOrderService.submitOrder(getOrderRequestBody());

            expect(output).toEqual(store.getState());
        });
    });

    describe('#finalizeOrder()', () => {
        it('dispatches finalize order action', async () => {
            jest.spyOn(store, 'dispatch');

            await placeOrderService.finalizeOrder(295);

            expect(orderActionCreator.finalizeOrder).toHaveBeenCalledWith(295, undefined);
            expect(store.dispatch).toHaveBeenCalledWith(createAction('FINALIZE_ORDER'));
        });

        it('dispatches finalize order action with timeout', async () => {
            jest.spyOn(store, 'dispatch');

            const options = { timeout: createTimeout() };

            await placeOrderService.finalizeOrder(295, options);

            expect(orderActionCreator.finalizeOrder).toHaveBeenCalledWith(295, options);
            expect(store.dispatch).toHaveBeenCalledWith(createAction('FINALIZE_ORDER'));
        });

        it('returns checkout state', async () => {
            const output = await placeOrderService.finalizeOrder(295);

            expect(output).toEqual(store.getState());
        });
    });

    describe('#submitPayment()', () => {
        it('dispatches submit payment action', async () => {
            jest.spyOn(store, 'dispatch');

            await placeOrderService.submitPayment(getPayment());

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expect.objectContaining(getPaymentRequestBody()), undefined);
            expect(store.dispatch).toHaveBeenCalledWith(createAction('SUBMIT_PAYMENT'));
        });

        it('dispatches submit payment action with device session id if provided', async () => {
            jest.spyOn(store, 'dispatch');

            await placeOrderService.submitPayment(merge(
                getPayment(),
                { paymentData: { deviceSessionId: 'ccc2156e-68d4-47f0-b311-d9b21e89df5d' } },
            ));

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(
                expect.objectContaining(merge(
                    getPaymentRequestBody(),
                    {
                        quoteMeta: {
                            request: {
                                deviceSessionId: 'ccc2156e-68d4-47f0-b311-d9b21e89df5d',
                            },
                        },
                    }
                )),
                undefined
            );
            expect(store.dispatch).toHaveBeenCalledWith(createAction('SUBMIT_PAYMENT'));
        });

        it('dispatches submit payment action with vault access token if an instrument is provided', async () => {
            jest.spyOn(store, 'dispatch');

            const instrumentId = getInstrumentsMeta().vaultAccessToken;
            const paymentAuthToken = getPaymentRequestBody().authToken;

            await placeOrderService.submitPayment(merge(
                getPayment(),
                { paymentData: { instrumentId } },
            ));

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    authToken: `${paymentAuthToken}, ${instrumentId}`,
                }),
                undefined
            );
            expect(store.dispatch).toHaveBeenCalledWith(createAction('SUBMIT_PAYMENT'));
        });

        it('dispatches load order action', async () => {
            jest.spyOn(store, 'dispatch');

            await placeOrderService.submitPayment(getPayment());

            expect(orderActionCreator.loadOrder).toHaveBeenCalledWith(getCompleteOrder().orderId, undefined);
            expect(store.dispatch).toHaveBeenCalledWith(createAction('LOAD_ORDER'));
        });

        it('create actions with timeout', async () => {
            jest.spyOn(store, 'dispatch');

            const options = { timeout: createTimeout() };

            await placeOrderService.submitPayment(getPayment(), false, options);

            expect(orderActionCreator.loadOrder).toHaveBeenCalledWith(getCompleteOrder().orderId, options);
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expect.objectContaining(getPaymentRequestBody()), options);
        });

        it('returns checkout state', async () => {
            const output = await placeOrderService.submitPayment(getPayment());

            expect(output).toEqual(store.getState());
        });
    });

    describe('#initializeOffsitePayment()', () => {
        it('dispatches finalize payment action', async () => {
            jest.spyOn(store, 'dispatch');

            const options = { timeout: createTimeout() };

            await placeOrderService.initializeOffsitePayment(getPayment(), false, options);

            expect(paymentActionCreator.initializeOffsitePayment).toHaveBeenCalledWith(expect.objectContaining(getPaymentRequestBody()), options);
            expect(store.dispatch).toHaveBeenCalledWith(createAction('INITALIZE_OFFSITE_PAYMENT'));
        });

        it('returns checkout state', async () => {
            const output = await placeOrderService.initializeOffsitePayment(getPayment(), false);

            expect(output).toEqual(store.getState());
        });
    });
});
