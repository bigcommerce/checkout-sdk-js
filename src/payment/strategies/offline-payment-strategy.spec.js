import { createAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs';
import { createCheckoutClient, createCheckoutStore } from '../../checkout';
import { OrderActionCreator, OrderActionType } from '../../order';
import { getOrderRequestBody } from '../../order/internal-orders.mock';
import OfflinePaymentStrategy from './offline-payment-strategy';

describe('OfflinePaymentStrategy', () => {
    let orderActionCreator;
    let store;
    let strategy;
    let submitOrderAction;

    beforeEach(() => {
        store = createCheckoutStore();
        orderActionCreator = new OrderActionCreator(createCheckoutClient());
        submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderRequested));

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
        }, undefined);

        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
    });

    it('returns checkout state', async () => {
        const output = await strategy.execute(getOrderRequestBody());

        expect(output).toEqual(store.getState());
    });
});
