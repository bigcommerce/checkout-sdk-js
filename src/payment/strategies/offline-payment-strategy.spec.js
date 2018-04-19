import { createAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs';
import { createCheckoutClient, createCheckoutStore } from '../../checkout';
import { OrderActionCreator } from '../../order';
import { getOrderRequestBody } from '../../order/internal-orders.mock';
import { SUBMIT_ORDER_REQUESTED } from '../../order/order-action-types';
import OfflinePaymentStrategy from './offline-payment-strategy';

describe('OfflinePaymentStrategy', () => {
    let orderActionCreator;
    let store;
    let strategy;
    let submitOrderAction;

    beforeEach(() => {
        store = createCheckoutStore();
        orderActionCreator = new OrderActionCreator(createCheckoutClient());
        submitOrderAction = Observable.of(createAction(SUBMIT_ORDER_REQUESTED));

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(store, 'dispatch');

        strategy = new OfflinePaymentStrategy(store, orderActionCreator);
    });

    it('submits order without payment data', async () => {
        await strategy.execute(getOrderRequestBody());

        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith({
            ...getOrderRequestBody(),
            payment: {
                name: 'authorizenet',
            },
        }, true, undefined);

        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
    });

    it('returns checkout state', async () => {
        const output = await strategy.execute(getOrderRequestBody());

        expect(output).toEqual(store.getState());
    });
});
