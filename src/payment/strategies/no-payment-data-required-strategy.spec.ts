import { createAction, Action } from '@bigcommerce/data-store';
import { omit } from 'lodash';
import { Observable } from 'rxjs';

import { createCheckoutClient, createCheckoutStore, CheckoutStore } from '../../checkout';
import { OrderActionCreator } from '../../order';
import { getOrderRequestBody } from '../../order/internal-orders.mock';
import { SUBMIT_ORDER_REQUESTED } from '../../order/order-action-types';

import { NoPaymentDataRequiredPaymentStrategy } from '.';

describe('NoPaymentDataRequiredPaymentStrategy', () => {
    let store: CheckoutStore;
    let orderActionCreator: OrderActionCreator;
    let submitOrderAction: Observable<Action>;
    let noPaymentDataRequiredPaymentStrategy: NoPaymentDataRequiredPaymentStrategy;

    beforeEach(() => {
        store = createCheckoutStore();
        orderActionCreator = new OrderActionCreator(createCheckoutClient());
        submitOrderAction = Observable.of(createAction(SUBMIT_ORDER_REQUESTED));

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(store, 'dispatch');

        noPaymentDataRequiredPaymentStrategy = new NoPaymentDataRequiredPaymentStrategy(store, orderActionCreator);
    });

    describe('#execute()', () => {
        it('calls submit order with the right data', async () => {
            await noPaymentDataRequiredPaymentStrategy.execute(getOrderRequestBody(), undefined);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(getOrderRequestBody(), 'payment'), true, undefined);
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('passes the options to submitOrder', async () => {
            const options = { myOptions: 'option1', methodId: 'testgateway' };
            await noPaymentDataRequiredPaymentStrategy.execute(getOrderRequestBody(), options);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(expect.any(Object), true, options);
        });
    });
});
