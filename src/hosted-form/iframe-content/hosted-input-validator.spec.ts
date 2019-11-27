import HostedInputValidator from './hosted-input-validator';
import HostedInputValues from './hosted-input-values';

describe('HostedInputValidator', () => {
    let validData: HostedInputValues;
    let validator: HostedInputValidator;

    beforeEach(() => {
        validData = {
            cardCode: '123',
            cardExpiry: '10 / 25',
            cardName: 'BC',
            cardNumber: '4111 1111 1111 1111',
        };

        validator = new HostedInputValidator();
    });

    it('does not throw error if data is valid', async () => {
        expect(await validator.validate(validData))
            .toEqual([]);
    });

    it('returns error if card number is missing', async () => {
        expect(await validator.validate({ ...validData, cardNumber: '' }))
            .toEqual([
                { fieldType: 'cardNumber', message: 'Credit card number is required' },
                { fieldType: 'cardNumber', message: 'Credit card number must be valid' },
            ]);
    });

    it('returns error if card number is invalid', async () => {
        expect(await validator.validate({ ...validData, cardNumber: '9999 9999 9999 9999' }))
            .toEqual([
                { fieldType: 'cardNumber', message: 'Credit card number must be valid' },
            ]);
    });

    it('returns error if card name is missing', async () => {
        expect(await validator.validate({ ...validData, cardName: '' }))
            .toEqual([
                { fieldType: 'cardName', message: 'Full name is required' },
            ]);
    });

    it('returns error if expiry date is missing', async () => {
        expect(await validator.validate({ ...validData, cardExpiry: '' }))
            .toEqual([
                { fieldType: 'cardExpiry', message: 'Expiration date is required' },
                { fieldType: 'cardExpiry', message: 'Expiration date must be a valid future date in MM / YY format' },
            ]);
    });

    it('returns error if expiry date is invalid', async () => {
        expect(await validator.validate({ ...validData, cardExpiry: '2030 / 12' }))
            .toEqual([
                { fieldType: 'cardExpiry', message: 'Expiration date must be a valid future date in MM / YY format' },
            ]);
    });

    it('returns error if expiry date is in past', async () => {
        expect(await validator.validate({ ...validData, cardExpiry: '12 / 10' }))
            .toEqual([
                { fieldType: 'cardExpiry', message: 'Expiration date must be a valid future date in MM / YY format' },
            ]);
    });

    it('returns error if card code is missing when required', async () => {
        expect(await validator.validate({ ...validData, cardCode: '' }, { isCardCodeRequired: true }))
            .toEqual([
                { fieldType: 'cardCode', message: 'CVV is required' },
                { fieldType: 'cardCode', message: 'CVV must be valid' },
            ]);
    });

    it('returns error if card code is invalid when required', async () => {
        expect(await validator.validate({ ...validData, cardCode: '99999' }, { isCardCodeRequired: true }))
            .toEqual([
                { fieldType: 'cardCode', message: 'CVV must be valid' },
            ]);
    });

    it('returns error if card code is invalid for given card number', async () => {
        // Card code for American Express should have 4 digts
        expect(await validator.validate({ ...validData, cardCode: '123', cardNumber: '378282246310005' }, { isCardCodeRequired: true }))
            .toEqual([
                { fieldType: 'cardCode', message: 'CVV must be valid' },
            ]);
    });

    it('does not return error if card code is not required', async () => {
        expect(await validator.validate({ ...validData, cardCode: '' }))
            .toEqual([]);
    });
});
