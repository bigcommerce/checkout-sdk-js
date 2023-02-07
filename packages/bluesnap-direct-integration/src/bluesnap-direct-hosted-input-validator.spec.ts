import { HostedInputValidateErrorDataMap } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CREDIT_CARD_ERRORS } from './bluesnap-direct-constants';
import BlueSnapHostedInputValidator from './bluesnap-direct-hosted-input-validator';
import {
    BlueSnapDirectHostedFieldTagId as HostedFieldTagId,
    BlueSnapDirectErrorDescription as SubmitErrorDescription,
} from './types';

describe('BlueSnapHostedInputValidator', () => {
    let validator: BlueSnapHostedInputValidator;

    beforeEach(() => {
        validator = new BlueSnapHostedInputValidator();
    });

    it('should return an invalid result by default', () => {
        const expectedResult = {
            isValid: false,
            errors: {
                cardNumber: [CREDIT_CARD_ERRORS.empty.cardNumber],
                cardExpiry: [CREDIT_CARD_ERRORS.empty.cardExpiry],
                cardCode: [CREDIT_CARD_ERRORS.empty.cardCode],
                cardName: [CREDIT_CARD_ERRORS.empty.cardName],
            },
        };

        expect(validator.validate()).toStrictEqual(expectedResult);
    });

    it('should return the BlueSnapHostedInputValidator instance', () => {
        const errors: HostedInputValidateErrorDataMap = {
            cardName: [
                {
                    fieldType: 'cardName',
                    message: 'Full name is required',
                    type: 'required',
                },
            ],
        };

        expect(validator.mergeErrors(errors)).toBe(validator);
    });

    it('should return a valid result', () => {
        const expectedResult = {
            isValid: true,
            errors: {
                cardNumber: [],
                cardExpiry: [],
                cardCode: [],
                cardName: [],
            },
        };

        validator.validate({ tagId: HostedFieldTagId.CardCode });
        validator.validate({ tagId: HostedFieldTagId.CardExpiry });
        validator.validate({ tagId: HostedFieldTagId.CardNumber });

        expect(validator.mergeErrors({ cardName: [] }).validate()).toStrictEqual(expectedResult);
    });

    it('should return an invalid result', () => {
        const expectedResult = {
            isValid: false,
            errors: {
                cardNumber: [CREDIT_CARD_ERRORS.invalid.cardNumber],
                cardExpiry: [CREDIT_CARD_ERRORS.empty.cardExpiry],
                cardCode: [CREDIT_CARD_ERRORS.invalid.cardCode],
                cardName: [CREDIT_CARD_ERRORS.empty.cardName],
            },
        };

        validator.validate({
            tagId: HostedFieldTagId.CardNumber,
            errorDescription: SubmitErrorDescription.INVALID,
        });
        validator.validate({
            tagId: HostedFieldTagId.CardExpiry,
            errorDescription: SubmitErrorDescription.EMPTY,
        });
        validator.validate({
            tagId: HostedFieldTagId.CardCode,
            errorDescription: SubmitErrorDescription.INVALID,
        });

        expect(
            validator
                .mergeErrors({
                    cardName: [CREDIT_CARD_ERRORS.empty.cardName],
                })
                .validate(),
        ).toStrictEqual(expectedResult);
    });
});
