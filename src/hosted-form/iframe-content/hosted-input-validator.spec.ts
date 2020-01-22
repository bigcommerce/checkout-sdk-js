import { omit } from 'lodash';

import { getCardInstrument } from '../../payment/instrument/instrument.mock';
import HostedFieldType from '../hosted-field-type';

import HostedInputValidateResults from './hosted-input-validate-results';
import HostedInputValidator from './hosted-input-validator';
import HostedInputValues from './hosted-input-values';

describe('HostedInputValidator', () => {
    let validData: HostedInputValues;
    let validResults: HostedInputValidateResults;
    let validator: HostedInputValidator;

    beforeEach(() => {
        validData = {
            cardCode: '123',
            cardExpiry: '10 / 25',
            cardName: 'BC',
            cardNumber: '4111 1111 1111 1111',
        };

        validResults = {
            isValid: true,
            errors: {
                cardCode: [],
                cardExpiry: [],
                cardName: [],
                cardNumber: [],
            },
        };

        validator = new HostedInputValidator(getCardInstrument());
    });

    it('does not throw error if data is valid', async () => {
        expect(await validator.validate(validData))
            .toEqual(validResults);
    });

    it('returns error if card number is missing', async () => {
        expect(await validator.validate({ ...validData, cardNumber: '' }))
            .toEqual({
                isValid: false,
                errors: {
                    ...validResults.errors,
                    cardNumber: [
                        { fieldType: 'cardNumber', type: 'required', message: 'Credit card number is required' },
                        { fieldType: 'cardNumber', type: 'invalid_card_number', message: 'Credit card number must be valid' },
                    ],
                },
            });
    });

    it('returns error if card number is invalid', async () => {
        expect(await validator.validate({ ...validData, cardNumber: '9999 9999 9999 9999' }))
            .toEqual({
                isValid: false,
                errors: {
                    ...validResults.errors,
                    cardNumber: [
                        { fieldType: 'cardNumber', type: 'invalid_card_number', message: 'Credit card number must be valid' },
                    ],
                },
            });
    });

    it('does not return error if card number is not required', async () => {
        expect(await validator.validate(omit(validData, HostedFieldType.CardNumber)))
            .toEqual({
                ...validResults,
                errors: omit(validResults.errors, HostedFieldType.CardNumber),
            });
    });

    it('returns error if card name is missing', async () => {
        expect(await validator.validate({ ...validData, cardName: '' }))
            .toEqual({
                isValid: false,
                errors: {
                    ...validResults.errors,
                    cardName: [
                        { fieldType: 'cardName', type: 'required', message: 'Full name is required' },
                    ],
                },
            });
    });

    it('does not return error if card name is not required', async () => {
        expect(await validator.validate(omit(validData, HostedFieldType.CardName)))
            .toEqual({
                ...validResults,
                errors: omit(validResults.errors, HostedFieldType.CardName),
            });
    });

    it('returns error if expiry date is missing', async () => {
        expect(await validator.validate({ ...validData, cardExpiry: '' }))
            .toEqual({
                isValid: false,
                errors: {
                    ...validResults.errors,
                    cardExpiry: [
                        { fieldType: 'cardExpiry', type: 'required', message: 'Expiration date is required' },
                        { fieldType: 'cardExpiry', type: 'invalid_card_expiry', message: 'Expiration date must be a valid future date in MM / YY format' },
                    ],
                },
            });
    });

    it('returns error if expiry date is invalid', async () => {
        expect(await validator.validate({ ...validData, cardExpiry: '2030 / 12' }))
            .toEqual({
                isValid: false,
                errors: {
                    ...validResults.errors,
                    cardExpiry: [
                        { fieldType: 'cardExpiry', type: 'invalid_card_expiry', message: 'Expiration date must be a valid future date in MM / YY format' },
                    ],
                },
            });
    });

    it('returns error if expiry date is in past', async () => {
        expect(await validator.validate({ ...validData, cardExpiry: '2030 / 12' }))
            .toEqual({
                isValid: false,
                errors: {
                    ...validResults.errors,
                    cardExpiry: [
                        { fieldType: 'cardExpiry', type: 'invalid_card_expiry', message: 'Expiration date must be a valid future date in MM / YY format' },
                    ],
                },
            });
    });

    it('does not return error if expiry date is not required', async () => {
        expect(await validator.validate(omit(validData, HostedFieldType.CardExpiry)))
            .toEqual({
                ...validResults,
                errors: omit(validResults.errors, HostedFieldType.CardExpiry),
            });
    });

    it('returns error if card code is missing when required', async () => {
        expect(await validator.validate({ ...validData, cardCode: '' }))
            .toEqual({
                isValid: false,
                errors: {
                    ...validResults.errors,
                    cardCode: [
                        { fieldType: 'cardCode', type: 'required', message: 'CVV is required' },
                        { fieldType: 'cardCode', type: 'invalid_card_code', message: 'CVV must be valid' },
                    ],
                },
            });
    });

    it('returns error if card code is invalid when required', async () => {
        expect(await validator.validate({ ...validData, cardCode: '99999' }))
            .toEqual({
                isValid: false,
                errors: {
                    ...validResults.errors,
                    cardCode: [
                        { fieldType: 'cardCode', type: 'invalid_card_code', message: 'CVV must be valid' },
                    ],
                },
            });
    });

    it('returns error if card code is invalid for given card number', async () => {
        // Card code for American Express should have 4 digts
        expect(await validator.validate({ ...validData, cardCode: '123', cardNumber: '378282246310005' }))
            .toEqual({
                isValid: false,
                errors: {
                    ...validResults.errors,
                    cardCode: [
                        { fieldType: 'cardCode', type: 'invalid_card_code', message: 'CVV must be valid' },
                    ],
                },
            });
    });

    it('does not return error if card code is not required', async () => {
        expect(await validator.validate(omit(validData, HostedFieldType.CardCode)))
            .toEqual({
                ...validResults,
                errors: omit(validResults.errors, HostedFieldType.CardCode),
            });
    });

    it('does not return invalid card code error if card code is provided before card number', async () => {
        expect(await validator.validate({ ...validData, cardCode: '123', cardNumber: '' }))
            .toEqual({
                isValid: false,
                errors: expect.objectContaining({
                    cardCode: [],
                }),
            });
    });

    describe('when validating against stored card verification fields', () => {
        it('returns error if card number used for verification is missing', async () => {
            expect(await validator.validate({ cardNumberVerification: '' }))
                .toEqual({
                    isValid: false,
                    errors: {
                        cardNumberVerification: expect.arrayContaining([
                            { fieldType: 'cardNumberVerification', type: 'required', message: 'Credit card number is required' },
                        ]),
                    },
                });
        });

        it('returns error if card number used for verification is invalid', async () => {
            expect(await validator.validate({ cardNumberVerification: '9999 9999 9999 9999' }))
                .toEqual({
                    isValid: false,
                    errors: {
                        cardNumberVerification: expect.arrayContaining([
                            { fieldType: 'cardNumberVerification', type: 'invalid_card_number', message: 'Credit card number must be valid' },
                        ]),
                    },
                });
        });

        it('returns error if card number used for verification is does not match with instrument', async () => {
            expect(await validator.validate({ cardNumberVerification: '5555 5555 5555 4444' }))
                .toEqual({
                    isValid: false,
                    errors: {
                        cardNumberVerification: expect.arrayContaining([
                            { fieldType: 'cardNumberVerification', type: 'mismatched_card_number', message: 'The card number entered does not match the card stored in your account' },
                        ]),
                    },
                });
        });

        it('does not return error if card number used for verification is valid', async () => {
            expect(await validator.validate({ cardNumberVerification: '4111 1111 1111 1111' }))
                .toEqual({
                    isValid: true,
                    errors: {
                        cardNumberVerification: [],
                    },
                });
        });

        it('returns error if card code used for verification is missing', async () => {
            expect(await validator.validate({ cardCodeVerification: '' }))
                .toEqual({
                    isValid: false,
                    errors: {
                        cardCodeVerification: expect.arrayContaining([
                            { fieldType: 'cardCodeVerification', type: 'required', message: 'CVV is required' },
                        ]),
                    },
                });
        });

        it('returns error if card code used for verification is invalid', async () => {
            expect(await validator.validate({ cardCodeVerification: '1234' }))
                .toEqual({
                    isValid: false,
                    errors: {
                        cardCodeVerification: expect.arrayContaining([
                            { fieldType: 'cardCodeVerification', type: 'invalid_card_code', message: 'CVV must be valid' },
                        ]),
                    },
                });
        });

        it('does not return error if card code used for verification is valid', async () => {
            expect(await validator.validate({ cardCodeVerification: '123' }))
                .toEqual({
                    isValid: true,
                    errors: {
                        cardCodeVerification: [],
                    },
                });
        });
    });
});
