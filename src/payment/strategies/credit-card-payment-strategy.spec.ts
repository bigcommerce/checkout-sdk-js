import { omit } from 'lodash';
import { createClient as createPaymentClient } from 'bigpay-client';
import { createCheckoutClient, createCheckoutStore, CheckoutStore } from '../../checkout';
import { createPlaceOrderService, PlaceOrderService } from '../../order';
import { getOrderRequestBody } from '../../order/internal-orders.mock';
import CreditCardPaymentStrategy from './credit-card-payment-strategy';

describe('CreditCardPaymentStrategy', () => {
    let placeOrderService: PlaceOrderService;
    let store: CheckoutStore;
    let strategy: CreditCardPaymentStrategy;

    beforeEach(() => {
        store = createCheckoutStore();

        placeOrderService = createPlaceOrderService(
            store,
            createCheckoutClient(),
            createPaymentClient()
        );

        strategy = new CreditCardPaymentStrategy(store, placeOrderService);

        jest.spyOn(placeOrderService, 'submitOrder')
            .mockReturnValue(Promise.resolve(store.getState()));

        jest.spyOn(placeOrderService, 'submitPayment')
            .mockReturnValue(Promise.resolve(store.getState()));
    });

    it('submits order without payment data', async () => {
        const payload = getOrderRequestBody();

        await strategy.execute(payload);

        expect(placeOrderService.submitOrder).toHaveBeenCalledWith(omit(payload, 'payment'), undefined);
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
