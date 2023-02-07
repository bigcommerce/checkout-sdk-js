import {
    HostedInputValidateErrorData,
    HostedInputValidateErrorDataMap,
    HostedInputValidateResults,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CREDIT_CARD_ERRORS, HOSTED_FIELD_TYPES } from './bluesnap-direct-constants';
import {
    BlueSnapDirectHostedFieldTagId as HostedFieldTagId,
    BlueSnapDirectErrorDescription as SubmitErrorDescription,
} from './types';

export default class BlueSnapHostedInputValidator {
    private _errors: HostedInputValidateErrorDataMap = {
        cardNumber: [CREDIT_CARD_ERRORS.empty.cardNumber],
        cardExpiry: [CREDIT_CARD_ERRORS.empty.cardExpiry],
        cardCode: [CREDIT_CARD_ERRORS.empty.cardCode],
        cardName: [CREDIT_CARD_ERRORS.empty.cardName],
    };

    mergeErrors(errors: HostedInputValidateErrorDataMap): this {
        this._errors = { ...this._errors, ...errors };

        return this;
    }

    validate(error?: {
        tagId: HostedFieldTagId;
        errorDescription?: SubmitErrorDescription;
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

    private _updateErrors(
        tagId: HostedFieldTagId,
        errorDescription?: SubmitErrorDescription,
    ): void {
        const fieldType = HOSTED_FIELD_TYPES[tagId];

        this._errors[fieldType] = errorDescription
            ? [CREDIT_CARD_ERRORS[errorDescription][fieldType]]
            : [];
    }
}
