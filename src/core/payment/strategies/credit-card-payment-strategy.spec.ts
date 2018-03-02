import { omit } from 'lodash';
import { createClient as createPaymentClient } from 'bigpay-client';
import { CheckoutStore } from '../../checkout';
import { getOrderRequestBody } from '../../order/orders.mock';
import { PlaceOrderService } from '../../order';
import createCheckoutClient from '../../create-checkout-client';
import createCheckoutStore from '../../create-checkout-store';
import createPlaceOrderService from '../../create-place-order-service';
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
