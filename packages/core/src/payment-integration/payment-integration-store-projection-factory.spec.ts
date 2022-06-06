import { createCheckoutStore,
    InternalCheckoutSelectors } from '@bigcommerce/checkout-sdk/core';
import { ReadableDataStore } from '@bigcommerce/data-store';

import createPaymentIntegrationSelectors from './create-payment-integration-selectors';
import PaymentIntegrationSelectors from '../../../payment-integration-core/src/lib/payment-integration-selectors';
import PaymentIntegrationStoreProjectionFactory from './payment-integration-store-projection-factory';

describe('PaymentIntegrationStoreProjectionFactory', () => {
    let subject: PaymentIntegrationStoreProjectionFactory;
    let store: ReadableDataStore<InternalCheckoutSelectors>;
    let selectors: PaymentIntegrationSelectors;
    let transformer: (selectors: InternalCheckoutSelectors) => PaymentIntegrationSelectors;

    beforeEach(() => {
        store = createCheckoutStore();
        selectors = createPaymentIntegrationSelectors(store.getState());
        transformer = jest.fn(() => selectors);
        subject = new PaymentIntegrationStoreProjectionFactory(transformer);
    });

    describe('#create', () => {
        it('returns data store projection that returns payment integration selectors', () => {
            const output = subject.create(store);

            expect(output.getState())
                .toEqual(selectors);
        });

        it('returns data store projection that notifies subscribers with payment integration selectors', () => {
            const store = createCheckoutStore();
            const output = subject.create(store);
            const subscriber = jest.fn();

            output.subscribe(subscriber);
            output.notifyState();

            expect(subscriber)
                .toHaveBeenCalledWith(selectors);
        });
    });
});
