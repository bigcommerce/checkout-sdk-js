import { createCheckoutStore, ReadableCheckoutStore } from '../checkout';

import HostedFieldType from './hosted-field-type';
import HostedForm from './hosted-form';
import HostedFormFactory from './hosted-form-factory';

describe('HostedFormFactory', () => {
    let factory: HostedFormFactory;
    let store: ReadableCheckoutStore;

    beforeEach(() => {
        store = createCheckoutStore();
        factory = new HostedFormFactory(store);
    });

    it('creates hosted form', () => {
        const result = factory.create('https://store.foobar.com', 'dc030783-6129-4ee3-8e06-6f4270df1527', {
            fields: {
                [HostedFieldType.CardCode]: { containerId: 'card-code' },
                [HostedFieldType.CardExpiry]: { containerId: 'card-expiry' },
                [HostedFieldType.CardName]: { containerId: 'card-name' },
                [HostedFieldType.CardNumber]: { containerId: 'card-number' },
            },
        });

        expect(result)
            .toBeInstanceOf(HostedForm);
    });
});
