import { createAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs';
import { createCheckoutClient, createCheckoutStore } from '../../checkout';
import { getOrderRequestBody } from '../../order/internal-orders.mock';
import { OrderActionCreator } from '../../order';
import { SUBMIT_ORDER_REQUESTED } from '../../order/order-action-types';
import LegacyPaymentStrategy from './legacy-payment-strategy';

describe('LegacyPaymentStrategy', () => {
    let orderActionCreator;
    let placeOrderService;
    let store;
    let strategy;
    let submitOrderAction;

    beforeEach(() => {
        store = createCheckoutStore();
        orderActionCreator = new OrderActionCreator(createCheckoutClient());
        placeOrderService = {
            submitPayment: jest.fn(() => Promise.resolve(store.getState())),
        };
        submitOrderAction = Observable.of(createAction(SUBMIT_ORDER_REQUESTED));

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(store, 'dispatch');

        strategy = new LegacyPaymentStrategy(store, placeOrderService, orderActionCreator);
    });

    it('submits order with payment data', async () => {
        await strategy.execute(getOrderRequestBody());

        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(getOrderRequestBody(), true, undefined);
        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
    });

    it('does not submit payment data separately', async () => {
        await strategy.execute(getOrderRequestBody());

        expect(placeOrderService.submitPayment).not.toHaveBeenCalled();
    });

    it('returns checkout state', async () => {
        const output = await strategy.execute(getOrderRequestBody());

        expect(output).toEqual(store.getState());
    });
});
