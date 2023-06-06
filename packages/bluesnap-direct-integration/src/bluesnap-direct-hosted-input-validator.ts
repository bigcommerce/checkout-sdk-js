import {
    HostedInputValidateErrorData,
    HostedInputValidateErrorDataMap,
    HostedInputValidateResults,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BlueSnapHostedFieldType, CREDIT_CARD_ERRORS } from './bluesnap-direct-constants';
import {
    BlueSnapDirectInputValidationErrorDescription as ErrorDescription,
    BlueSnapDirectHostedFieldTagId as HostedFieldTagId,
} from './types';

export default class BlueSnapHostedInputValidator {
    private _errors: HostedInputValidateErrorDataMap = {};

    initialize(): void {
        this._errors = {
            cardNumber: [CREDIT_CARD_ERRORS.empty.cardNumber],
            cardExpiry: [CREDIT_CARD_ERRORS.empty.cardExpiry],
            cardCode: [CREDIT_CARD_ERRORS.empty.cardCode],
            cardName: [CREDIT_CARD_ERRORS.empty.cardName],
        };
    }

    initializeValidationFields(): void {
        this._errors = {
            cardNumber: [CREDIT_CARD_ERRORS.empty.cardNumber],
            cardCode: [CREDIT_CARD_ERRORS.empty.cardCode],
        };
    }

    initializeValidationCVVFields(): void {
        this._errors = {
            cardCode: [CREDIT_CARD_ERRORS.empty.cardCode],
        };
    }

    validate(error?: {
        tagId: HostedFieldTagId;
        errorDescription?: ErrorDescription;
    }): HostedInputValidateResults {
        if (error) {
            this._updateErrors(error.tagId, error.errorDescription);
        }

        return {
            isValid: Object.values(this._errors).every(
                (errorData: HostedInputValidateErrorData[]) => errorData.length === 0,
            ),
            errors: this._errors,
        };
    }

    private _updateErrors(tagId: HostedFieldTagId, errorDescription?: ErrorDescription): void {
        const fieldType = BlueSnapHostedFieldType[tagId];

        this._errors[fieldType] = errorDescription
            ? [CREDIT_CARD_ERRORS[errorDescription][fieldType]]
            : [];
    }
}
