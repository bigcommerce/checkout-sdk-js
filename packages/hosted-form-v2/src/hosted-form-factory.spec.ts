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
                [HostedFieldType.CardCode]: { containerId: 'card-code', orderId: 1 },
                [HostedFieldType.CardExpiry]: { containerId: 'card-expiry', orderId: 1 },
                [HostedFieldType.CardName]: { containerId: 'card-name', orderId: 1 },
                [HostedFieldType.CardNumber]: { containerId: 'card-number', orderId: 1 },
            },
        });

        expect(result).toBeInstanceOf(HostedForm);
    });
});
