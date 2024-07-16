import HostedFieldType from './hosted-field-type';
import HostedForm from './hosted-form';
import HostedFormFactory from './hosted-form-factory';

describe('HostedFormFactory', () => {
    let factory: HostedFormFactory;

    beforeEach(() => {
        factory = new HostedFormFactory();
    });

    it('creates hosted form', () => {
        const result = factory.create('https://store.foobar.com', {
            fields: {
                [HostedFieldType.CardCode]: { containerId: 'card-code' },
                [HostedFieldType.CardExpiry]: { containerId: 'card-expiry' },
                [HostedFieldType.CardName]: { containerId: 'card-name' },
                [HostedFieldType.CardNumber]: { containerId: 'card-number' },
            },
            orderId: 1,
        });

        expect(result).toBeInstanceOf(HostedForm);
    });
});
