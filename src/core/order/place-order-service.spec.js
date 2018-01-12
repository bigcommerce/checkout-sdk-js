import { createTimeout } from '@bigcommerce/request-sender';
import { merge } from 'lodash';
import { createAction } from '../../data-store';
import { getCartState } from '../cart/carts.mock';
import { getConfigState } from '../config/configs.mock';
import { getCustomerState } from '../customer/customers.mock';
import { getCompleteOrder, getOrderRequestBody } from './orders.mock';
import { getPayment, getPaymentRequestBody } from '../payment/payments.mock';
import { getPaymentMethodsState } from '../payment/payment-methods.mock';
import { getQuoteState } from '../quote/quotes.mock';
import { getShippingOptionsState } from '../shipping/shipping-options.mock';
import { getSubmittedOrderState } from '../order/orders.mock';
import createCheckoutStore from '../create-checkout-store';
import PlaceOrderService from './place-order-service';

describe('PlaceOrderService', () => {
    let orderActionCreator;
    let paymentActionCreator;
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

        store = createCheckoutStore({
            cart: getCartState(),
            config: getConfigState(),
            customer: getCustomerState(),
            order: getSubmittedOrderState(),
            quote: getQuoteState(),
            paymentMethods: getPaymentMethodsState(),
            shippingOptions: getShippingOptionsState(),
        });

        placeOrderService = new PlaceOrderService(store, orderActionCreator, paymentActionCreator);
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

        it('throws error if cart data is missing', () => {
            jest.spyOn(store.getState().checkout, 'getCart').mockReturnValue();

            expect(() => placeOrderService.submitOrder(getOrderRequestBody())).toThrow();
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

        it('does not submit payment data if payment is not required', async () => {
            const { checkout } = store.getState();

            jest.spyOn(checkout, 'isPaymentDataRequired').mockReturnValue(false);

            await placeOrderService.submitPayment(getPayment(), true);

            expect(checkout.isPaymentDataRequired).toHaveBeenCalledWith(true);
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('throws error if cart data is missing', () => {
            jest.spyOn(store.getState().checkout, 'getCart').mockReturnValue();

            expect(() => placeOrderService.submitPayment(getPayment())).toThrow();
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

        it('does not submit payment data if payment is not required', async () => {
            const { checkout } = store.getState();

            jest.spyOn(checkout, 'isPaymentDataRequired').mockReturnValue(false);

            await placeOrderService.initializeOffsitePayment(getPayment(), true);

            expect(checkout.isPaymentDataRequired).toHaveBeenCalledWith(true);
            expect(paymentActionCreator.initializeOffsitePayment).not.toHaveBeenCalled();
        });

        it('throws error if cart data is missing', () => {
            jest.spyOn(store.getState().checkout, 'getCart').mockReturnValue();

            expect(() => placeOrderService.initializeOffsitePayment(getPayment())).toThrow();
        });
    });
});
