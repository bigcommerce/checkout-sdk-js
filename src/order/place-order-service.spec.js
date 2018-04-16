import { createAction } from '@bigcommerce/data-store';
import { createTimeout } from '@bigcommerce/request-sender';
import { createCheckoutStore } from '../checkout';
import { getCompleteOrder } from './internal-orders.mock';
import { getPayment } from '../payment/payments.mock';
import { getSubmittedOrderState } from '../order/internal-orders.mock';
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
        };

        paymentActionCreator = {
            initializeOffsitePayment: jest.fn(() => createAction('INITALIZE_OFFSITE_PAYMENT')),
            submitPayment: jest.fn(() => createAction('SUBMIT_PAYMENT')),
        };

        store = createCheckoutStore({
            order: getSubmittedOrderState(),
        });

        placeOrderService = new PlaceOrderService(store, orderActionCreator, paymentActionCreator);
    });

    describe('#submitPayment()', () => {
        it('dispatches submit payment action', async () => {
            jest.spyOn(store, 'dispatch');

            await placeOrderService.submitPayment(getPayment());

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(getPayment());
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

            await placeOrderService.submitPayment(getPayment(), options);

            expect(orderActionCreator.loadOrder).toHaveBeenCalledWith(getCompleteOrder().orderId, options);
        });

        it('returns checkout state', async () => {
            const output = await placeOrderService.submitPayment(getPayment());

            expect(output).toEqual(store.getState());
        });
    });

    describe('#initializeOffsitePayment()', () => {
        it('dispatches finalize payment action', async () => {
            jest.spyOn(store, 'dispatch');

            await placeOrderService.initializeOffsitePayment(getPayment(), false);

            expect(paymentActionCreator.initializeOffsitePayment).toHaveBeenCalledWith(getPayment());
            expect(store.dispatch).toHaveBeenCalledWith(createAction('INITALIZE_OFFSITE_PAYMENT'));
        });

        it('returns checkout state', async () => {
            const output = await placeOrderService.initializeOffsitePayment(getPayment(), false);

            expect(output).toEqual(store.getState());
        });
    });
});
