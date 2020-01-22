import { createCheckoutStore, ReadableCheckoutStore } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';

import HostedFormOrderDataTransformer from './hosted-form-order-data-transformer';

describe('HostedFormOrderDataTransformer', () => {
    let store: ReadableCheckoutStore;
    let transformer: HostedFormOrderDataTransformer;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        transformer = new HostedFormOrderDataTransformer(store);

        jest.spyOn(store.getState().payment, 'getPaymentToken')
            .mockReturnValue('JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

        jest.spyOn(store.getState().instruments, 'getInstrumentsMeta')
            .mockReturnValue({
                vaultAccessToken: 'VAT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkZvbyBCYXIiLCJpYXQiOjE1MTYyMzkwMjJ9.ofV_rETulkW5agRmGt4wRs8QsU8WTdqDA3xjIaK4Yn8',
            });
    });

    it('transforms payload', () => {
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

    it('includes vault access token if paying with stored instrument', () => {
        const result = transformer.transform({
            methodId: 'authorizenet',
            paymentData: { instrumentId: '123' },
        });

        expect(result.authToken)
            .toEqual('JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c, VAT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkZvbyBCYXIiLCJpYXQiOjE1MTYyMzkwMjJ9.ofV_rETulkW5agRmGt4wRs8QsU8WTdqDA3xjIaK4Yn8');
    });

    it('does not include vault access token if not paying with stored instrument', () => {
        const result = transformer.transform({
            methodId: 'authorizenet',
            paymentData: {
                ccExpiry: {
                    month: '12',
                    year: '2020',
                },
                ccName: 'Foo Bar',
                ccNumber: '4111 1111 1111 1111',
            },
        });

        expect(result.authToken)
            .toEqual('JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
    });
});
