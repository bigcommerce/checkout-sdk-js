import HostedFieldType from '../hosted-field-type';

import HostedCardExpiryInput from './hosted-card-expiry-input';
import HostedCardNumberInput from './hosted-card-number-input';
import HostedInput from './hosted-input';
import HostedInputFactory from './hosted-input-factory';

describe('HostedInputFactory', () => {
    let factory: HostedInputFactory;

    beforeEach(() => {
        factory = new HostedInputFactory('https://store.foobar.com');
    });

    it('creates card number field', () => {
        expect(factory.create('input-container', HostedFieldType.CardNumber))
            .toBeInstanceOf(HostedCardNumberInput);
    });

    it('creates card expiry field', () => {
        expect(factory.create('input-container', HostedFieldType.CardExpiry))
            .toBeInstanceOf(HostedCardExpiryInput);
    });

    it('creates regular input field for other field types', () => {
        expect(factory.create('input-container', HostedFieldType.CardCode))
            .toBeInstanceOf(HostedInput);

        expect(factory.create('input-container', HostedFieldType.CardName))
            .toBeInstanceOf(HostedInput);
    });
});
