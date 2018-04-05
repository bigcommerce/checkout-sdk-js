import { omit } from 'lodash';

import { createCheckoutStore } from '../../checkout';
import { getOrderRequestBody } from '../../order/internal-orders.mock';

import { NoPaymentDataRequiredPaymentStrategy } from '.';

describe('NoPaymentDataRequiredPaymentStrategy', () => {
    let store;
    let placeOrderService;
    let noPaymentDataRequiredPaymentStrategy;
    beforeEach(() => {
        store = createCheckoutStore();
        placeOrderService = {
            submitOrder: jest.fn(() => Promise.resolve(store.getState())),
            submitPayment: jest.fn(() => Promise.resolve(store.getState())),
        };

        noPaymentDataRequiredPaymentStrategy = new NoPaymentDataRequiredPaymentStrategy(store, placeOrderService);
    });

    describe('#execute()', () => {
        it('calls submit order with the right data', async () => {
            await noPaymentDataRequiredPaymentStrategy.execute(getOrderRequestBody(), undefined);

            expect(placeOrderService.submitOrder).toHaveBeenCalledWith(omit(getOrderRequestBody(), 'payment'), true, undefined);
        });

        it('does not call submit payment', async () => {
            await noPaymentDataRequiredPaymentStrategy.execute(getOrderRequestBody(), undefined);

            expect(placeOrderService.submitPayment).not.toHaveBeenCalled();
        });

        it('passes the options to submitOrder', async () => {
            const options = { myOptions: 'option1' };
            await noPaymentDataRequiredPaymentStrategy.execute(getOrderRequestBody(), options);

            expect(placeOrderService.submitOrder).toHaveBeenCalledWith(expect.any(Object), true, options);
        });
    });
});
