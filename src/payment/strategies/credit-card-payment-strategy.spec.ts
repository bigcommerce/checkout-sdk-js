import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { omit } from 'lodash';
import { Observable } from 'rxjs';

import { createCheckoutClient, createCheckoutStore, CheckoutStore } from '../../checkout';
import { createPlaceOrderService, OrderActionCreator, PlaceOrderService } from '../../order';
import { getOrderRequestBody } from '../../order/internal-orders.mock';
import { SUBMIT_ORDER_REQUESTED } from '../../order/order-action-types';

import CreditCardPaymentStrategy from './credit-card-payment-strategy';

describe('CreditCardPaymentStrategy', () => {
    let orderActionCreator: OrderActionCreator;
    let placeOrderService: PlaceOrderService;
    let store: CheckoutStore;
    let strategy: CreditCardPaymentStrategy;
    let submitOrderAction: Observable<Action>;

    beforeEach(() => {
        store = createCheckoutStore();

        placeOrderService = createPlaceOrderService(
            store,
            createCheckoutClient(),
            createPaymentClient()
        );

        submitOrderAction = Observable.of(createAction(SUBMIT_ORDER_REQUESTED));

        orderActionCreator = new OrderActionCreator(createCheckoutClient());

        strategy = new CreditCardPaymentStrategy(store, placeOrderService, orderActionCreator);

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(placeOrderService, 'submitPayment')
            .mockReturnValue(Promise.resolve(store.getState()));
    });

    it('submits order without payment data', async () => {
        const payload = getOrderRequestBody();

        await strategy.execute(payload);

        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(payload, 'payment'), true, undefined);
        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
    });

    it('submits payment separately', async () => {
        const payload = getOrderRequestBody();

        await strategy.execute(payload);

        expect(placeOrderService.submitPayment).toHaveBeenCalledWith(payload.payment, payload.useStoreCredit, undefined);
    });

    it('returns checkout state', async () => {
        const output = await strategy.execute(getOrderRequestBody());

        expect(output).toEqual(store.getState());
    });
});
