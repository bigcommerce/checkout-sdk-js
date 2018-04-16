import { createAction } from '@bigcommerce/data-store';
import { createCheckoutStore } from '../checkout';
import { getPayment } from '../payment/payments.mock';
import PlaceOrderService from './place-order-service';

describe('PlaceOrderService', () => {
    let paymentActionCreator;
    let placeOrderService;
    let store;

    beforeEach(() => {
        paymentActionCreator = {
            submitPayment: jest.fn(() => createAction('SUBMIT_PAYMENT')),
        };

        store = createCheckoutStore();

        placeOrderService = new PlaceOrderService(store, paymentActionCreator);
    });

    describe('#submitPayment()', () => {
        it('dispatches submit payment action', async () => {
            jest.spyOn(store, 'dispatch');

            await placeOrderService.submitPayment(getPayment());

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(getPayment());
            expect(store.dispatch).toHaveBeenCalledWith(createAction('SUBMIT_PAYMENT'));
        });

        it('returns checkout state', async () => {
            const output = await placeOrderService.submitPayment(getPayment());

            expect(output).toEqual(store.getState());
        });
    });
});
