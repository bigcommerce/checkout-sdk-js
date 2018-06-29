import { createClient } from '@bigcommerce/bigpay-client';

import { createCheckoutStore, CheckoutStore } from '../checkout';
import { getConfigState } from '../config/configs.mock';

import createPaymentClient from './create-payment-client';

describe('createPaymentClient()', () => {
    let client: any;
    let store: CheckoutStore;

    beforeEach(() => {
        store = createCheckoutStore({
            config: getConfigState(),
        });

        jest.spyOn(store, 'subscribe');

        client = createPaymentClient(store);

        jest.spyOn(client, 'setHost');
    });

    it('sets the host when the store callback is invoked', () => {
        store.notifyState();

        expect(client.setHost).toHaveBeenCalledWith('https://bigpay.integration.zone');
    });

    it('returns an instance of bigpay client', () => {
        expect(client).toMatchObject(createClient({ host: 'https://bigpay.integration.zone' }));
    });

    it('subscribes to changes', () => {
        expect(store.subscribe).toHaveBeenCalledTimes(1);
    });
});
