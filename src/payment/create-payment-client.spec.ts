import { createClient } from '@bigcommerce/bigpay-client';
import { DataStore } from '@bigcommerce/data-store';

import { createCheckoutStore, CheckoutStore } from '../checkout';
import { getAppConfig } from '../config/configs.mock';

import createPaymentClient from './create-payment-client';

describe('createPaymentClient()', () => {
    let client: any;
    let store: CheckoutStore;
    let subscribeCallback: (state: any) => {};

    beforeEach(() => {
        store = createCheckoutStore();

        jest.spyOn(store, 'subscribe')
            .mockImplementation(callback => {
                subscribeCallback = callback;
            });

        client = createPaymentClient(store);

        jest.spyOn(client, 'setHost')
            .mockImplementation(() => {});
    });

    it('sets the host when the store callback is invoked', () => {
        const state = {
            checkout: {
                getConfig: () => getAppConfig().storeConfig,
            },
        };

        subscribeCallback(state);
        expect(client.setHost).toHaveBeenCalledWith('https://bigpay.integration.zone');
    });

    it('returns an instance of bigpay client', () => {
        expect(client).toMatchObject(createClient());
    });

    it('subscribes to changes', () => {
        expect(store.subscribe).toHaveBeenCalledTimes(1);
    });
});
