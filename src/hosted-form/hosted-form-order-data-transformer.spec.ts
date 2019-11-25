import { createCheckoutStore, ReadableCheckoutStore } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';

import HostedFormOrderDataTransformer from './hosted-form-order-data-transformer';

describe('HostedFormOrderDataTransformer', () => {
    let store: ReadableCheckoutStore;
    let transformer: HostedFormOrderDataTransformer;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        transformer = new HostedFormOrderDataTransformer(store);
    });

    it('transforms payload', () => {
        jest.spyOn(store.getState().payment, 'getPaymentToken')
            .mockReturnValue('JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

        const result = transformer.transform({
            methodId: 'authorizenet',
            paymentData: { shouldSaveInstrument: true },
        });

        expect(Object.keys(result))
            .toEqual(expect.arrayContaining([
                'authToken',
                'checkout',
                'config',
                'order',
                'orderMeta',
                'payment',
                'paymentMethod',
                'paymentMethodMeta',
            ]));
    });
});
