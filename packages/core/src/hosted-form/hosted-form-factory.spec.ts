import { FormPoster } from '@bigcommerce/form-poster';

import { createCheckoutStore, ReadableCheckoutStore } from '../checkout';
import { StepHandler } from '../payment/strategies/ppsdk/step-handler';
import { ContinueHandler } from '../payment/strategies/ppsdk/step-handler/continue-handler';

import HostedFieldType from './hosted-field-type';
import HostedForm from './hosted-form';
import HostedFormFactory from './hosted-form-factory';

describe('HostedFormFactory', () => {
    let factory: HostedFormFactory;
    let store: ReadableCheckoutStore;

    beforeEach(() => {
        store = createCheckoutStore();
        factory = new HostedFormFactory(store, new StepHandler(new ContinueHandler(new FormPoster())));
    });

    it('creates hosted form', () => {
        const result = factory.create('https://store.foobar.com', {
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
